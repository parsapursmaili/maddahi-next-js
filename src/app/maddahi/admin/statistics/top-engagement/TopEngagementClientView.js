// /app/maddahi/admin/statistics/top-engagement/TopEngagementClientView.js (فایل جدید)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getPaginatedEngagementPosts } from "@/app/maddahi/actions/getStatistics";
import { Loader2 } from "lucide-react";

// تابع کمکی برای فرمت کردن ثانیه به دقیقه:ثانیه
const formatTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds === null) return "۰۰:۰۰";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const PostListItem = ({ post, index }) => (
  <tr className="border-b border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors">
    <td className="p-3 text-center text-[var(--foreground-muted)]">
      {index + 1}
    </td>
    <td className="p-4 text-[var(--foreground-primary)] font-medium">
      {post.title}
    </td>
    <td className="p-4 text-center font-mono text-[var(--foreground-muted)]">
      {Number(post.total_views).toLocaleString("fa-IR")}
    </td>
    <td className="p-4 text-center font-mono text-[var(--foreground-muted)]">
      {Number(post.log_count).toLocaleString("fa-IR")}
    </td>
    <td className="p-4 text-center font-mono text-[var(--foreground-primary)]">
      {formatTime(post.total_time)}
    </td>
    <td className="p-4 text-center font-mono text-[var(--accent-primary)] font-bold">
      {formatTime(post.average_time)}
    </td>
  </tr>
);

export default function TopEngagementClientView() {
  const [sortBy, setSortBy] = useState("avg_desc");
  const [minViews, setMinViews] = useState("");
  const [debouncedMinViews, setDebouncedMinViews] = useState(0);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  // Debounce برای فیلد حداقل بازدید
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMinViews(Number(minViews) || 0);
    }, 500); // ۵۰۰ میلی‌ثانیه تاخیر

    return () => {
      clearTimeout(handler);
    };
  }, [minViews]);

  const fetchPosts = useCallback(
    async (currentPage, currentSortBy, currentMinViews) => {
      if (loading && currentPage > 1) return; // اجازه لود اولیه حتی اگر لودینگ باشد
      setLoading(true);
      const res = await getPaginatedEngagementPosts({
        sortBy: currentSortBy,
        minViews: currentMinViews,
        page: currentPage,
      });
      if (res.success && res.data) {
        setPosts((prev) =>
          currentPage === 1 ? res.data : [...prev, ...res.data]
        );
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    },
    [loading]
  );

  // واکشی مجدد هنگام تغییر فیلترها
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, sortBy, debouncedMinViews);
  }, [sortBy, debouncedMinViews]);

  // منطق اسکرول بی‌نهایت
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchPosts(nextPage, sortBy, debouncedMinViews);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [hasMore, loading, fetchPosts, sortBy, debouncedMinViews]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)]">
        <div>
          <label
            htmlFor="sort-by"
            className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
          >
            مرتب‌سازی بر اساس
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[var(--background-primary)] p-2 rounded-md border border-[var(--border-secondary)]"
          >
            <option value="avg_desc">بیشترین میانگین زمان</option>
            <option value="avg_asc">کمترین میانگین زمان</option>
            <option value="total_time_desc">بیشترین مجموع زمان</option>
            <option value="log_count_desc">بیشترین دفعات ثبت</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="min-views"
            className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1"
          >
            حداقل بازدید کل
          </label>
          <input
            type="number"
            id="min-views"
            value={minViews}
            onChange={(e) => setMinViews(e.target.value)}
            placeholder="مثلا: 100"
            className="w-full bg-[var(--background-primary)] p-2 rounded-md border border-[var(--border-secondary)]"
          />
        </div>
      </div>

      <div className="bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="border-b border-[var(--border-secondary)]">
              <tr>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  #
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)]">
                  عنوان
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  بازدید کل
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  دفعات ثبت
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  مجموع زمان
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  میانگین
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <PostListItem key={post.ID} post={post} index={index} />
              ))}
            </tbody>
          </table>
        </div>
        <div ref={loaderRef} className="flex justify-center items-center h-20">
          {loading && (
            <Loader2 className="animate-spin text-[var(--accent-primary)]" />
          )}
          {!loading && !hasMore && posts.length > 0 && (
            <p className="text-[var(--foreground-muted)]">
              به انتهای لیست رسیدید.
            </p>
          )}
          {!loading && posts.length === 0 && (
            <p className="text-[var(--foreground-muted)]">
              هیچ پستی با این فیلترها یافت نشد.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
