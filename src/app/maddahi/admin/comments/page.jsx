import { isAuthenticated } from "@/app/maddahi/actions/auth"; // فرض بر اینکه این فایل را دارید
import { redirect } from "next/navigation";
import { getCommentsForAdmin } from "@/app/maddahi/actions/commentActions";
import CommentManager from "@/app/maddahi/componenet/admin/comments/CommentManager";
import { AlertTriangle } from "lucide-react";
export default async function AdminCommentsPage() {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/login");
  }

  const result = await getCommentsForAdmin();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <AlertTriangle className="w-16 h-16 text-[var(--error)] mb-4" />
        <h2 className="text-2xl font-bold text-[var(--foreground-primary)] mb-2">
          خطا در بارگذاری
        </h2>
        <p className="text-[var(--foreground-secondary)]">{result.message}</p>
      </div>
    );
  }

  return <CommentManager initialComments={result.data} />;
}
