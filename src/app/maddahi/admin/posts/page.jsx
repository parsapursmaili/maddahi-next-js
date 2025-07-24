// /app/admin/posts/page.js

import { isAuthenticated } from "@/app/maddahi/actions/auth"; // <-- اکشن احراز هویت جدید
import { redirect } from "next/navigation"; // <-- ایمپورت redirect
import PostsManager from "@/app/maddahi/componenet/admin/posts/PostsManager";

export default async function AdminPostsPage() {
  // ۱. بررسی وضعیت لاگین
  const isAuth = await isAuthenticated();

  // ۲. هدایت کاربر لاگین نکرده به صفحه ورود
  if (!isAuth) {
    redirect("/login");
  }

  // ۳. اگر کاربر دسترسی داشت، کامپوننت اصلی را رندر می‌کنیم
  return <PostsManager />;
}
