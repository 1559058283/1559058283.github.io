# aitechflow.cn 维护手册

这份文档是给后续维护人员和 AI 的交接说明。执行任何修改前，先完整阅读本文，再检查仓库和线上状态；不要只根据历史记录直接操作。

## 1. 当前架构

| 项目 | 当前配置 |
| --- | --- |
| 生产网站 | <https://aitechflow.cn> |
| `www` 地址 | <https://www.aitechflow.cn>，自动跳转到主域名 |
| Hexo 源码仓库 | <https://github.com/1559058283/blog>，`main` 分支 |
| 生产发布仓库 | <https://github.com/1559058283/1559058283.github.io>，`main` 分支 |
| GitHub Pages 发布目录 | 生产发布仓库根目录 `/` |
| 站点生成器 | Hexo 6.3.0 |
| 主题 | Butterfly 5.5.5-b1 |
| 评论仓库 | `1559058283/aitechflow-comments` |

网站已从腾讯云服务器迁移到 GitHub Pages。域名访问、静态文件发布和 HTTPS 均由 GitHub Pages 提供，不再依赖旧服务器上的 Nginx 或网站目录。

正常维护链路是：在 `blog` 仓库修改 Markdown、配置或主题，生成 `public/`，检查后把生成结果发布到 `1559058283.github.io`。两个仓库用途不同，当前都不能删除。

## 2. 必须先理解的仓库分工

`blog` 是完整的 Hexo 工程，包含 `package.json`、站点和 Butterfly 配置、`source/` 文章原稿以及主题源码。它不是可删除的旧备份，而是网站内容的事实来源。

`1559058283.github.io` 只有生成后的 HTML、CSS、JavaScript、图片、XML 和站点地图；它负责当前线上发布，不应当作为文章和主题的长期编辑位置。

当前还有一个自动化缺口：`blog/.github/workflows/deploy.yml` 只把生成结果推到 **`blog` 仓库自己的 `gh-pages` 分支**，不会更新生产仓库 `1559058283.github.io`。在工作流改造完成前，不能把“推送 `blog/main` 成功”当作生产网站已经更新。

## 3. 不能删除或泄露的内容

- 生产仓库的 `CNAME`：内容必须是 `aitechflow.cn`。删除或改错会导致自定义域名失效。
- 生产仓库的 `.nojekyll`：让 GitHub Pages 原样发布当前静态文件。
- `blog` 源码仓库：它保存文章原稿、配置和主题源码。
- 现有 URL 和资源目录结构：页面使用根路径链接，随意移动会造成 404。

仓库中禁止提交 SSH 私钥、GitHub Token、腾讯云凭据、密码、Cookie、服务器配置备份或任何其他秘密。

## 4. 日常维护流程

文章、导航、样式、图片和主题配置都优先在源码仓库修改：

```bash
git clone https://github.com/1559058283/blog.git
cd blog
git pull --ff-only
git status --short --branch
npm ci
(cd themes/hexo-theme-butterfly && npm install)
npx hexo clean
npx hexo generate
npx hexo server
```

访问 <http://127.0.0.1:4000/>，至少检查首页、修改过的页面、图片、导航、移动端布局和浏览器控制台。确认无误后，提交源码仓库：

```bash
git diff --check
git status --short
git diff
git add <本次修改的源文件>
git commit -m "说明本次修改"
git push origin main
```

在自动发布链路改造完成前，还要把生成后的 `public/` 发布到 `1559058283.github.io` 的 `main` 根目录。发布时遵守以下规则：

1. 保留生产仓库的 `.git/`、`README.md`、`CNAME` 和 `.nojekyll`。
2. 生成文件可能大量变化，发布前必须检查完整差异，避免误删页面或静态资源。
3. 在生产仓库提交并推送 `main` 后，等待 GitHub Pages 构建完成并做线上验证。
4. 不要再把文件同步到旧云服务器。

只有生产故障需要立即热修复时，才直接编辑生成后的 HTML 或 CSS；随后必须把同一修复补回 `blog` 源码，否则下次生成会覆盖它。

