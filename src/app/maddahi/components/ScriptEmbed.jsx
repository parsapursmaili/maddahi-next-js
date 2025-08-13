// /app/maddahi/componenet/ScriptEmbed.jsx
"use client";

import { useEffect, useRef } from "react";

export default function ScriptEmbed({ htmlSnippet }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!htmlSnippet || !containerRef.current) return;

    const container = containerRef.current;
    // پاک کردن محتوای قبلی برای جلوگیری از تداخل در ری‌رندرها
    container.innerHTML = "";

    // استفاده از DOMParser برای解析 کردن رشته HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlSnippet, "text/html");

    // پیدا کردن تگ اسکریپت و دیو اصلی
    const scriptTag = doc.querySelector("script");
    const rootDiv = doc.querySelector("div");

    if (scriptTag && rootDiv) {
      // اضافه کردن دیو اصلی به کامپوننت
      container.appendChild(rootDiv);

      // ساختن یک تگ اسکریپت جدید به صورت داینامیک
      const newScript = document.createElement("script");

      // کپی کردن تمام اتریبیوت‌ها از اسکریپت اصلی به اسکریپت جدید
      // این کار تضمین می‌کند که سورس (src) و سایر پارامترها منتقل شوند
      for (const attr of scriptTag.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.async = true;

      // اضافه کردن اسکریپت جدید به دیوی که تازه ساختیم
      // این کار باعث می‌شود مرورگر اسکریپت را دانلود و اجرا کند
      rootDiv.appendChild(newScript);
    }

    // تابع پاکسازی: در زمان unmount شدن کامپوننت، محتوا را پاک می‌کند
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [htmlSnippet]); // این افکت فقط زمانی اجرا می‌شود که کد جاسازی تغییر کند

  return <div ref={containerRef} />;
}
