"use client";
import { useState, useEffect, memo } from "react";
import getTerms from "@/app/actions/terms";
const Salam = ({ selectedUser, setSelectedUser, control }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (users.length > 0) {
      if (selectedUser.ID == 0) return;
      const user = users.find((user) => user.ID == selectedUser.ID);
      control.current.selectedUser = user ? user.ID : 0;
      setSelectedUser(user || { ID: 0 });
    }
  }, [users]);

  useEffect(() => {
    async function fetchmadahan() {
      const response = await getTerms({ req: 0 });
      setUsers(response);
    }
    fetchmadahan();
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
        className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer transition-colors hover:bg-slate-700"
        onClick={() => setOpen(!open)}
      >
        <p className="font-semibold text-background-primary">
          {selectedUser.name ? selectedUser.name : "انتخاب مداح"}
        </p>
        {/* آیکون برای نشان دادن وضعیت باز/بسته بودن */}
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
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
        <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
          {/* فیلد جستجو */}
          <input
            type="text"
            className="w-full p-3 bg-slate-800 text-slate-200 font-semibold border-b border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="جستجو..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            autoFocus
          />

          {/* لیست آیتم‌ها */}
          <ul className="max-h-60 overflow-y-auto">
            <li
              onClick={() => {
                control.current.selectedUser = 0;
                setSelectedUser({ ID: 0 });
                setOpen(false);
                setQuery("");
              }}
              className="p-3 hover:bg-slate-700 cursor-pointer text-slate-300 transition-colors"
            >
              انتخاب کنید
            </li>
            {filteredUsers.map((user, i) => (
              <li
                key={i}
                onClick={() => {
                  control.current.selectedUser = user.ID;
                  setSelectedUser(user);
                  setOpen(false);
                  setQuery("");
                }}
                className="p-3 hover:bg-slate-700 cursor-pointer text-slate-200 break-words whitespace-normal transition-colors"
              >
                {user.name}
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="p-3 text-slate-500 text-center">مداح پیدا نشد</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
export default memo(Salam);
