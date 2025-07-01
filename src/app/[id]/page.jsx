import { db } from "@/app/lib/db/mysql";
import { notFound } from "next/navigation";
import MusicPlayer from "../componenet/singleplayer"; // مطمئن شوید مسیر فایل صحیح است
import Image from "next/image";
import Comment from "@/app/componenet/comments"; // مطمئن شوید مسیر فایل صحیح است

// تولید فراداده (Metadata) برای SEO
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

// کامپوننت اصلی برای صفحه تک پست
export default async function ProductPage({ params }) {
  const id = params.id;

  // واکشی همزمان داده‌های پست، مداح، مناسبت و کامنت‌ها
  const [postRows, maddahRows, monasebatRows, commentsRows] = await Promise.all(
    [
      db.query("SELECT * FROM posts WHERE ID = ?", [id]),
      db.query(
        `SELECT t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'category' WHERE object_id = ?`,
        [id]
      ),
      db.query(
        `SELECT t.name, t.slug FROM wp_term_relationships wtr INNER JOIN terms t ON t.ID = wtr.term_taxonomy_id AND t.taxonomy = 'post_tag' WHERE object_id = ?`,
        [id]
      ),
      // **کوئری جدید برای واکشی کامنت‌ها: فرض بر این است که جدول comments وجود دارد**
      db.query(`SELECT * FROM comments WHERE post_id = ? `, [id]),
    ]
  );

  const post = postRows[0][0];
  const maddah = maddahRows[0];
  const monasebat = monasebatRows[0];
  const comments = commentsRows[0]; // نتیجه کوئری کامنت‌ها

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-gray-950 to-gray-800">
      <article className="w-full max-w-4xl bg-gray-900 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
        {/* بخش هدر پست */}
        <div className="flex flex-col md:flex-row items-center p-6 md:p-10 gap-6">
          {post.thumbnail && (
            <div className="flex-shrink-0 relative w-48 h-48 md:w-60 md:h-60 rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
              <Image
                src={`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumbnail}`}
                alt={post.title || "تصویر بندانگشتی پست"}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          )}
          <div className="flex flex-col items-center md:items-start text-center md:text-right flex-grow mt-4 md:mt-0">
            {/* تغییر سایز عنوان: md:text-3xl برای کوچک‌تر شدن در دسکتاپ */}
            <h1 className="text-3xl md:text-3xl font-extrabold text-white mb-2 leading-tight">
              {post.title}
            </h1>
            {maddah && maddah.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 justify-center md:justify-start">
                {maddah.map((maddahh) => (
                  <a
                    key={maddahh.slug}
                    href={`/category/${maddahh.slug}`}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors duration-200"
                  >
                    {maddahh.name}
                  </a>
                ))}
              </div>
            )}
            {monasebat && monasebat.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {monasebat.map((monasebatItem) => (
                  <a
                    key={monasebatItem.slug}
                    href={`/tag/${monasebatItem.slug}`}
                    className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors duration-200"
                  >
                    {monasebatItem.name}
                  </a>
                ))}
              </div>
            )}
            {post.view && (
              <h3 className="text-gray-400 text-sm">
                بازدید: {post.view.toLocaleString("fa-IR")}
              </h3>
            )}
          </div>
        </div>

        {/* بخش پخش‌کننده موسیقی */}
        {post.link && (
          <div className="px-6 md:px-10 pb-6">
            <MusicPlayer audioSrc={post.link} />
          </div>
        )}

        {/* بخش محتوای پست */}
        <div
          className="prose prose-lg prose-invert max-w-none text-gray-300 leading-relaxed break-words p-6 md:p-10 border-t border-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* بخش نمایش کامنت‌های موجود */}
        {comments && comments.length > 0 && (
          <div className="p-6 md:p-10 border-t border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center md:text-right">
              نظرات ({comments.length.toLocaleString("fa-IR")})
            </h2>
            <div className="space-y-6">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-800 rounded-lg p-5 shadow-md border border-gray-600"
                >
                  <div className="flex items-center mb-3">
                    {/* آواتار ساده با حرف اول اسم */}
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-semibold flex-shrink-0 text-sm">
                      {comment.author_name
                        ? comment.author_name.charAt(0)
                        : "؟"}
                    </span>
                    <div className="mr-4">
                      {" "}
                      {/* از mr-4 استفاده کنید برای فاصله از راست در RTL */}
                      <p className="text-white font-semibold text-lg">
                        {comment.author_name || "کاربر ناشناس"}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(comment.created_at).toLocaleDateString(
                          "fa-IR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-base">
                    {comment.comment_content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* بخش ارسال کامنت جدید (کامپوننت Comment) */}
        <div className="p-6 md:p-10 border-t border-gray-700">
          <Comment postId={id} />
        </div>
      </article>
    </div>
  );
}
