// /app/components/admin/statistics/StatisticsDashboard.js
"use client";

import StatCard from "./StatCard";
import MonthlyViewsChart from "./MonthlyViewsChart";
import ContentGrowthChart from "./ContentGrowthChart";
import TopPostsTable from "./TopPostsTable";
import AllTimeTopPostsTable from "./AllTimeTopPostsTable"; // <-- جدید
import CategoryPopularityChart from "./CategoryPopularityChart"; // <-- جدید
import { FileText, MessageSquare, File, Eye, Users } from "lucide-react";

const StatisticsDashboard = ({ initialStats }) => {
  const {
    quickStats,
    topPostsThisMonth,
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

      {/* کارت‌های آمار سریع (کارت نرخ تایید حذف شد) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={<FileText />}
          title="تعداد پست‌ها"
          value={quickStats.postsCount}
        />
        <StatCard
          icon={<File />}
          title="تعداد برگه‌ها"
          value={quickStats.pagesCount}
        />
        <StatCard
          icon={<MessageSquare />}
          title="کل دیدگاه‌ها"
          value={quickStats.totalCommentsCount}
          subtitle={`${quickStats.pendingCommentsCount} در انتظار`}
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
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <h2 className="text-xl font-semibold mb-4">
              پربازدیدترین پست‌های این ماه
            </h2>
            <div className="h-96">
              <MonthlyViewsChart data={topPostsThisMonth} />
            </div>
          </div>
          <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
            <h2 className="text-xl font-semibold mb-4">
              پربازدیدترین پست‌های تمام دوران
            </h2>
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

      <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
        <h2 className="text-xl font-semibold mb-4">
          جزئیات پست‌های پربازدید ماه
        </h2>
        <TopPostsTable data={topPostsThisMonth} />
      </div>
    </div>
  );
};

export default StatisticsDashboard;
