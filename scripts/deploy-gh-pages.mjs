#!/usr/bin/env node
/**
 * 一键发布到 GitHub Pages（gh-pages 分支），无需 gh CLI。
 *
 * 用法：
 *   npm run deploy            # 发布所有原型（src/prototypes）
 *   npm run deploy -- --check # 只构建+生成 HTML，不推送
 *   npm run deploy -- --force # 覆盖远端 gh-pages
 *   npm run deploy -- --base /prototypes/  # 自定义子路径
 *
 * 行为：
 * 1. 只构建 src/prototypes 下的原型（跳过 themes，提升速度）
 * 2. vite 构建 base 默认 /prototypes/（GitHub Pages 子路径，避免 /assets 404）
 * 3. 生成 dist/index.html + dist/prototypes/*.html
 * 4. 用 dist 内容初始化 orphan gh-pages commit 并推送到 origin/gh-pages
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const hasFlag = (f) => args.includes(f);
const checkOnly = hasFlag('--check') || hasFlag('-c');
const force = hasFlag('--force') || hasFlag('-f');
const baseArgIdx = args.indexOf('--base');
const base = baseArgIdx >= 0 && args[baseArgIdx + 1] ? args[baseArgIdx + 1] : '/prototypes/';

const distDir = path.join(projectRoot, 'dist');
const entriesPath = path.join(projectRoot, '.axhub/make/entries.json');
const repoUrl = (() => {
  const r = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: projectRoot, encoding: 'utf8' });
  return r.stdout.trim() || 'https://github.com/homwong1126/prototypes.git';
})();

const log = (...m) => console.log('\x1b[36m[deploy]\x1b[0m', ...m);
const warn = (...m) => console.warn('\x1b[33m[deploy]\x1b[0m', ...m);
const fail = (msg) => { console.error('\x1b[31m[deploy]\x1b[0m', msg); process.exit(1); };

function run(cmd, opts = {}) {
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: opts.cwd || projectRoot,
    env: { ...process.env, ...opts.env },
    stdio: 'inherit',
    shell: false,
  });
  if (r.status !== 0) fail(`命令失败：${cmd.join(' ')}（exit ${r.status}）`);
  return r;
}

function quietRun(cmd, cwd = projectRoot) {
  const r = spawnSync(cmd[0], cmd.slice(1), { cwd, encoding: 'utf8' });
  return { code: r.status ?? 1, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

function main() {
  log('仓库:', repoUrl);
  log('base:', base);

  // 1. 刷新并读取 prototypes 入口
  const scan = spawnSync(process.execPath, [
    '-e',
    `
    import fs from 'fs';
    import path from 'path';
    import { fileURLToPath } from 'url';
    import { scanProjectEntries, writeEntriesManifestAtomic } from './vite-plugins/utils/entriesManifestCore.js';
    const root = process.cwd();
    const scanned = scanProjectEntries(root, ['prototypes']);
    writeEntriesManifestAtomic(root, scanned);
    console.log('ok');
    `,
  ], { cwd: projectRoot, encoding: 'utf8' });
  if (scan.status !== 0) fail('扫描 prototypes 入口失败：' + (scan.stderr || scan.stdout));
  if (!fs.existsSync(entriesPath)) fail('entries.json 缺失');

  const entries = JSON.parse(fs.readFileSync(entriesPath, 'utf8'));
  const keys = Object.keys(entries.js || {}).filter(k => k.startsWith('prototypes/'));
  if (!keys.length) fail('没有可发布的 prototypes 入口');
  log(`发现 ${keys.length} 个原型，开始构建…`);

  // 2. 清空 dist，只保留必要结构，再逐个构建
  if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  for (const key of keys) {
    log(`build ${key} (base=${base})`);
    run(['npx', 'vite', 'build', `--base=${base}`], { env: { ENTRY_KEY: key } });
  }

  // 3. 生成 GitHub Pages 所需 HTML（index + prototypes/*.html）
  log('生成 HTML…');
  run([process.execPath, 'scripts/generate-deploy-html.mjs']);
  fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

  const indexHtml = path.join(distDir, 'index.html');
  if (!fs.existsSync(indexHtml)) fail('dist/index.html 未生成');
  const htmlCount = fs.readdirSync(path.join(distDir, 'prototypes')).filter(f => f.endsWith('.html')).length;
  log(`✅ 构建完成：${keys.length} 个原型，${htmlCount} 个 HTML`);

  if (checkOnly) { log('--check 模式：跳过推送。dist 已就绪'); return; }

  // 4. 用 dist 初始化 orphan gh-pages commit 并推送
  const tmp = path.join('/tmp', `gh-pages-${path.basename(projectRoot)}-${Date.now()}`);
  fs.mkdirSync(tmp, { recursive: true });
  for (const item of fs.readdirSync(distDir)) {
    const src = path.join(distDir, item);
    const dst = path.join(tmp, item);
    if (fs.statSync(src).isDirectory()) fs.cpSync(src, dst, { recursive: true });
    else fs.copyFileSync(src, dst);
  }

  run(['git', 'init', '-b', 'gh-pages'], { cwd: tmp });
  const name = quietRun(['git', 'config', 'user.name']);
  const email = quietRun(['git', 'config', 'user.email']);
  if (!name.out) run(['git', 'config', 'user.name', 'williamhom'], { cwd: tmp });
  if (!email.out) run(['git', 'config', 'user.email', '66444945@qq.com'], { cwd: tmp });
  run(['git', 'add', '.'], { cwd: tmp });
  run(['git', 'commit', '-m', `deploy: prototypes ${new Date().toISOString().slice(0,16).replace('T',' ')}`], { cwd: tmp });
  run(['git', 'remote', 'add', 'origin', repoUrl], { cwd: tmp });

  log('推送到 origin/gh-pages…');
  run(['git', 'push', 'origin', 'gh-pages', ...(force ? ['--force'] : [])], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });

  const cleanRemote = repoUrl.replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git$/, '');
  log('🚀 已发布。访问：');
  const m = cleanRemote.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);
  if (m) {
    const [, owner, repo] = m;
    const url = `https://${owner}.github.io/${repo}/`;
    log(`  - 总览: ${url}`);
    log(`  - 子页: ${url}prototypes/<name>.html`);
  }
  log('（首次发布请去 GitHub 仓库 Settings → Pages → Branch 选 gh-pages / root）');
}

main();
