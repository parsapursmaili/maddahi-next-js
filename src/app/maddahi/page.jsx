import Slider from "@/app/maddahi/componenet/Slider2";
import SliderWithViews from "@/app/maddahi/componenet/SliderWithViews";
import RandomMaddahCard from "@/app/maddahi/componenet/RandomMaddahCard";
import { db } from "@/app/maddahi/lib/db/mysql";
import Link from "next/link"; // ★ ایمپورت کامپوننت Link
import { ArrowLeft } from "lucide-react"; // ★ ایمپورت آیکون فلش

export const revalidate = 1800; // 30 دقیقه

async function fetchPosts(orderby = "date desc", limit = 12) {
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
    fetchPosts("date desc", 12),
    fetchPosts("CAST(view AS UNSIGNED) desc", 12),
    fetchPosts("RAND()", 12),
  ]);

  return (
    <div className="container mx-auto p-4 space-y-12 md:space-y-16 py-10">
      {/* ★★★ شروع: بخش آخرین نماهنگ‌ها با لینک مشاهده بیشتر ★★★ */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
          <h3 className="text-2xl text-[var(--foreground-primary)] font-bold">
            آخرین نماهنگ ها
          </h3>
          <Link
            href="/maddahi/home" // لینک به صفحه آرشیو
            className="group flex items-center gap-2 text-sm font-medium text-[#a3a3a3] hover:text-[#a3fff4] transition-colors duration-300"
          >
            <span>بیشتر ببینید</span>
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>
        <Slider slides={latestSlides} sliderId="latest-clips" />
      </section>
      {/* ★★★ پایان: بخش آخرین نماهنگ‌ها ★★★ */}

      {/* ★★★ شروع: بخش محبوب‌ترین نماهنگ‌ها با لینک مشاهده بیشتر ★★★ */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
          <h3 className="text-2xl text-[var(--foreground-primary)] font-bold">
            محبوب ترین نماهنگ ها
          </h3>
          <Link
            href="/maddahi/home?rand=2" // لینک به صفحه آرشیو
            className="group flex items-center gap-2 text-sm font-medium text-[#a3a3a3] hover:text-[#a3fff4] transition-colors duration-300"
          >
            <span>بیشتر ببینید</span>
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>
        <SliderWithViews slides={popularSlides} sliderId="popular-clips" />
      </section>
      {/* ★★★ پایان: بخش محبوب‌ترین نماهنگ‌ها ★★★ */}

      <RandomMaddahCard />

      {/* ★★★ شروع: بخش نماهنگ‌های پیشنهادی با لینک مشاهده بیشتر ★★★ */}
      <section>
        <div className="flex justify-between items-center mb-4 px-2 sm:px-0">
          <h3 className="text-2xl text-[var(--foreground-primary)] font-bold">
            نماهنگ های پیشنهادی
          </h3>
          <Link
            href="/maddahi/home?rand=1" // لینک به صفحه آرشیو
            className="group flex items-center gap-2 text-sm font-medium text-[#a3a3a3] hover:text-[#a3fff4] transition-colors duration-300"
          >
            <span>بیشتر ببینید</span>
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </div>
        <Slider slides={randomSlides} sliderId="random-clips" />
      </section>
      {/* ★★★ پایان: بخش نماهنگ‌های پیشنهادی ★★★ */}
    </div>
  );
}
