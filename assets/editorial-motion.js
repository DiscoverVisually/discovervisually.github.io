/* Shared editorial motion. Imported by the two existing site entrypoints. */
(() => {
  if(window.DVEditorialMotion)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
  const animations=new Set(),resets=new Set();
  const excluded='.pm-inside,.az-inside,.ry-inside,[data-living-shelf],[data-shelf-preview]';
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function animate(element,frames,options){
    if(reduced.matches||!element?.animate)return null;
    const animation=element.animate(frames,options);animations.add(animation);
    animation.finished.then(()=>animations.delete(animation),()=>animations.delete(animation));return animation;
  }
  reduced.addEventListener('change',()=>{if(reduced.matches){animations.forEach(a=>a.cancel());animations.clear();resets.forEach(reset=>reset());}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)resets.forEach(reset=>reset());});
  window.DVEditorialMotion={version:'20261001',reducedMotion:()=>reduced.matches};

  // A readable first paint, a single entrance, then quiet depth driven by the visitor.
  const hero=document.querySelector('main .pm-hero,main .az-hero,main .ry-hero,main .hero');
  if(hero){
    hero.classList.add('dv-motion-hero');
    const copy=hero.querySelector('.pm-hero-copy,.az-hero-copy,.ry-hero-copy,.hero-copy');
    const stage=hero.querySelector('.pm-hero-stage,.az-hero-stage,.ry-cover-stage,.hero-stage');
    const scenes={
      'cut-open.html':['/assets/cut-open-jet-engine.webp','50% 38%',.28],
      'new-york-city-through-time.html':['/books/new-york-city-through-time-cover.webp','50% 77%',.74],
      'i-worked-for-abraham-lincoln.html':['/assets/lincoln-interior-first-day.webp','70% 45%',.24],
      'hindenburg-the-final-flight.html':['/assets/hindenburg-interior-airships.webp','62% 38%',.24],
      'pompeii-the-last-day.html':['/assets/pompeii-interior-street.webp','60% 45%',.23],
      'i-worked-at-alcatraz.html':['/assets/alcatraz-interior-map.webp','64% 40%',.2],
      'the-ultimate-romantasy-yearbook.html':['/assets/romantasy-interior-fae-courts.webp','60% 40%',.3]
    };
    const scene=scenes[location.pathname.split('/').pop()];let art=null;
    if(scene){
      art=document.createElement('div');art.className='dv-hero-depth';art.setAttribute('aria-hidden','true');
      art.innerHTML='<div class="dv-hero-scenery"></div><div class="dv-hero-veil"></div><div class="dv-hero-light"></div>';
      const scenery=art.firstElementChild;scenery.style.backgroundImage=`url("${scene[0]}")`;scenery.style.backgroundPosition=scene[1];scenery.style.opacity=scene[2];
      hero.prepend(art);hero.classList.add('dv-has-depth');
    }
    [copy,stage].filter(Boolean).forEach(el=>el.classList.add('dv-entry-target'));
    hero.dataset.dvEntrance='playing';
    const entry=[
      animate(art,[{opacity:.25,scale:'1.025'},{opacity:1,scale:'1'}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}),
      animate(stage,[{opacity:.65,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:850,delay:100,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}),
      animate(copy,[{opacity:.65,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:680,delay:220,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'})
    ].filter(Boolean);
    Promise.all(entry.map(a=>a.finished.catch(()=>{}))).then(()=>hero.dataset.dvEntrance='settled');
    if(scene){
      let frame=0,visible=true,pointer={x:0,y:0},bounds=null;
      const reset=()=>{cancelAnimationFrame(frame);frame=0;pointer={x:0,y:0};['--dv-hero-x','--dv-hero-y','--dv-hero-front-x','--dv-hero-front-y','--dv-hero-scroll'].forEach(key=>hero.style.setProperty(key,'0px'));};
      resets.add(reset);
      const paint=()=>{
        frame=0;if(reduced.matches||!visible||document.hidden)return;
        const rect=hero.getBoundingClientRect();
        const scroll=clamp(-rect.top/Math.max(1,rect.height),0,1)*10;
        hero.style.setProperty('--dv-hero-x',(-pointer.x*5)+'px');hero.style.setProperty('--dv-hero-y',(-pointer.y*3)+'px');
        hero.style.setProperty('--dv-hero-front-x',(pointer.x*3)+'px');hero.style.setProperty('--dv-hero-front-y',(pointer.y*2)+'px');hero.style.setProperty('--dv-hero-scroll',(-scroll)+'px');
      };
      const request=()=>{if(!frame&&!reduced.matches&&visible)frame=requestAnimationFrame(paint);};
      hero.addEventListener('pointerenter',()=>bounds=hero.getBoundingClientRect());
      hero.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches)return;const rect=bounds||hero.getBoundingClientRect();pointer={x:clamp((event.clientX-rect.left)/rect.width*2-1,-1,1),y:clamp((event.clientY-rect.top)/rect.height*2-1,-1,1)};request();},{passive:true});
      hero.addEventListener('pointerleave',()=>{pointer={x:0,y:0};request();});
      window.addEventListener('scroll',()=>{bounds=null;request();},{passive:true});window.addEventListener('resize',()=>{bounds=null;request();},{passive:true});
      if('IntersectionObserver' in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();else reset();}).observe(hero);
    }
  }

  // Reveal small editorial groups once. Content is never hidden while waiting for JS.
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;observer.unobserve(entry.target);entry.target.dataset.dvReveal='shown';
      animate(entry.target,[{opacity:.55,translate:'0 16px'},{opacity:1,translate:'0 0'}],{duration:620,delay:Number(entry.target.dataset.dvDelay||0),easing:'cubic-bezier(.16,1,.3,1)'});
    }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('main section').forEach(section=>{
      if(section.closest(excluded)||section===hero||section.closest('.dv-motion-hero'))return;
      section.classList.add('dv-motion-section');
      const targets=[...section.querySelectorAll('h2,article,.approach-pillars>li,.dv-related-card,.dv-catalog-card')].filter(el=>!el.closest(excluded));
      targets.forEach((el,index)=>{if(el.dataset.dvReveal)return;el.dataset.dvReveal='ready';el.dataset.dvDelay=String(Math.min(index%3*70,140));observer.observe(el);});
    });
  }

  // Stable, visitor-triggered CTA feedback replaces periodic attention loops.
  document.querySelectorAll('a[href*="amazon.com/dp/"],.hero-actions .button,.reader-list-form button').forEach(el=>{if(!el.closest(excluded))el.classList.add('dv-motion-cta');});

  // A single moving gold line follows hover, focus and the current section.
  document.querySelectorAll('.dv-primary-nav,.site-header [data-navigation],.pm-sticky-links,.az-book-nav>div,.ry-book-nav>div').forEach(nav=>{
    nav.setAttribute('data-dv-motion-nav','');const line=document.createElement('span');line.className='dv-nav-indicator';line.setAttribute('aria-hidden','true');nav.append(line);
    let target=null,frame=0;
    const move=element=>{
      target=element;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
        if(!target||!target.isConnected||getComputedStyle(target).display==='none'){line.style.opacity='0';return;}
        const rect=target.getBoundingClientRect(),base=nav.getBoundingClientRect();
        line.style.width=rect.width+'px';line.style.transform='translateX('+(rect.left-base.left+nav.scrollLeft)+'px)';line.style.opacity='1';
      });
    };
    const active=()=>nav.querySelector(':scope>a[aria-current],:scope>details>summary[aria-current]');
    const pick=event=>{const el=event.target.closest('a,summary');if(el&&(el.parentElement===nav||el.parentElement?.parentElement===nav))move(el);};
    nav.addEventListener('pointerover',pick);nav.addEventListener('focusin',pick);nav.addEventListener('pointerleave',()=>move(nav.contains(document.activeElement)?document.activeElement:active()));
    nav.addEventListener('focusout',()=>requestAnimationFrame(()=>move(nav.contains(document.activeElement)?document.activeElement:active())));
    new MutationObserver(()=>{if(!nav.contains(document.activeElement))move(active());}).observe(nav,{attributes:true,subtree:true,attributeFilter:['aria-current']});
    window.addEventListener('resize',()=>move(target||active()),{passive:true});move(active());
  });

  // Native cross-document snapshots preserve the selected cover between pages.
  const heroCover=document.querySelector('.pm-hero .pm-book-cover,.az-hero .az-cover-stage>img,.ry-hero .ry-cover-art>img');
  heroCover?.setAttribute('data-dv-hero-cover','');
  let source=null,navigating=false;
  const clearTransition=()=>{source?.style.removeProperty('view-transition-name');heroCover?.style.removeProperty('view-transition-name');source=null;navigating=false;document.documentElement.classList.remove('dv-navigating');};
  window.addEventListener('pageshow',clearTransition);
  window.addEventListener('pageswap',event=>{if(reduced.matches)event.viewTransition?.skipTransition();});
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||reduced.matches)return;
    const link=event.target.closest('a[href]');if(!link||link.target||link.hasAttribute('download')||link.closest(excluded))return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||url.pathname===location.pathname||!/^\/books\/[^/]+\.html$/.test(url.pathname))return;
    const image=link.querySelector('img:not(.pm-amazon-badge)')||link.closest('.dv-related-card,.dv-catalog-card,.catalog-card,.book-card')?.querySelector('img');
    if(image){heroCover?.style.setProperty('view-transition-name','none');image.style.viewTransitionName='dv-book-cover';source=image;}
    if(!('onpageswap' in window)&&!navigating){
      event.preventDefault();navigating=true;document.documentElement.classList.add('dv-navigating');
      const exit=animate(document.querySelector('main'),[{opacity:1},{opacity:.15}],{duration:180,easing:'ease-out',fill:'forwards'});
      const go=()=>location.assign(url.href);if(exit)exit.finished.then(go,go);else go();
    }
  });

  // One accessible inspector for all editorial images, outside the book galleries.
  let inspector=null,inspectImage=null,pan=null,zoomLabel=null,zoom=1,panX=0,panY=0,restoreFocus=null,activeSource=null,drag=null;
  const pointers=new Map();let pinch=null;
  function ensureInspector(){
    if(inspector)return;
    inspector=document.createElement('dialog');inspector.className='dv-detail-dialog';inspector.setAttribute('aria-labelledby','dv-detail-title');
    inspector.innerHTML='<header><div><small>Discover Visually · look closer</small><h2 id="dv-detail-title">Illustration detail</h2></div><button type="button" data-dv-detail-close aria-label="Close illustration detail" autofocus>×</button></header><div class="dv-detail-pan" tabindex="0" aria-label="Zoomable illustration. Use plus and minus to zoom, arrow keys to move, and zero to reset."><img alt="" draggable="false"></div><footer><span>Drag to move · pinch or use the zoom controls</span><div><button type="button" data-dv-zoom="-" aria-label="Zoom out">−</button><output aria-live="polite">100%</output><button type="button" data-dv-zoom="+" aria-label="Zoom in">+</button><button type="button" data-dv-zoom="0">Reset</button></div></footer>';
    document.body.append(inspector);pan=inspector.querySelector('.dv-detail-pan');inspectImage=pan.querySelector('img');zoomLabel=inspector.querySelector('output');
    inspector.querySelector('[data-dv-detail-close]').addEventListener('click',()=>inspector.close());
    inspector.querySelectorAll('[data-dv-zoom]').forEach(button=>button.addEventListener('click',()=>{zoom=button.dataset.dvZoom==='0'?1:clamp(zoom+(button.dataset.dvZoom==='+'?.35:-.35),1,3);if(zoom===1)panX=panY=0;paintDetail();}));
    inspector.addEventListener('close',()=>{document.body.classList.remove('dv-detail-open');pointers.clear();drag=pinch=null;if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});});
    inspector.addEventListener('click',event=>{if(event.target===inspector){const r=inspector.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)inspector.close();}});
    pan.addEventListener('keydown',event=>{
      if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
        event.preventDefault();if(event.key==='0'){zoom=1;panX=panY=0;}else if(event.key==='+'||event.key==='=')zoom=clamp(zoom+.25,1,3);else if(event.key==='-')zoom=clamp(zoom-.25,1,3);else if(event.key==='ArrowLeft')panX+=45;else if(event.key==='ArrowRight')panX-=45;else if(event.key==='ArrowUp')panY+=45;else panY-=45;paintDetail();
      }
    });
    pan.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;pan.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pointers.size===2){const [a,b]=[...pointers.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom};drag=null;}else drag={id:event.pointerId,x:event.clientX,y:event.clientY,panX,panY};
    });
    pan.addEventListener('pointermove',event=>{
      if(!pointers.has(event.pointerId))return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
      if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()];zoom=clamp(pinch.zoom*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance),1,3);paintDetail();}
      else if(drag&&drag.id===event.pointerId){panX=drag.panX+event.clientX-drag.x;panY=drag.panY+event.clientY-drag.y;paintDetail();}
    });
    const release=event=>{pointers.delete(event.pointerId);if(pan.hasPointerCapture?.(event.pointerId))pan.releasePointerCapture(event.pointerId);pinch=drag=null;};
    pan.addEventListener('pointerup',release);pan.addEventListener('pointercancel',release);pan.addEventListener('lostpointercapture',event=>{pointers.delete(event.pointerId);pinch=drag=null;});
    window.addEventListener('resize',()=>{if(inspector.open)paintDetail();},{passive:true});
  }
  function detailSize(){const r=pan.getBoundingClientRect(),ratio=(inspectImage.naturalWidth||3)/(inspectImage.naturalHeight||2);return {r,width:Math.min(r.width,r.height*ratio),height:Math.min(r.height,r.width/ratio)};}
  function paintDetail(){
    const size=detailSize();panX=clamp(panX,-Math.max(0,(size.width*zoom-size.r.width)/2),Math.max(0,(size.width*zoom-size.r.width)/2));panY=clamp(panY,-Math.max(0,(size.height*zoom-size.r.height)/2),Math.max(0,(size.height*zoom-size.r.height)/2));
    inspectImage.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;zoomLabel.textContent=Math.round(zoom*100)+'%';
    inspector.querySelector('[data-dv-zoom="-"]').disabled=zoom<=1;inspector.querySelector('[data-dv-zoom="+"]').disabled=zoom>=3;
  }
  function openDetail(source){
    const image=source.querySelector('.is-current')||source.querySelector('img');if(!image?.src)return;
    ensureInspector();restoreFocus=document.activeElement;activeSource=source;
    inspectImage.src=image.src;inspectImage.alt=image.alt;inspector.querySelector('h2').textContent=source.closest('[data-dv-explorer]')?.querySelector('.dv-feature-copy h3')?.textContent||'Look closer at the illustration';
    zoom=1.8;inspector.showModal();document.body.classList.add('dv-detail-open');
    const size=detailSize(),x=Number(source.dataset.dvFocusX||50)/100,y=Number(source.dataset.dvFocusY||50)/100;
    panX=(.5-x)*size.width*zoom;panY=(.5-y)*size.height*zoom;paintDetail();
    inspectImage.decode().then(()=>{if(inspector.open&&activeSource===source)paintDetail();}).catch(()=>{});
    animate(inspector,[{opacity:.5,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:220,easing:'ease-out'});
  }
  const spotlight=document.querySelector('.spread-frame');
  if(spotlight&&!spotlight.closest(excluded)){
    spotlight.setAttribute('data-dv-detail-source','');const button=document.createElement('button');button.type='button';button.className='dv-inspect';button.setAttribute('data-dv-inspect','');button.textContent='Inspect detail';spotlight.append(button);
    const lens=document.createElement('span');lens.className='dv-detail-lens';lens.setAttribute('aria-hidden','true');lens.hidden=true;spotlight.append(lens);
  }
  document.querySelectorAll('[data-dv-detail-source]').forEach(source=>{
    const lens=source.querySelector('.dv-detail-lens');let frame=0,point=null;
    const hide=()=>{cancelAnimationFrame(frame);frame=0;if(lens)lens.hidden=true;};resets.add(hide);
    source.querySelector('[data-dv-inspect]')?.addEventListener('click',()=>openDetail(source));
    source.addEventListener('pointermove',event=>{
      if(!lens||!fine.matches||reduced.matches||event.target.closest('button')){hide();return;}
      point={x:event.clientX,y:event.clientY};if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;const image=source.querySelector('.is-current')||source.querySelector('img');if(!image?.naturalWidth)return;
        const r=source.getBoundingClientRect(),ir=image.getBoundingClientRect(),ratio=image.naturalWidth/image.naturalHeight;
        const width=getComputedStyle(image).objectFit==='cover'?Math.max(ir.width,ir.height*ratio):Math.min(ir.width,ir.height*ratio),height=width/ratio;
        const x=point.x-ir.left-(ir.width-width)/2,y=point.y-ir.top-(ir.height-height)/2;
        if(point.x<ir.left||point.x>ir.right||point.y<ir.top||point.y>ir.bottom){lens.hidden=true;return;}
        const size=Math.min(180,r.width*.4),factor=2.4;
        lens.style.width=lens.style.height=size+'px';lens.style.left=clamp(point.x-r.left-size/2,0,r.width-size)+'px';lens.style.top=clamp(point.y-r.top-size/2,0,r.height-size)+'px';
        lens.style.backgroundImage=`url("${image.src}")`;lens.style.backgroundSize=(width*factor)+'px '+(height*factor)+'px';lens.style.backgroundPosition=(size/2-x*factor)+'px '+(size/2-y*factor)+'px';lens.hidden=false;
      });
    },{passive:true});source.addEventListener('pointerleave',hide);
  });

  // Each scene is a small story interaction, independent of the page-turning reader.
  document.querySelectorAll('[data-dv-explorer]').forEach(section=>{
    const buttons=[...section.querySelectorAll('[data-dv-scene]')],scenes=buttons.map(button=>JSON.parse(button.dataset.dvScene));
    const stage=section.querySelector('.dv-feature-stage'),copy=section.querySelector('.dv-feature-copy'),focus=section.querySelector('.dv-scene-focus'),route=section.querySelector('.dv-scene-route');
    const instruction=section.querySelector('.dv-feature-instruction'),instructionText=instruction.textContent;
    const pins=[...section.querySelectorAll('[data-dv-pin]')];let active=0,requested=0,token=0,cleanTimer=0;
    function describe(index,animateCopy=false){
      active=index;instruction.textContent=instructionText;const scene=scenes[index];buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));pins.forEach((pin,i)=>pin.setAttribute('aria-pressed',String(i===index)));
      copy.querySelector('h3').textContent=scene.title;copy.querySelector('p').textContent=scene.body;
      section.style.setProperty('--dv-story-progress',scenes.length>1?index/(scenes.length-1):0);stage.dataset.dvFocusX=String(scene.x);stage.dataset.dvFocusY=String(scene.y);
      focus.hidden=section.dataset.dvMode!=='pins';focus.style.left=scene.x+'%';focus.style.top=scene.y+'%';focus.style.width=focus.style.height=scene.r+'%';
      route.hidden=!scene.route;
      if(scene.route){const path=route.querySelector('path');path.setAttribute('d',scene.route);animate(path,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:1000,easing:'cubic-bezier(.2,.7,.2,1)'});}
      if(animateCopy)animate(copy,[{opacity:.65,translate:'0 5px'},{opacity:1,translate:'0 0'}],{duration:300,easing:'ease-out'});
      stage.removeAttribute('aria-busy');section.dataset.dvActiveScene=String(index);
    }
    async function select(index){
      index=clamp(index,0,scenes.length-1);requested=index;const version=++token,scene=scenes[index];
      const current=stage.querySelector('.is-current');
      if(current.getAttribute('src')!==scene.src){
        stage.setAttribute('aria-busy','true');const image=new Image();image.className='dv-feature-image';image.alt=scene.title+' — illustration from the book';image.decoding='async';image.src=scene.src;
        try{await image.decode();}catch(_){if(version===token){stage.removeAttribute('aria-busy');section.querySelector('.dv-feature-instruction').textContent='This illustration could not load. Choose the topic again to retry.';}return;}
        if(version!==token)return;clearTimeout(cleanTimer);stage.querySelectorAll('.dv-feature-image:not(.is-current)').forEach(el=>el.remove());
        stage.insertBefore(image,current);current.classList.remove('is-current');image.classList.add('is-current');
        animate(image,[{opacity:0,scale:'1.015'},{opacity:1,scale:'1'}],{duration:420,easing:'ease-out'});
        cleanTimer=setTimeout(()=>{if(!current.classList.contains('is-current'))current.remove();},reduced.matches?0:450);
      }
      if(version!==token)return;describe(index,true);
    }
    buttons.forEach((button,index)=>button.addEventListener('click',()=>select(index)));pins.forEach((pin,index)=>pin.addEventListener('click',()=>select(index)));
    section.querySelector('.dv-scene-controls').addEventListener('keydown',event=>{
      const keys={ArrowRight:requested+1,ArrowDown:requested+1,ArrowLeft:requested-1,ArrowUp:requested-1,Home:0,End:scenes.length-1};
      if(Object.hasOwn(keys,event.key)){event.preventDefault();const index=clamp(keys[event.key],0,scenes.length-1);buttons[index].focus({preventScroll:true});select(index);}
    });
    describe(active);
  });
})();
