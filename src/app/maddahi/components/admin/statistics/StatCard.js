// /app/components/admin/statistics/StatCard.js
const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-[var(--background-secondary)] p-4 rounded-lg border border-[var(--border-primary)] flex flex-col justify-between hover:bg-[var(--background-tertiary)] transition-colors">
      <div className="flex items-center justify-between text-[var(--foreground-secondary)]">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="text-[var(--accent-crystal-highlight)]">{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--foreground-primary)] mt-2">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--foreground-muted)]">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
