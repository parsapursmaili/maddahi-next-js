import mysql from "mysql2/promise";

// استفاده از الگوی Singleton برای ایجاد و مدیریت یک Pool دیتابیس
// این تابع دقیقاً همان تابع شماست و نیازی به تغییر ندارد
let dbInstance;

export const getDb = async () => {
  if (!dbInstance) {
    dbInstance = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "test", // نام دیتابیس خود را اینجا وارد کنید
      waitForConnections: true,
      connectionLimit: 100,
    });
    console.log("Database pool created successfully.");
  }
  return dbInstance;
};

/**
 * این تابع جدول `terms_metadata` را حذف و دوباره با ساختار بهینه ایجاد می‌کند.
 * این جدول برای ثبت متادیتای ترم‌ها شامل مسیر عکس و زندگینامه استفاده می‌شود.
 */
export const createTermsMetadataTable = async () => {
  const db = await getDb(); // دریافت Connection Pool

  try {
    // 1. حذف جدول terms_metadata در صورت وجود (برای اجرای چندباره اسکریپت بدون خطا)
    console.log("در حال حذف جدول 'terms_metadata' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS terms_metadata`);
    console.log("جدول 'terms_metadata' حذف شد.");

    // 2. ایجاد جدول terms_metadata با ساختار بهینه
    console.log("در حال ایجاد جدول 'terms_metadata'...");
    await db.query(`
      CREATE TABLE terms_metadata (
        id INT AUTO_INCREMENT PRIMARY KEY,
        term_id INT NOT NULL,
        image_url VARCHAR(255),
        biography TEXT
      )
    `);
    console.log("جدول 'terms_metadata' با موفقیت ایجاد شد.");

    console.log("فرآیند ایجاد جدول متادیتای ترم‌ها به پایان رسید. ✅");
  } catch (error) {
    console.error("خطا در هنگام ایجاد جدول 'terms_metadata':", error);
    throw error; // خطا را به بیرون پرتاب می‌کنیم تا در صورت نیاز مدیریت شود
  }
};

// اجرای تابع برای ایجاد جدول
(async () => {
  try {
    // فرض بر این است که جدول 'terms' از قبل وجود دارد یا در جای دیگری ایجاد می‌شود.
    // اگر جدول 'terms' وجود نداشته باشد، این اسکریپت با خطا مواجه خواهد شد.
    await createTermsMetadataTable();
  } catch (error) {
    console.error("اجرای اسکریپت با شکست مواجه شد.");
  } finally {
    // بستن کانکشن پول پس از اتمام کار
    const db = await getDb();
    if (db) {
      db.end();
      console.log("Database pool closed.");
    }
  }
})();
