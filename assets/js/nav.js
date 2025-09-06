(function(){
  const nav = document.querySelector('nav'); if(!nav) return;
  const links = [...nav.querySelectorAll('a')];
  const cur = location.pathname.replace(/index\.html$/,'');
  links.forEach(a=>{ const href=a.getAttribute('href'); if(href===cur || (href!=='/' && cur.startsWith(href))) a.classList.add('active'); });
})();