// app/maddahi/soogname/[slug]/page.jsx

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Eye,
  Users,
  MessageSquarePlus,
  Sparkles, // ★★★ ایمپورت آیکون جدید
  ArrowLeft, // ★★★ ایمپورت آیکون جدید
} from "lucide-react";
import { getSoognamePageData } from "./actions";
import SoognamePlayer from "./SoognamePlayer";
import CommentForm from "@/app/maddahi/components/comments/CommentForm";
import CommentThread from "@/app/maddahi/components/comments/CommentThread";
import SoognameViewCounter from "./ViewCounter";
import Slider from "@/app/maddahi/components/Slider2"; // ★★★ ایمپورت کامپوننت اسلایدر

// ★★★ افزودن کامپوننت‌های کمکی از صفحه پست ★★★
function SectionDivider() {
  return (
    <div className="w-1/2 h-px mx-auto bg-gradient-to-r from-transparent via-[#00b4a0]/30 to-transparent" />
  );
}

function SectionTitle({ icon, title, className = "" }) {
  return (
    <h2
      className={`flex items-center justify-center gap-3 text-2xl font-bold text-[#f5f6f7] ${className}`}
    >
      {icon && <span className="text-[#00b4a0]">{icon}</span>}
      <span>{title}</span>
    </h2>
  );
}
// ★★★ پایان افزودن کامپوننت‌های کمکی ★★★

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const { soogname } = await getSoognamePageData(slug);
  if (!soogname) return { title: "سوگنامه یافت نشد" };

  const description = soogname.content
    ? soogname.content.replace(/<[^>]*>/g, "").substring(0, 160)
    : `مجموعه صوتی ${soogname.title}`;
  const imageUrl = soogname.thumbnail

  return {
    title: `مجموعه سوگنامه ${soogname.title} - به سوی تو`,
    description: description,
    openGraph: {
      title: soogname.title,
      description: description,
      images: [imageUrl],
      url: `https://besooyeto.ir/maddahi/soogname/${slug}`,
      type: "music.album",
    },
    twitter: {
      card: "summary_large_image",
      title: soogname.title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function SoognamePage({ params }) {
  const { slug } = params;
  // ★★★ دریافت دیتای جدید برای اسلایدرها ★★★
  const {
    soogname,
    maddah,
    tags,
    playlist,
    comments,
    totalCommentsCount,
    similarFromOccasion,
    latestFromMaddah,
  } = await getSoognamePageData(slug);

  if (!soogname) notFound();

  const fullThumbnailUrl = soogname.thumbnail
  const imageAltText = soogname.title.substring(0, 70);

  // ★★★ افزودن لینک‌های "مشاهده بیشتر" برای اسلایدرها ★★★
  const similarOccasionLink =
    tags.length > 0 ? `/maddahi/home/?monasebatha=${tags[0].ID}` : "#";
  const latestFromMaddahLink =
    maddah.length > 0 ? `/maddahi/home/?maddah=${maddah[0].ID}` : "#";
  // ★★★ پایان افزودن لینک‌ها ★★★

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#0a0a0a] py-12 sm:py-16">
      <article className="relative z-10 w-full max-w-5xl bg-[#171717]/50 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:rounded-2xl ring-1 ring-[#262626]">
        <div
          className="absolute inset-0 sm:rounded-2xl ring-1 ring-inset ring-[#a3fff4]/10 pointer-events-none"
          aria-hidden="true"
        ></div>

        <header className="relative flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-12 gap-8">
          {fullThumbnailUrl && (
            <div className="group relative h-48 w-48 md:h-56 md:w-56 flex-shrink-0">
              <div className="absolute inset-0 z-0 -m-3 rounded-2xl bg-gradient-to-br from-[#a3fff4] to-[#00b4a0] opacity-0 blur-xl transition-all duration-700 group-hover:opacity-20 group-hover:blur-2xl"></div>
              <Image
                src={fullThumbnailUrl}
                alt={imageAltText}
                priority
                fill
                className="rounded-2xl shadow-lg shadow-black/60 transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </div>
          )}
          <div className="relative flex flex-col items-center md:items-start text-center md:text-right flex-grow">
            <h1 className="pt-5 text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#f5f6f7] to-[#a3fff4] bg-clip-text text-transparent mb-4 leading-tight">
              {soogname.title}
            </h1>
            {maddah.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-5 justify-center md:justify-start">
                {maddah.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/maddahi/category/${m.slug}`}
                    className="text-sm bg-[#00b4a0]/10 text-[#00b4a0] px-4 py-1.5 rounded-full font-medium transition-all duration-300 border border-transparent hover:border-[#a3fff4]/50 hover:bg-[#00b4a0]/20"
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 justify-center md:justify-start">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/maddahi/home/?monasebatha=${tag.ID}`}
                    className="text-xs text-[#a3a3a3] transition-colors duration-300 hover:text-[#a3fff4] hover:underline underline-offset-4"
                  >
                    #{tag.name.replace(/\s/g, "_")}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-[#a3a3a3]">
              <Eye className="w-5 h-5 text-[#00b4a0]/80" />
              <SoognameViewCounter soognameId={soogname.id} />
            </div>
          </div>
        </header>

        <section className="px-4 sm:px-8 md:px-12 pb-8">
          <SoognamePlayer 
            playlist={playlist} 
            artistName={maddah[0]?.name} 
            mainImage={fullThumbnailUrl} 
          />        
        </section>

        {/* ★★★ شروع بخش اسلایدر "آخرین از همین مداح" ★★★ */}
        {latestFromMaddah.length > 0 && (
          <>
            <SectionDivider />
            <section className="py-8 px-1">
              <div className="flex flex-col items-center gap-3 px-6 sm:px-8 md:px-12 mb-6">
                <SectionTitle
                  icon={<Sparkles />}
                  title="آخرین مداحی ها از همین مداح"
                />
                <Link
                  href={latestFromMaddahLink}
                  className="group flex items-center gap-2 text-sm font-medium text-[#a3a3a3] hover:text-[#a3fff4] transition-colors duration-300"
                >
                  <span>مشاهده ی بیشتر از همین مداح</span>
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
              <Slider
                slides={latestFromMaddah}
                sliderId="latest-from-maddah-soogname"
              />
            </section>
          </>
        )}
        {/* ★★★ پایان بخش اسلایدر "آخرین از همین مداح" ★★★ */}

        {/* ★★★ شروع بخش اسلایدر "از همین مناسبت" ★★★ */}
        {similarFromOccasion.length > 0 && (
          <>
            <SectionDivider />
            <section className="py-8 px-1">
              <div className="flex flex-col items-center gap-3 px-6 sm:px-8 md:px-12 mb-6">
                <SectionTitle icon={<Sparkles />} title="از همین مناسبت" />
                <Link
                  href={similarOccasionLink}
                  className="group flex items-center gap-2 text-sm font-medium text-[#a3a3a3] hover:text-[#a3fff4] transition-colors duration-300"
                >
                  <span>مشاهده ی بیشتر از همین مناسبت</span>
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
              <Slider
                slides={similarFromOccasion}
                sliderId="similar-occasion-posts"
              />
            </section>
          </>
        )}
        {/* ★★★ پایان بخش اسلایدر "از همین مناسبت" ★★★ */}

        {soogname.content && (
          <>
            <SectionDivider />
            <section className="p-6 sm:p-8 md:p-12">
              <SectionTitle icon={<BookOpen />} title="متن و توضیحات" />
              <div
                // ★★★ اصلاح: افزودن کلاس برای افزایش ارتفاع خط ★★★
                className="prose ertefae-khat prose-lg prose-invert max-w-none text-[#a3a3a3] prose-headings:text-[#f5f6f7] prose-p:leading-relaxed mt-6"
                dangerouslySetInnerHTML={{ __html: soogname.content }}
              />
            </section>
          </>
        )}

        <div className="border-t border-[#262626] bg-[#0a0a0a]/30 sm:rounded-b-2xl">
          <section className="p-6 sm:p-8 md:p-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="flex items-center justify-center gap-3 text-2xl font-bold text-[#f5f6f7] mb-8">
                <Users className="text-[#a3fff4]" />
                <span>
                  دیدگاه کاربران ({totalCommentsCount.toLocaleString("fa-IR")})
                </span>
              </h2>

              <div className="mb-10 space-y-6">
                {comments && comments.length > 0 ? (
                  <CommentThread
                    comments={comments}
                    postId={soogname.id}
                    postType="soogname"
                  />
                ) : (
                  <div className="text-center py-10 px-4 text-gray-500 bg-[#171717]/50 rounded-lg ring-1 ring-gray-800">
                    <MessageSquarePlus className="w-10 h-10 mx-auto mb-4 text-[#00b4a0]/50" />
                    <p>
                      هنوز دیدگاهی برای این مطلب ثبت نشده است. اولین نفر باشید!
                    </p>
                  </div>
                )}
              </div>

              <div
                id="comment-form"
                className="rounded-xl border border-dashed border-gray-700 p-6 bg-[#171717]/50 scroll-mt-20"
              >
                <CommentForm postId={soogname.id} postType="soogname" />
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
