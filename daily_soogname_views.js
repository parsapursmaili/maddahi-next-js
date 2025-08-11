import mysql from "mysql2/promise";

// این تابع برای اتصال به دیتابیس است و بدون تغییر باقی می‌ماند
let dbInstance;
const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "besooyeto_db",
      waitForConnections: true,
      connectionLimit: 100,
    });
  }
  return dbInstance;
};

/**
 * این تابع جدول `daily_soogname_views` را برای ثبت شمارش روزانه بازدید سوگنامه‌ها ایجاد می‌کند.
 */
export const createDailySoognameViewsTable = async () => {
  const db = await getDb();
  try {
    console.log("در حال حذف جدول 'daily_soogname_views' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS daily_soogname_views`);
    console.log("جدول 'daily_soogname_views' با موفقیت حذف شد.");

    console.log("در حال ایجاد جدول 'daily_soogname_views'...");
    await db.query(`
      CREATE TABLE daily_soogname_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        soogname_id INT NOT NULL,
        view_date DATE NOT NULL,
        view_count INT DEFAULT 1,
        
        UNIQUE KEY soogname_date_unique (soogname_id, view_date),
        FOREIGN KEY (soogname_id) REFERENCES soogname(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("جدول 'daily_soogname_views' با موفقیت ایجاد شد.");
    console.log("فرآیند ایجاد جدول بازدیدهای روزانه سوگنامه به پایان رسید. ✅");
  } catch (error) {
    console.error("خطا در هنگام ایجاد جدول 'daily_soogname_views':", error);
    throw error;
  }
};

// اجرای خودکار اسکریپت
(async () => {
  let db;
  try {
    await createDailySoognameViewsTable();
  } catch (error) {
    console.error("اجرای اسکریپت اصلی با شکست مواجه شد.");
  } finally {
    db = await getDb();
    if (db) {
      await db.end();
      console.log("Database pool closed.");
    }
  }
})();
