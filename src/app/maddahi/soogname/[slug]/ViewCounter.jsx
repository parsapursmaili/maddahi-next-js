"use client";

import { useEffect, useState } from "react";
import { incrementSoognameView } from "./actions"; // ایمپورت از اکشن‌های همین پوشه

export default function SoognameViewCounter({ soognameId }) {
  // مقدار اولیه را هم با || 0 ایمن می‌کنیم تا از همان ابتدا null نباشد.
  const [currentViews, setCurrentViews] = useState(0);

  useEffect(() => {
    // جلوگیری از شمارش بازدید توسط ربات‌ها
    const isBot = /bot|googlebot|crawler|spider|crawling/i.test(
      navigator.userAgent
    );
    if (isBot) {
      return; // اگر ربات بود، هیچ کاری انجام نده
    }

    const updateView = async () => {
      try {
        const newViewCount = await incrementSoognameView(soognameId);
        // اطمینان از اینکه مقدار بازگشتی یک عدد است
        setCurrentViews(Number(newViewCount) || 0);
      } catch (error) {
        console.error("Failed to increment soogname view:", error);
      }
    };

    // فقط یک بار پس از اولین رندر، بازدید را افزایش می‌دهیم
    updateView();

    // غیرفعال کردن هشدار dependency array چون این افکت باید فقط یک بار اجرا شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soognameId]);

  return (
    // ★★★ اصلاح کلیدی: تضمین می‌کنیم که currentViews همیشه یک عدد است ★★★
    <span>{(currentViews || 0).toLocaleString("fa-IR")} بازدید</span>
  );
}
