import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Eye, Users, MessageSquarePlus } from "lucide-react";
import { getSoognamePageData } from "./actions";
import SoognamePlayer from "./SoognamePlayer";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";
import CommentForm from "@/app/maddahi/componenet/comments/CommentForm";
import CommentThread from "@/app/maddahi/componenet/comments/CommentThread";
import SoognameViewCounter from "./ViewCounter";

// تابع کمکی برای ایجاد جداکننده بخش‌ها
function SectionDivider() {
  return (
    <div className="w-1/2 h-px mx-auto bg-gradient-to-r from-transparent via-[#00b4a0]/30 to-transparent" />
  );
}

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
    ? `https://besooyeto.ir${createApiImageUrl(soogname.thumbnail, {
        size: "560x560",
      })}`
    : "https://besooyeto.ir/default-og-image.jpg";

  return {
    title: `${soogname.title} - مجموعه سوگنامه`,
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
  const { soogname, maddah, tags, playlist, comments, totalCommentsCount } =
    await getSoognamePageData(slug);

  if (!soogname) notFound();

  const fullThumbnailUrl = soogname.thumbnail
    ? createApiImageUrl(soogname.thumbnail, { size: "560" })
    : null;
  const imageAltText = soogname.title.substring(0, 70);

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
          {/* ★★★ اصلاح CSS: اضافه کردن کلاس `relative` به این div ★★★ */}
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
                    href={`/maddahi/home/?tags=${tag.ID}`}
                    className="text-xs text-[#a3a3a3] transition-colors duration-300 hover:text-[#a3fff4] hover:underline underline-offset-4"
                  >
                    #{tag.name.replace(/\s/g, "_")}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-[#a3a3a3]">
              <Eye className="w-5 h-5 text-[#00b4a0]/80" />
              {/* ★★★ ادغام کامپوننت جدید شمارش بازدید ★★★ */}
              <SoognameViewCounter
                soognameId={soogname.id}
                initialViews={soogname.view_count || 0}
              />
            </div>
          </div>
        </header>

        <section className="px-4 sm:px-8 md:px-12 pb-8">
          <SoognamePlayer playlist={playlist} />
        </section>

        {soogname.content && (
          <>
            <SectionDivider />
            <section className="p-6 sm:p-8 md:p-12">
              <h2 className="flex items-center justify-center gap-3 text-2xl font-bold text-[#f5f6f7] mb-6">
                <BookOpen className="text-[#00b4a0]" />
                <span>متن و توضیحات</span>
              </h2>
              <div
                className="prose prose-lg prose-invert max-w-none text-[#a3a3a3] prose-headings:text-[#f5f6f7]"
                dangerouslySetInnerHTML={{ __html: soogname.content }}
              />
            </section>
          </>
        )}

        <SectionDivider />
        <div className="bg-[#0a0a0a]/30 sm:rounded-b-2xl">
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
