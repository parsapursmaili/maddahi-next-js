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
    console.log("در حال حذف جدول 'posts' (در صورت وجود)...");
    await db.query(`DROP TABLE IF EXISTS posts`);
    console.log("جدول 'posts' حذف شد.");

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
        video_link TEXT
      )
    `);
    console.log("جدول 'posts' با موفقیت ایجاد شد.");

    console.log("در حال گرفتن داده‌ها از جداول وردپرس با کوئری بهینه شده...");
    const [rows] = await db.query(
      `
      SELECT
          p.ID,
          p.post_status,
          p.post_title,
          p.post_content,
          p.post_date,
          p.post_type,
          p.post_name,
          p.comment_count,
          p.comment_status,
          p.post_author,
          link_meta.meta_value AS link,
          view_meta.meta_value AS view,
          description_meta.meta_value AS description,
          rozeh_meta.meta_value AS rozeh,
          thumb_file_meta.meta_value AS thumb,
          thumb_alt_meta.meta_value AS thumbnail_alt_text,
          -- منطق JSON برای اضافه کردن تامبنیل دوم و سایر داده‌های اضافی
          JSON_OBJECT(
              'second_thumbnail', second_thumb_file_meta.meta_value,
              'second_thumbnail_alt', second_thumb_alt_meta.meta_value
          ) AS extra_data_json,
          video_link_meta.meta_value AS video_link
      FROM wp_posts p
      LEFT JOIN wp_postmeta link_meta ON p.ID = link_meta.post_id AND link_meta.meta_key = 'sib-post-pre-link'
      LEFT JOIN wp_postmeta view_meta ON p.ID = view_meta.post_id AND view_meta.meta_key = 'entry_views'
      LEFT JOIN wp_postmeta description_meta ON p.ID = description_meta.post_id AND description_meta.meta_key = 'rank_math_description'
      LEFT JOIN wp_postmeta rozeh_meta ON p.ID = rozeh_meta.post_id AND rozeh_meta.meta_key = 'rozeh'
      LEFT JOIN wp_postmeta video_link_meta ON p.ID = video_link_meta.post_id AND video_link_meta.meta_key = 'your_video_link_meta_key' -- مطمئن شوید این متا کی صحیح است
      
      -- جوین برای تامبنیل اصلی
      LEFT JOIN wp_postmeta thumb_id_meta ON p.ID = thumb_id_meta.post_id AND thumb_id_meta.meta_key = '_thumbnail_id'
      LEFT JOIN wp_postmeta thumb_file_meta ON thumb_id_meta.meta_value = thumb_file_meta.post_id AND thumb_file_meta.meta_key = '_wp_attached_file'
      LEFT JOIN wp_postmeta thumb_alt_meta ON thumb_id_meta.meta_value = thumb_alt_meta.post_id AND thumb_alt_meta.meta_key = '_wp_attachment_image_alt'
      
      -- جوین‌های چندمرحله‌ای برای تامبنیل دوم
      LEFT JOIN wp_postmeta second_thumb_id_meta ON p.ID = second_thumb_id_meta.post_id AND second_thumb_id_meta.meta_key = '_' -- <<< اینجا متا کی شما "_" است
      LEFT JOIN wp_postmeta second_thumb_file_meta ON second_thumb_id_meta.meta_value = second_thumb_file_meta.post_id AND second_thumb_file_meta.meta_key = '_wp_attached_file'
      LEFT JOIN wp_postmeta second_thumb_alt_meta ON second_thumb_id_meta.meta_value = second_thumb_alt_meta.post_id AND second_thumb_alt_meta.meta_key = '_wp_attachment_image_alt'
      
      WHERE p.post_type IN ('post', 'page') AND p.post_status != 'auto-draft'
      `
    );
    console.log(`تعداد ${rows.length} ردیف داده دریافت شد.`);

    if (rows.length === 0) {
      console.log("داده‌ای برای درج وجود ندارد.");
    } else {
      const dataToInsert = rows.map((item) => [
        item.ID,
        item.post_status,
        item.post_title,
        item.post_content,
        item.post_date,
        item.thumb,
        item.thumbnail_alt_text,
        item.link,
        item.post_type,
        item.post_name,
        item.comment_count,
        item.comment_status,
        item.post_author,
        item.view || "0",
        item.description,
        item.rozeh,
        item.thumbnail_alt_text,
        item.extra_data_json,
        item.video_link,
      ]);

      console.log("در حال درج داده‌ها در جدول 'posts'...");
      await db.query(
        `REPLACE INTO posts (id, status, title, content, date, thumbnail, thumbnail_alt, link, type, name, comments_count, comment_status, author, view, description, rozeh, thumbnail_image_alt, extra_metadata, video_link) VALUES ?`,
        [dataToInsert]
      );
      console.log("درج داده‌ها با موفقیت انجام شد.");
    }

    console.log("فرآیند بازسازی و پر کردن جدول 'posts' به پایان رسید. ✅");
  } catch (error) {
    console.error("خطا در بازسازی و پر کردن جدول 'posts':", error);
  } finally {
    // بستن اتصال در اینجا معمولاً لازم نیست چون از pool استفاده می‌شود.
  }
};

// فراخوانی تابع برای اجرای عملیات
recreateAndPopulatePostsTable().finally(() => db.end());
