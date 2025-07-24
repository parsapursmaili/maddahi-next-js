// /app/components/admin/statistics/posts/PostDailyViewsChart.js
"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import CustomTooltip from "@/app/componenet/admin/statistics/charts/CustomTooltip"; // ۱. وارد کردن کامپوننت سفارشی

const PostDailyViewsChart = ({ data }) => {
  // اگر داده‌ای برای نمایش وجود نداشته باشد، یک پیام مناسب نمایش داده می‌شود
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-center text-[var(--foreground-muted)]">
          داده بازدید روزانه برای این پست در ۳۰ روز اخیر ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {/* پس‌زمینه شبکه‌ای نمودار */}
        <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />

        {/* محور افقی (X) که تاریخ را نمایش می‌دهد */}
        <XAxis
          dataKey="date"
          stroke="var(--foreground-muted)"
          tickLine={false}
        />

        {/* محور عمودی (Y) که تعداد بازدید را نمایش می‌دهد */}
        <YAxis
          stroke="var(--foreground-muted)"
          allowDecimals={false}
          tickLine={false}
        />

        {/* ۲. جایگزینی Tooltip پیش‌فرض با کامپوننت سفارشی */}
        <Tooltip content={<CustomTooltip />} />

        {/* تعریف گرادینت زیبا برای پس‌زمینه نمودار */}
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

        {/* نمودار اصلی از نوع Area */}
        <Area
          type="monotone"
          dataKey="view_count"
          name="بازدید روز" // ۳. این نام در Tooltip برای نمایش بهتر استفاده می‌شود
          stroke="var(--accent-crystal-highlight)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorView)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PostDailyViewsChart;
