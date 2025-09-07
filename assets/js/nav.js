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
    if (nav) nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      btn.setAttribute('aria-expanded','false');
    }));
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

  // Mini calculator
  const b = document.getElementById('mcBudget');
  const c = document.getElementById('mcCpl');
  const v = document.getElementById('mcConv');
  const a = document.getElementById('mcAov');
  const lOut = document.getElementById('mcLeads');
  const dOut = document.getElementById('mcDeals');
  const rOut = document.getElementById('mcRev');
  const bVal = document.getElementById('mcBudgetVal');
  const cVal = document.getElementById('mcCplVal');
  const vVal = document.getElementById('mcConvVal');
  const aVal = document.getElementById('mcAovVal');
  if (b && c && v && a) {
    const calc = () => {
      const leads = Math.round(b.value / c.value);
      const deals = Math.round(leads * (v.value/100));
      const rev = Math.round(deals * a.value);
      lOut.textContent = leads.toLocaleString('ru-RU');
      dOut.textContent = deals.toLocaleString('ru-RU');
      rOut.textContent = rev.toLocaleString('ru-RU');
      if (bVal) bVal.textContent = Number(b.value).toLocaleString('ru-RU') + ' €';
      if (cVal) cVal.textContent = Number(c.value).toLocaleString('ru-RU') + ' €';
      if (vVal) vVal.textContent = v.value + ' %';
      if (aVal) aVal.textContent = Number(a.value).toLocaleString('ru-RU') + ' €';
    };
    [b,c,v,a].forEach(el => el.addEventListener('input', calc));
    calc();
  }

  // Scroll story
  const strip = document.querySelector('.story-strip');
  if (strip) {
    const steps = strip.querySelectorAll('.story-step');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('active');
        else e.target.classList.remove('active');
      });
    }, { root: strip, threshold: 0.6 });
    steps.forEach(s => io.observe(s));
  }
})();

