'use strict';
(()=>{
  const t=window.portfolioI18n.t;
  const finePointer=matchMedia('(pointer:fine) and (hover:hover)');
  const reduceMotion=matchMedia('(prefers-reduced-motion:reduce)');
  const cross=document.createElement('div');cross.className='portfolio-cursor';cross.setAttribute('aria-hidden','true');
  const follower=document.createElement('div');follower.className='portfolio-follower';follower.setAttribute('aria-hidden','true');
  document.body.append(follower,cross);
  let x=0,y=0,fx=0,fy=0,visible=false,frame=0;
  const preview=document.querySelector('.work-hover-preview');
  let activeRow=null;
  const enabled=()=>finePointer.matches;
  function hideCursor(){visible=false;document.documentElement.classList.remove('cursor-visible','custom-pointer');if(frame)cancelAnimationFrame(frame);frame=0;hidePreview();}
  function tick(){if(!visible)return;const immediate=reduceMotion.matches||document.documentElement.classList.contains('motion-paused');fx=immediate?x:fx+(x-fx)*.1;fy=immediate?y:fy+(y-fy)*.1;cross.style.transform=`translate3d(${x-10}px,${y-10}px,0)`;follower.style.transform=`translate3d(${fx}px,${fy}px,0) translate(-50%,-50%)`;frame=requestAnimationFrame(tick);}
  function hidePreview(){activeRow=null;preview?.classList.remove('visible');}
  function updatePreview(event){
    if(!preview||reduceMotion.matches||innerWidth<=760)return;
    const row=event.target.closest('.work-row');
    if(!row){hidePreview();return;}
    if(activeRow!==row){activeRow=row;const img=preview.querySelector('img');img.src=row.dataset.preview;img.alt=row.dataset.previewAlt||'';preview.classList.add('visible');}
    const rect=preview.getBoundingClientRect();const left=Math.max(15,Math.min(innerWidth-rect.width-20,x+32));const top=Math.max(15,Math.min(innerHeight-rect.height-20,y-rect.height/2));
    preview.style.transform=`translate3d(${left}px,${top}px,0) rotate(-4deg)`;
  }
  document.addEventListener('pointermove',event=>{
    if(!enabled()||event.pointerType==='touch')return;
    if(event.target.closest('video,input,textarea')){hideCursor();return;}
    x=event.clientX;y=event.clientY;
    if(!visible){fx=x;fy=y;visible=true;document.documentElement.classList.add('cursor-visible','custom-pointer');tick();}
    const hovered=Boolean(event.target.closest('a,button,summary,img,[role="button"]'));
    follower.classList.toggle('over-link',hovered);if(hovered)follower.classList.add('has-interacted');
    updatePreview(event);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',hideCursor);
  window.addEventListener('blur',hideCursor);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)hideCursor();});
  window.addEventListener('scroll',hidePreview,{passive:true});
  window.addEventListener('resize',hidePreview,{passive:true});
  document.addEventListener('keydown',event=>{if(event.key==='Tab')hideCursor();});
  finePointer.addEventListener('change',hideCursor);
  document.addEventListener('portfolio:dialog-open',event=>{event.detail.append(follower,cross);hidePreview();});
  document.addEventListener('portfolio:dialog-close',()=>document.body.append(follower,cross));

  const lightbox=document.querySelector('#art-lightbox');
  if(!lightbox)return;
  const allLinks=[...document.querySelectorAll('[data-lightbox]')];
  if(!allLinks.length)return;
  let links=allLinks;
  const image=document.querySelector('#lightbox-image');
  const picture=lightbox.querySelector('.lightbox-picture');
  const title=document.querySelector('#lightbox-title');
  const counter=document.querySelector('#lightbox-counter');
  const close=lightbox.querySelector('.lightbox-close');
  const fullscreen=lightbox.querySelector('.lightbox-fullscreen');
  let index=0,opener=null,touchX=null;
  function render(){const link=links[index];image.src=link.href;image.alt=link.dataset.alt;picture.className=`lightbox-picture crop-${link.dataset.crop||'full'}`;title.textContent=link.dataset.caption;counter.textContent=`${String(index+1).padStart(2,'0')} / ${String(links.length).padStart(2,'0')}`;}
  function change(delta){index=(index+delta+links.length)%links.length;render();}
  allLinks.forEach(link=>link.addEventListener('click',event=>{event.preventDefault();opener=link;links=allLinks.filter(item=>item.dataset.gallery===link.dataset.gallery);index=links.indexOf(link);const single=links.length===1;lightbox.querySelector('.lightbox-stage').classList.toggle('no-navigation',single);lightbox.querySelector('.lightbox-prev').disabled=single;lightbox.querySelector('.lightbox-next').disabled=single;lightbox.querySelector('.lightbox-caption>span').textContent=t(single?'ESC CLOSE':'← → BROWSE · ESC CLOSE');render();lightbox.showModal();document.body.classList.add('dialog-open');document.dispatchEvent(new CustomEvent('portfolio:dialog-open',{detail:lightbox}));close.focus();}));
  close.addEventListener('click',()=>lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click',()=>change(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click',()=>change(1));
  lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();change(-1);}if(event.key==='ArrowRight'){event.preventDefault();change(1);}});
  lightbox.addEventListener('close',()=>{document.body.classList.remove('dialog-open');document.dispatchEvent(new CustomEvent('portfolio:dialog-close'));if(document.fullscreenElement===lightbox)document.exitFullscreen().catch(()=>{});opener?.focus({preventScroll:true});});
  picture.addEventListener('pointerdown',event=>{if(event.pointerType==='touch')touchX=event.clientX;});
  picture.addEventListener('pointerup',event=>{if(touchX===null)return;const delta=event.clientX-touchX;touchX=null;if(Math.abs(delta)>50)change(delta>0?-1:1);});
  picture.addEventListener('pointercancel',()=>{touchX=null;});
  if(!document.fullscreenEnabled||!lightbox.requestFullscreen)fullscreen.hidden=true;
  else fullscreen.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await lightbox.requestFullscreen();}catch{fullscreen.hidden=true;}});
  document.addEventListener('fullscreenchange',()=>{const full=document.fullscreenElement===lightbox;fullscreen.setAttribute('aria-label',t(full?'Exit fullscreen':'Enter fullscreen'));});
})();
