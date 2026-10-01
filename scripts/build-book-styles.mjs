/* Preserve the active static template order in one cacheable stylesheet. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const files=['pompeii-product.css','pompeii-product-refinements.css','pompeii-product-update.css','pompeii-book-viewer.css','pompeii-editorial-canvas.css','pompeii-mobile.css','pompeii-trust-polish.css','site-shell.css','amazon-cta.css','book-opening.css'];
function inline(file,seen=new Set()) {
  if(seen.has(file))throw new Error('Circular CSS import: '+file);
  const next=new Set(seen);next.add(file);
  return fs.readFileSync(file,'utf8').replace(/@import\s+url\(["']([^"']+)["']\);/g,(_,url)=>{
    const relative=url.split('?')[0];
    return inline(relative.startsWith('/')?path.join(root,relative):path.resolve(path.dirname(file),relative),next);
  });
}
const output=files.map(name=>'/* '+name+' */\n'+inline(path.join(root,'assets',name))).join('\n');
fs.writeFileSync(path.join(root,'assets/book-detail.css'),output);
console.log('Book styles: '+files.length+' source stylesheets → '+Math.round(Buffer.byteLength(output)/1024)+' KB shared bundle');
