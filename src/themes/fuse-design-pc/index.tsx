import './globals.css';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemeShell, NavGroup, NavItem, MarkdownViewer } from '../../common/ThemeShell';
import tokens from './designToken.json';
import pageManifest from './pageManifest.json';
import coverUrl from './assets/cover.png';
import { OdinHeaderSection } from './components/OdinHeader';
import { BrandNavCardsSection } from './components/BrandNavCards';
import { OdinHeroTemplateSection } from './components/OdinHeroTemplate';
import { DesignLanguageShowcaseSection } from './components/DesignLanguageShowcase';

type TokenData = {
  name: string;
  description?: string;
  designLanguageSummary?: string;
  pageCases?: string[];
  businessComponents?: string[];
  atomicComponents?: Record<string, string[]>;
  tokenNamespaceInventory?: Record<string, string[]>;
  fontFamiliesObserved?: string[];
  exampleCodeCountObserved?: number;
};

type PageManifest = {
  source?: {
    fileId?: string;
    fileName?: string;
    mcpDslStatus?: string;
  };
  confirmedPages?: Record<string, { layerId: string; title: string }>;
  designLanguageSummary?: string;
  businessComponentHints?: string[];
  changeLogVersionText?: string;
  atomicComponentsCount?: number;
};

const data = tokens as TokenData;
const manifest = pageManifest as PageManifest;

const NAV_GROUPS: NavGroup[] = [
  { id: 'docs', title: '说明', order: 1 },
  { id: 'structure', title: '结构沉淀', order: 2 },
  { id: 'business', title: '业务组件演示', order: 3 },
  { id: 'inventory', title: '资产清单', order: 4 },
];

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: '主题概览', groupId: 'docs' },
  { id: 'design-doc', label: '设计说明', groupId: 'docs' },
  { id: 'design-spec', label: '结构规范', groupId: 'docs' },
  { id: 'design-language-showcase', label: '设计语言还原页', groupId: 'docs' },
  { id: 'online-manifest', label: '在线页面清单', groupId: 'docs' },
  { id: 'page-cases', label: '页面案例', groupId: 'structure' },
  { id: 'business-components', label: '业务组件', groupId: 'structure' },
  { id: 'component-catalog', label: '组件目录', groupId: 'structure' },
  { id: 'atomic-components', label: '原子组件', groupId: 'structure' },
  { id: 'odin-hero-template', label: 'ODIN首屏模板', groupId: 'business' },
  { id: 'odin-header', label: 'ODIN页头', groupId: 'business' },
  { id: 'brand-nav-cards', label: '品牌导航卡片', groupId: 'business' },
  { id: 'token-inventory', label: 'Token Inventory', groupId: 'inventory' },
  { id: 'fonts-and-mapping', label: '字体与映射', groupId: 'inventory' },
];

const shellTheme = {
  mode: 'light' as const,
  colors: {
    textPrimary: 'var(--foreground)',
    textSecondary: 'var(--secondary-foreground)',
    textTertiary: 'var(--muted-foreground)',
    textMuted: 'var(--subtle)',
    bgPrimary: 'var(--background)',
    bgSecondary: 'var(--card)',
    bgTertiary: 'var(--secondary)',
    bgHover: 'var(--muted)',
    bgActive: 'var(--primary-soft)',
    border: 'var(--border)',
    borderLight: 'var(--border-light)',
    activeIndicator: 'var(--primary)',
  },
};

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '24px',
  boxShadow: 'var(--shadow-md)',
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '8px',
  fontSize: '28px',
  fontWeight: 700,
  color: 'var(--foreground)',
};

const sectionDescStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '24px',
  color: 'var(--muted-foreground)',
  lineHeight: 1.7,
};

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div style={{ ...cardStyle, padding: '20px' }}>
      <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--subtle)', marginBottom: '10px' }}>
        {label}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--foreground)' }}>{value}</div>
      {note ? <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--subtle)' }}>{note}</div> : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        background: 'var(--muted)',
        color: 'var(--secondary-foreground)',
        fontSize: '13px',
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function GroupBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section style={{ ...cardStyle, marginBottom: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '20px', color: 'var(--foreground)' }}>{title}</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {items.map(item => (
          <Pill key={item}>{item}</Pill>
        ))}
      </div>
    </section>
  );
}

