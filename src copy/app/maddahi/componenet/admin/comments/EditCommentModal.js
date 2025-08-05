"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

export default function EditCommentModal({ comment, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: comment.name,
    email: comment.email,
    text: comment.text,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSave(comment.id, formData);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans animate-in fade-in-0"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--background-secondary)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--border-primary)] p-6 sm:p-8 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-secondary)]">
            <h2 className="text-2xl font-bold text-[var(--foreground-primary)]">
              ویرایش دیدگاه
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
                >
                  نام
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2.5 text-[var(--foreground-primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
                >
                  ایمیل
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2.5 text-[var(--foreground-primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="text"
                className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2"
              >
                متن دیدگاه
              </label>
              <textarea
                name="text"
                id="text"
                rows="8"
                value={formData.text}
                onChange={handleChange}
                className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2.5 text-[var(--foreground-primary)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg border border-[var(--border-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] hover:border-[var(--foreground-muted)] transition-colors disabled:opacity-50"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center w-40 px-6 py-2.5 rounded-lg bg-[var(--accent-primary)] text-[var(--background-primary)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  <span>ذخیره تغییرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
