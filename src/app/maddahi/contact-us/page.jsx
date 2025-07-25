// app/contact-us/page.js
"use client";

import { useState, useEffect } from "react";

// ★★ اصلاح کلیدی: جدا کردن import ها بر اساس مجموعه آیکون ★★
import { FiMessageSquare, FiUsers, FiCopy, FiCheck } from "react-icons/fi"; // آیکون‌های Feather
import { FaTelegramPlane, FaPaperPlane } from "react-icons/fa"; // آیکون‌های Font Awesome

// کامپوننت اصلی صفحه تماس با ما
export default function ContactUsPage() {
  const [isCopied, setIsCopied] = useState(false);
  const contactID = "@parsap110";

  const handleCopy = () => {
    navigator.clipboard.writeText(contactID);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="bg-[var(--background-primary)] text-[var(--foreground-primary)] min-h-screen">
      <main className="container mx-auto px-4 py-20 md:py-32 animate-fade-in">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="pb-2 text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-crystal-highlight)] to-[var(--accent-primary)]">
            پلی برای ارتباط با شما
          </h1>
          <p className="mt-6 text-lg md:text-xl text-[var(--foreground-secondary)] leading-relaxed">
            ما عمیقاً به ارزش نظرات شما ایمان داریم. هر پیشنهاد، نقد سازنده یا
            ایده‌ای برای همکاری، چراغ راه ما در این مسیر خواهد بود. مشتاقانه
            منتظر شنیدن صدای گرم شما هستیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
            <FiMessageSquare className="text-4xl text-[var(--accent-primary)] mb-4" />
            <h2 className="text-2xl font-bold text-[var(--foreground-primary)] mb-3">
              نقد و پیشنهاد
            </h2>
            <p className="text-[var(--foreground-secondary)]">
              اگر بخشی از سایت نیاز به بهبود دارد یا در مورد نحوه ی فعالیت ما
              نقدی دارید مشتاقانه منتظر شنیدن آن هستیم
            </p>
          </div>

          <div className="bg-[var(--background-secondary)] p-8 rounded-2xl border border-[var(--border-primary)]">
            <FiUsers className="text-4xl text-[var(--accent-primary)] mb-4" />
            <h2 className="text-2xl font-bold text-[var(--foreground-primary)] mb-3">
              همکاری با ما
            </h2>
            <p className="text-[var(--foreground-secondary)]">
              اگر مداح، شاعر، طراح، برنامه‌نویس یا صاحب هر هنر و تخصصی هستید که
              می‌تواند به غنای این مجموعه کمک کند، دست شما را به گرمی می‌فشاریم.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative p-8 bg-[var(--background-secondary)]/50 rounded-2xl border border-[var(--border-secondary)] backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-full bg-[radial-gradient(ellipse_at_center,_rgba(var(--accent-primary-rgb),0.15)_0%,_transparent_70%)] -z-10"></div>

            <div className="text-center">
              <p className="text-lg text-[var(--foreground-secondary)] mb-2">
                برای ارتباط مستقیم از طریق پیام‌رسان‌ها، از آیدی زیر استفاده
                کنید:
              </p>
              <div className="flex items-center justify-center gap-4 text-2xl my-4 text-[var(--foreground-primary)]">
                <FaTelegramPlane />
                <span>تلگرام</span>
                <div className="w-px h-6 bg-[var(--border-primary)]"></div>
                <FaPaperPlane />
                <span>ایتا</span>
              </div>

              <div className="relative flex items-center justify-center max-w-sm mx-auto mt-6">
                <div className="w-full text-center text-xl font-mono tracking-widest bg-[var(--background-primary)] py-4 rounded-lg border border-[var(--border-primary)]">
                  {contactID}
                </div>
                <button
                  onClick={handleCopy}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 bg-[var(--accent-primary)] text-[var(--background-primary)] rounded-md transition-all duration-300 hover:scale-110 active:scale-95"
                  aria-label="کپی کردن آیدی"
                >
                  {isCopied ? (
                    <FiCheck className="text-2xl" />
                  ) : (
                    <FiCopy className="text-2xl" />
                  )}
                </button>
              </div>
              {isCopied && (
                <p className="text-sm text-[var(--success)] mt-4">
                  آیدی با موفقیت کپی شد!
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
