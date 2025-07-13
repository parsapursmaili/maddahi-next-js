// Pagination Component
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
  const handlePrev = () => {
    if (page > 1) {
      control.current.page = page - 1;
      setPage(control.current.page);
      setNTF(ntf + 1);
      setIndex(-1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      control.current.page = page + 1;
      setPage(control.current.page);
      setNTF(ntf + 1);
      setIndex(-1);
    }
  };

  return (
    <div className="my-12 text-center">
      <h1 className="text-3xl font-bold mb-8 text-white">تمامی مداحی‌ها</h1>

      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-all duration-300 enabled:hover:bg-sky-600 enabled:hover:shadow-sky-500/20 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          قبلی
        </button>
        <span className="text-slate-300 font-bold text-lg tabular-nums">
          صفحه {page.toLocaleString("fa")} از {totalPages.toLocaleString("fa")}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg shadow-md transition-all duration-300 enabled:hover:bg-sky-600 enabled:hover:shadow-sky-500/20 disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          بعدی
        </button>
      </div>
    </div>
  );
};

export default memo(Pagination);
