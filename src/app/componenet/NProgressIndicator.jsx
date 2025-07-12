// components/NProgressIndicator.js
"use client"; // این خط حتماً باید باشه تا بدونه این کامپوننت سمت کلاینت اجرا میشه

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation"; // وارد کردن هوک‌های مخصوص App Router
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

export default function NProgressIndicator() {
  const pathname = usePathname(); // مسیر فعلی صفحه
  const searchParams = useSearchParams(); // پارامترهای کوئری (مثلا ?id=123)

  // مقدار پیشرفت از 0 تا 100
  const progress = useMotionValue(0);
  // فنر برای حرکت نرم نوار پیشرفت
  const springProgress = useSpring(progress, {
    stiffness: 100, // سختی فنر
    damping: 20, // میرایی فنر
    restDelta: 0.001, // حداقل تغییر برای توقف انیمیشن
  });

  // وضعیت برای کنترل دیدن یا ندیدن نوار (مهم برای AnimatePresence)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout;

    // وقتی مسیر صفحه (pathname) یا پارامترهای کوئری (searchParams) عوض میشه،
    // یعنی یه ناوبری جدید شروع شده.
    // اینجا نوار رو قابل دیدن می‌کنیم و شروع به پیشرفت میدیم.
    setIsVisible(true); // نوار رو نشون بده
    progress.set(10); // شروع از 10 درصد
    timeout = setTimeout(() => {
      progress.set(60); // بعد از یه مکث کوتاه، ببرش به 60 درصد
    }, 300);

    // این تابع وقتی اجرا میشه که کامپوننت داره از DOM حذف میشه یا وابستگی‌های useEffect عوض میشن.
    // تو این حالت، یعنی ناوبری تموم شده (یا صفحه جدید رندر شده).
    return () => {
      clearTimeout(timeout); // تایمر قبلی رو پاک کن
      // نوار رو به 100 درصد برسون و بعد پنهانش کن.
      progress.set(100);
      setTimeout(() => {
        setIsVisible(false); // نوار رو مخفی کن بعد از رسیدن به 100%
        progress.set(0); // پیشرفت رو برای ناوبری بعدی ریست کن
      }, 500); // 500 میلی‌ثانیه صبر کن تا 100% رو نشون بده
    };
  }, [pathname, searchParams, progress]); // وقتی اینا عوض بشن، useEffect دوباره اجرا میشه

  return (
    <AnimatePresence>
      {isVisible && ( // فقط وقتی isVisible true هست، نوار رو نشون بده
        <motion.div
          style={{
            width: springProgress, // عرض نوار رو با مقدار فنری تنظیم کن
            scaleX: springProgress, // برای انیمیشن کشیدگی از چپ
            transformOrigin: "left", // از سمت چپ شروع به کشیده شدن کنه
          }}
          initial={{ opacity: 0, width: 0 }} // حالت اولیه: نامرئی و عرض صفر
          animate={{ opacity: 1, width: `${springProgress.get()}%` }} // انیمیشن به سمت نمایان شدن و افزایش عرض
          exit={{ opacity: 0, transition: { duration: 0.3 } }} // وقتی پنهان میشه، آروم محو بشه
          transition={{ duration: 0.3, ease: "easeInOut" }} // سرعت کلی انیمیشن
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 z-[9999] shadow-lg"
        />
      )}
    </AnimatePresence>
  );
}
