# aitechflow.cn 博客项目实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 部署一个极简黑白风格的静态博客到 aitechflow.cn，支持 GitHub Discussions 评论

**Architecture:** 
- Hexo 静态博客框架
- 自定义主题（黑白极简风格）
- Giscus 评论系统（基于 GitHub Discussions）
- 部署到用户云服务器 + 源码存 GitHub

**Tech Stack:** Hexo, Node.js, GitHub, Giscus

---

## 文件结构

```
blog-project/
├── docs/
│   └── superpowers/
│       ├── specs/
│       └── plans/
├── source/                    # Hexo 源码
│   ├── _posts/               # 文章目录
│   ├── about/                # 关于页
│   └── archives/             # 归档页（Hexo自带）
├── themes/
│   └── minimal-bw/           # 自定义黑白主题
├── public/                   # 生成的静态文件
├── _config.yml               # Hexo 配置
└── package.json
```

---

## 任务清单

### 任务1: 初始化 Hexo 项目

**Files:**
- Create: `~/blog-project/package.json`
- Create: `~/blog-project/_config.yml`
- Create: `~/blog-project/.gitignore`

- [ ] **Step 1: 创建项目目录和 package.json**

```bash
mkdir -p ~/blog-project
cd ~/blog-project
cat > package.json << 'EOF'
{
  "name": "aitechflow-blog",
  "version": "1.0.0",
  "description": "aitechflow.cn 个人博客",
  "scripts": {
    "dev": "hexo server",
    "build": "hexo generate",
    "deploy": "hexo deploy"
  },
  "dependencies": {
    "hexo": "^7.1.0",
    "hexo-theme-landscape": "^1.0.0"
  }
}
EOF
```

- [ ] **Step 2: 创建 Hexo 配置文件**

```bash
cat > _config.yml << 'EOF'
title: ls
subtitle: ''
description: '技术博客 | 生活记录'
keywords:
author: ls
language: zh-CN
timezone: Asia/Shanghai

url: https://aitechflow.cn
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:

source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: ''

theme: minimal-bw

deploy:
  type: ''
```

- [ ] **Step 3: 创建 .gitignore**

```bash
cat > .gitignore << 'EOF'
node_modules/
public/
.deploy_git/
.svn/
*.log
.DS_Store
EOF
```

- [ ] **Step 4: 安装 Hexo**

```bash
cd ~/blog-project
npm install
```

- [ ] **Step 5: 初始化 Hexo 目录**

```bash
cd ~/blog-project
npx hexo init source
mkdir -p source/_posts source/about source/archives
```

---

### 任务2: 创建自定义黑白主题

**Files:**
- Create: `~/blog-project/themes/minimal-bw/package.json`
- Create: `~/blog-project/themes/minimal-bw/_config.yml`
- Create: `~/blog-project/themes/minimal-bw/layout/index.ejs`
- Create: `~/blog-project/themes/minimal-bw/layout/post.ejs`
- Create: `~/blog-project/themes/minimal-bw/layout/layout.ejs`
- Create: `~/blog-project/themes/minimal-bw/layout/archives.ejs`
- Create: `~/blog-project/themes/minimal-bw/layout/page.ejs`
- Create: `~/blog-project/themes/minimal-bw/source/css/style.css`

- [ ] **Step 1: 创建主题目录结构**

```bash
mkdir -p ~/blog-project/themes/minimal-bw/layout
mkdir -p ~/blog-project/themes/minimal-bw/source/css
mkdir -p ~/blog-project/themes/minimal-bw/source/js
```

- [ ] **Step 2: 创建主题 package.json**

```bash
cat > ~/blog-project/themes/minimal-bw/package.json << 'EOF'
{
  "name": "minimal-bw",
  "version": "1.0.0",
  "description": "极简黑白主题",
  "author": "ls"
}
EOF
```

- [ ] **Step 3: 创建主题配置文件**

```bash
cat > ~/blog-project/themes/minimal-bw/_config.yml << 'EOF'
menu:
  首页: /
  归档: /archives
  关于: /about

widgets: []

giscus:
  repo: "your-github-username/aitechflow-blog"
  repoId: "your-repo-id"
  category: "Announcements"
  categoryId: "your-category-id"
  mapping: "pathname"
  reactionsEnabled: "1"
  emitMetadata: "0"
  inputPosition: "top"
  theme: "dark"
  lang: "zh-CN"
EOF
```

