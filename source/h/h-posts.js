/* 文章墙筛选。卡片由 Hexo 渲染，这里只做分类显隐。 */
(() => {
  const wall = document.getElementById('wall');
  if (!wall) return;
  const btns = document.querySelectorAll('.cats button');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  btns.forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.c;
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    wall.querySelectorAll('.pcard').forEach(card => {
      const ids = (card.dataset.c || '').split('|').filter(Boolean);
      const show = k === 'all' || ids.includes(k);
      if (show) {
        card.style.display = '';
        requestAnimationFrame(() => card.classList.remove('hide'));
      } else if (reduce) {
        card.style.display = 'none';
      } else {
        card.classList.add('hide');
        setTimeout(() => {
          if (card.classList.contains('hide')) card.style.display = 'none';
        }, 320);
      }
    });
  }));
})();
