/* 错落渐显、阅读进度、磁吸按钮。首页和文章页共用。不含鼠标光斑。 */
(function () {
  if (window.__hExtras) return;
  window.__hExtras = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover:hover)').matches;

  function initStagger() {
    const nodes = [...document.querySelectorAll('.rv-stagger')];
    if (!nodes.length) return;
    if (reduce) {
      nodes.forEach(n => n.classList.add('in'));
      return;
    }
    const groups = new Map();
    nodes.forEach(n => {
      const p = n.closest('[data-stagger-group]') || n.parentElement;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(n);
    });
    groups.forEach(list => {
      list.forEach((el, i) => {
        if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (i * 90) + 'ms');
      });
    });
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '-40px 0px -8% 0px', threshold: 0.08 });
    nodes.forEach(n => io.observe(n));
  }

  function initProgress() {
    let bar = document.getElementById('artProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'artProgress';
      bar.className = 'art-progress';
      bar.setAttribute('aria-hidden', 'true');
      const fill = document.createElement('i');
      bar.appendChild(fill);
      document.body.prepend(bar);
    }
    const fill = bar.querySelector('i');
    if (!fill) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? (doc.scrollTop || window.scrollY) / max : 0;
      fill.style.width = (Math.min(1, Math.max(0, p)) * 100).toFixed(2) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMagnetic() {
    if (!canHover || reduce) return;
    document.querySelectorAll('.mag-btn').forEach(btn => {
      if (btn.dataset.mag) return;
      btn.dataset.mag = '1';
      let inner = btn.querySelector(':scope > .mag-inner');
      if (!inner) {
        inner = document.createElement('span');
        inner.className = 'mag-inner';
        while (btn.firstChild) inner.appendChild(btn.firstChild);
        btn.appendChild(inner);
      }
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
        inner.style.transform = `translate(${dx * 0.12}px, ${dy * 0.12}px)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
        inner.style.transform = '';
      });
    });
  }

  function boot() {
    initStagger();
    initProgress();
    initMagnetic();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
