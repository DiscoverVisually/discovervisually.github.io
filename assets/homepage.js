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
  try {
    await Promise.all([import('./catalog-data.js?v=20261001mobile1'),import('./shelf-stories.js?v=20261001mobile1'),import('./book-opening.js?v=20260930motion3')]);
    await import('./catalog-pages.js?v=20261003shelf5');
    await Promise.all([import('./shelf-experience.js?v=20261001mobile1'),import('./commerce-metrics.js?v=20261001mobile1'),import('./book-commerce.js?v=20261001mobile1')]);
  } catch(error) {
    shelf.classList.add('shelf-init-failed');
    shelf.querySelector('.shelf-scene-loading').textContent='Explore every title in our complete catalogue below.';
    console.warn('Homepage shelf could not initialize:',error.message);
  }

  const books=window.DV_BOOKS||[];
  const tabs=[...document.querySelectorAll('[data-home-preview]')];
  const previews={
    'cut-open':{image:'/assets/cut-open-jet-engine.webp',width:1800,alt:'Illustrated cutaway of a jet engine from CUT OPEN!',kicker:'Engineering · Ages 8+',title:'A jet engine, explained from the inside.'},
    'new-york-city':{image:'/assets/nyc-hudson.webp',width:2048,alt:'Illustrated spread showing Hudson arriving in New York Harbor',kicker:'Cities through time · Ages 10+',title:'Before the skyscrapers, a world of possibility.'},
    'pompeii':{image:'/assets/pompeii-interior-street.webp',width:1400,alt:'Illustrated Roman street from Pompeii: The Last Day',kicker:'History Hunters · Ages 8–12',title:'Walk the streets of a living Roman city.'}
  };
  let previewVersion=0;
  async function selectPreview(tab,focus=false){
    const data=previews[tab.dataset.homePreview],book=books.find(item=>item.id===tab.dataset.homePreview);if(!book)return;
    const token=++previewVersion;
    tabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;});
    document.querySelector('#home-preview-panel').setAttribute('aria-labelledby',tab.id);
    if(focus)tab.focus();
    const sourceSet=data.image.replace(/\.webp$/,'.640.webp')+' 640w, '+data.image.replace(/\.webp$/,'.960.webp')+' 960w, '+data.image+' '+data.width+'w';
    const image=new Image();image.srcset=sourceSet;image.sizes='(max-width:700px) 100vw, 900px';image.src=data.image;
    try{await image.decode();}catch(_){if(token===previewVersion)document.querySelector('[data-home-preview-title]').textContent='Explore the book to see its illustrated pages.';return;}
    if(token!==previewVersion)return;
    const spread=document.querySelector('[data-home-spread]');spread.src=data.image;spread.srcset=sourceSet;spread.alt=data.alt;
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
    tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectPreview(tabs[next],true);});
  });
  function matchCopy(){
    const state=window.DVShelf?.getState();if(!state)return;
    document.querySelector('[data-home-match]').textContent=state.gift||state.age!=='all'
      ? state.visible.length?(state.visible.length===1?'One book fits':'These '+state.visible.length+' books fit')+' your reader. Explore '+state.book.shortTitle+' on the shelf.':'No match yet. Try another reader age or show all books.'
      : 'Choose who you’re shopping for. We’ll help you find their book.';
  }
  shelf.addEventListener('shelfchange',matchCopy);matchCopy();
})();
