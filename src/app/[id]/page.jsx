import { db } from "@/app/lib/db/mysql";
import { notFound } from "next/navigation";
import MusicPlayer from "../componenet/singleplayer";
import Image from "next/image";
import Comment from "@/app/componenet/comments";
import Slider from "@/app/componenet/slider";
import ServerViewCounter from "@/app/componenet/incview";
export const revalidate = 6000;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const id = params.id;
  const [rows] = await db.query("SELECT * FROM posts WHERE ID = ?", [id]);

  if (!rows || rows.length === 0) {
    return {
      title: "صفحه یافت نشد",
      description: "محتوایی برای این شناسه یافت نشد.",
    };
  }

  const post = rows[0];
  const defaultDescription =
    post.content?.substring(0, 150) || "محتوایی برای این صفحه در دسترس نیست.";
  const defaultKeywords = post.title?.split(" ").join(",") || "";
  const imageUrl = post.thumbnail
    ? `https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`
    : "/default-og-image.jpg";

  return {
    title: post.title || "عنوان نامشخص",
    description: post.excerpt || defaultDescription,
    keywords: post.tags?.split(",").join(",") || defaultKeywords,
    openGraph: {
      title: post.title || "عنوان نامشخص",
      description: post.excerpt || defaultDescription,
      images: [imageUrl],
      url: `https://besooyeto.ir/posts/${post.id}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title || "عنوان نامشخص",
      description: post.excerpt || defaultDescription,
      images: [imageUrl],
    },
  };
}

// کامپوننت اصلی صفحه - نسخه نهایی با استایلینگ پیشرفته و مدرن
export default async function ProductPage({ params }) {
  const id = params.id;

  const [postRows, maddahRows, monasebatRows, commentsRows] = await Promise.all(
    [
      db.query("SELECT * FROM posts WHERE ID = ?", [id]),
      db.query(
        `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'category' WHERE object_id = ?`,
        [id]
      ),
      db.query(
        `SELECT t.ID, t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'post_tag' WHERE object_id = ?`,
        [id]
      ),
      [], //db.query(`SELECT * FROM comments WHERE post_id = ?`, [id]),
    ]
  );

  const post = postRows[0][0];
  const maddah = maddahRows[0];
  const monasebat = monasebatRows[0]; // این هنوز آرایه ای از آبجکت هاست

  const comments = commentsRows[0];

  const monasebatIds = monasebat.map((tag) => tag.ID);

  let moshabeh = [];
  if (monasebatIds.length > 0) {
    [moshabeh] = await db.query(
      `
      SELECT DISTINCT
          p.*
      FROM
          posts AS p
      JOIN
          wp_term_relationships AS wtr ON p.ID = wtr.object_id
      WHERE
          wtr.term_taxonomy_id IN (?)
          AND p.ID != ?
      ORDER BY
          RAND()
      LIMIT 20; -- تعداد دلخواه پست‌های مشابه را محدود کنید
    `,
      [monasebatIds[0], id]
    );
  }

  if (!post) {
    notFound();
  }

  return (
    // پس‌زمینه بهبودیافته: گرادیانت فضایی تیره و جذاب
    <div className="flex min-h-screen flex-col items-center bg-gray-900 bg-gradient-to-b from-gray-900 to-slate-900 py-16 px-4 sm:px-6 lg:px-8">
      {/* کانتینر اصلی با حداکثر عرض و موقعیت‌دهی نسبی */}
      <article className="relative w-full max-w-5xl rounded-2xl bg-slate-800/50 shadow-2xl shadow-cyan-500/10 backdrop-blur-lg ring-1 ring-white/10 overflow-hidden">
        {/* بخش هدر پست */}
        <div className="flex flex-col md:flex-row items-center p-6 sm:p-8 md:p-10 gap-8">
          {post.thumbnail && (
            // کانتینر تصویر با افکت درخشش هاور
            <div className="group relative h-52 w-52 md:h-64 md:w-64 flex-shrink-0">
              <div className="absolute inset-0 z-0 -m-3 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 opacity-20 blur-xl transition-all duration-700 group-hover:opacity-30 group-hover:blur-2xl"></div>
              <Image
                src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                alt={post.title || "تصویر بندانگشتی پست"}
                layout="fill"
                objectFit="cover"
                priority
                className="rounded-2xl shadow-lg shadow-black/50 transition-transform duration-500 ease-in-out group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-right flex-grow mt-4 md:mt-0">
            {/* عنوان اصلی با فونت سنگین و گرادیانت متنی */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent mb-4 leading-tight">
              {post.title}
            </h1>
            {maddah && maddah.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                {maddah.map((maddahh) => (
                  // تگ‌های دسته‌بندی با استایل کپسولی و هاور جذاب
                  <a
                    key={maddahh.slug}
                    href={`/category/${maddahh.slug}`}
                    className="text-sm bg-sky-500/10 text-sky-300 px-4 py-1.5 rounded-full font-medium transition-all duration-300 border border-sky-500/30 hover:bg-sky-500/20 hover:border-sky-500/50 hover:shadow-md hover:shadow-sky-500/10"
                  >
                    {maddahh.name}
                  </a>
                ))}
              </div>
            )}
            {monasebat && monasebat.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 justify-center md:justify-start">
                {monasebat.map((monasebatItem) => (
                  // تگ‌های مناسبت با استایل ساده‌تر و هاور آندرلاین
                  <a
                    key={monasebatItem.slug}
                    href={`/tag/${monasebatItem.slug}`}
                    className="text-xs text-indigo-300/80 transition-colors duration-200 hover:text-indigo-300 hover:underline underline-offset-4"
                  >
                    #{monasebatItem.name.replace(/\s/g, "_")}
                  </a>
                ))}
              </div>
            )}
            <ServerViewCounter postId={parseInt(id)} />
          </div>
        </div>

        {post.link && (
          <div className="flex items-center justify-center p-4">
            <MusicPlayer audioSrc={post.link} />
          </div>
        )}
        <div className="mt-10">
          <Slider slides={moshabeh} />
        </div>
        {/* محتوای پست با استایل‌دهی بهتر برای خوانایی */}
        {post.content && (
          <div
            className="prose prose-lg prose-invert max-w-none p-6 sm:p-8 md:p-10 border-t border-white/10
                           prose-p:text-slate-300 prose-p:leading-8 
                           prose-a:text-sky-400 prose-a:transition-colors hover:prose-a:text-sky-300 prose-a:font-semibold
                           prose-strong:text-slate-100
                           prose-li:marker:text-sky-400
                           prose-blockquote:border-r-4 prose-blockquote:border-sky-500/80 prose-blockquote:pr-4 prose-blockquote:text-slate-400 prose-blockquote:font-normal prose-blockquote:bg-slate-900/40 prose-blockquote:rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* بخش نظرات با طراحی جدید */}
        <div className="p-6 sm:p-8 md:p-10 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            {comments && comments.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-8 text-center md:text-right">
                  نظرات ({comments.length.toLocaleString("fa-IR")})
                </h2>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group flex gap-4">
                      {/* آواتار کاربر با گرادیانت */}
                      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xl font-bold text-white ring-2 ring-white/20">
                        {comment.author_name
                          ? comment.author_name.charAt(0)
                          : "؟"}
                      </span>
                      <div className="flex-grow rounded-xl bg-slate-900/60 p-4 border border-white/10 transition-colors duration-300 group-hover:border-sky-500/40">
                        <div className="flex items-baseline justify-between mb-2">
                          <p className="font-semibold text-sky-300 text-base">
                            {comment.author_name || "کاربر ناشناس"}
                          </p>
                          <p className="text-gray-500 text-xs font-mono">
                            {new Date(comment.created_at).toLocaleDateString(
                              "fa-IR",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </p>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                          {comment.comment_content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* کانتینر فرم ارسال نظر با پس‌زمینه و حاشیه متمایز */}
            <div className="rounded-xl border border-dashed border-gray-700 p-6 bg-slate-900/30">
              <Comment postId={id} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
