// /app/componenet/admin/AdminToolbar.js
"use client"; // برای مدیریت رویداد کلیک و استفاده از هوک‌ها

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/maddahi/actions/auth";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Tags,
  BarChartBig,
  LogOut,
  ShieldCheck,
} from "lucide-react";

// لینک‌های نوار ابزار
const adminLinks = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/posts", label: "پست‌ها", icon: FileText },
  { href: "/admin/comments", label: "دیدگاه‌ها", icon: MessageSquare },
  { href: "/admin/terms", label: "دسته‌بندی‌ها", icon: Tags },
  { href: "/admin/statistics", label: "آمار", icon: BarChartBig },
];

export default function AdminToolbar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      // ۱. سرور اکشن را برای حذف کوکی صدا می‌زنیم
      await logout();

      // ۲. صفحه را رفرش می‌کنیم. Next.js به طور خودکار لایوت را دوباره رندر می‌کند
      // و چون دیگر لاگین نیستید، این نوار ابزار نمایش داده نخواهد شد.
      // این بهترین و تمیزترین راه برای به‌روزرسانی UI پس از لاگ‌اوت است.
      router.refresh();
    });
  };

  return (
    <div className="h-12 bg-black border-b border-[var(--accent-primary)]/40 shadow-lg shadow-[var(--accent-primary)]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* بخش راست: لینک‌های سریع */}
          <div className="flex items-center gap-4">
            <Link
              href="/maddahi/admin"
              className="flex items-center gap-2 text-sm text-[var(--foreground-primary)] font-semibold"
            >
              <ShieldCheck
                className="text-[var(--accent-crystal-highlight)]"
                size={18}
              />
              <span>پنل مدیریت</span>
            </Link>
            <div className="w-px h-5 bg-[var(--border-secondary)] hidden sm:block"></div>
            <nav className="hidden sm:flex items-center gap-3">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/maddahi${link.href}`}
                  title={link.label}
                  className="text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors"
                >
                  <link.icon size={18} />
                </Link>
              ))}
            </nav>
          </div>

          {/* بخش چپ: دکمه خروج */}
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md text-[var(--foreground-secondary)] hover:text-[var(--error)] bg-[var(--background-secondary)]/50 hover:bg-[var(--error)]/10 border border-[var(--border-primary)] hover:border-[var(--error)]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">
              {isPending ? "در حال خروج..." : "خروج"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
