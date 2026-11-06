/* =====================================================================
   aitechflow.cn · IDE 共享脚本（四个方案共用）
   提供：文件内容 / 标签切换 / Darcula / 复制 / 滚动揭示 / 顶栏状态栏显隐
   ===================================================================== */
const K = s => `<span class="kw">${s}</span>`;
const S = s => `<span class="st">${s}</span>`;
const C = s => `<span class="cm">${s}</span>`;

const FILES = {
  about: {
    name: 'AboutMe.java', icon: 'j',
    lines: [
      `${K('public class')} AboutMe {`, ``,
      `    ${K('String')} name  = ${S('"LIUS"')};`,
      `    ${K('String')} role  = ${S('"后端开发工程师"')};`,
      `    ${K('String')} focus = ${S('"Java / AI 工程化"')};`,
      `    ${K('int')}    since = 2025;`, ``,
      `    ${C('// 不写泛泛而谈的教程，只记真实踩过的坑，')}`,
      `    ${C('// 以及当时为什么那样选。')}`,
      `    ${K('String')} why() {`,
      `        ${K('return')} ${S('"写给三个月后忘记这一切的自己"')};`,
      `    }`, `}`
    ],
    raw: `public class AboutMe {

    String name  = "LIUS";
    String role  = "后端开发工程师";
    String focus = "Java / AI 工程化";
    int    since = 2025;

    // 不写泛泛而谈的教程，只记真实踩过的坑，
    // 以及当时为什么那样选。
    String why() {
        return "写给三个月后忘记这一切的自己";
    }
}`
  },
  skills: {
    name: 'Skills.java', icon: 'j',
    lines: [
      `${K('public class')} Skills {`, ``,
      `    ${C('// 每天都在用')}`,
      `    ${K('var')} daily = List.of(${S('"Java"')}, ${S('"Spring"')}, ${S('"MySQL"')}, ${S('"Redis"')});`, ``,
      `    ${C('// 做 AI 应用时用')}`,
      `    ${K('var')} ai    = List.of(${S('"Python"')}, ${S('"RAG"')}, ${S('"Spring AI"')});`, ``,
      `    ${C('// 部署和排查')}`,
      `    ${K('var')} ops   = List.of(${S('"Linux"')}, ${S('"Docker"')}, ${S('"Nginx"')});`, ``,
      `    ${C('// 在学，还不敢说会')}`,
      `    ${K('var')} wip   = List.of(${S('"AI Agent"')}, ${S('"K8s"')});`, `}`
    ],
    raw: `public class Skills {

    // 每天都在用
    var daily = List.of("Java", "Spring", "MySQL", "Redis");

    // 做 AI 应用时用
    var ai    = List.of("Python", "RAG", "Spring AI");

    // 部署和排查
    var ops   = List.of("Linux", "Docker", "Nginx");

    // 在学，还不敢说会
    var wip   = List.of("AI Agent", "K8s");
}`
  },
  timeline: {
    name: 'timeline.log', icon: 'l',
    lines: [
      `${C('# git log --oneline --reverse')}`, ``,
      `${K('2025.04')}  ${S('init')}      aitechflow.cn 上线，专门记 Java 和部署里的选择`,
      `${K('2025.08')}  ${S('build')}     Spring Boot 按 web / domain / infra 拆开编译`,
      `${K('2025.11')}  ${S('perf')}      冷启动从十秒级收到数秒，镜像也改成分层`,
      `${K('2026.04')}  ${S('chore')}     博客迁到 GitHub Pages，源码和发布分开`,
      `${K('2026.06')}  ${S('feat')}      检索拆成切块、混合召回、重排，能单独换`,
      `${K('2026.09')}  ${S('note')}      同一模型下，检索质量比换提示词拉开得更多`,
      `${K('2026.10')}  ${S('feat')}      Spring AI 接通义千问，流式、超时、依赖都留了配置`, ``,
      `${C('# HEAD -> main · 还在写')}`
    ],
    raw: `# git log --oneline --reverse

2025.04  init      aitechflow.cn 上线，专门记 Java 和部署里的选择
2025.08  build     Spring Boot 按 web / domain / infra 拆开编译
2025.11  perf      冷启动从十秒级收到数秒，镜像也改成分层
2026.04  chore     博客迁到 GitHub Pages，源码和发布分开
2026.06  feat      检索拆成切块、混合召回、重排，能单独换
2026.09  note      同一模型下，检索质量比换提示词拉开得更多
2026.10  feat      Spring AI 接通义千问，流式、超时、依赖都留了配置

# HEAD -> main · 还在写`
  },
  contact: {
    name: 'contact.md', icon: 'm',
    lines: [
      `${K('# 联系')}`, ``,
      `${C('> 写信就行。Java 工程、AI 应用落地、建站踩坑，都可以。')}`, ``,
      `- 邮箱　　${S('lswyyj@163.com')}`,
      `- GitHub　${S('github.com/1559058283')}`,
      `- 博客　　${S('aitechflow.cn')}`,
      `- RSS　　 ${S('aitechflow.cn/atom.xml')}`, ``,
      `${K('## 聊什么都行')}`, ``,
      `Java 工程实践、AI 应用落地、建站踩坑，`,
      `或者只是想说这个皮肤还行 —— 都可以写信。`
    ],
    raw: `# 联系

> 写信就行。Java 工程、AI 应用落地、建站踩坑，都可以。

- 邮箱    lswyyj@163.com
- GitHub  github.com/1559058283
- 博客    aitechflow.cn
- RSS     aitechflow.cn/atom.xml

## 聊什么都行

Java 工程实践、AI 应用落地、建站踩坑，
或者只是想说这个皮肤还行 —— 都可以写信。`
  }
};

