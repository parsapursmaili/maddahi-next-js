// /app/maddahi/components/admin/soogname/SoognameManager.js
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { BookText } from "lucide-react";

import SoognameForm from "./SoognameForm";
import SoognameList from "./SoognameList";
import {
  getAdminSoogname,
  getSoognameById,
} from "@/app/maddahi/actions/soognameActions";

export default function SoognameManager() {
  const [soognames, setSoognames] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [listIsLoading, startTransition] = useTransition();
  const [isFormLoading, setIsFormLoading] = useState(false);

  const fetchSoognames = useCallback(
    (currentPage, isSearchChange = false) => {
      if (listIsLoading || (!hasMore && !isSearchChange)) return;

      startTransition(async () => {
        const result = await getAdminSoogname({
          s: searchQuery,
          page: currentPage,
        });

        if (result.data) {
          if (isSearchChange) {
            setSoognames(result.data);
          } else {
            setSoognames((prev) => [...prev, ...result.data]);
          }
          setHasMore(result.hasMore);
        }
      });
    },
    [searchQuery, listIsLoading, hasMore]
  );

  useEffect(() => {
    setSoognames([]);
    setPage(1);
    setHasMore(true);
    fetchSoognames(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (hasMore && !listIsLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSoognames(nextPage);
    }
  };

  const handleSelectItem = async (itemSummary) => {
    if (selected?.id === itemSummary.id) return;
    setIsFormLoading(true);
    setSelected(null);
    // چون getSoognameById یک شیء پیش‌فرض است، باید به صورت getSoognameById.default فراخوانی شود
    const fullData = await getSoognameById(itemSummary.id);
    if (fullData) {
      setSelected(fullData);
    } else {
      setSelected(null);
    }
    setIsFormLoading(false);
  };

  const handleCancel = () => setSelected(null);
  const handleNew = () => setSelected({}); // An empty object signifies a new item

  const handleFormSubmit = (submitted) => {
    setSoognames([]);
    setPage(1);
    setHasMore(true);
    fetchSoognames(1, true);

    if (submitted.deleted) {
      setSelected(null);
    } else {
      setSelected(submitted);
    }
  };

  return (
    <main className="flex w-full h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)] overflow-hidden">
      <div
        className={`h-full flex-col border-l border-[var(--border-primary)] transition-transform duration-300 ease-in-out w-full md:w-[320px] lg:w-[360px] md:flex-shrink-0 ${
          selected ? "hidden md:flex" : "flex"
        }`}
      >
        <SoognameList
          items={soognames}
          selectedId={selected?.id}
          isLoading={listIsLoading && page === 1}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectItem={handleSelectItem}
          onNew={handleNew}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isFetchingNextPage={listIsLoading && page > 1}
        />
      </div>
      <div
        className={`h-full flex flex-col flex-1 ${
          selected ? "flex" : "hidden md:flex"
        }`}
      >
        {isFormLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[var(--foreground-muted)] p-8">
            <p>در حال بارگذاری اطلاعات...</p>
          </div>
        ) : selected ? (
          <SoognameForm
            key={selected.id || "new"}
            initialData={selected}
            onFormSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <div className="flex-col items-center justify-center h-full text-center text-[var(--foreground-muted)] p-8 hidden md:flex">
            <BookText size={64} className="mb-4" />
            <h3 className="text-xl font-bold text-[var(--foreground-primary)]">
              مدیریت سوگنامه‌ها
            </h3>
            <p className="mt-2">
              برای شروع، یک مورد را از لیست انتخاب کنید یا یک{" "}
              <button
                onClick={handleNew}
                className="text-[var(--accent-primary)] font-semibold hover:underline"
              >
                سوگنامه جدید
              </button>{" "}
              ایجاد کنید.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
