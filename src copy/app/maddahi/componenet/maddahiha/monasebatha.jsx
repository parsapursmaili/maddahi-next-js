"use client";
import { useState, useEffect, memo } from "react";
import getTerms from "@/app/maddahi/actions/terms";
const Reason = ({ reason, setReason, control, set }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (users.length > 0) {
      if (reason.ID == 0) return;
      const user = users.find((user) => user.ID == reason.ID);
      control.current.reason = user ? user.ID : 0;
      setReason(user || { ID: 0 });
    }
  }, [users]);

  useEffect(() => {
    async function fetchReason() {
      const response = await await getTerms({ req: 1 });
      setUsers(response);
    }
    fetchReason();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, users]);

  return (
    <div className="select-none relative w-64">
      {/* دکمه اصلی انتخاب */}
      <div
        className="flex items-center justify-between p-3 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg cursor-pointer transition-colors hover:bg-[var(--background-tertiary)]"
        onClick={() => setOpen(!open)}
      >
        <p className="font-semibold text-[var(--foreground-primary)]">
          {reason.name ? reason.name : "انتخاب مناسبت"}
        </p>
        {/* آیکون برای نشان دادن وضعیت باز/بسته بودن */}
        <svg
          className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform duration-300 ${
            open ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          ></path>
        </svg>
      </div>

      {/* پنل دراپ‌داون */}
      {open && (
        <div className="absolute z-20 w-full mt-2 bg-[var(--background-secondary)] border border-[var(--border-primary)] rounded-lg shadow-2xl overflow-hidden">
          {/* فیلد جستجو */}
          <input
            type="text"
            className="w-full p-3 bg-[var(--background-secondary)] text-[var(--foreground-primary)] font-semibold border-b border-[var(--border-primary)] outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
            placeholder="جستجو..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            autoFocus
          />

          {/* لیست آیتم‌ها */}
          <ul className="max-h-60 overflow-y-auto">
            <li
              onClick={() => {
                control.current.reason = 0;
                setReason({ ID: 0 });
                setOpen(false);
                setQuery("");
                set(0);
              }}
              className="p-3 hover:bg-[var(--background-tertiary)] cursor-pointer text-[var(--foreground-secondary)] transition-colors"
            >
              انتخاب کنید
            </li>
            {filteredUsers.map((user, i) => (
              <li
                key={i}
                onClick={() => {
                  control.current.reason = user.ID;
                  setReason(user);
                  setOpen(false);
                  setQuery("");
                  set(1);
                }}
                className="p-3 hover:bg-[var(--background-tertiary)] cursor-pointer text-[var(--foreground-primary)] break-words whitespace-normal transition-colors"
              >
                {user.name}
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="p-3 text-[var(--foreground-muted)] text-center">
                مناسبت پیدا نشد
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
export default memo(Reason);
