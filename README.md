# 个人作品集

GitHub 仓库：https://github.com/ussiiii/jiangyutong.github.io

## 项目状态

基础作品集是纯静态网站，首页和样式位于 `public/`。

## 开发与版本管理

- 默认分支：`main`。
- 修改后先检查差异并执行与改动相关的测试，再提交和推送。
- 保留现有内容，不擅自重命名仓库或覆盖远程历史。
- 密钥、访问令牌和本地环境变量不提交到仓库。

## 部署目标

最终使用 Cloudflare Workers 部署，提供 `workers.dev` 公开访问网址。
Workers Builds 使用 `main` 分支，根目录为 `/`，构建命令留空，部署命令为 `npx wrangler deploy`。Wrangler 从 `public/` 发布静态资源。
