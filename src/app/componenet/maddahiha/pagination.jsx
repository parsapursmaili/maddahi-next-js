"use client";
import { memo } from "react";

const Pagination = ({
  page,
  setPage,
  totalPages,
  setIndex,
  setNTF,
  ntf,
  control,
}) => {
  return (
    <div className="my-12 text-center">
      <h1 className="text-3xl font-bold mb-8 text-slate-100">تمامی مداحی‌ها</h1>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => {
            control.current.page = Math.max(1, page - 1);
            setPage(control.current.page);
            setNTF(ntf + 1);
            setIndex(-1);
          }}
          disabled={page === 1}
          className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          قبلی
        </button>
        <span className="text-slate-300 font-bold text-lg tabular-nums">
          صفحه {page} از {totalPages}
        </span>
        <button
          onClick={() => {
            control.current.page = Math.min(totalPages, page + 1);
            setPage(control.current.page);
            setNTF(ntf + 1);
            setIndex(-1);
          }}
          disabled={page === totalPages}
          className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          بعدی
        </button>
      </div>
    </div>
  );
};

export default memo(Pagination);
