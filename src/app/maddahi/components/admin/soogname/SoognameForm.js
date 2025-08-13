// /app/maddahi/components/soogname/SoognameForm.js
"use client";

import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import moment from "jalali-moment";
import { Save, AlertCircle, ExternalLink } from "lucide-react";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";
import {
  createSoogname,
  updateSoogname,
  deleteSoogname,
} from "@/app/maddahi/actions/soognameActions";
import getTerms from "@/app/maddahi/actions/terms";

import CollapsibleSection from "../posts/CollapsibleSection";
import TermSelector from "../posts/TermSelector";
import PostSelector from "./PostSelector";
import ImageUploader from "@/app/maddahi/components/ImageUploader";

const TiptapEditor = dynamic(
  () => import("@/app/maddahi/components/TiptapEditor"),
  { ssr: false }
);

const defaultData = {
  id: null,
  title: "",
  content: "",
  date: new Date().toISOString(),
  related_posts: [],
  related_terms: [],
  url: "",
  thumbnail: "",
  status: "published",
  type: false,
};

const generateReadableUrl = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AFa-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .substring(0, 50);

export default function SoognameForm({ initialData, onFormSubmit, onCancel }) {
  const [formData, setFormData] = useState(defaultData);
  const [shamsiDate, setShamsiDate] = useState("");
  const [terms, setTerms] = useState({ categories: [], tags: [] });
  const [openSections, setOpenSections] = useState([
    "publish",
    "type",
    "posts",
    "categories",
    "tags",
  ]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);

  useEffect(() => {
    const data = initialData?.id
      ? { ...defaultData, ...initialData, type: Boolean(initialData.type) }
      : defaultData;

    setFormData({
      ...data,
      // ★ ویرایش: چون url از سرور به صورت دیکود شده می‌آید، دیگر نیازی به decodeURIComponent نیست
      url: data.url || "",
    });

    setShamsiDate(toShamsi(data.date, "jYYYY/jM/jD"));
    setIsDirty(false);
    setMessage({ type: "", text: "" });

    if (initialData?.id) {
      setIsUrlManuallyEdited(true);
    } else {
      setIsUrlManuallyEdited(false);
    }
  }, [initialData]);

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

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const updates = { title: newTitle };
    if (!isUrlManuallyEdited) {
      updates.url = generateReadableUrl(newTitle);
    }
    handleDataChange(updates);
  };

  const handleUrlChange = (e) => {
    if (!isUrlManuallyEdited) {
      setIsUrlManuallyEdited(true);
    }
    handleDataChange({ url: e.target.value.substring(0, 50) });
  };

  const handleUrlBlur = (e) => {
    if (!e.target.value.trim() && formData.title.trim()) {
      setIsUrlManuallyEdited(false);
      handleDataChange({ url: generateReadableUrl(formData.title) });
    }
  };

  const handleImageChange = (url) => handleDataChange({ thumbnail: url });
  const handleBusyState = (isBusy) => {};

  const handleShamsiDateChange = (e) => {
    const shamsiValue = e.target.value;
    setShamsiDate(shamsiValue);
    const momentDate = moment(shamsiValue, "jYYYY/jM/jD", true);
    if (momentDate.isValid()) {
      handleDataChange({ date: momentDate.toISOString() });
    }
  };

  const handleTermChange = (selectedIds, termType) => {
    const otherTermType = termType === "categories" ? "tags" : "categories";
    const newTerms = [
      ...selectedIds,
      ...formData.related_terms.filter((id) =>
        terms[otherTermType].some((t) => t.ID === id)
      ),
    ];
    handleDataChange({ related_terms: newTerms });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    startTransition(async () => {
      // ★ ویرایش: دیگر نیازی به encode کردن url نیست.
      // آبجکت formData مستقیماً به سرور ارسال می‌شود.
      const dataToSend = { ...formData };

      const action = formData.id ? updateSoogname : createSoogname;
      const result = await action(formData.id, dataToSend);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setIsDirty(false);
        onFormSubmit({ ...formData, id: formData.id || result.newId });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`آیا از حذف "${formData.title}" مطمئن هستید؟`)) return;
    startTransition(async () => {
      const result = await deleteSoogname(formData.id);
      if (result.success) {
        onFormSubmit({ ...formData, deleted: true });
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const inputFieldClasses =
    "w-full mt-1 px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)]";

  const { formCategories, formTags } = formData.related_terms.reduce(
    (acc, termId) => {
      if (terms.categories.some((t) => t.ID === termId))
        acc.formCategories.push(termId);
      if (terms.tags.some((t) => t.ID === termId)) acc.formTags.push(termId);
      return acc;
    },
    { formCategories: [], formTags: [] }
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--background-secondary)] h-full flex flex-col"
    >
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
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

            <CollapsibleSection
              title="پست‌های مرتبط"
              isOpen={openSections.includes("posts")}
              onToggle={() => toggleSection("posts")}
            >
              <PostSelector
                selectedPostIds={formData.related_posts}
                onChange={(ids) => handleDataChange({ related_posts: ids })}
              />
            </CollapsibleSection>

            <div>
              <label className={`${labelClasses} mb-2`}>محتوا</label>
              <div className="bg-[var(--background-primary)] rounded-md">
                <TiptapEditor
                  key={formData.id || "new"}
                  value={formData.content || ""}
                  onChange={(c) => handleDataChange({ content: c })}
                  height="600px"
                />
              </div>
            </div>

            <div className="space-y-6 rounded-lg border border-[var(--border-secondary)] p-4 bg-[var(--background-primary)]">
              <ImageUploader
                title="تصویر شاخص"
                imageUrl={formData.thumbnail}
                onImageChange={handleImageChange}
                onBusyStateChange={handleBusyState}
              />
            </div>
          </div>

          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <CollapsibleSection
              title="عملیات"
              isOpen={openSections.includes("publish")}
              onToggle={() => toggleSection("publish")}
            >
              <div>
                <label htmlFor="status" className={labelClasses}>
                  وضعیت
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleDataChange({ status: e.target.value })}
                  className={inputFieldClasses}
                >
                  <option value="published">منتشر شده</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="archived">بایگانی شده</option>
                </select>
              </div>

              <div>
                <label htmlFor="shamsi-date" className={labelClasses}>
                  تاریخ
                </label>
                <input
                  type="text"
                  id="shamsi-date"
                  value={shamsiDate}
                  onChange={handleShamsiDateChange}
                  className={inputFieldClasses}
                  dir="ltr"
                  placeholder="1403/05/18"
                />
              </div>

              <div>
                <label htmlFor="url" className={labelClasses}>
                  آدرس (URL)
                </label>
                <input
                  type="text"
                  name="url"
                  id="url"
                  value={formData.url}
                  onChange={handleUrlChange}
                  onBlur={handleUrlBlur}
                  className={inputFieldClasses}
                  dir="ltr"
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="نوع سوگنامه"
              isOpen={openSections.includes("type")}
              onToggle={() => toggleSection("type")}
            >
              <div className="space-y-2">
                <span className={labelClasses}>آیا سوگنامه مناسبتی هست؟</span>
                <div className="flex items-center gap-x-6">
                  <div className="flex items-center">
                    <input
                      id="type-no"
                      name="type"
                      type="radio"
                      checked={!formData.type}
                      onChange={() => handleDataChange({ type: false })}
                      className="h-4 w-4 border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <label
                      htmlFor="type-no"
                      className="mr-2 block text-sm text-[var(--foreground-primary)]"
                    >
                      خیر
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="type-yes"
                      name="type"
                      type="radio"
                      checked={!!formData.type}
                      onChange={() => handleDataChange({ type: true })}
                      className="h-4 w-4 border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    <label
                      htmlFor="type-yes"
                      className="mr-2 block text-sm text-[var(--foreground-primary)]"
                    >
                      بله
                    </label>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="دسته‌بندی‌ها"
              isOpen={openSections.includes("categories")}
              onToggle={() => toggleSection("categories")}
            >
              <TermSelector
                title=""
                terms={terms.categories}
                selectedTerms={formCategories}
                onChange={(ids) => handleTermChange(ids, "categories")}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="تگ‌ها"
              isOpen={openSections.includes("tags")}
              onToggle={() => toggleSection("tags")}
            >
              <TermSelector
                title=""
                terms={terms.tags}
                selectedTerms={formTags}
                onChange={(ids) => handleTermChange(ids, "tags")}
              />
            </CollapsibleSection>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] bg-[var(--background-primary)]">
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
          <div className="flex items-center gap-2">
            {formData.id && (
              <>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-6 py-2 text-sm transition-colors border rounded-md disabled:opacity-50 text-[var(--error)] border-[var(--error)] hover:bg-red-500/10"
                >
                  {isLoading ? "..." : "حذف"}
                </button>
                <Link
                  href={`/maddahi/soogname/${formData.url}`}
                  target="_blank"
                  title="مشاهده صفحه"
                  className="p-2 text-sm transition-colors rounded-md text-[var(--foreground-secondary)] hover:bg-[var(--background-tertiary)]"
                >
                  <ExternalLink size={16} />
                </Link>
              </>
            )}
            {isDirty && !isLoading && (
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
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2 text-sm font-semibold text-black transition-colors rounded-md disabled:opacity-50 bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)]"
            >
              <Save size={16} />
              {isLoading
                ? "در حال ذخیره..."
                : formData.id
                ? "ذخیره تغییرات"
                : "ایجاد"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
