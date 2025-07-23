// /app/admin/statistics/posts/[id]/page.js
import { isAuthenticated } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { getPostMonthlyStats } from "@/app/actions/getStatistics";
import PostDailyViewsChart from "./PostDailyViewsChart"; // کامپوننت جدید
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function PostStatisticsPage({ params }) {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/login");
  }

  const { id } = params;
  const result = await getPostMonthlyStats(id);

  if (!result.success) {
    return (
      <div className="p-8 text-center text-[var(--error)]">
        <p>{result.message}</p>
        <Link
          href="/admin/statistics"
          className="mt-4 inline-block text-[var(--accent-primary)]"
        >
          بازگشت به پنل آمار
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--background-primary)] text-[var(--foreground-primary)] min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-[var(--foreground-secondary)]">
            آمار روزانه در ۳۰ روز اخیر
          </p>
          <h1
            className="text-3xl font-bold text-ellipsis overflow-hidden whitespace-nowrap"
            title={result.data.title}
          >
            {result.data.title}
          </h1>
        </div>
        <Link
          href="/admin/statistics"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
        >
          <span>بازگشت</span>
          <ArrowRight size={16} />
        </Link>
      </header>

      <main className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)]">
        <div className="h-96">
          <PostDailyViewsChart data={result.data.views} />
        </div>
      </main>
    </div>
  );
}
