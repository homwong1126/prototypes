# 发布流程（源码推送 + 公网发布）

> 仓库：https://github.com/homwong1126/prototypes
> 源码分支：`feature-prototype` ｜ 静态分支：`gh-pages`（纯构建产物，可强制覆盖）
> 公网地址：https://homwong1126.github.io/prototypes/

## 标准发布三步

```bash
# 1. 提交源码并推送（首次需 -u 绑定上游）
git add -A
git commit -m "<本次改动说明>"
git push -u origin feature-prototype   # 之后直接 git push 即可

# 2. 只构建不推送，先检查产物（可选但推荐）
npm run deploy:check
# 确认 dist/prototypes/<name>.html 已生成

# 3. 构建 + 发布到 GitHub Pages
npm run deploy
```

发布后访问：

- 总览：https://homwong1126.github.io/prototypes/
- 单页：https://homwong1126.github.io/prototypes/prototypes/<name>.html
  - 例：https://homwong1126.github.io/prototypes/prototypes/market-plan-manage.html

## 首次发布：开启 GitHub Pages（只需做一次）

⚠️ 注意有两个 Pages 入口，别进错：

- ❌ 头像 → Settings → Pages：这是账号级的 Verified domains，不管发布
- ✅ **仓库主页 → Settings（仓库顶部导航）→ 左侧 Code and automation → Pages**

进去后：

1. Build and deployment → Source 选 **Deploy from a branch**
2. Branch 选 **gh-pages**，目录选 **/ (root)**，Save
3. 等 1~2 分钟，顶部出现 `Your site is live at …` 即生效

## 常见问题

### 1. `npm run deploy` 推送 gh-pages 被拒（non-fast-forward）

远端 `gh-pages` 有旧提交时会出现。`gh-pages` 是纯构建产物分支，直接强制覆盖：

```bash
npm run deploy:force   # = npm run deploy -- --force
```

### 2. `git push` 被 Secret Scanning 拦截（GH013）

报错形如 `Push cannot contain secrets … unblock-secret/xxx`，说明历史提交里带了明文 token
（如 `.axhub/make/axhub.config.json` 中的 Vercel token）。

- 快速放行：打开报错信息里的 `unblock-secret/…` 链接点 Allow，再重新 push
- 彻底做法：去对应平台（Vercel 等）**吊销/轮换该 token**（它曾以明文进过 git 历史）
- 预防：含 token 的本地配置文件不要 `git add` 进仓库，用 `.gitignore` 隔离

### 3. 连不上 github.com（443 超时）

先自查本机网络 / 代理 / VPN，能打开 github.com 再重试。push 和 deploy 的推送步骤都会 hang 住，
卡住时可 `pkill -f "git push"` 清理后重试。

## 脚本说明（scripts/deploy-gh-pages.mjs）

- 只构建 `src/prototypes`，跳过 themes
- `vite build --base=/prototypes/`：子路径部署，避免 `/assets` 404
- `dist/.nojekyll`：防止 Pages 忽略下划线开头文件
- `prototypes/<name>.html` 内脚本路径为同目录 `<name>.js`

| 命令 | 行为 |
| --- | --- |
| `npm run deploy` | 全量构建 + 推送 `origin/gh-pages` |
| `npm run deploy:check` | 只构建 + 生成 dist，不推送 |
| `npm run deploy:force` | 构建 + 强制覆盖远端 `gh-pages` |

## 新增原型后

1. 在 `src/prototypes/<your-name>/index.tsx` 建好页面
2. 本地 `npm run dev` 验证
3. 按「标准发布三步」走：commit → push → deploy
