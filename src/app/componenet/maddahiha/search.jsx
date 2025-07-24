"use client";
import { useState, useEffect, memo } from "react";

const Search = ({ setSQuery, squery, control, set, c2 }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (squery == "" && inputValue == "") return;
    setInputValue(squery);
  }, [squery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSQuery(inputValue);
      control.current.squery = inputValue;
      if (control.current.squery == c2.squery) return;
      if (inputValue != "") set(2);
      else set(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <div className="relative w-64">
      <input
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full p-3 bg-[var(--background-secondary)] text-[var(--foreground-primary)] font-semibold border border-[var(--border-primary)] rounded-lg outline-none transition-all focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)]"
        placeholder="جستجوی مداحی..."
        value={inputValue}
        type="search"
      />
    </div>
  );
};
export default memo(Search);
