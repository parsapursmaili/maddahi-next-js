// /app/api/log-time/route.js (این فایل را ایجاد یا ویرایش کنید)

import { logUserTime } from "@/app/maddahi/actions/logTimeAction";

export async function POST(request) {
  try {
    const { postId, seconds } = await request.json();

    // فراخوانی منطق اصلی از فایل اکشن
    await logUserTime(postId, seconds);
  } catch (error) {
    // این بخش عمدی خالی است تا در صورت بروز خطا در پارس کردن، عملیات مختل نشود.
  }

  // همیشه یک پاسخ موفقیت‌آمیز و خالی برگردان. این برای `sendBeacon` حیاتی است.
  return new Response(null, { status: 204 });
}