function TokenNamespaceTable({ inventory }: { inventory: Record<string, string[]> }) {
  const entries = Object.entries(inventory);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {entries.map(([namespace, refs]) => (
        <div key={namespace} style={{ ...cardStyle, padding: '18px 20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '12px' }}>{namespace}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {refs.map(ref => (
              <span
                key={ref}
                style={{
                  display: 'inline-block',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace',
                }}
              >
                {ref}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ManifestTable({ pages }: { pages: Record<string, { layerId: string; title: string }> }) {
  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', padding: '14px 18px', background: 'var(--muted)', borderBottom: '1px solid var(--border)', fontSize: '12px', fontWeight: 700, color: 'var(--subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <div>页面键</div>
        <div>标题</div>
        <div>Layer ID</div>
      </div>
      {Object.entries(pages).map(([key, value]) => (
        <div key={key} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', padding: '16px 18px', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
          <div style={{ color: 'var(--foreground)', fontWeight: 600 }}>{key}</div>
          <div style={{ color: 'var(--secondary-foreground)' }}>{value.title}</div>
          <div style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{value.layerId}</div>
        </div>
      ))}
    </div>
  );
}

const Component: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [designDoc, setDesignDoc] = useState('');
  const [designSpec, setDesignSpec] = useState('');

  const atomicGroups = useMemo(() => data.atomicComponents ?? {}, []);
  const tokenInventory = useMemo(() => data.tokenNamespaceInventory ?? {}, []);
  const tokenNamespaceCount = Object.keys(tokenInventory).length;
  const manifestPages = useMemo(() => manifest.confirmedPages ?? {}, []);

  useEffect(() => {
    fetch(new URL('./DESIGN.md', import.meta.url).href)
      .then(res => res.text())
      .then(setDesignDoc)
      .catch(() => setDesignDoc('加载失败'));

    fetch(new URL('./DESIGN-SPEC.md', import.meta.url).href)
      .then(res => res.text())
      .then(setDesignSpec)
      .catch(() => setDesignSpec('加载失败'));
  }, []);

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div style={{ display: 'grid', gap: '24px' }}>
          <section style={{ ...cardStyle, overflow: 'hidden', padding: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(320px, 0.9fr)' }}>
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'inline-flex', padding: '7px 12px', borderRadius: 'var(--radius-full)', background: 'var(--primary-soft)', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
                  MasterGo MG Archive Extract
                </div>
                <h1 style={{ marginTop: 0, marginBottom: '12px', fontSize: '40px', lineHeight: 1.1, color: 'var(--foreground)' }}>
                  {data.name}
                </h1>
                <p style={{ ...sectionDescStyle, marginBottom: '18px', fontSize: '16px' }}>
                  {data.description}
                </p>
                <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.8, color: 'var(--secondary-foreground)' }}>
                  {data.designLanguageSummary}
                </p>
              </div>
              <div style={{ minHeight: '100%', background: 'linear-gradient(180deg, var(--primary-soft) 0%, var(--secondary) 100%)', padding: '18px' }}>
                <img
                  src={coverUrl}
                  alt="Fuse Design Pc cover"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                  }}
                />
              </div>
            </div>
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <StatCard label="页面案例" value={String((data.pageCases ?? []).length)} note={(data.pageCases ?? []).join(' / ')} />
            <StatCard label="业务组件线索" value={String((data.businessComponents ?? []).length)} note="品牌化业务模块名称" />
            <StatCard
              label="原子组件"
              value={String(Object.values(atomicGroups).reduce((sum, items) => sum + items.length, 0))}
              note="按能力分组整理"
            />
            <StatCard label="Token 命名空间" value={String(tokenNamespaceCount)} note="组件级语义 token inventory" />
            <StatCard label="业务模板" value="3" note="页头 / 卡片 / 首屏模板" />
            <StatCard label="示例代码" value={String(data.exampleCodeCountObserved ?? 0)} note="React + Ant Design 片段" />
          </section>

          <section style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              ['Primary', 'var(--primary)', 'var(--primary-foreground)'],
              ['Background', 'var(--background)', 'var(--foreground)'],
              ['Card', 'var(--card)', 'var(--foreground)'],
              ['Muted', 'var(--muted)', 'var(--secondary-foreground)'],
              ['Success', 'var(--success)', 'var(--success-foreground)'],
              ['Warning', 'var(--warning)', 'var(--warning-foreground)'],
            ].map(([label, bg, fg]) => (
              <div key={label} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                <div style={{ background: bg, color: fg, padding: '24px 18px', fontWeight: 700 }}>{label}</div>
                <div style={{ padding: '12px 18px', fontSize: '12px', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>{bg}</div>
              </div>
            ))}
          </section>
        </div>
      );
    }

    if (activeTab === 'design-doc') {
      return designDoc ? <MarkdownViewer content={designDoc} /> : null;
    }

    if (activeTab === 'design-spec') {
      return designSpec ? <MarkdownViewer content={designSpec} /> : null;
    }

    if (activeTab === 'design-language-showcase') {
      return <DesignLanguageShowcaseSection />;
    }

    if (activeTab === 'online-manifest') {
      return (
        <div style={{ display: 'grid', gap: '20px' }}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>在线页面清单</h2>
            <p style={sectionDescStyle}>
              这部分来自在线文件原始文档流反查结果，用于固定真实页面入口。当前这份文件在线可访问，但 MCP 的 `getDsl/getMeta` 对关键页面仍返回空结构。
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Pill>fileId: {manifest.source?.fileId}</Pill>
              <Pill>fileName: {manifest.source?.fileName}</Pill>
              <Pill>mcpDslStatus: {manifest.source?.mcpDslStatus}</Pill>
              <Pill>atomicComponentsCount: {String(manifest.atomicComponentsCount ?? 0)}</Pill>
            </div>
          </section>

          <ManifestTable pages={manifestPages} />

          <section style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '20px', color: 'var(--foreground)' }}>设计语言页摘要</h3>
            <p style={{ margin: 0, color: 'var(--secondary-foreground)', lineHeight: 1.8 }}>
              {manifest.designLanguageSummary}
            </p>
          </section>
        </div>
      );
    }

    if (activeTab === 'page-cases') {
      return (
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>页面案例</h2>
          <p style={sectionDescStyle}>当前从组件包中稳定提取出两套 ODIN 页面案例，可作为后续品牌化原型和业务壳层的视觉参考。</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {(data.pageCases ?? []).map(item => (
              <Pill key={item}>{item}</Pill>
            ))}
          </div>
        </section>
      );
    }

    if (activeTab === 'component-catalog') {
      return (
        <div>
          <h2 style={sectionTitleStyle}>组件目录</h2>
          <p style={sectionDescStyle}>这是基于在线文件原始文档流反查出的原子组件目录分组，用于补强 `组件索引` 页的离线沉淀。</p>
          {Object.entries(atomicGroups).map(([group, items]) => (
            <GroupBlock key={group} title={`${group} · ${items.length}`} items={items} />
          ))}
        </div>
      );
    }

    if (activeTab === 'business-components') {
      return (
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>业务组件</h2>
          <p style={sectionDescStyle}>这一层是从 `.mg` 中提取到的品牌化业务模块线索，已经足够支撑下一阶段做 `ODIN 页头 / 平台壳层 / 品牌卡片` 组件化。</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {((manifest.businessComponentHints?.length ? manifest.businessComponentHints : data.businessComponents) ?? []).map(item => (
              <Pill key={item}>{item}</Pill>
            ))}
          </div>
          {manifest.changeLogVersionText ? (
            <div style={{ marginTop: '18px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
              更新日志可识别版本文本：<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--foreground)' }}>{manifest.changeLogVersionText}</span>
            </div>
          ) : null}
        </section>
      );
    }

    if (activeTab === 'atomic-components') {
      return (
        <div>
          <h2 style={sectionTitleStyle}>原子组件</h2>
          <p style={sectionDescStyle}>已按能力维度重新分组，方便后续决定哪些需要优先转成项目内可复用组件。</p>
          {Object.entries(atomicGroups).map(([group, items]) => (
            <GroupBlock key={group} title={group} items={items} />
          ))}
        </div>
      );
    }

    if (activeTab === 'odin-header') {
      return <OdinHeaderSection />;
    }

    if (activeTab === 'odin-hero-template') {
      return <OdinHeroTemplateSection />;
    }

    if (activeTab === 'brand-nav-cards') {
      return <BrandNavCardsSection />;
    }

    if (activeTab === 'token-inventory') {
      return (
        <div>
          <h2 style={sectionTitleStyle}>Token Inventory</h2>
          <p style={sectionDescStyle}>这里展示的是从文档流里提取出来的组件级语义 token 命名空间，适合下一步继续补数值 token 或映射为 `globals.css`。</p>
          <TokenNamespaceTable inventory={tokenInventory} />
        </div>
      );
    }

    if (activeTab === 'fonts-and-mapping') {
      return (
        <div style={{ display: 'grid', gap: '20px' }}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>字体观察</h2>
            <p style={sectionDescStyle}>当前从组件包文本中观察到的主要字体组合如下。</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {(data.fontFamiliesObserved ?? []).map(item => (
                <Pill key={item}>{item}</Pill>
              ))}
            </div>
          </section>

          <section style={cardStyle}>
            <h2 style={{ ...sectionTitleStyle, fontSize: '24px' }}>推进建议</h2>
            <p style={sectionDescStyle}>如果继续往前推进一层，最合适的落点是先做可运行主题变量，再做品牌业务组件。</p>
            <div style={{ display: 'grid', gap: '10px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
              <div>1. 把高频 token 命名空间映射为 `globals.css` 主题变量。</div>
              <div>2. 先实现 `ODIN页头`、`品牌导航卡片`、`平台信息区块` 三类业务组件。</div>
              <div>3. 再挑 `国内ODIN` 或 `海外ODIN` 复刻一张页面案例做基准页。</div>
            </div>
          </section>
        </div>
      );
    }

    return null;
  };

  return (
    <ThemeShell
      brand={{
        name: 'Fuse Design Pc',
        subtitle: 'MG Archive Theme',
        logoBgColor: '#2251ff',
        logoTextColor: '#ffffff',
      }}
      groups={NAV_GROUPS}
      items={NAV_ITEMS}
      activeId={activeTab}
      onNavigate={setActiveTab}
      sidebar={{
        defaultOpen: true,
        collapsible: true,
        width: 272,
      }}
      theme={shellTheme}
      className="fuse-design-pc-theme"
    >
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>{renderContent()}</div>
    </ThemeShell>
  );
};

export default Component;
