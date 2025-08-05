import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft, FiGrid } from "react-icons/fi";
import Slider from "@/app/maddahi/componenet/Slider2";
import { db } from "@/app/maddahi/lib/db/mysql";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";

// بازبینی و افزایش زمان revalidate برای کاهش فراخوانی‌های دیتابیس
// ۲ ساعت = ۷۲۰۰ ثانیه
// =================================================================
//  بخش واکشی اطلاعات (بدون تغییر در منطق)
// =================================================================

async function fetchFeaturedMaddahs() {
  const featuredIds = [108, 24, 2, 10];
  try {
    const [results] = await db.query(
      `SELECT t.ID, t.name, t.slug, tm.image_url 
       FROM terms AS t 
       LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id 
       WHERE t.taxonomy = 'category' AND t.ID IN (?)`,
      [featuredIds]
    );
    const sortedResults = featuredIds.map((id) =>
      results.find((r) => r.ID === id)
    );
    return sortedResults;
  } catch (error) {
    console.error("خطا در واکشی اطلاعات مداحان ویژه:", error);
    return [];
  }
}

async function fetchPosts(orderby = "date desc") {
  try {
    const [data] = await db.query(
      `SELECT ID, title, thumbnail, name FROM posts WHERE type='post' AND status='publish' ORDER BY ${orderby} LIMIT 20`
    );
    return data;
  } catch (error) {
    console.error(`خطا در واکشی پست‌ها با ترتیب ${orderby}:`, error);
    return [];
  }
}

// =================================================================
//      کامپوننت‌های بصری (با استایل بهبود یافته)
// =================================================================

const PortalHeader = () => (
  <header className="sticky top-0 z-50 w-full bg-[var(--background-primary)]/80 backdrop-blur-lg border-b border-[var(--border-primary)]">
    <div className="container mx-auto flex items-center justify-between h-20 px-4">
      <Link href="/maddahi" className="text-3xl font-black relative group">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-crystal-highlight)] to-[var(--accent-primary)]">
          به سوی تو
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-4 bg-[var(--background-secondary)]/50 px-5 py-2 rounded-full border border-[var(--border-primary)]">
        <Link
          href="/maddahi"
          className="px-3 py-1 text-base text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors duration-300"
        >
          مداحی‌ها
        </Link>
        <div className="w-px h-4 bg-[var(--border-primary)]"></div>
        <Link
          href="/maddahi/contact-us"
          className="px-3 py-1 text-base text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors duration-300"
        >
          تماس با ما
        </Link>
      </nav>
      <Link
        href="/maddahi/home"
        className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[var(--foreground-primary)] bg-[var(--background-tertiary)] rounded-full border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--accent-primary)]/20"
      >
        <FiGrid />
        <span>آرشیو کامل</span>
      </Link>
      <button className="md:hidden p-2 text-2xl text-[var(--foreground-primary)]">
        <FiGrid />
      </button>
    </div>
  </header>
);

const HeroSection = () => (
  <section className="relative text-center pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
    {/* بهبود پس‌زمینه: یک گرادینت ظریف‌تر و مدرن‌تر */}
    <div className="absolute inset-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_rgba(var(--accent-primary-rgb),0.3)_0%,_transparent_50%)] -z-10"></div>
    <div className="container mx-auto px-4 z-10">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[var(--foreground-primary)]">
        کانون نواهای ماندگار
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-[var(--foreground-secondary)]">
        جایی که هنر و معنویت در هم تنیده می‌شوند. وارد دنیای شورانگیز مداحی و
        نماهنگ‌های اهل بیت شوید.
      </p>
    </div>
  </section>
);

