// /app/maddahi/api/log-time/route.js
import { logUserTime } from "@/app/maddahi/actions/logTimeAction";

export async function POST(request) {
  try {
    // به لطف ارسال Blob از کلاینت، request.json() به درستی کار خواهد کرد
    const { postId, seconds } = await request.json();

    if (postId && typeof seconds === "number") {
      // فراخوانی منطق اصلی از فایل اکشن شما
      await logUserTime(postId, seconds);
    }
  } catch (error) {
    // خطا را در کنسول سرور لاگ کن تا در صورت بروز مشکل، متوجه آن شوی
    console.error("Error in /api/log-time route:", error);
  }

  // همیشه یک پاسخ موفقیت‌آمیز و خالی برگردان. این برای `sendBeacon` حیاتی است.
  return new Response(null, { status: 204 });
}
