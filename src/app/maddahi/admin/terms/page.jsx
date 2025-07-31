// /app/admin/terms/page.js

import { isAuthenticated } from "@/app/maddahi/actions/auth"; // <-- استفاده از اکشن جدید و استاندارد
import { redirect } from "next/navigation"; // <-- ایمپورت redirect برای هدایت کاربر
import { getTermsForAdmin } from "@/app/maddahi/actions/termActions";
import TermManager from "@/app/maddahi/componenet/admin/terms/TermManager";

export default async function AdminPage() {
  // ۱. وضعیت احراز هویت را بررسی می‌کنیم
  const isAuth = await isAuthenticated();

  // ۲. اگر کاربر احراز هویت نشده بود، او را به صفحه ورود هدایت می‌کنیم
  if (!isAuth) {
    redirect("/maddahi/login");
  }

  // اگر کاربر احراز هویت شده بود، ادامه بده...
  const result = await getTermsForAdmin();

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--error)]">{result.message}</p>
      </div>
    );
  }

  return <TermManager initialTerms={result.data} />;
}
