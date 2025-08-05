// /app/admin/page.js

import { isAuthenticated } from "@/app/maddahi/actions/auth";
import { redirect } from "next/navigation";
import { getAdminStats } from "@/app/maddahi/actions/getAdminStats";
import "./admin.css";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Tags,
  FileSignature,
  Users,
  AlertTriangle,
  BarChartBig, // آیکون جدید و مناسب‌تر برای آمار
  ArrowUpRight, // آیکون بهتر برای لینک خارجی
} from "lucide-react";

// ====================================================================
// کامپوننت کارت آمار بازطراحی شده
// ====================================================================
const StatCard = ({ icon, title, value, description }) => (
  <div className="group relative bg-[var(--background-secondary)] p-5 rounded-xl border border-[var(--border-primary)] transition-all duration-300 ease-in-out hover:border-[var(--accent-crystal-highlight)]/50">
    {/* افکت نورانی در بالا کارت در زمان هاور */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-[linear-gradient(to_right,transparent,var(--accent-crystal-highlight),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

    <div className="flex items-start justify-between">
      <div className="flex flex-col">
        <p className="text-sm font-medium text-[var(--foreground-secondary)] mb-2">
          {title}
        </p>
        <p className="text-3xl font-bold text-[var(--foreground-primary)]">
          {value}
        </p>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          {description}
        </p>
      </div>
      <div className="p-3 bg-[var(--background-tertiary)]/50 rounded-lg border border-transparent group-hover:border-[var(--border-secondary)] transition-colors">
        {icon}
      </div>
    </div>
  </div>
);

// ====================================================================
// کامپوننت کارت لینک‌های اصلی (Bento Grid) بازطراحی شده
// ====================================================================
const NavLinkCard = ({ href, icon, title, description, className = "" }) => (
  <Link
    href={href}
    className={`group relative flex flex-col justify-between p-6 bg-[var(--background-secondary)] rounded-2xl border border-[var(--border-primary)] transition-all duration-300 overflow-hidden hover:border-[var(--accent-primary)]/70 hover:shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.1)] ${className}`}
  >
    {/* افکت نور پس‌زمینه که در هاور بزرگ می‌شود */}
    <div className="absolute -bottom-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(var(--accent-primary-rgb),0.1)_0%,transparent_35%)] opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-in-out"></div>

    <div className="relative z-10 flex justify-between items-start">
      <div>
        <h3 className="text-2xl font-bold text-[var(--foreground-primary)] mb-2">
          {title}
        </h3>
        <p className="text-[var(--foreground-secondary)] max-w-xs">
          {description}
        </p>
      </div>
      <div className="text-[var(--foreground-muted)] transition-colors duration-300 group-hover:text-[var(--accent-primary)]">
        {icon}
      </div>
    </div>
    <div className="relative z-10 text-right text-sm text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-end gap-2 mt-4">
      ورود به بخش
      <ArrowUpRight size={16} />
    </div>
  </Link>
);

export default async function AdminDashboardPage() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/login");
  }

  const statsResult = await getAdminStats();

  if (!statsResult.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-16 h-16 text-[var(--error)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground-primary)] mb-2">
          خطا در بارگذاری آمار
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          {statsResult.message}
        </p>
      </div>
    );
  }

  const stats = statsResult.data;

  return (
    // افزودن کلاس برای پس‌زمینه آئورا
    <div className="min-h-screen bg-[var(--background-primary)] text-[var(--foreground-primary)] p-4 sm:p-6 lg:p-8 aurora-background">
      <div className="max-w-7xl mx-auto">
        {/* هدر صفحه */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-9 h-9 text-[var(--accent-primary)]" />
            <h1 className="text-4xl font-bold tracking-tight">
              داشبورد مدیریت
            </h1>
          </div>
          <p className="text-[var(--foreground-secondary)]">
            نمای کلی از وضعیت سایت و دسترسی سریع به بخش‌های مهم
          </p>
        </header>

        {/* بخش آمار کلی */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-6 text-[var(--foreground-secondary)] border-b border-[var(--border-primary)] pb-3">
            آمار کلی
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <StatCard
              icon={
                <FileText
                  size={24}
                  className="text-[var(--foreground-muted)]"
                />
              }
              title="تعداد پست‌ها"
              value={stats.postsCount.toLocaleString("fa-IR")}
              description="نوشته‌های منتشر شده"
            />
            <StatCard
              icon={
                <FileSignature
                  size={24}
                  className="text-[var(--foreground-muted)]"
                />
              }
              title="تعداد برگه‌ها"
              value={stats.pagesCount.toLocaleString("fa-IR")}
              description="صفحات ثابت سایت"
            />
            <StatCard
              icon={
                <MessageSquare
                  size={24}
                  className="text-[var(--foreground-muted)]"
                />
              }
              title="کل دیدگاه‌ها"
              value={stats.totalCommentsCount.toLocaleString("fa-IR")}
              description="مجموع تمام نظرات"
            />
            <StatCard
              icon={<AlertTriangle size={24} className="text-[var(--error)]" />}
              title="دیدگاه‌های در انتظار"
              value={stats.pendingCommentsCount.toLocaleString("fa-IR")}
              description="نیازمند تایید شما"
            />
            <StatCard
              icon={
                <Tags size={24} className="text-[var(--foreground-muted)]" />
              }
              title="دسته‌بندی و برچسب"
              value={stats.termsCount.toLocaleString("fa-IR")}
              description="مجموع دسته‌ها و تگ‌ها"
            />
          </div>
        </section>

        {/* بخش لینک‌های اصلی با چیدمان Bento */}
        <section>
          <h2 className="text-xl font-semibold mb-6 text-[var(--foreground-secondary)] border-b border-[var(--border-primary)] pb-3">
            دسترسی سریع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NavLinkCard
              href="/maddahi/admin/posts"
              icon={<FileText size={32} />}
              title="مدیریت پست‌ها"
              description="ایجاد، ویرایش و حذف نوشته‌ها و برگه‌های سایت."
              className="lg:col-span-2" // این کارت دو ستون را در نمایشگر بزرگ اشغال می‌کند
            />
            <NavLinkCard
              href="/maddahi/admin/statistics" // لینک جدید به صفحه آمار
              icon={<BarChartBig size={32} />}
              title="آمار و تحلیل"
              description="مشاهده آمار بازدید، محتوا و کاربران."
            />
            <NavLinkCard
              href="/maddahi/admin/comments"
              icon={<MessageSquare size={32} />}
              title="مدیریت دیدگاه‌ها"
              description="بررسی، تایید و پاسخ به نظرات کاربران."
            />
            <NavLinkCard
              href="/maddahi/admin/terms"
              icon={<Tags size={32} />}
              title="مدیریت دسته‌بندی‌ها"
              description="سازماندهی دسته‌بندی‌ها و برچسب‌های محتوا."
              className="lg:col-span-2" // این کارت هم دو ستون را اشغال می‌کند
            />
          </div>
        </section>
      </div>
    </div>
  );
}
