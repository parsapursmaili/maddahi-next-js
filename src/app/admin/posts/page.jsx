// /app/admin/posts/page.js

import { verifyAdmin } from "@/app/actions/auth"; // اکشن احراز هویت
import PasswordPrompt from "@/app/componenet/admin/terms/PasswordPrompt"; // کامپوننت فرم رمز (مسیر را چک کنید)
import PostsManager from "@/app/componenet/admin/posts/PostsManager"; // کامپوننت کلاینت جدید

// این کامپوننت اصلی، یک Server Component است
export default async function AdminPostsPage() {
  const hasAccess = await verifyAdmin();

  if (!hasAccess) {
    return <PasswordPrompt />;
  }

  // 3. اگر کاربر دسترسی داشت، کامپوننت اصلی مدیریت پست‌ها را رندر می‌کنیم
  // این کامپوننت یک Client Component است که تمام منطق تعاملی را در خود دارد
  return <PostsManager />;
}