- [ ] **Step 4: 创建主布局文件**

```bash
cat > ~/blog-project/themes/minimal-bw/layout/layout.ejs << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= config.title %></title>
  <link rel="stylesheet" href="<%- url_for('/css/style.css') %>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <header class="header">
      <a href="<%- url_for('/') %>" class="logo"><%= config.author %></a>
      <nav class="nav">
        <% for (var i in theme.menu) { %>
          <a href="<%- url_for(theme.menu[i]) %>"><%= i %></a>
        <% } %>
      </nav>
    </header>
    
    <main class="main">
      <%- body %>
    </main>
    
    <footer class="footer">
      <p>© <%= new Date().getFullYear() %> <%= config.author %></p>
    </footer>
  </div>
  
  <script src="<%- url_for('/js/main.js') %>"></script>
</body>
</html>
EOF
```

- [ ] **Step 5: 创建首页布局（时间线风格）**

```html
<div class="header">
  <a href="<%- url_for('/') %>" class="logo"><%= config.author %></a>
  <div class="divider"></div>
</div>

<div class="timeline">
  <% page.posts.each(function(post){ %>
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-date"><%= date(post.date, 'YYYY-MM-DD') %></div>
    <a href="<%- url_for(post.path) %>" class="timeline-title"><%= post.title %></a>
    <% if (post.excerpt) { %>
    <p class="timeline-excerpt"><%= post.excerpt %></p>
    <% } %>
  </div>
  <% }); %>
</div>

<div class="nav-footer">
  <a href="<%- url_for('/archives') %>">归档</a>
  <a href="<%- url_for('/about') %>">关于</a>
</div>
```

- [ ] **Step 6: 创建文章页布局（含评论 + 文内批注）**

```html
<article class="post">
  <header class="post-header">
    <div class="post-back">
      <a href="<%- url_for('/') %>">← 返回</a>
    </div>
    <h1 class="post-title"><%= page.title %></h1>
    <div class="post-meta">
      <time><%= date(page.date, 'YYYY-MM-DD') %></time>
      <% if (page.categories && page.categories.length) { %>
        <span class="post-category"> · <%= page.categories.data[0].name %></span>
      <% } %>
    </div>
  </header>
  
  <div class="post-content">
    <%- page.content %>
  </div>
  
  <% if (page.tags && page.tags.length) { %>
  <div class="post-tags">
    <% page.tags.each(function(tag){ %>
      <span class="tag"><%= tag.name %></span>
    <% }); %>
  </div>
  <% } %>
  
  <div class="post-divider"></div>
  
  <!-- 文内批注 / 脚注区域 -->
  <% if (page.footnotes) { %>
  <div class="footnotes">
    <% page.footnotes.forEach(function(footnote, index) { %>
    <div class="footnote-item" id="fn-<%= index + 1 %>">
      <sup><%= index + 1 %></sup> <%- footnote %>
    </div>
    <% }); %>
  </div>
  <% } %>
  
  <!-- Giscus 评论 -->
  <div class="comments">
    <script src="https://giscus.app/client.js"
        data-repo="<%- theme.giscus.repo %>"
        data-repo-id="<%- theme.giscus.repoId %>"
        data-category="<%- theme.giscus.category %>"
        data-category-id="<%- theme.giscus.categoryId %>"
        data-mapping="<%- theme.giscus.mapping %>"
        data-strict="0"
        data-reactions-enabled="<%- theme.giscus.reactionsEnabled %>"
        data-emit-metadata="<%- theme.giscus.emitMetadata %>"
        data-input-position="<%- theme.giscus.inputPosition %>"
        data-theme="<%- theme.giscus.theme %>"
        data-lang="<%- theme.giscus.lang %>"
        crossorigin="anonymous"
        async>
    </script>
  </div>
</article>
```

- [ ] **Step 7: 创建归档页布局**

