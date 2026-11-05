/**
 * 首页数据：真实文章 / 分类 / 标签，套进批准稿的卡片与统计位。
 * 卡片色系按内容归到晨光稿里的五组（AI / Java / 部署 / 建站 / 随笔），
 * 不另造文章。
 */
const FAMILIES = {
  ai: {
    icon: '◈',
    bg: 'linear-gradient(135deg,#2f5280,#4a6fa0 60%,#6b8cb8)',
    color: '#2f5280'
  },
  java: {
    icon: '◆',
    bg: 'linear-gradient(135deg,#8a5a2b,#a8763f 60%,#c2924f)',
    color: '#8a5a2b'
  },
  deploy: {
    icon: '▣',
    bg: 'linear-gradient(135deg,#3f6049,#4f7a5c 60%,#669473)',
    color: '#3f6049'
  },
  build: {
    icon: '⬡',
    bg: 'linear-gradient(135deg,#55487a,#6a5c95 60%,#8172ad)',
    color: '#55487a'
  },
  note: {
    icon: '✎',
    bg: 'linear-gradient(135deg,#7a4a5c,#95596f 60%,#ad6c84)',
    color: '#7a4a5c'
  }
};

const KEYWORDS = [
  ['ai', ['ai', 'rag', 'agent', 'llm', '大模型', '提示词', 'prompt']],
  ['java', ['java', 'jvm', 'spring', 'maven', 'redis', 'netty']],
  ['deploy', ['部署', 'docker', 'linux', 'nginx', 'k8s', '服务器']],
  ['build', ['建站', 'hexo', '博客', '教程', 'butterfly']]
];

const SINCE = '2025.04';
const WALL_LIMIT = 8;

function listOf(coll) {
  if (!coll) return [];
  if (typeof coll.toArray === 'function') return coll.toArray();
  if (Array.isArray(coll)) return coll;
  return [];
}

function familyId(text) {
  const bag = String(text || '').toLowerCase();
  for (const [id, words] of KEYWORDS) {
    if (words.some(word => bag.includes(word))) return id;
  }
  return 'note';
}

function familyOf(text) {
  return FAMILIES[familyId(text)];
}

function plain(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerptOf(post) {
  const text = plain(post.description || post.excerpt || post.content || '');
  if (text.length <= 92) return text;
  return text.slice(0, 92).trim() + '…';
}

function readingMinutes(html) {
  const text = plain(html);
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length;
  return Math.max(1, Math.round(cjk / 450 + latin / 180)) + ' min';
}

function watermark(post, famId) {
  const tags = listOf(post.tags).map(tag => tag.name);
  const latin = tags.find(name => /^[A-Za-z0-9]{2,6}$/.test(name));
  if (latin) return latin.slice(0, 4).toUpperCase();
  if (famId === 'ai') return 'AI';
  if (famId === 'java') return 'JVM';
  if (famId === 'deploy') return 'OPS';
  if (famId === 'build') return 'HEXO';
  const title = plain(post.title);
  return title ? title.slice(0, 2) : 'NOTE';
}

function monthsSinceApril2025(now) {
  const months = (now.getFullYear() - 2025) * 12 + now.getMonth() - 3;
  return Math.max(1, months);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  }[c]));
}