const MaddahHorizontalCard = ({ name, slug, imageUrl, priority = false }) => {
  const creativeText = `مشاهده جدیدترین آثار و نماهنگ‌های ${name}`;

  // استفاده از تابع کمکی برای ساخت URL نهایی
  const finalImageUrl =
    createApiImageUrl(imageUrl, { size: "560" }) || "/default-maddah-image.jpg";

  return (
    <Link href={`/maddahi/category/${slug}`} className="group block w-full">
      <div className="relative flex flex-col md:flex-row bg-[var(--background-secondary)] rounded-2xl overflow-hidden border border-[var(--border-primary)] transition-all duration-500 ease-in-out hover:border-[var(--accent-primary)]/50 hover:shadow-2xl hover:shadow-[var(--accent-primary)]/10">
        {/* بهبود استایل تصویر */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto md:aspect-[4/3] overflow-hidden">
          <Image
            src={finalImageUrl}
            alt={`تصویر ${name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw"
            className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-110"
            // استفاده از unoptimized برای نمایش تصاویر اصلی شما
            unoptimized
            // اولویت‌دهی به بارگذاری اولین تصویر برای بهبود LCP
            priority={priority}
          />
          {/* گرادینت برای خوانایی بهتر متن در حالت‌های مختلف */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent md:bg-gradient-to-r md:from-black/40 md:to-transparent"></div>
        </div>

        {/* بهبود استایل بخش متن */}
        <div className="flex flex-col justify-center p-8 md:p-10 w-full md:w-7/12">
          <h3 className="text-3xl lg:text-4xl font-bold text-[var(--foreground-primary)] mb-4">
            {name}
          </h3>
          <p className="text-base text-[var(--foreground-secondary)] leading-relaxed mb-8 h-12">
            {creativeText}
          </p>
          <div className="flex items-center gap-3 text-lg font-semibold text-[var(--accent-primary)] transition-colors duration-300 group-hover:text-[var(--accent-crystal-highlight)]">
            <span>ورود به صفحه آثار</span>
            <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// =================================================================
//      کامپوننت اصلی صفحه (با اصلاحات نهایی)
// =================================================================
export default async function PrestigeLandingPageV3() {
  const [featuredMaddahs, latestSlides, popularSlides] = await Promise.all([
    fetchFeaturedMaddahs(),
    fetchPosts("date desc"),
    fetchPosts("CAST(view AS UNSIGNED) desc"),
  ]);

  return (
    <div className="bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <PortalHeader />

      <main>
        <HeroSection />

        {/* بهبود فاصله‌گذاری */}
        <section className="container mx-auto px-4 pb-20 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredMaddahs.map((maddah, index) => (
              <MaddahHorizontalCard
                key={maddah.ID}
                name={maddah.name}
                slug={maddah.slug}
                imageUrl={maddah.image_url}
                // فقط به اولین کارت (که بزرگترین عنصر صفحه است) اولویت بالا می‌دهیم
                priority={index === 0}
              />
            ))}
          </div>
        </section>

        {/* بهبود بخش اسلایدرها */}
        <div className="py-20 md:py-24 space-y-20 border-t border-[var(--border-primary)] bg-[var(--background-secondary)]/30">
          {latestSlides.length > 0 && (
            <section>
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-baseline mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
                    جدیدترین آثار
                  </h2>
                  <Link
                    href="/maddahi/home"
                    className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
                  >
                    <span>مشاهده همه</span>
                    <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                  </Link>
                </div>
                {/* نکته: مطمئن شوید کامپوننت Slider شما نیز از unoptimized استفاده می‌کند */}
                <Slider slides={latestSlides} sliderId="portal-latest-v3" />
              </div>
            </section>
          )}

          {popularSlides.length > 0 && (
            <section>
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-baseline mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
                    محبوب‌ترین‌ها
                  </h2>
                  <Link
                    href="/maddahi/home?rand=2"
                    className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
                  >
                    <span>مشاهده همه</span>
                    <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                  </Link>
                </div>
                <Slider slides={popularSlides} sliderId="portal-popular-v3" />
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="bg-[var(--background-secondary)] py-8 text-center border-t border-[var(--border-primary)]">
        <p className="text-[var(--foreground-secondary)]">
          © {new Date().getFullYear()} - کلیه حقوق متعلق به "به سوی تو" است.
        </p>
      </footer>
    </div>
  );
}
