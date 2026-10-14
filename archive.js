'use strict';
// Keep the selected personal archive category when returning from an individual post.
(()=>{
 const back=document.querySelector('[data-archive-return]');
 if(!back)return;
 const from=new URLSearchParams(location.search).get('from');
 const valid=['all','music-artworks','characters-designs','poster-designs','experimental-designs'];
 if(!valid.includes(from))return;
 back.href=window.portfolioI18n.localizedPath(from==='all'?'/work/personal/':`/work/personal/${from}/`);
})();
