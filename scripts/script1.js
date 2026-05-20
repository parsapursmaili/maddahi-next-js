// addPostTypeColumn.js
"use server";

import mysql from "mysql2/promise";

// اطلاعات اتصال به دیتابیس خود را وارد کنید
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "besooyeto_db",
};

/**
 * اسکریپتی برای اضافه کردن ستون `post_type` از نوع ENUM به جدول `comments`.
 * این اسکریپت ابتدا بررسی می‌کند که آیا ستون وجود دارد یا خیر.
 */
const addPostTypeColumn = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to the database.");

    // ۱. بررسی اینکه آیا ستون `post_type` از قبل وجود دارد یا نه
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM comments LIKE 'post_type'`
    );

    if (columns.length > 0) {
      console.log("Column 'post_type' already exists. No action taken.");
      return; // اگر ستون وجود داشت، اسکریپت را متوقف کن
    }

    // ۲. اضافه کردن ستون `post_type` با نوع ENUM
    const alterQuery = `
      ALTER TABLE comments
      ADD COLUMN post_type ENUM('post', 'soogname') NOT NULL AFTER post_id;
    `;

    await connection.execute(alterQuery);
    console.log(
      "Successfully added 'post_type' column with ENUM('post', 'soogname')."
    );

    // (اختیاری) اضافه کردن ایندکس ترکیبی برای عملکرد بهتر
    const indexQuery = `
      CREATE INDEX idx_post_id_post_type ON comments (post_id, post_type);
    `;
    await connection.execute(indexQuery);
    console.log(
      "Successfully created a composite index on (post_id, post_type)."
    );
  } catch (error) {
    console.error("An error occurred:", error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed.");
    }
  }
};

// اجرای اسکریپت
addPostTypeColumn();
