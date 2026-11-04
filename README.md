# aitechflow.cn

[aitechflow.cn](https://aitechflow.cn) 的完整 Hexo 源码。推送到 `main` 后，GitHub Actions 会生成静态文件并发布到 GitHub Pages。

## 本地开发

需要 Node.js 22：

```bash
npm ci
npm install --prefix themes/hexo-theme-butterfly --no-package-lock
npm run dev
```

访问 <http://localhost:4000> 预览。

构建生产文件：

```bash
npm run build
```

输出目录为 `public/`，该目录由 GitHub Actions 生成，不提交到仓库。

## 内容位置

- 文章：`source/_posts/`
- 独立页面：`source/about/`、`source/projects/` 等
- 站点配置：`_config.yml`
- Butterfly 配置：`_config.butterfly.yml`
- 自定义样式：`source/custom.css`
- 主题源码：`themes/hexo-theme-butterfly/`

## 发布

根目录的 [Pages 工作流](.github/workflows/deploy.yml) 负责安装依赖、执行 Hexo 构建并发布 `public/`。自定义域名由 GitHub Pages 设置和 `source/CNAME` 共同保留。

发布后检查：

- <https://aitechflow.cn>
- <https://www.aitechflow.cn>
- <https://aitechflow.cn/2026/04/20/blog-build-guide/>

迁移前的静态成品保存在 Git 标签 `pre-hexo-source-migration-2026-11-04`，需要回滚时可从该标签恢复。

禁止提交 SSH 私钥、GitHub Token、服务器凭据、Cookie 或其他秘密。
