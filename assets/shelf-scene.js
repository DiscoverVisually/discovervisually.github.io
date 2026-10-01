import * as THREE from './vendor/three-r186.js';
import {clamp, shelfPose} from './shelf-layout.js';

// A single camera and light rig owns the books, timber and their shadows.
// This module is loaded only on the catalogue page, after the usable DOM shelf.
export async function createShelfScene({shelf, stage, books, snapshot, choose, failed}) {
  let renderer;
  const resources = new Set();
  const own = resource => (resources.add(resource), resource);
  const canvas = document.createElement('canvas');
  canvas.className = 'shelf-scene';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.addEventListener('webglcontextlost', event => {event.preventDefault();dispose();failed();});
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false, powerPreference:'low-power'});
  } catch (error) { throw error; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#131718');
  const camera = new THREE.PerspectiveCamera(27, 1, .1, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new THREE.RoomEnvironment();
  const environment = own(pmrem.fromScene(room, .06));
  scene.environment = environment.texture;
  scene.environmentIntensity = .28;
  room.dispose();pmrem.dispose();

  scene.add(new THREE.HemisphereLight('#f7eddd', '#2b2420', 1.1));
  const key = new THREE.DirectionalLight('#fff1df', 3.1);
  key.position.set(-3, 4.5, 5);key.target.position.set(0, .45, 0);
  key.castShadow = true;key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, {left:-3, right:3, top:2.5, bottom:-2, near:.1, far:12});
  key.shadow.bias = -.00015;key.shadow.normalBias = .005;key.shadow.radius = 3;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#d8e4ed', .7);fill.position.set(4, 1.5, 2);scene.add(fill);

  function textureCanvas(width, height, paint) {
    const c = document.createElement('canvas');c.width=width;c.height=height;
    paint(c.getContext('2d'), width, height);
    const texture = own(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  const wood = textureCanvas(2048, 256, (ctx,w,h) => {
    // Deterministic long grain, with restrained variation rather than stripes.
    const pixels=ctx.createImageData(w,h);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      const bend=Math.sin(x*.0026)*8+Math.sin(x*.008)*2;
      const grain=Math.sin((y+bend)*.46)+.45*Math.sin((y+bend)*1.76);
      const fine=Math.sin(x*12.9898+y*78.233)*43758.5453;
      const n=(fine-Math.floor(fine)-.5)*3;
      const i=(y*w+x)*4;
      pixels.data[i]=65+grain*4+n;pixels.data[i+1]=43+grain*3+n;pixels.data[i+2]=29+grain*2+n;pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
  });
  wood.wrapS=wood.wrapT=THREE.RepeatWrapping;
  const timber = own(new THREE.MeshStandardMaterial({map:wood, color:'#c4ab91', roughness:.68, metalness:0, envMapIntensity:.45}));
  const plank = new THREE.Mesh(own(new THREE.RoundedBoxGeometry(5.8,.07,1.28,3,.008)),timber);
  plank.position.set(0,-.035,.04);plank.receiveShadow=true;plank.castShadow=true;scene.add(plank);
  const backdrop = new THREE.Mesh(own(new THREE.PlaneGeometry(16,8)), own(new THREE.MeshStandardMaterial({color:'#242a2b',roughness:.98})));
  backdrop.position.set(0,2,-.87);backdrop.receiveShadow=true;scene.add(backdrop);

  const paper = textureCanvas(64,512,(ctx,w,h)=>{
    ctx.fillStyle='#e7e1d4';ctx.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=5){ctx.fillStyle=y%10?'#cec7b9':'#d9d1c3';ctx.fillRect(0,y,w,1);}
  });
  const paperMaterial=own(new THREE.MeshStandardMaterial({map:paper,roughness:.96,envMapIntensity:.15}));
  const loader = new THREE.TextureLoader();
  const timeout = (promise,ms) => {
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Cover texture timeout')),ms);})]).finally(()=>clearTimeout(timer));
  };
  let disposed=false, observer, visibilityObserver, wake, inView=true;
  const groups=[];
  function spineTexture(color) {
    return textureCanvas(64,1024,(ctx,w,h)=>{
      ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
      // No invented spine copy. Available front artwork supplies a subtle edge.
      ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(w-6,0,3,h);
    });
  }
  const colors=['#512342','#123454','#10334d','#18354e','#315565','#243747','#203849'];
  try {
    const covers=await timeout(Promise.all(books.map(book=>loader.loadAsync(book.cover).then(texture=>{
      own(texture);if(disposed){texture.dispose();throw new Error('Scene disposed');}
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
    }))),12000);
    books.forEach((book,index)=>{
      const width=book.coverRatio || .75;
      const pages=Number((book.shelfFormat || book.format || '').match(/\d+/)?.[0])||80;
      const depth=clamp(pages*.00019+.003,.016,.023);
      const group=new THREE.Group();group.userData.index=index;
      const sheet=new THREE.Mesh(own(new THREE.RoundedBoxGeometry(width-.005,.995,depth,2,.001)),paperMaterial);
      sheet.castShadow=true;sheet.receiveShadow=true;group.add(sheet);
      const coating=own(new THREE.MeshPhysicalMaterial({map:covers[index],roughness:.64,metalness:0,clearcoat:.13,clearcoatRoughness:.48,envMapIntensity:.35}));
      const front=new THREE.Mesh(own(new THREE.PlaneGeometry(width,1)),coating);
      front.position.z=depth/2+.0006;front.castShadow=true;front.receiveShadow=true;group.add(front);
      // Unseen backs use a neutral binding material until authentic wrap assets exist.
      const binding=own(new THREE.MeshStandardMaterial({color:colors[index],roughness:.7}));
      const back=new THREE.Mesh(own(new THREE.PlaneGeometry(width,1)),binding);back.rotation.y=Math.PI;back.position.z=-depth/2-.0006;group.add(back);
      const spine=new THREE.Mesh(own(new THREE.PlaneGeometry(depth+.001,1)),own(new THREE.MeshStandardMaterial({map:spineTexture(colors[index]),roughness:.65})));
      spine.rotation.y=-Math.PI/2;spine.position.x=-width/2;group.add(spine);
      group.traverse(obj=>{if(obj.isMesh)obj.userData.index=index;});
      groups.push(group);scene.add(group);
    });
    stage.querySelector('[data-shelf-camera]').prepend(canvas);
    const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
    canvas.addEventListener('click',event=>{
      const bounds=canvas.getBoundingClientRect();
      pointer.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const hit=raycaster.intersectObjects(groups,true).find(hit=>groups[hit.object.userData.index].visible);
      if(hit)choose(hit.object.userData.index);
    });
    function resize() {
      const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
      renderer.setSize(width,height,false);camera.aspect=width/height;
      camera.position.set(0,1.18,camera.aspect<1.3?3.25:3.1);
      camera.lookAt(0,.53,0);camera.updateProjectionMatrix();draw(snapshot());
    }
    function draw(state) {
      if(disposed)return;
      groups.forEach((group,index)=>{
        if(!state.visible.includes(index)) {
          group.position.y=.5-1.15*(1-state.alphas[index]);
          group.visible=state.alphas[index]>.02 && state.visible.length>0;
          return;
        }
        const pose=shelfPose(state.distances[index],state.visible.length);
        group.position.set(pose.x,pose.y,pose.z);group.rotation.y=pose.rotation;
        group.visible=state.alphas[index]>.02 && pose.seam>.02 && state.visible.length>0;
        // Filter departures sink behind the shelf instead of dissolving paper.
        group.position.y-=1.15*(1-state.alphas[index]);
      });
      if(inView&&!document.hidden)renderer.render(scene,camera);
    }
    observer=new ResizeObserver(resize);observer.observe(stage);
    visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)draw(snapshot());},{rootMargin:'150px'});visibilityObserver.observe(stage);
    wake=()=>{if(!document.hidden)draw(snapshot());};
    document.addEventListener('visibilitychange',wake);
    resize();shelf.classList.add('has-shelf-scene');shelf.dataset.shelfRenderer='webgl';
    return {render:draw,dispose};
  } catch(error) {dispose();throw error;}
  function dispose() {
    if(disposed)return;disposed=true;observer?.disconnect();visibilityObserver?.disconnect();
    if(wake)document.removeEventListener('visibilitychange',wake);
    key.shadow.map?.dispose();
    resources.forEach(resource=>resource.dispose());renderer?.dispose();canvas.remove();
    shelf.classList.remove('has-shelf-scene');shelf.dataset.shelfRenderer='fallback';
  }
}
