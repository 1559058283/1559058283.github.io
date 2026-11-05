/* =====================================================================
   闪卡交互
   · 鼠标在卡上移动 → 虹彩角度 / 高光 / 微倾斜
   · 点「看代码」按钮翻面（卡片本体也可点翻）
   · 正面为整张 card-front.webp（jpg 回落）
   ===================================================================== */
(() => {
  const flip = document.getElementById('flip');
  const card = document.getElementById('pokeCard');
  if (!flip || !card) return;

  const holo  = card.querySelector('.holo');
  const gloss = card.querySelector('.gloss');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover:hover)').matches;
  const btn = document.getElementById('flipBtn');

  /* 虹彩 + 高光 + 3D 倾斜 */
  if (canHover && !reduce) {
    let raf = 0;
    card.addEventListener('pointermove', e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ang = (60 + px * 120).toFixed(0) + 'deg';
        if (holo) holo.style.setProperty('--ang', ang);
        [holo, gloss].forEach(el => {
          if (!el) return;
          el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        if (!flip.classList.contains('back')) {
          const rx = (.5 - py) * 14, ry = (px - .5) * 14;
          card.style.transform =
            `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        }
        raf = 0;
      });
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      if (holo) holo.style.setProperty('--ang', '108deg');
    });
  }

  /* 翻面：按钮优先，stopPropagation 避免与卡面 click 打架 */
  const toggle = () => {
    flip.classList.toggle('back');
    card.style.transform = '';
    card.classList.remove('nudge');
    const back = flip.classList.contains('back');
    if (btn) {
      btn.innerHTML = back
        ? '<span class="ic" aria-hidden="true">⟲</span>看卡片'
        : '<span class="ic" aria-hidden="true">⟲</span>看代码';
      btn.setAttribute('aria-label', back ? '翻回卡片' : '翻到代码');
    }
  };
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });
  }
  card.addEventListener('click', e => {
    // 若点击落在按钮上（极端层级穿透），交给按钮处理
    if (btn && (e.target === btn || btn.contains(e.target))) return;
    toggle();
  });
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', '鼠鼠 LS 收藏卡，按回车翻到代码');
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });

  if (!reduce) {
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { card.classList.add('nudge'); io.disconnect(); }
    }, { threshold: .5 });
    io.observe(card);
  }
})();
