import Link from "next/link";
import Image from "next/image";
import { FiMic, FiChevronsLeft } from "react-icons/fi";
import { db } from "@/app/maddahi/lib/db/mysql"; // مسیر دیتابیس خود را چک کنید

async function fetchRandomMaddah() {
  const uploadsPath = process.env.NEXT_PUBLIC_UPLOADS_BASE_PATH || "/uploads";

  try {
    // این کوئری یک مداح (taxonomy='category') را به صورت تصادفی انتخاب می‌کند
    const [maddahResult] = await db.query(
      `SELECT t.name, t.slug, tm.image_url 
       FROM terms AS t 
       LEFT JOIN terms_metadata AS tm ON t.ID = tm.term_id 
       WHERE t.taxonomy = 'category' 
       ORDER BY RAND() 
       LIMIT 1`
    );

    if (!maddahResult || maddahResult.length === 0) {
      return null;
    }

    const maddah = maddahResult[0];

    // ساخت URL کامل برای تصویر
    const fullImageUrl = maddah.image_url
      ? `http://localhost:3000/uploads/${maddah.image_url}` // آدرس را مطابق با ساختار خود تنظیم کنید
      : null;

    return {
      name: maddah.name,
      slug: maddah.slug,
      imageUrl: fullImageUrl,
    };
  } catch (error) {
    console.error("Failed to fetch random maddah:", error);
    return null;
  }
}

export default async function RandomMaddahCard() {
  const maddah = await fetchRandomMaddah();

  if (!maddah) {
    return null; // اگر مداحی یافت نشد، چیزی رندر نکن
  }

  return (
    <section className="container mx-auto px-4 my-12">
      <div className="relative rounded-2xl overflow-hidden group p-6 sm:p-8 bg-gradient-to-br from-[var(--background-secondary)] to-transparent ring-1 ring-[var(--border-primary)]">
        {/* Decorative background glow */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] via-[var(--success)] to-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
          {/* تصویر مداح */}
          <div className="relative flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-[var(--accent-primary)]/50 to-[var(--success)]/50">
            <div className="w-full h-full bg-[var(--background-primary)] rounded-full flex items-center justify-center overflow-hidden">
              {maddah.imageUrl ? (
                <Image
                  src={maddah.imageUrl}
                  alt={`تصویر ${maddah.name}`}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <FiMic className="text-6xl text-[var(--foreground-muted)]" />
              )}
            </div>
          </div>

          {/* اطلاعات و لینک */}
          <div className="flex-grow">
            <h3 className="text-2xl sm:text-3xl font-bold text-[var(--foreground-primary)] mt-2">
              {maddah.name}
            </h3>
            <p className="text-[var(--foreground-secondary)] mt-3 max-w-prose">
              مجموعه آثار و گلچین بهترین نماهنگ‌های {maddah.name} را مشاهده
              کنید.
            </p>
          </div>

          {/* دکمه فراخوان */}
          <div className="flex-shrink-0 mt-4 md:mt-0">
            <Link
              href={`/maddah/${maddah.slug}`}
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
