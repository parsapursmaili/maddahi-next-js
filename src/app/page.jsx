// app/page.js

import Link from "next/link";
import Image from "next/image";
import { FiMic, FiArrowLeft, FiPlayCircle } from "react-icons/fi";

import Slider from "@/app/maddahi/componenet/slider";
import { db } from "@/app/maddahi/lib/db/mysql";

// =================================================================
//  بخش واکشی اطلاعات برای اسلایدرها
// =================================================================
export const revalidate = 3600; // رفرش داده‌ها هر یک ساعت

async function fetchPosts(orderby = "date desc") {
  try {
    const [data] = await db.query(
      `select ID,title,thumbnail,name from posts where type='post' and status='publish' order by ${orderby}  limit 20`
    );
    return data;
  } catch (error) {
    console.error("خطا در واکشی اطلاعات:", error);
    return [];
  }
}

// =================================================================
//  داده‌های ثابت برای کارت‌های معرفی مداحان
// =================================================================
// این داده‌ها به صورت ثابت تعریف شده‌اند تا نیازی به کوئری اضافه نباشد.
// شما می‌توانید slug و imageUrl را بر اساس ساختار سایت اصلی خود در آینده تکمیل کنید.
const featuredMaddahs = [
  {
    id: 108,
    name: "حاج مهدی رسولی",
    slug: "mahdi-rasouli", // این slug باید با صفحه دسته‌بندی ایشان یکی باشد
    // نکته: برای نمایش تصویر، باید URL کامل تصویر پروفایل ایشان را اینجا قرار دهید.
    // این URL از همان منطق صفحه دسته‌بندی پیروی می‌کند.
    imageUrl:
      "https://besooyeto.ir/maddahi/wp-content/uploads/2024/07/rasooli-profile.jpg", // مسیر تصویر را بروزرسانی کنید
  },
  {
    id: 24,
    name: "محمدحسین پویانفر",
    slug: "mohammadhossein-poyanfar",
    imageUrl:
      "https://besooyeto.ir/maddahi/wp-content/uploads/2024/07/pouyanfar-profile.jpg", // مسیر تصویر را بروزرسانی کنید
  },
  {
    id: 2,
    name: "کربلایی حسین طاهری",
    slug: "hossein-taheri",
    imageUrl:
      "https://besooyeto.ir/maddahi/wp-content/uploads/2024/07/taheri-profile.jpg", // مسیر تصویر را بروزرسانی کنید
  },
  {
    id: 10,
    name: "حاج حسن عطایی",
    slug: "hasan-ataei",
    imageUrl:
      "https://besooyeto.ir/maddahi/wp-content/uploads/2024/07/ataee-profile.jpg", // مسیر تصویر را بروزرسانی کنید
  },
];

// =================================================================
//  کامپوننت‌های داخلی صفحه اصلی
// =================================================================

// 1. هدر موقت (طراحی شده در داخل صفحه)
const TemporaryHeader = () => (
  <header className="absolute top-0 left-0 right-0 z-30">
    <div className="container mx-auto flex items-center justify-between p-6 text-[var(--foreground-primary)]">
      <Link href="/maddahi" className="text-2xl font-bold relative group">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-crystal-highlight)] to-[var(--accent-primary)]">
          به سوی تو
        </span>
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent-primary)] transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/maddahi"
          className="text-base text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors duration-300"
        >
          به سوی تو مداحی
        </Link>
        <Link
          href="/maddahi/archive"
          className="text-base text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors duration-300"
        >
          تمام مداحی‌ها
        </Link>
        <Link
          href="/contact-us"
          className="text-base text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors duration-300"
        >
          تماس با ما
        </Link>
      </nav>
      {/* منوی موبایل را می‌توان در اینجا اضافه کرد */}
    </div>
  </header>
);

