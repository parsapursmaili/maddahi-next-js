"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

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
      className="fixed inset-0 bg-[var(--background-primary)] bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-[var(--background-secondary)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--border-primary)] p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground-primary)]">
              ویرایش دیدگاه
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground-primary)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Name and Email */}
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
                  className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2 text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition"
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
                  className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2 text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition"
                />
              </div>
            </div>

            {/* Comment Text */}
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
                className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg px-4 py-2 text-[var(--foreground-primary)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] transition"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg border border-[var(--border-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
              لغو
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center px-6 py-2 rounded-lg bg-[var(--accent-primary)] text-[var(--background-primary)] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  ذخیره تغییرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
