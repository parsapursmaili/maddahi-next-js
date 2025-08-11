"use server";

import { db } from "@/app/maddahi/lib/db/mysql";
import { revalidatePath } from "next/cache";

export async function submitComment(formData) {
  // --- خواندن داده‌های فرم ---
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const text = formData.get("commentText")?.toString();
  const postId = formData.get("postId")?.toString();
  const parentId = formData.get("parentId")?.toString() || null;
  // ★★★ تغییر ۱: خواندن نوع پست از فرم دیتا ★★★
  const postType = formData.get("postType")?.toString();

  // ★★★ تغییر ۲: اعتبارسنجی نوع پست هم اضافه شد ★★★
  if (!name || !text || !postId || !postType) {
    return {
      success: false,
      message: "اطلاعات ارسالی ناقص است. لطفاً تمام فیلدهای ضروری را پر کنید.",
    };
  }

  try {
    // ★★★ تغییر ۳: کوئری INSERT برای ذخیره post_type اصلاح شد ★★★
    await db.query(
      `INSERT INTO comments (post_id, post_type, parent_id, name, email, text, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [postId, postType, parentId, name, email, text, 0] // status=0 یعنی در انتظار تایید
    );

    // این بخش بدون تغییر باقی می‌ماند
    // نکته: برای اینکه revalidate به درستی کار کند، باید slug پست را داشته باشیم
    // که در این ساختار ساده، آن را نداریم. revalidateTag راه حل بهتری است
    // اما طبق خواسته شما فعلاً به آن نمی‌پردازیم.
    if (postType === "post") {
      // revalidatePath(`/posts/${postId}`); // این نیاز به slug دارد، نه ID
    } else if (postType === "soogname") {
      // revalidatePath(`/soogname/${postId}`); // این هم نیاز به slug دارد
    }

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