hexo.extend.helper.register('hHome', function hHome() {
  const posts = this.site.posts.toArray().sort((a, b) => b.date.valueOf() - a.date.valueOf());
  const tags = this.site.tags.toArray().sort((a, b) => b.length - a.length || a.name.localeCompare(b.name, 'zh'));
  const categories = this.site.categories.toArray().sort((a, b) => b.length - a.length || a.name.localeCompare(b.name, 'zh'));
  const maxCat = categories.reduce((max, cat) => Math.max(max, cat.length), 1);
  const latest = posts[0];
  const updated = latest && latest.date ? latest.date.format('MM-DD') : '–';

  const cards = posts.slice(0, WALL_LIMIT).map((post, index) => {
    const names = listOf(post.categories).map(cat => cat.name);
    const bag = [post.title, ...names, ...listOf(post.tags).map(tag => tag.name)].join(' ');
    const famKey = familyId(bag);
    const fam = FAMILIES[famKey];
    const catName = names[0] || '随笔';
    const fresh = Date.now() - post.date.valueOf() < 1000 * 60 * 60 * 24 * 21;
    return {
      href: this.url_for(post.path),
      title: post.title,
      excerpt: excerptOf(post),
      date: post.date.format('YYYY-MM-DD'),
      minutes: readingMinutes(post.content),
      fresh,
      hero: index === 0,
      catName,
      catIds: (names.length ? names : ['随笔']).join('|'),
      icon: fam.icon,
      bg: fam.bg,
      wm: watermark(post, famKey)
    };
  });

  const catRows = categories.map(cat => {
    const fam = familyOf(cat.name);
    return {
      name: cat.name,
      count: cat.length,
      path: this.url_for(cat.path),
      color: fam.color,
      width: Math.max(8, Math.round((cat.length / maxCat) * 100))
    };
  });

  const topCount = tags.length ? tags[0].length : 0;
  let hotLeft = topCount > 1 ? 2 : 0;
  const tagRows = tags.map(tag => {
    const hot = hotLeft > 0 && tag.length === topCount;
    if (hot) hotLeft -= 1;
    return {
      name: tag.name,
      count: tag.length,
      path: this.url_for(tag.path),
      hot,
      showCount: tag.length > 1
    };
  });

  const cliPosts = posts.slice(0, 3).map(post => ({
    date: post.date.format('YYYY-MM-DD'),
    file: `${post.slug}.md`
  }));

  const postsLabel = `${posts.length} · since ${SINCE}`.padEnd(18, ' ');
  const cli = [
    '<span class="ac">  流</span>  <span class="mk">AI Tech Flow</span>  v2026.11',
    '',
    '<span class="dim">  ╭────────────────────────────────────────╮</span>',
    `<span class="dim">  │</span>  <span class="mk">cwd</span>      aitechflow.cn               <span class="dim">│</span>`,
    `<span class="dim">  │</span>  <span class="mk">author</span>   LS · 后端开发 / AI 应用     <span class="dim">│</span>`,
    `<span class="dim">  │</span>  <span class="mk">posts</span>    ${esc(postsLabel)}<span class="dim">│</span>`,
    `<span class="dim">  │</span>  <span class="mk">status</span>   <span class="ac">open to work</span>               <span class="dim">│</span>`,
    '<span class="dim">  ╰────────────────────────────────────────╯</span>',
    '',
    '<span class="dim">  ›</span> <span class="mk">cat</span> ./why.txt',
    '  只记真实踩过的坑，以及当时为什么那样选。',
    '',
    `<span class="dim">  ›</span> <span class="mk">ls</span> ./posts | <span class="mk">head</span> -3`,
    cliPosts.length
      ? cliPosts.map(post => `  ${esc(post.date)}  ${esc(post.file)}`).join('\n')
      : '  （还没有文章）',
    '',
    '<span class="dim">  ›</span> <span class="ac">▌</span>'
  ].join('\n');

  return {
    year: new Date().getFullYear(),
    stats: {
      posts: posts.length,
      tags: tags.length,
      categories: categories.length,
      months: monthsSinceApril2025(new Date()),
      updated,
      since: SINCE
    },
    totalPosts: posts.length,
    cards,
    categories: catRows,
    tags: tagRows,
    cli,
    cmdk: {
      posts: posts.map(post => ({
        t: post.title,
        href: this.url_for(post.path),
        hint: post.date.format('YYYY-MM-DD'),
        k: [post.title, post.description || '', ...listOf(post.tags).map(tag => tag.name), ...listOf(post.categories).map(cat => cat.name)].join(' ')
      })),
      cats: categories.map(cat => ({
        id: cat.name,
        name: cat.name,
        k: cat.name
      }))
    }
  };
});
