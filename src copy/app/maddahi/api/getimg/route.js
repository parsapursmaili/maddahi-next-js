import { NextResponse } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";
import mime from "mime-types";

// تعریف اندازه‌ها به صورت یک شیء برای دسترسی سریع‌تر
const AVAILABLE_SIZES = {
  560: "560x560",
  300: "300x300",
  150: "150x150",
};

const BASE_STORAGE_DIR = join(process.cwd(), "storage", "uploads");

/**
 * یک تابع کمکی برای خواندن و ارسال فایل تصویر
 * @param {string} filePath - مسیر کامل فایل
 * @param {Request} request - آبجکت درخواست ورودی
 * @returns {Promise<Response|null>} - یک آبجکت Response در صورت موفقیت یا null اگر فایل یافت نشود
 */
async function serveImage(filePath, request) {
  try {
    const stats = await stat(filePath);
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    const imageBuffer = await readFile(filePath);
    const contentType = mime.lookup(filePath) || "application/octet-stream";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
      status: 200,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const originalFileName = searchParams.get("fileName");
    const sizeParam = searchParams.get("size");

    if (!year || !month || !originalFileName) {
      return NextResponse.json(
        { error: "پارامترهای year، month و fileName ضروری هستند." },
        { status: 400 }
      );
    }

    let targetFilePath = null;
    const originalFilePath = join(
      BASE_STORAGE_DIR,
      year,
      month,
      originalFileName
    );

    // **بخش کلیدی تغییر یافته**
    // 1. sizeParam را به رشته تبدیل می‌کنیم.
    // 2. سپس از آن به عنوان کلید برای جستجو در شیء AVAILABLE_SIZES استفاده می‌کنیم.
    const sizeAsString = sizeParam ? String(sizeParam) : null;
    const foundSuffix = AVAILABLE_SIZES[sizeAsString];

    if (foundSuffix) {
      const baseFileNameWithoutExt = originalFileName.replace(/\.webp$/, "");
      const sizedFileName = `${baseFileNameWithoutExt}-${foundSuffix}.webp`;
      targetFilePath = join(BASE_STORAGE_DIR, year, month, sizedFileName);

      const response = await serveImage(targetFilePath, request);
      if (response) {
        return response;
      }
    }

    // اگر سایز درخواستی در لیست نبود یا فایل سایزدار پیدا نشد، فایل اصلی را برگردان
    const response = await serveImage(originalFilePath, request);
    if (response) {
      return response;
    }

    // اگر هیچ کدام پیدا نشد
    return NextResponse.json(
      { error: "تصویر درخواست شده یافت نشد." },
      { status: 404 }
    );
  } catch (error) {
    console.error("خطا در دسترسی به تصویر:", error);
    return NextResponse.json(
      { error: "خطای سرور در دسترسی به تصویر." },
      { status: 500 }
    );
  }
}
