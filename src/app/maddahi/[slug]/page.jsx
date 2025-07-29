// app/posts/[slug]/page.jsx

import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostPageData } from "./post";
import MusicPlayer from "@/app/maddahi/componenet/singleplayer";
import Slider from "@/app/maddahi/componenet/slider";
import Comment from "./CommentForm";
import CommentThread from "./CommentThread";
import ServerViewCounter from "@/app/maddahi/componenet/incview";
import Link from "next/link";
import ScriptEmbed from "@/app/maddahi/componenet/ScriptEmbed"; // ★★★ ایمپورت کامپوننت جدید ★★★
import {
  BookOpen,
  Sparkles,
  Users,
  MessageSquarePlus,
  Eye,
  ShieldAlert,
  ImageIcon,
  Film,
} from "lucide-react";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  const { post } = await getPostPageData(slug);

  if (!post) {
    return {
      title: "پست یافت نشد",
      description: "محتوایی برای این آدرس یافت نشد.",
    };
  }

  const description =
    post.description ||
    post.content?.substring(0, 150) ||
    "محتوای این صفحه را مشاهده کنید.";

  const imageUrl = post.thumbnail
    ? `/uploads/${post.thumbnail}`
    : "/default-og-image.jpg";

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      images: [imageUrl],
      url: `https://besooyeto.ir/maddahi/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = params;
  const {
    post,
    maddah,
    monasebat,
    moshabeh,
    latestFromMaddah,
    comments,
    totalCommentsCount,
  } = await getPostPageData(slug);

  if (!post) notFound();

  const fullThumbnailUrl = post.thumbnail ? `/uploads/${post.thumbnail}` : null;

  let parsedMetadata = null;
  if (post.extra_metadata) {
    try {
      parsedMetadata =
        typeof post.extra_metadata === "string"
          ? JSON.parse(post.extra_metadata)
          : post.extra_metadata;
    } catch (error) {
      console.error(
        "Failed to parse extra_metadata JSON:",
        post.extra_metadata,
        error
      );
    }
  }
  const secondThumbnailPath = parsedMetadata?.second_thumbnail;
  const fullSecondThumbnailUrl = secondThumbnailPath
    ? `/uploads/${secondThumbnailPath}`
    : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-[#0a0a0a] py-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <article className="relative z-10 w-full max-w-5xl rounded-2xl bg-[#171717]/50 shadow-2xl shadow-black/40 backdrop-blur-2xl ring-1 ring-[#262626]">
        <div
          className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#a3fff4]/10 pointer-events-none"
          aria-hidden="true"
        ></div>

        <header className="relative flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-12 gap-8">
          {fullThumbnailUrl && (
            <div className="group relative h-48 w-48 md:h-56 md:w-56 flex-shrink-0">
              <div className="absolute inset-0 z-0 -m-3 rounded-2xl bg-gradient-to-br from-[#a3fff4] to-[#00b4a0] opacity-0 blur-xl transition-all duration-700 group-hover:opacity-20 group-hover:blur-2xl"></div>
              <Image
                src={fullThumbnailUrl}
                alt={post.thumbnail_alt || post.title}
                fill
                sizes="(max-width: 768px) 192px, 224px"
                priority
                className="rounded-2xl shadow-lg shadow-black/60 transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#f5f6f7] to-[#a3fff4] bg-clip-text text-transparent mb-4 leading-tight text-right">
              {post.title}
            </h1>
            {maddah.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-5 justify-center md:justify-start">
                {maddah.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/maddahi/category/${m.slug}`}
                    className="text-sm bg-[#00b4a0]/10 text-[#00b4a0] px-4 py-1.5 rounded-full font-medium transition-all duration-300 border border-transparent hover:border-[#a3fff4]/50 hover:bg-[#00b4a0]/20 hover:shadow-lg hover:shadow-[#00b4a0]/10"
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            )}
            {monasebat.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 justify-center md:justify-start">
                {monasebat.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/maddahi/home/?monasebatha=${item.ID}`}
                    className="text-xs text-[#a3a3a3] transition-colors duration-300 hover:text-[#a3fff4] hover:underline underline-offset-4"
                  >
                    #{item.name.replace(/\s/g, "_")}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-[#a3a3a3]">
              <Eye className="w-5 h-5 text-[#00b4a0]/80" />
              <ServerViewCounter postId={parseInt(post.ID)} />
            </div>
          </div>
        </header>

        {post.rozeh === "هست" && (
          <section className="px-6 sm:px-8 md:px-12 py-6">
            <div className="flex items-center gap-4 rounded-lg bg-[#262626]/50 p-4 border-r-4 border-[#ef4444]">
              <ShieldAlert className="h-8 w-8 flex-shrink-0 text-[#ef4444]" />
              <div>
                <h3 className="font-bold text-[#f5f6f7]">
                  توجه: این قطعه صوتی حاوی روضه است
                </h3>
                <p className="text-sm text-[#a3a3a3]">
                  پیشنهاد می‌شود برای حفظ حال معنوی، در شرایط مناسب شنیده شود.
                </p>
              </div>
            </div>
          </section>
        )}

        {post.link && (
          <section className="px-5 flex justify-center items-center">
            <MusicPlayer audioSrc={post.link} />
          </section>
        )}

        {/* ★★★ شروع: بخش نمایش ویدیو با کامپوننت جدید ★★★ */}
        {post.video_link && (
          <>
            <SectionDivider />
            <section className="px-6 sm:px-8 md:px-12 py-8">
              <SectionTitle
                icon={<Film />}
                title="نماهنگ و ویدیو"
                className="mb-6"
              />
              <div className="w-full max-w-3xl mx-auto">
                <ScriptEmbed htmlSnippet={post.video_link} />
              </div>
            </section>
          </>
        )}
        {/* ★★★ پایان: بخش نمایش ویدیو ★★★ */}

        {fullSecondThumbnailUrl && (
          <>
            <SectionDivider />
            <section className="px-6 sm:px-8 md:px-12 py-8 flex flex-col items-center">
              <SectionTitle
                icon={<ImageIcon />}
                title="تصویر دوم"
                className="mb-6"
              />
              <div className="group relative h-52 w-52 flex-shrink-0">
                <Image
                  src={fullSecondThumbnailUrl}
                  alt={`تصویر دوم برای ${post.title}`}
                  fill
                  sizes="208px"
                  className="rounded-xl shadow-md shadow-black/25 transition-transform duration-500 group-hover:scale-105 ring-1 ring-white/10"
                />
              </div>
            </section>
          </>
        )}

        {moshabeh.length > 0 && (
          <>
            <SectionDivider />
            <section className="py-8">
              <SectionTitle
                icon={<Sparkles />}
                title="از همین مناسبت"
                className="px-6 sm:px-8 md:px-12 mb-6"
              />
              <Slider slides={moshabeh} sliderId="similar-posts" />
            </section>
          </>
        )}

        {post.content && (
          <>
            <SectionDivider />
            <section className="px-6 sm:px-8 md:px-12 py-8">
              <SectionTitle icon={<BookOpen />} title="متن و اشعار" />
              <div
                className="prose prose-lg prose-invert max-w-none mt-6 text-[#a3a3a3] prose-headings:text-[#f5f6f7] prose-strong:text-[#f5f6f7] prose-a:text-[#a3fff4] prose-a:transition-colors hover:prose-a:text-[#00b4a0] prose-blockquote:border-r-[#00b4a0]"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </section>
          </>
        )}

        {latestFromMaddah.length > 0 && (
          <>
            <SectionDivider />
            <section className="py-8">
              <SectionTitle
                icon={<Sparkles />}
                title="آخرین مداحی ها از همین مداح"
                className="px-6 sm:px-8 md:px-12 mb-6"
              />
              <Slider slides={latestFromMaddah} sliderId="latest-from-maddah" />
            </section>
          </>
        )}

        <div className="border-t border-[#262626] bg-[#0a0a0a]/30 rounded-b-2xl">
          <section className="p-6 sm:p-8 md:p-12">
            <div className="max-w-3xl mx-auto">
              <SectionTitle
                icon={<Users />}
                title={`نظرات کاربران (${totalCommentsCount.toLocaleString(
                  "fa-IR"
                )})`}
                className="mb-8"
              />
              <div className="mb-10">
                {comments.length > 0 ? (
                  <CommentThread comments={comments} postId={post.ID} />
                ) : (
                  <div className="text-center py-10 px-4 text-[#525252] bg-[#171717]/50 rounded-lg ring-1 ring-[#333333]">
                    <MessageSquarePlus className="w-10 h-10 mx-auto mb-4 text-[#00b4a0]/50" />
                    <p>هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
                  </div>
                )}
              </div>
              <div
                id="comment-form"
                className="rounded-xl border border-dashed border-[#333333] p-6 bg-[#171717]/50 scroll-mt-20 transition-all duration-300 ring-2 ring-transparent focus-within:ring-[#00b4a0]/50 focus-within:border-solid focus-within:border-[#00b4a0]/30"
              >
                <Comment postId={post.ID} />
              </div>
            </div>
          </section>
        </div>
      </article>
    </main>
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

function SectionDivider() {
  return (
    <div className="w-1/2 h-px mx-auto bg-gradient-to-r from-transparent via-[#00b4a0]/30 to-transparent" />
  );
}
