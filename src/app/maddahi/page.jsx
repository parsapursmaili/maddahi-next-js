import Slider from "@/app/maddahi/componenet/slider"; // این همان SliderConcept11 شماست
import SliderWithViews from "@/app/maddahi/componenet/SliderWithViews"; // اسلایدر جدید
import RandomMaddahCard from "@/app/maddahi/componenet/RandomMaddahCard"; // کارت مداح تصادفی
import { db } from "@/app/maddahi/lib/db/mysql";

// افزایش زمان revalidate برای صفحه‌ای که محتوای تصادفی دارد منطقی است
export const revalidate = 1800; // 30 دقیقه

// تابع واکشی پست‌ها کمی انعطاف‌پذیرتر می‌شود
async function fetchPosts(orderby = "date desc", limit = 20) {
  try {
    // افزودن فیلد view به کوئری برای استفاده در اسلایدر جدید
    const [data] = await db.query(
      `SELECT ID, title, thumbnail, name, view FROM posts WHERE type='post' AND status='publish' ORDER BY ${orderby} LIMIT ${limit}`
    );
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export default async function Home() {
  // واکشی موازی تمام داده‌ها برای عملکرد بهتر
  const [latestSlides, popularSlides, randomSlides] = await Promise.all([
    fetchPosts("date desc", 20),
    fetchPosts("CAST(view AS UNSIGNED) desc", 20),
    fetchPosts("RAND()", 20), // واکشی پست‌های تصادفی
  ]);

  return (
    // افزودن یک پدینگ عمودی برای فاصله بهتر
    <div className="container mx-auto p-4 w-[1350px] space-y-12 md:space-y-16 py-10">
      {/* بخش آخرین نماهنگ‌ها */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4">
          آخرین نماهنگ ها
        </h3>
        <Slider slides={latestSlides} sliderId="latest-clips" />
      </section>

      {/* بخش محبوب‌ترین نماهنگ‌ها با اسلایدر جدید */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4">
          محبوب ترین نماهنگ ها
        </h3>
        <SliderWithViews slides={popularSlides} sliderId="popular-clips" />
      </section>

      {/* بخش کارت معرفی مداح تصادفی */}
      <RandomMaddahCard />

      {/* بخش نماهنگ‌های تصادفی */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4">
          نماهنگ های پیشنهادی (تصادفی)
        </h3>
        <Slider slides={randomSlides} sliderId="random-clips" />
      </section>
    </div>
  );
}
