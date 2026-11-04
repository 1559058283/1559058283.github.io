# 个人博客部署完整指南

> 历史参考：本站现已改用 GitHub Actions 和 GitHub Pages 自动发布。当前维护与发布方式以根目录 `README.md` 为准，不要再把 `public/` 同步到旧服务器。

> 基于 Hexo + Butterfly 主题的博客搭建流程

---

## 目录
- [一、前置条件](#一前置条件)
- [二、云服务器购买与配置](#二云服务器购买与配置)
- [三、域名购买与备案](#三域名购买与备案)
- [四、服务器环境配置](#四服务器环境配置)
- [五、本地开发环境搭建](#五本地开发环境搭建)
- [六、创建 Hexo 博客](#六创建-hexo-博客)
- [七、安装 Butterfly 主题](#七安装-butterfly-主题)
- [八、主题个性化配置](#八主题个性化配置)
- [九、部署到服务器](#九部署到服务器)
- [十、常见问题](#十常见问题)

---

## 一、前置条件

### 1.1 需要准备的账号
- 腾讯云账号（购买服务器和域名）
- GitHub 账号（用于 Giscus 评论）

### 1.2 本地电脑要求
| 工具 | 说明 | 安装方法 |
|------|------|----------|
| Node.js | JavaScript 运行时 | 官网下载或 `nvm` 安装 |
| npm | Node.js 包管理器 | 随 Node.js 一起安装 |
| git | 版本控制工具 | `sudo apt install git` |
| SSH | 远程连接工具 | 操作系统自带 |

### 1.3 验证安装
```bash
node -v    # 应显示 v18.x 或更高
npm -v     # 应显示 8.x 或更高
git --version
```

---

## 二、云服务器购买与配置

### 2.1 购买腾讯云服务器

1. 访问 [腾讯云官网](https://cloud.tencent.com/) 并登录
2. 进入 **云服务器 CVM** 购买页面
3. 选择配置：
   - **地域**：选择离你最近的（如广州、上海）
   - **Instance Type**：标准型 S5 / SA2
   - **CPU/内存**：2核 4GB 起
   - **系统盘**：50GB SSD 云硬盘
   - **带宽**：5Mbps 或更高
   - **操作系统**：Ubuntu 20.04 LTS 64位 或 Ubuntu 22.04 LTS
4. 完成支付

### 2.2 记录服务器信息
购买成功后记录：
- **公网 IP**：如 `1.14.94.166`
- **登录密码** 或 **SSH 密钥**
- **用户名**：`ubuntu`（Ubuntu 系统默认）

### 2.3 安全组配置
1. 进入云服务器控制台
2. 点击对应实例的 **安全组**
3. 添加规则（入站规则）：
   | 协议 | 端口 | 来源 | 说明 |
   |------|------|------|------|
   | TCP | 22 | 0.0.0.0/0 | SSH |
   | TCP | 80 | 0.0.0.0/0 | HTTP |
   | TCP | 443 | 0.0.0.0/0 | HTTPS |

---

## 三、域名购买与备案

### 3.1 购买域名

1. 进入腾讯云 **域名注册**
2. 搜索想要注册的域名（如 `example.com`）
3. 选择域名后完成购买和实名认证

### 3.2 域名备案（必须！）

**为什么需要备案？**
- 中国大陆服务器且使用国内域名解析，必须备案
- 约 2-3 周完成

**备案流程：**
1. 登录 [腾讯云备案系统](https://cloud.tencent.com/beian)
2. 填写备案信息：
   - 主体信息（个人/企业）
   - 网站信息（域名、网站名称等）
3. 上传资料：
   - 身份证正反面照片
   - 域名证书
   - 网站备案信息表（需签字）
4. 腾讯云初审（约 1-2 工作日）
5. 短信验证码确认
6. 管局审核（约 7-20 工作日）

### 3.3 DNS 解析

1. 进入域名管理控制台
2. 添加解析记录：
   - **主机记录**：`@` → **记录值**：服务器IP
   - **主机记录**：`www` → **记录值**：服务器IP
3. 等待生效（几分钟到几小时）

---

## 四、服务器环境配置

### 4.1 SSH 连接服务器

```bash
# 方式一：使用密钥（推荐）
ssh -o StrictHostKeyChecking=no -i ~/.ssh/你的私钥 ubuntu@服务器IP

# 方式二：使用密码
ssh ubuntu@服务器IP
```

### 4.2 安装基础软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Nginx
sudo apt install nginx -y

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v
systemctl status nginx
```

### 4.3 安装宝塔面板（推荐）

宝塔面板可以让网站管理更简单：

```bash
# 安装宝塔面板（Ubuntu）
sudo apt install -y wget && wget -O install.sh http://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh
```

安装完成后：
1. 面板会显示登录地址（如 `http://1.14.94.166:8888/xxx`）
2. 记录用户名和密码
3. 登录后安装 **Nginx** 环境

### 4.4 创建网站目录

通过宝塔面板或命令行：

```bash
# 创建网站目录
sudo mkdir -p /www/wwwroot/aitechflow.cn

# 设置权限（如果是 ubuntu 用户）
sudo chown -R ubuntu:ubuntu /www/wwwroot/aitechflow.cn
```

### 4.5 配置 SSL 证书（推荐）

**方式一：宝塔面板申请（推荐）**
1. 登录宝塔面板
2. 网站 → 添加站点
3. 勾选 **Let's Encrypt** 免费 SSL 证书

**方式二：手动申请 certbot**
```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx -y

# 申请证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期测试
sudo certbot renew --dry-run
```

---

## 五、本地开发环境搭建

### 5.1 安装 Node.js

**方式一：直接安装（Ubuntu/macOS）**
```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证
node -v
npm -v
```

**方式二：使用 nvm（推荐）**
```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端后
nvm install 18
nvm use 18

# 验证
node -v
```

### 5.2 安装 Git

```bash
# Ubuntu
sudo apt install git -y

# macOS
brew install git

# 验证
git --version
```

### 5.3 配置 SSH 密钥（可选）

```bash
# 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 将公钥添加到 GitHub（复制上面的输出）
# 访问 https://github.com/settings/keys 添加
```

---

## 六、创建 Hexo 博客

### 6.1 初始化项目

```bash
# 创建项目目录
mkdir blog-project
cd blog-project

# 初始化 npm
npm init -y

# 安装 Hexo
npm install hexo
npm install hexo-cli

# 在 package.json 中添加 hexo 配置（使 npx hexo 可用）
# 这一步通过修改 package.json 实现
```

编辑 `package.json`，添加：
```json
{
  "name": "blog-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "hexo server",
    "build": "hexo g",
    "clean": "hexo clean"
  },
  "hexo": {}
}
```

### 6.2 初始化 Hexo 博客结构

```bash
npx hexo init

# 安装依赖
npm install
```

这会创建：
```
blog-project/
├── _config.yml      # 博客配置
├── source/          # 源文件目录
│   └── _posts/     # 文章目录
├── scaffolds/       # 模板
├── themes/         # 主题目录
├── public/         # 生成的静态文件
├── node_modules/   # 依赖
└── package.json
```

### 6.3 基础配置

编辑 `_config.yml`：

```yaml
# Site
title: 你的博客标题
subtitle: 副标题
description: 描述信息
keywords:
author: 你的名字
language: zh-CN
timezone: Asia/Shanghai

# URL
url: https://你的域名.com
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:

# Directory
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories

# Writing
post_asset_folder: false
relative_link: false

# Category & Tag
default_category: uncategorized

# Date / Time format
date_format: YYYY-MM-DD
time_format: HH:mm:ss

# Pagination
per_page: 10
pagination_dir: page

# Theme
theme: hexo-theme-butterfly

# Deployment
deploy:
  type: ''
```

### 6.4 创建第一篇文章

```bash
# 创建文章
npx hexo new "我的第一篇文章"

# 编辑文章
# 文件位置: source/_posts/我的第一篇文章.md
```

文章模板：
```markdown
---
title: 我的第一篇文章
date: 2026-04-20 12:00:00
categories:
  - 技术
tags:
  - Hexo
  - 博客
---

在这里写文章内容...

## 二级标题

正文内容...
```

---

## 七、安装 Butterfly 主题

### 7.1 下载主题

```bash
cd blog-project/themes

# 使用镜像下载（GitHub 被墙时）
git clone https://ghfast.top/https://github.com/jerryc127/hexo-theme-butterfly.git
```

### 7.2 安装渲染依赖

Butterfly 需要 pug、sass、stylus 渲染器：

```bash
cd blog-project

# 安装必须的渲染器
npm install hexo-renderer-pug --save
npm install hexo-renderer-sass --save
npm install hexo-renderer-stylus --save
```

### 7.3 启用主题

修改 `_config.yml`：
```yaml
theme: hexo-theme-butterfly
```

### 7.4 配置主题

复制主题配置文件：
```bash
cp themes/hexo-theme-butterfly/_config.yml _config.butterfly.yml
```

然后编辑 `_config.butterfly.yml` 进行自定义配置。

---

## 八、主题个性化配置

### 8.1 准备图片资源

在 `blog-project/source/` 目录下创建 `img/` 文件夹，放入以下图片：

| 文件名 | 说明 | 推荐尺寸 |
|--------|------|----------|
| avatar.jpg | 头像 | 200x200 圆形 |
| favicon.ico | 网站图标 | 32x32, 64x64 |
| butterfly-icon.png | 浏览器标题图标 | 512x512 |
| cover.jpg | 侧边栏背景 | 800x600 |

```bash
mkdir -p blog-project/source/img
# 将图片放入此目录
```

### 8.2 配置文件说明

编辑 `_config.butterfly.yml`：

```yaml
# 导航栏
nav:
  logo: /img/logo.png
  display_title: true
  display_post_title: true

menu:
  Home: / || fas fa-home
  Archives: /archives/ || fas fa-archive
  Tags: /tags/ || fas fa-tags
  Categories: /categories/ || fas fa-folder

# 社交链接
social:
  fas fa-github: https://github.com/你的用户名 || GitHub
  fas fa-envelope: mailto:你的邮箱 || Email

# 头像
avatar:
  img: /img/avatar.jpg
  effect: true

# 背景颜色
background: '#fafafa'

# 主题色
theme_color: '#3b70fc'
```

### 8.3 配置 Giscus 评论

1. 打开 https://giscus.app
2. 登录 GitHub
3. 选择用于评论的 **Repository**（需要是 public 仓库）
4. 启用 **Discussions** 功能
5. 复制生成的配置：

```yaml
comments:
  enable: true
  type: giscus
  repo: 你的用户名/仓库名
  repo_id: R_kgDxxxxxxxx
  category: Announcements
  category_id: DIC_kwDxxxxxxxx
  mapping: pathname
```

### 8.4 本地预览

```bash
# 启动本地服务器
npx hexo server

# 或简写
npx hexo s

# 访问 http://localhost:4000 查看效果
```

---

## 九、部署到服务器

### 9.1 生成静态文件

```bash
# 清理缓存并生成
npx hexo clean
npx hexo g
```

生成的静态文件在 `public/` 目录。

### 9.2 使用 rsync 部署

#### 9.2.1 配置 SSH 密钥登录

1. 本地生成密钥对（如未生成）：
```bash
ssh-keygen -t rsa -b 4096
```

2. 将私钥保存到 `~/.ssh/id_rsa_blog`

3. 设置权限：
```bash
chmod 600 ~/.ssh/id_rsa_blog
```

4. 将公钥添加到服务器：
```bash
# 本地执行
ssh-copy-id -i ~/.ssh/id_rsa_blog.pub ubuntu@服务器IP

# 或者手动复制公钥内容到服务器的 ~/.ssh/authorized_keys
```

#### 9.2.2 测试连接

```bash
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa_blog ubuntu@服务器IP "echo connected"
```

#### 9.2.3 部署命令

```bash
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa_blog" \
  public/ \
  ubuntu@服务器IP:/www/wwwroot/你的域名/
```

### 9.3 使用宝塔面板上传

1. 本地打包：
```bash
tar -czvf blog.tar.gz public/
```

2. 登录宝塔面板
3. 文件 → 上传 blog.tar.gz
4. 解压到网站目录

### 9.4 自动化部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "开始部署..."

# 清理并生成
npx hexo clean
npx hexo g

# 同步到服务器
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa_blog" \
  public/ \
  ubuntu@服务器IP:/www/wwwroot/你的域名/

echo "部署完成！"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 十、常见问题

### Q1：GitHub 下载失败
**A**：使用镜像地址：
```bash
git clone https://ghfast.top/https://github.com/xxx/xxx.git
```

### Q2：Hexo 命令找不到
**A**：
1. 在 `package.json` 中添加 `"hexo": {}`
2. 使用 `npx hexo` 代替 `hexo`

### Q3：SSH 连接超时
**A**：
1. 检查服务器安全组是否开放 22 端口
2. 检查 SSH 服务是否正常运行：`sudo systemctl status ssh`

### Q4：主题样式不显示
**A**：确保安装了所有渲染器：
```bash
npm install hexo-renderer-pug --save
npm install hexo-renderer-sass --save
npm install hexo-renderer-stylus --save
```

然后重新生成：
```bash
npx hexo clean
npx hexo g
```

### Q5：网站无法访问
**A**：检查：
1. Nginx 是否启动：`sudo systemctl status nginx`
2. 网站目录路径是否正确
3. 域名 DNS 是否解析成功
4. 防火墙是否放行：`sudo ufw allow 80,443/tcp`

### Q6：部署后样式错乱
**A**：
1. 清除浏览器缓存（Ctrl+Shift+R）
2. 重新生成：`npx hexo clean && npx hexo g`
3. 重新部署

### Q7：Giscus 评论不显示
**A**：
1. 检查 repo 是否启用 Discussions
2. 检查 repo_id 和 category_id 是否正确
3. 查看浏览器控制台错误信息

---

## 相关命令速查

```bash
# 启动本地预览
npx hexo server

# 生成静态文件
npx hexo g

# 清理缓存
npx hexo clean

# 新建文章
npx hexo new "文章标题"

# 新建草稿
npx hexo new draft "草稿标题"

# 发布草稿
npx hexo publish "草稿标题"

# 部署
rsync -avz --delete -e "ssh -i ~/.ssh/id_rsa_blog" public/ ubuntu@IP:/www/wwwroot/domain/
```

---

> 有任何问题请随时提问！
