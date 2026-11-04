# aitechflow.cn 维护手册

这份文档是给后续维护人员和 AI 的交接说明。执行任何修改前，先完整阅读本文，再检查仓库和线上状态；不要只根据历史记录直接操作。

## 1. 当前架构

| 项目 | 当前配置 |
| --- | --- |
| 生产网站 | <https://aitechflow.cn> |
| `www` 地址 | <https://www.aitechflow.cn>，自动跳转到主域名 |
| GitHub 仓库 | <https://github.com/1559058283/1559058283.github.io> |
| 发布分支 | `main` |
| GitHub Pages 发布目录 | 仓库根目录 `/` |
| 站点生成器 | Hexo 6.3.0 |
| 主题 | Butterfly 5.5.5-b1 |
| 评论仓库 | `1559058283/aitechflow-comments` |

网站已从腾讯云服务器迁移到 GitHub Pages。域名访问、静态文件发布和 HTTPS 均由 GitHub Pages 提供，不再依赖旧服务器上的 Nginx 或网站目录。

## 2. 必须先理解的限制

当前仓库只有 Hexo 生成后的 HTML、CSS、JavaScript、图片、XML 和站点地图，**没有原始 Hexo 工程**。以下源码文件目前不存在：

- `package.json`
- `_config.yml`
- `_config.butterfly.yml`
- `source/`
- `themes/`

因此：

- 修改少量文字、样式、图片或已有页面时，可以直接编辑静态文件。
- 新增文章、修改导航、标签、分类、归档、RSS、搜索索引或全站主题配置时，应先找回或重建 Hexo 源码工程，再重新生成整站。
- 不要在当前仓库里直接执行 `hexo generate`，也不要凭空创建一套配置覆盖现有网站。
- 直接修改文章 HTML 时，还要同步检查首页、归档、标签、分类、`search.xml`、`atom.xml`、`sitemap.xml` 和 `sitemap.txt`，否则不同页面的数据会不一致。

## 3. 不能删除的文件

- `CNAME`：内容必须是 `aitechflow.cn`。删除或改错会导致自定义域名失效。
- `.nojekyll`：让 GitHub Pages 原样发布当前静态文件。
- 现有目录结构：页面大量使用以 `/` 开头的绝对路径，随意移动文件会造成资源 404。

仓库是公开的。禁止提交 SSH 私钥、GitHub Token、腾讯云凭据、密码、Cookie、服务器配置备份或任何其他秘密。

## 4. 日常小改流程

适用于更换图片、调整 CSS、修正文案或修改一个已有页面。

```bash
git clone https://github.com/1559058283/1559058283.github.io.git
cd 1559058283.github.io
git pull --ff-only
git status --short --branch
```

修改时遵守以下规则：

1. 只改完成任务需要的文件。
2. 不要格式化或重写全部生成 HTML，以免产生无法审查的大型差异。
3. 图片尽量沿用原文件名和路径；需要新增时放入合适的 `img/` 子目录。
4. 修改公共结构或评论配置时，搜索所有生成页面，确认是否需要同步修改多处。
5. 保留 `CNAME` 和 `.nojekyll`。

本地预览：

```bash
python3 -m http.server 8000
```

然后访问 <http://127.0.0.1:8000/>。发布前至少检查首页、修改过的页面、图片、导航、移动端布局和浏览器控制台。

提交与发布：

```bash
git diff --check
git status --short
git diff
git add <本次修改的文件>
git commit -m "说明本次修改"
git push origin main
```

推送到 `main` 后，GitHub Pages 会自动构建和发布。不要再把文件同步到旧云服务器。

## 5. 新增文章或全站改版流程

这类任务不要直接拼接生成后的 HTML。推荐流程：

1. 先寻找原始 Hexo 源码备份；可能位于旧电脑、旧服务器、网盘或另一个 GitHub 仓库。
2. 如果确实找不到，在独立目录或独立私有仓库中重建 Hexo 6.3.0 与 Butterfly 5.5.5-b1 工程。
3. 从当前网站反向整理文章 Markdown、页面内容、图片和主题配置。
4. 本地执行 `npm ci`、`npx hexo clean`、`npx hexo generate` 和 `npx hexo server`。
5. 对比生成结果与当前网站，确认 URL、导航、评论、SEO、RSS、搜索和站点地图正常。
6. 将生成的 `public/` 内容发布到本仓库根目录，同时保留正确的 `CNAME` 和 `.nojekyll`。
7. 先审查完整差异，再提交和推送。

