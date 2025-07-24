"use server";

// ۱. وارد کردن دیتابیس طبق الگوی شما
import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath } from "next/cache";
// <<<<<<< شروع تغییرات >>>>>>>>>
// ۲. وارد کردن ابزار تبدیل تاریخ
import { timeAgo } from "@/app/maddahi/lib/utils/formatDate";
// <<<<<<< پایان تغییرات >>>>>>>>>

/**
 * تمام کامنت‌ها را برای صفحه مدیریت واکشی می‌کند.
 */
export async function getCommentsForAdmin() {
  try {
    const [comments] = await db.query(`
      SELECT c.*, p.name as parent_author
      FROM comments c
      LEFT JOIN comments p ON c.parent_id = p.id
      ORDER BY c.created_at DESC
    `);

    // <<<<<<< شروع تغییرات >>>>>>>>>
    // ۳. تبدیل تاریخ هر کامنت به فرمت زمان گذشته قبل از ارسال به کلاینت
    const formattedComments = comments.map((comment) => ({
      ...comment,
      created_at: timeAgo(comment.created_at),
    }));
    // <<<<<<< پایان تغییرات >>>>>>>>>

    // بازگرداندن داده‌های فرمت‌شده
    return { success: true, data: formattedComments };
  } catch (error) {
    console.error("MySQL Error fetching comments:", error);
    return { success: false, message: "خطا در برقراری ارتباط با دیتابیس." };
  }
}

/**
 * وضعیت یک کامنت را آپدیت می‌کند (بدون تغییر).
 */
export async function updateCommentStatus(id, status) {
  if (id === undefined || status === undefined) {
    return { success: false, message: "شناسه یا وضعیت نامعتبر است." };
  }

  try {
    await db.query(`UPDATE comments SET status = ? WHERE id = ?`, [status, id]);
    revalidatePath("/admin/comments");
    return { success: true, message: "وضعیت کامنت با موفقیت آپدیت شد." };
  } catch (error) {
    console.error("MySQL Error updating comment status:", error);
    return {
      success: false,
      message: "عملیات در دیتابیس با شکست مواجه شد.",
    };
  }
}

/**
 * جزئیات یک کامنت را آپدیت می‌کند (بدون تغییر).
 */
export async function updateCommentDetails(id, data) {
  const { name, email, text } = data;

  if (!id || !name || !text) {
    return { success: false, message: "داده‌های ورودی برای ویرایش ناقص است." };
  }

  try {
    await db.query(
      `UPDATE comments SET name = ?, email = ?, text = ? WHERE id = ?`,
      [name, email, text, id]
    );
    revalidatePath("/admin/comments");
    return { success: true, message: "جزئیات کامنت با موفقیت ویرایش شد." };
  } catch (error) {
    console.error("MySQL Error updating comment details:", error);
    return { success: false, message: "خطا در ویرایش کامنت در دیتابیس." };
  }
}
