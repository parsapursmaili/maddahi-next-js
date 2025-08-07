// /app/maddahi/admin/statistics/top-engagement/page.js (فایل جدید)
import { Suspense } from "react";
import TopEngagementClientView from "./TopEngagementClientView";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-20 text-[var(--foreground-muted)]">
      <Loader2 className="w-10 h-10 animate-spin text-[var(--accent-primary)]" />
      <p className="mt-4 text-lg">در حال بارگذاری داده‌ها...</p>
    </div>
  );
}

export default function TopEngagementPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-[var(--background-primary)] text-[var(--foreground-primary)]">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">تحلیل تعامل زمانی پست‌ها</h1>
        <p className="text-md text-[var(--foreground-secondary)]">
          پست‌های خود را بر اساس میزان درگیرکنندگی کاربران مرتب و فیلتر کنید.
        </p>
      </header>
      <Suspense fallback={<LoadingFallback />}>
        <TopEngagementClientView />
      </Suspense>
    </div>
  );
}
