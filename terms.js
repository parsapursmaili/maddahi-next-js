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

export const recreateAndPopulateTermsTable = async () => {
  const db = await getDb(); // دریافت Connection Pool

  try {
    // 1. حذف جدول terms در صورت وجود
    console.log("در حال حذف جدول 'terms' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS terms`);
    console.log("جدول 'terms' حذف شد.");

    // 2. ایجاد جدول terms با ساختار مناسب
    console.log("در حال ایجاد جدول 'terms'...");
    await db.query(`
      CREATE TABLE terms (
        ID INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        taxonomy VARCHAR(255) NOT NULL
      )
    `);
    console.log("جدول 'terms' با موفقیت ایجاد شد.");

    // 3. گرفتن داده‌ها از wp_terms و wp_term_taxonomy
    console.log("در حال گرفتن داده‌ها از جداول wp_terms و wp_term_taxonomy...");
    let [rows] = await db.query(`
      SELECT
        wt.term_id,
        wt.name,
        wt.slug,
        wtt.taxonomy
      FROM
        wp_terms AS wt
      INNER JOIN
        wp_term_taxonomy AS wtt ON wt.term_id = wtt.term_id
    `);
    console.log(`تعداد ${rows.length} ردیف داده دریافت شد.`);

    // 4. آماده‌سازی داده‌ها برای درج
    if (rows.length === 0) {
      console.log("داده‌ای برای درج در جدول 'terms' وجود ندارد.");
      return;
    }

    const valuesToInsert = rows.map((row) => [
      row.term_id,
      row.name,
      row.slug,
      row.taxonomy,
    ]);

    // 5. درج داده‌ها در جدول terms
    console.log("در حال درج داده‌ها در جدول 'terms'...");
    await db.query(`REPLACE INTO terms (ID, name, slug, taxonomy) VALUES ?`, [
      valuesToInsert,
    ]);
    console.log(`درج ${rows.length} ترم با موفقیت انجام شد.`);

    console.log("فرآیند بازسازی و پر کردن جدول 'terms' به پایان رسید. ✅");
  } catch (error) {
    console.error("خطا در بازسازی و پر کردن جدول 'terms':", error);
    throw error; // برای اینکه خطا به خارج از تابع propagate شود.
  }
};

recreateAndPopulateTermsTable();
