"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath } from "next/cache";

/**
 * واکشی تمام دیدگاه‌ها برای پنل مدیریت با اطلاعات پست/سوگنامه مربوطه.
 * از LEFT JOIN روی هر دو جدول posts و soogname استفاده می‌کند و با COALESCE
 * اطلاعات صحیح (عنوان و لینک) را بر اساس post_type انتخاب می‌کند.
 */
export async function getCommentsForAdmin() {
  try {
    const [comments] = await db.query(`
      SELECT 
        c.id, c.post_id, c.post_type, c.parent_id, c.name, c.email, c.text, 
        c.ip_address, c.status, c.created_at,
        parent.name as parent_author,
        -- با استفاده از COALESCE، اولین مقدار غیر NULL را انتخاب می‌کنیم.
        COALESCE(p.title, s.title) as post_title,
        -- با استفاده از CASE، لینک صحیح را بر اساس post_type می‌سازیم.
        CASE 
          WHEN c.post_type = 'post' THEN CONCAT('/maddahi/', p.name)
          WHEN c.post_type = 'soogname' THEN CONCAT('/maddahi/soogname/', s.url)
          ELSE NULL 
        END as post_link
      FROM comments c
      LEFT JOIN comments parent ON c.parent_id = parent.id
      LEFT JOIN posts p ON c.post_id = p.ID AND c.post_type = 'post'
      LEFT JOIN soogname s ON c.post_id = s.id AND c.post_type = 'soogname'
      ORDER BY c.created_at DESC
    `);
    return { success: true, data: comments };
  } catch (error) {
    console.error("MySQL Error fetching comments for admin:", error);
    return { success: false, message: "خطا در واکشی دیدگاه‌ها." };
  }
}

/**
 * یک تابع کمکی برای پیدا کردن مسیر صحیح برای revalidation.
 */
async function getRevalidationPathForComment(commentId, connection) {
  const dbOrConn = connection || db;
  const [rows] = await dbOrConn.query(
    `
    SELECT c.post_type, p.name as post_slug, s.url as soogname_url
    FROM comments c
    LEFT JOIN posts p ON c.post_id = p.ID AND c.post_type = 'post'
    LEFT JOIN soogname s ON c.post_id = s.id AND c.post_type = 'soogname'
    WHERE c.id = ?
  `,
    [commentId]
  );

  if (rows.length === 0) return null;
  const { post_type, post_slug, soogname_url } = rows[0];

  if (post_type === "post" && post_slug)
    return `/maddahi/${decodeURIComponent(post_slug)}`;
  if (post_type === "soogname" && soogname_url)
    return `/soogname/${decodeURIComponent(soogname_url)}`;
  return null;
}

/**
 * حذف دائمی یک دیدگاه و تمام پاسخ‌های آن.
 */
export async function deleteCommentPermanently(id) {
  if (!id) return { success: false, message: "شناسه دیدگاه نامعتبر است." };

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const pathToRevalidate = await getRevalidationPathForComment(
      id,
      connection
    );

    await connection.query(`DELETE FROM comments WHERE id = ?`, [id]);
    await connection.commit();

    revalidatePath("/maddahi/admin/comments");
    if (pathToRevalidate) revalidatePath(pathToRevalidate);

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

/**
 * افزودن پاسخ توسط مدیر. post_type را از کامنت والد به ارث می‌برد.
 */
export async function addCommentReply({ text, parentId, postId, postType }) {
  if (!text || !parentId || !postId || !postType) {
    return { success: false, message: "اطلاعات برای ثبت پاسخ کامل نیست." };
  }
  try {
    const adminName = "مدیر سایت";
    const adminEmail = "admin@besooyeto.ir";
    const status = 1; // پاسخ مدیر خودکار تایید می‌شود.

    const [result] = await db.query(
      `INSERT INTO comments (post_id, post_type, parent_id, name, email, text, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [postId, postType, parentId, adminName, adminEmail, text, status]
    );

    const [newCommentRows] = await db.query(
      `
        SELECT 
          c.id, c.post_id, c.post_type, c.parent_id, c.name, c.email, c.text, 
          c.status, c.created_at,
          CASE 
            WHEN c.post_type = 'post' THEN CONCAT('/maddahi/', p.name)
            WHEN c.post_type = 'soogname' THEN CONCAT('/soogname/', s.url)
            ELSE NULL 
          END as post_link
        FROM comments c
        LEFT JOIN posts p ON c.post_id = p.ID AND c.post_type = 'post'
        LEFT JOIN soogname s ON c.post_id = s.id AND c.post_type = 'soogname'
        WHERE c.id = ?
    `,
      [result.insertId]
    );

    const newComment = newCommentRows[0];
    const pathToRevalidate = newComment.post_link;

    revalidatePath("/maddahi/admin/comments");
    if (pathToRevalidate) revalidatePath(pathToRevalidate);

    return { success: true, newComment };
  } catch (error) {
    return { success: false, message: "خطا در ثبت پاسخ در دیتابیس." };
  }
}

// آپدیت وضعیت دیدگاه
export async function updateCommentStatus(id, status) {
  try {
    const pathToRevalidate = await getRevalidationPathForComment(id);
    await db.query(`UPDATE comments SET status = ? WHERE id = ?`, [status, id]);
    revalidatePath("/maddahi/admin/comments");
    if (pathToRevalidate) revalidatePath(pathToRevalidate);
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
    const pathToRevalidate = await getRevalidationPathForComment(id);
    revalidatePath("/maddahi/admin/comments");
    if (pathToRevalidate) revalidatePath(pathToRevalidate);
    return { success: true };
  } catch (error) {
    return { success: false, message: "خطا در ویرایش دیدگاه." };
  }
}
