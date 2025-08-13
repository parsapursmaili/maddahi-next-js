// /app/maddahi/components/admin/CollapsibleSection.js
import { ChevronUp } from "lucide-react";

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-[var(--border-secondary)] rounded-lg bg-[var(--background-primary)]">
    <h3 className="border-b border-[var(--border-secondary)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-sm font-semibold text-[var(--foreground-primary)]"
      >
        <span>{title}</span>
        <ChevronUp
          size={18}
          className={`transition-transform duration-200 ${
            !isOpen && "rotate-180"
          }`}
        />
      </button>
    </h3>
    {/* محتوا فقط زمانی نمایش داده می‌شود که isOpen برابر با true باشد */}
    {isOpen && <div className="p-4 space-y-6">{children}</div>}
  </div>
);

export default CollapsibleSection;
