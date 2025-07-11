"use client";
import { useState, useEffect, memo } from "react";

const Search = ({ setSQuery, squery, control }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(squery);
  }, [squery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSQuery(inputValue);
      control.current.squery = inputValue;
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="relative w-64">
      <input
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full p-3 bg-slate-800 text-slate-200 font-semibold border border-slate-700 rounded-lg outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        placeholder="جستجوی مداحی..."
        value={inputValue}
        type="search"
      />
    </div>
  );
};
export default memo(Search);
