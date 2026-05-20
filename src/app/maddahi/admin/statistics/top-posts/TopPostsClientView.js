"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getPaginatedTopPosts,
  getFirstRecordDate,
} from "@/app/maddahi/actions/getStatistics";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";
import {
  ExternalLink,
  LineChart,
  Loader2,
  TrendingUp,
  Calendar,
  Info,
  Search,
  X,
} from "lucide-react";
import moment from "jalali-moment";

// کامپوننت‌های کمکی
const PostListItem = ({ post, index }) => (
  <tr className="border-b border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors">
    <td className="p-3 text-center text-sm text-[var(--foreground-muted)]">
      {index + 1}
    </td>
    <td className="p-4 text-sm text-[var(--foreground-primary)] font-medium">
      {post.title}
    </td>
    <td className="p-4 text-center text-sm font-bold text-[var(--accent-primary)]">
      {Number(post.views || 0).toLocaleString("fa-IR")}
    </td>
    <td className="p-4">
      <div className="flex items-center justify-center space-x-4 space-x-reverse">
        <Link
          href={`/maddahi/admin/statistics/posts/${post.ID}`}
          className="flex items-center gap-1 text-xs text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
          title="نمودار جزئیات"
        >
          <LineChart size={14} />
          <span>نمودار</span>
        </Link>
        <a
          href={`/maddahi/${post.name}`}
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

// ★★★ بازطراحی کامل کارت آمار برای ظاهری مینیمال و خوانا ★★★
const TotalViewsCard = ({ totalViews, rangeLabel, dateRange }) => {
  let dateText = "";
  if (dateRange?.from && dateRange?.to) {
    if (dateRange.from === dateRange.to) {
      dateText = toShamsi(dateRange.from, "dddd jD jMMMM jYYYY");
    } else {
      const fromDate = toShamsi(dateRange.from, "dddd jD jMMMM");
      const toDate = toShamsi(dateRange.to, "dddd jD jMMMM jYYYY");
      dateText = `از ${fromDate} تا ${toDate}`;
    }
  }

  return (
    <div className="bg-[var(--background-secondary)] p-5 rounded-lg border border-[var(--border-primary)] flex items-start gap-6">
      <div className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] p-4 rounded-full mt-1">
        <TrendingUp size={28} />
      </div>
      <div className="flex-1">
        <p className="text-lg font-semibold text-[var(--foreground-primary)]">
          مجموع بازدید برای &quot;{rangeLabel}&quot;
        </p>
        <p className="text-xs text-[var(--foreground-secondary)] mt-1">
          {dateText}
        </p>
        <p className="text-3xl font-bold text-[var(--foreground-primary)] mt-2">
          {Number(totalViews || 0).toLocaleString("fa-IR")}
        </p>
      </div>
    </div>
  );
};

