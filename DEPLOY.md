# 一键发布到 GitHub Pages

## 常用命令

```bash
# 发布全部原型（构建 + 推送 gh-pages）
npm run deploy

# 只构建 + 生成 dist，不推送（用于检查）
npm run deploy:check

# 远端 gh-pages 有历史冲突时强制覆盖
npm run deploy:force
```

发布后访问：

- 总览: https://homwong1126.github.io/prototypes/
- 单页: https://homwong1126.github.io/prototypes/prototypes/<name>.html

## 已内置的关键修复

- 只构建 `src/prototypes`，跳过 themes（速度快）
- `vite build --base=/prototypes/`：GitHub Pages 仓库子路径下 `/assets/logo.jpg` 才能正确加载
- `dist/.nojekyll`：防止 GitHub Pages 忽略下划线开头的文件
- `prototypes/<name>.html` 内脚本路径是同目录 `<name>.js`（而不是 `prototypes/<name>.js`）

## 新增原型后

1. 在 `src/prototypes/<your-name>/index.tsx` 建好页面
2. 本地 `npm run dev` 验证
3. `npm run deploy`
