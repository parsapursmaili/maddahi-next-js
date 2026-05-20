"use client";

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
  ScrollText,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/posts", label: "پست‌ها", icon: FileText },
  { href: "/admin/soogname", label: "سوگنامه", icon: ScrollText },
  { href: "/admin/comments", label: "دیدگاه‌ها", icon: MessageSquare },
  { href: "/admin/terms", label: "دسته‌بندی‌ها", icon: Tags },
  { href: "/admin/statistics", label: "آمار", icon: BarChartBig },
];

export default function AdminToolbar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.refresh();
    });
  };

  return (
    <div className="h-12 bg-black border-b border-[var(--accent-primary)]/40 shadow-lg shadow-[var(--accent-primary)]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            {/* این لینک در حالت موبایل مخفی و در دسکتاپ نمایش داده می‌شود */}
            <Link
              href="/maddahi/admin"
              className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-primary)] font-semibold"
            >
              <ShieldCheck
                className="text-[var(--accent-crystal-highlight)]"
                size={18}
              />
              <span>پنل مدیریت</span>
            </Link>
            {/* این جداکننده نیز فقط در دسکتاپ نمایش داده می‌شود */}
            <div className="w-px h-5 bg-[var(--border-secondary)] hidden sm:block"></div>
            <nav className="flex items-center gap-3">
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
