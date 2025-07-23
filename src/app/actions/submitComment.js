// app/actions/submitComment.js

"use server";

import { db } from "@/app/lib/db/mysql";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

/**
 * این Server Action یک کامنت جدید را در دیتابیس ذخیره می‌کند.
 * @param {FormData} formData - داده‌های ارسالی از فرم کامنت.
 * @returns {Promise<{success: boolean, message: string}>} - نتیجه عملیات.
 */
export async function submitComment(formData) {
  // استخراج داده‌ها از FormData
  const name = formData.get("name");
  const email = formData.get("email");
  const commentText = formData.get("commentText");
  const postId = formData.get("postId");
  const parentId = formData.get("parentId") || null; // برای پشتیبانی از پاسخ به کامنت‌ها

  // اعتبارسنجی اولیه
  if (!name || !commentText || !postId) {
    return { success: false, message: "نام، متن نظر و شناسه پست الزامی است." };
  }

  // گرفتن اطلاعات کاربر از هدرها
  const ip_address = headers().get("x-forwarded-for") || "unknown";
  const user_agent = headers().get("user-agent") || "unknown";

  try {
    // درج کامنت جدید با وضعیت "در حال انتظار" (status = 0)
    await db.query(
      `INSERT INTO comments (post_id, parent_id, name, email, text, ip_address, user_agent, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        postId, // <-- شناسه پست اضافه شد
        parentId,
        name,
        email,
        commentText,
        ip_address,
        user_agent,
        0, // وضعیت 0 به معنای "در حال انتظار"
      ]
    );

    // کش صفحه‌ی پست را خالی می‌کند تا کامنت جدید (پس از تایید) نمایش داده شود.
    // مطمئن شوید که مسیر صفحه پست با الگوی شما مطابقت دارد.
    revalidatePath(`/posts/${postId}`); // مسیر را بر اساس ساختار URL خود تنظیم کنید

    return {
      success: true,
      message: "نظر شما با موفقیت ارسال شد و پس از تایید نمایش داده خواهد شد.",
    };
  } catch (error) {
    console.error("Error submitting comment:", error);
    return {
      success: false,
      message: "خطایی در ارسال نظر رخ داد. لطفا دوباره تلاش کنید.",
    };
  }
}
