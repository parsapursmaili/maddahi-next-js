// app/maddah/[slug]/page.js

import Link from "next/link";
import Slider from "@/app/componenet/slider";
import { db } from "@/app/lib/db/mysql";
import getPosts from "@/app/actions/getPost"; // این خط در پروژه واقعی باید فعال باشد
import { FiMic, FiHeadphones, FiChevronLeft } from "react-icons/fi";

// =================================================================
// کامپوننت‌های جدید و اصلاح‌شده
// =================================================================

// ۱. هدر اصلاح‌شده: فقط آواتار و نام
const MaddahHeader = ({ name }) => (
  <header className="relative overflow-hidden pt-12 md:pt-20">
    <div className="container mx-auto px-4 text-center">
      <div className="relative inline-flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 mb-6">
        {/* افکت چرخش و گرادینت پس‌زمینه */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent-primary)] via-[var(--background-tertiary)] to-[var(--background-secondary)] animate-spin-slow"></div>
        <div className="relative w-[95%] h-[95%] bg-[var(--background-primary)] rounded-full flex items-center justify-center p-2">
          {/* آیکون اصلی */}
          <div className="w-full h-full rounded-full border border-[var(--border-primary)] flex items-center justify-center bg-[var(--background-secondary)]/50">
            <FiMic className="text-6xl sm:text-7xl text-[var(--accent-crystal-highlight)]/80" />
          </div>
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[var(--foreground-primary)] to-[var(--foreground-secondary)] bg-clip-text text-transparent">
        {name}
      </h1>
    </div>
    {/* المان تزئینی پس‌زمینه */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[150%] bg-gradient-radial from-[var(--accent-primary)]/10 via-[var(--accent-primary)]/0 to-transparent -z-10"></div>
  </header>
);

// ★★ جدید: کامپوننت خلاقانه آمار (Crystal Stats)
const CreativeStats = ({ trackCount, totalPlays }) => (
  <div className="container mx-auto px-4 my-12 sm:my-16">
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {/* کارت تعداد آثار */}
      <div className="relative p-6 bg-[var(--background-secondary)]/50 backdrop-blur-sm rounded-2xl overflow-hidden clip-shard-right">
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
          <FiMic className="text-4xl text-[var(--accent-primary)] mb-3" />
          <p className="text-5xl lg:text-6xl font-extrabold text-[var(--foreground-primary)]">
            {trackCount}
          </p>
          <p className="text-md text-[var(--foreground-secondary)] mt-1">
            قطعه اثر
          </p>
        </div>
        {/* افکت درخشش */}
        <div className="absolute -inset-2 bg-gradient-to-br from-[var(--accent-crystal-highlight)]/10 via-transparent to-transparent opacity-50"></div>
      </div>

      {/* کارت مجموع بازدیدها */}
      <div className="relative p-6 bg-[var(--background-secondary)]/50 backdrop-blur-sm rounded-2xl overflow-hidden clip-shard-left">
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full">
          <FiHeadphones className="text-4xl text-[var(--accent-primary)] mb-3" />
          <p className="text-5xl lg:text-6xl font-extrabold text-[var(--foreground-primary)]">
            {totalPlays}
          </p>
          <p className="text-md text-[var(--foreground-secondary)] mt-1">
            مرتبه شنیده شده
          </p>
        </div>
        {/* افکت درخشش */}
        <div className="absolute -inset-2 bg-gradient-to-tl from-[var(--accent-primary)]/10 via-transparent to-transparent opacity-50"></div>
      </div>
    </div>
  </div>
);

// ★★ جدید: کامپوننت بیوگرافی (که در انتهای صفحه قرار می‌گیرد)
const MaddahBio = ({ name, description }) => (
  <section className="container mx-auto px-4 mt-16 sm:mt-24">
    <div className="max-w-4xl mx-auto bg-[var(--background-secondary)]/40 border border-[var(--border-primary)] rounded-2xl p-6 sm:p-8 text-center">
      <h2 className="text-2xl font-bold mb-4">درباره {name}</h2>
      <p className="text-[var(--foreground-secondary)] leading-loose">
        {description}
      </p>
    </div>
  </section>
);

export default async function MaddahCategoryPage({ params }) {
  let [maddah] = await db.query(`select * from terms where slug=?`, [
    params.slug,
  ]);

  maddah = maddah[0];
  const MADDAS_ID = maddah.ID;

  const [latestPostsData, popularPostsData] = await Promise.all([
    getPosts({ maddah: MADDAS_ID, rand: 0, limit: 15, view: 1 }), // 0 برای جدیدترین‌ها
    getPosts({ maddah: MADDAS_ID, rand: 2, limit: 15 }), // 2 برای محبوب‌ترین‌ها
  ]);

  const latestSlides = latestPostsData.post || [];
  const popularSlides = popularPostsData.post || [];

  const eulogistName = maddah.name;
  const eulogistDescription =
    "این یک متن نمونه طولانی برای بخش معرفی و بیوگرافی مداح است. این بخش حالا به انتهای صفحه منتقل شده تا کاربر در ابتدا با آثار و آمار کلیدی مواجه شود. می‌توانید این متن را با محتوای داینامیک و کامل از پایگاه داده خود پر کنید. استفاده از متنی با طول بیشتر در اینجا به درک بهتر چیدمان نهایی کمک می‌کند.";

  let totalview = String(latestPostsData.totalview) || "";
  let itotalview = parseInt(latestPostsData.totalview) || 0;

  if (totalview.length > 3 && totalview.length < 7) {
    totalview = `${parseInt(itotalview / 1000)}K`;
  } else if (totalview.length >= 7) {
    totalview = `${parseInt(itotalview / 1000000)}M`;
  }

  // آمار استاتیک برای نمایش
  const stats = {
    trackCount: latestPostsData.total || 1000, // استرینگ برای فرمت‌دهی دلخواه (مثلا: "۴۱۰+")
  };

  return (
    <main className="min-h-screen pb-20">
      {/* ترتیب جدید المان‌ها */}
      <MaddahHeader name={eulogistName} />

      <CreativeStats trackCount={stats.trackCount} totalPlays={totalview} />

      <div className="space-y-16 sm:space-y-20">
        <section>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">جدیدترین آثار</h2>
              <Link
                href="#"
                className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
              >
                <span>بیشتر ببینید</span>
                <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
            <Slider slides={latestSlides} sliderId="latest-eulogies" />
          </div>
        </section>

        <section>
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold">محبوب‌ترین‌ها</h2>
              <Link
                href="#"
                className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
              >
                <span>بیشتر ببینید</span>
                <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
            <Slider slides={popularSlides} sliderId="popular-eulogies" />
          </div>
        </section>
      </div>

      <MaddahBio name={eulogistName} description={eulogistDescription} />
    </main>
  );
}
