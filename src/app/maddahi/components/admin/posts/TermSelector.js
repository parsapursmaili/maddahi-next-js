// /app/maddahi/components/admin/posts/TermSelector.js
"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

export default function TermSelector({
  title,
  terms,
  selectedTerms,
  onChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // جداسازی هوشمندانه ترم‌ها به دو گروه انتخاب‌شده و قابل‌انتخاب
  const { selected, available } = useMemo(() => {
    const selectedSet = new Set(selectedTerms);
    const selectedArr = [];
    const availableArr = [];

    terms.forEach((term) => {
      if (selectedSet.has(term.ID)) {
        selectedArr.push(term);
      } else {
        availableArr.push(term);
      }
    });

    const filteredAvailable = availableArr.filter((term) =>
      term.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return { selected: selectedArr, available: filteredAvailable };
  }, [terms, selectedTerms, searchQuery]);

  const handleSelectTerm = (termId) => {
    if (!selectedTerms.includes(termId)) {
      onChange([...selectedTerms, termId]);
    }
  };

  const handleDeselectTerm = (termId) => {
    onChange(selectedTerms.filter((id) => id !== termId));
  };

  const inputClasses =
    "w-full pl-10 pr-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md focus:outline-none focus:border-[var(--accent-primary)] transition-colors text-sm";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)] mb-3";

  return (
    <div className="flex flex-col h-full">
      <label className={labelClasses}>{title}</label>

      {/* نمایش ترم‌های انتخاب‌شده به صورت برچسب (Pill) */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-[var(--border-secondary)]">
          {selected.map((term) => (
            <div
              key={term.ID}
              className="flex items-center gap-2 bg-[var(--accent-primary)] text-black text-xs font-semibold px-2 py-1 rounded-full animate-in fade-in-0"
            >
              <span>{term.name}</span>
              <button
                type="button"
                onClick={() => handleDeselectTerm(term.ID)}
                className="rounded-full hover:bg-black/20 p-0.5 transition-colors"
                aria-label={`حذف ${term.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ورودی جستجو */}
      <div className="relative mb-2 flex-shrink-0">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
          size={16}
        />
        <input
          type="text"
          placeholder={`جستجوی ${title}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={inputClasses}
        />
      </div>

      {/* لیست ترم‌های قابل انتخاب */}
      <div className="flex-grow overflow-y-auto -mr-2 pr-2 h-48">
        {available.length > 0 ? (
          <ul className="space-y-1">
            {available.map((term) => (
              <li key={term.ID}>
                <button
                  type="button"
                  onClick={() => handleSelectTerm(term.ID)}
                  className="w-full text-right text-sm px-3 py-1.5 rounded-md hover:bg-[var(--background-tertiary)] transition-colors text-[var(--foreground-primary)]"
                >
                  {term.name}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-[var(--foreground-muted)] py-4">
            موردی یافت نشد.
          </p>
        )}
      </div>
    </div>
  );
}
