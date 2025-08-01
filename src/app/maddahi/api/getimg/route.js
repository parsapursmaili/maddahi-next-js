import { NextResponse } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";
import mime from "mime-types";

// ابعاد موجود (بدون تغییر)
const AVAILABLE_SIZES = [
  { width: 560, height: 560, suffix: "560x560" },
  { width: 300, height: 300, suffix: "300x300" },
  { width: 150, height: 150, suffix: "150x150" },
  { width: "original", height: "original", suffix: "" },
];

// مسیر پایه برای خواندن فایل‌ها (بدون تغییر)
const BASE_STORAGE_DIR = join(process.cwd(), "storage", "uploads");

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // استخراج پارامترها از URL
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const originalFileName = searchParams.get("fileName");
  const sizeParam = searchParams.get("size");

  // اعتبارسنجی پارامترهای ضروری
  if (!year || !month || !originalFileName) {
    return NextResponse.json(
      { error: "پارامترهای year، month و fileName ضروری هستند." },
      { status: 400 }
    );
  }

  const baseFileNameWithoutExt = originalFileName.replace(/\.webp$/, "");
  let targetFileName = "";

  // منطق انتخاب سایز تصویر
  if (sizeParam === "original") {
    targetFileName = originalFileName;
  } else {
    const foundSize = AVAILABLE_SIZES.find((s) => s.suffix === sizeParam);
    if (foundSize && foundSize.suffix) {
      // اگر سایز مشخص و معتبر بود، نام فایل با پسوند سایز را بساز
      targetFileName = `${baseFileNameWithoutExt}-${foundSize.suffix}.webp`;
    } else {
      // اگر سایز مشخص نشده یا نامعتبر بود، از تصویر اصلی استفاده کن
      targetFileName = originalFileName;
    }
  }

  // ساخت مسیر کامل فایل روی سرور
  const imageFullPath = join(BASE_STORAGE_DIR, year, month, targetFileName);

  try {
    const stats = await stat(imageFullPath);
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    const ifNoneMatch = request.headers.get("if-none-match");

    // مدیریت کش با ETag
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }

    const imageBuffer = await readFile(imageFullPath);
    const contentType =
      mime.lookup(targetFileName) || "application/octet-stream";

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
      return NextResponse.json(
        { error: "تصویر درخواست شده یافت نشد." },
        { status: 404 }
      );
    }
    console.error("خطا در دسترسی به تصویر:", error);
    return NextResponse.json(
      { error: "خطای سرور در دسترسی به تصویر." },
      { status: 500 }
    );
  }
}
