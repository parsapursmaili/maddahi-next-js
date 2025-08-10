"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidateTag } from "next/cache";

const ITEMS_PER_PAGE = 20;

// واکشی لیست سوگنامه‌ها برای نمایش در پنل ادمین (بدون تغییر)
export async function getAdminSoogname({ s = "", page = 1 }) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const searchQuery = `%${s}%`;

  const [soognames] = await db.query(
    `SELECT id, title, date, url FROM soogname WHERE title LIKE ? ORDER BY date DESC LIMIT ? OFFSET ?`,
    [searchQuery, ITEMS_PER_PAGE, offset]
  );

  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) as total FROM soogname WHERE title LIKE ?`,
    [searchQuery]
  );

  return {
    data: soognames,
    hasMore: total > page * ITEMS_PER_PAGE,
  };
}

// واکشی اطلاعات کامل یک سوگنامه برای فرم ویرایش (بدون تغییر)
export async function getSoognameById(id) {
  if (!id) return null;
  const [[soogname]] = await db.query("SELECT * FROM soogname WHERE id = ?", [
    id,
  ]);
  if (!soogname) return null;

  const [relatedPosts] = await db.query(
    "SELECT post_id FROM soogname_posts WHERE soogname_id = ?",
    [id]
  );
  const [relatedTerms] = await db.query(
    "SELECT term_id FROM soogname_terms WHERE soogname_id = ?",
    [id]
  );

  soogname.related_posts = relatedPosts.map((p) => p.post_id);
  soogname.related_terms = relatedTerms.map((t) => t.term_id);

  return soogname;
}

// --- ★★★ شروع بازنویسی کامل با منطق صحیح ★★★ ---

// ایجاد یک سوگنامه جدید (بازنویسی شده با منطق postActions)
export async function createSoogname(id, formData) {
  // id اینجا استفاده نمی‌شود اما برای هماهنگی با فرم وجود دارد
  const {
    title,
    content,
    date,
    url,
    thumbnail,
    related_posts = [],
    related_terms = [],
  } = formData;

  if (!title) {
    return { success: false, message: "عنوان نمی‌تواند خالی باشد." };
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. ساخت آبجکت داده‌ها، دقیقاً مشابه postActions
    const soognameData = {
      title,
      content: content || "",
      date: date ? new Date(date) : new Date(),
      url: url || null,
      thumbnail: thumbnail || null,
    };

    // 2. استفاده از کوئری "SET ?" که ثابت شده کار می‌کند
    const [result] = await connection.query(
      "INSERT INTO soogname SET ?",
      soognameData
    );
    const newId = result.insertId;

    // 3. مدیریت روابط (بدون تغییر)
    if (related_posts.length > 0) {
      const postValues = related_posts.map((postId) => [newId, postId]);
      await connection.query(
        "INSERT INTO soogname_posts (soogname_id, post_id) VALUES ?",
        [postValues]
      );
    }
    if (related_terms.length > 0) {
      const termValues = related_terms.map((termId) => [newId, termId]);
      await connection.query(
        "INSERT INTO soogname_terms (soogname_id, term_id) VALUES ?",
        [termValues]
      );
    }

    await connection.commit();
    revalidateTag("soogname");
    return {
      success: true,
      message: "سوگنامه با موفقیت ایجاد شد.",
      newId,
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating soogname:", error);
    return { success: false, message: `خطا در ایجاد: ${error.message}` };
  } finally {
    connection.release();
  }
}

// به‌روزرسانی یک سوگنامه موجود (بازنویسی شده با منطق postActions)
export async function updateSoogname(id, formData) {
  const {
    title,
    content,
    date,
    url,
    thumbnail,
    related_posts = [],
    related_terms = [],
  } = formData;
  if (!title) {
    return { success: false, message: "عنوان نمی‌تواند خالی باشد." };
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. ساخت آبجکت داده‌ها
    const soognameData = {
      title,
      content: content || "",
      date: date ? new Date(date) : new Date(),
      url: url || null,
      thumbnail: thumbnail || null,
    };

    // 2. استفاده از کوئری "SET ?" برای به‌روزرسانی
    await connection.query("UPDATE soogname SET ? WHERE id = ?", [
      soognameData,
      id,
    ]);

    // 3. به‌روزرسانی روابط (بدون تغییر)
    await connection.query("DELETE FROM soogname_posts WHERE soogname_id = ?", [
      id,
    ]);
    await connection.query("DELETE FROM soogname_terms WHERE soogname_id = ?", [
      id,
    ]);

    if (related_posts.length > 0) {
      const postValues = related_posts.map((postId) => [id, postId]);
      await connection.query(
        "INSERT INTO soogname_posts (soogname_id, post_id) VALUES ?",
        [postValues]
      );
    }
    if (related_terms.length > 0) {
      const termValues = related_terms.map((termId) => [id, termId]);
      await connection.query(
        "INSERT INTO soogname_terms (soogname_id, term_id) VALUES ?",
        [termValues]
      );
    }

    await connection.commit();
    revalidateTag("soogname");
    return { success: true, message: "سوگنامه با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating soogname:", error);
    return { success: false, message: `خطا در به‌روزرسانی: ${error.message}` };
  } finally {
    connection.release();
  }
}

// --- ★★★ پایان بازنویسی ★★★ ---

// حذف یک سوگنامه (بدون تغییر)
export async function deleteSoogname(id) {
  try {
    await db.query("DELETE FROM soogname WHERE id = ?", [id]);
    revalidateTag("soogname");
    return { success: true, message: "سوگنامه با موفقیت حذف شد." };
  } catch (error) {
    console.error("Error deleting soogname:", error);
    return { success: false, message: `خطا در حذف: ${error.message}` };
  }
}

// اکشن کمکی برای جستجوی پست‌ها (بدون تغییر)
export async function searchPostsForSelector(query) {
  if (!query) return [];
  const searchQuery = `%${query}%`;
  const [posts] = await db.query(
    "SELECT ID, title FROM posts WHERE title LIKE ? AND status = 'publish' LIMIT 10",
    [searchQuery]
  );
  return posts;
}
