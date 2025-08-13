// /app/maddahi/components/admin/PostSidebar.js
import TermSelector from "./TermSelector";
import CollapsibleSection from "./CollapsibleSection"; // فرض می‌کنیم این کامپوننت در همین مسیر است

export default function PostSidebar({
  formData,
  shamsiDate,
  terms,
  openSections,
  toggleSection,
  handleChange,
  handleShamsiDateChange,
  setDateToNow,
  handleSlugChange,
  handleSlugBlur,
  handleTermChange,
}) {
  const inputFieldClasses =
    "w-full mt-1 px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] transition-all duration-200 ease-in-out focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)]";

  return (
    <div className="lg:col-span-4 xl:col-span-3 space-y-4">
      <CollapsibleSection
        key="publish"
        title="انتشار"
        isOpen={openSections.includes("publish")}
        onToggle={() => toggleSection("publish")}
      >
        <div>
          <label htmlFor="status" className={labelClasses}>
            وضعیت
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={handleChange}
            className={inputFieldClasses}
          >
            <option value="publish">منتشر شده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="pending">در انتظار بازبینی</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="shamsi-date" className={labelClasses}>
              تاریخ انتشار
            </label>
            <button
              type="button"
              onClick={setDateToNow}
              className="text-xs text-[var(--accent-primary)] hover:underline"
            >
              اکنون
            </button>
          </div>
          <input
            type="text"
            id="shamsi-date"
            name="shamsi-date"
            value={shamsiDate}
            onChange={handleShamsiDateChange}
            className={inputFieldClasses}
            dir="ltr"
            placeholder="jYYYY/jM/jD HH:mm"
          />
          <p className="text-xs text-[var(--foreground-muted)] mt-1 text-center">
            مثال: 1403/05/06 15:30
          </p>
        </div>
        <div>
          <label htmlFor="name" className={labelClasses}>
            نامک (اسلاگ)
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ""}
            onChange={handleSlugChange}
            onBlur={handleSlugBlur}
            className={inputFieldClasses}
            dir="ltr"
          />
        </div>
      </CollapsibleSection>
      <CollapsibleSection
        key="attributes"
        title="ویژگی‌ها"
        isOpen={openSections.includes("attributes")}
        onToggle={() => toggleSection("attributes")}
      >
        <span className={labelClasses}>روضه</span>
        <div className="mt-2 flex gap-x-6">
          {["هست", "نیست"].map((val) => (
            <label key={val} className="flex items-center">
              <input
                type="radio"
                name="rozeh"
                value={val}
                checked={formData.rozeh === val}
                onChange={handleChange}
                className="w-4 h-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
              />
              <span className="mr-2 text-sm">{val}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>
      <CollapsibleSection
        key="categories"
        title="دسته‌بندی‌ها"
        isOpen={openSections.includes("categories")}
        onToggle={() => toggleSection("categories")}
      >
        <TermSelector
          title=""
          terms={terms.categories}
          selectedTerms={formData.categories}
          onChange={(ids) => handleTermChange(ids, "categories")}
        />
      </CollapsibleSection>
      <CollapsibleSection
        key="tags"
        title="تگ‌ها"
        isOpen={openSections.includes("tags")}
        onToggle={() => toggleSection("tags")}
      >
        <TermSelector
          title=""
          terms={terms.tags}
          selectedTerms={formData.tags}
          onChange={(ids) => handleTermChange(ids, "tags")}
        />
      </CollapsibleSection>
    </div>
  );
}
