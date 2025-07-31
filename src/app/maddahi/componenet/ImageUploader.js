"use client";

import { useState, useRef, useEffect } from "react";
import MediaLibraryModal from "./MediaLibraryModal";

export default function ImageUploader({
  title,
  imageUrl, // این imageUrl مسیر نسبی به فایل اصلی است (مثلاً '2025/07/my-image.webp')
  onImageChange,
  onBusyStateChange,
  revalidatePath,
}) {
  const [preview, setPreview] = useState(null);
  const [isLocalPreview, setIsLocalPreview] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageUrl) {
      // imageUrl: '2025/07/my-image.webp'
      const pathParts = imageUrl.split("/");
      const year = pathParts[0];
      const month = pathParts[1];
      const fileName = pathParts.slice(2).join("/"); // نام فایل اصلی

      // ساخت مسیر API جدید با کوئری پارامترها
      const apiImageUrl = `/maddahi/api/getimg?year=${year}&month=${month}&fileName=${fileName}&size=150x150&t=${new Date().getTime()}`;
      setPreview(apiImageUrl);
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
    setPreview(localPreviewUrl);
    setIsLocalPreview(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pathToRevalidate", revalidatePath);

    // فراخوانی API Route برای آپلود
    const response = await fetch("/maddahi/api/upload-revalidate", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    URL.revokeObjectURL(localPreviewUrl); // URL موقت را آزاد کنید

    if (result.success && result.relativePath) {
      // result.relativePath: '2025/07/my-image.webp'
      const pathParts = result.relativePath.split("/");
      const year = pathParts[0];
      const month = pathParts[1];
      const fileName = pathParts.slice(2).join("/"); // نام فایل اصلی

      // ما از این مسیر اصلی برای ساخت URL API برای نمایش پیش‌نمایش استفاده می‌کنیم.
      const newApiImageUrl = `/maddahi/api/getimg?year=${year}&month=${month}&fileName=${fileName}&size=150x150&t=${new Date().getTime()}`;
      setPreview(newApiImageUrl);
      setIsLocalPreview(false);
      onImageChange(result.relativePath); // این پراپ را به والد می‌فرستد که مقدار را در دیتابیس ذخیره کند (مسیر اصلی)
    } else {
      // نکته: در یک اپلیکیشن واقعی، از یک modal سفارشی به جای alert() استفاده کنید.
      alert(result.message || "خطا در آپلود");
      setPreview(
        imageUrl
          ? (() => {
              const pathParts = imageUrl.split("/");
              const year = pathParts[0];
              const month = pathParts[1];
              const fileName = pathParts.slice(2).join("/");
              return `/maddahi/api/getimg?year=${year}&month=${month}&fileName=${fileName}&size=150x150&t=${new Date().getTime()}`;
            })()
          : null
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
    // relativePath از MediaLibraryModal می‌آید و مسیر به فایل اصلی است.
    const pathParts = relativePath.split("/");
    const year = pathParts[0];
    const month = pathParts[1];
    const fileName = pathParts.slice(2).join("/");

    const selectedApiImageUrl = `/maddahi/api/getimg?year=${year}&month=${month}&fileName=${fileName}&size=150x150&t=${new Date().getTime()}`;
    setPreview(selectedApiImageUrl);
    setIsLocalPreview(false);
    onImageChange(relativePath); // این پراپ را به والد می‌فرستد که مقدار را در دیتابیس ذخیره کند (مسیر اصلی)
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
      <img // تگ <img>
        src={preview} // استفاده از مسیر API جدید
        alt={title || "پیش‌نمایش تصویر"}
        width={112} // تعیین عرض و ارتفاع برای تگ <img>
        height={112} // تعیین عرض و ارتفاع برای تگ <img>
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
