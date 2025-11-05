// app/posts/[slug]/page.jsx
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostPageData } from "./post";
import MusicPlayer from "@/app/maddahi/components/singleplayer";
import Slider from "@/app/maddahi/components/Slider2";
import CommentForm from "../components/comments/CommentForm";
import CommentThread from "../components/comments/CommentThread";
import ServerViewCounter from "@/app/maddahi/components/incview";
import Link from "next/link";
import ScriptEmbed from "@/app/maddahi/components/ScriptEmbed";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";
import { generateBlogPostingSchema } from "./schema";
import {
  BookOpen,
  Sparkles,
  Users,
  MessageSquarePlus,
  Eye,
  ShieldAlert,
  ImageIcon,
  Film,
  ArrowLeft,
} from "lucide-react";
export async function generateStaticParams() {
  return [];
}
export async function generateMetadata({ params }) {
  const { slug } = params; // 🔑 دریافت maddah برای استفاده در اسکیما
  const { post, maddah } = await getPostPageData(slug);
  const siteUrl = "https://besooyeto.ir";

  if (!post) {
    return {
      title: "پست یافت نشد",
      description: "محتوایی برای این آدرس یافت نشد.",
    };
  } // 1. تنظیم Canonical URL

  const canonicalUrl = `${siteUrl}/maddahi/${slug}`;
  // 2. تولید اسکیماهای نهایی
  const postSchemas = generatePostSchemas(post, maddah, canonicalUrl); // 3. تنظیم متادیتای پایه (Title, Description, Image)

  const description =
    post.description ||
    post.content?.substring(0, 150) ||
    "محتوای این صفحه را مشاهده کنید.";
  const imageUrl = post.thumbnail
    ? `${siteUrl}${createApiImageUrl(post.thumbnail, {
        size: "560x560",
      })}`
    : `${siteUrl}/favicon.webp`;
  const finalTitle = `${post.title} - به سوی تو`; // عنوان نهایی

  return {
    title: finalTitle,
    description: description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: finalTitle,
      description: description,
      images: [imageUrl],
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: description,
      images: [imageUrl],
    }, // 🔑 تزریق آرایه اسکیماها به Next.js
    "application/ld+json": postSchemas,
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
  const fullThumbnailUrl = createApiImageUrl(post.thumbnail, { size: "560" });
  const similarOccasionLink =
    monasebat.length > 0
      ? `/maddahi/home/?monasebatha=${monasebat[0].ID}`
      : "#";
  const latestFromMaddahLink =
    maddah.length > 0 ? `/maddahi/home/?maddah=${maddah[0].ID}` : "#";
  const thumbnail2 = JSON.parse(post.extra_metadata);
  const secondThumbnailPath = thumbnail2?.second_thumbnail;
  const fullSecondThumbnailUrl = secondThumbnailPath
    ? createApiImageUrl(secondThumbnailPath, { size: "300" })
    : null;
  return (
    <main className="relative flex min-h-screen flex-col items-center bg-background-primary py-16 sm:px-6 lg:px-8 overflow-x-hidden">
      <article className="relative z-10 w-full max-w-5xl rounded-none sm:rounded-2xl bg-background-secondary/50 shadow-2xl shadow-black/40 backdrop-blur-2xl ring-1 ring-border-primary">
        <div
          className="absolute inset-0 rounded-none sm:rounded-2xl ring-1 ring-inset ring-accent-crystal/10 pointer-events-none"
          aria-hidden="true"
        ></div>
        <header className="relative flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-12 gap-8">
          {fullThumbnailUrl && (
            <div className="group relative h-48 w-48 md:h-56 md:w-56 flex-shrink-0">
              <div className="absolute inset-0 z-0 -m-3 rounded-2xl bg-gradient-to-br from-accent-crystal to-accent-primary opacity-0 blur-xl transition-all duration-700 group-hover:opacity-20 group-hover:blur-2xl"></div>
              <Image
                src={fullThumbnailUrl}
                alt={post.thumbnail_alt || post.title}
                priority
                fill
                className="rounded-2xl shadow-lg shadow-black/60 transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-foreground-primary to-accent-crystal bg-clip-text text-transparent mb-4 leading-tight text-right">
              {post.title}
            </h1>
            {maddah.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-5 justify-center md:justify-start">
                {maddah.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/maddahi/category/${m.slug}`}
                    className="text-sm bg-accent-primary/10 text-accent-primary px-4 py-1.5 rounded-full font-medium transition-all duration-300 border border-transparent hover:border-accent-crystal/50 hover:bg-accent-primary/20 hover:shadow-lg hover:shadow-accent-primary/10"
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
                    className="text-xs text-foreground-secondary transition-colors duration-300 hover:text-accent-crystal hover:underline underline-offset-4"
                  >
                    #{item.name.replace(/\s/g, "_")}
                  </Link>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 text-foreground-secondary">
              <Eye className="w-5 h-5 text-accent-primary/80" />
              <ServerViewCounter postId={parseInt(post.ID)} />
            </div>
          </div>
        </header>
        {post.rozeh === 1 && (
          <section className="px-6 sm:px-8 md:px-12 py-6">
            <div className="flex items-center gap-4 rounded-lg bg-background-tertiary/50 p-4 border-r-4 border-feedback-error">
              <ShieldAlert className="h-8 w-8 flex-shrink-0 text-feedback-error" />
              <div>
                <h3 className="font-bold text-foreground-primary">
                  توجه: این قطعه صوتی حاوی روضه است
                </h3>
                <p className="text-sm text-foreground-secondary">
                  پیشنهاد می‌شود برای حفظ حال معنوی، در شرایط مناسب شنیده شود.
                </p>
              </div>
            </div>
          </section>
        )}
        {post.link && (
          <section className="px-5 flex justify-center items-center py-6">
            <MusicPlayer audioSrc={post.link} />
          </section>
        )}
        {post.video_link && (
          <>
            <SectionDivider />
            <section className="px-6 sm:px-8 md:px-12 py-8">
              <SectionTitle
                icon={<Film />}
                title="نماهنگ و ویدیو"
                className="mb-6"
              />
              <div className="w-full max-w-3xl mx-auto aspect-video bg-background-primary rounded-lg overflow-hidden ring-1 ring-border-primary">
                <ScriptEmbed htmlSnippet={post.video_link} />
              </div>
            </section>
          </>
        )}
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
                  fill
                  src={fullSecondThumbnailUrl}
                  alt={`تصویر دوم برای ${post.title}`}
                  className="rounded-xl shadow-md shadow-black/25 transition-transform duration-500 group-hover:scale-105 ring-1 ring-white/10"
                />
              </div>
            </section>
          </>
        )}
        {moshabeh.length > 0 && (
          <>
            <SectionDivider />
            <section className="py-8 px-1">
              <div className="flex flex-col items-center gap-3 px-6 sm:px-8 md:px-12 mb-6">
                <SectionTitle icon={<Sparkles />} title="از همین مناسبت" />
                <Link
                  href={similarOccasionLink}
                  className="group flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-accent-crystal transition-colors duration-300"
                >
                  <span>مشاهده ی بیشتر از همین مناسبت</span>
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
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
                className="prose ertefae-khat prose-lg prose-invert max-w-none mt-6 text-foreground-secondary prose-headings:text-foreground-primary prose-strong:text-foreground-primary prose-a:text-accent-crystal prose-a:transition-colors hover:prose-a:text-accent-primary prose-blockquote:border-r-accent-primary prose-p:leading-10"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </section>
          </>
        )}
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
                  className="group flex items-center gap-2 text-sm font-medium text-foreground-secondary hover:text-accent-crystal transition-colors duration-300"
                >
                  <span>مشاهده ی بیشتر از همین مداح</span>
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              </div>
              <Slider slides={latestFromMaddah} sliderId="latest-from-maddah" />
            </section>
          </>
        )}
        <div className="border-t border-border-primary bg-background-primary/30 rounded-b-none sm:rounded-b-2xl">
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
                  <CommentThread
                    comments={comments}
                    postId={post.ID}
                    postType="post"
                  />
                ) : (
                  <div className="text-center py-10 px-4 text-foreground-muted bg-background-secondary/50 rounded-lg ring-1 ring-border-secondary">
                    <MessageSquarePlus className="w-10 h-10 mx-auto mb-4 text-accent-primary/50" />
                    <p>هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
                  </div>
                )}
              </div>
              <div
                id="comment-form"
                className="rounded-xl border border-dashed border-border-secondary p-6 bg-background-secondary/50 scroll-mt-20 transition-all duration-300 ring-2 ring-transparent focus-within:ring-accent-primary/50 focus-within:border-solid focus-within:border-accent-primary/30"
              >
                <CommentForm postId={post.ID} postType="post" />
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
      className={`flex items-center justify-center gap-3 text-2xl font-bold text-foreground-primary ${className}`}
    >
      {icon && <span className="text-accent-primary">{icon}</span>}
      <span>{title}</span>
    </h2>
  );
}
function SectionDivider() {
  return (
    <div className="w-1/2 h-px mx-auto bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />
  );
}
