"use client";
import { memo } from "react";

const Random = ({ rand, setRand, control }) => {
  return (
    // چیدمان با flex برای واکنشگرایی بهتر و حذف کلاس‌های پیچیده قبلی
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <button
        onClick={() => {
          const newRand = rand === 1 ? 0 : 1;
          setRand(newRand);
          control.current.rand = newRand;
        }}
        className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-white transition-colors duration-300 ${
          rand === 1
            ? "bg-emerald-600 shadow-lg"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        مرتب سازی تصادفی
      </button>
      <button
        onClick={() => {
          const newRand = rand === 2 ? 0 : 2;
          setRand(newRand);
          control.current.rand = newRand;
        }}
        className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-white transition-colors duration-300 ${
          rand === 2
            ? "bg-emerald-600 shadow-lg"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        مرتب سازی بر اساس بازدید
      </button>
    </div>
  );
};
export default memo(Random);
