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
          <span class="shelf-book-object" aria-hidden="true">
            <span class="shelf-book-paper-block"></span>
            <span class="shelf-book-face shelf-book-front">${front}</span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-left"><span>${name}</span></span>
            <span class="shelf-book-face shelf-book-edge shelf-book-edge-right"><span>${name}</span></span>
          </span>
          <span class="shelf-book-spine-card" aria-hidden="true"><span>${name}</span></span>
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
    let position = activeIndex, velocity = 0, frame = 0, previousTime = null;
    let layout = {}, drag = null, suppressClick = 0, wheelTotal = 0, wheelTimer = 0;
    let sceneVersion = 0, sceneTimer = 0;
    const prefetched = new Set();
    const smooth = value => { const x = clamp(value, 0, 1); return x*x*x*(x*(x*6-15)+10); };

    // Read layout only on resize, never in the animation loop.
    function measure() {
      const width = stage.clientWidth;
      const height = bookElements[0].getBoundingClientRect().height || parseFloat(getComputedStyle(bookElements[0]).height);
      layout = { width, height:parseFloat(getComputedStyle(bookElements[0]).height) || height, mobile:narrowScreen.matches };
    }
    function geometry(distance) {
      const a = Math.abs(distance), side = Math.sign(distance), mobile = layout.mobile;
      const neighbour = mobile ? layout.width*.39 : Math.min(layout.width*.23,310);
      const spine = mobile ? layout.width*.56 : Math.min(layout.width*.36,480);
      const pitch = mobile ? 33 : 46;
      let x, scale, angle, depth, spineOpacity, opacity;
      if(a <= 1) {
        const p = smooth(a);
        x = mix(0,neighbour,p); scale = mix(1,mobile?.78:.83,p);
        angle = mix(0,mobile?58:28,p); depth = mix(65,-30,p);
        spineOpacity = 0; opacity = mix(1,.82,p);
      } else {
        const p = smooth(a-1);
        x = a<2 ? mix(neighbour,spine,p) : spine+(a-2)*pitch;
        scale = mix(mobile?.78:.83,.75,p); angle = mix(mobile?58:28,88,p);
        depth = mix(-30,-65,p); spineOpacity = smooth((a-1.25)/.7);
        opacity = mix(.82,.65,p)*(1-smooth((x-layout.width/2+35)/85));
      }
      return { x:x*side, scale, angle:-angle*side, depth, spineOpacity, opacity, distance:a };
    }
    function render() {
      bookElements.forEach((element,index) => {
        const g = geometry(index-position);
        const lift = Math.sin(Math.min(g.distance,1)*Math.PI)*7;
        const props = {'--shelf-x':g.x+'px','--shelf-y':((1-g.scale)*layout.height/2-lift)+'px','--shelf-z':g.depth+'px','--shelf-rotate':g.angle+'deg','--shelf-scale':g.scale,'--shelf-opacity':g.opacity,'--shelf-spine-opacity':g.spineOpacity,'--shelf-brightness':mix(1,.8,Math.min(g.distance/2,1))};
        for(const [key,value] of Object.entries(props)) element.style.setProperty(key,String(value));
        element.dataset.shelfView = g.spineOpacity>.8?'spine':g.distance<.5?'front':'cover';
        element.style.zIndex = String(Math.round(100-g.distance*10));
        element.style.pointerEvents = g.opacity>.12?'auto':'none';
        element.setAttribute('aria-hidden',String(g.opacity<=.12 && index!==activeIndex));
      });
      shelf.dataset.motionState = frame || drag?.horizontal ? 'moving' : 'rest';
    }
    function stop() {
      cancelAnimationFrame(frame); frame = 0; previousTime = null;
      shelf.classList.remove('is-animating');
    }
    function settle() {
      if(reducedMotion.matches) { stop(); position = activeIndex; velocity = 0; render(); return; }
      if(frame || document.hidden) return;
      shelf.classList.add('is-animating');
      const tick = now => {
        const dt = previousTime===null ? 1/60 : Math.min((now-previousTime)/1000,.032);
        previousTime = now;
        // Exact critically damped spring: stable at every refresh rate, and
        // retargetable from the current position and velocity without jumps.
        const offset = position-activeIndex, omega = 14;
        const c = velocity+omega*offset, decay = Math.exp(-omega*dt);
        position = activeIndex+(offset+c*dt)*decay;
        velocity = (velocity-omega*c*dt)*decay;
        if(Math.abs(position-activeIndex)<.0005 && Math.abs(velocity)<.008) {
          position = activeIndex; velocity = 0; stop(); render();
        } else { render(); frame = requestAnimationFrame(tick); }
      };
      frame = requestAnimationFrame(tick);
    }
    function prefetch(book) {
      if(prefetched.has(book.id)) return;
      prefetched.add(book.id);
      const link = document.createElement('link'); link.rel='prefetch'; link.href=book.url; document.head.append(link);
    }
    async function showWorld(book) {
      if(!worlds || !book.preview) return;
      const version = ++sceneVersion;
      const image = new Image(); image.alt=''; image.decoding='async'; image.src=book.preview;
      try { await image.decode(); } catch (_) { return; }
      if(version!==sceneVersion) return;
      clearTimeout(sceneTimer);
      [...worlds.children].slice(0,-1).forEach(el=>el.remove());
      worlds.append(image);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(version!==sceneVersion) return;
        [...worlds.children].forEach(el=>el.classList.toggle('is-visible',el===image));
      }));
      sceneTimer = setTimeout(()=>{ if(version===sceneVersion) [...worlds.children].filter(el=>el!==image).forEach(el=>el.remove()); },750);
    }
    function update(announce=false, animateCopy=false) {
      const book=books[activeIndex], visual=bookVisuals[book.id] || visualDefaults;
      currentLabel.textContent=twoDigits(activeIndex+1); totalLabel.textContent=twoDigits(books.length);
      title.textContent=book.shortTitle || book.title;
      description.textContent=book.description; audience.textContent=book.audience;
      format.textContent=book.shelfFormat || book.format;
      exploreLink.href=book.url+'#inside'; exploreLink.setAttribute('aria-label','See inside '+book.title);
      amazonLink.href=book.amazon; amazonLink.hidden=!book.amazon;
      amazonLink.setAttribute('aria-label','View '+book.title+' on Amazon (opens in a new tab)');
      collectionTags.innerHTML=book.collections.map(id=>collections[id]?`<a href="${collections[id].url}">${collections[id].name}</a>`:'').join('');
      shelf.style.setProperty('--shelf-accent',visual.accent);
      shelf.style.setProperty('--shelf-glow',visual.glow);
      shelf.dataset.activeBook=book.id;
      bookElements.forEach((element,index)=>{
        element.classList.toggle('is-active',index===activeIndex); element.tabIndex=index===activeIndex?0:-1;
        if(index===activeIndex) element.setAttribute('aria-hidden','false');
        element.setAttribute('aria-label',index===activeIndex?'Explore '+books[index].title:'Bring '+books[index].title+' to the centre');
      });
      pageButtons.forEach((button,index)=>{
        button.setAttribute('aria-pressed',String(index===activeIndex));
        if(index===activeIndex) button.setAttribute('aria-current','true'); else button.removeAttribute('aria-current');
      });
      previous.disabled=activeIndex===0; next.disabled=activeIndex===books.length-1;
      if(announce) live.textContent=book.title+'. '+book.audience+'. Book '+(activeIndex+1)+' of '+books.length+'.';
      // Links are updated synchronously, so a fast click always buys the title
      // currently selected. Copy animation never delays or hides the actions.
      if(animateCopy&&!reducedMotion.matches) copy.forEach(el=>{
        el.getAnimations?.().forEach(animation=>animation.cancel());
        el.animate([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:320,easing:'cubic-bezier(.2,.7,.2,1)'});
      });
      try { sessionStorage.setItem(storageKey,book.id); } catch (_) {}
      prefetch(book); showWorld(book);
    }
    function goTo(requested, focus=false) {
      const index=clamp(Math.round(requested),0,books.length-1), changed=index!==activeIndex;
      activeIndex=index; if(changed) update(true,true);
      settle(); if(focus) pageButtons[index].focus({preventScroll:true});
      if(focus || layout.mobile) {
        const rail= pagination.getBoundingClientRect(), chosen=pageButtons[index].getBoundingClientRect();
        if(chosen.left<rail.left || chosen.right>rail.right) pagination.scrollTo({left:pageButtons[index].offsetLeft-(pagination.clientWidth-pageButtons[index].offsetWidth)/2,behavior:reducedMotion.matches?'instant':'smooth'});
      }
    }
    function finishDrag(event,cancelled=false) {
      if(!drag || (event && event.pointerId!==drag.id)) return;
      const snapshot=drag; drag=null;
      if(stage.hasPointerCapture?.(snapshot.id)) stage.releasePointerCapture(snapshot.id);
      shelf.classList.remove('is-dragging');
      if(snapshot.horizontal) {
        suppressClick=Date.now()+350;
        const fresh=performance.now()-snapshot.time<100?snapshot.velocity:0;
        const projected=position-fresh*.18;
        const target=cancelled?activeIndex:clamp(Math.round(projected),snapshot.startIndex-2,snapshot.startIndex+2);
        velocity=cancelled?0:-fresh;
        goTo(target);
      } else settle();
    }
    stage.addEventListener('pointerdown',event=>{
      if(event.button!==0 || event.target.closest('button')) return;
      stop(); velocity=0;
      drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:performance.now(),startPosition:position,startIndex:activeIndex,velocity:0,horizontal:false};
    });
    stage.addEventListener('pointermove',event=>{
      if(!drag || event.pointerId!==drag.id) return;
      const dx=event.clientX-drag.startX, dy=event.clientY-drag.startY;
      if(!drag.horizontal) {
        if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>9) { finishDrag(event,true); return; }
        if(Math.abs(dx)<8) return;
        drag.horizontal=true; stage.setPointerCapture(event.pointerId); shelf.classList.add('is-dragging');
      }
      event.preventDefault();
      const step=clamp(layout.width*(layout.mobile?.52:.25),155,340), now=performance.now();
      const sample=((event.clientX-drag.x)/step)/Math.max((now-drag.time)/1000,.008);
      drag.velocity=mix(drag.velocity,sample,.55); drag.x=event.clientX; drag.time=now;
      const requested=drag.startPosition-dx/step;
      position=requested<0?requested*.18:requested>books.length-1?books.length-1+(requested-books.length+1)*.18:requested;
      render();
    },{passive:false});
    stage.addEventListener('pointerup',event=>finishDrag(event));
    stage.addEventListener('pointercancel',event=>finishDrag(event,true));
    stage.addEventListener('lostpointercapture',()=>finishDrag(null,true));
    stage.addEventListener('pointerleave',event=>{if(drag&&!stage.hasPointerCapture?.(drag.id))finishDrag(event,true);});
    stage.addEventListener('dragstart',event=>event.preventDefault());
    stage.addEventListener('wheel',event=>{
      if(Math.abs(event.deltaX)<=Math.abs(event.deltaY)*1.2) return;
      event.preventDefault(); wheelTotal+=event.deltaX; clearTimeout(wheelTimer);
      if(Math.abs(wheelTotal)>55){goTo(activeIndex+Math.sign(wheelTotal));wheelTotal=0;}
      wheelTimer=setTimeout(()=>wheelTotal=0,160);
    },{passive:false});
    track.addEventListener('click',event=>{
      const el=event.target.closest('[data-shelf-index]'); if(!el) return;
      const index=Number(el.dataset.shelfIndex);
      if(Date.now()<suppressClick){event.preventDefault();return;}
      if(index!==activeIndex){event.preventDefault();goTo(index);}
    });
    previous.addEventListener('click',()=>goTo(activeIndex-1));
    next.addEventListener('click',()=>goTo(activeIndex+1));
    pageButtons.forEach((button,index)=>button.addEventListener('click',()=>goTo(index)));
    shelf.addEventListener('keydown',event=>{
      if(!event.target.closest('.living-shelf-camera,.shelf-navigation')) return;
      const keys={ArrowLeft:activeIndex-1,ArrowRight:activeIndex+1,Home:0,End:books.length-1};
      if(Object.hasOwn(keys,event.key)) {
        event.preventDefault(); goTo(keys[event.key],Boolean(event.target.closest('[data-shelf-page]')));
        if(event.target.matches('.shelf-book')) bookElements[activeIndex].focus({preventScroll:true});
      }
      if(event.key==='Enter'&&event.target===camera) location.href=books[activeIndex].url+'#inside';
    });
    reducedMotion.addEventListener('change',()=>{stop();position=activeIndex;velocity=0;render();});
    window.addEventListener('resize',()=>{finishDrag(null,true);stop();measure();position=activeIndex;velocity=0;render();});
    window.addEventListener('blur',()=>finishDrag(null,true));
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){finishDrag(null,true);stop();position=activeIndex;velocity=0;render();}
    });
    window.addEventListener('hashchange',()=>{const index=books.findIndex(book=>book.id===new URLSearchParams(location.hash.slice(1)).get('book'));if(index>=0)goTo(index);});
    hint.innerHTML='<span class="shelf-hint-icon" aria-hidden="true">↔</span> '+(finePointer.matches?'Drag or use the arrows · select any cover below':'Swipe to explore · tap a cover below');
    measure(); render(); update();
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
