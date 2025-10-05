(() => {
  const doc = document;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotionChange = (handler) => {
    if (typeof prefersReduced.addEventListener === 'function') {
      prefersReduced.addEventListener('change', handler);
    } else if (typeof prefersReduced.addListener === 'function') {
      prefersReduced.addListener(handler);
    }
  };

  // Reveal on scroll
  const revealTargets = doc.querySelectorAll('.reveal,[data-section]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  // Navigation active state
  const nav = doc.querySelector('.sh-topbar nav');
  if (nav) {
    const curPath = window.location.pathname.replace(/index\.html$/, '') || '/';
    nav.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === curPath || (href !== '/' && curPath.startsWith(href))) {
        link.classList.add('is-active');
      }
    });
  }

  // Navigation toggle
  const toggle = doc.getElementById('navToggle');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = doc.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        doc.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Specialist notice for first-time visitors
  const notice = doc.getElementById('specialistNotice');
  const noticeClose = doc.getElementById('specialistNoticeClose');
  const noticeKey = 'sh-specialist-notice';
  const getStore = () => {
    const stores = [window.localStorage, window.sessionStorage];
    for (const store of stores) {
      if (!store) continue;
      try {
        const testKey = '__shNoticeTest__';
        store.setItem(testKey, '1');
        store.removeItem(testKey);
        return store;
      } catch (error) {
        continue;
      }
    }
    return null;
  };
  const store = getStore();
  const hasSeenNotice = store ? store.getItem(noticeKey) === '1' : false;
  if (notice && noticeClose && !hasSeenNotice) {
    notice.hidden = false;
    notice.classList.add('is-active');
    noticeClose.addEventListener('click', () => {
      notice.classList.remove('is-active');
      notice.setAttribute('hidden', '');
      if (store) {
        try {
          store.setItem(noticeKey, '1');
        } catch (error) {
          /* noop */
        }
      }
    });
  }

  // Reading progress
  const progress = doc.getElementById('readProgress');
  const main = doc.getElementById('main-content');
  const updateProgress = () => {
    if (!progress || !main) return;
    const scrollTop = window.scrollY || doc.documentElement.scrollTop;
    const docHeight = doc.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    progress.style.width = `${percent}%`;
  };
  if (progress) {
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  // Hero parallax
  const hero = doc.querySelector('.sh-hero');
  let ticking = false;
  const setHeroOffset = () => {
    if (!hero || prefersReduced.matches) return;
    const y = Math.min(80, window.scrollY * 0.08);
    hero.style.setProperty('--hero-y', `${y}px`);
    ticking = false;
  };
  if (hero && !prefersReduced.matches) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(setHeroOffset);
        ticking = true;
      }
    }, { passive: true });
    setHeroOffset();
  } else if (hero) {
    hero.style.setProperty('--hero-y', '0px');
  }
  onMotionChange(() => {
    if (!hero) return;
    if (prefersReduced.matches) {
      hero.style.setProperty('--hero-y', '0px');
    } else {
      setHeroOffset();
    }
  });

  // Micro tilt for cards
  if (!prefersReduced.matches) {
    const cards = doc.querySelectorAll('.card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Mini calculator
  const budget = doc.getElementById('mcBudget');
  const cost = doc.getElementById('mcCpl');
  const conv = doc.getElementById('mcConv');
  const avg = doc.getElementById('mcAov');
  const leadsOut = doc.getElementById('mcLeads');
  const dealsOut = doc.getElementById('mcDeals');
  const revenueOut = doc.getElementById('mcRev');
  const budgetVal = doc.getElementById('mcBudgetVal');
  const costVal = doc.getElementById('mcCplVal');
  const convVal = doc.getElementById('mcConvVal');
  const avgVal = doc.getElementById('mcAovVal');
  const formatNumber = (value) => Number(value).toLocaleString('ru-RU');
  const updateCalc = () => {
    if (!budget || !cost || !conv || !avg) return;
    const leads = Math.round(budget.value / cost.value);
    const deals = Math.round(leads * (conv.value / 100));
    const revenue = Math.round(deals * avg.value);
    if (leadsOut) leadsOut.textContent = formatNumber(leads);
    if (dealsOut) dealsOut.textContent = formatNumber(deals);
    if (revenueOut) revenueOut.textContent = formatNumber(revenue);
    if (budgetVal) budgetVal.textContent = `${formatNumber(budget.value)} €`;
    if (costVal) costVal.textContent = `${formatNumber(cost.value)} €`;
    if (convVal) convVal.textContent = `${conv.value} %`;
    if (avgVal) avgVal.textContent = `${formatNumber(avg.value)} €`;
  };
  if (budget && cost && conv && avg) {
    [budget, cost, conv, avg].forEach((input) => input.addEventListener('input', updateCalc));
    updateCalc();
  }

  // Story highlight
  const strip = doc.querySelector('.story-strip');
  if (strip && 'IntersectionObserver' in window) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
        } else {
          entry.target.classList.remove('is-in');
        }
      });
    }, { root: strip, threshold: 0.6 });
    strip.querySelectorAll('.story-step').forEach((step) => stepObserver.observe(step));
  }

  // Sticky CTA visibility
  const stickyCta = doc.querySelector('.sticky-cta');
  const ctaSection = doc.querySelector('.sh-cta');
  if (stickyCta && ctaSection && 'IntersectionObserver' in window) {
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        stickyCta.classList.toggle('is-hidden', entry.isIntersecting);
      });
    }, { threshold: 0.3 });
    ctaObserver.observe(ctaSection);
    const footer = doc.querySelector('.sh-footer');
    if (footer) ctaObserver.observe(footer);
  }

  // Hero canvas animation
  const canvas = doc.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const state = { width: canvas.clientWidth, height: canvas.clientHeight, time: 0 };

    const resizeCanvas = () => {
      state.width = canvas.clientWidth;
      state.height = canvas.clientHeight;
      canvas.width = state.width * dpr;
      canvas.height = state.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const bars = Array.from({ length: 28 }, (_, idx) => ({
      x: idx,
      seed: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, state.width, state.height);
      const gradient = ctx.createLinearGradient(0, 0, state.width, state.height);
      gradient.addColorStop(0, 'rgba(110,139,255,0.28)');
      gradient.addColorStop(1, 'rgba(17,22,31,0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, state.width, state.height);

      ctx.strokeStyle = 'rgba(230,233,239,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 4; i += 1) {
        const y = (state.height / 4) * i + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(state.width, y);
      }
      ctx.stroke();

      const path = [];
      bars.forEach((bar, index) => {
        const wave = Math.sin(bar.seed + state.time * 0.0025 + index * 0.25);
        const value = (wave + 1) / 2; // 0..1
        const eased = Math.pow(value, 1.2);
        const x = (state.width / (bars.length - 1)) * index;
        const y = state.height - eased * (state.height * 0.8) - state.height * 0.1;
        path.push({ x, y });
      });

      ctx.lineWidth = 2.4;
      ctx.strokeStyle = 'rgba(75,213,195,0.85)';
      ctx.beginPath();
      path.forEach((point, idx) => {
        if (idx === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      ctx.fillStyle = 'rgba(110,139,255,0.22)';
      path.forEach((point, idx) => {
        if (idx % 6 === 0) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    let rafId;
    const render = (time) => {
      state.time = time;
      draw();
      if (!prefersReduced.matches) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    const start = () => {
      window.cancelAnimationFrame(rafId);
      resizeCanvas();
      draw();
      if (!prefersReduced.matches) {
        rafId = window.requestAnimationFrame(render);
      }
    };

    start();
    window.addEventListener('resize', start);
    onMotionChange(start);
  }
})();
