import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context={window:{}};
vm.runInNewContext(fs.readFileSync('assets/catalog-data.js','utf8'),context);
const books=context.window.DV_BOOKS;
for(const book of books){
 const html=fs.readFileSync('.'+book.url,'utf8');
 assert(html.includes('data-book-id="'+book.id+'"'));
 assert.equal((html.match(/class="dv-evidence-card"/g)||[]).length,3);
 assert.equal((html.match(/class="dv-hero-benefits"/g)||[]).length,1);
 assert(!html.includes('★'),'No invented rating on '+book.id);
 const amazon=[...html.matchAll(/href="(https:\/\/www\.amazon\.com\/dp\/[^"]+)"/g)].map(x=>x[1]);
 assert(amazon.length>=3);assert(amazon.every(url=>url===book.amazon),'Every purchase destination belongs to '+book.id);
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'Unique page IDs: '+book.id);
 assert(html.indexOf('id="why"')<html.indexOf('id="inside"'),'Benefits before samples: '+book.id);
 const urls=[...html.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)].map(x=>x[1]);
 for(const url of urls)if(!url.endsWith('/'))assert(fs.existsSync('.'+url),'Published asset: '+url);
}
function purchaseHarness(pageBook=books[1],hasShelf=false){
 let primaryRect={top:100,bottom:158},finalRect={top:4000,bottom:4050};
 const events={},frames=[],nodes={};let current=pageBook;
 const classSet=new Set();const classList={add:()=>{},toggle:(name,yes)=>yes?classSet.add(name):classSet.delete(name)};
 function element(){return {dataset:{},classList,hidden:false,attrs:{},setAttribute(k,v){this.attrs[k]=v;},querySelector(selector){return nodes[selector]||(nodes[selector]=element());}};}
 const body={dataset:{bookId:hasShelf?'':pageBook.id},classList,append(e){this.bar=e;},matches:()=>false};
 const primary={getBoundingClientRect:()=>primaryRect};
 const final={getBoundingClientRect:()=>finalRect,querySelector:()=>({getBoundingClientRect:()=>finalRect})};
 const shelf={querySelector:()=>primary,addEventListener:(event,fn)=>events[event]=fn};
 const state={modal:false,menu:false,editing:false};
 const document={body,documentElement:{},activeElement:{matches:()=>state.editing},
   createElement:element,addEventListener:(event,fn)=>events[event]=fn,querySelectorAll:()=>[],
   querySelector(selector){
    if(selector==='[data-mobile-purchase]')return null;
    if(selector==='[data-living-shelf]')return hasShelf?shelf:null;
    if(selector==='.pm-final,.az-final,.ry-final')return hasShelf?null:final;
    if(selector==='.dv-amazon-hero')return primary;
    if(selector==='dialog[open]')return state.modal?{}:null;
    if(selector.startsWith('[data-navigation]'))return state.menu?{}:null;
    return null;
   }};
 const mobile={matches:true,addEventListener:(event,fn)=>events.media=fn};
 const viewport={height:844,addEventListener:(event,fn)=>events['viewport:'+event]=fn};
 const window={DV_BOOKS:books,DVShelf:{getState:()=>({book:current})},visualViewport:viewport,addEventListener:(event,fn)=>events[event]=fn};
 const env={window,document,matchMedia:()=>mobile,innerHeight:844,requestAnimationFrame:fn=>frames.push(fn),MutationObserver:class{observe(){}}};
 vm.runInNewContext(fs.readFileSync('assets/book-commerce.js','utf8'),env);
 const flush=()=>{while(frames.length)frames.shift()();};
 const update=()=>{events.scroll();flush();};
 return {body,nodes,state,viewport,mobile,update,events,movePrimary(r){primaryRect=r;update();},moveFinal(r){finalRect=r;update();},select(book){current=book;events.shelfchange();}};
}
for(const book of books){
 const h=purchaseHarness(book);
 assert(h.body.bar.hidden,'Inline CTA visible: '+book.id);
 h.movePrimary({top:-100,bottom:-42});assert(!h.body.bar.hidden);
 assert.equal(h.nodes.a.href,book.amazon);
 h.state.modal=true;h.update();assert(h.body.bar.hidden,'Modal hides purchase');
 h.state.modal=false;h.state.menu=true;h.update();assert(h.body.bar.hidden,'Menu hides purchase');
 h.state.menu=false;h.state.editing=true;h.viewport.height=400;h.update();assert(h.body.bar.hidden,'Keyboard hides purchase');
 h.state.editing=false;h.viewport.height=844;h.update();assert(!h.body.bar.hidden);
 h.moveFinal({top:700,bottom:758});assert(h.body.bar.hidden,'Final CTA replaces bar');
 h.moveFinal({top:3000,bottom:3058});h.movePrimary({top:900,bottom:958});assert(!h.body.bar.hidden,'CTA below short viewport has a purchase route');
 h.mobile.matches=false;h.update();assert(h.body.bar.hidden,'Desktop uses inline buying UI');
}
const shelf=purchaseHarness(books[0],true);shelf.movePrimary({top:-100,bottom:-44});
for(const book of books){shelf.select(book);assert.equal(shelf.nodes.a.href,book.amazon);assert.equal(shelf.body.bar.dataset.bookId,book.id);}
shelf.select(null);assert(shelf.body.bar.hidden,'No-match state has no stale purchase');
const home=fs.readFileSync('index.html','utf8');
assert.equal((home.match(/<link[^>]+rel="stylesheet"/g)||[]).length,1);
assert.equal((home.match(/<script[^>]+src=/g)||[]).length,1);
assert(home.includes('data-shelf-amazon data-shelf-primary'));
const variants=JSON.parse(fs.readFileSync('assets/mobile-images.json','utf8'));
for(const item of Object.values(variants))for(const image of item.variants)assert(fs.statSync('.'+image.src).size>0,'Nonempty responsive image: '+image.src);
console.log('Commerce checks passed: all seven books, honest evidence, ASIN destinations, stable shelf selection, short viewports, inline/final CTA visibility, modal/menu/keyboard hiding, desktop behavior and published responsive assets.');
