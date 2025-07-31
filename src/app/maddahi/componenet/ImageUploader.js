// /app/maddahi/components/admin/ImageUploader.js
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { uploadImage } from "@/app/maddahi/actions/uploadActions";
import MediaLibraryModal from "./MediaLibraryModal";

export default function ImageUploader({
  title,
  imageUrl, // این imageUrl از پراپس میاد (مثلاً از دیتابیس)
  onImageChange,
  onBusyStateChange,
  revalidatePath,
}) {
  const [preview, setPreview] = useState(null);
  const [isLocalPreview, setIsLocalPreview] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // این useEffect برای حالتی است که imageUrl از بیرون (مثلاً دیتابیس) تغییر می‌کند
    // و شامل عکس‌های از قبل موجود و عکس‌های تازه آپلود شده از رفرش صفحه است.
    if (imageUrl) {
      // برای شکستن کش، یک timestamp به URL اضافه می‌کنیم.
      setPreview(`/uploads/${imageUrl}?t=${new Date().getTime()}`);
      setIsLocalPreview(false);
    } else {
      setPreview(null);
    }
  }, [imageUrl]);

  const handleBusy = (isBusy) => onBusyStateChange?.(isBusy);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    handleBusy(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl); // نمایش فوری پیش‌نمایش لوکال
    setIsLocalPreview(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathToRevalidate", revalidatePath);

    const result = await uploadImage(formData);
    URL.revokeObjectURL(localPreviewUrl); // URL موقت را آزاد کنید

    if (result.success && result.relativePath) {
      // ★★★ تغییر مهم: بلافاصله preview را با URL کامل و timestamp به‌روز می‌کنیم ★★★
      // این اطمینان می‌دهد که حتی اگر Next.js کش کرده باشد، URL جدید باعث بارگذاری مجدد شود.
      const newImageUrlWithTimestamp = `/uploads/${
        result.relativePath
      }?t=${new Date().getTime()}`;
      setPreview(newImageUrlWithTimestamp);
      setIsLocalPreview(false);
      onImageChange(result.relativePath); // این پراپ را به والد می‌فرستد که مقدار را در دیتابیس ذخیره کند
    } else {
      alert(result.message || "خطا در آپلود");
      // در صورت خطا، به URL قبلی (اگر وجود دارد) برگردید
      // با افزودن timestamp برای شکستن کش احتمالی تصویر قبلی
      setPreview(
        imageUrl ? `/uploads/${imageUrl}?t=${new Date().getTime()}` : null
      );
      setIsLocalPreview(false);
    }
    handleBusy(false);
  };

  const handleRemoveImage = () => {
    onImageChange("");
    setPreview(null);
  };

  const handleSelectFromLibrary = (relativePath) => {
    // وقتی از کتابخانه انتخاب می‌شود، `onImageChange` فراخوانی می‌شود
    // که `imageUrl` پراپ را تغییر می‌دهد و `useEffect` بالا مسئول به‌روزرسانی `preview` است.
    // اما برای اطمینان از شکستن کش در این حالت نیز:
    const selectedImageUrlWithTimestamp = `/uploads/${relativePath}?t=${new Date().getTime()}`;
    setPreview(selectedImageUrlWithTimestamp);
    setIsLocalPreview(false);
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

    if (isLocalPreview) {
      return (
        <img
          src={preview}
          alt="پیش‌نمایش موقت"
          className="w-28 h-28 object-cover rounded-md border border-[var(--border-secondary)]"
        />
      );
    }

    return (
      <Image
        src={preview} // این preview حاوی timestamp است
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
