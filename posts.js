import mysql from "mysql2/promise";

export const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
  waitForConnections: true,
  connectionLimit: 100,
});

export const recreateAndPopulatePostsTable = async () => {
  try {
    // 1. حذف جدول posts در صورت وجود
    console.log("در حال حذف جدول 'posts' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS posts`);
    console.log("جدول 'posts' حذف شد.");

    // 2. ایجاد جدول posts با ساختار مناسب
    console.log("در حال ایجاد جدول 'posts'...");
    await db.query(`
      CREATE TABLE posts (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(255),
        title TEXT,
        content LONGTEXT,
        date DATETIME,
        thumbnail VARCHAR(255),
        link VARCHAR(255),
        type VARCHAR(255),
        name VARCHAR(255),
        comments_count INT,
        comment_status VARCHAR(255),
        excerpt TEXT,
        author INT,
        last_update DATETIME,
        view VARCHAR(255) DEFAULT '0' -- مقدار پیش‌فرض '0' برای ستون view
      )
    `);
    console.log("جدول 'posts' با موفقیت ایجاد شد.");

    // 3. گرفتن داده‌ها از wp_posts و wp_postmeta
    console.log("در حال گرفتن داده‌ها از جداول wp_posts و wp_postmeta...");
    let [rows] = await db.query(
      `SELECT 
          p.ID,
          p.post_status, 
          p.post_title, 
          p.post_content, 
          p.post_date, 
          link.meta_value AS link, 
          p.post_type, 
          p.post_name, 
          p.comment_count, 
          p.comment_status, 
          p.post_excerpt, 
          p.post_author, 
          p.post_modified, 
          view.meta_value AS view, 
          (
              SELECT pm2.meta_value 
              FROM wp_postmeta pm1
              LEFT JOIN wp_posts p2 ON p2.ID = pm1.meta_value
              LEFT JOIN wp_postmeta pm2 ON pm2.post_id = p2.ID AND pm2.meta_key = '_wp_attached_file'
              WHERE pm1.post_id = p.ID AND pm1.meta_key = '_thumbnail_id'
              LIMIT 1
          ) AS thumb
      FROM wp_posts p
      LEFT JOIN wp_postmeta link ON link.post_id = p.ID AND link.meta_key = 'sib-post-pre-link'
      LEFT JOIN wp_postmeta view ON view.post_id = p.ID AND view.meta_key = 'entry_views'
      WHERE p.post_type = 'post' OR p.post_type = 'page'
      `
    );
    console.log(`تعداد ${rows.length} ردیف داده دریافت شد.`);

    // 4. آماده‌سازی داده‌ها برای درج
    const dataToInsert = rows.map((item) => [
      item.ID, // ID را هم اینجا شامل می‌کنیم
      item.post_status,
      item.post_title,
      item.post_content,
      item.post_date,
      item.thumb,
      item.link,
      item.post_type,
      item.post_name,
      item.comment_count,
      item.comment_status,
      item.post_excerpt,
      item.post_author,
      item.post_modified,
      // اطمینان حاصل می‌کنیم که 'view' همیشه '0' باشد اگر null یا خالی بود
      item.view === null || item.view === undefined || item.view === ""
        ? "0"
        : item.view,
    ]);

    // 5. درج داده‌ها در جدول posts
    if (dataToInsert.length > 0) {
      console.log("در حال درج داده‌ها در جدول 'posts'...");
      await db.query(
        `REPLACE INTO posts (id, status, title, content, date, thumbnail, link, type, name, comments_count, comment_status, excerpt, author, last_update, view) VALUES ?`,
        [dataToInsert]
      );
      console.log("درج داده‌ها با موفقیت انجام شد.");
    } else {
      console.log("داده‌ای برای درج وجود ندارد.");
    }

    console.log("فرآیند بازسازی و پر کردن جدول 'posts' به پایان رسید. ✅");
  } catch (error) {
    console.error("خطا در بازسازی و پر کردن جدول 'posts':", error);
  } finally {
    // بستن اتصال به دیتابیس در صورت نیاز (اینجا از connection pool استفاده می‌شود)
    // db.end(); // برای pool معمولاً نیاز به end نیست مگر در انتهای برنامه
  }
};

// فراخوانی تابع برای اجرای عملیات
recreateAndPopulatePostsTable();
