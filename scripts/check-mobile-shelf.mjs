// CPU regression checks use the real scene, camera and book geometry. The
// renderer is mocked; this does not substitute for visual GPU/device QA.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../assets/vendor/three-r186.js';
import * as layout from '../assets/shelf-layout.js';

let scene,resize,lost;
class Renderer {
  constructor(){this.capabilities={getMaxAnisotropy:()=>8};this.shadowMap={};}
  setPixelRatio(){} setSize(){} render(value){scene=value;} dispose(){}
}
class PMREM {fromScene(){return {texture:{},dispose(){}};}dispose(){}}
class Loader {async loadAsync(){return {image:{width:1536,height:1024},dispose(){}};}}
const stage={clientWidth:390,clientHeight:425,querySelector:()=>({prepend(){}})};
const link={hidden:true,style:{}};
const shelf={dataset:{},classList:{add(){},remove(){}},querySelectorAll:()=>[]};
const document={hidden:false,addEventListener(){},removeEventListener(){},createElement:()=>({
  setAttribute(){},remove(){},addEventListener(type,fn){if(type==='webglcontextlost')lost=fn;},
  getContext:()=>({scale(){},fillRect(){},createRadialGradient:()=>({addColorStop(){}})})
})};
const booksContext={window:{}};
vm.runInNewContext(fs.readFileSync('assets/catalog-data.js','utf8'),booksContext);
const books=booksContext.window.DV_BOOKS;
let state;
function select(count,active,position=active){
  state={mobile:true,visible:Array.from({length:count},(_,i)=>i),activeIndex:active,
    distances:books.map((_,i)=>i-position),alphas:books.map((_,i)=>i<count?1:0),focus:books.map((_,i)=>i===active?1:0)};
}
select(7,0);
const context=vm.createContext({document,window:{devicePixelRatio:2},setTimeout,clearTimeout,
  ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){}},
  IntersectionObserver:class{observe(){}disconnect(){}}});
const module=new vm.SourceTextModule(fs.readFileSync('assets/shelf-scene.js','utf8'),{context});
await module.link(async spec=>{
  const values=spec.includes('vendor')?{...THREE,WebGLRenderer:Renderer,PMREMGenerator:PMREM,TextureLoader:Loader}:layout;
  return new vm.SyntheticModule(Object.keys(values),function(){for(const [name,value] of Object.entries(values))this.setExport(name,value);},{context});
});
await module.evaluate();
const renderer=await module.namespace.createShelfScene({shelf,stage,books,openLink:link,snapshot:()=>state,choose(){},failed(){}});
const models=scene.children.filter(item=>item.isGroup);
assert.equal(models.length,7,'All seven titles remain in the carousel');
for(const width of [320,360,390,430,700]){
  const target=layout.clamp(width*.82,320,360);
  stage.clientWidth=width;stage.clientHeight=target+105;resize();
  for(let count=1;count<=7;count++)for(let active=0;active<count;active++){
    select(count,active);renderer.render(state);
    assert(!link.hidden,'Selected cover keeps its native link');
    const x=parseFloat(link.style.left),y=parseFloat(link.style.top),w=parseFloat(link.style.width),h=parseFloat(link.style.height);
    assert(x>=0&&x+w<=width&&y>=0&&y+h<=stage.clientHeight,'Entire selected cover fits '+width+'px');
    assert(h>=target*.97&&h<=target*1.03,'Cover fills its planned height, without aspect-ratio shrinking');
    assert.equal(models.filter(item=>item.visible).length,Math.min(count,5));
    for(const book of models.filter(item=>item.visible))assert(Math.abs(book.position.y-book.scale.y/2)<1e-8,'Scaled books rest on the plank');
  }
  for(let step=0;step<=140;step++){
    select(7,3,step/20);renderer.render(state);
    assert(models.filter(item=>item.visible).length<=5,'At most five books while swiping');
  }
  // A filter transition with deliberately overlapping distances must obey
  // the same hard cap and must never expose departing, unfiltered books.
  select(6,2);state.distances=books.map((_,i)=>(i-2)*.3);state.alphas.fill(.5);renderer.render(state);
  assert(models.filter(item=>item.visible).length<=5);
  assert(!models[6].visible,'Filtered-out title stays off the mobile stage');
}
select(7,3);state.mobile=false;stage.clientWidth=1340;stage.clientHeight=410;resize();renderer.render(state);
assert.equal(models.filter(item=>item.visible).length,7,'Desktop retains the full collection');
assert(models.every(item=>item.scale.x===1),'Desktop book sizes are unchanged');
lost({preventDefault(){}});assert.equal(shelf.dataset.shelfRenderer,'fallback');assert(link.hidden);
console.log('Mobile shelf checks passed: 320–700px, every title and filter count, large readable cover, five-book cap during motion/filtering, native hit bounds, shelf contact, desktop preservation and context-loss recovery.');
