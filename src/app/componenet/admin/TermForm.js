"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import {
  createTermWithMetadata,
  updateTermWithMetadata,
  deleteTermWithMetadata,
} from "@/app/actions/termActions";
import ImageUploader from "@/app/componenet/ImageUploader";

// TiptapEditor اکنون از استایل‌های گلوبال استفاده می‌کند
const TiptapEditor = dynamic(() => import("@/app/componenet/TiptapEditor"), {
  ssr: false,
});

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
  const pathname = usePathname();

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
  const handleBiographyChange = (content) =>
    setFormData((prev) => ({ ...prev, biography: content }));
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

  // تعریف کلاس‌های Tailwind برای استفاده مجدد
  const inputFieldClasses =
    "w-full mt-1 px-3.5 py-2.5 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] transition-all duration-200 ease-in-out focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-crystal-highlight)]";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)]";

  return (
    <div className="p-8 bg-[var(--background-secondary)] rounded-lg border border-[var(--border-primary)] shadow-lg">
      <h2 className="pb-3 mb-6 text-2xl font-bold text-[var(--foreground-primary)] border-b-2 border-[var(--accent-primary)]">
        {termForEditing.ID ? `ویرایش: ${formData.name}` : "ایجاد ترم جدید"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className={labelClasses}>
              نام
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputFieldClasses}
            />
          </div>
          <div>
            <label htmlFor="slug" className={labelClasses}>
              اسلاگ
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className={inputFieldClasses}
            />
          </div>
        </div>
        <div>
          <label className={labelClasses}>نوع</label>
          <select
            name="taxonomy"
            value={formData.taxonomy}
            onChange={handleChange}
            className={inputFieldClasses}
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
          <label className={`${labelClasses} mb-2`}>توضیحات</label>
          <TiptapEditor
            value={formData.biography || ""}
            onChange={handleBiographyChange}
          />
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
                className="px-6 py-2 text-sm transition-colors border rounded-md disabled:opacity-50 text-[var(--error)] border-[var(--error)] hover:bg-red-500/10"
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
              className="px-6 py-2 text-sm transition-colors rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)]"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!!loadingAction}
              className="px-8 py-2 text-sm font-semibold text-black transition-colors rounded-md disabled:opacity-50 bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)]"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
