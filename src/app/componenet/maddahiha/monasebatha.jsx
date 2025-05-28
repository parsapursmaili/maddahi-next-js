'use client';
import { useState, useEffect,memo, use } from 'react';  
  const Reason=({reason,setReason,control})=>{
      const [query,setQuery]=useState("");
      const [open,setOpen]=useState(false);
      const [filteredUsers,setFilteredUsers]=useState([])
        const [users,setUsers]=useState([]);

useEffect(()=>{
  if(users.length>0){
    if(reason.term_id==0)return;
    const user=users.find((user) => user.term_id == reason.term_id);
    control.current.reason=user ? user.term_id : 0;
    setReason(user || { term_id: 0 });

   }
},[users]);

useEffect(()=>{
    async function fetchReason() {
    const response = await fetch(`/api/terms/?s=monasebat`);
    const data=await response.json();
    setUsers(data)
    }
    fetchReason();
    

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
       <p className='text-white font-bold'> {reason.name ? reason.name : "انتخاب مناسبت"}</p>
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
                control.current.reason=0;
                setReason({term_id:0});
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
                console.log(control.current.reason);
                control.current.reason=user.term_id;
                console.log(user,"sal,,,",control.current.reason);
                setReason(user);
                  setOpen(false);
                  setQuery("");
                }}
                className="p-2 hover:bg-gray-800 cursor-pointer  text-white break-words whitespace-normal"
              >
                {user.name}
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="p-2 text-white">کاربری پیدا نشد</li>
            )}
          </ul>
        </div>
      )}
    </div>

        )




  }
  export default memo(Reason);