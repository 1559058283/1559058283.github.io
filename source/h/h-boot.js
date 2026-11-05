/* 首页启动：代码页签、主题、滚动显现、封面数字、色系、导航跟随、访问量镜像。 */
initTabs({ keys: ['about', 'skills', 'timeline', 'contact'], mount: '#panes', defaultKey: 'about' });
initTheme();
initReveal();

const nav = document.getElementById('top');
const cover = document.getElementById('cover');
if (nav && cover) {
  new IntersectionObserver(([en]) => {
    nav.classList.toggle('solid', !en.isIntersecting);
  }, { threshold: .35 }).observe(cover);
}

const fmt = n => n.toLocaleString('en-US');
function countUp(el) {
  const to = +el.dataset.to;
  if (!Number.isFinite(to)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmt(to); return; }
  const dur = 1100, t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
document.querySelectorAll('.cv-stats b[data-to]').forEach((el, i) => {
  setTimeout(() => countUp(el), 650 + i * 110);
});

const picks = document.querySelectorAll('.pal-pick button');
picks.forEach(b => b.addEventListener('click', () => {
  document.documentElement.setAttribute('data-pal', b.dataset.p);
  picks.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
}));

const aur = document.querySelector('.aurora-page');
const reduceM = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (aur && !reduceM && matchMedia('(hover:hover)').matches) {
  let raf = 0;
  window.addEventListener('pointermove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      aur.style.setProperty('--mx', (e.clientX / innerWidth * 100).toFixed(1) + '%');
      aur.style.setProperty('--my', (e.clientY / innerHeight * 100).toFixed(1) + '%');
      raf = 0;
    });
  }, { passive: true });
}

if (nav) {
  const navLinks = [...nav.querySelectorAll('nav a[data-sec]')];
  const sections = navLinks.map(a => ({
    el: document.getElementById(a.dataset.sec),
    a
  })).filter(s => s.el);
  const spy = new IntersectionObserver(es => {
    const visible = es.filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (!visible.length) return;
    const hit = sections.find(s => s.el === visible[0].target);
    if (!hit) return;
    navLinks.forEach(a => {
      const on = a === hit.a;
      a.classList.toggle('here', on);
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }, { threshold: [.25, .45, .6] });
  sections.forEach(s => spy.observe(s.el));
}

function watchStat(id) {
  const src = document.getElementById(id);
  if (!src) return;
  let busy = false;
  const apply = () => {
    if (busy) return;
    const raw = src.textContent.trim();
    if (!raw || raw === '–' || raw === '-' || raw === '…') return;
    const n = Number(raw.replace(/,/g, ''));
    const text = Number.isFinite(n) ? n.toLocaleString('en-US') : raw;
    busy = true;
    if (src.textContent !== text) src.textContent = text;
    document.querySelectorAll(`[data-mirror="${id}"]`).forEach(el => {
      if (el.textContent !== text) el.textContent = text;
    });
    busy = false;
  };
  new MutationObserver(apply).observe(src, { childList: true, characterData: true, subtree: true });
  apply();
  setTimeout(apply, 1200);
  setTimeout(apply, 3200);
}
watchStat('busuanzi_value_site_pv');
watchStat('busuanzi_value_site_uv');
