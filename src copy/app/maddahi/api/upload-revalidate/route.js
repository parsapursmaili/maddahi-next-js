// app/api/upload-revalidate/route.js
import { NextRequest, NextResponse } from "next/server";
import { uploadImage as actualUploadImage } from "@/app/maddahi/actions/uploadActions";
import { revalidatePath as nextRevalidatePath } from "next/cache"; // استفاده از revalidatePath از Next.js

export async function POST(request) {
  const formData = await request.formData();
  const pathToRevalidate = formData.get("pathToRevalidate") || "/";

  // فرض کنید uploadImage یک فانکشن مستقل است و فقط آپلود رو انجام میده
  // و revalidatePath رو از اینجا کنترل می‌کنیم.
  const uploadResult = await actualUploadImage(formData); // اینجا uploadImage اصلی رو صدا می‌زنیم

  if (uploadResult.success) {
    // revalidatePath رو اینجا فراخوانی می‌کنیم
    // این کار باعث میشه کش HTML مسیر مشخص شده invalid بشه
    // و در درخواست بعدی دوباره ساخته بشه.
    // امیدواریم این Revalidation باعث بشه Image Optimizer هم متوجه تغییرات بشه.
    nextRevalidatePath(pathToRevalidate);

    // همچنین اگر نیاز به revalidate کردن مسیر _next/image/_next/static/image هم باشه،
    // (که ممکنه مستقیماً با revalidatePath انجام نشه)
    // باید حواسمون به Cache-Control Headers باشه.
    // در production، اگر CDN رو درست تنظیم کرده باشید، با پاکسازی کش CDN هم میشه این مشکل رو حل کرد.
  }

  return NextResponse.json(uploadResult);
}
