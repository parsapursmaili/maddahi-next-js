import { verifyAdmin } from "@/app/actions/auth"; // <-- از اکشن مرکزی استفاده می‌کنیم
import { getTermsForAdmin } from "@/app/actions/termActions";


import PasswordPrompt from "@/app/componenet/admin/PasswordPrompt";
import TermManager from "@/app/componenet/admin/TermManager";

export default async function AdminPage() {

  const hasAccess = await verifyAdmin();


  if (!hasAccess) {
    return <PasswordPrompt />;
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

  // داده‌ها را به کامپوننت مدیریت ارسال کن
  return <TermManager initialTerms={result.data} />;
}
