// /app/admin/statistics/posts/[id]/page.js
import { isAuthenticated } from "@/app/maddahi/actions/auth";
import { redirect } from "next/navigation";
import { getPostStats } from "@/app/maddahi/actions/getStatistics";
import PostDailyViewsChart from "./PostDailyViewsChart";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function PostStatisticsPage({ params, searchParams }) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/maddahi/login");
  }

  const { id } = params;
  const range = searchParams.range || "daily"; // پیش‌فرض روزانه
  const result = await getPostStats(id, range);

  if (!result.success) {
    return (
      <div className="p-8 text-center text-[var(--error)]">
        <p>{result.message}</p>
        <Link
          href="/maddahi/admin/statistics"
          className="mt-4 inline-block text-[var(--accent-primary)]"
        >
          بازگشت به پنل آمار
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--background-primary)] text-[var(--foreground-primary)] min-h-screen">
      {/* هدر ریسپانسیو */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <p className="text-sm text-[var(--foreground-secondary)]">
            آمار بازدید (
            {range === "daily"
              ? "۳۰ روز اخیر"
              : range === "monthly"
              ? "۱۲ ماه اخیر"
              : range === "quarterly"
              ? "۴ فصل اخیر"
              : "سال‌های اخیر"}
            )
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold truncate"
            title={result.data.title}
          >
            {result.data.title}
          </h1>
        </div>

        <Link
          href="/maddahi/admin/statistics"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors shrink-0"
        >
          <span>بازگشت</span>
          <ArrowRight size={16} />
        </Link>
      </header>

      {/* محتوای اصلی */}
      <main className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
        <div className="h-[28rem]">
          <PostDailyViewsChart
            data={result.data.views}
            postId={id}
            currentRange={range}
          />
        </div>
      </main>
    </div>
  );
}
