import mysql from "mysql2/promise";

// استفاده از الگوی Singleton برای ایجاد و مدیریت یک Pool دیتابیس
let dbInstance;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "besooyeto_db",
      waitForConnections: true,
      connectionLimit: 100,
    });
    console.log("Database pool created successfully.");
  }
  return dbInstance;
};

export const updatePostSchema = async () => {
  const db = await getDb();
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // --- مدیریت ستون 'status' ---
    console.log("--- در حال مدیریت ستون 'status' ---");
    console.log("در حال به‌روزرسانی مقادیر نامنظم 'status' به 'pending'...");

    // مرحله ۱ (status): به‌روزرسانی تمامی مقادیری که نه 'publish' هستند و نه 'draft' به 'pending'
    await connection.execute(`
      UPDATE posts
      SET status = 'pending'
      WHERE status NOT IN ('publish', 'draft') OR status IS NULL;
    `);
    console.log("مقادیر نامنظم 'status' به 'pending' تبدیل شدند.");

    console.log("در حال تغییر نوع داده ستون 'status' به ENUM...");

    // مرحله ۲ (status): تغییر نوع داده ستون به ENUM
    await connection.execute(`
      ALTER TABLE posts
      MODIFY status ENUM('draft', 'publish', 'pending') NOT NULL DEFAULT 'draft';
    `);
    console.log("نوع داده ستون 'status' با موفقیت به ENUM تغییر یافت.");

    // --- مدیریت ستون 'type' ---
    console.log("\n--- در حال مدیریت ستون 'type' ---");
    console.log("در حال به‌روزرسانی مقادیر نامنظم 'type' به 'page'...");

    // مرحله ۱ (type): به‌روزرسانی تمامی مقادیری که نه 'post' هستند به 'page'
    await connection.execute(`
      UPDATE posts
      SET type = 'page'
      WHERE type NOT IN ('post') OR type IS NULL;
    `);
    console.log("مقادیر نامنظم 'type' به 'page' تبدیل شدند.");

    console.log("در حال تغییر نوع داده ستون 'type' به ENUM...");

    // مرحله ۲ (type): تغییر نوع داده ستون به ENUM
    await connection.execute(`
      ALTER TABLE posts
      MODIFY type ENUM('post', 'page') NOT NULL DEFAULT 'post';
    `);
    console.log("نوع داده ستون 'type' با موفقیت به ENUM تغییر یافت.");

    await connection.commit();
    console.log("\nتغییرات با موفقیت ذخیره شد و تراکنش بسته شد.");
  } catch (error) {
    if (connection) {
      await connection.rollback();
      console.error("تراکنش ناموفق بود و به حالت قبل برگشت داده شد.");
    }
    console.error("خطا در هنگام تغییر شمای جدول posts:", error);
  } finally {
    if (connection) {
      connection.release();
    }
    console.log("اتصال به دیتابیس بسته شد.");
  }
};

// فراخوانی تابع برای اجرای اسکریپت
updatePostSchema();
