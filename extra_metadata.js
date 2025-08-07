import mysql from "mysql2/promise";

// این بخش مشابه کد خودتان برای ایجاد یک Pool اتصال است
export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "test", // نام دیتابیس خود را اینجا وارد کنید
  waitForConnections: true,
  connectionLimit: 100,
});

/**
 * این اسکریپت مقادیر نامعتبر "null" را در فیلد extra_metadata اصلاح می‌کند.
 * این تابع با MariaDB و MySQL سازگار است.
 */
export const fixExtraMetadataNullsForMariaDB = async () => {
  try {
    console.log(
      "شروع اسکریپت (نسخه سازگار با MariaDB) برای اصلاح مقادیر 'null'..."
    );

    // کوئری اصلاح شده که CAST(... AS JSON) را حذف کرده و با MariaDB سازگار است
    const [updateResult] = await db.query(`
      UPDATE posts
      SET extra_metadata = NULL
      WHERE
        extra_metadata IS NOT NULL AND (
          -- شرط ۱: پیدا کردن رکوردهایی که مقدار second_thumbnail برابر رشته "null" است
          JSON_UNQUOTE(JSON_EXTRACT(extra_metadata, '$.second_thumbnail')) = 'null'
          OR
          -- شرط ۲: پیدا کردن رکوردهایی که مقدار second_thumbnail از نوع JSON null است
          JSON_TYPE(JSON_EXTRACT(extra_metadata, '$.second_thumbnail')) = 'NULL'
        );
    `);

    console.log(
      `اصلاح انجام شد. تعداد ${updateResult.affectedRows} ردیف که تامبنیل دوم نداشتند، به NULL آپدیت شدند.`
    );
    console.log("✅ فرآیند اصلاح با موفقیت به پایان رسید.");
  } catch (error) {
    console.error("❌ خطا در هنگام اصلاح فیلد 'extra_metadata':", error);
  }
};

// فراخوانی تابع برای اجرای عملیات و سپس بستن اتصال
fixExtraMetadataNullsForMariaDB().finally(() => {
  console.log("اتصال به دیتابیس بسته شد.");
  db.end();
});
