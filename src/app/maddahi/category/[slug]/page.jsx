// app/maddah/[slug]/page.js

import Link from "next/link";
import Image from "next/image";
import Slider from "@/app/componenet/slider";
import { db } from "@/app/lib/db/mysql";
import getPosts from "@/app/actions/getPost";
import { FiMic, FiHeadphones, FiChevronLeft } from "react-icons/fi";
import { notFound } from "next/navigation";

// =================================================================
// ★★ کامپوننت‌های نهایی - بازطراحی شده بر اساس استایل شما ★★
// =================================================================

export async function generateMetadata({ params }) {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const uploadsPath = process.env.NEXT_PUBLIC_UPLOADS_BASE_PATH || "/uploads";
  const { slug } = params;

  const [maddahResult] = await db.query(
    `SELECT t.name, t.slug, tm.image_url, tm.biography FROM terms AS t LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id WHERE t.slug = ? AND t.taxonomy = 'category'`,
    [slug]
  );

  if (!maddahResult || maddahResult.length === 0) {
    return {
      title: "صفحه یافت نشد",
      description: "محتوایی برای این آدرس یافت نشد.",
    };
  }

  const maddah = maddahResult[0];

  // ساخت عنوان بر اساس نام مداح
  const title = `گلچین مداحی های ${maddah.name}`;

  // ساخت توضیحات از بیوگرافی (حذف تگ‌های HTML و محدود کردن به ۱۵۰ کاراکتر)
  let description = `مجموعه بهترین آثار و مداحی‌های ${maddah.name}.`;
  if (maddah.biography) {
    const plainBio = maddah.biography
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    description =
      plainBio.substring(0, 150) + (plainBio.length > 150 ? "..." : "");
  }

  // ساخت URL کامل برای تصویر
  const imageUrl = maddah.image_url
    ? new URL(`${uploadsPath}/${maddah.image_url}`, siteUrl).href
    : `${siteUrl}/default-og-image.jpg`; // یک تصویر پیش‌فرض برای زمانی که تصویری وجود ندارد

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [imageUrl],
      url: `${siteUrl}/maddah/${slug}`,
      type: "profile", // "profile" برای صفحه شخص مناسب‌تر است
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [imageUrl],
    },
  };
}

const MaddahHeader = ({ name, imageUrl }) => (
  <header className="relative overflow-hidden pt-16 md:pt-24 pb-8">
    <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-primary)]/10 via-transparent to-transparent -z-10"></div>
    <div className="container mx-auto px-4 text-center">
      <div className="relative inline-block group mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--success)] rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 p-2 bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background-primary)] rounded-full shadow-2xl">
          <div className="w-full h-full rounded-full border-2 border-[var(--border-primary)]/50 flex items-center justify-center bg-[var(--background-secondary)] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`تصویر پروفایل ${name}`}
                width={240}
                height={240}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                priority
              />
            ) : (
              <FiMic className="text-8xl text-[var(--foreground-muted)]" />
            )}
          </div>
        </div>
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--foreground-primary)]">
        {name}
      </h1>
    </div>
  </header>
);

const CreativeStats = ({ trackCount, totalPlays }) => (
  <div className="container mx-auto px-4 my-12 sm:my-16">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {[
        { icon: FiMic, value: trackCount, label: "قطعه اثر" },
        { icon: FiHeadphones, value: totalPlays, label: "مرتبه شنیده شده" },
      ].map((stat, index) => (
        <div
          key={index}
          className="relative p-6 rounded-2xl bg-[var(--background-secondary)]/50 backdrop-blur-lg ring-1 ring-[var(--border-primary)] transition-all duration-300 hover:ring-[var(--accent-primary)]/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--accent-primary)]/10"
        >
          <div className="flex flex-col items-center justify-center text-center h-full">
            <stat.icon className="text-4xl text-[var(--accent-primary)] mb-3" />
            <p className="text-5xl lg:text-6xl font-extrabold text-[var(--foreground-primary)]">
              {stat.value}
            </p>
            <p className="text-md text-[var(--foreground-secondary)] mt-1">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ★★ کامپوننت بیوگرافی که از کلاس سفارشی CSS استفاده می‌کند
const MaddahBio = ({ name, rawHtml }) => {
  if (!rawHtml) {
    return null;
  }
  return (
    <section className="container mx-auto px-4 mt-16 sm:mt-24">
      <div className="w-full max-w-5xl mx-auto rounded-2xl bg-[var(--background-secondary)]/50 shadow-2xl shadow-[var(--accent-primary)]/10 backdrop-blur-lg ring-1 ring-[var(--border-primary)] overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-[var(--foreground-primary)]">
            درباره {name}
          </h2>
          {/* فقط از یک کلاس استفاده می‌کنیم که در globals.css تعریف شده است */}
          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: rawHtml }}
          />
        </div>
      </div>
    </section>
  );
};

export default async function MaddahCategoryPage({ params }) {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  const uploadsPath = process.env.NEXT_PUBLIC_UPLOADS_BASE_PATH || "/uploads";

  const [maddahResult] = await db.query(
    `SELECT t.ID, t.name, t.slug, tm.image_url, tm.biography FROM terms AS t LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id WHERE t.slug = ? AND t.taxonomy = 'category'`,
    [params.slug]
  );

  if (!maddahResult || maddahResult.length === 0) {
    notFound();
  }

  const maddah = maddahResult[0];
  const MADDAS_ID = maddah.ID;

  const fullImageUrl = maddah.image_url
    ? new URL(`${uploadsPath}/${maddah.image_url}`, siteUrl).href
    : null;
  const eulogistBiographyHtml = maddah.biography || null;

  const [latestPostsData, popularPostsData] = await Promise.all([
    getPosts({ maddah: MADDAS_ID, rand: 0, limit: 15, view: 1 }),
    getPosts({ maddah: MADDAS_ID, rand: 2, limit: 15 }),
  ]);

  const latestSlides = latestPostsData.post || [];
  const popularSlides = popularPostsData.post || [];
  const eulogistName = maddah.name;

  let totalview = String(latestPostsData.totalview) || "0";
  let itotalview = parseInt(latestPostsData.totalview) || 0;
  if (itotalview >= 1000000) {
    totalview = `${(itotalview / 1000000).toFixed(1).replace(".0", "")}M`;
  } else if (itotalview >= 1000) {
    totalview = `${Math.floor(itotalview / 1000)}K`;
  }

  const stats = {
    trackCount: latestPostsData.total || 0,
  };

  return (
    <main className="min-h-screen pb-20 animate-fade-in">
      <MaddahHeader name={eulogistName} imageUrl={fullImageUrl} />
      <CreativeStats trackCount={stats.trackCount} totalPlays={totalview} />

      <div className="space-y-20">
        {latestSlides.length > 0 && (
          <section>
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-baseline mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
                  جدیدترین آثار
                </h2>
                <Link
                  href={`/?maddah=${maddah.ID}`}
                  className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
                >
                  <span>مشاهده همه</span>
                  <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
              <Slider slides={latestSlides} sliderId="latest-eulogies" />
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
                  href={`/?maddah=${maddah.ID}&rand=2`}
                  className="group flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)] hover:text-[var(--accent-crystal-highlight)] transition-colors duration-300"
                >
                  <span>مشاهده همه</span>
                  <FiChevronLeft className="transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
              <Slider slides={popularSlides} sliderId="popular-eulogies" />
            </div>
          </section>
        )}
      </div>

      <MaddahBio name={eulogistName} rawHtml={eulogistBiographyHtml} />
    </main>
  );
}
