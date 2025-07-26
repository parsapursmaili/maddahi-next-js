// /app/maddahi/components/admin/PostForm.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { ChevronUp, Save, AlertCircle } from "lucide-react";
import {
  createPost,
  updatePost,
  deletePost,
} from "@/app/maddahi/actions/postActions";
import getTerms from "@/app/maddahi/actions/terms";
import ImageUploader from "@/app/maddahi/componenet/ImageUploader";
import TermSelector from "./TermSelector";

const TiptapEditor = dynamic(
  () => import("@/app/maddahi/componenet/TiptapEditor"),
  {
    ssr: false,
  }
);

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-[var(--border-secondary)] rounded-lg bg-[var(--background-primary)]">
    <h3 className="border-b border-[var(--border-secondary)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between p-3 text-sm font-semibold text-[var(--foreground-primary)]"
      >
        <span>{title}</span>
        <ChevronUp
          size={18}
          className={`transition-transform duration-200 ${
            !isOpen && "rotate-180"
          }`}
        />
      </button>
    </h3>
    {isOpen && <div className="p-4 space-y-6">{children}</div>}
  </div>
);

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
  description: null,
  comment_status: "open",
  extra_metadata: null,
  date: null,
};

const generateReadableSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AFa-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .substring(0, 70);

export default function PostForm({
  post: initialPost,
  onFormSubmit,
  onCancel,
}) {
  const postForEditing = initialPost?.ID ? initialPost : defaultPost;
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    ...defaultPost,
    ...postForEditing,
  });
  const [terms, setTerms] = useState({ categories: [], tags: [] });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingAction, setLoadingAction] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [openSections, setOpenSections] = useState([
    "publish",
    "media",
    "categories",
  ]);

  useEffect(() => {
    const initialData = initialPost?.ID ? initialPost : defaultPost;

    let extraData = initialData.extra_metadata;
    if (typeof extraData === "string") {
      try {
        extraData = JSON.parse(extraData);
      } catch (e) {
        extraData = null;
      }
    }

    // ★★★ اصلاحیه اصلی برای تاریخ ★★★
    // همیشه اطمینان حاصل می‌کنیم که تاریخ یک رشته ISO باشد یا null
    let dateValue = initialData.date;
    if (dateValue) {
      dateValue = new Date(dateValue).toISOString();
    } else if (!initialData.ID) {
      dateValue = new Date().toISOString();
    }

    const finalData = {
      ...initialData,
      name: initialData.name ? decodeURIComponent(initialData.name) : "",
      description: initialData.description || null,
      extra_metadata: extraData || null,
      date: dateValue, // استفاده از مقدار تاریخ پردازش‌شده
    };

    setFormData(finalData);
    setMessage({ type: "", text: "" });
    setIsDirty(false);
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

  const handleDataChange = (update) => {
    setFormData((prev) => ({ ...prev, ...update }));
    if (!isDirty) setIsDirty(true);
  };

  const handleContentChange = (content) => handleDataChange({ content });
  const handleTermChange = (selectedIds, termType) =>
    handleDataChange({ [termType]: selectedIds });
  const handleImageChange = (url) => handleDataChange({ thumbnail: url });
  const handleSecondImageChange = (url) =>
    handleDataChange({
      extra_metadata: { ...formData.extra_metadata, second_thumbnail: url },
    });

  const handleChange = (e) =>
    handleDataChange({ [e.target.name]: e.target.value });

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    handleDataChange({ title: newTitle, name: generateReadableSlug(newTitle) });
  };

  const handleBusyState = (isBusy) =>
    setLoadingAction(isBusy ? "upload" : null);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction("submit");

    const dataToSend = { ...formData, name: encodeURIComponent(formData.name) };
    const result = postForEditing.ID
      ? await updatePost(postForEditing.ID, dataToSend, pathname)
      : await createPost(dataToSend, pathname);

    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: postForEditing.ID || result.newPostId });
      setIsDirty(false);
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
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--background-secondary)] h-full flex flex-col"
    >
      <div className="flex-grow overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <div>
              <label htmlFor="title" className={labelClasses}>
                عنوان
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className={inputFieldClasses + " text-lg font-bold"}
              />
            </div>
            <div>
              <label className={`${labelClasses} mb-2`}>محتوا</label>
              <div className="h-[600px] bg-[var(--background-primary)] rounded-md">
                <TiptapEditor
                  key={formData.ID || "new-post"}
                  value={formData.content || ""}
                  onChange={handleContentChange}
                />
              </div>
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
            <div>
              <label htmlFor="link" className={labelClasses}>
                لینک خارجی (اختیاری)
              </label>
              <input
                type="text"
                name="link"
                id="link"
                value={formData.link || ""}
                onChange={handleChange}
                className={inputFieldClasses}
                dir="ltr"
              />
            </div>
          </div>

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
                <label htmlFor="date" className={labelClasses}>
                  تاریخ انتشار
                </label>
                {/* ★★★ شرط دفاعی برای جلوگیری از کرش ★★★ */}
                {/* فقط زمانی اینپوت را رندر کن که تاریخ وجود دارد و یک رشته است */}
                {formData.date && typeof formData.date === "string" && (
                  <input
                    type="datetime-local"
                    name="date"
                    id="date"
                    value={formData.date.substring(0, 16)}
                    onChange={handleChange}
                    className={inputFieldClasses}
                    dir="ltr"
                  />
                )}
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
            </CollapsibleSection>

            <CollapsibleSection
              key="media"
              title="رسانه"
              isOpen={openSections.includes("media")}
              onToggle={() => toggleSection("media")}
            >
              <ImageUploader
                title="تصویر شاخص"
                imageUrl={formData.thumbnail}
                onImageChange={handleImageChange}
                onBusyStateChange={handleBusyState}
                revalidatePath={pathname}
              />
              <ImageUploader
                title="تامبنیل دوم (اختیاری)"
                imageUrl={formData.extra_metadata?.second_thumbnail || ""}
                onImageChange={handleSecondImageChange}
                onBusyStateChange={handleBusyState}
                revalidatePath={pathname}
              />
              <div>
                <label htmlFor="thumbnail_alt" className={labelClasses}>
                  متن جایگزین تصویر شاخص
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
            </CollapsibleSection>

            <CollapsibleSection
              key="attributes"
              title="ویژگی‌ها"
              isOpen={openSections.includes("attributes")}
              onToggle={() => toggleSection("attributes")}
            >
              <span className={labelClasses}>روضه</span>
              <div className="mt-2 flex gap-x-6">
                {["دارد", "ندارد"].map((val) => (
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
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--background-primary)] flex-shrink-0">
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
            {isDirty && !loadingAction && (
              <div className="flex items-center gap-2 text-sm text-yellow-400 animate-pulse ml-4">
                <AlertCircle size={16} />
                <span>تغییرات ذخیره‌نشده</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-sm transition-colors rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] hidden md:block"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!!loadingAction}
              className="flex items-center gap-2 px-8 py-2 text-sm font-semibold text-black transition-colors rounded-md disabled:opacity-50 bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)]"
            >
              <Save size={16} />
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