// 2. بخش Hero (معرفی اصلی)
const HeroSection = () => (
  <section className="relative flex items-center justify-center h-[60vh] min-h-[400px] text-center overflow-hidden">
    <div className="absolute inset-0 bg-[var(--background-primary)] z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background-primary)] to-[var(--background-primary)]"></div>
    </div>
    <div className="absolute inset-[-20%] w-[140%] h-[140%] bg-[conic-gradient(from_45deg_at_50%_50%,_var(--accent-primary)_0deg,_#0a0a0a_70deg,_#0a0a0a_290deg,_var(--accent-primary)_360deg)] opacity-15 animate-[spin_30s_linear_infinite] -z-1"></div>
    <div className="container mx-auto px-4 relative z-20 flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--foreground-primary)]">
        قلب تپنده نواهای آسمانی
      </h1>
      <p className="mt-6 max-w-2xl text-lg md:text-xl text-[var(--foreground-secondary)]">
        صفحه اصلی وب‌سایت در دست طراحی است. تا آن زمان، شما را به گنجینه ارزشمند
        مداحی و نماهنگ‌های "به سوی تو" دعوت می‌کنیم.
      </p>
      <Link
        href="/maddahi"
        className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 mt-10 text-lg font-bold text-[var(--background-primary)] bg-[var(--accent-primary)] rounded-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[var(--accent-primary)]/40"
      >
        <FiPlayCircle className="text-2xl transition-transform duration-300 group-hover:scale-110" />
        <span>ورود به بخش مداحی</span>
      </Link>
    </div>
  </section>
);

// 3. کارت معرفی مداح
const MaddahCard = ({ name, slug, imageUrl }) => (
  <Link
    href={`/maddah/${slug}`}
    className="group relative block bg-[var(--background-secondary)] rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-500 ease-out hover:!scale-105"
  >
    <div className="absolute inset-0 z-0">
      <Image
        src={imageUrl}
        alt={`تصویر ${name}`}
        fill
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
    </div>
    <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
      <div className="border-l-2 border-[var(--accent-primary)] pl-4 transform transition-transform duration-300 group-hover:translate-x-1">
        <h3 className="text-2xl font-bold text-[var(--foreground-primary)]">
          {name}
        </h3>
        <p className="text-sm text-[var(--accent-crystal-highlight)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          مشاهده آثار
        </p>
      </div>
    </div>
    {/* افکت نور کریستالی */}
    <div className="absolute top-0 left-0 w-full h-full rounded-2xl ring-1 ring-inset ring-[var(--border-primary)/50] transition-all duration-300 group-hover:ring-[var(--accent-crystal-highlight)]/70"></div>
  </Link>
);

// 4. بخش مداحان ویژه
const FeaturedMaddahsSection = () => (
  <section className="container mx-auto px-4 py-20">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground-primary)]">
        گلچین آثار برترین مداحان
      </h2>
      <p className="mt-3 text-lg text-[var(--foreground-secondary)]">
        مجموعه‌ای از بهترین آثار مداحان اهل بیت
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {featuredMaddahs.map((maddah) => (
        <MaddahCard key={maddah.id} {...maddah} />
      ))}
    </div>
  </section>
);

// =================================================================
//  کامپوننت اصلی صفحه
// =================================================================
export default async function TemporaryHomePage() {
  // واکشی داده‌ها برای هر دو اسلایدر
  const latestSlides = await fetchPosts("date desc");
  const popularSlides = await fetchPosts("CAST(view AS UNSIGNED) desc");

  return (
    <div className="bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <TemporaryHeader />

      <main className="w-full">
        <HeroSection />

        <FeaturedMaddahsSection />

        {/* بخش اسلایدرها */}
        <div className="space-y-20 py-20 bg-[var(--background-secondary)]/30">
          {latestSlides.length > 0 && (
            <section>
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-baseline mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
                    جدیدترین آثار
                  </h2>
                  <Link
                    href={`/maddahi`}
                    className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
                  >
                    <span>مشاهده همه</span>
                    <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>
                </div>
                {/* از همان کامپوننت اسلایدر موجود استفاده می‌کنیم */}
                <Slider slides={latestSlides} sliderId="temp-latest-eulogies" />
              </div>
            </section>
          )}

          {popularSlides.length > 0 && (
            <section>
              <div className="container mx-auto px-4">
                <div className="flex justify-between items-baseline mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
                    محبوب‌ترین‌ها
                  </h2>
                  <Link
                    href={`/maddahi?sort=popular`}
                    className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
                  >
                    <span>مشاهده همه</span>
                    <FiArrowLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>
                </div>
                {/* ID اسلایدر باید منحصر به فرد باشد */}
                <Slider
                  slides={popularSlides}
                  sliderId="temp-popular-eulogies"
                />
              </div>
            </section>
          )}
        </div>
      </main>

      {/* فوتر ساده */}
      <footer className="bg-[var(--background-secondary)] py-8 text-center">
        <p className="text-[var(--foreground-secondary)]">
          کلیه حقوق این وب‌سایت متعلق به "به سوی تو" می‌باشد.
        </p>
      </footer>
    </div>
  );
}
