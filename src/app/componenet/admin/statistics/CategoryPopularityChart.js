// /app/components/admin/statistics/CategoryPopularityChart.js
"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import CustomTooltip from "./charts/CustomTooltip"; // <-- این خط اضافه می‌شود

const CategoryPopularityChart = ({ data }) => {
  // ... (بقیه کد بدون تغییر)
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <XAxis
          dataKey="name"
          stroke="var(--foreground-muted)"
          tickLine={false}
        />
        <YAxis
          stroke="var(--foreground-muted)"
          tickLine={false}
          allowDecimals={false}
        />

        {/* جایگزینی Tooltip پیش‌فرض با کامپوننت سفارشی */}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(var(--accent-primary-rgb), 0.1)" }}
        />

        <Bar
          dataKey="post_count"
          name="تعداد پست"
          fill="var(--accent-primary)"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryPopularityChart;
