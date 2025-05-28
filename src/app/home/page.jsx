import Slider from "../componenet/slider";
    async function fetchPosts() {
        
        try {
            const response = await fetch(`http://localhost:3000/api/posts/`);
            const data = await response.json();
            if (!response.ok) {
                if (data.error) throw new Error(data.error);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return data.posts2
            
            
        } catch (error) {
            console.error('Fetch Error:', error);
            return [];
        }
    }
export default async function Home() {
    

    const slides=await fetchPosts();
    



  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-white font-bold mb-4">اسلایدر ریسپانسیو در Next.js</h1>
      <Slider slides={slides}/>
    </div>
  );
}