## 5. 新增文章或全站改版

不要直接拼接生成后的 HTML。推荐流程：

1. 在 `blog` 仓库修改 `source/`、`_config.yml`、`_config.butterfly.yml` 或主题源码。
2. 本地生成并预览。
3. 对比生成结果与当前网站，确认 URL、导航、评论、SEO、RSS、搜索和站点地图正常。
4. 先提交源码，再将 `public/` 发布到生产仓库，同时保留正确的 `README.md`、`CNAME` 和 `.nojekyll`。
5. 审查生产仓库完整差异，提交并推送，等待 Pages 发布后做线上验证。

长期建议把 `blog` 的工作流改为自动更新生产仓库，或把自定义域名完整迁移到 `blog` 自己的 Pages。完成切换并验证前，不要删除任一仓库。

## 6. GitHub Pages 与 DNS

GitHub Pages 当前使用：

- 自定义域名：`aitechflow.cn`
- Pages 来源：`1559058283.github.io` 的 `main` 分支根目录
- HTTPS：已启用并强制跳转

DNS 由 DNSPod 管理，迁移时设置的记录为：

| 主机记录 | 类型 | 记录值 | TTL |
| --- | --- | --- | --- |
| `@` | `A` | `185.199.108.153` | `600` |
| `@` | `A` | `185.199.109.153` | `600` |
| `www` | `CNAME` | `1559058283.github.io` | `600` |

DNSPod 免费版对相同主机记录的负载均衡条数有限制，所以根域名保留了两条 GitHub Pages A 记录。除非任务明确要求修改域名，否则不要改 DNS。修改前必须重新查询当前记录，修改后要等待缓存传播并检查 HTTPS 证书状态。

## 7. 发布后验证

先查看 GitHub Pages 状态：

```bash
gh api repos/1559058283/1559058283.github.io/pages \
  --jq '{status,cname,html_url,https_enforced,https_certificate}'

gh api repos/1559058283/1559058283.github.io/pages/health
```

再检查线上请求：

```bash
curl -sSIL https://aitechflow.cn/
curl -sSIL https://www.aitechflow.cn/
curl -fsS -o /dev/null -w '%{http_code}\n' \
  https://aitechflow.cn/2026/04/20/blog-build-guide/
```

期望结果：

- `https://aitechflow.cn/` 返回 `200`，响应头包含 `server: GitHub.com`。
- HTTP 自动跳转到 HTTPS。
- `www` 自动跳转到主域名。
- Pages 状态为 `built`。
- `https_enforced` 为 `true`，证书状态为 `approved`。
- 修改过的页面和资源均无 404。

## 8. 回滚

发现线上问题时，优先使用 Git 回滚，不要强制推送，也不要直接重置远端 `main`：

```bash
git log --oneline --decorate -10
git revert <有问题的提交>
git push origin main
```

如果一次发布同时修改了源码仓库和生产仓库，应分别回滚对应提交。等待 GitHub Pages 重新发布后，再检查首页、问题页面、`www` 跳转和 HTTPS。

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

1. 拉取两个仓库的最新分支，检查工作区和最近提交。
2. 默认在 `blog` 源码仓库修改；只有生产故障热修复时才直接改生成文件。
3. 做最小范围修改，并展示可审查的差异。
4. 在源码仓库生成并本地预览，检查受影响页面。
5. 提交源码，再把同一生成结果发布到生产仓库。
6. 确认 `README.md`、`CNAME`、`.nojekyll` 和公开仓库安全边界未被破坏。
7. 等待 GitHub Pages 构建完成。
8. 验证主域名、`www`、HTTPS 和受影响页面。
9. 向用户报告两个仓库的提交哈希、部署状态、验证结果和仍存在的限制。

如果现状和本文冲突，以实时检查结果为准，并在同一提交中更新本文。

## 11. 官方参考

- [GitHub Pages 自定义域名配置](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub Pages HTTPS 配置与故障排查](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [DNSPod 负载均衡条数说明](https://docs.dnspod.cn/dns/other-faqs/)
