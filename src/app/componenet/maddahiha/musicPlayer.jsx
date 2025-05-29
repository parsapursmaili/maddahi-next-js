'use client'
import { useState, useEffect, useRef,memo } from 'react';

const MusicPlayer = ({ntf,setNTF,posts,index,setIndex,page,setPage,totalPages,handle,control}) => {



 const [musicPlayer,setMusicPlayer]=useState({
    duration: 0,
    currentTime: 0,
    isPlay: false,
    refresh:false,

  })
  const [loading,setLoading] = useState(false);

  const audioRef = useRef(null);
  const timeLine = useRef(null);



  useEffect(() => {
    handlePlay(handle);
  }, [handle]);


  const handlePlay = (musicUrl) => {
      setLoading(false);
      if(musicUrl==audioRef.current.src)return;
      if(!audioRef.current.paused){
        audioRef.current.pause();
        setMusicPlayer(p=>({...p,isPlay:false}))
      }
        if (musicUrl) {
        audioRef.current.src=musicUrl;
        audioRef.current.load();
        setLoading(true);
      }
      };
      
 






    function formatTime(time) {

        const minutes = Math.floor(time/60);

        const secondsLeft = Math.floor(time % 60);

        return `${minutes}:${secondsLeft < 10 ? "0" : ""}${secondsLeft}`;

    }

    function setTimeLine(){
      const val=(audioRef.current.currentTime/musicPlayer.duration)*10000
      timeLine.current.value=val;
      updateProgressBar();
    }

    function updateProgressBar(){
      const val=(audioRef.current.currentTime/musicPlayer.duration)*100
      timeLine.current.style.backgroundImage = `linear-gradient(to right, #a5f3fc ${val}%, #ddd 0%)`;
    
    }
    function canPlay(){
    setLoading(false);
    setMusicPlayer((p)=>({...p,duration:audioRef.current.duration}));
    audioRef.current.play();
    timeLine.current.min=0;
    timeLine.current.max=10000;
      setMusicPlayer((p)=>({...p,isPlay:true}));
  }
  function handleIcon(){
    if(!audioRef.current.paused){
      audioRef.current.pause();
      setMusicPlayer((p)=>({...p,isPlay:false}));
    }
    else{
      audioRef.current.play();
      setMusicPlayer((p)=>({...p,isPlay:true}));
    }
     }
 function handledownload(){
       const link = document.createElement('a');
       link.href = audioRef.current.src;
       link.download;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
      }
      function forward(){
        if(index+1<posts.length){
          const i=index+1;
          setIndex(index+1)
          handlePlay(posts[i].link);
        }
        else{

          control.current.index=1;
          control.current.n=1;
          control.current.page=page+1>totalPages? 1 :page+1
          setPage(control.current.page)
          setNTF(ntf+1)

        }
        
      }
      function backward(){
        if(index-1>=0){
          const i=index-1; 
          setIndex(index-1)
          handlePlay(posts[i].link);
        }
        else{
          if(page==1){
            return;
          }
          control.current.index=1;     
          control.current.n=1;
          control.current.page=page-1;
          setPage(control.current.page)
          setNTF(ntf+1)

          }
        }
return(
    <div>
     <audio 
      style={{display:'none'}}
      ref={audioRef} 
      loop={musicPlayer.refresh}
      onLoadStart={() => setLoading(true)}
      onCanPlay={() => {canPlay()}}
      onError={()=>{console.log("تلاش مجدد"); audioRef.current.load()}}
      onTimeUpdate={()=>{setMusicPlayer((p)=>({...p,currentTime:audioRef.current.currentTime}));setTimeLine()}}
      onEnded={forward}
        />
        <div className="fixed bottom-0   left-0 right-0 bg-[rgba(52,73,94,0.9)]	 p-0 shadow-lg h-[100px]">
        <input ref={timeLine} onChange={()=>{audioRef.current.currentTime=(timeLine.current.value/10000)*musicPlayer.duration;updateProgressBar();}} type="range" className='translate-y-[-17px]' />
        <span className='absolute text-white font-bold text-xl  right-150'>{formatTime(musicPlayer.duration)}</span>
        <span className='absolute text-white font-bold text-xl  left-150'>{formatTime(musicPlayer.currentTime)} </span>
         <div className="flex justify-center gap-8 mt-6">
          <i onClick={handledownload} className="fas fa-download text-white text-3xl"></i>
          <i onClick={backward} className="fas fa-forward text-white text-3xl"></i>
          <i  onClick={()=>{handleIcon();}}  className={`fas ${musicPlayer.isPlay? 'fa-pause':'fa-play'} text-white text-3xl`}></i>
          <i onClick={forward} className="fas fa-backward text-white text-3xl"></i>
          <i onClick={()=>setMusicPlayer(p=>({...p,refresh:!musicPlayer.refresh}))} className={`fas fa-refresh ${musicPlayer.refresh? 'text-green-400/50':'text-white'} text-3xl`}></i>

        </div>

        </div>

    {loading && (
    <div className="fixed right-[50%] top-[50%] flex items-center justify-center  z-50">
    <div className="w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
    )}



    </div>
)






}
export default memo(MusicPlayer)