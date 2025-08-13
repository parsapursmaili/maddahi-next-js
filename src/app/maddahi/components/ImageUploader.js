"use client";

import { useState, useRef, useEffect } from "react";
import MediaLibraryModal from "./MediaLibraryModal";
import { createApiImageUrl } from "@/app/maddahi/lib/utils/imageUrl"; // ۱. وارد کردن تابع کمکی

export default function ImageUploader({
  title,
  imageUrl, // مسیر نسبی خام: '2025/07/my-image.webp'
  onImageChange,
  onBusyStateChange,
  revalidatePath,
}) {
  const [preview, setPreview] = useState(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // ۲. استفاده از تابع کمکی برای تنظیم پیش‌نمایش اولیه
    const apiImageUrl = createApiImageUrl(imageUrl, {
      size: "150x150",
      bustCache: true,
    });
    setPreview(apiImageUrl);
  }, [imageUrl]);

  const handleBusy = (isBusy) => onBusyStateChange?.(isBusy);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleBusy(true);

    // پیش‌نمایش موقت محلی برای تجربه کاربری بهتر
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathToRevalidate", revalidatePath);

    const response = await fetch("/maddahi/api/upload-revalidate", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    URL.revokeObjectURL(localPreviewUrl);

    if (result.success && result.relativePath) {
      // ۳. استفاده از تابع کمکی برای نمایش تصویر آپلود شده
      const newApiImageUrl = createApiImageUrl(result.relativePath, {
        size: "150x150",
        bustCache: true,
      });
      setPreview(newApiImageUrl);
      onImageChange(result.relativePath);
    } else {
      alert(result.message || "خطا در آپلود");
      // در صورت خطا به تصویر قبلی بازگرد
      setPreview(
        createApiImageUrl(imageUrl, { size: "150x150", bustCache: true })
      );
    }
    handleBusy(false);
  };

  const handleRemoveImage = () => {
    onImageChange("");
    setPreview(null);
  };

  const handleSelectFromLibrary = (relativePath) => {
    // ۴. استفاده از تابع کمکی برای نمایش تصویر انتخاب شده از کتابخانه
    const selectedApiImageUrl = createApiImageUrl(relativePath, {
      size: "150",
      bustCache: true,
    });
    setPreview(selectedApiImageUrl);
    onImageChange(relativePath);
    setIsLibraryOpen(false);
  };

  const ImagePreview = () => {
    if (!preview) {
      return (
        <div className="w-28 h-28 bg-[var(--background-tertiary)] rounded-md flex items-center justify-center text-center text-xs text-[var(--foreground-muted)] p-2">
          بدون تصویر
        </div>
      );
    }
    return (
      <img
        src={preview}
        alt={title || "پیش‌نمایش تصویر"}
        width={112}
        height={112}
        className="object-cover rounded-md border border-[var(--border-secondary)]"
      />
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
        {title}
      </label>
      <div className="mt-1 flex flex-col sm:flex-row items-start gap-4 p-4 border-2 border-dashed border-[var(--border-primary)] rounded-lg bg-[var(--background-primary)]">
        <ImagePreview />
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
