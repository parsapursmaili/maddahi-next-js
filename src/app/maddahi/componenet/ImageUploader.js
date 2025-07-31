// /app/maddahi/components/admin/ImageUploader.js
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
// import { uploadImage } from "@/app/maddahi/actions/uploadActions"; // این خط رو حذف کنید
import MediaLibraryModal from "./MediaLibraryModal";

export default function ImageUploader({
  title,
  imageUrl,
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
      setPreview(
        `${encodeURI(`/uploads/${imageUrl}?t=${new Date().getTime()}`)}`
      );
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
    formData.append("pathToRevalidate", revalidatePath); // مسیر revalidate رو هم بفرستید

    // ★★★ تغییر مهم: فراخوانی API Route به جای Server Action مستقیم ★★★
    const response = await fetch("/maddahi/api/upload-revalidate", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    URL.revokeObjectURL(localPreviewUrl);

    if (result.success && result.relativePath) {
      const newImageUrlWithTimestamp = `/uploads/${
        result.relativePath
      }?t=${new Date().getTime()}`;
      setPreview(newImageUrlWithTimestamp);
      setIsLocalPreview(false);
      onImageChange(result.relativePath);
    } else {
      alert(result.message || "خطا در آپلود");
      setPreview(
        imageUrl
          ? `${encodeURI(`/uploads/${imageUrl}?t=${new Date().getTime()}`)}`
          : null
      );
      setIsLocalPreview(false);
    }
    handleBusy(false);
  };

  // بقیه کد ImageUploader.js بدون تغییر
  const handleRemoveImage = () => {
    onImageChange("");
    setPreview(null);
  };

  const handleSelectFromLibrary = (relativePath) => {
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
