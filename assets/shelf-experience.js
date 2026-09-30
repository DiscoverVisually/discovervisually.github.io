/* Discovery, gift matching, shareable state and an in-shelf editorial reader. */
(() => {
  const shelf=document.querySelector('[data-living-shelf]'),engine=window.DVShelf;
  if(!shelf||!engine)return;
  const books=window.DV_BOOKS,stories=window.DV_SHELF_STORIES;
  const $=selector=>document.querySelector(selector);
  const topics=[...shelf.querySelectorAll('[data-shelf-topic]')],gifts=[...shelf.querySelectorAll('[data-shelf-gift]')];
  const age=$('[data-shelf-age]'),fit=$('[data-shelf-fit]'),dialog=$('[data-shelf-preview]');
  const root=$('[data-preview-book]'),left=$('[data-preview-left]'),right=$('[data-preview-right]');
  const leaf=$('[data-preview-leaf]'),loading=$('[data-preview-loading]');
  const previous=$('[data-preview-previous]'),next=$('[data-preview-next]'),tabs=$('[data-preview-tabs]');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const giftFilters={curious:{topic:'all',age:'8-9'},history:{topic:'history',age:'all'},romantasy:{topic:'romantasy',age:'all'},machines:{topic:'machines',age:'all'},cities:{topic:'cities',age:'all'}};
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  const asset=sample=>'/assets/'+sample[0]+'.webp';
  let syncing=false,previewBook=null,spread=0,desired=0,ready=false,version=0,turnVersion=0,animation=null,swapTimer=0,restoreFocus=null;
  const decoded=new Map();
  function decode(src){
    if(!decoded.has(src)){
      const image=new Image();image.decoding='async';image.src=src;
      decoded.set(src,image.decode().catch(error=>{decoded.delete(src);throw error;}));
    }
    return decoded.get(src);
  }
  function writeURL(){
    if(syncing)return;
    const state=engine.getState(),params=new URLSearchParams();
    if(state.book)params.set('book',state.book.id);
    if(state.topic!=='all')params.set('topic',state.topic);
    if(state.age!=='all')params.set('age',state.age);
    if(state.gift)params.set('gift',state.gift);
    if(dialog.open&&previewBook){params.set('view','inside');if(spread)params.set('spread',String(spread+1));}
    history.replaceState(null,'',location.pathname+location.search+(params.size?'#'+params:''));
    try{sessionStorage.setItem('dv-shelf-preferences',JSON.stringify({topic:state.topic,age:state.age,gift:state.gift}));}catch(_){}
  }
  function reflect(){
    const state=engine.getState();
    topics.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shelfTopic===state.topic)));
    age.value=state.age;
    gifts.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.shelfGift===state.gift)));
    shelf.querySelector('.shelf-reset').hidden=state.topic==='all'&&state.age==='all'&&!state.gift;
    fit.hidden=!state.gift||!state.book;fit.textContent=state.book?'Why it fits: '+stories[state.book.id].fit:'';
    $('[data-shelf-share]').disabled=!state.book;
    $('[data-shelf-share-status]').textContent='';$('[data-shelf-share-url]').hidden=true;
    writeURL();
  }
  shelf.addEventListener('shelfchange',reflect);
  topics.forEach(button=>button.addEventListener('click',()=>engine.filter({topic:button.dataset.shelfTopic,age:engine.getState().age})));
  age.addEventListener('change',()=>engine.filter({topic:engine.getState().topic,age:age.value}));
  shelf.querySelectorAll('[data-shelf-reset]').forEach(button=>button.addEventListener('click',()=>engine.filter()));
  gifts.forEach(button=>button.addEventListener('click',()=>{
    const gift=button.dataset.shelfGift;engine.filter({...giftFilters[gift],gift});
  }));
  $('.shelf-gift-jump').addEventListener('click',()=>{$('#shelf-gift').open=true;});
  $('[data-shelf-share]').addEventListener('click',async()=>{
    writeURL();const url=location.href,status=$('[data-shelf-share-status]');
    try{await navigator.clipboard.writeText(url);status.textContent='Book link copied';}
    catch(_){const input=$('[data-shelf-share-url]');input.value=url;input.hidden=false;input.focus();input.select();status.textContent='Select and copy this link';}
  });
  function controls(){
    const samples=stories[previewBook.id].samples;
    previous.disabled=!ready||desired===0;next.disabled=!ready||desired===samples.length-1;
    [...tabs.children].forEach((button,index)=>{button.disabled=!ready;button.setAttribute('aria-pressed',String(index===desired));});
  }
  function sample(index){
    spread=index;
    const samples=stories[previewBook.id].samples,item=samples[index];
    left.src=right.src=asset(item);right.alt=previewBook.title+' — '+item[1]+', illustrated sample spread';
    $('[data-preview-caption]').textContent=item[1];
    $('[data-preview-count]').textContent='Sample '+(index+1)+' of '+samples.length;
    controls();writeURL();
  }
  function cancelTurn(){++turnVersion;clearTimeout(swapTimer);leaf.hidden=true;animation?.cancel();animation=null;}
  async function turn(index){
    if(!ready||!dialog.open)return;
    const samples=stories[previewBook.id].samples;
    const target=Math.max(0,Math.min(samples.length-1,index));
    desired=target;cancelTurn();const token=turnVersion;controls();
    if(target===spread)return;
    try{await decode(asset(samples[target]));}catch(_){
      if(token===turnVersion&&dialog.open){desired=spread;controls();loading.hidden=false;loading.textContent='This page could not load. Choose it again to retry.';}
      return;
    }
    if(token!==turnVersion||!dialog.open)return;
    loading.hidden=true;window.DVBookOpening.finish(root);
    if(motion.matches){sample(target);return;}
    const backwards=target<spread;leaf.classList.toggle('is-backwards',backwards);
    leaf.querySelector('.shelf-turn-front img').src=asset(samples[spread]);
    leaf.querySelector('.shelf-turn-back img').src=asset(samples[target]);
    leaf.hidden=false;
    animation=leaf.animate([
      {transform:'translateZ(5px) rotateY(0deg)',filter:'brightness(1)'},
      {transform:'translateZ(18px) rotateY('+(backwards?88:-88)+'deg)',filter:'brightness(.85)',offset:.5},
      {transform:'translateZ(5px) rotateY('+(backwards?179:-179)+'deg)',filter:'brightness(1)'}
    ],{duration:620,easing:'cubic-bezier(.22,.65,.25,1)',fill:'forwards'});
    swapTimer=setTimeout(()=>{if(token===turnVersion&&dialog.open)sample(target);},310);
    animation.onfinish=()=>{
      if(token!==turnVersion)return;
      clearTimeout(swapTimer);sample(target);leaf.hidden=true;animation.cancel();animation=null;
    };
  }
  async function openPreview(initial=0){
    const book=engine.getState().book;if(!book)return;
    cancelTurn();window.DVBookOpening.finish(root);const token=++version;
    previewBook=book;ready=false;spread=desired=Math.max(0,Math.min(stories[book.id].samples.length-1,initial));
    if(!dialog.open){restoreFocus=document.activeElement;dialog.showModal();document.body.classList.add('shelf-preview-open');}
    root.classList.remove('is-open','is-opening');window.DVBookOpening.pose(root,0);root.dataset.openingState='closed';
    root.style.aspectRatio=String(2*(book.coverRatio||.75));root.style.setProperty('--preview-ratio',2*(book.coverRatio||.75));
    $('[data-preview-title]').textContent=book.shortTitle||book.title;
    $('[data-preview-cover]').src=book.cover;
    left.removeAttribute('src');right.removeAttribute('src');right.alt='';
    const amazon=$('[data-preview-amazon]');amazon.href=book.amazon;amazon.setAttribute('aria-label','View '+book.title+' on Amazon (opens in a new tab)');
    $('[data-preview-detail]').href=book.url+'#inside';
    tabs.innerHTML=stories[book.id].samples.map((item,index)=>`<button type="button" aria-label="Show ${escape(item[1])}" aria-pressed="${index===spread}" data-preview-page="${index}">${String(index+1).padStart(2,'0')}</button>`).join('');
    [...tabs.children].forEach((button,index)=>button.addEventListener('click',()=>turn(index)));
    leaf.hidden=true;loading.hidden=false;loading.textContent='Opening your book…';controls();
    $('[data-preview-caption]').textContent=stories[book.id].samples[spread][1];
    $('[data-preview-count]').textContent='Sample '+(spread+1)+' of '+stories[book.id].samples.length;writeURL();
    try{await Promise.all([decode(asset(stories[book.id].samples[spread])),decode(book.cover)]);}catch(_){
      if(token===version&&dialog.open){loading.textContent='The preview could not load. Open the book details to see more.';loading.hidden=false;}
      return;
    }
    if(token!==version||!dialog.open)return;
    sample(spread);ready=true;controls();loading.hidden=true;
    window.DVBookOpening.start(root);
    // Decode neighbors only after the requested spread is ready.
    stories[book.id].samples.forEach(item=>decode(asset(item)).catch(()=>{}));
  }
  $('[data-shelf-link]').addEventListener('click',()=>openPreview());
  $('[data-preview-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{
    ++version;cancelTurn();window.DVBookOpening.finish(root);ready=false;previewBook=null;
    document.body.classList.remove('shelf-preview-open');writeURL();
    if(restoreFocus?.isConnected)restoreFocus.focus({preventScroll:true});
  });
  // Native dialog handles Escape, focus containment and background inertness.
  dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
  previous.addEventListener('click',()=>turn(desired-1));next.addEventListener('click',()=>turn(desired+1));
  dialog.addEventListener('keydown',event=>{
    const keys={ArrowLeft:desired-1,ArrowRight:desired+1,Home:0,End:previewBook?stories[previewBook.id].samples.length-1:0};
    if(Object.hasOwn(keys,event.key)){event.preventDefault();turn(keys[event.key]);}
  });
  let swipe=null;
  const stage=$('[data-preview-stage]');
  stage.addEventListener('pointerdown',event=>{if(event.button===0&&ready)swipe={id:event.pointerId,x:event.clientX,y:event.clientY};});
  stage.addEventListener('pointerup',event=>{
    if(!swipe||event.pointerId!==swipe.id)return;
    const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
    if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2)turn(desired+(dx<0?1:-1));
  });
  stage.addEventListener('pointercancel',()=>swipe=null);
  motion.addEventListener('change',()=>{if(motion.matches&&previewBook&&ready){cancelTurn();sample(desired);}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&previewBook&&ready){cancelTurn();sample(spread);desired=spread;controls();}});
  function restore(){
    const params=new URLSearchParams(location.hash.slice(1)),id=params.get('book');
    let prefs={topic:params.get('topic'),age:params.get('age'),gift:params.get('gift')};
    if(!location.hash){try{prefs=JSON.parse(sessionStorage.getItem('dv-shelf-preferences'))||{};}catch(_){}}
    const gift=Object.hasOwn(giftFilters,prefs.gift)?prefs.gift:'';
    syncing=true;
    engine.filter({...prefs,gift});
    const index=books.findIndex(book=>book.id===id);
    if(index>=0){if(!engine.getState().visible.includes(index))engine.filter();engine.select(index);}
    if(params.get('view')==='inside'&&engine.getState().book)openPreview((parseInt(params.get('spread'),10)||1)-1);
    else if(dialog.open)dialog.close();
    syncing=false;reflect();
  }
  window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
  restore();
})();
