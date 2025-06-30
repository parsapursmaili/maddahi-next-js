// app/api/comments/route.js
import { db } from "@/app/lib/db/mysql"; // مطمئن شوید که مسیر صحیح است
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { postId, authorName, authorEmail, commentContent } =
      await request.json();

    const userIp = request.ip || null; // request.ip توسط Next.js فراهم می‌شود
    const userAgent = request.headers.get("user-agent") || null;
    // اعتبارسنجی طول متن کامنت
    if (commentContent.length > 1000) {
      // حداکثر 1000 کاراکتر برای متن نظر
      return NextResponse.json(
        { message: "متن نظر بیش از حد طولانی است (حداکثر 1000 کاراکتر)." },
        { status: 400 }
      );
    }
    // اعتبارسنجی طول نام نویسنده
    if (authorName.length > 100) {
      // حداکثر 100 کاراکتر برای نام
      return NextResponse.json(
        { message: "نام نویسنده بیش از حد طولانی است (حداکثر 100 کاراکتر)." },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت ایمیل (در صورت وجود)
    const trimmedEmail = authorEmail ? authorEmail.trim() : null;
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "فرمت ایمیل وارد شده صحیح نیست." },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO comments (post_id, author_name, author_email, comment_content,user_id,user_agent, created_at, status)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        postId,
        authorName.trim(),
        trimmedEmail, // null خواهد بود اگر کاربر ایمیل وارد نکرده باشد
        commentContent.trim(),
        userId,
        userAgent,
        0,
      ]
    );

    // --- 3. پاسخ موفقیت‌آمیز ---
    return NextResponse.json(
      {
        message: "نظر با موفقیت ارسال شد و در انتظار تأیید است.",
        commentId: result.insertId,
      },
      { status: 201 } // 201 Created: نشان‌دهنده ایجاد موفقیت‌آمیز یک منبع جدید
    );
  } catch (error) {
    // --- 4. مدیریت خطا ---
    console.error("خطا در هنگام ثبت نظر:", error);
    // در محیط پروداکشن، جزئیات خطا را به کاربر نشان ندهید
    return NextResponse.json(
      { message: "خطای داخلی سرور. لطفا دوباره تلاش کنید." },
      { status: 500 } // Internal Server Error
    );
  }
}
