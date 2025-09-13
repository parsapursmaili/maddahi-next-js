// /app/maddahi/actions/postActions.js
"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath, revalidateTag } from "next/cache";

// توابع کمکی slugify, generateUniqueSlug, manageTermRelationships
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

// ★ ویرایش: این تابع اکنون با اسلاگ‌های دیکود شده کار می‌کند
async function generateUniqueSlug(slugInput, currentId = null) {
  let slug = slugify(slugInput);
  let isUnique = false;
  let counter = 1;
  const originalSlug = slug;

  while (!isUnique) {
    // اسلاگ به صورت مستقیم و دیکود شده در کوئری استفاده می‌شود
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
  // اسلاگ دیکود شده و منحصر به فرد بازگردانده می‌شود
  return slug;
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
    video_link,
    description,
    rozeh,
    thumbnail_alt,
    extra_metadata,
    date,
  } = formData;

  if (!title) {
    return { success: false, message: "عنوان پست نمی‌تواند خالی باشد." };
  }

  try {
    // ★ ویرایش: ورودی برای اسلاگ (name یا title) به صورت دیکود شده به تابع ارسال می‌شود
    const slugInput = name || title;
    const uniqueSlug = await generateUniqueSlug(slugInput, null);

    const finalCategories =
      categories && categories.length > 0 ? categories : [12];

    const secondThumbnail = extra_metadata?.second_thumbnail;

    const postData = {
      title,
      content: content || "",
      thumbnail: thumbnail || null,
      status: status || "draft",
      // ★ ویرایش: اسلاگ دیکود شده در دیتابیس ذخیره می‌شود
      name: uniqueSlug,
      link: link || null,
      video_link: video_link || null,
      description: description,
      rozeh: rozeh,
      thumbnail_alt: thumbnail_alt || null,
      extra_metadata: secondThumbnail
        ? JSON.stringify({ second_thumbnail: secondThumbnail })
        : null,
      date: date ? new Date(date) : new Date(),
      type: "post",
      view: 0,
      author: 1,
    };

    const [result] = await db.query("INSERT INTO posts SET ?", postData);
    const newPostId = result.insertId;

    await manageTermRelationships(newPostId, finalCategories, tags);

    revalidateTag("posts");
    revalidatePath(revalidateUrl);
    if (status === "publish") {
      // ★ ویرایش: مسیر با اسلاگ دیکود شده revalidate می‌شود
      revalidatePath(`/maddahi/${uniqueSlug}`);
    }

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
    video_link,
    description,
    rozeh,
    thumbnail_alt,
    extra_metadata,
    date,
  } = formData;

  if (!title || !name) {
    return { success: false, message: "عنوان و نامک نمی‌توانند خالی باشند." };
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [oldPostRows] = await connection.query(
      "SELECT name FROM posts WHERE ID = ?",
      [postId]
    );
    // ★ ویرایش: اسلاگ قدیمی به صورت دیکود شده از دیتابیس خوانده می‌شود
    const oldSlug = oldPostRows.length > 0 ? oldPostRows[0].name : null;

    const finalCategories =
      categories && categories.length > 0 ? categories : [12];

    // ★ ویرایش: اسلاگ جدید نیز به صورت دیکود شده تولید می‌شود
    const uniqueSlug = await generateUniqueSlug(name, postId);
    const secondThumbnail = extra_metadata?.second_thumbnail;

    const postData = {
      title,
      // ★ ویرایش: اسلاگ جدید و دیکود شده در دیتابیس ذخیره می‌شود
      name: uniqueSlug,
      content: content || "",
      thumbnail: thumbnail || null,
      status: status || "draft",
      link: link || null,
      video_link: video_link || null,
      description: description,
      rozeh: rozeh,
      thumbnail_alt: thumbnail_alt || null,
      extra_metadata: secondThumbnail
        ? JSON.stringify({ second_thumbnail: secondThumbnail })
        : null,
      date: date ? new Date(date) : new Date(),
    };
    await connection.query("UPDATE posts SET ? WHERE ID = ?", [
      postData,
      postId,
    ]);

    await manageTermRelationships(postId, finalCategories, tags);
    await connection.commit();

    revalidateTag("posts");

    // ★ ویرایش: مسیر جدید با اسلاگ دیکود شده revalidate می‌شود
    revalidatePath(`/maddahi/${uniqueSlug}`);

    // ★ ویرایش: اگر اسلاگ قدیمی تغییر کرده بود، آن هم با مقدار دیکود شده revalidate می‌شود
    if (oldSlug && oldSlug !== uniqueSlug) {
      revalidatePath(`/maddahi/${oldSlug}`);
    }
    revalidatePath(revalidateUrl);

    return { success: true, message: "پست با موفقیت به‌روزرسانی شد." };
  } catch (error) {
    await connection.rollback();
    console.error(`Error updating post ${postId}:`, error);
    return {
      success: false,
      message: `خطا در به‌روزرسانی پست: ${error.message}`,
    };
  } finally {
    connection.release();
  }
}

export async function deletePost(postId, revalidateUrl) {
  if (!postId) {
    return { success: false, message: "شناسه پست نامعتبر است." };
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [postRows] = await connection.query(
      "SELECT name FROM posts WHERE ID = ?",
      [postId]
    );
    // ★ ویرایش: اسلاگ از دیتابیس به صورت دیکود شده خوانده می‌شود و نیازی به decodeURIComponent نیست
    const slugToDelete = postRows.length > 0 ? postRows[0].name : null;

    await connection.query(
      "DELETE FROM wp_term_relationships WHERE object_id = ?",
      [postId]
    );
    await connection.query("DELETE FROM posts WHERE ID = ?", [postId]);
    await connection.commit();

    revalidateTag("posts");
    revalidatePath(revalidateUrl);
    if (slugToDelete) {
      // ★ ویرایش: مسیر با اسلاگ دیکود شده revalidate می‌شود
      revalidatePath(`/maddahi/${slugToDelete}`);
    }

    return { success: true, message: "پست با موفقیت حذف شد." };
  } catch (error) {
    await connection.rollback();
    console.error(`Error deleting post ${postId}:`, error);
    return { success: false, message: "خطا در حذف پست." };
  } finally {
    connection.release();
  }
}
