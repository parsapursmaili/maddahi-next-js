// /app/components/admin/statistics/StatisticsDashboard.js (اصلاح‌شده)
"use client";

import Link from "next/link";
import StatCard from "./StatCard";
import ContentGrowthChart from "./ContentGrowthChart";
import TopPostsTable from "./TopPostsTable";
import AllTimeTopPostsTable from "./AllTimeTopPostsTable";
import CategoryPopularityChart from "./CategoryPopularityChart";
import TopEngagementTable from "./TopEngagementTable";
import {
  FileText,
  MessageSquare,
  Eye,
  CalendarClock,
  ArrowLeft,
  Clock,
} from "lucide-react";

const StatisticsDashboard = ({ initialStats }) => {
  const {
    quickStats,
    topPostsLast30Days,
    contentGrowth,
    allTimeTopPosts,
    topCategories,
    topEngagementPosts,
  } = initialStats;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <header>
        <h1 className="text-3xl font-bold">پنل آمار و تحلیل</h1>
        <p className="text-md text-[var(--foreground-secondary)] mt-1">
          نمایی کلی از عملکرد وب‌سایت شما.
        </p>
      </header>

      {/* ★★★ اصلاح: اطمینان از تبدیل مقادیر به عدد قبل از فرمت‌بندی ★★★ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<FileText />}
          title="تعداد پست‌ها"
          value={Number(quickStats.postsCount || 0).toLocaleString("fa-IR")}
        />
        <StatCard
          icon={<MessageSquare />}
          title="کل دیدگاه‌ها"
          value={Number(quickStats.totalCommentsCount || 0).toLocaleString(
            "fa-IR"
          )}
          subtitle={`${Number(
            quickStats.pendingCommentsCount || 0
          ).toLocaleString("fa-IR")} در انتظار`}
        />
        <StatCard
          icon={<CalendarClock />}
          title="بازدید امروز"
          value={Number(quickStats.todaysViews || 0).toLocaleString("fa-IR")}
        />
        <StatCard
          icon={<Eye />}
          title="کل بازدیدها"
          value={Number(quickStats.totalViews || 0).toLocaleString("fa-IR")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* ★★★ تغییر: جابجایی بخش "پربازدیدترین‌های ۳۰ روز اخیر" به بالا ★★★ */}
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                پربازدیدترین‌های ۳۰ روز اخیر
              </h2>
              <Link
                href="/maddahi/admin/statistics/top-posts?range=month"
                className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
              >
                <span>مشاهده همه</span> <ArrowLeft size={16} />
              </Link>
            </div>
            <TopPostsTable data={topPostsLast30Days} />
          </div>

          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock size={20} /> پست‌های درگیرکننده
              </h2>
              <Link
                href="/maddahi/admin/statistics/top-engagement"
                className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
              >
                <span>تحلیل کامل</span> <ArrowLeft size={16} />
              </Link>
            </div>
            <TopEngagementTable data={topEngagementPosts} />
          </div>

          {/* ★★★ تغییر: جابجایی بخش "پربازدیدترین پست‌های تمام دوران" به پایین ★★★ */}
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                پربازدیدترین پست‌های تمام دوران
              </h2>
              <Link
                href="/maddahi/admin/statistics/top-posts?range=all"
                className="flex items-center gap-2 text-sm text-[var(--accent-primary)] hover:underline"
              >
                <span>مشاهده همه</span> <ArrowLeft size={16} />
              </Link>
            </div>
            <AllTimeTopPostsTable data={allTimeTopPosts} />
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
