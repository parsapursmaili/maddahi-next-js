// app/maddahi/api/getimg/route.js

import { NextResponse } from "next/server";
import { join } from "path";
import { stat, readFile } from "fs/promises";
import mime from "mime-types";
import { createHash } from "crypto"; // برای ساخت ETag

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
  // بخش دریافت پارامترها و ساخت مسیر فایل (بدون تغییر)
  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const fileName = url.searchParams.get("fileName");
  const sizeParam = url.searchParams.get("size");

  if (!year || !month || !fileName) {
    return NextResponse.json(
      { error: "پارامترهای year, month و fileName اجباری هستند." },
      { status: 400 }
    );
  }

  const baseFileNameWithoutExt = fileName.replace(/\.webp$/, "");
  let targetFileName = "";

  if (sizeParam === "original") {
    targetFileName = `${baseFileNameWithoutExt}.webp`;
  } else {
    const foundSize = AVAILABLE_SIZES.find((s) => s.suffix === sizeParam);
    if (foundSize && foundSize.suffix !== "") {
      targetFileName = `${baseFileNameWithoutExt}-${foundSize.suffix}.webp`;
    } else {
      targetFileName = `${baseFileNameWithoutExt}.webp`;
    }
  }

  const imageFullPath = join(BASE_STORAGE_DIR, year, month, targetFileName);

  try {
    // ======== بهینه‌سازی اصلی در این بخش است ========

    // ابتدا فقط اطلاعات فایل (مانند زمان آخرین ویرایش) را میخوانیم، نه کل فایل
    const stats = await stat(imageFullPath);
    // یک ETag بر اساس اندازه فایل و زمان آخرین ویرایش آن می‌سازیم.
    // این روش بسیار سریع‌تر از خواندن کل فایل و هش کردن آن است.
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;

    // ETag ارسالی از سمت مرورگر را چک می‌کنیم
    const ifNoneMatch = request.headers.get("if-none-match");

    if (ifNoneMatch === etag) {
      // اگر ETag ها یکی بودند، یعنی مرورگر نسخه صحیح را دارد.
      // یک پاسخ خالی با کد 304 می‌فرستیم و کار تمام است.
      // سرور هیچ فایل سنگینی را ارسال نمیکند.
      return new Response(null, { status: 304 });
    }

    // اگر ETag ها یکی نبودند (یا اولین درخواست بود)، حالا کل فایل را میخوانیم
    const imageBuffer = await readFile(imageFullPath);
    const contentType =
      mime.lookup(targetFileName) || "application/octet-stream";

    // فایل را به همراه هدرهای کشینگ و ETag جدید ارسال می‌کنیم
    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        // کش بسیار طولانی مدت برای مرورگر و CDN
        "Cache-Control": "public, max-age=31536000, immutable",
        // ETag برای بهینه‌سازی درخواست‌های بعدی
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
