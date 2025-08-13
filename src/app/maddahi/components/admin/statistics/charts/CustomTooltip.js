// /app/components/admin/statistics/charts/CustomTooltip.js
"use client";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // استخراج نام و مقدار از payload
    const data = payload[0];
    const name = data.name || "مقدار"; // اگر نامی تعریف نشده بود، از یک مقدار پیش‌فرض استفاده کن
    const value = data.value;

    return (
      <div className="bg-[var(--background-tertiary)] p-3 rounded-lg border border-[var(--border-secondary)] shadow-lg text-sm">
        <p className="font-bold text-[var(--foreground-primary)] mb-1">{`${label}`}</p>
        <p className="text-[var(--accent-primary)]">
          <span className="font-semibold">{name}: </span>
          <span>
            {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
