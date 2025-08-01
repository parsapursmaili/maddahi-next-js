// /app/maddahi/actions/commentActions.js
"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath } from "next/cache";

// واکشی تمام دیدگاه‌ها برای پنل مدیریت
export async function getCommentsForAdmin() {
  try {
    const [comments] = await db.query(`
      SELECT 
        c.id, c.post_id, c.parent_id, c.name, c.email, c.text, 
        c.ip_address, c.status, c.created_at,
        parent.name as parent_author,
        post.title as post_title,
        post.name as post_slug
      FROM comments c
      LEFT JOIN comments parent ON c.parent_id = parent.id
      LEFT JOIN posts post ON c.post_id = post.ID
      ORDER BY c.created_at DESC
    `);
    return { success: true, data: comments };
  } catch (error) {
    console.error("MySQL Error fetching comments:", error);
    return { success: false, message: "خطا در واکشی دیدگاه‌ها." };
  }
}

/**
 * یک دیدگاه را به صورت کامل و دائمی از دیتابیس حذف می‌کند.
 * به لطف 'ON DELETE CASCADE' در دیتابیس، تمام پاسخ‌های آن نیز حذف می‌شوند.
 * @param {number} id - شناسه کامنت برای حذف
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function deleteCommentPermanently(id) {
  if (!id) {
    return { success: false, message: "شناسه دیدگاه برای حذف نامعتبر است." };
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // ابتدا اطلاعات پست مربوطه را برای revalidate کردن مسیر پیدا می‌کنیم
    const [commentRows] = await connection.query(
      "SELECT post.name as post_slug FROM comments c JOIN posts post ON c.post_id = post.ID WHERE c.id = ?",
      [id]
    );
    const slugToDelete =
      commentRows.length > 0
        ? decodeURIComponent(commentRows[0].post_slug)
        : null;

    await connection.query(`DELETE FROM comments WHERE id = ?`, [id]);
    await connection.commit();

    // Revalidate کردن مسیرهای لازم
    revalidatePath("/maddahi/admin/comments");
    if (slugToDelete) {
      revalidatePath(`/maddahi/${slugToDelete}`);
    }

    return {
      success: true,
      message: "دیدگاه و پاسخ‌های آن برای همیشه حذف شدند.",
    };
  } catch (error) {
    await connection.rollback();
    console.error("MySQL Error deleting comment permanently:", error);
    return { success: false, message: "خطا در حذف دائمی دیدگاه." };
  } finally {
    connection.release();
  }
}

// افزودن پاسخ توسط مدیر
export async function addCommentReply({ text, parentId, postId }) {
  if (!text || !parentId || !postId) {
    return { success: false, message: "اطلاعات برای ثبت پاسخ کامل نیست." };
  }
  try {
    const adminName = "مدیر سایت";
    const adminEmail = "admin@yourdomain.com";
    const status = 1; // 1: پاسخ مدیر خودکار تایید (APPROVED) می‌شود

    const [result] = await db.query(
      `INSERT INTO comments (post_id, parent_id, name, email, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [postId, parentId, adminName, adminEmail, text, status]
    );
    const [newCommentRows] = await db.query(
      `
        SELECT c.*, p.name as post_slug 
        FROM comments c 
        JOIN posts p ON c.post_id = p.ID
        WHERE c.id = ?
    `,
      [result.insertId]
    );

    const newComment = newCommentRows[0];

    // Revalidate کردن مسیرهای لازم
    revalidatePath("/maddahi/admin/comments");
    if (newComment.post_slug) {
      revalidatePath(`/maddahi/${decodeURIComponent(newComment.post_slug)}`);
    }

    return { success: true, newComment };
  } catch (error) {
    return { success: false, message: "خطا در ثبت پاسخ در دیتابیس." };
  }
}

// آپدیت وضعیت دیدگاه
export async function updateCommentStatus(id, status) {
  try {
    const [commentRows] = await db.query(
      "SELECT post.name as post_slug FROM comments c JOIN posts post ON c.post_id = post.ID WHERE c.id = ?",
      [id]
    );
    const slugToRevalidate =
      commentRows.length > 0
        ? decodeURIComponent(commentRows[0].post_slug)
        : null;

    await db.query(`UPDATE comments SET status = ? WHERE id = ?`, [status, id]);

    revalidatePath("/maddahi/admin/comments");
    if (slugToRevalidate) {
      revalidatePath(`/maddahi/${slugToRevalidate}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "خطا در تغییر وضعیت." };
  }
}

// آپدیت جزئیات دیدگاه (ویرایش)
export async function updateCommentDetails(id, data) {
  try {
    await db.query(
      `UPDATE comments SET name = ?, email = ?, text = ? WHERE id = ?`,
      [data.name, data.email, data.text, id]
    );

    // برای revalidate کردن، به اسلاگ پست نیاز داریم
    const [commentRows] = await db.query(
      "SELECT post.name as post_slug FROM comments c JOIN posts post ON c.post_id = post.ID WHERE c.id = ?",
      [id]
    );
    const slugToRevalidate =
      commentRows.length > 0
        ? decodeURIComponent(commentRows[0].post_slug)
        : null;

    revalidatePath("/maddahi/admin/comments");
    if (slugToRevalidate) {
      revalidatePath(`/maddahi/${slugToRevalidate}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: "خطا در ویرایش دیدگاه." };
  }
}
