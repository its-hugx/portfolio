'use strict';
(() => {
  const video=document.querySelector('.hero-video');
  if(!video)return;
  const media=video.closest('.hero-media');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let pageActive=true;
  let starting=false;
  let request=0;
  let recoveryFrame=0;

  video.loop=true;
  video.muted=true;
  video.defaultMuted=true;
  video.playsInline=true;
  video.autoplay=true;

  // The still stays underneath the movie during loading or an autoplay failure.
  // Reduced-motion visitors see it without downloading the video at all.
  function canPlay(){
    return pageActive&&!document.hidden&&!reducedMotion.matches&&
      !document.documentElement.classList.contains('motion-paused');
  }
  function schedulePlayback(){
    if(!canPlay()||recoveryFrame)return;
    recoveryFrame=requestAnimationFrame(()=>{
      recoveryFrame=0;
      syncPlayback();
    });
  }
  async function syncPlayback(){
    if(!canPlay()){
      request++;
      starting=false;
      video.pause();
      return;
    }
    if(starting||!video.paused)return;
    if(!video.hasAttribute('src')){
      video.src=video.dataset.src;
    }
    starting=true;
    const current=++request;
    try{
      await video.play();
    }catch(error){
      // A visibility change can interrupt a pending play. Autoplay denials
      // wait for a gesture instead of creating an endless retry loop.
      if(current===request&&error.name==='AbortError')schedulePlayback();
    }finally{
      if(current===request){
        starting=false;
        if(!canPlay())video.pause();
      }
    }
  }
  video.addEventListener('playing',()=>{
    if(canPlay())media.classList.add('is-ready');
    else video.pause();
  });
  video.addEventListener('error',()=>media.classList.remove('is-ready'));
  video.addEventListener('canplay',syncPlayback);
  video.addEventListener('pause',schedulePlayback);
  // Native looping is primary; this recovers an unexpected end-of-file stop.
  video.addEventListener('ended',()=>{
    if(!canPlay())return;
    video.currentTime=0;
    syncPlayback();
  });
  document.addEventListener('portfolio:motion-change',syncPlayback);
  document.addEventListener('visibilitychange',syncPlayback);
  document.addEventListener('pointerdown',syncPlayback,{passive:true});
  document.addEventListener('keydown',syncPlayback);
  reducedMotion.addEventListener('change',syncPlayback);
  window.addEventListener('pagehide',()=>{pageActive=false;syncPlayback();});
  window.addEventListener('pageshow',()=>{pageActive=true;syncPlayback();});
  syncPlayback();
})();
