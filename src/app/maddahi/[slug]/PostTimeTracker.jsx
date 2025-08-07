// /app/maddahi/componenet/PostTimeTracker.jsx
"use client";

import { useEffect, useRef } from "react";

/**
 * کامپوننت کلاینت ساده‌شده برای ردیابی کل زمان حضور کاربر در صفحه.
 * این کامپوننت زمان را بدون توجه به فعال بودن تب محاسبه می‌کند.
 * @param {{ postId: number | string }} props
 */
export default function PostTimeTracker({ postId }) {
  // Ref فقط برای نگهداری زمان شروع
  const startTimeRef = useRef(Date.now());
  // Ref برای اطمینان از اینکه درخواست فقط یک بار ارسال می‌شود
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (!postId) return;

    const logFinalTime = () => {
      if (hasLoggedRef.current) return;
      hasLoggedRef.current = true;

      // محاسبه کل زمان سپری شده از لحظه بارگذاری صفحه
      const endTime = Date.now();
      const seconds = (endTime - startTimeRef.current) / 1000;

      // ارسال زمان خام، حتی اگر خیلی کوتاه یا خیلی بلند باشد.
      // منطق فیلتر کردن در سرور انجام می‌شود.
      if (seconds > 5) {
        const data = { postId, seconds: Math.round(seconds) };
        const blob = new Blob([JSON.stringify(data)], {
          type: "application/json",
        });

        navigator.sendBeacon("/maddahi/api/log-time", blob);
      }
    };

    // استفاده از 'pagehide' برای اطمینان از ارسال در لحظه خروج
    window.addEventListener("pagehide", logFinalTime);

    // تابع cleanup برای مدیریت ناوبری داخلی
    return () => {
      logFinalTime();
      window.removeEventListener("pagehide", logFinalTime);
    };
  }, [postId]);

  return null;
}
