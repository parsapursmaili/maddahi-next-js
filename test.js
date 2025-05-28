import mysql from 'mysql2/promise'

export const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 100,
}
)
export const getData = async () => {
 let data = await db.query(
  `SELECT 
      p.post_title, 
      p.ID,
      p.post_status,
      p.post_content,
      p.post_date,
      link.meta_value as link,
      p.post_type,
      p.post_name,
      p.comment_count,
      p.comment_status,
      p.post_excerpt,
      p.post_author,
      p.post_modified,
    view.meta_value as view,
      (
        SELECT pm2.meta_value 
        FROM wp_postmeta pm1
        LEFT JOIN wp_posts p2 ON p2.ID = pm1.meta_value
        LEFT JOIN wp_postmeta pm2 ON pm2.post_id = p2.ID AND pm2.meta_key = '_wp_attached_file'
        WHERE pm1.post_id = p.ID AND pm1.meta_key = '_thumbnail_id'
        LIMIT 1
      ) as thumb
    FROM wp_posts p
    LEFT JOIN wp_postmeta link ON link.post_id = p.ID AND link.meta_key = 'sib-post-pre-link'
    left join wp_postmeta view on view.post_id=p.ID and view.meta_key='entry_views'
    `
)
  let data2=data[0].map((item)=>{
    return {
      id:item.ID,
      status:item.post_status,
      title:item.post_title,
      content:item.post_content,
      date:item.post_date,
      image:item.thumb,
      link:item.link,
       type:item.post_type,
       name:item.post_name,
        comment_count:item.comment_count,
        comment_status:item.comment_status,
        excerpt:item.post_excerpt,
        author:item.post_author,
        last_update:item.post_modified,
        view:item.view

    }

  })
 await db.query(
  `REPLACE INTO posts (id, status, title, content, date, thumbnail, link, type, name, comments_count, comment_status, excerpt, author, last_update, view) VALUES ?`,
  [data2.map(item => [
    item.id,
    item.status,
    item.title,
    item.content,
    item.date,
    item.image,
    item.link,
    item.type,
    item.name,
    item.comment_count,
    item.comment_status,
    item.excerpt,
    item.author,
    item.last_update,
    item.view
  ])])
}

getData()

