// /app/components/admin/posts/TermSelector.js
"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

/**
 * کامپوننت انتخاب‌گر برای دسته‌بندی و تگ با قابلیت جستجو و ظاهر چک‌باکس
 * @param {{
 *  title: string,
 *  terms: Array<{ID: number, name: string}>,
 *  selectedTerms: Array<number>,
 *  onChange: (selectedIds: Array<number>) => void
 * }} props
 */
export default function TermSelector({
  title,
  terms,
  selectedTerms,
  onChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = useMemo(() => {
    if (!searchQuery) return terms;
    return terms.filter((term) =>
      term.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [terms, searchQuery]);

  const handleToggleTerm = (termId) => {
    const newSelected = selectedTerms.includes(termId)
      ? selectedTerms.filter((id) => id !== termId)
      : [...selectedTerms, termId];
    onChange(newSelected);
  };

  const inputClasses =
    "w-full pl-10 pr-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md focus:outline-none focus:border-[var(--accent-primary)] transition-colors";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)] mb-2";

  return (
    <div className="flex flex-col h-full">
      <label className={labelClasses}>{title}</label>
      <div className="relative mb-2">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]"
          size={18}
        />
        <input
          type="text"
          placeholder={`جستجوی ${title}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="flex-grow p-3 border border-[var(--border-secondary)] rounded-md overflow-y-auto bg-[var(--background-primary)]">
        <ul className="space-y-2">
          {filteredTerms.map((term) => (
            <li key={term.ID}>
              <label className="flex items-center space-x-2 space-x-reverse cursor-pointer hover:text-[var(--accent-primary)] transition-colors">
                <input
                  type="checkbox"
                  checked={selectedTerms.includes(term.ID)}
                  onChange={() => handleToggleTerm(term.ID)}
                  className="w-4 h-4 rounded text-[var(--accent-primary)] bg-[var(--background-tertiary)] border-[var(--border-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0"
                />
                <span className="text-sm">{term.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
