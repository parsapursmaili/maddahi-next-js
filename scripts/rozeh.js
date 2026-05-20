import mysql from "mysql2/promise";

// استفاده از الگوی Singleton برای ایجاد و مدیریت یک Pool دیتابیس
let dbInstance;

/**
 * یک Pool اتصال به دیتابیس ایجاد کرده و یا نمونه موجود را برمی‌گرداند.
 * @returns {Promise<mysql.Pool>}
 */
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
 * این تابع فیلد 'rozeh' را از نوع VARCHAR/TEXT به BOOLEAN تبدیل می‌کند.
 * مقادیر 'هست' به TRUE و مقادیر 'نیست' یا NULL به FALSE تبدیل می‌شوند.
 */
export const migrateRozehFieldToBoolean = async () => {
  const db = await getDb();
  // برای انجام تراکنش، یک اتصال از Pool دریافت می‌کنیم
  const connection = await db.getConnection();

  try {
    console.log("شروع فرآیند تبدیل فیلد 'rozeh' به BOOLEAN...");
    // شروع تراکنش
    await connection.beginTransaction();
    console.log("تراکنش آغاز شد.");

    // مرحله 1: اضافه کردن یک ستون جدید موقتی از نوع BOOLEAN
    console.log("مرحله 1: در حال اضافه کردن ستون جدید 'rozeh_bool'...");
    await connection.query(`
      ALTER TABLE posts ADD COLUMN rozeh_bool BOOLEAN;
    `);
    console.log("ستون 'rozeh_bool' با موفقیت اضافه شد.");

    // مرحله 2: به‌روزرسانی ستون جدید بر اساس مقادیر ستون قدیمی 'rozeh'
    console.log("مرحله 2: در حال به‌روزرسانی مقادیر ستون جدید...");

    // اگر 'rozeh' برابر با 'هست' باشد، 'rozeh_bool' را true قرار بده
    const [updateTrueResult] = await connection.query(`
      UPDATE posts SET rozeh_bool = TRUE WHERE rozeh = 'هست';
    `);
    console.log(`${updateTrueResult.affectedRows} سطر به TRUE آپدیت شد.`);

    // اگر 'rozeh' برابر با 'نیست' یا NULL باشد، 'rozeh_bool' را false قرار بده
    const [updateFalseResult] = await connection.query(`
      UPDATE posts SET rozeh_bool = FALSE WHERE rozeh = 'نیست' OR rozeh IS NULL;
    `);
    console.log(`${updateFalseResult.affectedRows} سطر به FALSE آپدیت شد.`);
    console.log("مقادیر ستون جدید با موفقیت به‌روزرسانی شد.");

    // مرحله 3: حذف ستون قدیمی 'rozeh'
    console.log("مرحله 3: در حال حذف ستون قدیمی 'rozeh'...");
    await connection.query(`
      ALTER TABLE posts DROP COLUMN rozeh;
    `);
    console.log("ستون قدیمی 'rozeh' با موفقیت حذف شد.");

    // مرحله 4: تغییر نام ستون جدید به 'rozeh'
    console.log("مرحله 4: در حال تغییر نام ستون 'rozeh_bool' به 'rozeh'...");
    await connection.query(`
      ALTER TABLE posts CHANGE COLUMN rozeh_bool rozeh BOOLEAN;
    `);
    console.log("نام ستون با موفقیت به 'rozeh' تغییر یافت.");

    // ثبت نهایی تغییرات
    await connection.commit();
    console.log(
      "✅ تراکنش با موفقیت انجام شد و تمام تغییرات در دیتابیس ذخیره گردید."
    );
  } catch (error) {
    // در صورت بروز خطا، تمام تغییرات را به حالت قبل بازگردان
    await connection.rollback();
    console.error("❌ خطا در هنگام اجرای اسکریپت. تمام تغییرات لغو شد.", error);
  } finally {
    // آزاد کردن اتصال تا به Pool بازگردد
    if (connection) connection.release();
    console.log("اتصال به دیتابیس آزاد شد و به Pool بازگشت.");
    // در یک برنامه واقعی، نیازی به بستن pool نیست مگر اینکه برنامه تمام شده باشد
    // await db.end();
  }
};

// فراخوانی تابع برای اجرای فرآیند تبدیل
migrateRozehFieldToBoolean();