// ★★★ کامپوننت هوشمند و کوچک برای ورود تاریخ ★★★
function DateInput({ label, value, onChange, onTodayClick, placeholder }) {
  const [dayOfWeek, setDayOfWeek] = useState("");

  useEffect(() => {
    if (!value || value.length < 10) {
      setDayOfWeek("");
      return;
    }
    const momentDate = moment.from(value, "fa", "jYYYY/jMM/jDD");
    if (momentDate.isValid()) {
      setDayOfWeek(momentDate.locale("fa").format("dddd")); // ★★★ تضمین فارسی بودن
    } else {
      setDayOfWeek("تاریخ نامعتبر");
    }
  }, [value]);

  return (
    <div className="flex-1 min-w-[180px]">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-[var(--foreground-secondary)]">
          {label}
        </label>
        {onTodayClick && (
          <button
            onClick={onTodayClick}
            className="text-xs text-[var(--accent-primary)] hover:underline"
          >
            امروز
          </button>
        )}
      </div>
      <p
        className={`text-xs h-5 mb-1 text-center ${
          dayOfWeek === "تاریخ نامعتبر"
            ? "text-red-500"
            : "text-[var(--foreground-muted)]"
        }`}
      >
        {dayOfWeek || "\u00A0"}
      </p>
      <input
        type="text"
        dir="ltr"
        className="w-full p-2 rounded-md bg-[var(--background-primary)] border border-[var(--border-secondary)] text-center tracking-widest"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

function StatisticsView({ initialRange }) {
  const [range, setRange] = useState(initialRange);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [firstRecordDate, setFirstRecordDate] = useState("");

  const [gregorianDateRange, setGregorianDateRange] = useState({
    from: null,
    to: null,
  });
  const [serverReportedDateRange, setServerReportedDateRange] = useState({
    from: null,
    to: null,
  });

  // ★★★ State جدید برای کنترل UI انتخاب بازه سفارشی ★★★
  const [isCustomRangeActive, setCustomRangeActive] = useState(false);
  const [tempShamsiDates, setTempShamsiDates] = useState({ from: "", to: "" });

  const loaderRef = useRef(null);

  const fetchPosts = useCallback(async (newRange, newPage, newDateRange) => {
    setLoading(true);
    const params = {
      range: newRange,
      page: newPage,
      startDate: newDateRange?.from,
      endDate: newDateRange?.to,
    };
    const res = await getPaginatedTopPosts(params);
    if (res.success && res.data) {
      setPosts((prev) =>
        newPage === 1 ? res.data.posts : [...prev, ...res.data.posts]
      );
      setTotalViews(res.data.totalViews);
      setHasMore(res.hasMore);
      setServerReportedDateRange({
        from: res.data.startDate,
        to: res.data.endDate,
      });
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }, []);

  const handleRangeChange = useCallback(
    (newRange) => {
      setCustomRangeActive(false);
      setRange(newRange);
      setPage(1);
      setPosts([]);
      setGregorianDateRange({ from: null, to: null });
      fetchPosts(newRange, 1, null);
    },
    [fetchPosts]
  );

  const handleCustomRangeApply = useCallback(() => {
    const fromMoment = moment.from(tempShamsiDates.from, "fa", "jYYYY/jMM/jDD");
    const toMoment = moment.from(tempShamsiDates.to, "fa", "jYYYY/jMM/jDD");
    if (
      !fromMoment.isValid() ||
      !toMoment.isValid() ||
      fromMoment.isAfter(toMoment)
    ) {
      // می‌توان در آینده پیام خطای بهتری نشان داد
      return;
    }
    const gregorianDates = {
      from: fromMoment.format("YYYY-MM-DD"),
      to: toMoment.format("YYYY-MM-DD"),
    };
    setRange("custom");
    setGregorianDateRange(gregorianDates);
    setPage(1);
    setPosts([]);
    fetchPosts("custom", 1, gregorianDates);
  }, [fetchPosts, tempShamsiDates]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(range, nextPage, gregorianDateRange);
  }, [loading, hasMore, page, fetchPosts, range, gregorianDateRange]);

  useEffect(() => {
    const todayShamsi = toShamsi(new Date(), "jYYYY/jMM/jDD");
    setTempShamsiDates({ from: todayShamsi, to: todayShamsi });

    getFirstRecordDate().then((res) => {
      if (res.success && res.data) {
        setFirstRecordDate(toShamsi(res.data, "jD jMMMM jYYYY"));
      }
    });
    fetchPosts(initialRange, 1, null);
  }, [initialRange, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMore]);

  const rangeOptions = [
    { key: "day", label: "امروز" },
    { key: "yesterday", label: "دیروز" },
    { key: "week", label: "هفته اخیر" },
    { key: "month", label: "ماه اخیر" },
    { key: "year", label: "سال اخیر" },
    { key: "all", label: "تمام دوران" },
  ];
  const currentRangeLabel =
    range === "custom"
      ? "بازه سفارشی"
      : rangeOptions.find((opt) => opt.key === range)?.label;

  return (
    <div className="space-y-4">
      {firstRecordDate && (
        <div className="text-center text-xs text-[var(--foreground-muted)] flex items-center justify-center gap-2">
          {" "}
          <Info size={14} /> <span>شروع ثبت آمار از: {firstRecordDate}</span>{" "}
        </div>
      )}

      {/* ★★★ بازطراحی کامل بخش کنترل‌ها ★★★ */}
      <div className="p-2 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] space-y-2">
        <div className="flex flex-wrap gap-2">
          {!isCustomRangeActive && (
            <>
              {rangeOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleRangeChange(opt.key)}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex-grow ${
                    range === opt.key
                      ? "bg-[var(--accent-primary)] text-white shadow-md"
                      : "hover:bg-[var(--background-tertiary)]"
                  }`}
                >
                  {" "}
                  {opt.label}{" "}
                </button>
              ))}
              <button
                onClick={() => setCustomRangeActive(true)}
                className={`w-full md:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  range === "custom"
                    ? "bg-[var(--accent-primary)] text-white shadow-md"
                    : "hover:bg-[var(--background-tertiary)]"
                }`}
              >
                {" "}
                <Calendar size={16} /> <span>انتخاب بازه</span>{" "}
              </button>
            </>
          )}
        </div>
        {isCustomRangeActive && (
          <div className="flex flex-wrap items-end gap-2 p-2">
            <DateInput
              label="از تاریخ"
              value={tempShamsiDates.from}
              onChange={(e) =>
                setTempShamsiDates((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
              placeholder="۱۴۰۴/۰۱/۰۱"
            />
            <DateInput
              label="تا تاریخ"
              value={tempShamsiDates.to}
              onChange={(e) =>
                setTempShamsiDates((prev) => ({ ...prev, to: e.target.value }))
              }
              onTodayClick={() =>
                setTempShamsiDates((prev) => ({
                  ...prev,
                  to: toShamsi(new Date(), "jYYYY/jMM/jDD"),
                }))
              }
              placeholder="۱۴۰۴/۱۲/۲۹"
            />
            <div className="flex gap-2 pt-5">
              <button
                onClick={handleCustomRangeApply}
                className="p-2 bg-[var(--accent-primary)] text-white rounded-md hover:bg-[var(--accent-primary-hover)] transition-colors"
                title="اعمال بازه"
              >
                <Search size={20} />
              </button>
              <button
                onClick={() => setCustomRangeActive(false)}
                className="p-2 bg-[var(--background-tertiary)] text-[var(--foreground-primary)] rounded-md hover:bg-[var(--border-primary)] transition-colors"
                title="لغو"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
        </div>
      ) : (
        <>
          {(posts.length > 0 || totalViews > 0) && (
            <TotalViewsCard
              totalViews={totalViews}
              rangeLabel={currentRangeLabel}
              dateRange={serverReportedDateRange}
            />
          )}
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
            <div
              ref={loaderRef}
              className="flex justify-center items-center h-20"
            >
              {loading && page > 1 && (
                <Loader2 className="animate-spin text-[var(--accent-primary)]" />
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-sm text-[var(--foreground-muted)]">
                  به انتهای لیست رسیدید.
                </p>
              )}
              {!loading && posts.length === 0 && (
                <p className="text-sm text-[var(--foreground-muted)]">
                  هیچ پستی در این بازه زمانی یافت نشد.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TopPostsClientView() {
  const searchParams = useSearchParams();
  const initialRange = searchParams.get("range") || "month";
  return <StatisticsView initialRange={initialRange} />;
}