不要直接使用带 `--delete` 的同步命令覆盖仓库根目录，除非已经明确保护 `CNAME`、`.nojekyll` 和维护文档。

## 6. GitHub Pages 与 DNS

GitHub Pages 当前使用：

- 自定义域名：`aitechflow.cn`
- Pages 来源：`main` 分支的 `/`
- HTTPS：已启用并强制跳转

DNS 由 DNSPod 管理，当前记录为：

| 主机记录 | 类型 | 记录值 | TTL |
| --- | --- | --- | --- |
| `@` | `A` | `185.199.108.153` | `600` |
| `@` | `A` | `185.199.109.153` | `600` |
| `www` | `CNAME` | `1559058283.github.io` | `600` |

DNSPod 免费版对相同主机记录的负载均衡条数有限制，所以根域名保留了两条 GitHub Pages A 记录。GitHub Pages 支持根域名使用至少一条有效 A 记录。

除非任务明确要求修改域名，否则不要改 DNS。修改前必须重新查询当前记录，修改后要等待缓存传播并检查 HTTPS 证书状态。不要把根域名或 `www` 改回旧服务器地址。

## 7. 发布后验证

先查看 GitHub Pages 状态：

```bash
gh api repos/1559058283/1559058283.github.io/pages \
  --jq '{status,cname,html_url,https_enforced,https_certificate}'

gh api repos/1559058283/1559058283.github.io/pages/health
```

`pages/health` 第一次调用可能只启动异步检测并返回空结果；稍等片刻后再查询一次即可。

再检查线上请求：

```bash
curl -sSIL https://aitechflow.cn/
curl -sSIL https://www.aitechflow.cn/
curl -fsS -o /dev/null -w '%{http_code}\n' \
  https://aitechflow.cn/2026/04/20/blog-build-guide/
```

期望结果：

- `https://aitechflow.cn/` 返回 `200`，响应头包含 `server: GitHub.com`。
- `http://aitechflow.cn/` 跳转到 HTTPS。
- `https://www.aitechflow.cn/` 跳转到 `https://aitechflow.cn/`。
- GitHub Pages 状态为 `built`。
- `https_enforced` 为 `true`，证书状态为 `approved`。
- 修改过的页面和资源均无 404。

公网 DNS 可以通过 Google DNS over HTTPS 检查：

```bash
curl -sS 'https://dns.google/resolve?name=aitechflow.cn&type=A'
curl -sS 'https://dns.google/resolve?name=www.aitechflow.cn&type=CNAME'
```

## 8. 回滚

发现线上问题时，优先使用 Git 回滚，不要强制推送，也不要直接重置远端 `main`：

```bash
git log --oneline --decorate -10
git revert <有问题的提交>
git push origin main
```

等待 GitHub Pages 重新发布后，再检查首页、问题页面、`www` 跳转和 HTTPS。

## 9. 旧腾讯云服务器

网站已经不依赖旧服务器，但服务器上可能还有数据库、容器或其他应用。任何 AI 都不得因为网站已迁移就直接关机、重装、删除实例、清理目录或取消套餐。

如需停用服务器，必须单独完成：

1. 实时重新验证 SSH 授权和连接范围。
2. 清点正在运行的服务、端口、数据库、定时任务、Docker 容器和持久化数据。
3. 确认哪些服务仍在使用。
4. 完成必要的备份、迁移和恢复验证。
5. 获得用户对关机或销毁实例的明确确认。

不要把 SSH 私钥内容写进仓库、聊天总结或日志。

## 10. 交给 AI 的执行要求

每次维护时，AI 应按以下顺序工作：

1. 拉取最新 `main`，检查工作区和最近提交。
2. 确认任务属于“小改静态文件”还是“需要 Hexo 源码的全站修改”。
3. 做最小范围修改，并展示可审查的差异。
4. 本地预览并检查受影响页面。
5. 确认 `CNAME`、`.nojekyll` 和公开仓库安全边界未被破坏。
6. 提交并推送到 `main`。
7. 等待 GitHub Pages 构建完成。
8. 验证主域名、`www`、HTTPS 和受影响页面。
9. 向用户报告提交哈希、部署状态、验证结果和仍存在的限制。

如果现状和本文冲突，以实时检查结果为准，并在同一提交中更新本文。

## 11. 官方参考

- [GitHub Pages 自定义域名配置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages HTTPS 配置与故障排查](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [DNSPod 负载均衡条数说明](https://docs.dnspod.cn/dns/other-faqs/)
