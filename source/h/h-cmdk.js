/* =====================================================================
   ⌘K 命令面板
   ⌘K / Ctrl+K 唤起 · ↑↓ 选择 · ⏎ 执行 · Esc 关闭
   文章与分类来自首页注入的 window.H_CMDK（真实 Hexo 数据）
   ===================================================================== */
(() => {
  const mask = document.getElementById('cmdkMask');
  const panel = document.getElementById('cmdk');
  const input = document.getElementById('cmdkInput');
  const list = document.getElementById('cmdkList');
  if (!panel) return;

  const data = window.H_CMDK || { posts: [], cats: [] };

  const go = (sel, hash) => () => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else location.href = '/' + (hash || '');
  };
  const tab = f => () => {
    const btn = document.querySelector(`[role="tab"][data-f="${f}"]`);
    if (btn) {
      btn.click();
      document.querySelector('#whoami')?.scrollIntoView({ behavior: 'smooth' });
    } else location.href = '/#whoami';
  };
  const pal = p => () => {
    document.querySelector(`.pal-pick [data-p="${p}"]`)?.click();
  };
  const cat = id => () => {
    const btn = document.querySelector(`.cats [data-c="${CSS.escape(id)}"]`);
    if (btn) {
      btn.click();
      document.querySelector('#posts')?.scrollIntoView({ behavior: 'smooth' });
    } else location.href = '/#posts';
  };

  const CMDS = [
    { g:'跳转', ic:'§', t:'回到封面',        k:'cover top 顶部 主页', run: go('#cover', '#cover') },
    { g:'跳转', ic:'§', t:'我是谁',          k:'whoami about 关于 笔者', run: go('#whoami', '#whoami') },
    { g:'跳转', ic:'§', t:'文章列表',        k:'posts 文章 列表',     run: go('#posts', '#posts') },

    { g:'文件', ic:'J', t:'AboutMe.java',    k:'about 关于 自我介绍',  run: tab('about') },
    { g:'文件', ic:'J', t:'Skills.java',     k:'skills 技能 技术栈',   run: tab('skills') },
    { g:'文件', ic:'L', t:'timeline.log',    k:'timeline 时间线 轨迹', run: tab('timeline') },
    { g:'文件', ic:'M', t:'contact.md',      k:'contact 联系 邮箱',    run: tab('contact') },

    { g:'分类', ic:'#', t:'全部文章',        k:'all 全部',            run: cat('all') }
  ];

  (data.cats || []).forEach(c => CMDS.push({
    g:'分类', ic:'#', t:c.name, k:`${c.name} ${c.k || ''}`, run: cat(c.id)
  }));

  CMDS.push(
    { g:'彩蛋', ic:'★', t:'翻转收藏卡', k:'card flip 卡片 闪卡 宝可梦 鼠鼠',
      run: () => {
        const flip = document.getElementById('flipBtn');
        if (flip) {
          flip.click();
          document.querySelector('#whoami')?.scrollIntoView({ behavior: 'smooth' });
        } else location.href = '/#whoami';
      } },

    { g:'外观', ic:'◐', t:'色系 · 晨光',    k:'dawn 暖 米白 蜜桃', run: pal('dawn') },
    { g:'外观', ic:'◐', t:'色系 · 青瓷',    k:'celadon 青 绿 冷', run: pal('celadon') },
    { g:'外观', ic:'◐', t:'色系 · 晚樱',    k:'dusk 粉 紫 柔',    run: pal('dusk') },
    { g:'外观', ic:'◑', t:'切换深色 / 浅色', k:'dark light theme 暗',
      run: () => document.getElementById('theme')?.click() },

    { g:'链接', ic:'↗', t:'GitHub',       k:'github 代码 仓库',
      run: () => window.open('https://github.com/1559058283', '_blank', 'noopener') },
    { g:'链接', ic:'✉', t:'发邮件给 LS',   k:'mail email 联系 内推',
      run: () => { location.href = 'mailto:lswyyj@163.com'; } },
    { g:'链接', ic:'∞', t:'RSS 订阅',     k:'rss feed atom 订阅',
      run: () => window.open('/atom.xml', '_blank', 'noopener') },
    { g:'链接', ic:'≡', t:'文章归档',     k:'archive 归档 archives',
      run: () => { location.href = '/archives/'; } }
  );

  (data.posts || []).forEach(p => CMDS.push({
    g:'文章', ic:'›', t:p.t, k:p.k || p.t, hint:p.hint,
    run: () => { location.href = p.href; }
  }));

  function esc(s) {
    return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function score(q, item) {
    if (!q) return 0;
    const hay = (item.t + ' ' + item.k).toLowerCase();
    let i = 0, hits = 0;
    for (const ch of q) {
      const at = hay.indexOf(ch, i);
      if (at === -1) return -1;
      if (at === i) hits += 2; else hits += 1;
      i = at + 1;
    }
    return hits + (hay.startsWith(q) ? 8 : 0);
  }
  function mark(text, q) {
    if (!q) return esc(text);
    let out = '', i = 0;
    const low = text.toLowerCase();
    for (const ch of q) {
      const at = low.indexOf(ch, i);
      if (at === -1) break;
      out += esc(text.slice(i, at)) + `<em>${esc(text[at])}</em>`;
      i = at + 1;
    }
    return out + esc(text.slice(i));
  }

  let rows = [], sel = 0;

  function render(q = '') {
    const ql = q.trim().toLowerCase();
    const hit = ql
      ? CMDS.map(c => ({ c, s: score(ql, c) })).filter(x => x.s >= 0)
          .sort((a, b) => b.s - a.s).map(x => x.c)
      : CMDS;

    if (!hit.length) {
      list.innerHTML = `<p class="cmdk-empty">没有匹配的命令<br>
        试试 <code>文章</code> <code>java</code> <code>色系</code></p>`;
      rows = []; return;
    }

    let html = '', g = '';
    rows = hit;
    hit.forEach((c, i) => {
      if (c.g !== g) { g = c.g; html += `<p class="cmdk-grp">${g}</p>`; }
      const hint = c.hint ? `<span class="hint">${esc(c.hint)}</span>` : '';
      html += `<div class="cmdk-it" role="option" data-i="${i}" aria-selected="${i === sel}">
        <span class="ic" aria-hidden="true">${c.ic}</span>
        <span class="tx">${mark(c.t, ql)}</span>${hint}
      </div>`;
    });
    list.innerHTML = html;

    list.querySelectorAll('.cmdk-it').forEach(el => {
      el.addEventListener('click', () => exec(+el.dataset.i));
      el.addEventListener('mouseenter', () => { sel = +el.dataset.i; paint(); });
    });
  }

  function paint() {
    list.querySelectorAll('.cmdk-it').forEach(el => {
      const on = +el.dataset.i === sel;
      el.setAttribute('aria-selected', String(on));
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
  }

  function exec(i) {
    const c = rows[i];
    if (!c) return;
    close();
    setTimeout(() => c.run(), 120);
  }

  function openPanel() {
    mask.classList.add('open');
    panel.classList.add('open');
    input.value = '';
    sel = 0;
    render('');
    setTimeout(() => input.focus(), 40);
  }
  function close() {
    mask.classList.remove('open');
    panel.classList.remove('open');
  }

  window.addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ((e.metaKey || e.ctrlKey) && k === 'k') {
      e.preventDefault();
      if (panel.classList.contains('open')) close();
      else openPanel();
      return;
    }
    if (!panel.classList.contains('open')) return;
    if (k === 'escape') { e.preventDefault(); close(); }
    else if (k === 'arrowdown') { e.preventDefault(); sel = Math.min(sel + 1, rows.length - 1); paint(); }
    else if (k === 'arrowup')   { e.preventDefault(); sel = Math.max(sel - 1, 0); paint(); }
    else if (k === 'enter')     { e.preventDefault(); exec(sel); }
  });
  input.addEventListener('input', () => { sel = 0; render(input.value); });
  mask.addEventListener('click', close);
  document.getElementById('cmdkBtn')?.addEventListener('click', openPanel);

  const isMac = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  document.querySelectorAll('[data-mod]').forEach(el => {
    el.textContent = isMac ? '⌘K' : 'Ctrl K';
  });
})();
