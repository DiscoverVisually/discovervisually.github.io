/* Homepage entrypoint. Reuse the catalogue's physical shelf and cinematic reader. */
(async () => {
  const menu=document.querySelector('[data-menu-button]'),nav=document.querySelector('[data-navigation]');
  function closeMenu(){menu.setAttribute('aria-expanded','false');nav.removeAttribute('data-open');document.documentElement.style.overflow='';}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.toggleAttribute('data-open',open);document.documentElement.style.overflow=open?'hidden':'';});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  window.addEventListener('resize',()=>{if(innerWidth>800)closeMenu();});
  const explore=document.querySelector('.nav-explore');
  document.addEventListener('click',event=>{if(explore.open&&!explore.contains(event.target))explore.open=false;});

  const shelf=document.querySelector('[data-living-shelf]');
  const desktop=matchMedia('(min-width:1051px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
  const giftDialog=document.querySelector('[data-gift-dialog]');
  let giftTrigger=null,giftOverflow='';
  document.querySelectorAll('[data-gift-open]').forEach(trigger=>trigger.addEventListener('click',event=>{
    event.preventDefault();if(giftDialog.open)return;
    closeMenu();giftTrigger=trigger;giftOverflow=document.documentElement.style.overflow;
    giftDialog.showModal();document.documentElement.style.overflow='hidden';
  }));
  document.querySelector('[data-gift-close]').addEventListener('click',()=>giftDialog.close());
  document.querySelector('[data-gift-done]').addEventListener('click',()=>{giftDialog.close();shelf.classList.add('shelf-engaged');requestAnimationFrame(()=>shelf.querySelector('[data-shelf-camera]').focus({preventScroll:true}));});
  giftDialog.addEventListener('click',event=>{if(event.target===giftDialog){const r=giftDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)giftDialog.close();}});
  giftDialog.addEventListener('close',()=>{document.documentElement.style.overflow=giftOverflow;giftTrigger?.focus({preventScroll:true});});
  shelf.addEventListener('pointerdown',()=>shelf.classList.add('shelf-engaged'),{passive:true});
  shelf.addEventListener('keydown',()=>shelf.classList.add('shelf-engaged'));
  shelf.addEventListener('shelfchange',()=>{if(document.activeElement?.closest('[data-living-shelf]')||giftDialog.open)shelf.classList.add('shelf-engaged');});

  try {
    await Promise.all([import('./catalog-data.js?v=20261001mobile1'),import('./shelf-stories.js?v=20261001mobile1'),import('./book-opening.js?v=20260930motion3')]);
    await import('./catalog-pages.js?v=20261004desktop');
    await Promise.all([import('./shelf-experience.js?v=20261004desktop'),import('./commerce-metrics.js?v=20261001mobile1'),import('./book-commerce.js?v=20261001mobile1')]);
  } catch(error) {
    shelf.classList.add('shelf-init-failed');
    shelf.querySelector('.shelf-scene-loading').textContent='Explore every title in our complete catalogue below.';
    console.warn('Homepage shelf could not initialize:',error.message);
  }

  if(location.hash==='#shelf-gift')document.querySelector('[data-gift-open]').click();
  const books=window.DV_BOOKS||[];
  const tabs=[...document.querySelectorAll('[data-home-preview]')];
  const previews={
    'cut-open':{image:'/assets/cut-open-jet-engine.webp',width:1800,height:1173,alt:'Illustrated cutaway of a jet engine from CUT OPEN!',kicker:'Engineering · Ages 8+',title:'A jet engine, explained from the inside.'},
    'new-york-city':{image:'/assets/nyc-hudson.webp',width:2048,height:1335,alt:'Illustrated spread showing Hudson arriving in New York Harbor',kicker:'Cities through time · Ages 10+',title:'Before the skyscrapers, a world of possibility.'},
    'pompeii':{image:'/assets/pompeii-interior-street.webp',width:1400,height:933,alt:'Illustrated Roman street from Pompeii: The Last Day',kicker:'History Hunters · Ages 8–12',title:'Walk the streets of a living Roman city.'}
  };
  function orientTabs(){document.querySelector('.home-preview-tabs').setAttribute('aria-orientation',innerWidth>800?'vertical':'horizontal');}
  orientTabs();window.addEventListener('resize',orientTabs);
  let previewVersion=0;
  async function selectPreview(tab,focus=false){
    const data=previews[tab.dataset.homePreview],book=books.find(item=>item.id===tab.dataset.homePreview);if(!book)return;
    const token=++previewVersion;
    tabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
    document.querySelector('#home-preview-panel').setAttribute('aria-labelledby',tab.id);
    if(focus)tab.focus();
    const sourceSet=data.image.replace(/\.webp$/,'.640.webp')+' 640w, '+data.image.replace(/\.webp$/,'.960.webp')+' 960w, '+data.image+' '+data.width+'w';
    const image=new Image();image.srcset=sourceSet;image.sizes='(max-width:700px) 100vw, 85vw';image.src=data.image;
    try{await image.decode();}catch(_){if(token===previewVersion)document.querySelector('[data-home-preview-title]').textContent='Explore the book to see its illustrated pages.';return;}
    if(token!==previewVersion)return;
    const spread=document.querySelector('[data-home-spread]');spread.src=data.image;spread.srcset=sourceSet;spread.alt=data.alt;spread.width=data.width;spread.height=data.height;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){spread.getAnimations().forEach(animation=>animation.cancel());spread.animate([{opacity:.65},{opacity:1}],{duration:360,easing:'ease-out'});}
    document.querySelector('[data-home-preview-kicker]').textContent=data.kicker;
    document.querySelector('[data-home-preview-title]').textContent=data.title;
    document.querySelector('#home-preview-panel').dataset.bookId=book.id;
    document.querySelector('[data-home-preview-amazon]').href=book.amazon;
    const link=document.querySelector('[data-home-preview-link]');link.href=book.url;link.innerHTML='Explore '+(book.id==='new-york-city'?'New York City':book.shortTitle)+' <b aria-hidden="true">↗</b>';
    const art=document.querySelector('[data-home-spread-link]');art.href=book.url+'#inside';art.setAttribute('aria-label','Explore the illustrated pages inside '+book.title);
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>selectPreview(tab));
    tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+tabs.length)%tabs.length;selectPreview(tabs[next],true);});
  });
  function matchCopy(){
    const state=window.DVShelf?.getState();if(!state)return;
    document.querySelector('[data-home-match]').textContent=state.gift||state.age!=='all'
      ? state.visible.length?(state.visible.length===1?'One book fits':'These '+state.visible.length+' books fit')+' your reader. Explore '+state.book.shortTitle+' on the shelf.':'No match yet. Try another reader age or show all books.'
      : 'Choose who you’re shopping for. We’ll help you find their book.';
  }
  shelf.addEventListener('shelfchange',matchCopy);matchCopy();

  // One gentle paper movement joins the second act to the visitor's scroll.
  const spreadObject=document.querySelector('.home-spread-link');let scrollFrame=0;
  const updatePaper=()=>{scrollFrame=0;if(!desktop.matches||motion.matches){spreadObject.style.removeProperty('--home-spread-tilt');return;}
    const bounds=spreadObject.getBoundingClientRect();
    if(bounds.bottom<0||bounds.top>innerHeight)return;
    const progress=Math.max(0,Math.min(1,(innerHeight-bounds.top)/(innerHeight*.65)));
    spreadObject.style.setProperty('--home-spread-tilt',((1-progress)*12).toFixed(2));
  };
  const schedulePaper=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updatePaper);};
  window.addEventListener('scroll',schedulePaper,{passive:true});window.addEventListener('resize',schedulePaper);motion.addEventListener('change',schedulePaper);schedulePaper();

  // Contextual hover labels leave text and navigation using the native cursor.
  const pointer=document.createElement('span');pointer.className='home-pointer';pointer.setAttribute('aria-hidden','true');document.body.append(pointer);
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  document.addEventListener('pointermove',event=>{
    const target=event.target.closest('.shelf-active-hit,.shelf-book.is-active,.home-spread-link,.home-feature-art');
    const visible=!!target&&desktop.matches&&fine.matches&&!motion.matches&&!document.querySelector('dialog[open]');
    pointer.classList.toggle('is-visible',visible);
    if(!visible)return;
    pointer.textContent=target.matches('.home-spread-link')?'Look inside':target.matches('.home-feature-art')?'Enter New York':'Explore';
    pointer.style.transform='translate('+Math.min(innerWidth-140,event.clientX+18)+'px,'+Math.min(innerHeight-60,event.clientY+18)+'px)';
  },{passive:true});
  const hidePointer=()=>pointer.classList.remove('is-visible');
  document.addEventListener('pointerleave',hidePointer);window.addEventListener('scroll',hidePointer,{passive:true});motion.addEventListener('change',hidePointer);desktop.addEventListener('change',hidePointer);

})();
