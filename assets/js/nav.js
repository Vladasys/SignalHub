(function(){
  // Active link
  const nav = document.querySelector('nav');
  if (nav) {
    const links = [...nav.querySelectorAll('a')];
    const cur = location.pathname.replace(/index\.html$/,'');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === cur || (href !== '/' && cur.startsWith(href))) a.classList.add('active');
    });
  }

  // Burger toggle
  const btn = document.getElementById('navToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Reading progress (only on pages with <main>)
  const bar = document.getElementById('readProgress');
  const main = document.querySelector('main');
  if (bar && main) {
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? (scrollTop / docH) * 100 : 0;
      bar.style.width = p + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

