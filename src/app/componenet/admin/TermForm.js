"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // جدید: برای دریافت مسیر فعلی
import {
  createTermWithMetadata,
  updateTermWithMetadata,
  deleteTermWithMetadata,
} from "@/app/actions/termActions";
import ImageUploader from "@/app/componenet/ImageUploader";

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
  const pathname = usePathname(); // جدید: دریافت مسیر فعلی مثلا /admin/terms

  const [formData, setFormData] = useState(termForEditing);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    setFormData(initialTerm?.ID ? initialTerm : defaultTerm);
    setMessage({ type: "", text: "" });
    setLoadingAction(null);
  }, [initialTerm]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImageChange = (url) =>
    setFormData((prev) => ({ ...prev, image_url: url }));
  const handleBusyState = (isBusy) =>
    setLoadingAction(isBusy ? "upload" : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction("submit");
    const result = termForEditing.ID
      ? await updateTermWithMetadata(termForEditing.ID, formData)
      : await createTermWithMetadata(formData);

    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: termForEditing.ID || result.newTermId });
    } else {
      setMessage({ type: "error", text: result?.message || "خطایی رخ داد." });
    }
    setLoadingAction(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(`آیا از حذف ترم "${formData.name}" مطمئن هستید؟`))
      return;
    setLoadingAction("delete");
    const result = await deleteTermWithMetadata(termForEditing.ID);
    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: termForEditing.ID, deleted: true });
    } else {
      setMessage({ type: "error", text: result?.message || "خطا در حذف." });
      setLoadingAction(null);
    }
  };

  const getButtonText = () => {
    if (loadingAction === "submit") return "در حال ذخیره...";
    if (loadingAction === "upload") return "در حال آپلود...";
    if (loadingAction === "delete") return "در حال حذف...";
    return termForEditing.ID ? "ذخیره تغییرات" : "ایجاد ترم";
  };

  return (
    <div className="p-8 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-[var(--foreground-primary)] border-b-2 border-[var(--accent-primary)] pb-3">
        {termForEditing.ID ? `ویرایش: ${formData.name}` : "ایجاد ترم جدید"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... بقیه فیلدهای فرم بدون تغییر ... */}
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
              اسلاگ
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
            نوع
          </label>
          <select
            name="taxonomy"
            value={formData.taxonomy}
            onChange={handleChange}
            className="mt-1 input-field"
          >
            <option value="category">دسته‌بندی</option>
            <option value="post_tag">تگ</option>
          </select>
        </div>

        <ImageUploader
          imageUrl={formData.image_url}
          onImageChange={handleImageChange}
          onBusyStateChange={handleBusyState}
          revalidatePath={pathname}
        />

        <div>
          <label
            htmlFor="biography"
            className="block text-sm font-medium text-[var(--foreground-secondary)]"
          >
            توضیحات
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
        <div className="flex items-center justify-between pt-4">
          <div>
            {termForEditing.ID && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={!!loadingAction}
                className="px-6 py-2 text-sm rounded-md text-[var(--error)] bg-transparent border border-[var(--error)] hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                {loadingAction === "delete" ? "در حال حذف..." : "حذف"}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onCancel}
              disabled={!!loadingAction}
              className="px-6 py-2 text-sm rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!!loadingAction}
              className="px-8 py-2 text-sm font-semibold text-black bg-[var(--accent-primary)] rounded-md hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)] transition-colors disabled:opacity-50"
            >
              {getButtonText()}
            </button>
          </div>
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
