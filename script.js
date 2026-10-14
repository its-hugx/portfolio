'use strict';
const t=window.portfolioI18n.t;

// Two identical groups form a seamless loop. Each group always exceeds the
// visible strip width, including after the font loads or the viewport changes.
document.querySelectorAll('[data-ticker-text]').forEach(track=>{
  const strip=track.parentElement;
  const unit=track.dataset.tickerText+' \u00a0';
  let resizeFrame=0;
  function fitTicker(){
    const group=document.createElement('span');
    group.textContent=unit;
    track.replaceChildren(group);
    const unitWidth=group.getBoundingClientRect().width;
    if(!unitWidth)return;
    const copies=Math.ceil(strip.getBoundingClientRect().width/unitWidth)+1;
    group.textContent=unit.repeat(Math.max(2,copies));
    track.append(group.cloneNode(true));
    const distance=group.getBoundingClientRect().width;
    track.style.setProperty('--ticker-duration',`${distance/60}s`);
  }
  function scheduleFit(){
    cancelAnimationFrame(resizeFrame);
    resizeFrame=requestAnimationFrame(fitTicker);
  }
  fitTicker();
  document.fonts?.ready.then(scheduleFit);
  if('ResizeObserver' in window)new ResizeObserver(scheduleFit).observe(strip);
  else window.addEventListener('resize',scheduleFit,{passive:true});
});

const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('#compact-menu');
function closeMenu(){menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',t('Open menu'));}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menu.hidden=open;menuButton.setAttribute('aria-expanded',String(!open));menuButton.setAttribute('aria-label',t(open?'Open menu':'Close menu'));});
document.addEventListener('click',e=>{if(!menu.hidden&&!menu.contains(e.target)&&!menuButton.contains(e.target))closeMenu();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuButton.focus();}});

if(document.querySelector('#category-dialog')){
const categories={
  social:{number:'01',name:'SOCIAL MEDIA',kicker:'IDEAS THAT CONNECT',color:'#bbbbbb',description:'Content that belongs in the conversation. Concepts, images and words designed to connect brands with people.',tags:['Creative strategy','Campaigns','Digital content'],formats:['Social media campaigns','Key visuals','Carousels & stories','Copy & concept']},
  design:{number:'02',name:'GRAPHIC DESIGN',kicker:'IDENTITY IN EVERY PIXEL',color:'#e2e2e2',description:'An idea comes to life through its visual identity. Art direction and graphic design that build a distinctive, cohesive visual world with purpose.',tags:['Art direction','Graphic design','Visual identity'],formats:['Identity & branding','Advertising design','Composition & retouching','Editorial design']},
  motion:{number:'03',name:'MOTION & VIDEO',kicker:'IDEAS IN MOTION',color:'#d0d0d0',description:'Rhythm tells a story too. Images, sound and movement that turn a concept into an experience you can feel.',tags:['Motion graphics','Editing','Visual storytelling'],formats:['Graphic animation','Campaign videos','Reels & vertical content','Editing & production']}
};
const dialog=document.querySelector('#category-dialog');
let currentCategory='social';
let categoryTrigger=null;
function renderCategory(key){
  const data=categories[key];if(!data)return;currentCategory=key;
  dialog.style.setProperty('--accent',data.color);
  document.querySelector('#dialog-number').textContent=`[${data.number} / 03]`;
  document.querySelector('#dialog-kicker').textContent=t(data.kicker);
  document.querySelector('#dialog-title').textContent=t(data.name);
  document.querySelector('#dialog-description').textContent=t(data.description);
  const tags=document.querySelector('#dialog-tags');tags.replaceChildren(...data.tags.map(text=>{const span=document.createElement('span');span.textContent=t(text);return span;}));
  const formats=document.querySelector('#dialog-formats');formats.replaceChildren(...data.formats.map((text,i)=>{const li=document.createElement('li');li.append(document.createTextNode(t(text)));const span=document.createElement('span');span.textContent=`0${i+1}`;li.append(span);return li;}));
}
function openCategory(key,trigger){closeMenu();categoryTrigger=trigger;renderCategory(key);dialog.showModal();document.dispatchEvent(new CustomEvent('portfolio:dialog-open',{detail:dialog}));document.body.classList.add('dialog-open');document.querySelector('.dialog-close').focus();}
function closeCategory(){dialog.close();}
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>openCategory(button.dataset.category,button)));
document.querySelector('.dialog-close').addEventListener('click',closeCategory);
document.querySelector('.dialog-back').addEventListener('click',closeCategory);
document.querySelector('.dialog-next').addEventListener('click',()=>{const keys=Object.keys(categories);renderCategory(keys[(keys.indexOf(currentCategory)+1)%keys.length]);dialog.scrollTop=0;document.querySelector('.dialog-close').focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeCategory();}});
dialog.addEventListener('close',()=>{document.dispatchEvent(new CustomEvent('portfolio:dialog-close'));document.body.classList.remove('dialog-open');if(categoryTrigger)categoryTrigger.focus({preventScroll:true});});

}

const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function applyMotion(){
  const paused=reducedMotion.matches;
  document.documentElement.classList.toggle('motion-paused',paused);
  document.dispatchEvent(new CustomEvent('portfolio:motion-change',{detail:{paused}}));
}
reducedMotion.addEventListener('change',applyMotion);applyMotion();
