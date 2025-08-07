// /app/maddahi/actions/logTimeAction.js (فایل ویرایش شده)
import { db } from "@/app/maddahi/lib/db/mysql";
import { isAuthenticated } from "@/app/maddahi/actions/auth";

/**
 * منطق اصلی برای ثبت زمان حضور کاربر با فیلتر کردن داده‌های پرت.
 * @param {number} postId - شناسه پست.
 * @param {number} seconds - مدت زمان حضور به ثانیه (خام).
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

  // --- منطق جدید برای مقابله با داده‌های پرت ---
  const MAX_SECONDS_THRESHOLD = 900; // 15 دقیقه
  const CAPPED_SECONDS = 450; // 7.5 دقیقه

  let finalSeconds = seconds;

  if (seconds > MAX_SECONDS_THRESHOLD) {
    // اگر زمان ثبت شده از ۱۵ دقیقه بیشتر بود، آن را روی ۵ دقیقه تنظیم کن
    finalSeconds = CAPPED_SECONDS;
  }
  // -------------------------------------------

  try {
    const query = `
      INSERT INTO post_time (post_id, log_date, time_added_seconds, logs_added_count)
      VALUES (?, CURDATE(), ?, 1)
      ON DUPLICATE KEY UPDATE
        time_added_seconds = time_added_seconds + VALUES(time_added_seconds),
        logs_added_count = logs_added_count + 1;
    `;

    // اجرای کوئری با زمان نهایی و فیلتر شده
    await db.query(query, [postId, finalSeconds]);
  } catch (error) {
    console.error("Database error in logUserTime action:", error);
  }
}
