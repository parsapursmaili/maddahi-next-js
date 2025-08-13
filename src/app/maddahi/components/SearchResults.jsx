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
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl"; // ۱. وارد کردن تابع کمکی

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

const SkeletonItem = () => (
  <motion.li
    variants={itemVariants}
    className="bg-[var(--background-secondary)]/50 rounded-xl p-3 overflow-hidden"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-20 h-20 bg-[var(--background-secondary)] rounded-lg relative shimmer-bg"></div>
      <div className="flex-grow min-w-0 space-y-3">
        <div className="h-5 bg-[var(--background-secondary)] rounded w-3/4 relative shimmer-bg"></div>
        <div className="h-4 bg-[var(--background-secondary)] rounded w-1/2 relative shimmer-bg"></div>
      </div>
      <div className="hidden sm:block h-8 bg-[var(--background-secondary)] rounded-full w-24 relative shimmer-bg"></div>
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
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {[...Array(4)].map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </motion.ul>
      </>
    );
  }

  if (query.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 text-[var(--foreground-muted)] flex flex-col items-center gap-4"
      >
        <FaRegArrowAltCircleLeft className="text-5xl opacity-30" />
        <p>برای دیدن نتایج، در کادر بالا جستجو کنید.</p>
      </motion.div>
    );
  }

  if (!isInitialLoading && results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 flex flex-col items-center gap-4 text-[var(--foreground-muted)]"
      >
        <FaSearch className="text-5xl opacity-30" />
        <p className="text-lg">
          هیچ نوایی برای «
          <span className="font-semibold text-[var(--foreground-secondary)]">
            {query}
          </span>
          » یافت نشد.
        </p>
        <p className="text-sm">
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
        className="space-y-4"
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
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 border-transparent group-hover:border-[var(--accent-primary)]/50 transition-all duration-300">
            {post.thumbnail ? (
              <Image
                src={createApiImageUrl(post.thumbnail, { size: "150" })}
                alt={post.title}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-[var(--background-tertiary)] flex items-center justify-center">
                <FaFolder className="w-8 h-8 text-[var(--foreground-muted)]/50" />
              </div>
            )}
          </div>
          <div className="flex-grow min-w-0">
            <h3
              className="font-bold text-lg text-[var(--foreground-primary)] mb-1.5 transition-colors group-hover:text-[var(--accent-primary)]"
              title={post.title}
            >
              {post.title}
            </h3>
            {maddahName && (
              <p className="text-md text-[var(--foreground-secondary)]">
                {maddahName}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2.5 ml-4 self-center">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
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
