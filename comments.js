// migrateComments.js

"use server";

import mysql from "mysql2/promise";

// استفاده از الگوی Singleton برای ایجاد و مدیریت یک Pool دیتابیس
let dbInstance;

/**
 * تابعی برای دریافت یا ایجاد Pool اتصال به دیتابیس.
 * @returns {Promise<mysql.Pool>} - یک شیء Pool اتصال به دیتابیس.
 */
const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "test",
      waitForConnections: true,
      connectionLimit: 100,
      dateStrings: true, // برای پشتیبانی از فرمت تاریخ وردپرس
    });
    console.log("Database pool created.");
  }
  return dbInstance;
};

/**
 * تابعی برای تبدیل وضعیت کامنت از فرمت وردپرس به فرمت عددی سفارشی.
 * @param {string} wpStatus - وضعیت کامنت از جدول wp_comments.
 * @returns {number} - وضعیت عددی (0: در حال انتظار, 1: انتشار یافته, 2: زباله, 3: اسپم).
 */
const convertCommentStatus = (wpStatus) => {
  switch (wpStatus) {
    case "1":
    case "approve":
      return 1; // انتشار یافته
    case "trash":
      return 2; // زباله
    case "spam":
      return 3; // اسپم
    case "0":
    case "hold":
    default:
      return 0; // در حال انتظار
  }
};

/**
 * این تابع جدول کامنت‌های جدید را ایجاد کرده و داده‌ها را از جدول قدیمی وردپرس منتقل می‌کند،
 * و ارتباط والد-فرزندی و ارتباط با پست‌ها را حفظ می‌کند.
 */
export const migrateCommentsTable = async () => {
  const db = await getDb();
  const connection = await db.getConnection(); // گرفتن یک اتصال از Pool برای ترنزاکشن

  try {
    await connection.beginTransaction(); // شروع ترنزاکشن
    console.log("Migration transaction started.");

    // 1. حذف جدول comments در صورت وجود و ایجاد مجدد آن با ساختار جدید
    await connection.query(`DROP TABLE IF EXISTS comments`);
    await connection.query(`
      CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        parent_id INT NULL DEFAULT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        text TEXT NOT NULL,
        ip_address VARCHAR(100),
        user_agent TEXT,
        status TINYINT NOT NULL DEFAULT 0,
        created_at TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL,
        INDEX (post_id),
        INDEX (parent_id)
      )
    `);
    console.log("New 'comments' table created with 'post_id'.");

    // 2. گرفتن داده‌ها از جدول wp_comments (شامل comment_post_ID)
    const [wpComments] = await connection.query(`
      SELECT
        comment_ID,
        comment_post_ID,
        comment_parent,
        comment_author,
        comment_author_email,
        comment_content,
        comment_author_IP,
        comment_agent,
        comment_approved,
        comment_date
      FROM
        wp_comments
    `);

    if (wpComments.length === 0) {
      console.log("No comments to migrate. Committing transaction.");
      await connection.commit();
      return;
    }

    const oldIdToNewIdMap = new Map();
    const insertPromises = [];

    // 3. مرحله اول: درج کامنت‌ها و ساخت نقشه ID (با post_id)
    for (const comment of wpComments) {
      const status = convertCommentStatus(comment.comment_approved);
      insertPromises.push(
        connection
          .query(
            `INSERT INTO comments (post_id, name, email, text, ip_address, user_agent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              comment.comment_post_ID, // <-- ستون جدید اضافه شد
              comment.comment_author,
              comment.comment_author_email,
              comment.comment_content,
              comment.comment_author_IP,
              comment.comment_agent,
              status,
              comment.comment_date,
            ]
          )
          .then(([result]) => {
            oldIdToNewIdMap.set(comment.comment_ID, result.insertId);
          })
      );
    }
    await Promise.all(insertPromises);
    console.log(`Inserted ${wpComments.length} comments.`);

    // 4. مرحله دوم: به‌روزرسانی parent_id برای پاسخ‌ها با استفاده از نقشه
    const updatePromises = [];
    for (const comment of wpComments) {
      if (comment.comment_parent && Number(comment.comment_parent) > 0) {
        const newParentId = oldIdToNewIdMap.get(comment.comment_parent);
        const newChildId = oldIdToNewIdMap.get(comment.comment_ID);
        if (newParentId && newChildId) {
          updatePromises.push(
            connection.query(`UPDATE comments SET parent_id = ? WHERE id = ?`, [
              newParentId,
              newChildId,
            ])
          );
        }
      }
    }
    await Promise.all(updatePromises);
    console.log(`Updated ${updatePromises.length} parent-child relationships.`);

    await connection.commit();
    console.log("Comment migration completed successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("Migration failed, transaction rolled back:", error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// اجرای تابع اصلی
migrateCommentsTable()
  .catch((err) => {
    console.error("Script execution failed:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    if (dbInstance) {
      await dbInstance.end();
      console.log("Database pool closed.");
    }
  });
