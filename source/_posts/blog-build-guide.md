---
title: 从零开始搭建个人技术博客 - 完整指南
date: 2026-04-20 17:00:00
updated: 2026-04-20 17:00:00
tags:
  - 博客
  - 建站
  - Hexo
  - 教程
categories:
  - 教程
description: 从购买域名、服务器到部署上线，详细介绍使用 Hexo + Butterfly 搭建个人技术博客的完整流程，适合零基础新手。
---

# 从零开始搭建个人技术博客 - 完整指南

> 本指南涵盖从注册域名到上线运营的全流程。

**本文档版本信息：**
> - 教程日期：2026年4月
> - Hexo 版本：7.x
> - Butterfly 版本：4.x
> - 阿里云服务器 Ubuntu 22.04

---

## 第一部分：前提准备

在开始之前，先选择适合你的部署方案：

| 方案 | 优点 | 缺点 | 适合人群 |
|------|------|------|----------|
| **云服务器 + 宝塔** | 自由度高等 | 需要付费、需维护 | 想要学习运维、长期运营 |
| **GitHub Pages** | 免费、零运维 | 国内访问慢、无自定义端口 | 轻量博客、练习项目 |
| **Vercel/Netlify** | 免费、CDN加速 | 国内访问可能不稳定 | 个人博客、开源项目 |

