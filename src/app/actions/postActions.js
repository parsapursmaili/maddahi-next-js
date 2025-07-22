// /app/actions/postActions.js
"use server";

import { db } from "@/app/lib/db/mysql";
import { revalidatePath } from "next/cache";

// تابع generateUniqueSlug بدون تغییر باقی می‌ماند
async function generateUniqueSlug(title, currentId = null) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  let isUnique = false;
  let counter = 1;
  const originalSlug = slug;
  while (!isUnique) {
    let query = "SELECT ID FROM posts WHERE name = ?";
    const params = [slug];
    if (currentId) {
      query += " AND ID != ?";
      params.push(currentId);
    }
    const [rows] = await db.query(query, params);
    if (rows.length === 0) {
      isUnique = true;
    } else {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
  }
  return slug;
}

// تابع manageTermRelationships بدون تغییر باقی می‌ماند
async function manageTermRelationships(postId, categories = [], tags = []) {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    await connection.query(
      "DELETE FROM wp_term_relationships WHERE object_id = ?",
      [postId]
    );
    const termIds = [...categories, ...tags].filter((id) => id); // فیلتر کردن مقادیر نامعتبر
    if (termIds.length > 0) {
      const values = termIds.map((termId) => [postId, termId]);
      await connection.query(
        "INSERT INTO wp_term_relationships (object_id, term_taxonomy_id) VALUES ?",
        [values]
      );
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Transaction Error in manageTermRelationships:", error);
    throw new Error("خطا در به‌روزرسانی دسته‌بندی‌ها و تگ‌ها.");
  } finally {
    connection.release();
  }
}

// <<--- ایجاد پست جدید (اصلاح شده) --->>
export async function createPost(formData, revalidateUrl) {
  const {
    title,
    content,
    thumbnail,
    categories,
    tags,
    status,
    name,
    link,
    description,
    rozeh,
    thumbnail_alt,
    comment_status,
  } = formData;

  if (!title) {
    return { success: false, message: "عنوان پست نمی‌تواند خالی باشد." };
  }

  try {
    const slug = name
      ? await generateUniqueSlug(name, null)
      : await generateUniqueSlug(title, null);

    const postData = {
      title,
      content: content || "",
      thumbnail: thumbnail || null,
      status: status || "draft",
      name: slug,
      link: link || null,
      description: description || null,
      rozeh: rozeh || "ندارد", // مقدار پیش‌فرض
      thumbnail_alt: thumbnail_alt || null,
      comment_status: comment_status || "open",
      date: new Date(),
      last_update: new Date(),
      type: "post",
      view: 0,
      author: 1, // یا هر منطق دیگری برای نویسنده
    };

    const [result] = await db.query("INSERT INTO posts SET ?", postData);
    const newPostId = result.insertId;

    await manageTermRelationships(newPostId, categories, tags);

    revalidatePath(revalidateUrl);
    return {
      success: true,
      message: "پست با موفقیت ایجاد شد.",
      newPostId: newPostId,
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, message: "خطا در ایجاد پست." };
  }
}

// <<--- به‌روزرسانی پست موجود (اصلاح شده) --->>
export async function updatePost(postId, formData, revalidateUrl) {
  const {
    title,
    name,
    content,
    thumbnail,
    categories,
    tags,
    status,
    link,
    description,
    rozeh,
    thumbnail_alt,
    comment_status,
  } = formData;

  if (!title || !name) {
    return { success: false, message: "عنوان و اسلاگ نمی‌توانند خالی باشند." };
  }

  try {
    const uniqueSlug = await generateUniqueSlug(name, postId);

    const postData = {
      title,
      name: uniqueSlug,
      content: content || "",
      thumbnail: thumbnail || null,
      status: status || "draft",
      link: link || null,
      description: description || null,
      rozeh: rozeh || "ندارد",
      thumbnail_alt: thumbnail_alt || null,
      comment_status: comment_status || "open",
      last_update: new Date(),
    };

    await db.query("UPDATE posts SET ? WHERE ID = ?", [postData, postId]);

    await manageTermRelationships(postId, categories, tags);

    revalidatePath(revalidateUrl);
    return { success: true, message: "پست با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    return { success: false, message: "خطا در به‌روزرسانی پست." };
  }
}

// تابع deletePost بدون تغییر باقی می‌ماند
export async function deletePost(postId, revalidateUrl) {
  if (!postId) {
    return { success: false, message: "شناسه پست نامعتبر است." };
  }
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    await connection.query(
      "DELETE FROM wp_term_relationships WHERE object_id = ?",
      [postId]
    );
    await connection.query("DELETE FROM posts WHERE ID = ?", [postId]);
    await connection.commit();
    revalidatePath(revalidateUrl);
    return { success: true, message: "پست با موفقیت حذف شد." };
  } catch (error) {
    await connection.rollback();
    console.error(`Error deleting post ${postId}:`, error);
    return { success: false, message: "خطا در حذف پست." };
  } finally {
    connection.release();
  }
}
