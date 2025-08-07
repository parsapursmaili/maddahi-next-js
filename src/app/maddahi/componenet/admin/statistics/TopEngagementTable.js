// /app/components/admin/statistics/TopEngagementTable.js (فایل جدید)
import Link from "next/link";

// تابع کمکی برای فرمت کردن ثانیه به دقیقه:ثانیه
const formatTime = (totalSeconds) => {
  if (isNaN(totalSeconds) || totalSeconds === null) return "۰۰:۰۰";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
};

const TopEngagementTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-[var(--foreground-muted)] py-8">
        هنوز داده زمانی کافی برای نمایش وجود ندارد.
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
              دفعات ثبت
            </th>
            <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
              مجموع زمان
            </th>
            <th className="p-3 text-sm font-semibold text-[var(--foreground-secondary)] text-center">
              میانگین
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
              <td className="p-3 text-center font-mono text-[var(--foreground-muted)]">
                {Number(post.log_count).toLocaleString("fa-IR")}
              </td>
              <td className="p-3 text-center font-mono text-[var(--foreground-primary)]">
                {formatTime(post.total_time)}
              </td>
              <td className="p-3 text-center font-mono text-[var(--accent-primary)] font-bold">
                {formatTime(post.average_time)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopEngagementTable;
