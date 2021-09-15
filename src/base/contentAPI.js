import fs from 'fs'
import { join } from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'


export const getEntryTypeDir = (type, status = 'published') => join(process.cwd(), `src/content/${type}/${status}`);

export async function markdownToHTML(markdown) {
  const result = await remark().use(html).process(markdown)
  return result.toString()
}

export function toMappedObject(array, key){
  const object = {};
  array.map(entry => object[entry[key]] = entry);
  return object;
}

export function getEntrySlugs(type) {
  
  const slugs = fs.readdirSync(getEntryTypeDir(type)).filter(file => {
    return (file.match(/\.md$/))
  })

  return slugs.map(slug => slug.replace(/\.md$/, ''));

}

export async function getEntryBySlug(type, slug, fields = false) {

  const realSlug = slug.replace(/\.md$/, '');
  const dir = getEntryTypeDir(type);
  const fullPath = join(dir, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const { data, content } = matter(fileContents)
  

  if(!fields){
    const items = {slug: realSlug, content: await markdownToHTML(content), ...data};
    return items;
  }
  else {
    const items = {}
    await fields.forEach(async (field) => {

      if(field === 'slug'){
        items[field] = realSlug
      }
      else if(field === 'content'){
        items[field] = await markdownToHTML(content)
      }
      else if(data[field]){
        items[field] = data[field]
      }

    })
    return items
  }
  
}

export async function getAllEntries(options){
  
  const defaults = Object.assign({
    type: 'posts',
    fields: false,
    sorter: () => {return 0}
  }, options);

  const {type, fields, sorter} = options;

  const slugs = getEntrySlugs(type)
  const entries = await Promise.all(slugs
    .map(async (slug) => await getEntryBySlug(type, slug, fields))
    // sort posts by date in descending order
    .sort(sorter)
    )
  return entries
}