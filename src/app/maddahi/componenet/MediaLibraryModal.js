"use client";

import { useState, useEffect, useMemo } from "react";
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
        // نکته: در یک اپلیکیشن واقعی، از یک modal سفارشی به جای alert() استفاده کنید.
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
    // نکته: در یک اپلیکیشن واقعی، از یک modal سفارشی به جای window.confirm() استفاده کنید.
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
      // نکته: در یک اپلیکیشن واقعی، از یک modal سفارشی به جای alert() استفاده کنید.
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
              {filteredImages.map((path) => {
                // path: 'سال/ماه/نام-فایل-اصلی.webp' (مثلاً '2025/07/pirahan-yousef.webp')
                const pathParts = path.split("/");
                const year = pathParts[0];
                const month = pathParts[1];
                const fileName = pathParts.slice(2).join("/"); // نام فایل اصلی

                // ساخت مسیر API جدید با کوئری پارامترها
                const apiImageUrl = `/maddahi/api/getimg?year=${year}&month=${month}&fileName=${fileName}&size=150x150&t=${new Date().getTime()}`;

                return (
                  <div
                    key={path}
                    className="group relative cursor-pointer aspect-square"
                    onClick={() => onSelectImage(path)} // همچنان مسیر اصلی را برمی‌گردانیم
                  >
                    <button
                      onClick={(e) => handleDelete(e, path)}
                      className="absolute top-1 right-1 z-10 w-6 h-6 bg-black/70 text-white text-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--error)]"
                      title="حذف"
                    >
                      ×
                    </button>
                    <img // تگ <img>
                      src={apiImageUrl} // استفاده از مسیر API جدید
                      alt={path.split("/").pop() || "تصویر رسانه"}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      className="rounded-md border-2 border-[var(--border-secondary)] group-hover:border-[var(--accent-primary)] transition-all"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
