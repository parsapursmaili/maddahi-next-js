// /app/components/admin/statistics/StatisticsDashboard.js
"use client";

import Link from "next/link";
import StatCard from "./StatCard";
import ContentGrowthChart from "./ContentGrowthChart";
import TopPostsTable from "./TopPostsTable";
import AllTimeTopPostsTable from "./AllTimeTopPostsTable";
import CategoryPopularityChart from "./CategoryPopularityChart";
import {
  FileText,
  MessageSquare,
  Eye,
  CalendarClock,
  ArrowLeft,
} from "lucide-react"; // آیکون‌های جدید

const StatisticsDashboard = ({ initialStats }) => {
  const {
    quickStats,
    topPostsLast30Days, // نام جدید
    contentGrowth,
    allTimeTopPosts,
    topCategories,
  } = initialStats;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <header>
        <h1 className="text-3xl font-bold">پنل آمار و تحلیل</h1>
        <p className="text-md text-[var(--foreground-secondary)] mt-1">
          نمایی کلی از عملکرد وب‌سایت شما.
        </p>
      </header>

      {/* تغییر ۱: چیدمان و محتوای جدید کارت‌های آمار */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<FileText />}
          title="تعداد پست‌ها"
          value={quickStats.postsCount.toLocaleString("fa-IR")}
        />
        <StatCard
          icon={<MessageSquare />}
          title="کل دیدگاه‌ها"
          value={quickStats.totalCommentsCount.toLocaleString("fa-IR")}
          subtitle={`${quickStats.pendingCommentsCount.toLocaleString(
            "fa-IR"
          )} در انتظار`}
        />
        <StatCard
          icon={<CalendarClock />} // آیکون جدید
          title="بازدید امروز"
          value={quickStats.todaysViews.toLocaleString("fa-IR")}
        />
        <StatCard
          icon={<Eye />}
          title="کل بازدیدها"
          value={quickStats.totalViews.toLocaleString("fa-IR")}
        />
      </div>

      {/* بخش اصلی نمودارها و جداول */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ستون اصلی (بزرگتر) */}
        <div className="lg:col-span-3 space-y-8">
          {/* تغییر ۲: نمودار بازدید ماهانه حذف شد و جدول تمام دوران جای آن را گرفت */}
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                پربازدیدترین پست‌های تمام دوران
              </h2>
              {/* تغییر ۳: دکمه مشاهده همه اضافه شد */}
              <Link
                href="/maddahi/admin/statistics/top-posts?range=all"
                className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
              >
                <span>مشاهده همه</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
            <AllTimeTopPostsTable data={allTimeTopPosts} />
          </div>

          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                پربازدیدترین‌های ۳۰ روز اخیر
              </h2>
              <Link
                href="/maddahi/admin/statistics/top-posts?range=month"
                className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
              >
                <span>مشاهده همه</span>
                <ArrowLeft size={16} />
              </Link>
            </div>
            <TopPostsTable data={topPostsLast30Days} />
          </div>
        </div>

        {/* ستون کناری (کوچکتر) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <h2 className="text-xl font-semibold mb-4">
              روند تولید محتوا (۱۲ ماه)
            </h2>
            <div className="h-60">
              <ContentGrowthChart data={contentGrowth} />
            </div>
          </div>
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <h2 className="text-xl font-semibold mb-4">دسته‌بندی‌های محبوب</h2>
            <div className="h-60">
              <CategoryPopularityChart data={topCategories} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
