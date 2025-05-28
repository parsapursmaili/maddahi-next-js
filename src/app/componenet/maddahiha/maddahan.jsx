'use client';
import { useState, useEffect,memo, use } from 'react';  
  const Salam=({selectedUser,setSelectedUser,control})=>{
      const [query,setQuery]=useState("");
      const [open,setOpen]=useState(false);
      const [filteredUsers,setFilteredUsers]=useState([])
        const [users,setUsers]=useState([]);


        useEffect(()=>{
           if(users.length>0){
            if(selectedUser.term_id==0)return;
            const user=users.find((user) => user.term_id == selectedUser.term_id);
           control.current.selectedUser=user ? user.term_id : 0;
           setSelectedUser(user || { term_id: 0 });
           }
          },[users]);

useEffect(()=>{
    async function fetchmadahan() {
    const response = await fetch(`/api/terms/?s=maddah`);
    const data=await response.json();
    setUsers(data)
    }
    fetchmadahan();

  },[]);


 useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        user.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, users]);


  







    return(
    <div className="select-none relative w-64">
      {/* انتخاب‌شده */}
      <div
        className="border p-2 rounded cursor-pointer bg-[#131720]"
        onClick={() => setOpen(!open)}
      >
       <p className='text-white font-bold'> {selectedUser.name ? selectedUser.name : "انتخاب مداح"}</p>
      </div>

      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow">
          {/* جستجو */}
          <input
            type="text"
            className="w-full p-2 bg-[#131720] text-white font-bold border-b outline-none"
            placeholder="جستجو..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />

          {/* لیست کاربران */}
          <ul className="bg-[#131720] max-h-60 overflow-y-auto">
            <li
              onClick={() => {
                control.current.selectedUser=0;
                setSelectedUser({term_id:0});
                setOpen(false);
                setQuery("");
              }}
              className="p-2 hover:bg-gray-800 cursor-pointer  text-white break-words whitespace-normal"
            >
              انتخاب کنید
            </li>
            {filteredUsers.map((user,i) => (
              <li
                key={i}
                onClick={() => {
                  control.current.selectedUser=user.term_id;
                  setSelectedUser(user);
                  setOpen(false);
                  setQuery("");
                }}
                className="p-2 hover:bg-gray-800 cursor-pointer  text-white break-words whitespace-normal"
              >
                {user.name}
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="p-2 text-white">مداح پیدا نشد</li>
            )}
          </ul>
        </div>
      )}
    </div>

        )




  }
  export default memo(Salam);