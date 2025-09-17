// /app/components/admin/statistics/posts/PostDailyViewsChart.js
"use client";

import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import CustomTooltip from "@/app/maddahi/components/admin/statistics/charts/CustomTooltip";

const PostDailyViewsChart = ({ data, postId, currentRange }) => {
  const router = useRouter();

  const handleChangeRange = (range) => {
    router.push(`/maddahi/admin/statistics/posts/${postId}?range=${range}`);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full items-center justify-center">
        <div className="flex gap-2">
          {["daily", "monthly", "quarterly", "yearly"].map((r) => (
            <button
              key={r}
              onClick={() => handleChangeRange(r)}
              className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                currentRange === r
                  ? "bg-[var(--accent-primary)] text-white"
                  : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]"
              }`}
            >
              {r === "daily"
                ? "روزانه"
                : r === "monthly"
                ? "ماهانه"
                : r === "quarterly"
                ? "سه ماهه"
                : "سالانه"}
            </button>
          ))}
        </div>
        <p className="text-center text-[var(--foreground-muted)]">
          داده‌ای برای نمایش وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* کنترل انتخاب بازه */}
      <div className="flex justify-center gap-2 text-sm flex-wrap">
        {["daily", "monthly", "quarterly", "yearly"].map((r) => (
          <button
            key={r}
            onClick={() => handleChangeRange(r)}
            className={`px-3 py-1 rounded-md border transition-colors ${
              currentRange === r
                ? "bg-[var(--accent-primary)] text-white"
                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]"
            }`}
          >
            {r === "daily"
              ? "روزانه"
              : r === "monthly"
              ? "ماهانه"
              : r === "quarterly"
              ? "سه ماهه"
              : "سالانه"}
          </button>
        ))}
      </div>

      {/* نمودار */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="var(--foreground-muted)"
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            stroke="var(--foreground-muted)"
            allowDecimals={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--accent-primary)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--accent-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="view_count"
            name="بازدید"
            stroke="var(--accent-crystal-highlight)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorView)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PostDailyViewsChart;
