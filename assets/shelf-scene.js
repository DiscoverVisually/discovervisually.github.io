import * as THREE from './vendor/three-r186.js';
import {clamp, shelfPose} from './shelf-layout.js?v=20261004desktop';

// A single camera and light rig owns the books, timber and their shadows.
// This module is loaded only on the catalogue page, after the usable DOM shelf.
export async function createShelfScene({shelf, stage, books, openLink, snapshot, choose, failed}) {
  let renderer;
  const resources = new Set();
  const own = resource => (resources.add(resource), resource);
  const canvas = document.createElement('canvas');
  canvas.className = 'shelf-scene';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.addEventListener('webglcontextlost', event => {event.preventDefault();dispose();failed();});
  try {
    renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'});
  } catch (error) { throw error; }
  const mobileQuality=stage.clientWidth <= 720;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileQuality ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = null;
  const camera = new THREE.PerspectiveCamera(27, 1, .1, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new THREE.RoomEnvironment();
  const environment = own(pmrem.fromScene(room, .06));
  scene.environment = environment.texture;
  scene.environmentIntensity = .28;
  room.dispose();pmrem.dispose();

  scene.add(new THREE.HemisphereLight('#f4ede4', '#262320', .75));
  const key = new THREE.DirectionalLight('#fff1df', 2.1);
  key.position.set(-3, 4, 5);key.target.position.set(0, .45, 0);
  key.castShadow = true;key.shadow.mapSize.set(mobileQuality ? 1024 : 2048, mobileQuality ? 1024 : 2048);
  Object.assign(key.shadow.camera, {left:-3, right:3, top:2.5, bottom:-2, near:.1, far:12});
  key.shadow.bias = -.00015;key.shadow.normalBias = .001;key.shadow.radius = 3;
  scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#d8e4ed', .5);fill.position.set(4, 1.5, 2);scene.add(fill);

  function textureCanvas(width, height, paint) {
    const c = document.createElement('canvas');c.width=width;c.height=height;
    paint(c.getContext('2d'), width, height);
    const texture = own(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }
  let disposed=false, observer, visibilityObserver, wake, inView=true;
  const loader = new THREE.TextureLoader();
  const timeout = (promise,ms) => {
    let timer;
    return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Shelf texture timeout')),ms);})]).finally(()=>clearTimeout(timer));
  };
  const loadTexture=async url=>{
    const texture=own(await loader.loadAsync(url));
    if(disposed){texture.dispose();throw new Error('Scene disposed');}
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
  };
  const groups=[];
  try {
    const [wood,background]=await timeout(Promise.all([
      loadTexture('/assets/living-shelf-walnut-material.webp'),
      loadTexture('/assets/living-shelf-library.webp')
    ]),12000);
    wood.wrapS=wood.wrapT=THREE.RepeatWrapping;
    const timber=own(new THREE.MeshStandardMaterial({map:wood,bumpMap:wood,bumpScale:.0012,color:'#b8ada2',roughness:.61,metalness:0,envMapIntensity:.4}));
    const plank=new THREE.Mesh(own(new THREE.RoundedBoxGeometry(5.8,.14,1.45,4,.014)),timber);
    plank.position.set(0,-.07,.10);plank.receiveShadow=true;plank.castShadow=true;scene.add(plank);
    const backdrop=new THREE.Mesh(own(new THREE.PlaneGeometry(8,8/(background.image.width/background.image.height))),own(new THREE.MeshBasicMaterial({map:background,toneMapped:false})));
    backdrop.position.set(0,1.5,-1.2);scene.add(backdrop);
    // Broad ambient occlusion under the wall-mounted board; book shadows are real.
    const shadow=textureCanvas(512,128,(ctx,w,h)=>{
      ctx.scale(1,h/w);const grad=ctx.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);
      grad.addColorStop(0,'rgba(0,0,0,.7)');grad.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=grad;ctx.fillRect(0,0,w,w);
    });
    const wallShadow=new THREE.Mesh(own(new THREE.PlaneGeometry(6.2,.5)),own(new THREE.MeshBasicMaterial({map:shadow,transparent:true,depthWrite:false,toneMapped:false})));
    wallShadow.position.set(0,-.19,-1.19);scene.add(wallShadow);
    const paper = textureCanvas(64,512,(ctx,w,h)=>{
      ctx.fillStyle='#e7e1d4';ctx.fillRect(0,0,w,h);
      for(let y=0;y<h;y+=5){ctx.fillStyle=y%10?'#cec7b9':'#d9d1c3';ctx.fillRect(0,y,w,1);}
    });
    const paperMaterial=own(new THREE.MeshStandardMaterial({map:paper,roughness:.96,envMapIntensity:.15}));
    function spineTexture(color) {
      return textureCanvas(64,1024,(ctx,w,h)=>{
        ctx.fillStyle=color;ctx.fillRect(0,0,w,h);
        // No invented spine copy. Available front artwork supplies a subtle edge.
        ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(w-6,0,3,h);
      });
    }
    const colors=['#512342','#123454','#10334d','#18354e','#315565','#243747','#203849'];
    const covers=await timeout(Promise.all(books.map(book=>loadTexture(book.cover))),12000);
    books.forEach((book,index)=>{
      const width=book.coverRatio || .75;
      const pages=Number((book.shelfFormat || book.format || '').match(/\d+/)?.[0])||80;
      const depth=clamp(pages*.00019+.003,.016,.023);
      const group=new THREE.Group();group.userData.index=index;group.userData.width=width;
      const sheet=new THREE.Mesh(own(new THREE.RoundedBoxGeometry(width-.005,.995,depth,2,.001)),paperMaterial);
      sheet.castShadow=true;sheet.receiveShadow=true;group.add(sheet);
      const coating=own(new THREE.MeshPhysicalMaterial({map:covers[index],roughness:.64,metalness:0,clearcoat:.18,clearcoatRoughness:.5,envMapIntensity:.4}));
      const front=new THREE.Mesh(own(new THREE.PlaneGeometry(width,1)),coating);
      group.userData.coating=coating;
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
    const corners=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
    function projectLink(group,pose) {
      const width=group.userData.width;
      const points=[[-width/2,-.5],[width/2,-.5],[width/2,.5],[-width/2,.5]].map(([x,y],i)=>{
        const v=corners[i].set(x,y,.014).applyMatrix4(group.matrixWorld).project(camera);
        return {x:(v.x+1)*stage.clientWidth/2,y:(1-v.y)*stage.clientHeight/2};
      });
      const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
      const w=Math.max(...points.map(p=>p.x))-left,h=Math.max(...points.map(p=>p.y))-top;
      openLink.style.left=left+'px';openLink.style.top=top+'px';openLink.style.width=w+'px';openLink.style.height=h+'px';
      openLink.style.clipPath='polygon('+points.map(p=>`${(p.x-left)/w*100}% ${(p.y-top)/h*100}%`).join(',')+')';
      openLink.hidden=pose.focus<.82;
    }
    function resize() {
      const width=stage.clientWidth,height=stage.clientHeight;if(!width||!height)return;
      renderer.setSize(width,height,false);camera.aspect=width/height;
      const desktopDistance=Math.max(3.5,4.75/(2*Math.tan(27*Math.PI/360)*camera.aspect));
      const state=snapshot();
      // Frame the actual cover height, independent of a short viewport's aspect
      // ratio. The old desktop fit made phone covers unexpectedly tiny.
      const mobile=state.mobile ?? width<=700;
      const targetHeight=clamp(width*.82,320,360);
      const mobileDistance=height/(2*Math.tan(27*Math.PI/360)*targetHeight)+.28;
      camera.position.set(0,mobile ? .79 : 1.03,mobile?mobileDistance:camera.aspect<1.3?3.05:desktopDistance);
      camera.lookAt(0,mobile ? .48 : .49,0);camera.updateProjectionMatrix();camera.updateMatrixWorld();draw(state);
    }
    function draw(state) {
      if(disposed)return;
      openLink.hidden=true;
      const mobile=state.mobile ?? stage.clientWidth<=700;
      const editorial=!mobile&&stage.clientWidth>1050&&shelf.classList.contains('home-editorial-shelf');
      const poses=groups.map((_,index)=>shelfPose(state.distances[index],state.visible.length,state.focus[index],mobile,editorial));
      const mobileWindow=mobile?new Set(state.visible.filter(index=>poses[index].seam>.02).sort((a,b)=>Math.abs(poses[a].x)-Math.abs(poses[b].x)).slice(0,5)):null;
      groups.forEach((group,index)=>{
        if(!state.visible.includes(index)) {
          group.position.y=.5-1.15*(1-state.alphas[index]);
          group.visible=!mobile && state.alphas[index]>.02 && state.visible.length>0;
          return;
        }
        const pose=poses[index];
        group.position.set(pose.x,pose.y,pose.z);group.rotation.y=pose.rotation;
        group.scale.setScalar(pose.scale);
        group.visible=state.alphas[index]>.02 && pose.seam>.02 && state.visible.length>0 && (!mobileWindow||mobileWindow.has(index));
        // Filter departures sink behind the shelf instead of dissolving paper.
        group.position.y-=1.15*(1-state.alphas[index]);
        group.userData.coating.color.setScalar(.86+.14*pose.focus);
        group.updateMatrixWorld();
        if(index===state.activeIndex&&group.visible){projectLink(group,pose);}

      });
      shelf.querySelectorAll('[data-shelf-index]').forEach(el=>el.tabIndex=-1);
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
    shelf.classList.remove('has-shelf-scene');shelf.dataset.shelfRenderer='fallback';openLink.hidden=true;
  }
}
