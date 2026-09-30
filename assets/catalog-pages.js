(function () {
  const books = window.DV_BOOKS || [];
  const collections = window.DV_COLLECTIONS || {};

  const cover = (book, className = "dv-catalog-cover") => book.cover
    ? `<img class="${className}" src="${book.cover}" alt="${book.title} book cover" loading="lazy">`
    : `<span class="${className} dv-catalog-cover-fallback"><small>An illustrated sacred infographic</small><strong>The<br><em>Visual</em><br>Bible</strong></span>`;

  const card = (book) => `
    <article class="dv-catalog-card" data-status="${book.status.toLowerCase().replaceAll(" ", "-")}">
      <a class="dv-catalog-image" href="${book.url}" aria-label="Explore ${book.title}">${cover(book)}<span>Explore the book <b>↗</b></span></a>
      <div class="dv-catalog-copy">
        <p>${book.audience} · ${book.status}</p>
        <h2><a href="${book.url}">${book.title}</a></h2>
        <span>${book.description}</span>
        <div class="dv-catalog-tags" aria-label="Collections">${book.collections.map(id => collections[id] ? `<a href="${collections[id].url}">${collections[id].name}</a>` : "").join("")}</div>
      </div>
    </article>`;

  const initLivingShelf = () => {
    const shelf = document.querySelector("[data-living-shelf]");
    if (!shelf || !books.length) return;

    const stage = shelf.querySelector("[data-shelf-stage]");
    const camera = shelf.querySelector("[data-shelf-camera]");
    const track = shelf.querySelector("[data-shelf-track]");
    const previous = shelf.querySelector("[data-shelf-previous]");
    const next = shelf.querySelector("[data-shelf-next]");
    const pagination = shelf.querySelector("[data-shelf-pagination]");
    const currentLabel = shelf.querySelector("[data-shelf-current]");
    const totalLabel = shelf.querySelector("[data-shelf-total]");
    const title = shelf.querySelector("[data-shelf-title]");
    const description = shelf.querySelector("[data-shelf-description]");
    const audience = shelf.querySelector("[data-shelf-audience]");
    const format = shelf.querySelector("[data-shelf-format]");
    const collectionTags = shelf.querySelector("[data-shelf-collections]");
    const exploreLink = shelf.querySelector("[data-shelf-link]");
    const live = shelf.querySelector("[data-shelf-live]");
    const hint = shelf.querySelector("[data-shelf-hint]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const narrowScreen = window.matchMedia("(max-width: 700px)");
    const storageKey = "dv-living-shelf-book";
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const mix = (start, end, progress) => start + (end - start) * progress;
    const escapeHTML = (value) => String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
    const twoDigits = (value) => String(value).padStart(2, "0");
    const visualDefaults = {
      accent:"#d4b06c",
      spine:"#182d42",
      spineInk:"#fff3c8",
      spineRail:"rgba(2,9,16,.62)",
      spineFoil:"rgba(255,241,189,.7)",
      glow:"rgba(190,139,67,.36)",
      spotlight:{hue:38,saturation:78,lightness:58,alpha:.32}
    };
    const bookVisuals = {
      "cut-open": { accent:"#e5b94f", spine:"#0c3157", spineInk:"#fff4c7", spineRail:"rgba(2,12,24,.72)", spineFoil:"rgba(111,220,255,.9)", glow:"rgba(44,149,214,.34)", spotlight:{hue:205,saturation:82,lightness:55,alpha:.3} },
      "new-york-city": { accent:"#e63b32", spine:"#082e51", spineInk:"#f7f4e8", spineRail:"rgba(2,13,24,.72)", spineFoil:"rgba(167,218,246,.92)", glow:"rgba(45,123,174,.38)", spotlight:{hue:204,saturation:76,lightness:54,alpha:.31} },
      "romantasy-yearbook": { accent:"#f0b2d8", spine:"#5a1d55", spineInk:"#fff7fb", spineRail:"rgba(24,5,26,.64)", spineFoil:"rgba(255,214,247,.92)", glow:"rgba(198,82,155,.34)", spotlight:{hue:318,saturation:76,lightness:58,alpha:.3} },
      "abraham-lincoln": { accent:"#e2bd70", spine:"#10345d", spineInk:"#fff0bc", spineRail:"rgba(2,14,31,.66)", spineFoil:"rgba(255,228,155,.88)", glow:"rgba(194,148,71,.34)", spotlight:{hue:212,saturation:76,lightness:56,alpha:.29} },
      "hindenburg": { accent:"#e7b35e", spine:"#1c5268", spineInk:"#fff1c1", spineRail:"rgba(2,19,29,.64)", spineFoil:"rgba(188,244,255,.9)", glow:"rgba(206,111,45,.34)", spotlight:{hue:190,saturation:78,lightness:54,alpha:.3} },
      "pompeii": { accent:"#ef8c67", spine:"#67251f", spineInk:"#fff6e3", spineRail:"rgba(29,5,5,.66)", spineFoil:"rgba(255,218,175,.9)", glow:"rgba(206,76,43,.36)", spotlight:{hue:18,saturation:82,lightness:55,alpha:.32} },
      "alcatraz": { accent:"#ef604d", spine:"#17384f", spineInk:"#fff1cf", spineRail:"rgba(2,13,24,.7)", spineFoil:"rgba(240,210,140,.9)", glow:"rgba(210,63,52,.38)", spotlight:{hue:8,saturation:78,lightness:55,alpha:.32} }
    };

    const amazonLink = shelf.querySelector('[data-shelf-amazon]');
    const worlds = shelf.querySelector('[data-shelf-worlds]');
    let activeIndex = 0;
    const hashId = new URLSearchParams(location.hash.slice(1)).get('book');
    try {
      const id = hashId || sessionStorage.getItem(storageKey);
      const saved = books.findIndex(book => book.id === id);
      if (saved >= 0) activeIndex = saved;
    } catch (_) {}

    const bookMarkup = (book, index) => {
      const visual = bookVisuals[book.id] || visualDefaults;
      const name = escapeHTML(book.shortTitle || book.title);
      const front = book.cover
        ? `<img src="${escapeHTML(book.cover)}" alt="" draggable="false" loading="eager" decoding="async">`
        : `<span class="dv-catalog-cover-fallback"><small>Discover Visually</small><strong>${name}</strong></span>`;
      const reflection = book.cover
        ? `<span class="shelf-book-reflection" aria-hidden="true"><img src="${escapeHTML(book.cover)}" alt="" draggable="false"></span>`
        : "";
      return `
        <a class="shelf-book" href="${escapeHTML(book.url)}" data-shelf-index="${index}"
          aria-label="Explore ${escapeHTML(book.title)}, book ${index + 1} of ${books.length}"
          draggable="false" style="--shelf-book-width:calc(var(--shelf-book-height) * ${book.coverRatio || .75});--shelf-book-half-width:calc(var(--shelf-book-height) * ${(book.coverRatio || .75)/2});--book-accent:${visual.accent};--book-spine:${visual.spine};--book-spine-ink:${visual.spineInk || visualDefaults.spineInk};--book-spine-rail:${visual.spineRail || visualDefaults.spineRail};--book-spine-foil:${visual.spineFoil || visualDefaults.spineFoil};--book-glow:${visual.glow}">
          <span class="shelf-book-interaction" aria-hidden="true"><span class="shelf-book-object">
            <span class="shelf-book-paper-block"></span>
            <span class="shelf-book-face shelf-book-front">${front}</span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-left"><span>${name}</span></span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-right"><span>${name}</span></span>
          </span>
          </span><span class="shelf-book-spine-card" aria-hidden="true"><span>${name}</span></span>
          <span class="shelf-book-spine-label" aria-hidden="true">${name}<b aria-hidden="true">↗</b></span>
          <span class="shelf-book-light-pool" aria-hidden="true"></span>
          ${reflection}
          <span class="shelf-book-quick" aria-hidden="true"><span>Explore ${name}</span><b>↗</b></span>
        </a>`;
    };



    track.innerHTML = books.map(bookMarkup).join('');
    pagination.innerHTML = books.map((book, index) => `<button type="button" data-shelf-page="${index}" aria-label="Show ${escapeHTML(book.title)}" aria-pressed="false"><img src="${escapeHTML(book.cover)}" alt="" draggable="false" decoding="async"><span>${escapeHTML(book.shortTitle || book.title)}</span></button>`).join('');
    const bookElements = [...track.querySelectorAll('[data-shelf-index]')];
    const pageButtons = [...pagination.querySelectorAll('[data-shelf-page]')];
    const copy = [...shelf.querySelectorAll('[data-shelf-copy]')];
    const stories = window.DV_SHELF_STORIES || {};
    let visible = books.map((_, index) => index);
    let topic = 'all', age = 'all', gift = '';
    let position = activeIndex, velocity = 0, frame = 0, previousTime = null;
    let layout = {}, drag = null, suppressClick = 0, wheelTotal = 0, wheelTimer = 0;
    let sceneVersion = 0, sceneTimer = 0, filterTransition = null;
    let distances = books.map((_, index) => index-position), alphas = books.map(() => 1);
    const prefetched = new Set();
    const smooth = value => { const x = clamp(value, 0, 1); return x*x*x*(x*(x*6-15)+10); };
    const slot = () => Math.max(0, visible.indexOf(activeIndex));
    const state = () => ({book:visible.length ? books[activeIndex] : null, activeIndex, visible:[...visible], topic, age, gift});
    function measure() {
      layout = {width:stage.clientWidth, height:parseFloat(getComputedStyle(bookElements[0]).height)||300, mobile:narrowScreen.matches};
    }
    function geometry(distance) {
      const a = Math.abs(distance), side = Math.sign(distance), mobile = layout.mobile;
      const neighbour = mobile ? layout.width*.39 : Math.min(layout.width*.23,310);
      const spine = mobile ? layout.width*.56 : Math.min(layout.width*.36,480);
      let x, scale, angle, depth, spineOpacity, opacity;
      if(a <= 1) {
        const p = smooth(a);
        x = mix(0,neighbour,p); scale = mix(1,mobile?.77:.81,p);
        angle = mix(0,mobile?58:30,p); depth = mix(95,-35,p);
        spineOpacity = 0; opacity = mix(1,.76,p);
      } else {
        const p = smooth(a-1);
        x = a<2 ? mix(neighbour,spine,p) : spine+(a-2)*(mobile?33:46);
        scale = mix(mobile?.77:.81,.73,p); angle = mix(mobile?58:30,88,p);
        depth = mix(-35,-70,p); spineOpacity = smooth((a-1.25)/.7);
        opacity = mix(.76,.57,p)*(1-smooth((x-layout.width/2+35)/85));
      }
      return {x:x*side, scale, angle:-angle*side, depth, spineOpacity, opacity, distance:a};
    }
    function render(now=performance.now()) {
      const progress = filterTransition ? smooth((now-filterTransition.time)/620) : 1;
      bookElements.forEach((element,index) => {
        const local = visible.indexOf(index), included = local>=0;
        const target = included ? local-position : (Math.sign(filterTransition?.distances[index] || distances[index])||1)*(books.length+2);
        const distance = filterTransition ? mix(filterTransition.distances[index],target,progress) : target;
        const alpha = filterTransition ? mix(filterTransition.alphas[index],included?1:0,progress) : included?1:0;
        distances[index]=distance; alphas[index]=alpha;
        const g=geometry(distance), lift=9*(1-smooth(Math.min(g.distance,1)))+Math.sin(Math.min(g.distance,1)*Math.PI)*7;
        const props={'--shelf-x':g.x+'px','--shelf-y':((1-g.scale)*layout.height/2-lift)+'px','--shelf-z':g.depth+'px','--shelf-rotate':g.angle+'deg','--shelf-scale':g.scale,'--shelf-opacity':g.opacity*alpha,'--shelf-spine-opacity':g.spineOpacity,'--shelf-brightness':mix(1,.72,Math.min(g.distance/2,1))};
        for(const [key,value] of Object.entries(props)) element.style.setProperty(key,String(value));
        element.dataset.shelfView=g.spineOpacity>.8?'spine':g.distance<.5?'front':'cover';
        element.style.zIndex=String(Math.round(100-g.distance*10));
        element.style.pointerEvents=included&&g.opacity*alpha>.12?'auto':'none';
        element.setAttribute('aria-hidden',String(!included || (g.opacity*alpha<=.12 && index!==activeIndex)));
      });
      if(progress>=1) filterTransition=null;
      shelf.dataset.motionState=frame||drag?.horizontal?'moving':'rest';
    }
    function stop() {cancelAnimationFrame(frame);frame=0;previousTime=null;shelf.classList.remove('is-animating');}
    function settle() {
      if(reducedMotion.matches || document.hidden) {stop();filterTransition=null;position=slot();velocity=0;render();return;}
      if(frame) return;
      shelf.classList.add('is-animating');
      const tick=now=>{
        const dt=previousTime===null?1/60:Math.min((now-previousTime)/1000,.032);previousTime=now;
        const offset=position-slot(),omega=14,c=velocity+omega*offset,decay=Math.exp(-omega*dt);
        position=slot()+(offset+c*dt)*decay;velocity=(velocity-omega*c*dt)*decay;
        render(now);
        if(Math.abs(position-slot())<.0005&&Math.abs(velocity)<.008&&!filterTransition) {
          position=slot();velocity=0;stop();render(now);
        } else frame=requestAnimationFrame(tick);
      };
      frame=requestAnimationFrame(tick);
    }
    async function showWorld(book) {
      if(!worlds || !book.preview) return;
      const version=++sceneVersion,image=new Image();image.alt='';image.decoding='async';image.src=book.preview;
      try {await image.decode();}catch(_){return;}
      if(version!==sceneVersion)return;
      clearTimeout(sceneTimer);
      sceneTimer=setTimeout(()=>{
        if(version!==sceneVersion)return;
        [...worlds.children].slice(0,-1).forEach(el=>el.remove());worlds.append(image);
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
          if(version!==sceneVersion)return;
          [...worlds.children].forEach(el=>el.classList.toggle('is-visible',el===image));
        }));
        sceneTimer=setTimeout(()=>{if(version===sceneVersion)[...worlds.children].filter(el=>el!==image).forEach(el=>el.remove());},750);
      },reducedMotion.matches?0:140);
    }
    function update(announce=false,animateCopy=false) {
      const book=books[activeIndex],story=stories[book.id],visual=bookVisuals[book.id]||visualDefaults;
      const empty=!visible.length;shelf.classList.toggle('is-empty',empty);
      shelf.querySelector('[data-shelf-empty]').hidden=!empty;
      shelf.querySelector('.living-shelf-console').hidden=empty;
      currentLabel.textContent=twoDigits(empty?0:slot()+1);totalLabel.textContent=twoDigits(visible.length);
      title.textContent=book.shortTitle||book.title;
      description.textContent=story?.hook||book.description;audience.textContent=book.audience;format.textContent=book.shelfFormat||book.format;
      shelf.querySelector('[data-shelf-benefits]').innerHTML=(story?.benefits||[]).map(text=>`<li>${escapeHTML(text)}</li>`).join('');
      shelf.querySelector('[data-shelf-detail]').href=book.url;
      exploreLink.setAttribute('aria-label','See inside '+book.title);
      amazonLink.href=book.amazon;amazonLink.hidden=empty||!book.amazon;
      amazonLink.setAttribute('aria-label','View '+book.title+' on Amazon (opens in a new tab)');
      collectionTags.innerHTML=book.collections.map(id=>collections[id]?`<a href="${collections[id].url}">${collections[id].name}</a>`:'').join('');
      shelf.style.setProperty('--shelf-accent',visual.accent);shelf.style.setProperty('--shelf-glow',visual.glow);
      shelf.dataset.activeBook=empty?'':book.id;
      bookElements.forEach((el,index)=>{
        el.classList.toggle('is-active',!empty&&index===activeIndex);el.tabIndex=!empty&&index===activeIndex?0:-1;
        el.setAttribute('aria-label',index===activeIndex?'See inside '+books[index].title:'Bring '+books[index].title+' to the centre');
        el.style.setProperty('--shelf-tilt-x','0deg');el.style.setProperty('--shelf-tilt-y','0deg');
      });
      pageButtons.forEach((button,index)=>{
        button.hidden=!visible.includes(index);button.setAttribute('aria-pressed',String(!empty&&index===activeIndex));
        if(!empty&&index===activeIndex)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
      });
      pagination.setAttribute('aria-label','Choose from '+visible.length+' matching books');
      previous.disabled=empty||slot()===0;next.disabled=empty||slot()===visible.length-1;
      if(announce)live.textContent=empty?'No books match these filters. Try all ages or reset the filters.':book.title+'. '+book.audience+'. Book '+(slot()+1)+' of '+visible.length+'.';
      if(animateCopy&&!reducedMotion.matches)copy.forEach(el=>{
        el.getAnimations?.().forEach(animation=>animation.cancel());
        el.animate([{opacity:.65,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:340,delay:140,easing:'cubic-bezier(.2,.7,.2,1)'});
      });
      if(!empty){
        try{sessionStorage.setItem(storageKey,book.id);}catch(_){}
        if(!prefetched.has(book.id)){prefetched.add(book.id);const link=document.createElement('link');link.rel='prefetch';link.href=book.url;document.head.append(link);}
        showWorld(book);
      }
      shelf.dispatchEvent(new CustomEvent('shelfchange',{detail:state()}));
    }
    function goTo(requested,focus=false) {
      if(!visible.length)return;
      const index=clamp(Math.round(requested),0,books.length-1);
      if(!visible.includes(index))return;
      const changed=index!==activeIndex;activeIndex=index;if(changed)update(true,true);
      settle();if(focus)pageButtons[index].focus({preventScroll:true});
      if(focus||layout.mobile){
        const rail=pagination.getBoundingClientRect(),chosen=pageButtons[index].getBoundingClientRect();
        if(chosen.left<rail.left||chosen.right>rail.right)pagination.scrollTo({left:pageButtons[index].offsetLeft-(pagination.clientWidth-pageButtons[index].offsetWidth)/2,behavior:reducedMotion.matches?'instant':'smooth'});
      }
    }
    function goSlot(requested,focus=false){if(visible.length)goTo(visible[clamp(Math.round(requested),0,visible.length-1)],focus);}
    function filter(options={}) {
      finishDrag(null,true);stop();
      const from={distances:[...distances],alphas:[...alphas],time:performance.now()};
      topic=['all','history','machines','cities','romantasy'].includes(options.topic)?options.topic:'all';
      age=['all','8-9','10-12'].includes(options.age)?options.age:'all';gift=options.gift||'';
      visible=books.map((_,index)=>index).filter(index=>{
        const story=stories[books[index].id];
        return (topic==='all'||story?.topic===topic)&&(age==='all'||(story?.minAge!=null&&story.minAge<=(age==='8-9'?8:10)));
      });
      if(!visible.includes(activeIndex)&&visible.length)activeIndex=visible[0];
      position=slot();velocity=0;filterTransition=reducedMotion.matches?null:from;
      update(true,true);render();settle();
    }
    function finishDrag(event,cancelled=false) {
      if(!drag||(event&&event.pointerId!==drag.id))return;
      const snapshot=drag;drag=null;
      if(stage.hasPointerCapture?.(snapshot.id))stage.releasePointerCapture(snapshot.id);
      shelf.classList.remove('is-dragging');
      if(snapshot.horizontal){
        suppressClick=Date.now()+350;const fresh=performance.now()-snapshot.time<100?snapshot.velocity:0;
        const target=cancelled?slot():clamp(Math.round(position-fresh*.18),snapshot.startIndex-2,snapshot.startIndex+2);
        velocity=cancelled?0:-fresh;goSlot(target);
      }else settle();
    }
    stage.addEventListener('pointerdown',event=>{
      if(!visible.length||event.button!==0||event.target.closest('button'))return;
      stop();filterTransition=null;velocity=0;
      drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:performance.now(),startPosition:position,startIndex:slot(),velocity:0,horizontal:false};
    });
    stage.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.id)return;
      const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
      if(!drag.horizontal){
        if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>9){finishDrag(event,true);return;}
        if(Math.abs(dx)<8)return;
        drag.horizontal=true;stage.setPointerCapture(event.pointerId);shelf.classList.add('is-dragging');
      }
      event.preventDefault();const step=clamp(layout.width*(layout.mobile?.52:.25),155,340),now=performance.now();
      const sample=((event.clientX-drag.x)/step)/Math.max((now-drag.time)/1000,.008);
      drag.velocity=mix(drag.velocity,sample,.55);drag.x=event.clientX;drag.time=now;
      const requested=drag.startPosition-dx/step,last=visible.length-1;
      position=requested<0?requested*.18:requested>last?last+(requested-last)*.18:requested;render();
    },{passive:false});
    stage.addEventListener('pointerup',event=>finishDrag(event));
    stage.addEventListener('pointercancel',event=>finishDrag(event,true));
    stage.addEventListener('lostpointercapture',()=>finishDrag(null,true));
    stage.addEventListener('pointerleave',event=>{if(drag&&!stage.hasPointerCapture?.(drag.id))finishDrag(event,true);});
    stage.addEventListener('dragstart',event=>event.preventDefault());
    stage.addEventListener('wheel',event=>{
      if(!visible.length||Math.abs(event.deltaX)<=Math.abs(event.deltaY)*1.2)return;
      event.preventDefault();wheelTotal+=event.deltaX;clearTimeout(wheelTimer);
      if(Math.abs(wheelTotal)>55){goSlot(slot()+Math.sign(wheelTotal));wheelTotal=0;}
      wheelTimer=setTimeout(()=>wheelTotal=0,160);
    },{passive:false});
    track.addEventListener('click',event=>{
      const el=event.target.closest('[data-shelf-index]');if(!el)return;
      event.preventDefault();if(Date.now()<suppressClick)return;
      const index=Number(el.dataset.shelfIndex);
      if(index!==activeIndex)goTo(index);else exploreLink.click();
    });
    previous.addEventListener('click',()=>goSlot(slot()-1));next.addEventListener('click',()=>goSlot(slot()+1));
    pageButtons.forEach((button,index)=>button.addEventListener('click',()=>goTo(index)));
    shelf.addEventListener('keydown',event=>{
      if(!visible.length||!event.target.closest('.living-shelf-camera,.shelf-navigation'))return;
      const keys={ArrowLeft:slot()-1,ArrowRight:slot()+1,Home:0,End:visible.length-1};
      if(Object.hasOwn(keys,event.key)){
        event.preventDefault();goSlot(keys[event.key],Boolean(event.target.closest('[data-shelf-page]')));
        if(event.target.matches('.shelf-book'))bookElements[activeIndex].focus({preventScroll:true});
      }
      if(event.key==='Enter'&&event.target===camera){event.preventDefault();exploreLink.click();}
    });
    bookElements.forEach((el,index)=>{
      el.addEventListener('pointermove',event=>{
        if(index!==activeIndex||drag?.horizontal||!finePointer.matches||reducedMotion.matches)return;
        const bounds=el.getBoundingClientRect(),x=clamp((event.clientX-bounds.left)/bounds.width,0,1),y=clamp((event.clientY-bounds.top)/bounds.height,0,1);
        el.style.setProperty('--shelf-tilt-y',((x-.5)*5)+'deg');el.style.setProperty('--shelf-tilt-x',((.5-y)*3)+'deg');el.style.setProperty('--shelf-shine-x',(x*100)+'%');
      });
      const release=()=>{el.classList.remove('is-pressed');el.style.setProperty('--shelf-tilt-x','0deg');el.style.setProperty('--shelf-tilt-y','0deg');};
      el.addEventListener('pointerleave',release);el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
      el.addEventListener('pointerdown',event=>{if(index===activeIndex&&event.pointerType==='touch'&&!reducedMotion.matches)el.classList.add('is-pressed');});
    });
    reducedMotion.addEventListener('change',()=>{
      stop();filterTransition=null;position=slot();velocity=0;
      copy.forEach(el=>el.getAnimations?.().forEach(animation=>animation.cancel()));render();
    });
    window.addEventListener('resize',()=>{finishDrag(null,true);stop();filterTransition=null;measure();position=slot();velocity=0;render();});
    window.addEventListener('blur',()=>finishDrag(null,true));
    document.addEventListener('visibilitychange',()=>{if(document.hidden){finishDrag(null,true);stop();filterTransition=null;position=slot();velocity=0;render();}});
    hint.innerHTML='<span class="shelf-hint-icon" aria-hidden="true">↔</span> '+(finePointer.matches?'Drag to browse · click the centre book to open':'Swipe to browse · tap the centre book to open');
    window.DVShelf={getState:state,select:goTo,filter};
    measure();render();update();

  };

  document.querySelectorAll("[data-catalog-grid]").forEach((grid) => {
    const collection = grid.dataset.catalogGrid;
    const shown = collection === "all"
      ? books
      : books.filter(book => book.collections.includes(collection));
    const collectionCopy = {
      history: "Walk through Pompeii before Vesuvius erupts, cross the Atlantic aboard Hindenburg, enter Abraham Lincoln’s wartime White House and investigate the Alcatraz escape. These subject-led titles also appear in For Children when their audience overlaps.",
      children: "Full-color visual books for curious young readers—from immersive history to engineering and city stories built around maps, scenes, timelines and discovery.",
      "cities-through-time": "Travel through a great city across centuries of change, using maps, timelines, illustrated scenes and infographics to connect the past to places readers can still see today."
    }[collection];
    const collectionDescription = {
      history: "Explore immersive visual history books about Pompeii, Hindenburg, Abraham Lincoln and Alcatraz from the History Hunters series.",
      children: "Full-color visual nonfiction for curious young readers, spanning immersive history, engineering and richly illustrated city stories.",
      "cities-through-time": "Illustrated city histories that show how streets, skylines, people and infrastructure change over time."
    }[collection];
    const heroCopy = document.querySelector(".catalog-hero-copy");
    if (collectionCopy && heroCopy) heroCopy.textContent = collectionCopy;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (collectionDescription && metaDescription) metaDescription.setAttribute("content", collectionDescription);
    grid.innerHTML = shown.length ? shown.map(card).join("") : `<div class="catalog-empty"><p class="catalog-kicker">The next shelf is taking shape</p><h2>Visual Learning.<em>Coming soon.</em></h2><p>We are developing visual guides that make complex ideas easier to see, explore and remember.</p><a href="/books/">Browse the current books <b>→</b></a></div>`;
    const count = document.querySelector("[data-catalog-count]");
    if (count) count.textContent = `${shown.length} ${shown.length === 1 ? "title" : "titles"}`;
  });

  initLivingShelf();

  document.querySelectorAll("[data-related-books]").forEach((section) => {
    const current = section.dataset.relatedBooks;
    const book = books.find(item => item.id === current);
    if (!book) return;
    const related = books
      .filter(item => item.id !== current && !item.carouselOnly)
      .map(item => ({ item, score: item.collections.filter(id => book.collections.includes(id)).length }))
      .sort((a,b) => b.score - a.score)
      .slice(0,3)
      .map(match => match.item);
    const collection = collections[book.primaryCollection];
    section.innerHTML = `
      <div class="dv-related-head"><div><p class="dv-related-kicker">Continue exploring</p><h2>More for curious readers</h2></div><a class="dv-related-all" href="${collection.url}">Explore all ${collection.name.toLowerCase()} books →</a></div>
      <div class="dv-related-grid">${related.map(item => `<a class="dv-related-card" href="${item.url}">${item.cover ? `<img src="${item.cover}" alt="${item.title} book cover" loading="lazy">` : `<span class="dv-related-cover-fallback">The<br>Visual<br>Bible</span>`}<span><small>${item.audience} · ${item.status}</small><strong>${item.title}</strong><span>${item.format}</span></span></a>`).join("")}</div>`;
  });
})();