```bash
cat > ~/blog-project/themes/minimal-bw/layout/archives.ejs << 'EOF'
<div class="archives">
  <h1 class="page-title">归档</h1>
  
  <% var posts = site.posts.sort('date', -1); %>
  <% var years = {}; %>
  <% posts.forEach(function(post){ %>
    <% var year = post.date.year(); %>
    <% if (!years[year]) { years[year] = []; } %>
    <% years[year].push(post); %>
  <% }); %>
  
  <% for (var year in years) { %>
    <div class="archive-year">
      <h2 class="year"><%= year %>年</h2>
      <ul class="archive-list">
        <% years[year].forEach(function(post){ %>
        <li>
          <span class="date"><%= date(post.date, 'MM-DD') %></span>
          <a href="<%- url_for(post.path) %>"><%= post.title %></a>
        </li>
        <% }); %>
      </ul>
    </div>
  <% } %>
</div>
EOF
```

- [ ] **Step 8: 创建关于页布局**

```bash
cat > ~/blog-project/themes/minimal-bw/layout/page.ejs << 'EOF'
<article class="page">
  <header class="page-header">
    <h1 class="page-title"><%= page.title %></h1>
  </header>
  
  <div class="page-content">
    <%- page.content %>
  </div>
</article>
EOF
```

- [ ] **Step 9: 创建 CSS 样式（时间线风格 - frontend-design设计）**

