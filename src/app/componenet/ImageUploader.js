"use client";

import { useState, useRef, useEffect } from "react";
import { uploadImage } from "@/app/actions/uploadActions";
import MediaLibraryModal from "./MediaLibraryModal";

export default function ImageUploader({
  imageUrl,
  onImageChange,
  onBusyStateChange,
  revalidatePath,
}) {
  const [preview, setPreview] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  const UPLOADS_BASE_PATH =
    process.env.NEXT_PUBLIC_UPLOADS_BASE_PATH || "/uploads";

  useEffect(() => {
    setPreview(imageUrl ? `${UPLOADS_BASE_PATH}/${imageUrl}` : null);
  }, [imageUrl, UPLOADS_BASE_PATH]);

  const handleBusy = (isBusy) => onBusyStateChange?.(isBusy);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleBusy(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathToRevalidate", revalidatePath); // ارسال مسیر برای revalidate

    const result = await uploadImage(formData);
    if (result.success && result.relativePath) {
      onImageChange(result.relativePath);
    } else {
      alert(result.message || "خطا در آپلود");
      setPreview(imageUrl ? `${UPLOADS_BASE_PATH}/${imageUrl}` : null);
    }
    handleBusy(false);
  };

  const handleRemoveImage = () => onImageChange("");

  const handleSelectFromLibrary = (relativePath) => {
    onImageChange(relativePath);
    setIsLibraryOpen(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
        تصویر شاخص
      </label>
      <div className="mt-1 flex flex-col sm:flex-row items-start gap-4 p-4 border-2 border-dashed border-[var(--border-primary)] rounded-lg bg-[var(--background-primary)]">
        {preview ? (
          <img
            src={preview}
            alt="پیش‌نمایش"
            className="w-28 h-28 object-cover rounded-md border border-[var(--border-secondary)]"
          />
        ) : (
          <div className="w-28 h-28 bg-[var(--background-tertiary)] rounded-md flex items-center justify-center text-center text-xs text-[var(--foreground-muted)] p-2">
            بدون تصویر
          </div>
        )}
        <div className="flex flex-col gap-3 flex-grow">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              آپلود جدید
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] transition-colors"
              onClick={() => setIsLibraryOpen(true)}
            >
              انتخاب از کتابخانه
            </button>
          </div>
          {preview && (
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-md text-[var(--error)] bg-transparent border border-[var(--error)] hover:bg-red-500/10 transition-colors self-start"
              onClick={handleRemoveImage}
            >
              حذف تصویر
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp, image/gif"
          />
        </div>
      </div>
      {isLibraryOpen && (
        <MediaLibraryModal
          onClose={() => setIsLibraryOpen(false)}
          onSelectImage={handleSelectFromLibrary}
          revalidatePath={revalidatePath}
        />
      )}
    </div>
  );
}
