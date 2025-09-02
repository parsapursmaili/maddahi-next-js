// /app/components/admin/statistics/charts/CustomTooltip.js
import React from "react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--background-secondary)] p-3 rounded-lg shadow-md border border-[var(--border-primary)] text-[var(--foreground-primary)] text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="flex items-center">
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: entry.stroke || entry.fill }}
            ></span>
            {entry.name}:{" "}
            <span className="font-bold">
              {Number(entry.value).toLocaleString("fa-IR")}
            </span>
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
