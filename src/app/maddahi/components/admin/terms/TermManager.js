// /components/admin/TermManager.js
"use client";

import { useState, useMemo } from "react";
import TermList from "./TermList";
import TermForm from "./TermForm";

export default function TermManager({ initialTerms }) {
  // این state ها اکنون با داده‌های اولیه به درستی مقداردهی می‌شوند
  const [terms, setTerms] = useState(initialTerms || []);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'category', 'post_tag'

  const handleCreateNew = () => {
    // با null کردن ID، فرم به حالت "ایجاد" می‌رود
    setSelectedTerm({ ID: null });
  };

  const filteredTerms = useMemo(() => {
    return terms
      .filter((term) => {
        if (filter === "all") return true;
        return term.taxonomy === filter;
      })
      .filter((term) =>
        term.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [terms, searchTerm, filter]);

  const onTermUpdate = (updatedTerm) => {
    // اگر ترم جدید است (ID نداشت)
    if (!selectedTerm?.ID) {
      setTerms((prev) => [updatedTerm, ...prev]);
    } else {
      // اگر ویرایش شده
      setTerms((prev) =>
        prev.map((t) => (t.ID === updatedTerm.ID ? updatedTerm : t))
      );
    }
    // فرم را در حالت انتخاب شده نگه می‌داریم تا کاربر نتیجه را ببیند
    setSelectedTerm(updatedTerm);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 text-[var(--foreground-primary)] bg-[var(--background-primary)]">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center">پنل مدیریت ترم‌ها</h1>
        <p className="text-center mt-2 text-[var(--foreground-secondary)]">
          ترم‌های جدید ایجاد کنید یا موارد موجود را ویرایش نمایید.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ستون لیست و جستجو */}
        <div className="lg:col-span-1 bg-[var(--background-secondary)] p-6 rounded-lg border border-[var(--border-primary)] h-fit shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">لیست ترم‌ها</h2>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 text-sm font-medium text-black bg-[var(--accent-primary)] rounded-md hover:bg-[var(--accent-crystal-highlight)] transition-colors"
            >
              ایجاد جدید
            </button>
          </div>
          <input
            type="text"
            placeholder="جستجو در نام ترم‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-4 px-4 py-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
          <div className="flex items-center space-x-4 space-x-reverse mb-4">
            <label className="text-[var(--foreground-secondary)]">فیلتر:</label>
            <select
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
              className="bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md p-2"
            >
              <option value="all">همه</option>
              <option value="category">دسته‌بندی‌ها</option>
              <option value="post_tag">تگ‌ها</option>
            </select>
          </div>
          <TermList
            terms={filteredTerms}
            onSelectTerm={setSelectedTerm}
            selectedTermId={selectedTerm?.ID}
          />
        </div>

        {/* ستون فرم */}
        <div className="lg:col-span-2">
          {selectedTerm ? (
            <TermForm
              key={selectedTerm.ID || "new"} // برای ریست شدن فرم هنگام تغییر ترم
              term={selectedTerm}
              onFormSubmit={onTermUpdate}
              onCancel={() => setSelectedTerm(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-[var(--background-secondary)] p-6 rounded-lg border-2 border-dashed border-[var(--border-secondary)]">
              <div className="text-center">
                <p className="text-xl text-[var(--foreground-secondary)]">
                  یک ترم را برای ویرایش انتخاب کنید
                </p>
                <p className="mt-2 text-[var(--foreground-muted)]">
                  یا یک ترم جدید ایجاد نمایید.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
