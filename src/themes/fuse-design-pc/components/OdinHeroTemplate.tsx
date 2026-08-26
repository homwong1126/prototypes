import React from 'react';

const surfaceStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
};

function ActionChip({
  children,
  emphasized = false,
}: {
  children: React.ReactNode;
  emphasized?: boolean;
}) {
  return (
    <button
      style={{
        height: '40px',
        padding: '0 16px',
        borderRadius: 'var(--radius-full)',
        border: emphasized ? '1px solid var(--primary)' : '1px solid var(--border)',
        background: emphasized ? 'var(--primary)' : 'rgba(255,255,255,0.84)',
        color: emphasized ? 'var(--primary-foreground)' : 'var(--foreground)',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function MetricPanel({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div
      style={{
        ...surfaceStyle,
        padding: '16px',
        background: 'rgba(255,255,255,0.76)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          marginBottom: '8px',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {label}
      </div>
      <div style={{ marginBottom: '6px', fontSize: '26px', fontWeight: 800, color: 'var(--foreground)' }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--secondary-foreground)', lineHeight: 1.6 }}>{note}</div>
    </div>
  );
}

function BrandEntry({
  brand,
  title,
  desc,
  accent,
}: {
  brand: string;
  title: string;
  desc: string;
  accent: string;
}) {
  return (
    <div
      style={{
        ...surfaceStyle,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,247,253,0.98) 100%)',
      }}
    >
      <div style={{ height: '6px', background: accent }} />
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 800, color: 'var(--subtle)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {brand}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{desc}</div>
      </div>
    </div>
  );
}

export const OdinHeroTemplateSection: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '30px', color: 'var(--foreground)' }}>ODIN 首屏模板</h1>
        <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
          这一层把已沉淀的 `ODIN页头` 和 `品牌导航卡片` 往前组合成完整首屏骨架，用于品牌官网首页、品牌门户和活动运营首页快速起版。
        </p>
      </div>

      <section
        style={{
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          background:
            'radial-gradient(circle at 0% 0%, rgba(83,138,255,0.22), transparent 28%), radial-gradient(circle at 88% 16%, rgba(52,211,153,0.12), transparent 24%), linear-gradient(135deg, #0f172a 0%, #162a5a 46%, #2251ff 100%)',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>ODIN SMART PLATFORM</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)' }}>Fuse Design Pc / Business Landing Shell</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <ActionChip>组件说明</ActionChip>
            <ActionChip emphasized>进入品牌工作台</ActionChip>
          </div>
        </div>

        <div
          style={{
            padding: '28px 20px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          <div style={{ color: '#ffffff' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '18px',
              }}
            >
              Business Template / Hero Layer
            </div>
            <h2 style={{ margin: 0, marginBottom: '14px', fontSize: '46px', lineHeight: 1.04, fontWeight: 800 }}>
              面向多品牌业务站点的
              <br />
              统一首页首屏模版
            </h2>
            <p style={{ margin: 0, maxWidth: '680px', fontSize: '16px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
              首屏同时容纳品牌识别、一级导航、业务摘要、品牌入口矩阵和下一步动作，适合作为 `ODIN业务组件` 在项目中的第一块可复用模板。
            </p>

            <div
              style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
              }}
            >
              <MetricPanel label="品牌覆盖" value="4 Brands" note="CHERY / EXEED / JETOUR / iCAR" />
              <MetricPanel label="模块组合" value="3 Layers" note="页头、首屏信息、品牌入口矩阵" />
              <MetricPanel label="落地速度" value="1 Screen" note="适合作为页面案例的工程起版骨架" />
            </div>
          </div>

          <div
            style={{
              ...surfaceStyle,
              padding: '18px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(14px)',
            }}
          >
            <div style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.78)' }}>品牌入口矩阵</div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <BrandEntry brand="CHERY" title="品牌官网运营中台" desc="承接官网、车型专题、活动入口和品牌内容编排。" accent="linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)" />
              <BrandEntry brand="EXEED" title="高端体验门户" desc="围绕车型亮点、试驾转化和品牌叙事的内容阵地。" accent="linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)" />
              <BrandEntry brand="JETOUR" title="活动营销阵地" desc="适合 campaign、落地页矩阵和区域营销资源投放。" accent="linear-gradient(135deg, #ea580c 0%, #fb923c 100%)" />
              <BrandEntry brand="iCAR" title="年轻化互动中心" desc="强调品牌表达、社区互动和轻量活动组件联动。" accent="linear-gradient(135deg, #059669 0%, #34d399 100%)" />
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ ...surfaceStyle, padding: '20px' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>模板结构</div>
          <div style={{ display: 'grid', gap: '8px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
            <div>1. 顶部品牌壳层与 CTA。</div>
            <div>2. 首屏主信息与运营指标摘要。</div>
            <div>3. 多品牌入口卡片矩阵。</div>
          </div>
        </div>

        <div style={{ ...surfaceStyle, padding: '20px' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>推荐复用场景</div>
          <div style={{ display: 'grid', gap: '8px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
            <div>1. 多品牌官网首页。</div>
            <div>2. 品牌门户或运营工作台首页。</div>
            <div>3. 活动平台与内容平台首屏。</div>
          </div>
        </div>

        <div style={{ ...surfaceStyle, padding: '20px' }}>
          <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>下一步可继续拆分</div>
          <div style={{ display: 'grid', gap: '8px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
            <div>1. `BrandSwitcher`。</div>
            <div>2. `HeroMessageBlock`。</div>
            <div>3. `MetricRibbon`。</div>
            <div>4. `BrandMatrix`。</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OdinHeroTemplateSection;