> **本指南主要介绍云服务器方案**。如果你用 GitHub Pages，可参考 Hexo 官方文档的 [GitHub Pages 部署](https://hexo.io/docs/github-pages) 方法。

### 1.1 注册域名

**推荐平台：**
- **阿里云** (https://www.aliyun.com/) - 国内主流，备案方便
- **腾讯云** (https://cloud.tencent.com/) - 国内主流，优惠多
- **Namecheap** (https://www.namecheap.com/) - 国外域名商，无需备案

**域名选择建议：**
- 简短易记
- 优先选择 `.cn`、`.com`、`.io` 等常见后缀
- 避免数字和特殊字符混用
- 建议准备好 2-3 个备选域名

### 1.2 购买云服务器

**推荐配置：**
| 配置项 | 推荐选择 |
|--------|----------|
| **CPU** | 2核 |
| **内存** | 4GB |
| **带宽** | 3-5Mbps |
| **硬盘** | 40-60GB SSD |
| **系统** | Ubuntu 20.04/22.04 LTS |

**推荐平台：**
- **阿里云** - https://www.aliyun.com/
- **腾讯云** - https://cloud.tencent.com/
- **AWS/Google Cloud** - 国外服务器，无需备案

### 1.3 域名备案（仅国内服务器需要）

如果使用国内服务器，需要进行域名备案：
1. 登录云服务商备案系统
2. 填写网站信息
3. 上传身份证明材料
4. 等待审核（通常 7-20 个工作日）

> **注意：** 使用国外服务器可跳过备案步骤。

---

## 第二部分：服务器环境配置

### 2.1 连接到服务器

```bash
ssh ubuntu@你的服务器IP
```

### 2.2 安装宝塔面板

```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

**安装完成后：**
- 记录面板登录地址、用户名和密码
- 访问 `http://你的服务器IP:8888` 登录

### 2.3 配置服务器环境

通过宝塔面板安装：
- **Nginx** - Web 服务器（必装）

---

## 第三部分：博客系统安装

### 3.1 安装 Node.js 和 Git

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 Git
sudo apt-get install -y git
```

### 3.2 安装 Hexo

```bash
# 安装 Hexo
npm install -g hexo-cli

# 初始化博客项目
hexo init 你的博客项目名
cd 你的博客项目名

# 安装主题（克隆到 themes/butterfly）
git clone https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly

# 安装依赖
npm install
```

### 3.3 基础配置

编辑 `_config.yml`：

```yaml
title: 你的博客名称
subtitle: 副标题
description: 博客描述
author: 你的名字
language: zh-CN
timezone: Asia/Shanghai

url: https://你的域名.com
root: /

permalink: :year/:month/:day/:title/

theme: butterfly
```

---

## 第四部分：主题配置

### 4.1 导航菜单

编辑 `themes/butterfly/_config.yml`：

```yaml
menu:
  主页: / || fas fa-home
  文章: /archives/ || fas fa-archive
  生活: /categories/生活/ || fas fa-heart
  友链: /link/ || fas fa-link
  留言板: /comments/ || fas fa-comments
  关于笔者: /about/ || fas fa-user
  搜索: /search/ || fas fa-search
```

### 4.2 首页横幅图

```yaml
index_img: /img/你的图片.jpg
```

将图片放入 `themes/hexo-theme-butterfly/source/img/` 目录。

### 4.3 首页座右铭

```yaml
subtitle:
  enable: true
  effect: true
  source: false
  sub:
    - "你的座右铭1"
    - "你的座右铭2"
    - "你的座右铭3"
```

### 4.4 Giscus 评论系统

1. 访问 https://github.com/apps/giscus 安装
2. 选择用于评论的仓库
3. 启用 Discussions 功能

在主题配置 `themes/butterfly/_config.yml` 中：

```yaml
# 评论设置 (Giscus)
comments:
  use: Giscus
  text: true
  lazyload: false
  count: false
  card_post_count: false

# Giscus 配置（顶层）
giscus:
  repo: 你的GitHub用户名/你的仓库
  repo_id: 你的repo_id
  category: Announcements
  category_id: 你的category_id
  mapping: pathname
  theme: light
  lang: zh-CN
```

---

## 第五部分：创建页面

### 5.1 友链页面

```markdown
---
title: 友链
date: 2026-04-20 18:00:00
type: link
---

# 友链

期待交换友链！
```

### 5.2 留言板

```markdown
---
title: 留言板
date: 2026-04-20 18:00:00
type: comments
---

# 留言板

欢迎留言！
```

### 5.3 关于页面

```markdown
---
title: 关于
date: 2026-04-20 18:00:00
---

# 关于我

介绍你自己...
```

---

## 第六部分：发布文章

### 6.1 创建文章

```bash
hexo new "文章标题"
```

### 6.2 文章格式

```markdown
---
title: 文章标题
date: 2026-04-20 12:00:00
tags:
  - 标签1
  - 标签2
categories:
  - 分类1
---

正文内容...
```

### 6.3 添加图片

```markdown
![描述](/images/图片名.jpg)
```

图片放入 `source/images/` 目录。

---

## 第七部分：部署到服务器

### 7.1 方法一：rsync 部署

```bash
# 同步到服务器
rsync -av --delete 你的博客public目录/ ubuntu@你的服务器IP:/www/wwwroot/你的域名/
```

### 7.2 添加部署脚本

在 `package.json` 的 `scripts` 中添加：

```json
"deploy": "hexo clean && hexo g && rsync -av --delete 你的博客public目录/ ubuntu@你的服务器IP:/www/wwwroot/你的域名/"
```

之后运行：

```bash
npm run deploy
```

---

## 第八部分：SSL 证书

### 8.1 宝塔面板申请

1. 登录宝塔面板
2. 进入「网站」-「设置」
3. 点击「SSL」-「Let's Encrypt」
4. 选择域名，点击「申请」

### 8.2 手动申请

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 申请证书
sudo certbot certonly --standalone -d 你的域名.com
```

---

## 第九部分：GitHub 备份

### 9.1 创建仓库

在 GitHub 创建新仓库（如 `my-blog`）

### 9.2 上传源码

```bash
cd 你的博客目录
git init
git remote add origin https://github.com/你的用户名/你的仓库.git

# 添加 .gitignore
echo "node_modules/
public/
.db8/
.deploy*/" > .gitignore

git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## 第十部分：日常维护

### 10.1 常用命令

```bash
hexo s      # 本地预览
hexo g      # 生成静态文件
npm run deploy  # 部署到服务器
```

### 10.2 更新

```bash
# 更新主题（进入主题目录拉取最新代码）
cd themes/butterfly && git pull

# 更新项目本地 Hexo 版本（推荐）
npm update hexo

# 如需更新全局 Hexo CLI（通常不需要）
npm update -g hexo
```

---

## 常见问题

### Q1: 访问网站显示 403/404？
- 检查 `/www/wwwroot/` 目录是否有文件
- 检查 Nginx `root` 路径

### Q2: SSL 申请失败？
- 确保域名已解析到服务器 IP
- 检查 80 和 443 端口是否开放

### Q3: 图片无法加载？
- 检查图片路径（区分大小写）
- 图片应在 `source/` 目录下

---

## 需要填写的配置汇总

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| **服务器IP** | 云服务器公网IP | 你的服务器IP |
| **域名** | 注册的域名 | yourdomain.com |
| **服务器用户名** | SSH登录用户名 | ubuntu |
| **博客名称** | 网站标题 | My Blog |
| **博客作者** | 作者昵称 | 你的名字 |
| **GitHub用户名** | GitHub账号 | yourname |
| **GitHub仓库** | 用于评论的仓库 | yourname/blog-comments |
| **Giscus repo_id** | 仓库ID | R_kgDOxxxxx |
| **Giscus category_id** | 分类ID | DIC_kwDOxxxxx |
| **首页横幅图** | 首页顶部图片路径 | /img/first.jpg |
| **座右铭** | 首页显示的格言 | "Your motto here" |

---

> 博客地址：https://aitechflow.cn