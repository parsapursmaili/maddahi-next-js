// app/lib/actions/commentActions.js
"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath } from "next/cache";

export async function submitComment(formData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const text = formData.get("commentText")?.toString();
  const postId = formData.get("postId")?.toString();
  const parentId = formData.get("parentId")?.toString() || null; // دریافت parentId

  // اعتبارسنجی اولیه
  if (!name || !text || !postId) {
    return { success: false, message: "لطفاً تمام فیلدهای ضروری را پر کنید." };
  }

  try {
    await db.query(
      `INSERT INTO comments (post_id, parent_id, name, email, text, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [postId, parentId, name, email, text, 0] // status=0 یعنی در انتظار تایید
    );

    // بعد از ثبت موفق، کش صفحه را پاک می‌کنیم تا کامنت جدید (بعد از تایید مدیر) نمایش داده شود
    revalidatePath(`/posts/${postId}`); // postId اینجا باید اسلاگ پست باشد

    return {
      success: true,
      message: "نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده خواهد شد.",
    };
  } catch (error) {
    console.error("Error submitting comment:", error);
    return {
      success: false,
      message: "خطایی در ثبت نظر رخ داد. لطفاً دوباره تلاش کنید.",
    };
  }
}
