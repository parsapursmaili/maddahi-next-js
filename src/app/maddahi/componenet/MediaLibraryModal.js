// /app/maddahi/components/admin/MediaLibraryModal.js
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  getMediaLibrary,
  deleteImage,
} from "@/app/maddahi/actions/uploadActions";

export default function MediaLibraryModal({
  onClose,
  onSelectImage,
  revalidatePath,
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const media = await getMediaLibrary();
        setImages(media);
      } catch (error) {
        console.error("Failed to fetch media:", error);
        alert("خطا در بارگذاری رسانه‌ها.");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleDelete = async (e, imagePath) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `آیا از حذف فایل "${imagePath.split("/").pop()}" مطمئن هستید؟`
      )
    ) {
      return;
    }
    const result = await deleteImage(imagePath, revalidatePath);
    if (result.success) {
      setImages((prev) => prev.filter((img) => img !== imagePath));
    } else {
      alert(result.message);
    }
  };

  const filteredImages = useMemo(
    () =>
      images.filter((img) =>
        img.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [images, searchTerm]
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[var(--background-secondary)] rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col border border-[var(--border-primary)] transition-all duration-200 ease-out ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border-primary)] flex justify-between items-center">
          <h3 className="text-xl font-bold">کتابخانه رسانه</h3>
          <button
            onClick={handleClose}
            className="text-3xl hover:text-[var(--accent-primary)] transition-colors"
          >
            ×
          </button>
        </div>
        <div className="p-4 border-b border-[var(--border-primary)]">
          <input
            type="text"
            placeholder="جستجو..."
            className="w-full p-2 bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-md focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          {loading ? (
            <p className="text-center text-[var(--foreground-secondary)]">
              در حال بارگذاری...
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
              {filteredImages.map((path) => (
                <div
                  key={path}
                  className="group relative cursor-pointer aspect-square"
                  onClick={() => onSelectImage(path)}
                >
                  <button
                    onClick={(e) => handleDelete(e, path)}
                    className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/70 text-white text-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error)]"
                    title="حذف"
                  >
                    ×
                  </button>
                  <Image
                    fill
                    src={`${
                      process.env.NEXT_PUBLIC_BASE_URL || ""
                    }/uploads/${path}`} // ★★★ بهینه‌سازی ★★★
                    alt={path.split("/").pop() || "تصویر رسانه"}
                    sizes="(max-width: 640px) 25vw, (max-width: 768px) 16.6vw, 12.5vw"
                    className="object-cover rounded-md border-2 border-[var(--border-secondary)] group-hover:border-[var(--accent-primary)] transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