```css
/* 极简时间线风格 - aitechflow.cn 
 * 设计: 前端设计指南 (frontend-design)
 * 风格: 极简黑白 + 终端时间线
 */

:root {
  --bg: #000000;
  --text: #ffffff;
  --text-secondary: #888888;
  --divider: #222222;
  --timeline-line: #333333;
  --timeline-dot: #ffffff;
  --accent: #ffffff;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background: var(--bg);
  color: var(--text);
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Noto Sans SC', monospace;
  font-size: 15px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Links */
a {
  color: var(--text);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

a:hover {
  border-bottom-color: var(--text);
}

/* Container */
.container {
  max-width: 680px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* Header */
.header {
  margin-bottom: 64px;
  padding-bottom: 24px;
}

.logo {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.divider {
  height: 1px;
  background: var(--divider);
  margin: 16px 0 32px;
}

/* Timeline - 核心设计元素 */
.timeline {
  position: relative;
  padding-left: 32px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--timeline-line);
}

.timeline-item {
  position: relative;
  margin-bottom: 40px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -32px;
  top: 6px;
  width: 8px;
  height: 8px;
  background: var(--timeline-dot);
  border-radius: 50%;
  box-shadow: 0 0 0 4px var(--bg);
}

.timeline-dot::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 1px solid var(--timeline-dot);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.timeline-item:hover .timeline-dot::after {
  opacity: 1;
}

.timeline-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
}

.timeline-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  margin-bottom: 4px;
}

.timeline-excerpt {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Post Page */
.post-header {
  margin-bottom: 48px;
}

.post-back {
  margin-bottom: 24px;
}

.post-back a {
  color: var(--text-secondary);
  font-size: 13px;
}

.post-back a:hover {
  color: var(--text);
}

.post-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.post-meta {
  color: var(--text-secondary);
  font-size: 13px;
}

.post-meta time {
  font-variant-numeric: tabular-nums;
}

.post-category {
  margin-left: 8px;
}

.post-content {
  font-size: 15px;
  line-height: 1.9;
}

.post-content h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 40px 0 20px;
  letter-spacing: -0.2px;
}

.post-content h3 {
  font-size: 15px;
  font-weight: 500;
  margin: 32px 0 16px;
}

.post-content p {
  margin-bottom: 20px;
}

.post-content pre {
  background: #0d0d0d;
  border: 1px solid var(--divider);
  padding: 16px;
  overflow-x: auto;
  margin: 24px 0;
  font-size: 13px;
  line-height: 1.6;
}

.post-content code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.post-content a {
  border-bottom: 1px solid var(--text-secondary);
}

.post-content a:hover {
  border-bottom-color: var(--text);
}

.post-content img {
  max-width: 100%;
  height: auto;
  margin: 24px 0;
  border: 1px solid var(--divider);
}

.post-content blockquote {
  border-left: 2px solid var(--text-secondary);
  padding-left: 20px;
  margin: 24px 0;
  color: var(--text-secondary);
  font-style: italic;
}

.post-content ul,
.post-content ol {
  margin: 20px 0;
  padding-left: 24px;
}

.post-content li {
  margin-bottom: 8px;
}

/* Tags */
.post-tags {
  margin-top: 48px;
}

.tag {
  color: var(--text-secondary);
  margin-right: 12px;
  font-size: 13px;
}

.tag::before {
  content: '#';
}

/* Divider */
.post-divider {
  border: none;
  border-top: 1px solid var(--divider);
  margin: 48px 0;
}

/* Navigation Footer */
.nav-footer {
  margin-top: 64px;
  padding-top: 24px;
  display: flex;
  gap: 24px;
}

.nav-footer a {
  color: var(--text-secondary);
  font-size: 14px;
}

.nav-footer a:hover {
  color: var(--text);
}

/* Archives Page */
.page-title {
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 40px;
  letter-spacing: -0.3px;
}

.archive-year {
  margin-bottom: 40px;
}

.archive-year .year {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-variant-numeric: tabular-nums;
}

.archive-list {
  list-style: none;
  padding-left: 0;
}

.archive-list li {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: baseline;
}

.archive-list .date {
  color: var(--text-secondary);
  font-size: 13px;
  min-width: 60px;
  font-variant-numeric: tabular-nums;
}

/* Footer */
.footer {
  margin-top: 80px;
  padding-top: 24px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
}

/* Giscus */
.comments {
  margin-top: 48px;
}

/* Animations - 页面加载动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-item {
  animation: fadeInUp 0.4s ease forwards;
  opacity: 0;
}

.timeline-item:nth-child(1) { animation-delay: 0.05s; }
.timeline-item:nth-child(2) { animation-delay: 0.1s; }
.timeline-item:nth-child(3) { animation-delay: 0.15s; }
.timeline-item:nth-child(4) { animation-delay: 0.2s; }
.timeline-item:nth-child(5) { animation-delay: 0.25s; }

/* Responsive */
@media (max-width: 640px) {
  .container {
    padding: 32px 16px;
  }
  
  .header {
    margin-bottom: 48px;
  }
  
  .timeline {
    padding-left: 24px;
  }
  
  .timeline::before {
    left: 4px;
  }
  
  .timeline-dot {
    left: -24px;
    width: 6px;
    height: 6px;
  }
  
  .post-title {
    font-size: 20px;
  }
  
  .archive-list li {
    flex-direction: column;
    gap: 4px;
  }
}

- [ ] **Step 10: 创建 JS 文件**

```bash
cat > ~/blog-project/themes/minimal-bw/source/js/main.js << 'EOF'
// 博客交互脚本
document.addEventListener('DOMContentLoaded', function() {
  // 可以在这里添加交互效果
});
EOF
```

- [ ] **Step 11: 验证主题创建成功**

```bash
cd ~/blog-project
npx hexo generate
ls -la public/
```

---

### 任务3: 配置 Giscus 评论系统

**Files:**
- Modify: `~/blog-project/themes/minimal-bw/_config.yml`

- [ ] **Step 1: 创建 GitHub 仓库用于存放博客**

在 GitHub 上创建新仓库 `aitechflow-blog`（公开）

- [ ] **Step 2: 启用 GitHub Discussions**

在仓库设置中开启 Discussions 功能

- [ ] **Step 3: 获取 Giscus 配置信息**

1. 访问 https://giscus.app
2. 输入仓库: `your-username/aitechflow-blog`
3. 选择页面→ Discussions 映射
4. 复制生成的 repoId 和 categoryId

- [ ] **Step 4: 更新主题配置**

```bash
cat > ~/blog-project/themes/minimal-bw/_config.yml << 'EOF'
menu:
  首页: /
  归档: /archives
  关于: /about

widgets: []

giscus:
  repo: "你的GitHub用户名/aitechflow-blog"
  repoId: "R_kgDxxxxxxxx"  # 替换为你的 repoId
  category: "Announcements"
  categoryId: "DIC_kwDxxxxxx"  # 替换为你的 categoryId
  mapping: "pathname"
  reactionsEnabled: "1"
  emitMetadata: "0"
  inputPosition: "top"
  theme: "dark"
  lang: "zh-CN"
