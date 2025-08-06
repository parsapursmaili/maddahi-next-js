// scripts/create_post_times_table.js (مسیر فایل شما)

import mysql from "mysql2/promise";

// این بخش را مطابق با فایل اتصال دیتابیس خودتان تنظیم کنید
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
// پایان بخش تنظیمات دیتابیس

/**
 * جدول `post_daily_times` را برای ذخیره‌سازی زمان حضور کاربران به صورت روزانه ایجاد می‌کند.
 * این ساختار امکان تحلیل روند تاریخی را فراهم می‌کند.
 */
export const createPostDailyTimesTable = async () => {
  const db = await getDb();

  try {
    // نام جدول را برای وضوح بیشتر به post_daily_times تغییر می‌دهیم
    console.log("در حال حذف جدول 'post_time' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS post_time`);
    console.log("جدول 'post_daily_times' حذف شد.");

    console.log("در حال ایجاد جدول 'post_daily_times'...");
    await db.query(`
      CREATE TABLE post_time (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        log_date DATE NOT NULL,
        time_added_seconds INT DEFAULT 0,
        logs_added_count INT DEFAULT 0,
        UNIQUE KEY post_per_day (post_id, log_date)
      )
    `);
    console.log("جدول 'post_time' با موفقیت ایجاد شد.");
  } catch (error) {
    console.error("خطا در هنگام ایجاد جدول post_time  :", error);
  } finally {
    // اگر از connection pool استفاده می‌کنید، نیازی به بستن آن نیست
    // await db.end();
  }
};

// فراخوانی تابع برای اجرای اسکریپت
createPostDailyTimesTable();
