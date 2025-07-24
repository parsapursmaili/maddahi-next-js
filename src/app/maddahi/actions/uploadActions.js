"use server";

import { writeFile, stat, mkdir, readdir, unlink } from "fs/promises";
import { join, basename } from "path";
import { revalidatePath } from "next/cache";

export async function uploadImage(formData) {
  const file = formData.get("file");
  const pathToRevalidate = formData.get("pathToRevalidate") || "/"; // دریافت مسیر از کلاینت

  if (!file || file.size === 0) {
    return { success: false, message: "فایلی برای آپلود انتخاب نشده است." };
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const monthDir = join(process.cwd(), "public", "uploads", year, month);

  await mkdir(monthDir, { recursive: true }).catch((e) => {
    if (e.code !== "EEXIST") throw e;
  });

  const finalFileName = basename(file.name);
  const finalPath = join(monthDir, finalFileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(finalPath, buffer);
    const relativePath = `${year}/${month}/${finalFileName}`;
    revalidatePath(pathToRevalidate); // استفاده از مسیر داینامیک
    return { success: true, message: "آپلود موفقیت‌آمیز بود.", relativePath };
  } catch (error) {
    console.error("خطا در ذخیره فایل:", error);
    return { success: false, message: "خطا در ذخیره‌سازی فایل." };
  }
}

export async function deleteImage(relativePath, pathToRevalidate = "/") {
  // دریافت مسیر از کلاینت
  if (!relativePath) {
    return { success: false, message: "مسیر فایل برای حذف مشخص نشده است." };
  }
  try {
    const fullPath = join(process.cwd(), "public", "uploads", relativePath);
    await unlink(fullPath);
    revalidatePath(pathToRevalidate); // استفاده از مسیر داینامیک
    return { success: true, message: "فایل با موفقیت حذف شد." };
  } catch (error) {
    if (error.code === "ENOENT")
      return { success: false, message: "فایل یافت نشد." };
    console.error("خطا در حذف فایل:", error);
    return { success: false, message: "خطا هنگام حذف فایل." };
  }
}

export async function getMediaLibrary() {
  // این تابع نیازی به تغییر ندارد
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const allFiles = [];
  try {
    const years = await readdir(uploadsDir, { withFileTypes: true });
    for (const year of years) {
      if (!year.isDirectory()) continue;
      const yearPath = join(uploadsDir, year.name);
      const months = await readdir(yearPath, { withFileTypes: true });
      for (const month of months) {
        if (!month.isDirectory()) continue;
        const monthPath = join(yearPath, month.name);
        const files = await readdir(monthPath);
        allFiles.push(
          ...files.map((file) => `${year.name}/${month.name}/${file}`)
        );
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.error("خطا در خواندن رسانه:", error);
  }
  return allFiles.sort().reverse();
}
