// app/posts/[slug]/schema.js

/**
 * تابعی برای تولید اسکیما BlogPosting به فرمت JSON-LD
 *
 * @param {object} post - آبجکت اصلی پست (شامل title, content, date, modified_date, slug, thumbnail)
 * @param {Array<object>} maddah - آرایه مداحان
 * @param {string} canonicalUrl - آدرس کامل و متعارف صفحه
 * @returns {object} - آبجکت اسکیما
 */
export function generateBlogPostingSchema(post, maddah, canonicalUrl) {
  const datePublished = new Date(post.date).toISOString();
  // از تاریخ انتشار یا تاریخ ویرایش برای modified_date استفاده می‌کنیم
  const dateModified = new Date(post.modified_date || post.date).toISOString();
  const authorName = maddah.length > 0 ? maddah[0].name : "نامشخص";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: post.title, // عنوان اصلی
    description:
      post.description ||
      post.content?.substring(0, 150) ||
      "محتوای این صفحه را مشاهده کنید.", // توضیحات
    image: [
      `https://besooyeto.ir${
        post.thumbnail
          ? createApiImageUrl(post.thumbnail, { size: "560x560" })
          : "/default-og-image.jpg"
      }`, // URL تصویر شاخص کامل
    ],
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      "@type": "Person",
      name: authorName, // نام مداح به عنوان نویسنده
    },
    publisher: {
      "@type": "Organization",
      name: "به سوی تو (Besooyeto)", // نام سایت
      logo: {
        "@type": "ImageObject",
        url: "https://besooyeto.ir/favicon.webp", // آدرس لوگوی سایت شما
      },
    },
    // برای پرهیز از کدهای HTML، 500 کاراکتر اول محتوا را می‌آوریم
    articleBody:
      post.content?.substring(0, 500).replace(/<[^>]*>?/gm, "") || post.title,
    // فیلدهای مرتبط با محتوای چندرسانه‌ای
    // اگر لینک صوتی وجود دارد، آن را به عنوان یک مدیا آبجکت معرفی می‌کنیم
    ...(post.link && {
      encodingFormat: "audio/mpeg",
      contentUrl: post.link,
    }),
    ...(post.video_link && {
      encodingFormat: "video/mp4",
      contentUrl: post.video_link, // باید لینک مستقیم ویدیو باشد، نه تگ iframe!
    }),
  };

  return schema;
}
