// app/not-found.tsx

import Link from "next/link";
import { Fragment } from "react"; // برای استفاده از <></>

export default function NotFound() {
  return (
    <main
      className="flex min-h-screen w-full flex-col items-center justify-center p-4 font-sans"
      // پس‌زمینه اصلی سایت شما
      style={{ backgroundColor: "var(--background-primary)" }}
    >
      <div className="relative w-full max-w-lg text-center">
        {/* افکت نوری کریستالی در پس‌زمینه */}
        <div
          className="absolute -top-1/4 left-1/2 -z-0 h-64 w-64 -translate-x-1/2 animate-pulse rounded-full opacity-15 blur-3xl"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--accent-primary) 0%, var(--background-primary) 70%)",
          }}
        />

        {/* عدد 404 بزرگ و درخشان */}
        <h1
          className="relative z-10 bg-gradient-to-b bg-clip-text text-8xl font-black text-transparent sm:text-9xl"
          style={{
            // گرادینت از هایلایت کریستالی به رنگ تاکیدی
            backgroundImage:
              "linear-gradient(to bottom, var(--accent-crystal-highlight), var(--accent-primary))",
          }}
        >
          404
        </h1>

        {/* پیام‌های اصلی و ثانویه */}
        <h2 className="mt-4 text-2xl font-bold text-[var(--foreground-primary)]">
          صفحه پیدا نشد
        </h2>
        <p className="mt-2 text-base text-[var(--foreground-secondary)]">
          به نظر می‌رسد در فضای بیکران گم شده‌اید. نگران نباشید، ما راه بازگشت
          را به شما نشان می‌دهیم.
        </p>

        {/* دکمه بازگشت به صفحه اصلی */}
        <Link
          href="/maddahi/"
          className="group relative mt-10 inline-block w-full max-w-xs rounded-md px-6 py-3 font-bold transition-all duration-300
                     bg-[var(--background-secondary)] 
                     text-[var(--foreground-primary)]
                     hover:shadow-[0_0_25px_rgba(var(--accent-primary-rgb),0.5)]"
        >
          {/* حاشیه کریستالی درخشان که در هاور ظاهر می‌شود */}
          <span
            className="absolute inset-0 z-0 rounded-md border-2 border-transparent transition-all duration-300 
                       group-hover:border-[var(--accent-crystal-highlight)]"
          />
          <span className="relative z-10">بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    </main>
  );
}
