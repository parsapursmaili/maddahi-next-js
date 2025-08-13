"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FaFolder,
  FaRegEye,
  FaSearch,
  FaRegArrowAltCircleLeft,
} from "react-icons/fa";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl";

// استایل انیمیشن Shimmer بدون تغییر باقی می‌ماند
const ShimmerStyle = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .shimmer-bg {
      animation: shimmer 2.5s infinite linear;
      background: linear-gradient(
        to right,
        transparent 0%,
        var(--background-tertiary) 50%,
        transparent 100%
      );
      background-size: 2000px 100%;
    }
  `}</style>
);

const listVariants = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// اسکلت لودینگ برای هماهنگی با طراحی ریسپانسیو جدید بروزرسانی شد
const SkeletonItem = () => (
  <motion.li
    variants={itemVariants}
    className="bg-[var(--background-secondary)]/50 rounded-xl p-3 overflow-hidden"
  >
    <div className="flex items-center gap-3 sm:gap-4">
      {/* سایز تصویر در موبایل کوچکتر شده است */}
      <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-[var(--background-secondary)] rounded-lg relative shimmer-bg"></div>
      <div className="flex-grow min-w-0 space-y-2.5 sm:space-y-3">
        <div className="h-5 bg-[var(--background-secondary)] rounded w-3/4 relative shimmer-bg"></div>
        <div className="h-4 bg-[var(--background-secondary)] rounded w-1/2 relative shimmer-bg"></div>
      </div>
      {/* بخش آمار در دسکتاپ نمایش داده می‌شود */}
      <div className="hidden sm:block flex-shrink-0 h-8 bg-[var(--background-secondary)] rounded-full w-24 relative shimmer-bg"></div>
    </div>
  </motion.li>
);

export default function SearchResults({
  query = "",
  results = [],
  totalResults = 0,
  isInitialLoading = false,
}) {
  if (isInitialLoading) {
    return (
      <>
        <ShimmerStyle />
        <motion.ul
          className="space-y-3 sm:space-y-4"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {[...Array(5)].map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </motion.ul>
      </>
    );
  }

  // بهبود ظاهر پیام اولیه با آیکون بزرگتر
  if (query.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 text-[var(--foreground-muted)] flex flex-col items-center gap-5"
      >
        <FaRegArrowAltCircleLeft className="text-6xl opacity-20" />
        <p className="text-lg">برای دیدن نتایج، در کادر بالا جستجو کنید.</p>
      </motion.div>
    );
  }

  // بهبود ظاهر پیام "نتیجه‌ای یافت نشد"
  if (!isInitialLoading && results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 flex flex-col items-center gap-4 text-[var(--foreground-muted)]"
      >
        <FaSearch className="text-6xl opacity-20" />
        <p className="text-xl">
          هیچ نوایی برای «
          <span className="font-semibold text-[var(--foreground-secondary)]">
            {query}
          </span>
          » یافت نشد.
        </p>
        <p className="text-base">
          عبارت دیگری را امتحان کنید یا از املای آن مطمئن شوید.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-[var(--foreground-muted)] mb-4 px-2"
      >
        {totalResults > 0 &&
          `${totalResults.toLocaleString("fa-IR")} نتیجه یافت شد`}
      </motion.div>
      <motion.ul
        className="space-y-3 sm:space-y-4"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {results.map((post) => (
          <PostResultItem key={post.ID} post={post} />
        ))}
      </motion.ul>
    </>
  );
}

// کامپوننت آیتم نتیجه جستجو با طراحی کاملاً ریسپانسیو
function PostResultItem({ post }) {
  const maddahName = post.cat?.[0]?.name;
  const viewCount = post.view
    ? parseInt(post.view).toLocaleString("fa-IR")
    : "۰";

  return (
    <motion.li variants={itemVariants}>
      <Link
        href={`/maddahi/${post.name}`}
        className="block bg-[var(--background-secondary)]/70 rounded-xl p-3 group transition-all duration-300 ease-out hover:bg-[var(--background-tertiary)] hover:shadow-lg hover:shadow-[var(--accent-primary)]/5 hover:translate-y-[-3px] hover:scale-[1.01]"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          {/* ۱. تصویر با سایز ریسپانسیو */}
          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[var(--accent-primary)]/50 transition-all duration-300">
            {post.thumbnail ? (
              <Image
                src={createApiImageUrl(post.thumbnail, { size: "150" })}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-[var(--background-tertiary)] flex items-center justify-center">
                <FaFolder className="w-8 h-8 text-[var(--foreground-muted)]/50" />
              </div>
            )}
          </div>

          {/* ۲. بخش محتوا با قابلیت رشد و جلوگیری از سرریز شدن */}
          <div className="flex-grow min-w-0">
            {/* ۳. عنوان با سایز و برش متن ریسپانسیو */}
            <h3
              className="font-bold text-base sm:text-lg text-[var(--foreground-primary)] transition-colors group-hover:text-[var(--accent-primary)] truncate"
              title={post.title}
            >
              {post.title}
            </h3>
            {/* ۴. نام مداح با سایز ریسپانسیو */}
            {maddahName && (
              <p className="text-sm sm:text-md text-[var(--foreground-secondary)] mt-1 truncate">
                {maddahName}
              </p>
            )}
          </div>

          {/* ۵. بخش آمار و تگ‌ها، در موبایل مخفی و در دسکتاپ بهینه نمایش داده می‌شود */}
          <div className="hidden sm:flex flex-col items-end gap-2.5 ml-2 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
              <FaRegEye />
              <span>{viewCount}</span>
            </div>
            {post.tag && post.tag.length > 0 && (
              <span className="block text-xs font-semibold bg-[var(--background-primary)] text-[var(--foreground-secondary)] px-3 py-1.5 rounded-full">
                {post.tag[0].name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
