// /app/maddahi/actions/uploadActions.js
"use server";

import { writeFile, stat, mkdir, readdir, unlink } from "fs/promises";
import { join, basename } from "path";
import { revalidatePath } from "next/cache";

// تابع کمکی برای تبدیل فاصله‌ها به خط تیره در نام فایل
function slugifyFileName(fileName) {
  const parts = fileName.split(".");
  const ext = parts.pop(); // پسوند فایل را جدا می‌کند
  let nameWithoutExt = parts.join("."); // نام فایل بدون پسوند

  // ★★★ تنها تغییر مهم: جایگزینی تمام فاصله‌ها با خط تیره ★★★
  nameWithoutExt = nameWithoutExt.replace(/\s+/g, "-");

  // حذف خط تیره های اضافی پشت سر هم و از ابتدا و انتهای رشته (اختیاری، برای تمیزی بیشتر)
  nameWithoutExt = nameWithoutExt.replace(/--+/g, "-");
  nameWithoutExt = nameWithoutExt.replace(/^-+|-+$/g, "");

  // اطمینان از اینکه نام خالی نباشد و یک نام پیش فرض داشته باشد
  if (!nameWithoutExt) {
    nameWithoutExt = "untitled-file";
  }

  return `${nameWithoutExt}.${ext}`;
}

export async function uploadImage(formData) {
  const file = formData.get("file");
  const pathToRevalidate = formData.get("pathToRevalidate") || "/";

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

  const originalFileName = basename(file.name);
  // ★★★ استفاده از slugifyFileName برای تغییر نام فایل قبل از ذخیره ★★★
  const finalFileName = slugifyFileName(originalFileName);

  const finalPath = join(monthDir, finalFileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await writeFile(finalPath, buffer);
    const relativePath = `${year}/${month}/${finalFileName}`; // استفاده از نام فایل جدید
    revalidatePath(pathToRevalidate);
    return { success: true, message: "آپلود موفقیت‌آمیز بود.", relativePath };
  } catch (error) {
    console.error("خطا در ذخیره فایل:", error);
    return { success: false, message: "خطا در ذخیره‌سازی فایل." };
  }
}

export async function deleteImage(relativePath, pathToRevalidate = "/") {
  if (!relativePath) {
    return { success: false, message: "مسیر فایل برای حذف مشخص نشده است." };
  }
  try {
    const fullPath = join(process.cwd(), "public", "uploads", relativePath);
    await unlink(fullPath);
    revalidatePath(pathToRevalidate);
    return { success: true, message: "فایل با موفقیت حذف شد." };
  } catch (error) {
    if (error.code === "ENOENT")
      return { success: false, message: "فایل یافت نشد." };
    console.error("خطا در حذف فایل:", error);
    return { success: false, message: "خطا هنگام حذف فایل." };
  }
}

export async function getMediaLibrary() {
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