EOF
```

---

### 任务4: 创建示例内容

**Files:**
- Create: `~/blog-project/source/_posts/hello-world.md`
- Create: `~/blog-project/source/about/index.md`

- [ ] **Step 1: 创建第一篇博客文章**

```bash
cat > ~/blog-project/source/_posts/hello-world.md << 'EOF'
---
title: 你好，世界
date: 2026-04-19
categories:
  - 随笔
tags:
  - 博客
---

欢迎来到我的博客。

这是第一篇文章，记录一下博客的搭建过程。

## 博客技术栈

- Hexo 静态博客
- Giscus 评论系统
- 部署在云服务器
- 源码托管在 GitHub
EOF
```

- [ ] **Step 2: 创建关于页面**

```bash
mkdir -p ~/blog-project/source/about
cat > ~/blog-project/source/about/index.md << 'EOF'
---
title: 关于
date: 2026-04-19
---

# 关于我

我是 ls，一个正在找工作的开发者。

这个博客用来记录学习笔记和技术分享。

## 联系方式

- GitHub: https://github.com/你的用户名
- Email: lswyyj@163.com
EOF
```

- [ ] **Step 3: 生成静态文件并预览**

```bash
cd ~/blog-project
npx hexo generate
npx hexo server -p 4000
```

访问 http://your-server-ip:4000 预览

---

### 任务5: 部署到服务器

**Files:**
- Modify: `~/blog-project/_config.yml`

- [ ] **Step 1: 配置部署方式**

```bash
cat > ~/blog-project/_config.yml << 'EOF'
# 修改 deploy 部分
deploy:
  type: rsync
  host: your-server-ip
  user: ubuntu
  root: /var/www/aitechflow.cn
  port: 22
```

- [ ] **Step 2: 在服务器上创建网站目录**

```bash
ssh ubuntu@your-server-ip "sudo mkdir -p /var/www/aitechflow.cn && sudo chown ubuntu:ubuntu /var/www/aitechflow.cn"
```

- [ ] **Step 3: 安装 hexo-deployer-rsync**

```bash
cd ~/blog-project
npm install hexo-deployer-rsync --save
```

- [ ] **Step 4: 部署**

```bash
npx hexo deploy
```

---

### 任务6: 配置域名和 HTTPS

**Files:**
- Modify: 服务器 nginx 配置

- [ ] **Step 1: 配置 Nginx**

```bash
ssh ubuntu@your-server-ip "sudo cat > /etc/nginx/sites-available/aitechflow.cn << 'EOF'
server {
    listen 80;
    server_name aitechflow.cn www.aitechflow.cn;
    root /var/www/aitechflow.cn;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF
sudo ln -s /etc/nginx/sites-available/aitechflow.cn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx"
```

- [ ] **Step 2: 域名 DNS 解析**

在域名服务商处添加 A 记录:
- 主机记录: @
- 记录值: your-server-ip

- [ ] **Step 3: 配置 HTTPS (可选，使用 Let's Encrypt)**

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d aitechflow.cn -d www.aitechflow.cn
```

---

### 任务7: GitHub 备份设置

**Files:**
- Create: `~/blog-project/README.md`

- [ ] **Step 1: 初始化 Git 并关联远程仓库**

```bash
cd ~/blog-project
git init
git add .
git commit -m "Initial blog commit"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/aitechflow-blog.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: 创建 README**

```bash
cat > ~/blog-project/README.md << 'EOF'
# aitechflow.cn 博客

极简黑白风格个人博客

## 技术栈

- Hexo
- Giscus 评论
- 部署在云服务器

## 本地开发

```bash
npm install
npx hexo server
```

## 部署

```bash
npx hexo generate
npx hexo deploy
```
EOF

git add README.md
git commit -m "Add README"
git push
```

---

## 执行方式

**选择执行方式：**

A. **Subagent驱动（推荐）** - 我分配子任务逐步执行
B. **我直接执行** - 这个会话直接帮你全部做好

选哪个？