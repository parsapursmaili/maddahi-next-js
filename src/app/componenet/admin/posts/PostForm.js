// /app/components/admin/posts/PostForm.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { createPost, updatePost, deletePost } from "@/app/actions/postActions";
import getTerms from "@/app/actions/terms"; // مسیر صحیح را چک کنید
import ImageUploader from "@/app/componenet/ImageUploader"; // مسیر صحیح را چک کنید
import TermSelector from "./TermSelector"; // کامپوننت جدید

const TiptapEditor = dynamic(() => import("@/app/componenet/TiptapEditor"), {
  ssr: false,
});

// تعریف مقادیر پیش‌فرض بر اساس ساختار کامل جدول
const defaultPost = {
  ID: null,
  title: "",
  name: "",
  content: "",
  thumbnail: "",
  thumbnail_alt: "",
  categories: [],
  tags: [],
  status: "publish",
  rozeh: "ندارد",
  link: "",
  description: "",
  comment_status: "open",
};

export default function PostForm({
  post: initialPost,
  onFormSubmit,
  onCancel,
}) {
  const postForEditing = initialPost?.ID ? initialPost : defaultPost;
  const pathname = usePathname();

  const [formData, setFormData] = useState(postForEditing);
  const [terms, setTerms] = useState({ categories: [], tags: [] });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    // هنگام تغییر پست، فرم را با داده‌های جدید پر می‌کنیم
    setFormData(initialPost?.ID ? initialPost : defaultPost);
    setMessage({ type: "", text: "" });
  }, [initialPost]);

  useEffect(() => {
    async function fetchTerms() {
      const allTerms = (await getTerms({ req: 2 })) || [];
      setTerms({
        categories: allTerms.filter((t) => t.taxonomy === "category"),
        tags: allTerms.filter((t) => t.taxonomy === "post_tag"),
      });
    }
    fetchTerms();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleImageChange = (url) =>
    setFormData((prev) => ({ ...prev, thumbnail: url }));
  const handleContentChange = (content) =>
    setFormData((prev) => ({ ...prev, content }));
  const handleTermChange = (selectedIds, termType) =>
    setFormData((prev) => ({ ...prev, [termType]: selectedIds }));
  const handleBusyState = (isBusy) =>
    setLoadingAction(isBusy ? "upload" : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction("submit");
    const result = postForEditing.ID
      ? await updatePost(postForEditing.ID, formData, pathname)
      : await createPost(formData, pathname);

    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      // ارسال تمام داده‌های فرم به کامپوننت والد برای به‌روزرسانی state
      onFormSubmit({ ...formData, ID: postForEditing.ID || result.newPostId });
    } else {
      setMessage({ type: "error", text: result?.message || "خطایی رخ داد." });
    }
    setLoadingAction(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(`آیا از حذف پست "${formData.title}" مطمئن هستید؟`))
      return;
    setLoadingAction("delete");
    const result = await deletePost(postForEditing.ID, pathname);
    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: postForEditing.ID, deleted: true });
    } else {
      setMessage({ type: "error", text: result?.message || "خطا در حذف." });
      setLoadingAction(null);
    }
  };

  const getButtonText = () => {
    if (loadingAction === "submit") return "در حال ذخیره...";
    if (loadingAction === "upload") return "در حال آپلود...";
    if (loadingAction === "delete") return "در حال حذف...";
    return postForEditing.ID ? "ذخیره تغییرات" : "ایجاد پست";
  };

  const inputFieldClasses =
    "w-full mt-1 px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] transition-all duration-200 ease-in-out focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)]";

  return (
    <div className="bg-[var(--background-secondary)] h-full flex flex-col">
      <div className="p-6 border-b border-[var(--border-primary)]">
        <h2 className="text-2xl font-bold text-[var(--foreground-primary)]">
          {postForEditing.ID ? `ویرایش پست` : "ایجاد پست جدید"}
        </h2>
        {postForEditing.ID && (
          <p className="text-sm text-[var(--foreground-muted)]">
            {formData.title}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ستون اصلی برای محتوا */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className={labelClasses}>
                عنوان
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={inputFieldClasses}
              />
            </div>
            <div>
              <label className={`${labelClasses} mb-2`}>محتوا</label>
              <TiptapEditor
                value={formData.content || ""}
                onChange={handleContentChange}
              />
            </div>
            <div>
              <label htmlFor="description" className={labelClasses}>
                توضیحات متا (برای سئو)
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows="3"
                className={inputFieldClasses}
              ></textarea>
            </div>
          </div>

          {/* ستون کناری برای فراداده */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-4 rounded-lg bg-[var(--background-primary)] border border-[var(--border-secondary)]">
              <h3 className="font-bold mb-4">انتشار</h3>
              <div className="space-y-4">
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
                  <label htmlFor="name" className={labelClasses}>
                    نامک (اسلاگ)
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className={inputFieldClasses}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[var(--background-primary)] border border-[var(--border-secondary)]">
              <h3 className="font-bold mb-4">ویژگی‌ها</h3>
              <div>
                <span className={labelClasses}>روضه</span>
                <div className="mt-2 flex gap-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rozeh"
                      value="دارد"
                      checked={formData.rozeh === "دارد"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <span className="mr-2 text-sm">دارد</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="rozeh"
                      value="ندارد"
                      checked={formData.rozeh === "ندارد"}
                      onChange={handleChange}
                      className="w-4 h-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <span className="mr-2 text-sm">ندارد</span>
                  </label>
                </div>
              </div>
            </div>

            <ImageUploader
              imageUrl={formData.thumbnail}
              onImageChange={handleImageChange}
              onBusyStateChange={handleBusyState}
              revalidatePath={pathname}
            />
            <div>
              <label htmlFor="thumbnail_alt" className={labelClasses}>
                متن جایگزین تصویر
              </label>
              <input
                type="text"
                name="thumbnail_alt"
                id="thumbnail_alt"
                value={formData.thumbnail_alt || ""}
                onChange={handleChange}
                className={inputFieldClasses}
              />
            </div>

            <div className="h-64">
              <TermSelector
                title="دسته‌بندی‌ها"
                terms={terms.categories}
                selectedTerms={formData.categories}
                onChange={(ids) => handleTermChange(ids, "categories")}
              />
            </div>

            <div className="h-64">
              <TermSelector
                title="تگ‌ها"
                terms={terms.tags}
                selectedTerms={formData.tags}
                onChange={(ids) => handleTermChange(ids, "tags")}
              />
            </div>
          </div>
        </div>
      </form>

      {/* فوتر فرم برای دکمه‌ها */}
      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--background-secondary)]">
        {message.text && (
          <p
            className={`text-sm text-center mb-4 p-3 rounded-md ${
              message.type === "success"
                ? "bg-green-500/10 text-[var(--success)]"
                : "bg-red-500/10 text-[var(--error)]"
            }`}
          >
            {message.text}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {postForEditing.ID && (
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
              onClick={handleSubmit}
              disabled={!!loadingAction}
              className="px-8 py-2 text-sm font-semibold text-black transition-colors rounded-md disabled:opacity-50 bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)]"
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
