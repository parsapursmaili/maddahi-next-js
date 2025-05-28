'use client';
import {memo } from 'react';
  const Random=({rand,setRand,control})=>{














    return(
    <div className='grid mr-0 ml-10 w-full gap-0 lg:ml-0 grid-cols-1   lg:grid-cols-2 lg:w-120 lg:mr-[-150px] gap-2 '>
        <button 
        onClick={()=>{rand==1?setRand(0):setRand(1);control.current.rand=rand==1?0:1;}
        }
        className={`cursor-pointer rounded p-2  ${rand==1? ' bg-green-700':'bg-gray-500'} font-bold text-white mr-10`}>مرتب سازی تصادفی</button>
       <button 
        onClick={()=>{rand==2?setRand(0):setRand(2);control.current.rand=rand==2?0:2;}
        }
        className={`cursor-pointer rounded p-2  ${rand==2? ' bg-green-700':'bg-gray-500'} font-bold text-white mr-10`}>مرتب سازی بر اساس بازدید</button>


    </div>

        )




  }
  export default memo(Random);