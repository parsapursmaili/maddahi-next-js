import mysql from "mysql2/promise";

/**
 * این تابع جداول 'soogname'، 'soogname_posts' و 'soogname_terms' را با انکودینگ صحیح utf8mb4 ایجاد می‌کند.
 * ابتدا جداول قبلی با همین نام (در صورت وجود) را حذف کرده و سپس نسخه‌ی جدید را می‌سازد.
 * @param {mysql.Pool} db - پول اتصال به دیتابیس MySQL.
 */
const createSoognameTables = async (db) => {
  try {
    // حذف جداول به ترتیب برای جلوگیری از خطای کلید خارجی
    console.log("در حال حذف جدول 'soogname_posts' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS soogname_posts`);
    console.log("جدول 'soogname_posts' با موفقیت حذف شد.");

    console.log("در حال حذف جدول 'soogname_terms' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS soogname_terms`);
    console.log("جدول 'soogname_terms' با موفقیت حذف شد.");

    console.log("در حال حذف جدول 'soogname' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS soogname`);
    console.log("جدول 'soogname' با موفقیت حذف شد.");

    // --- مرحله ۱: ایجاد جدول سوگنامه‌ها (soogname) با انکودینگ صحیح ---
    console.log("در حال ایجاد جدول 'soogname'...");
    await db.query(`
      CREATE TABLE soogname (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        content LONGTEXT,
        date DATE,
        url VARCHAR(255),
        thumbnail VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 
    `); // ★★★ این بخش برای تعیین انکودینگ صحیح اضافه شده است ★★★
    console.log("جدول 'soogname' با موفقیت ایجاد شد. ✅");

    // --- مرحله ۲: ایجاد جدول ارتباطی بین سوگنامه و پست‌ها ---
    // تعیین انکودینگ برای این جداول نیز برای یکپارچگی بهتر است.
    console.log("در حال ایجاد جدول 'soogname_posts'...");
    await db.query(`
      CREATE TABLE soogname_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        soogname_id INT NOT NULL,
        post_id INT NOT NULL,
        FOREIGN KEY (soogname_id) REFERENCES soogname(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(ID) ON DELETE CASCADE,
        UNIQUE KEY soogname_post_unique (soogname_id, post_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("جدول 'soogname_posts' با موفقیت ایجاد شد. ✅");

    // --- مرحله ۳: ایجاد جدول ارتباطی بین سوگنامه و ترم‌ها ---
    console.log("در حال ایجاد جدول 'soogname_terms'...");
    await db.query(`
      CREATE TABLE soogname_terms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        soogname_id INT NOT NULL,
        term_id INT NOT NULL,
        FOREIGN KEY (soogname_id) REFERENCES soogname(id) ON DELETE CASCADE,
        FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE,
        UNIQUE KEY soogname_term_unique (soogname_id, term_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("جدول 'soogname_terms' با موفقیت ایجاد شد. ✅");

    console.log(
      "\nفرآیند ایجاد جداول مربوط به سوگنامه و ارتباطات آن با انکودینگ صحیح به پایان رسید."
    );
  } catch (error) {
    console.error("خطا در فرآیند ایجاد جداول سوگنامه:", error);
  }
};

/**
 * تابع اصلی برای اجرای کل فرآیند.
 */
const run = async () => {
  let db;
  try {
    db = await mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "besooyeto_db",
      waitForConnections: true,
      connectionLimit: 100,
      // اطمینان از اینکه اتصال هم از utf8mb4 استفاده می‌کند
      charset: "utf8mb4",
    });
    console.log("اتصال به دیتابیس با موفقیت برقرار شد.");

    await createSoognameTables(db);
  } catch (error) {
    console.error("خطا در اتصال به دیتابیس یا اجرای اسکریپت:", error);
  } finally {
    if (db) {
      await db.end();
      console.log("اتصال به دیتابیس بسته شد.");
    }
  }
};

// اجرای فرآیند
run();
