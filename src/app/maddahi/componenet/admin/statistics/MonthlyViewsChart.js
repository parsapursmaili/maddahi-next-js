// /app/components/admin/statistics/MonthlyViewsChart.js
"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import CustomTooltip from "./charts/CustomTooltip";

const MonthlyViewsChart = ({ data }) => {
  // ۱. بررسی اولیه و بسیار مهم: اگر داده‌ای وجود ندارد، یک پیام واضح نمایش بده
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-center text-lg text-[var(--foreground-muted)]">
          هنوز هیچ پستی در این ماه بازدیدی نداشته است.
        </p>
      </div>
    );
  }

  // ۲. آماده‌سازی داده‌ها: فقط عنوان‌ها را کوتاه می‌کنیم. بدون دستکاری ترتیب.
  // ترتیب صحیح (پربازدیدترین در بالا) باید از سرور (API) بیاید.
  const chartData = data.map((item) => ({
    ...item,
    shortTitle:
      item.title.length > 30 ? "..." + item.title.substring(0, 30) : item.title,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        // ۳. تنظیم حاشیه (margin) به صورت مستقیم و واضح برای جای دادن لیبل‌های فارسی
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid
          stroke="var(--border-primary)"
          strokeDasharray="3 3"
          horizontal={false}
        />
        <XAxis type="number" stroke="var(--foreground-muted)" hide />
        <YAxis
          dataKey="shortTitle"
          type="category"
          stroke="var(--foreground-secondary)"
          // ۴. مهم‌ترین بخش: استفاده از یک روش پایدار برای نمایش لیبل در سمت راست
          orientation="right"
          tickLine={false}
          axisLine={false}
          // عرض مشخصی را برای لیبل‌ها در نظر می‌گیریم تا نمودار به هم نریزد
          width={150}
          tick={{ dx: -10 }} // کمی فاصله از لبه راست
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(var(--accent-primary-rgb), 0.1)" }}
        />
        <Bar
          dataKey="monthly_views"
          name="بازدید این ماه" // نامی که در Tooltip نمایش داده می‌شود
          fill="var(--accent-primary)"
          radius={[4, 4, 4, 4]} // گرد کردن تمام گوشه‌ها برای زیبایی
          background={{ fill: "var(--background-tertiary)", radius: 4 }}
        >
          {/* این بخش برای نمایش مقدار بازدید روی خود میله‌هاست که خوانایی را بسیار بالا می‌برد */}
          {/* <LabelList dataKey="monthly_views" position="insideRight" fill="var(--background-primary)" fontSize={12} formatter={(value) => value.toLocaleString('fa-IR')} /> */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyViewsChart;
