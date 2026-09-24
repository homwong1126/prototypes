#!/usr/bin/env node
/**
 * 生成 Vercel 部署所需的 HTML 页面
 *
 * 构建产物 dist/ 中只有 .js 文件，没有 HTML 页面。
 * 本脚本为每个构建的 JS 入口生成对应的 HTML 包装页面，
 * 并生成一个导航首页，以便在 Vercel 上直接访问。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(projectRoot, 'dist');
const entriesPath = path.resolve(projectRoot, '.axhub/make/entries.json');

// React CDN 版本
const REACT_CDN_URL = 'https://unpkg.com/react@18.2.0/umd/react.production.min.js';
const REACT_DOM_CDN_URL = 'https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js';

function readEntries() {
  if (!fs.existsSync(entriesPath)) {
    console.error('未找到 entries.json，请先运行 pnpm build');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
}

function getPrototypeName(entry) {
  return entry.name;
}

function humanReadableName(name) {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function generateLandingPage(prototypeEntries) {
  const items = prototypeEntries.map(([key, entry]) => {
    const name = getPrototypeName(entry);
    const label = humanReadableName(name);
    const hasJs = fs.existsSync(path.join(distDir, 'prototypes', `${name}.js`));
    // 检查是否有独立 HTML 入口
    const srcHtml = path.join(projectRoot, 'src', entry.group, entry.name, 'index.html');
    const hasStandaloneHtml = fs.existsSync(srcHtml) && !hasJs;
    return { name, label, hasJs, hasStandaloneHtml };
  });

  const cards = items.map(({ name, label, hasJs, hasStandaloneHtml }) => {
    const href = hasJs ? `prototypes/${name}.html` : (hasStandaloneHtml ? `prototypes/${name}/` : null);
    if (!href) return '';
    return `
    <a class="card" href="${href}">
      <div class="card-icon">${label.charAt(0).toUpperCase()}</div>
      <div class="card-content">
        <div class="card-title">${label}</div>
        <div class="card-subtitle">${name}</div>
      </div>
      <span class="card-arrow">→</span>
    </a>`;
  }).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Axhub Make Prototypes</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      background: #f0f2f5;
      color: #1a1a2e;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      color: white;
      padding: 48px 24px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 15px;
      opacity: 0.8;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e8e8e8;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
    .card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: white;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      padding: 16px;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s ease;
    }
    .card:hover {
      border-color: #0f3460;
      box-shadow: 0 4px 12px rgba(15, 52, 96, 0.12);
      transform: translateY(-1px);
    }
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0f3460, #533483);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .card-content {
      flex: 1;
      min-width: 0;
    }
    .card-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.4;
    }
    .card-subtitle {
      font-size: 12px;
      color: #888;
      margin-top: 2px;
    }
    .card-arrow {
      color: #ccc;
      font-size: 18px;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .card:hover .card-arrow {
      transform: translateX(3px);
      color: #0f3460;
    }
    @media (max-width: 640px) {
      .header { padding: 32px 16px; }
      .header h1 { font-size: 22px; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Axhub Make Prototypes</h1>
    <p>交互原型 · 设计系统 · 可运行演示</p>
  </header>
  <div class="container">
    <div class="section-title">原型列表</div>
    <div class="grid">
      ${cards}
    </div>
  </div>
</body>
</html>`;
}

function generatePrototypeHtml(name, displayName) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} - Axhub Make Prototype</title>
  <style>
    html, body, #root {
      min-height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <script>
    window.__AXHUB_DEFINE_COMPONENT__ = function(Component) {
      var rootElement = document.getElementById('root');
      if (!rootElement) return;
      var root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(Component, {
        container: rootElement,
        config: {},
        data: {},
        events: {}
      }));
    };
  </script>
  <script crossorigin src="${REACT_CDN_URL}"></script>
  <script crossorigin src="${REACT_DOM_CDN_URL}"></script>
  <script src="${name}.js"></script>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('dist 目录不存在，请先运行 pnpm build');
    process.exit(1);
  }

  const entries = readEntries();
  const items = entries.items || {};
  const prototypeEntries = Object.entries(items).filter(([, entry]) => entry.group === 'prototypes');
  const themeEntries = Object.entries(items).filter(([, entry]) => entry.group === 'themes');

  // 1. 生成导航首页
  const landingPage = generateLandingPage(prototypeEntries);
  const indexPath = path.join(distDir, 'index.html');
  fs.writeFileSync(indexPath, landingPage, 'utf8');
  console.log(`✓ 生成首页: ${indexPath}`);

  // 2. 为每个 JS 条目生成 HTML 包装页
  let generatedCount = 0;
  for (const [key, entry] of prototypeEntries) {
    const name = getPrototypeName(entry);
    const jsPath = path.join(distDir, 'prototypes', `${name}.js`);

    // 只处理有 JS 构建产物的条目
    if (fs.existsSync(jsPath)) {
      const displayName = humanReadableName(name);
      const html = generatePrototypeHtml(name, displayName);
      const htmlPath = path.join(distDir, 'prototypes', `${name}.html`);
      fs.writeFileSync(htmlPath, html, 'utf8');
      generatedCount++;
      console.log(`  ✓ 生成原型页面: ${name}.html`);
    }
  }

  // 3. 处理独立 HTML 条目（如 ai-complete 等 Axure 导出页面）
  let copiedCount = 0;
  for (const [key, entry] of prototypeEntries) {
    const name = getPrototypeName(entry);
    // 跳过已经有 JS 构建产物的
    const jsPath = path.join(distDir, 'prototypes', `${name}.js`);
    if (fs.existsSync(jsPath)) continue;

    // 检查是否有独立 HTML 文件
    const srcHtml = path.join(projectRoot, 'src', entry.group, entry.name, 'index.html');
    if (fs.existsSync(srcHtml)) {
      const targetDir = path.join(distDir, 'prototypes', name);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.cpSync(srcHtml, path.join(targetDir, 'index.html'), { recursive: true });
      // 复制 assets 目录
      const srcAssets = path.join(projectRoot, 'src', entry.group, entry.name, 'assets');
      if (fs.existsSync(srcAssets)) {
        const targetAssets = path.join(targetDir, 'assets');
        fs.cpSync(srcAssets, targetAssets, { recursive: true });
      }
      copiedCount++;
      console.log(`  ✓ 复制独立 HTML 页面: ${name}/index.html`);
    }
  }

  console.log(`\n✅ 完成！生成 ${generatedCount} 个原型页面，复制 ${copiedCount} 个独立 HTML 页面`);
  console.log(`   首页: ${indexPath}`);
}

main();