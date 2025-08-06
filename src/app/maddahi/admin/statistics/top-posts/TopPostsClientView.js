// /app/maddahi/admin/statistics/top-posts/TopPostsClientView.js (فایل جدید)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getPaginatedTopPosts } from "@/app/maddahi/actions/getStatistics";
import { ExternalLink, LineChart, Loader2 } from "lucide-react";

// کامپوننت برای نمایش آیتم‌های لیست
const PostListItem = ({ post, index }) => (
  <tr className="border-b border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors">
    <td className="p-3 text-center text-[var(--foreground-muted)]">
      {index + 1}
    </td>
    <td className="p-4 text-[var(--foreground-primary)] font-medium">
      {post.title}
    </td>
    <td className="p-4 text-center font-mono text-[var(--accent-primary)] font-bold">
      {post.views.toLocaleString("fa-IR")}
    </td>
    <td className="p-4">
      <div className="flex items-center justify-center space-x-4 space-x-reverse">
        <Link
          href={`/maddahi/admin/statistics/posts/${post.ID}`}
          className="flex items-center gap-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
          title="نمودار جزئیات"
        >
          <LineChart size={14} />
          <span>نمودار</span>
        </Link>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
          title="مشاهده پست"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </td>
  </tr>
);

export default function TopPostsClientView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialRange = searchParams.get("range") || "month";

  const [range, setRange] = useState(initialRange);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef(null);

  const fetchPosts = useCallback(
    async (currentPage, currentRange) => {
      if (loading) return;
      setLoading(true);
      const res = await getPaginatedTopPosts({
        range: currentRange,
        page: currentPage,
      });
      if (res.success && res.data) {
        setPosts((prevPosts) =>
          currentPage === 1 ? res.data : [...prevPosts, ...res.data]
        );
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
      setLoading(false);
    },
    [loading]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, range);
    router.replace(`${pathname}?range=${range}`);
  }, [range]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchPosts(nextPage, range);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    const currentLoaderRef = loaderRef.current;
    if (currentLoaderRef) {
      observer.observe(currentLoaderRef);
    }

    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [hasMore, loading, fetchPosts, range]);

  const rangeOptions = [
    { key: "day", label: "امروز" },
    { key: "week", label: "هفته اخیر" },
    { key: "month", label: "ماه اخیر" },
    { key: "year", label: "سال اخیر" },
    { key: "all", label: "تمام دوران" },
  ];

  return (
    <>
      {/* فیلتر زمانی */}
      <div className="flex items-center justify-center bg-[var(--background-secondary)] p-2 rounded-lg border border-[var(--border-primary)] gap-2">
        {rangeOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setRange(opt.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors w-full ${
              range === opt.key
                ? "bg-[var(--accent-primary)] text-white"
                : "hover:bg-[var(--background-tertiary)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* جدول پست‌ها */}
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
                  بازدید
                </th>
                <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post, index) => (
                <PostListItem
                  key={`${post.ID}-${index}`}
                  post={post}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* نشانگر بارگذاری و انتهای لیست */}
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
              هیچ پستی در این بازه زمانی یافت نشد.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
