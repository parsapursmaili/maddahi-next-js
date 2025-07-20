// /components/admin/TermForm.js
"use client";

import { useState, useEffect } from "react";
import {
  createTermWithMetadata,
  updateTermWithMetadata,
} from "@/app/actions/termActions";
export default function TermForm({ term, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState(term);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setFormData(term); // Re-initialize form when selected term changes
    setMessage({ type: "", text: "" });
  }, [term]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    const action = term.ID ? updateTermWithMetadata : createTermWithMetadata;
    const result = await action(term.ID, formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message });
      // به‌روزرسانی state در کامپوننت والد
      onFormSubmit({ ...formData, ID: term.ID || result.newTermId });
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground-primary)] border-b-2 border-[var(--accent-primary)] pb-3">
        {term.ID ? `ویرایش ترم: ${term.name}` : "ایجاد ترم جدید"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              نام
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 input-field"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-[var(--foreground-secondary)]"
            >
              اسلاگ (Slug)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="mt-1 input-field"
            />
          </div>
        </div>

        {/* Taxonomy */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)]">
            نوع (Taxonomy)
          </label>
          <select
            name="taxonomy"
            value={formData.taxonomy}
            onChange={handleChange}
            className="mt-1 input-field"
          >
            <option value="category">دسته‌بندی (Category)</option>
            <option value="post_tag">تگ (Post Tag)</option>
          </select>
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="image_url"
            className="block text-sm font-medium text-[var(--foreground-secondary)]"
          >
            آدرس تصویر (اختیاری)
          </label>
          <input
            type="text"
            name="image_url"
            id="image_url"
            value={formData.image_url || ""}
            onChange={handleChange}
            className="mt-1 input-field"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Biography */}
        <div>
          <label
            htmlFor="biography"
            className="block text-sm font-medium text-[var(--foreground-secondary)]"
          >
            بیوگرافی/توضیحات (اختیاری)
          </label>
          <textarea
            name="biography"
            id="biography"
            rows="5"
            value={formData.biography || ""}
            onChange={handleChange}
            className="mt-1 input-field"
          ></textarea>
        </div>

        {/* Messages */}
        {message.text && (
          <p
            className={`text-sm text-center p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-500/10 text-[var(--success)]"
                : "bg-red-500/10 text-[var(--error)]"
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 space-x-reverse pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2 text-sm font-semibold text-black bg-[var(--accent-primary)] rounded-md hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)] transition-colors disabled:opacity-50"
          >
            {isLoading
              ? "در حال ذخیره..."
              : term.ID
              ? "ذخیره تغییرات"
              : "ایجاد ترم"}
          </button>
        </div>
      </form>
      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 10px 14px;
          background-color: var(--background-tertiary);
          border: 1px solid var(--border-primary);
          border-radius: 6px;
          color: var(--foreground-primary);
          transition: all 0.2s ease-in-out;
        }
        .input-field:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-crystal-highlight);
        }
      `}</style>
    </div>
  );
}
