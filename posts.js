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

    // 2. ایجاد جدول posts با ساختار مناسب (حذف last_update و افزودن video_link)
    console.log("در حال ایجاد جدول 'posts'...");
    await db.query(`
      CREATE TABLE posts (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        status VARCHAR(255),
        title TEXT,
        content LONGTEXT,
        date DATETIME,
        thumbnail VARCHAR(255),
        thumbnail_alt VARCHAR(255),
        link VARCHAR(255),
        type VARCHAR(255),
        name VARCHAR(255),
        comments_count INT,
        comment_status VARCHAR(255),
        author INT,
        view VARCHAR(255) DEFAULT '0',
        description TEXT,
        rozeh VARCHAR(255),
        thumbnail_image_alt VARCHAR(255),
        extra_metadata JSON,
        video_link TEXT -- ستون جدید برای تگ iframe ویدیو
      )
    `);
    console.log("جدول 'posts' با موفقیت ایجاد شد.");

    // 3. گرفتن داده‌ها از wp_posts و wp_postmeta (بدون post_modified)
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
          p.post_author,
          -- p.post_modified حذف شد
          IFNULL(view.meta_value, '0') AS view,
          description.meta_value AS description,
          rozeh.meta_value AS rozeh,
          -- گرفتن آدرس فایل تامبنیل اصلی
          (
              SELECT pm2.meta_value
              FROM wp_postmeta pm1
              LEFT JOIN wp_posts p2 ON p2.ID = pm1.meta_value
              LEFT JOIN wp_postmeta pm2 ON pm2.post_id = p2.ID AND pm2.meta_key = '_wp_attached_file'
              WHERE pm1.post_id = p.ID AND pm1.meta_key = '_thumbnail_id'
              LIMIT 1
          ) AS thumb,
          -- گرفتن آلت تکست تامبنیل اصلی
          (
              SELECT pm2.meta_value
              FROM wp_postmeta pm1
              LEFT JOIN wp_posts p2 ON p2.ID = pm1.meta_value
              LEFT JOIN wp_postmeta pm2 ON pm2.post_id = p2.ID AND pm2.meta_key = '_wp_attachment_image_alt'
              WHERE pm1.post_id = p.ID AND pm1.meta_key = '_thumbnail_id'
              LIMIT 1
          ) AS thumbnail_alt_text,
          -- شروع منطق JSON بهینه شده برای extra_metadata
          (
              SELECT
                  CASE
                      WHEN second_thumb_file.meta_value IS NOT NULL
                      THEN JSON_OBJECT('second_thumbnail', second_thumb_file.meta_value)
                      ELSE NULL
                  END
              FROM wp_postmeta pm_second_thumb_id
              LEFT JOIN wp_posts p_second_thumb_attach
                  ON p_second_thumb_attach.ID = pm_second_thumb_id.meta_value
              LEFT JOIN wp_postmeta second_thumb_file
                  ON second_thumb_file.post_id = p_second_thumb_attach.ID
                  AND second_thumb_file.meta_key = '_wp_attached_file'
              WHERE pm_second_thumb_id.post_id = p.ID
              AND pm_second_thumb_id.meta_key = '_'
              LIMIT 1
          ) AS extra_data_json
      FROM wp_posts p
      LEFT JOIN wp_postmeta link ON link.post_id = p.ID AND link.meta_key = 'sib-post-pre-link'
      LEFT JOIN wp_postmeta view ON view.post_id = p.ID AND view.meta_key = 'entry_views'
      LEFT JOIN wp_postmeta description ON description.post_id = p.ID AND description.meta_key = 'rank_math_description'
      LEFT JOIN wp_postmeta rozeh ON rozeh.post_id = p.ID AND rozeh.meta_key = 'rozeh'
      WHERE p.post_type = 'post' OR p.post_type = 'page'`
    );
    console.log(`تعداد ${rows.length} ردیف داده دریافت شد.`);

    // 4. آماده‌سازی داده‌ها برای درج (حذف post_modified و افزودن مقدار null برای video_link)
    const dataToInsert = rows.map((item) => [
      item.ID,
      item.post_status,
      item.post_title,
      item.post_content,
      item.post_date,
      item.thumb,
      item.thumbnail_alt_text || item.thumbnail_alt,
      item.link,
      item.post_type,
      item.post_name,
      item.comment_count,
      item.comment_status,
      item.post_author,
      // item.post_modified حذف شد
      item.view,
      item.description,
      item.rozeh,
      item.thumbnail_alt_text,
      item.extra_data_json,
      null, // مقدار پیش‌فرض برای ستون جدید video_link
    ]);

    // 5. درج داده‌ها در جدول posts
    if (dataToInsert.length > 0) {
      console.log("در حال درج داده‌ها در جدول 'posts'...");
      // به‌روزرسانی لیست ستون‌ها در کوئری REPLACE INTO
      await db.query(
        `REPLACE INTO posts (id, status, title, content, date, thumbnail, thumbnail_alt, link, type, name, comments_count, comment_status, author, view, description, rozeh, thumbnail_image_alt, extra_metadata, video_link) VALUES ?`,
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
    // در محیط تولیدی، معمولاً pool رو در انتهای برنامه می‌بندید نه در هر اجرای تابع
    // await db.end();
  }
};

// فراخوانی تابع برای اجرای عملیات
recreateAndPopulatePostsTable();
