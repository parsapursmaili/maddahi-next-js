// /app/maddahi/components/admin/soogname/SoognameList.js
"use client";

import { Search, PlusCircle } from "lucide-react";
import { useRef, useCallback } from "react";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";

export default function SoognameList({
  items,
  selectedId,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelectItem,
  onNew,
  onLoadMore,
  hasMore,
  isFetchingNextPage,
}) {
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasMore, onLoadMore]
  );

  return (
    <div className="w-full border-r border-[var(--border-primary)] flex flex-col h-full bg-[var(--background-secondary)]">
      <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
        <h2 className="text-xl font-bold mb-4">سوگنامه‌ها</h2>
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="جستجوی عنوان..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] pl-10 pr-4 py-2"
          />
        </div>
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-black rounded-md hover:bg-[var(--accent-crystal-highlight)] transition-colors text-sm font-semibold"
        >
          <PlusCircle size={16} />
          <span>سوگنامه جدید</span>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-[var(--foreground-muted)]">
            در حال بارگذاری...
          </p>
        ) : items.length === 0 ? (
          <p className="p-4 text-center text-[var(--foreground-muted)]">
            موردی یافت نشد.
          </p>
        ) : (
          <ul>
            {items.map((item, index) => {
              const isLastElement = index === items.length - 1;
              return (
                <li
                  ref={isLastElement ? lastElementRef : null}
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`p-4 border-b border-[var(--border-secondary)] cursor-pointer transition-colors ${
                    selectedId === item.id
                      ? "bg-[var(--accent-primary-faded)]"
                      : "hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  <h3 className="font-semibold text-md truncate">
                    {item.title || "بدون عنوان"}
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    تاریخ: {toShamsi(item.date, "jYYYY/jMM/jDD")}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        {isFetchingNextPage && (
          <p className="p-4 text-center text-sm text-[var(--foreground-muted)]">
            ...
          </p>
        )}
        {!hasMore && items.length > 0 && (
          <p className="p-4 text-center text-xs text-[var(--foreground-muted)]">
            پایان لیست
          </p>
        )}
      </div>
    </div>
  );
}
