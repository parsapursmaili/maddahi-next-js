'use client'
import { memo } from 'react';
import Image from 'next/image';

const Posts=({posts,setIndex,index,setHnadle})=>{

return(
   <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post,i) => (
          <div
            key={i}
            
            className="p-4 rounded-lg shadow-lg items hover:shadow-xl transition "
            >
              {post.thumb&&
            <Image  width={70} height={70} 
            alt={post.post_title}
            className='rounded-4xl max-w-[50px] lg:max-w-[70px] inline ml-2 lg:ml-5 '
            src={post.thumb?`https://besooyeto.ir/maddahi/wp-content/uploads/${post.thumb.split(".")[0]}-150x150.${post.thumb.split(".")[1]}`:''}/>
            }
            <h2 
            onClick={() => {
              setIndex(i);

              setHnadle(post.link); 
            }}
             className={`[line-height:50px] flex inline cursor-pointer text-white text-[10px] lg:text-[15px] font-semibold mb-2  ${index==i?'bounce':''} `}>{post.post_title}</h2>
          </div>

        ))}
      </div>
)


}
export default memo(Posts)