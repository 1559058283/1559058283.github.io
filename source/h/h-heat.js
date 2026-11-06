/* 写作活跃热力图。数据来自构建时注入的 window.H_HEAT（Hexo 文章日期）。 */
(function () {
  const POSTS = Array.isArray(window.H_HEAT) ? window.H_HEAT : [];
  const byDay = Object.create(null);
  POSTS.forEach(p => {
    if (!p || !p.d) return;
    if (!byDay[p.d]) byDay[p.d] = [];
    byDay[p.d].push(p.t || '未命名');
  });

  function parseYMD(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function fmtYMD(dt) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  function monIndex(dt) {
    return (dt.getDay() + 6) % 7;
  }
  function level(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    return 4;
  }
  function tipText(ymd, titles) {
    const n = titles.length;
    if (!n) return `${ymd} · 无发帖`;
    if (n === 1) return `${ymd} · 1 篇：${titles[0]}`;
    return `${ymd} · ${n} 篇：${titles.join('；')}`;
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function render() {
    const root = document.getElementById('heat');
    const meta = document.getElementById('heatMeta');
    if (!root) return;

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7);
    start.setDate(start.getDate() - monIndex(start));

    const weeks = [];
    const cursor = new Date(start);
    while (weeks.length < 53) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const monthLabels = weeks.map((w, wi) => {
      const mon = w[0];
      if (wi === 0) return mon.getMonth();
      return mon.getMonth() !== weeks[wi - 1][0].getMonth() ? mon.getMonth() : -1;
    });

    const yearAgo = new Date(end);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const recent = POSTS.filter(p => parseYMD(p.d) >= yearAgo && parseYMD(p.d) <= end).length;
    if (meta) meta.innerHTML = `过去 12 个月 · <b>${recent}</b> 篇`;

    const monthsRow = monthLabels.map(m =>
      m < 0 ? '<span aria-hidden="true"></span>' : `<span>${MONTHS[m]}</span>`
    ).join('');
    const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
    const labelCol = dayLabels.map((lb, i) =>
      (i === 0 || i === 2 || i === 4) ? `<span>${lb}</span>` : '<span class="hid" aria-hidden="true"></span>'
    ).join('');

    const cells = weeks.map(week => {
      const col = week.map(dt => {
        const ymd = fmtYMD(dt);
        const titles = byDay[ymd] || [];
        const n = titles.length;
        const future = dt > end;
        const lv = future ? 0 : level(n);
        const tip = esc(tipText(ymd, titles));
        const cls = ['heat-cell', future ? 'fut' : '', n ? 'has' : ''].filter(Boolean).join(' ');
        return `<button type="button" class="${cls}" data-d="${ymd}" data-lv="${lv}" data-tip="${tip}" aria-label="${tip}"></button>`;
      }).join('');
      return `<div class="heat-week">${col}</div>`;
    }).join('');

    root.innerHTML = `
      <div class="heat-wrap">
        <div class="heat-ylabels" aria-hidden="true">${labelCol}</div>
        <div class="heat-body">
          <div class="heat-months">${monthsRow}</div>
          <div class="heat-grid" role="img" aria-label="写作活跃热力图">${cells}</div>
        </div>
      </div>
      <div class="heat-foot">
        <div class="heat-legend" aria-hidden="true">
          <span>少</span>
          <i></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i>
          <span>多</span>
        </div>
      </div>`;

    let tip = document.getElementById('heatTip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'heatTip';
      tip.className = 'heat-tip';
      tip.setAttribute('role', 'tooltip');
      tip.hidden = true;
      document.body.appendChild(tip);
    }
    const showTip = el => {
      const text = el.getAttribute('data-tip') || '';
      const ymd = el.getAttribute('data-d') || '';
      const titles = (byDay[ymd] || []);
      const n = titles.length;
      tip.innerHTML = n
        ? `<div class="d">${esc(ymd)}</div><div class="n">${n} 篇</div><ul>${titles.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
        : `<div class="d">${esc(text)}</div>`;
      tip.hidden = false;
      tip.classList.add('show');
      const er = el.getBoundingClientRect();
      let left = er.left + er.width / 2;
      const top = er.top - 8;
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      requestAnimationFrame(() => {
        const tr = tip.getBoundingClientRect();
        if (tr.left < 8) left += 8 - tr.left;
        if (tr.right > innerWidth - 8) left -= tr.right - (innerWidth - 8);
        tip.style.left = left + 'px';
      });
    };
    const hideTip = () => {
      tip.classList.remove('show');
      tip.hidden = true;
    };
    root.querySelectorAll('.heat-cell[data-d]').forEach(el => {
      el.addEventListener('pointerenter', () => showTip(el));
      el.addEventListener('pointerleave', hideTip);
      el.addEventListener('focus', () => showTip(el));
      el.addEventListener('blur', hideTip);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
