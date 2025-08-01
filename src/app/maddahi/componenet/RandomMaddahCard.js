import Link from "next/link";
import Image from "next/image";
import { FiMic, FiChevronsLeft } from "react-icons/fi";
import { getTopMaddahs } from "@/app/maddahi/actions/getTopMaddahs";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl"; // ۱. وارد کردن تابع کمکی
import { unstable_noStore as noStore } from "next/cache";

export default async function RandomMaddahCard() {
  noStore();
  const topMaddahs = await getTopMaddahs();

  if (!topMaddahs || topMaddahs.length === 0) {
    return null;
  }

  const maddah = topMaddahs[Math.floor(Math.random() * topMaddahs.length)];
  // ۲. فراخوانی تابع کمکی برای ساخت URL
  const finalImageUrl = createApiImageUrl(maddah.imageUrl, { size: "300" });

  return (
    <section className="container mx-auto px-4 my-12">
      <div className="relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--background-secondary)] to-transparent ring-1 ring-[var(--border-primary)] p-6 sm:p-8">
        <div
          className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-crystal-highlight)] to-[var(--accent-primary)] 
                     opacity-0 group-hover:opacity-25 transition-opacity duration-500 blur-2xl"
          aria-hidden="true"
        ></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
          <div className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-[var(--accent-primary)]/50 to-[var(--success)]/50">
            <div className="w-full h-full bg-[var(--background-primary)] rounded-full flex items-center justify-center overflow-hidden">
              {/* ۳. استفاده از نتیجه در کامپوننت Image */}
              {finalImageUrl ? (
                <Image
                  src={finalImageUrl}
                  alt={`تصویر ${maddah.name}`}
                  width={160} // پراپ‌های width و height برای بهینه‌سازی حفظ شده‌اند
                  height={160}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <FiMic className="text-6xl text-[var(--foreground-muted)]" />
              )}
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)]">
              {maddah.name}
            </h3>
            <p className="text-[var(--foreground-secondary)] mt-3 max-w-prose">
              مجموعه آثار و گلچین بهترین نماهنگ‌های {maddah.name} را مشاهده
              کنید.
            </p>
          </div>
          <div className="flex-shrink-0 mt-6 md:mt-0">
            <Link
              href={`/maddahi/category/${maddah.slug}`}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--accent-primary)] text-white font-semibold transition-transform duration-300 hover:scale-105 shadow-lg shadow-[var(--accent-primary)]/20"
            >
              <span>مشاهده آثار</span>
              <FiChevronsLeft className="text-xl" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
