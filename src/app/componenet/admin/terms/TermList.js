// /components/admin/TermList.js
export default function TermList({ terms, onSelectTerm, selectedTermId }) {
  if (!terms || terms.length === 0) {
    return (
      <p className="text-center text-[var(--foreground-muted)] mt-8">
        موردی یافت نشد.
      </p>
    );
  }

  return (
    <div
      className="max-h-[60vh] overflow-y-auto pr-2 -mr-2"
      style={{ scrollbarWidth: "thin" }}
    >
      <ul className="space-y-2">
        {terms.map((term) => (
          <li key={term.ID}>
            <button
              onClick={() => onSelectTerm(term)}
              className={`w-full text-right p-4 rounded-md transition-all duration-200 border clip-shard-left ${
                selectedTermId === term.ID
                  ? "bg-[var(--accent-primary)] text-black border-[var(--accent-crystal-highlight)]"
                  : "bg-[var(--background-tertiary)] hover:bg-[var(--background-primary)] border-[var(--border-primary)]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{term.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    selectedTermId === term.ID
                      ? "bg-black/20"
                      : "bg-[var(--background-primary)] text-[var(--foreground-secondary)]"
                  }`}
                >
                  {term.taxonomy === "category" ? "دسته‌بندی" : "تگ"}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ${
                  selectedTermId === term.ID
                    ? "text-gray-900"
                    : "text-[var(--foreground-muted)]"
                }`}
              >
                اسلاگ: {term.slug}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