/* 渲染一个代码 pane */
function renderPane(key, hidden) {
  const f = FILES[key];
  const d = document.createElement('div');
  d.className = 'pane';
  d.dataset.f = key;
  d.hidden = !!hidden;
  d.innerHTML = `<div class="code">
    <div class="gut" aria-hidden="true">${f.lines.map((_, i) => i + 1).join('<br>')}</div>
    <div class="src">${f.lines.map(l => `<div class="l">${l || ' '}</div>`).join('')}</div>
  </div>`;
  return d;
}

/* 标签切换：keys = 该页用到的文件，staticPane = 静态 HTML 的 pane 名（可空） */
function initTabs({ keys, staticPane = null, mount, defaultKey }) {
  const host = document.querySelector(mount);
  const fname = document.getElementById('fname');
  const cp = document.getElementById('copy');
  const sp = staticPane ? document.querySelector(`.pane[data-f="${staticPane}"]`) : null;
  let active = defaultKey;

  keys.forEach(k => host.appendChild(renderPane(k, k !== defaultKey)));

  const sync = () => {
    if (sp) sp.hidden = active !== staticPane;
    host.querySelectorAll('.pane').forEach(p => { p.hidden = p.dataset.f !== active; });
    document.querySelectorAll('[role="tab"]').forEach(b => {
      b.setAttribute('aria-selected', String(b.dataset.f === active));
    });
    if (fname) fname.textContent = FILES[active] ? FILES[active].name : staticPane;
    if (cp) cp.style.display = FILES[active] ? '' : 'none';
  };

  document.querySelectorAll('[role="tab"]').forEach(b => {
    b.addEventListener('click', () => { active = b.dataset.f; sync(); });
  });

  if (cp) cp.addEventListener('click', async () => {
    if (!FILES[active]) return;
    try {
      await navigator.clipboard.writeText(FILES[active].raw);
      cp.textContent = '✓ 已复制'; cp.classList.add('done');
    } catch { cp.textContent = '复制失败'; }
    setTimeout(() => { cp.textContent = '⧉ 复制'; cp.classList.remove('done'); }, 1600);
  });

  sync();
}

/* Darcula */
function initTheme() {
  const th = document.getElementById('theme');
  if (!th) return;
  th.addEventListener('click', () => {
    const el = document.documentElement;
    const dark = el.getAttribute('data-theme') === 'dark';
    el.setAttribute('data-theme', dark ? 'light' : 'dark');
    th.textContent = dark ? '◐' : '◑';
  });
}

/* 滚动揭示 */
function initReveal(sel = '.rv') {
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '-50px' });
  document.querySelectorAll(sel).forEach(el => io.observe(el));
}

/* 顶栏/状态栏：离开指定区域才出现 */
function initChrome(watchSel) {
  const watch = document.querySelector(watchSel);
  const bars = ['top', 'status'].map(id => document.getElementById(id)).filter(Boolean);
  if (!watch || !bars.length) return;
  const io = new IntersectionObserver(([en]) => {
    const away = !en.isIntersecting;
    bars.forEach(b => { b.classList.toggle('show', away); b.classList.toggle('hid', !away); });
  }, { threshold: .35 });
  io.observe(watch);
}
