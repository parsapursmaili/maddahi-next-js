// /app/admin/statistics/page.js
import { isAuthenticated } from "@/app/maddahi/actions/auth"; // مسیر را مطابق پروژه خود تنظیم کنید
import { redirect } from "next/navigation";
import { getDashboardStatistics } from "@/app/maddahi/actions/getStatistics";
import StatisticsDashboard from "@/app/maddahi/componenet/admin/statistics/StatisticsDashboard";

export const metadata = {
  title: "پنل آمار",
};

export default async function StatisticsPage() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/maddahi/login"); // یا هر صفحه لاگین دیگری که دارید
  }

  const statsResult = await getDashboardStatistics();

  if (!statsResult.success) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--error)]">
        <p>{statsResult.message}</p>
      </div>
    );
  }

  return <StatisticsDashboard initialStats={statsResult.data} />;
}
