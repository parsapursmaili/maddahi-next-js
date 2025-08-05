// /app/components/admin/PostsList.js
"use client";

import { Search, PlusCircle, ArrowDownUp } from "lucide-react";
import { useRef, useCallback, useEffect } from "react"; // هوک‌های لازم برای IntersectionObserver

export default function PostsList({
  posts,
  selectedPostId,
  isLoading,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onSelectPost,
  onNewPost,
  // --- پراپ‌های جدید برای اسکرول بی‌نهایت ---
  onLoadMore,
  hasMore,
  isFetchingNextPage,
}) {
  const inputClasses =
    "w-full bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";

  // --- منطق IntersectionObserver برای اسکرول بی‌نهایت ---
  const observer = useRef();
  const lastPostElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        // اگر آخرین آیتم قابل مشاهده است و صفحات بیشتری وجود دارد، صفحه بعد را بارگذاری کن
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasMore, onLoadMore]
  );
  // --- پایان منطق IntersectionObserver ---

  return (
    <div className="w-full border-r border-[var(--border-primary)] flex flex-col h-full bg-[var(--background-secondary)]">
      {/* هدر */}
      <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">مدیریت پست‌ها</h2>
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجوی پست..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${inputClasses} pl-10 pr-4 py-2`}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-grow relative">
            <ArrowDownUp
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
              size={16}
            />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={`${inputClasses} appearance-none pl-10 pr-4 py-2 text-sm`}
            >
              <option value="0">جدیدترین</option>
              <option value="2">پربازدیدترین</option>
              <option value="1">تصادفی</option>
            </select>
          </div>
          <button
            onClick={onNewPost}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-md hover:bg-[var(--accent-crystal-highlight)] transition-colors text-sm font-semibold flex-shrink-0"
          >
            <PlusCircle size={16} />
            <span>پست جدید</span>
          </button>
        </div>
      </div>

      {/* لیست */}
      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-[var(--foreground-muted)]">
            در حال بارگذاری...
          </p>
        ) : posts.length === 0 ? (
          <p className="p-4 text-center text-[var(--foreground-muted)]">
            هیچ پستی یافت نشد.
          </p>
        ) : (
          <ul>
            {posts.map((post, index) => {
              // اگر این آخرین پست در لیست است، ref را به آن متصل کن
              const isLastElement = index === posts.length - 1;
              return (
                <li
                  ref={isLastElement ? lastPostElementRef : null}
                  key={`${post.ID}-${index}`} // کلید منحصر به فرد در صورت وجود IDهای تکراری موقت
                  onClick={() => onSelectPost(post)}
                  className={`p-4 border-b border-[var(--border-secondary)] cursor-pointer transition-colors ${
                    selectedPostId === post.ID
                      ? "bg-[var(--accent-primary-faded)]"
                      : "hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  <h3 className="font-semibold text-md truncate">
                    {post.title || "بدون عنوان"}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    ID: {post.ID} - بازدید: {post.view} - وضعیت: {post.status}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {/* نمایش لودر هنگام بارگذاری صفحات بعدی */}
        {isFetchingNextPage && (
          <p className="p-4 text-center text-sm text-[var(--foreground-muted)]">
            در حال بارگذاری موارد بیشتر...
          </p>
        )}
        {/* نمایش پیام پایان لیست */}
        {!hasMore && posts.length > 0 && (
          <p className="p-4 text-center text-xs text-[var(--foreground-muted)]">
            پایان لیست
          </p>
        )}
      </div>
    </div>
  );
}
