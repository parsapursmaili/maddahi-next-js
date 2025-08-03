// /app/maddahi/components/admin/PostMainContent.js
import dynamic from "next/dynamic";
import ImageUploader from "@/app/maddahi/componenet/ImageUploader";

const TiptapEditor = dynamic(
  () => import("@/app/maddahi/componenet/TiptapEditor"),
  {
    ssr: false,
  }
);

export default function PostMainContent({
  formData,
  pathname,
  handleTitleChange,
  handleContentChange,
  handleChange,
  handleImageChange,
  handleSecondImageChange,
  handleBusyState,
}) {
  const inputFieldClasses =
    "w-full mt-1 px-3 py-2 bg-[var(--background-tertiary)] border border-[var(--border-primary)] rounded-md text-[var(--foreground-primary)] transition-all duration-200 ease-in-out focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]";
  const labelClasses =
    "block text-sm font-medium text-[var(--foreground-secondary)]";

  return (
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
          maxLength="160" // ویرایش: محدودیت کاراکتر
          className={inputFieldClasses}
        ></textarea>
        {/* ویرایش: نمایش تعداد کاراکترها */}
        <p className="text-left text-xs text-[var(--foreground-muted)] mt-1">
          {formData.description?.length || 0} / 160
        </p>
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

      {/* ویرایش: چیدمان جدید بخش تصاویر و ویدئو */}
      <div className="space-y-6 rounded-lg border border-[var(--border-secondary)] p-4 bg-[var(--background-primary)]">
        <ImageUploader
          title="تصویر شاخص"
          imageUrl={formData.thumbnail}
          onImageChange={handleImageChange}
          onBusyStateChange={handleBusyState}
          revalidatePath={pathname}
        />
        {/* ویرایش: فیلد آلت تصویر به اینجا منتقل شد */}
        <div className="pt-2">
          <label htmlFor="thumbnail_alt" className={labelClasses}>
            متن جایگزین تصویر شاخص (Alt Text)
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
        <hr className="border-[var(--border-secondary)]" />
        <ImageUploader
          title="تامبنیل دوم (اختیاری)"
          imageUrl={formData.extra_metadata?.second_thumbnail || ""}
          onImageChange={handleSecondImageChange}
          onBusyStateChange={handleBusyState}
          revalidatePath={pathname}
        />
        {/* ویرایش: فیلد جاسازی ویدئو به اینجا منتقل شد */}
        <div className="pt-2">
          <label htmlFor="video_link" className={labelClasses}>
            کد جاسازی ویدیو (Embed)
          </label>
          <textarea
            name="video_link"
            id="video_link"
            value={formData.video_link || ""}
            onChange={handleChange}
            rows="4"
            className={inputFieldClasses}
            dir="ltr"
            placeholder='مثال: <div id="..."><script src="..."></script></div>'
          ></textarea>
        </div>
      </div>
    </div>
  );
}
