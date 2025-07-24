"use server";

import { db } from "@/app/lib/db/mysql";
import { revalidatePath } from "next/cache";

// تابع slugify که روی متن decode شده کار می‌کند
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AFa-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .substring(0, 70);
};

async function generateUniqueSlug(encodedSlugInput, currentId = null) {
  const decodedSlug = decodeURIComponent(encodedSlugInput);
  let slug = slugify(decodedSlug);
  let isUnique = false;
  let counter = 1;
  const originalSlug = slug;

  while (!isUnique) {
    const slugToQuery = encodeURIComponent(slug);
    let query = "SELECT ID FROM posts WHERE name = ?";
    const params = [slugToQuery];

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
  return encodeURIComponent(slug);
}

async function manageTermRelationships(postId, categories = [], tags = []) {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    await connection.query(
      "DELETE FROM wp_term_relationships WHERE object_id = ?",
      [postId]
    );
    const termIds = [...categories, ...tags].filter((id) => id);
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
    extra_metadata,
  } = formData;

  if (!title) {
    return { success: false, message: "عنوان پست نمی‌تواند خالی باشد." };
  }

  try {
    const slugInput = name || encodeURIComponent(title);
    const uniqueSlug = await generateUniqueSlug(slugInput, null);

    const postData = {
      title,
      content: content || "",
      thumbnail: thumbnail || null,
      status: status || "draft",
      name: uniqueSlug,
      link: link || null,
      description: description,
      rozeh: rozeh || "ندارد",
      thumbnail_alt: thumbnail_alt || null,
      comment_status: comment_status || "open",
      extra_metadata:
        extra_metadata && Object.keys(extra_metadata).length > 0
          ? JSON.stringify(extra_metadata)
          : null,
      date: new Date(),
      last_update: new Date(),
      type: "post",
      view: 0,
      author: 1,
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
    return { success: false, message: `خطا در ایجاد پست: ${error.message}` };
  }
}

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
    extra_metadata,
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
      description: description,
      rozeh: rozeh || "ندارد",
      thumbnail_alt: thumbnail_alt || null,
      comment_status: comment_status || "open",
      extra_metadata:
        extra_metadata && Object.keys(extra_metadata).length > 0
          ? JSON.stringify(extra_metadata)
          : null,
      last_update: new Date(),
    };

    await db.query("UPDATE posts SET ? WHERE ID = ?", [postData, postId]);

    await manageTermRelationships(postId, categories, tags);

    revalidatePath(revalidateUrl);
    return { success: true, message: "پست با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    return {
      success: false,
      message: `خطا در به‌روزرسانی پست: ${error.message}`,
    };
  }
}

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
