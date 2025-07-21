"use client";

import { useState, useEffect } from "react";
import {
  createTermWithMetadata,
  updateTermWithMetadata,
  deleteTermWithMetadata, // وارد کردن تابع جدید
} from "@/app/actions/termActions";

const defaultTerm = {
  ID: null,
  name: "",
  slug: "",
  taxonomy: "category",
  image_url: "",
  biography: "",
};

export default function TermForm({
  term: initialTerm,
  onFormSubmit,
  onCancel,
}) {
  const termForEditing = initialTerm?.ID ? initialTerm : defaultTerm;

  const [formData, setFormData] = useState(termForEditing);
  const [message, setMessage] = useState({ type: "", text: "" });
  // استفاده از استیت جدید برای مدیریت اکشن‌های مختلف (ذخیره، حذف)
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    setFormData(initialTerm?.ID ? initialTerm : defaultTerm);
    setMessage({ type: "", text: "" });
    setLoadingAction(null);
  }, [initialTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingAction("submit");
    setMessage({ type: "", text: "" });

    let result;
    if (termForEditing.ID) {
      result = await updateTermWithMetadata(termForEditing.ID, formData);
    } else {
      result = await createTermWithMetadata(formData);
    }

    if (result && result.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: termForEditing.ID || result.newTermId });
    } else {
      setMessage({
        type: "error",
        text: result?.message || "خطایی رخ داد. لطفا دوباره تلاش کنید.",
      });
    }

    setLoadingAction(null);
  };

  // تابع جدید برای مدیریت حذف
  const handleDelete = async () => {
    if (
      !window.confirm(
        `آیا از حذف ترم "${formData.name}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`
      )
    ) {
      return;
    }

    setLoadingAction("delete");
    setMessage({ type: "", text: "" });

    const result = await deleteTermWithMetadata(termForEditing.ID);

    if (result && result.success) {
      setMessage({ type: "success", text: result.message });
      // اطلاع به کامپوننت والد که ترم حذف شده است تا UI را به‌روز کند
      onFormSubmit({ ...formData, ID: termForEditing.ID, deleted: true });
    } else {
      setMessage({
        type: "error",
        text: result?.message || "خطا در هنگام حذف.",
      });
      setLoadingAction(null); // در صورت خطا، لودینگ را متوقف کن
    }
  };

  return (
    <div className="p-8 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground-primary)] border-b-2 border-[var(--accent-primary)] pb-3">
        {termForEditing.ID ? `ویرایش ترم: ${formData.name}` : "ایجاد ترم جدید"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* فیلدها (بدون تغییر) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* پیام‌ها */}
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

        {/* دکمه‌ها */}
        <div className="flex items-center justify-between pt-4">
          {/* دکمه حذف (جدید) */}
          <div>
            {termForEditing.ID && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loadingAction !== null}
                className="px-6 py-2 text-sm rounded-md text-[var(--error)] bg-transparent border border-[var(--error)] hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {loadingAction === "delete" ? "در حال حذف..." : "حذف ترم"}
              </button>
            )}
          </div>

          {/* دکمه‌های انصراف و ذخیره */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onCancel}
              disabled={loadingAction !== null}
              className="px-6 py-2 text-sm rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loadingAction !== null}
              className="px-8 py-2 text-sm font-semibold text-black bg-[var(--accent-primary)] rounded-md hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)] transition-colors disabled:opacity-50"
            >
              {loadingAction === "submit"
                ? "در حال ذخیره..."
                : termForEditing.ID
                ? "ذخیره تغییرات"
                : "ایجاد ترم"}
            </button>
          </div>
        </div>
      </form>

      {/* استایل‌ها (بدون تغییر) */}
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
