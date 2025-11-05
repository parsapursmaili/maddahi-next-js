// app/posts/[slug]/schema.js (نسخه نهایی و کامل)

import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";

/**
 * تابعی نهایی برای تولید آرایه‌ای از اسکیماهای JSON-LD
 * شامل: BlogPosting (برای مقاله)، AudioObject و VideoObject (برای محتوای مدیا)
 *
 * @param {object} post - آبجکت پست با داده‌های کامل
 * @param {Array<object>} maddah - آرایه مداحان (برای نام نویسنده)
 * @param {string} canonicalUrl - آدرس کامل و متعارف صفحه
 * @returns {Array<object>} - آرایه‌ای از آبجکت‌های اسکیما برای تزریق در متادیتا
 */
export function generatePostSchemas(post, maddah, canonicalUrl) {
  const schemas = [];

  // 1. داده‌های عمومی که در تمام اسکیماها استفاده می‌شوند
  const datePublished = new Date(post.date).toISOString();
  const dateModified = new Date(post.modified_date || post.date).toISOString();
  const authorName = maddah.length > 0 ? maddah[0].name : "نامشخص";
  const postDescription =
    post.description ||
    post.content?.substring(0, 150) ||
    "محتوای این صفحه را مشاهده کنید.";
  const thumbnailUrl = post.thumbnail
    ? `https://besooyeto.ir${createApiImageUrl(post.thumbnail, {
        size: "560x560",
      })}`
    : "https://besooyeto.ir/default-og-image.jpg";
  const logoUrl = "https://besooyeto.ir/favicon.webp"; // آدرس لوگو/فاوآیکون

  // --- A. اسکیما BlogPosting (ماهیت مقاله/نوشته) ---
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline: post.title,
    description: postDescription,
    image: [thumbnailUrl],
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "به سوی تو (Besooyeto)",
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    // حذف تگ‌های HTML از 1000 کاراکتر اول محتوا
    articleBody:
      post.content?.substring(0, 1000).replace(/<[^>]*>?/gm, "") || post.title,
  };

  schemas.push(blogPostingSchema);

  // --- B. اسکیما AudioObject (برای پلیر صوتی) ---
  if (post.link) {
    const audioObjectSchema = {
      "@context": "https://schema.org",
      "@type": "AudioObject",
      name: post.title,
      description: postDescription,
      contentUrl: post.link,
      encodingFormat: "audio/mpeg",
      duration: post.audio_duration || undefined,
      uploadDate: datePublished,
      byArtist: {
        "@type": "Person",
        name: authorName,
      },
      thumbnailUrl: thumbnailUrl,
    };
    schemas.push(audioObjectSchema);
  }

  // --- C. اسکیما VideoObject (برای لینک Embed) ---
  if (post.video_link && post.video_link.trim() !== "") {
    const videoObjectSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: post.title,
      description: postDescription,
      uploadDate: datePublished,
      thumbnailUrl: thumbnailUrl,

      // از embedUrl برای لینک‌های تعبیه شده (Embed) استفاده می‌کنیم
      embedUrl: post.video_link,

      publisher: {
        "@type": "Organization",
        name: "به سوی تو (Besooyeto)",
      },
    };
    schemas.push(videoObjectSchema);
  }

  return schemas;
}
