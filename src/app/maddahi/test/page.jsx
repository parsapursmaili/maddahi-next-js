'use client';
import { useState, useEffect } from "react";

export default function UserDropdown({ users=['ugd','sad','assdad','egwweg','wefoioeggggggggggggggggggggggggggf','efijwjfj','ugd','sad','assdad','egwweg','wefoioeggggggggggggggggggggggggggf','efijwjfj','ugd','sad','assdad','egwweg','wefoioeggggggggggggggggggggggggggf','efijwjfj','ugd','sad','assdad','egwweg','wefoioeggggggggggggggggggggggggggf','efijwjfj'] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        user.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, users]);

  return (
    <div className="relative w-64">
      {/* انتخاب‌شده */}
      <div
        className="border p-2 rounded cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        {selectedUser ? selectedUser : "انتخاب کاربر"}
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow">
          {/* جستجو */}
          <input
            type="text"
            className="w-full p-2 border-b outline-none"
            placeholder="جستجو..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* لیست کاربران */}
          <ul className=" max-h-60 overflow-y-auto">
            {filteredUsers.map((user,i) => (
              <li
                key={i}
                onClick={() => {
                  setSelectedUser(user);
                  setOpen(false);
                  setQuery("");
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer break-words whitespace-normal"
              >
                {user}
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="p-2 text-gray-500">کاربری پیدا نشد</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
