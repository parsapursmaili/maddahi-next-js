'use client'
import {memo} from 'react';
const Pagination=({page,setPage,totalPages,setIndex,setNTF,ntf,control})=>{
return(
    <div>
        <h1 className="text-white text-3xl font-bold mb-6 text-center">پست‌های وردپرس</h1>
    
    
          <div className=" flex justify-center mb-20 gap-5">
            <button
              onClick={() => {
                control.current.page=Math.max(1,page-1);
                setPage(control.current.page)
                setNTF(ntf+1)
                setIndex(-1);
              }}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 cursor-pointer"
            >
              <p className='text-lg '>قبلی</p>
            </button>
            <span className='text-white font-bold mt-2 text-lg'>
              صفحه {page} از {totalPages}
            </span>
            <button
              onClick={() => {
                control.current.page=Math.min(totalPages,page+1);
                setPage(control.current.page)
                setNTF(ntf+1)
                setIndex(-1);
              }}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300 cursor-pointer"
            >
              <p className=' text-lg '>بعدی</p>
            </button>
          </div>
    </div>
)
}

export default memo(Pagination)
