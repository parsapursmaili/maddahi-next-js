'use client';
import { useState, useEffect,memo } from 'react';  
  const Search=({setSQuery,squery,control})=>{
    const [inputValue, setInputValue] = useState('');

    useEffect(()=>{
        setInputValue(squery);
    },[squery])

    useEffect(() => {
    const timer = setTimeout(() => {
      setSQuery(inputValue);
      control.current.squery = inputValue;
    },500);

    return () => clearTimeout(timer);
  }, [inputValue]);

    return(
    <div className="select-none relative w-64">
      {/* انتخاب‌شده */}
      <input 
        onChange={(e) => setInputValue(e.target.value)}
      className="border p-2 rounded cursor-pointer bg-[#131720] text-white font-bold" placeholder='جست و جوی مداحی'
       value={inputValue} 
       type="search" name="" id="" />
   

      </div>

        )




  }
  export default memo(Search);