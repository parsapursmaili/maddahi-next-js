import Slider from "@/app/maddahi/componenet/slider";
import SliderWithViews from "@/app/maddahi/componenet/SliderWithViews";
import RandomMaddahCard from "@/app/maddahi/componenet/RandomMaddahCard";
import { db } from "@/app/maddahi/lib/db/mysql";

export const revalidate = 1800; // 30 دقیقه

async function fetchPosts(orderby = "date desc", limit = 20) {
  try {
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
  const [latestSlides, popularSlides, randomSlides] = await Promise.all([
    fetchPosts("date desc", 20),
    fetchPosts("CAST(view AS UNSIGNED) desc", 20),
    fetchPosts("RAND()", 20),
  ]);

  return (
    // *** تغییر کلیدی و اصلی اینجاست ***
    // کلاس w-[1350px] حذف شد تا کلاس container به درستی عمل کند
    <div className="container mx-auto p-4 space-y-12 md:space-y-16 py-10">
      {/* بخش آخرین نماهنگ‌ها */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4 px-2 sm:px-0">
          آخرین نماهنگ ها
        </h3>
        <Slider slides={latestSlides} sliderId="latest-clips" />
      </section>

      {/* بخش محبوب‌ترین نماهنگ‌ها */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4 px-2 sm:px-0">
          محبوب ترین نماهنگ ها
        </h3>
        <SliderWithViews slides={popularSlides} sliderId="popular-clips" />
      </section>

      {/* بخش کارت معرفی مداح تصادفی */}
      {/* این کامپوننت با اصلاحات قبلی، در این چیدمان ریسپانسیو به درستی نمایش داده می‌شود */}
      <RandomMaddahCard />

      {/* بخش نماهنگ‌های تصادفی */}
      <section>
        <h3 className="text-2xl text-[var(--foreground-primary)] font-bold mb-4 px-2 sm:px-0">
          نماهنگ های پیشنهادی (تصادفی)
        </h3>
        <Slider slides={randomSlides} sliderId="random-clips" />
      </section>
    </div>
  );
}
