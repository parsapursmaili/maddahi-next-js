"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaSearch } from "react-icons/fa";
import getPost from "@/app/maddahi/actions/getPost";
import SearchResults from "./SearchResults";

const POSTS_PER_PAGE = 20;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
  exit: { y: -20, opacity: 0 },
};

export default function SearchOverlay({ onClose }) {
  const searchInputRef = useRef(null);
  const observerRef = useRef(null); // Ref برای عنصر نامرئی در انتهای لیست

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    searchInputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const fetchResults = useCallback(async (searchQuery, pageNum) => {
    const data = await getPost({
      s: searchQuery,
      page: pageNum,
      terms: 1,
      view: 1,
      rand: 0,
    });

    if (data && !data.error) {
      setResults((prev) =>
        pageNum === 1 ? data.post : [...prev, ...data.post]
      );
      setTotalResults(data.total);
      setHasMore(data.post.length === POSTS_PER_PAGE);
    } else {
      console.error(data.error || "خطایی در جستجو رخ داد.");
      setResults((prev) => (pageNum === 1 ? [] : prev));
      setHasMore(false);
    }
  }, []);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setTotalResults(0);

    if (query.trim().length < 2) {
      setIsInitialLoading(false);
      return;
    }

    setIsInitialLoading(true);
    const debounceTimer = setTimeout(async () => {
      await fetchResults(query, 1);
      setIsInitialLoading(false);
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchResults]);

  // === 👇 راه حل کلیدی شماره ۱: Infinite Scroll پیش‌فعال 👇 ===
  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        hasMore &&
        !isFetchingNextPage &&
        !isInitialLoading
      ) {
        setIsFetchingNextPage(true);
        const newPage = page + 1;
        setPage(newPage);
        fetchResults(query, newPage).finally(() =>
          setIsFetchingNextPage(false)
        );
      }
    },
    [hasMore, isFetchingNextPage, isInitialLoading, page, query, fetchResults]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      // این آپشن باعث می‌شود آبزرور زمانی فعال شود که 500 پیکسل به ویوپورت مانده باشد
      rootMargin: "0px 0px 500px 0px",
    });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <motion.div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[8vh] md:pt-[12vh] bg-[var(--background-primary)]/80 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          onClick={onClose}
          className="absolute -top-8 -right-1 md:-top-10 md:right-0 text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] transition-colors text-3xl"
          aria-label="بستن جستجو"
          variants={itemVariants}
        >
          <FaTimes />
        </motion.button>

        <motion.div variants={itemVariants} className="relative group">
          <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-2xl md:text-3xl text-[var(--foreground-muted)]/60 pointer-events-none transition-transform duration-300 group-focus-within:scale-110" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="جستجوی نوا، نام مداح یا مناسبت..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-b-2 border-[var(--border-secondary)] focus:border-[var(--accent-primary)] text-3xl md:text-5xl font-bold text-[var(--foreground-primary)] placeholder:text-[var(--foreground-muted)]/50 focus:outline-none py-4 pl-12 pr-4 transition-all duration-300 group-focus-within:border-b-[3px]"
          />
        </motion.div>

        {/* === 👇 راه حل کلیدی شماره ۲: فاصله در انتهای لیست 👇 === */}
        <motion.div
          className="w-full mt-8 pr-2 -mr-2 overflow-y-auto max-h-[75vh] pb-20" // پدینگ پایین برای جلوگیری از چسبندگی
          variants={itemVariants}
        >
          <SearchResults
            query={query}
            results={results}
            totalResults={totalResults}
            isInitialLoading={isInitialLoading}
          />

          {/* کانتینر برای لودر و پیام پایانی */}
          <div
            ref={observerRef}
            className="h-20 flex items-center justify-center text-center"
          >
            {/* لودر حذف شد */}
            {!hasMore && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[var(--foreground-muted)] text-sm"
              >
                <p>شما به انتهای نتایج رسیده‌اید.</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
