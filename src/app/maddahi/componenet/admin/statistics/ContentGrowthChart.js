// /app/components/admin/statistics/ContentGrowthChart.js
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import CustomTooltip from "./charts/CustomTooltip"; // <-- این خط اضافه می‌شود

// <<<<<<< کد const CustomTooltip که اینجا بود باید کاملاً حذف شود >>>>>>>>>

const ContentGrowthChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
      >
        <CartesianGrid stroke="var(--border-primary)" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          stroke="var(--foreground-muted)"
          tickLine={false}
        />
        <YAxis
          stroke="var(--foreground-muted)"
          allowDecimals={false}
          tickLine={false}
        />
        {/* اینجا بدون تغییر باقی می‌ماند */}
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "var(--accent-primary)",
            strokeWidth: 1,
            strokeDasharray: "3 3",
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="تعداد پست"
          stroke="var(--accent-crystal-highlight)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--accent-primary)" }}
          activeDot={{ r: 8, stroke: "var(--accent-crystal-highlight)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ContentGrowthChart;
