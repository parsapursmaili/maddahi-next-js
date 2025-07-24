// /app/components/admin/statistics/AllTimeTopPostsTable.js
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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
              لینک
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
              <td className="p-3 text-center">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[var(--foreground-secondary)] hover:text-[var(--accent-crystal-highlight)] transition-colors"
                  title="مشاهده پست"
                >
                  <ExternalLink size={16} />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllTimeTopPostsTable;
