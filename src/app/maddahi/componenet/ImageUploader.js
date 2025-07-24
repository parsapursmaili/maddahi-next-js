"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image"; // همچنان از Image برای تصاویر ذخیره شده استفاده می‌کنیم
import { uploadImage } from "@/app/maddahi/actions/uploadActions";
import MediaLibraryModal from "./MediaLibraryModal";

export default function ImageUploader({
  imageUrl,
  onImageChange,
  onBusyStateChange,
  revalidatePath,
}) {
  const [preview, setPreview] = useState(null);
  const [isLocalPreview, setIsLocalPreview] = useState(false); // <-- نکته کلیدی: برای تشخیص پیش‌نمایش محلی
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  const UPLOADS_BASE_PATH =
    process.env.NEXT_PUBLIC_UPLOADS_BASE_PATH || "/uploads";

  useEffect(() => {
    if (imageUrl) {
      setPreview(`${UPLOADS_BASE_PATH}/${imageUrl}`);
      setIsLocalPreview(false); // این یک تصویر از سرور است، نه محلی
    } else {
      setPreview(null);
    }
  }, [imageUrl, UPLOADS_BASE_PATH]);

  const handleBusy = (isBusy) => onBusyStateChange?.(isBusy);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleBusy(true);

    // ساخت URL موقت فقط برای پیش‌نمایش با <img>
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);
    setIsLocalPreview(true); // <-- مهم: به کامپوننت می‌گوییم که از <img> استفاده کند

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathToRevalidate", revalidatePath);

    const result = await uploadImage(formData);

    // بعد از آپلود، URL موقت را آزاد می‌کنیم
    URL.revokeObjectURL(localPreviewUrl);

    if (result.success && result.relativePath) {
      onImageChange(result.relativePath);
      // useEffect بالا بقیه کار را انجام می‌دهد (نمایش با <Image>)
    } else {
      alert(result.message || "خطا در آپلود");
      // در صورت خطا، به پیش‌نمایش قبلی (در صورت وجود) بازگرد
      setPreview(imageUrl ? `${UPLOADS_BASE_PATH}/${imageUrl}` : null);
      setIsLocalPreview(false);
    }
    handleBusy(false);
  };

  const handleRemoveImage = () => {
    onImageChange("");
    setPreview(null);
  };

  const handleSelectFromLibrary = (relativePath) => {
    onImageChange(relativePath);
    setIsLibraryOpen(false);
  };

  // کامپوننت رندر تصویر بر اساس نوع پیش‌نمایش
  const ImagePreview = () => {
    if (!preview) {
      return (
        <div className="w-28 h-28 bg-[var(--background-tertiary)] rounded-md flex items-center justify-center text-center text-xs text-[var(--foreground-muted)] p-2">
          بدون تصویر
        </div>
      );
    }

    // اگر پیش‌نمایش یک فایل محلی (blob) بود، از <img> استفاده کن
    if (isLocalPreview) {
      return (
        <img
          src={preview}
          alt="پیش‌نمایش موقت"
          className="w-28 h-28 object-cover rounded-md border border-[var(--border-secondary)]"
        />
      );
    }

    // در غیر این صورت (تصویر از سرور)، از next/image بهینه استفاده کن
    return (
      <Image
        src={preview}
        alt="پیش‌نمایش تصویر شاخص"
        width={112} // 28 * 4
        height={112} // 28 * 4
        className="object-cover rounded-md border border-[var(--border-secondary)]"
      />
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
        تصویر شاخص
      </label>
      <div className="mt-1 flex flex-col sm:flex-row items-start gap-4 p-4 border-2 border-dashed border-[var(--border-primary)] rounded-lg bg-[var(--background-primary)]">
        <ImagePreview />
        <div className="flex flex-col gap-3 flex-grow">
          {/* بقیه کد بدون تغییر باقی می‌ماند */}
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
