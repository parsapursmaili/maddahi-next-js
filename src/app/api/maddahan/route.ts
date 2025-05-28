import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
  
try{
const data1 = await prisma.wp_term_taxonomy.findMany({
      where: {  taxonomy: 'category' },
      select: {
       term_id: true
      },
      take: 10000,
    });


    

  
      const IDS = data1.map((data)=>{
       return data.term_id

      })

     const data2 = await prisma.wp_terms.findMany({
      where: {
        term_id: { in: IDS },
      },
      select: {
        name: true,
        term_id: true,
      
        },
      
    });
    const temp=[]
    for(const i of data2){
      temp.push({
        ...i,
        term_id: i.term_id.toString(),
      })
    }
    return Response.json(temp);
    }
      
   catch (error) {
    console.error('Prisma Error:', error);
    return Response.json({ error: 'Failed to fetch maddahan' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}