import mysql from "mysql2/promise";

// استفاده از الگوی Singleton برای ایجاد و مدیریت یک Pool دیتابیس
let dbInstance;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "test",
      waitForConnections: true,
      connectionLimit: 100,
    });
    console.log("Database pool created successfully.");
  }
  return dbInstance;
};

export const createPostTimesTable = async () => {
  const db = await getDb();

  try {
    console.log("در حال حذف جدول 'post_times' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS post_times`);
    console.log("جدول 'post_times' حذف شد.");

    console.log("در حال ایجاد جدول 'post_times'...");
    await db.query(`
      CREATE TABLE post_times (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        total_time_seconds BIGINT DEFAULT 0,
        log_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY post_id_unique (post_id)
      )
    `);
    console.log("جدول 'post_times' با موفقیت ایجاد شد.");
  } catch (error) {
    console.error("خطا در هنگام ایجاد جدول post_times:", error);
  } finally {
    // اگر از connection pool استفاده می‌کنید، نیازی به بستن آن نیست
    // اما اگر تک کانکشن است، آن را ببندید.
    // await db.end();
  }
};

// فراخوانی تابع برای اجرای آن
createPostTimesTable();
