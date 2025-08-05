/**
 * URL کامل API را برای دریافت یک تصویر بر اساس مسیر نسبی آن می‌سازد.
 * این تابع مرکزی برای استفاده در سراسر پروژه است.
 *
 * @param {string | null | undefined} relativePath - مسیر نسبی فایل در پوشه storage (مثلاً '2025/07/my-image.webp').
 * @param {object} [options] - گزینه‌های اضافی.
 * @param {string} [options.size] - سایز تصویر مورد نظر (مانند '150x150', '300x300').
 * @param {boolean} [options.bustCache=false] - آیا یک پارامتر برای جلوگیری از کش اضافه شود یا خیر.
 * @returns {string | null} - URL کامل API یا null اگر مسیر ورودی نامعتبر باشد.
 */
export function createApiImageUrl(
  relativePath,
  { size, bustCache = false } = {}
) {
  // اگر مسیر ورودی وجود نداشته باشد، null برگردان تا از خطای تصویر شکسته جلوگیری شود.
  if (!relativePath) {
    return null;
  }

  // مسیر را به بخش‌های سال، ماه و نام فایل تقسیم کن.
  const pathParts = relativePath.split("/");
  if (pathParts.length < 3) {
    console.error("Invalid image path provided:", relativePath);
    return null; // مسیر باید حداقل شامل سال/ماه/فایل باشد.
  }

  const year = pathParts[0];
  const month = pathParts[1];
  // مدیریت نام فایل‌هایی که ممکن است خودشان شامل '/' باشند (برای پوشه‌های تودرتو).
  const fileName = pathParts.slice(2).join("/");

  // استفاده از URLSearchParams برای ساخت query string به صورت امن و تمیز.
  const params = new URLSearchParams();
  params.append("year", year);
  params.append("month", month);
  params.append("fileName", fileName);

  if (size) {
    params.append("size", size);
  }

  if (bustCache) {
    params.append("t", new Date().getTime().toString());
  }

  return `/maddahi/api/getimg?${params.toString()}`;
}
