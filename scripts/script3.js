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

/**
 * یک رشته را به صورت امن دیکود می‌کند.
 * اگر دیکود با خطا مواجه شود، رشته اصلی را برمی‌گرداند.
 * این تابع همچنین بررسی می‌کند که آیا رشته واقعا انکود شده بوده یا نه.
 * @param {string} str - رشته‌ای که باید دیکود شود.
 * @returns {{decoded: string, changed: boolean}} - رشته دیکود شده و یک پرچم که نشان می‌دهد آیا تغییری اعمال شده است.
 */
function safelyDecodeURIComponent(str) {
  if (!str) {
    return { decoded: str, changed: false };
  }
  try {
    const decoded = decodeURIComponent(str);
    // چک می‌کنیم که آیا دیکود شده با رشته اصلی تفاوت دارد (یعنی از قبل انکود شده بود)
    const changed = decoded !== str;
    return { decoded, changed };
  } catch (e) {
    // اگر URIError رخ داد (یعنی فرمت انکود شده صحیح نیست یا اصلا انکود نشده)،
    // رشته اصلی را برمی‌گردانیم و پرچم تغییر را false می‌کنیم.
    console.warn(`خطا در دیکود کردن رشته: "${str}". ${e.message}`);
    return { decoded: str, changed: false };
  }
}

export const decodeAllPostNames = async () => {
  const db = await getDb();
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); // شروع تراکنش

    console.log("در حال واکشی تمام پست‌ها برای دیکود کردن ستون 'name'...");

    // واکشی تمام پست‌ها با ID و name
    const [posts] = await connection.query("SELECT ID, name FROM posts");

    let updatedCount = 0;
    for (const post of posts) {
      const { ID, name } = post;
      const { decoded: newName, changed } = safelyDecodeURIComponent(name);

      if (changed) {
        // اگر name دیکود شد و تغییر کرد، آن را به‌روزرسانی می‌کنیم
        await connection.execute("UPDATE posts SET name = ? WHERE ID = ?", [
          newName,
          ID,
        ]);
        updatedCount++;
      }
    }

    await connection.commit(); // تایید تراکنش
    console.log(
      `\nعملیات با موفقیت انجام شد. تعداد ${updatedCount} نام پست دیکود و به‌روزرسانی شد.`
    );
  } catch (error) {
    if (connection) {
      await connection.rollback(); // بازگرداندن تراکنش در صورت خطا
      console.error("تراکنش ناموفق بود و به حالت قبل برگشت داده شد.");
    }
    console.error("خطا در هنگام دیکود و به‌روزرسانی نام پست‌ها:", error);
  } finally {
    if (connection) {
      connection.release(); // آزاد کردن اتصال به پول
    }
    console.log("اتصال به دیتابیس بسته شد.");
  }
};

// فراخوانی تابع برای اجرای اسکریپت
decodeAllPostNames();
