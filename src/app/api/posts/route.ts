import {db} from "../../lib/db/mysql";

export async function GET(request) {
  const t1=Date.now();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const maddah=parseInt(searchParams.get('maddah') || '0')
  const monasebat=parseInt(searchParams.get('monasebatha') || '0')
  const rand=parseInt(searchParams.get('rand') || '0')
  const search = searchParams.get('s') || null;
  let orderby='';
  switch (rand) {
  case 0:
    orderby='ORDER BY p.date desc'
    break;
  case 1:
    orderby='ORDER BY RAND()'
    break;
  case 2:
    orderby='ORDER BY view desc'
    break;
  
  }

  const limit = 20;
  const skip =!rand? ((page - 1) * limit):0;
  try{
    let query1=`
    SELECT COUNT(*) as total
    FROM posts 
    `
  
    let where = `
      WHERE  type = 'post' 
      `
      let values = [];
      if(search){
        where+= `AND (title LIKE ? OR content LIKE ?)`
        values.push(`%${search}%`, `%${search}%`);
      }
      if(maddah){
        where+= `AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`
        values.push(maddah);
      }
      if(monasebat){
        where+= `AND ID IN (SELECT object_id FROM wp_term_relationships WHERE term_taxonomy_id = ?)`
        values.push(monasebat);
      }



      const total=await db.query(`${query1} ${where}`, values);



      const total2=total[0][0].total

      
      let query2=`SELECT  p.title as post_title,p.link,p.thumbnail as thumb
      
      FROM posts p

      `
      where+=`AND link IS NOT NULL AND link != ''`
      const posts=await db.query(`${query2} ${where}  ${orderby} limit ${limit} OFFSET ${skip} `, values);
      const posts2=posts[0]
      const t2=Date.now();
      console.log("***************************************t2",t2-t1)


      return Response.json({total2,posts2})


  }catch(e){
    console.log("error",e)
  }






}