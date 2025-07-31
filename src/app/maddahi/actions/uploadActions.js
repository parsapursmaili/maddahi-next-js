// /app/maddahi/actions/uploadActions.js
"use server";

import { promises as fs } from "fs";
import { join } from "path";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

// ابعاد مورد نظر برای تغییر اندازه
const RESIZE_DIMENSIONS = [
  { width: 560, height: 560, suffix: "560x560" },
  { width: 300, height: 300, suffix: "300x300" },
  { width: 150, height: 150, suffix: "150x150" },
];

function slugifyFileName(fileName) {
  const parts = fileName.split(".");
  let nameWithoutExt = parts.slice(0, -1).join(".");
  const ext = parts.length > 1 ? parts[parts.length - 1] : "";
  nameWithoutExt = nameWithoutExt.replace(/\s+/g, "-");
  nameWithoutExt = nameWithoutExt.replace(/--+/g, "-");
  nameWithoutExt = nameWithoutExt.replace(/^-+|-+$/g, "");
  if (!nameWithoutExt) {
    nameWithoutExt = "untitled-file";
  }
  return `${nameWithoutExt}${ext ? "." + ext : ""}`;
}

function getBaseFileName(fileName) {
  const nameWithoutExt = fileName.split(".").slice(0, -1).join(".");
  const match = nameWithoutExt.match(/^(.*?)(-\d+x\d+)?$/);
  return match ? match[1] : nameWithoutExt;
}

// *** تغییر مسیر آپلود: از public به storage ***
const BASE_UPLOAD_DIR = join(process.cwd(), "storage", "uploads");

export async function uploadImage(formData) {
  const file = formData.get("file");
  const pathToRevalidate = formData.get("pathToRevalidate") || "/";

  if (!file || file.size === 0) {
    return { success: false, message: "فایلی برای آپلود انتخاب نشده است." };
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const monthDir = join(BASE_UPLOAD_DIR, year, month); // استفاده از BASE_UPLOAD_DIR

  await fs.mkdir(monthDir, { recursive: true }).catch((e) => {
    if (e.code !== "EEXIST") throw e;
  });

  const originalFileNameWithExt = slugifyFileName(file.name);
  const baseName = getBaseFileName(originalFileNameWithExt);
  const buffer = Buffer.from(await file.arrayBuffer());

  const finalOriginalFileName = `${baseName}.webp`;
  const finalOriginalPath = join(monthDir, finalOriginalFileName);
  let relativePathToReturn = `${year}/${month}/${finalOriginalFileName}`;

  try {
    await sharp(buffer).webp({ quality: 80 }).toFile(finalOriginalPath);

    for (const size of RESIZE_DIMENSIONS) {
      const resizedFileName = `${baseName}-${size.suffix}.webp`;
      const resizedPath = join(monthDir, resizedFileName);
      await sharp(buffer)
        .resize(size.width, size.height, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(resizedPath);
    }

    revalidatePath(pathToRevalidate);
    return {
      success: true,
      message: "آپلود موفقیت‌آمیز بود.",
      relativePath: relativePathToReturn,
    };
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
    const uploadDir = BASE_UPLOAD_DIR; // استفاده از BASE_UPLOAD_DIR
    const pathParts = relativePath.split("/");
    const year = pathParts[0];
    const month = pathParts[1];
    const originalFileName = pathParts.slice(2).join("/");
    const baseName = getBaseFileName(originalFileName);

    const directory = join(uploadDir, year, month);

    const filesInDir = await fs.readdir(directory);

    const relatedFiles = filesInDir.filter(
      (file) => file.startsWith(baseName) && file.endsWith(".webp")
    );

    for (const fileToDelete of relatedFiles) {
      const filePath = join(directory, fileToDelete);
      await fs.unlink(filePath);
    }

    revalidatePath(pathToRevalidate);
    return { success: true, message: "فایل(ها) با موفقیت حذف شد(ند)." };
  } catch (error) {
    if (error.code === "ENOENT")
      return { success: false, message: "فایل یا پوشه یافت نشد." };
    console.error("خطا در حذف فایل:", error);
    return { success: false, message: "خطا هنگام حذف فایل." };
  }
}

export async function getMediaLibrary() {
  const uploadsDir = BASE_UPLOAD_DIR; // استفاده از BASE_UPLOAD_DIR
  const allFiles = [];
  try {
    const years = await fs.readdir(uploadsDir, { withFileTypes: true });
    for (const year of years) {
      if (!year.isDirectory()) continue;
      const yearPath = join(uploadsDir, year.name);
      const months = await fs.readdir(yearPath, { withFileTypes: true });
      for (const month of months) {
        if (!month.isDirectory()) continue;
        const monthPath = join(yearPath, month.name);
        const files = await fs.readdir(monthPath);

        for (const file of files) {
          if (
            file.endsWith(".webp") &&
            !RESIZE_DIMENSIONS.some((dim) => file.includes(`-${dim.suffix}.`))
          ) {
            allFiles.push(`${year.name}/${month.name}/${file}`);
          }
        }
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.error("خطا در خواندن رسانه:", error);
  }
  allFiles.sort((a, b) => {
    const [yearA, monthA] = a.split("/");
    const [yearB, monthB] = b.split("/");
    if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
    return parseInt(monthB) - parseInt(monthA);
  });
  return allFiles;
}
