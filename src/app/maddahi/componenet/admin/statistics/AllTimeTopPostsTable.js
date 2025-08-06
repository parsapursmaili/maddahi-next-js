// /app/components/admin/statistics/AllTimeTopPostsTable.js
import Link from "next/link";
import { ExternalLink, LineChart } from "lucide-react"; // آیکون نمودار اضافه شد

const AllTimeTopPostsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-[var(--foreground-muted)] py-8">
        داده‌ای برای نمایش وجود ندارد.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right">
        <thead className="border-b border-[var(--border-secondary)]">
          <tr>
            <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)]">
              عنوان پست
            </th>
            <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
              کل بازدیدها
            </th>
            <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((post) => (
            <tr
              key={post.ID}
              className="border-b border-[var(--border-primary)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <td className="p-3 text-[var(--foreground-primary)] font-medium">
                {post.title}
              </td>
              <td className="p-3 text-center font-mono text-[var(--accent-primary)] font-bold">
                {post.total_views.toLocaleString("fa-IR")}
              </td>
              {/* تغییر: اضافه شدن لینک به نمودار و حفظ لینک اصلی */}
              <td className="p-3">
                <div className="flex items-center justify-center space-x-4 space-x-reverse">
                  <Link
                    href={`/maddahi/admin/statistics/posts/${post.ID}`}
                    className="flex items-center gap-1 text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
                    title="نمودار جزئیات این پست"
                  >
                    <LineChart size={14} />
                    <span>نمودار</span>
                  </Link>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
                    title="مشاهده پست"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllTimeTopPostsTable;
