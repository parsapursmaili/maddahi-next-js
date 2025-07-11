// app/view/page.jsx
import { db } from "@/app/lib/db/mysql";
import { unstable_noStore as noStore } from "next/cache"; // 👈 ایمپورت صحیح noStore

export default async function Page() {
  // این خط تضمین می‌کنه که داده‌ها همیشه تازه از دیتابیس خونده بشن و کش نشن
  noStore();

  const [rows] = await db.query(`select view from posts`);
  let totalViews = 0;

  // جمع کردن تمام بازدیدها
  for (const row of rows) {
    if (parseInt(row.view) == null) {
    } else totalViews += parseInt(row.view);
  }
  console.log("total: ", totalViews);

  return (
    // کانتینر اصلی صفحه: تمام صفحه رو می‌پوشونه و محتوا رو وسط قرار می‌ده
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-4">
      {/* کارت نمایش بازدید: با افکت شیشه‌ای، سایه و گرادیانت متنی (بدون styled-jsx) */}
      <div className="relative p-8 rounded-3xl shadow-2xl shadow-purple-900/50 backdrop-blur-lg border border-gray-700/50 flex flex-col items-center justify-center min-w-[300px] min-h-[200px] transform transition-all duration-300 hover:scale-105 hover:shadow-purple-700/70">
        {/* افکت نوری پس‌زمینه (با Tailwind) */}
        {/* برای انیمیشن، اگر Tailwind کلاس pulse-slow رو نداره، باید Keyframe رو در globals.css تعریف کنیم.
            اما چون گفتی Keyframe رو بیخیال شیم، این بخش رو ساده‌تر می‌کنیم.
            می‌تونیم از کلاس‌های داخلی Tailwind مثل animate-pulse استفاده کنیم اگر کافی باشه.
            فعلا animate-pulse-slow رو حذف می‌کنم تا ارور styled-jsx حل بشه.
        */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 opacity-30"></div>

        {/* عنوان "تعداد کل بازدیدها" */}
        <p className="text-xl sm:text-2xl font-semibold text-gray-400 mb-4 z-10">
          تعداد کل بازدیدها
        </p>

        {/* نمایش عدد بازدید با استایل مدرن و بزرگ */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg z-10">
          {totalViews.toLocaleString("fa-IR")}
        </h1>
      </div>
    </div>
  );
}
