// /app/maddahi/actions/logTimeAction.js (فایل ویرایش شده)

import { db } from "@/app/maddahi/lib/db/mysql";
import { isAuthenticated } from "@/app/maddahi/actions/auth";

/**
 * منطق اصلی برای ثبت زمان حضور کاربر در دیتابیس به صورت روزانه.
 * این تابع توسط یک API Route به عنوان واسط فراخوانی می‌شود.
 * @param {number} postId - شناسه پست.
 * @param {number} seconds - مدت زمان حضور به ثانیه.
 */
export async function logUserTime(postId, seconds) {
  const isAuth = await isAuthenticated();
  if (isAuth) {
    // بازدیدهای ادمین ثبت نمی‌شود
    return;
  }

  if (!postId || typeof seconds !== "number" || seconds <= 5) {
    // داده‌های نامعتبر ثبت نمی‌شود
    return;
  }

  try {
    // کوئری برای درج یا به‌روزرسانی رکورد روزانه یک پست
    const query = `
      INSERT INTO post_time (post_id, log_date, time_added_seconds, logs_added_count)
      VALUES (?, CURDATE(), ?, 1)
      ON DUPLICATE KEY UPDATE
        time_added_seconds = time_added_seconds + VALUES(time_added_seconds),
        logs_added_count = logs_added_count + 1;
    `;

    // اجرای کوئری با پارامترهای postId و seconds
    await db.query(query, [postId, seconds]);
  } catch (error) {
    console.error("Database error in logUserTime action:", error);
  }
}
