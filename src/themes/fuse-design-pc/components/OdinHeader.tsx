import React, { useState } from 'react';

function ActionButton({
  children,
  primary = false,
}: {
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      style={{
        height: '40px',
        padding: '0 16px',
        borderRadius: 'var(--radius-full)',
        border: primary ? '1px solid var(--primary)' : '1px solid var(--border)',
        background: primary ? 'var(--primary)' : 'rgba(255,255,255,0.8)',
        color: primary ? 'var(--primary-foreground)' : 'var(--foreground)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(255,255,255,0.72)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        minWidth: '160px',
        boxShadow: 'var(--shadow-sm)',
        backdropFilter: 'blur(14px)',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '13px', color: 'var(--secondary-foreground)' }}>{hint}</div>
    </div>
  );
}

export const OdinHeaderSection: React.FC = () => {
  const [activeNav, setActiveNav] = useState('品牌总览');

  const navItems = ['品牌总览', '车型体验', '活动资源', '数据中台', '海外站点'];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '30px', color: 'var(--foreground)' }}>ODIN 页头业务组件</h1>
        <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
          基于 `Fuse Design Pc` 中提取到的 `ODIN页头` 线索，先落成一个品牌化业务页头。这个组件适合品牌官网、品牌后台门户、活动站点管理台的首屏壳层。
        </p>
      </div>

      <section
        style={{
          borderRadius: '28px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          background:
            'radial-gradient(circle at top left, rgba(47,124,255,0.28), transparent 28%), radial-gradient(circle at 80% 20%, rgba(34,81,255,0.22), transparent 22%), linear-gradient(135deg, #0f172a 0%, #172554 42%, #1d4ed8 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
                fontSize: '16px',
              }}
            >
              O
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>ODIN SMART PLATFORM</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)' }}>品牌数字体验中枢</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.08)',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              CHERY / EXEED / JETOUR / iCAR
            </div>
            <ActionButton>查看规范</ActionButton>
            <ActionButton primary>进入工作台</ActionButton>
          </div>
        </div>

        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {navItems.map(item => {
            const active = item === activeNav;
            return (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  borderRadius: '999px',
                  border: active ? '1px solid rgba(255,255,255,0.36)' : '1px solid transparent',
                  background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '36px 20px 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '24px' }}>
          <div>
            <div style={{ display: 'inline-flex', padding: '8px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '18px' }}>
              Active Nav / {activeNav}
            </div>
            <h2 style={{ margin: 0, marginBottom: '14px', fontSize: '44px', lineHeight: 1.05, fontWeight: 800 }}>
              为多品牌站点与品牌后台
              <br />
              提供统一的数字壳层
            </h2>
            <p style={{ margin: 0, maxWidth: '700px', fontSize: '16px', lineHeight: 1.8, color: 'rgba(255,255,255,0.78)' }}>
              页头区同时承载品牌识别、站点切换、核心导航、入口 CTA 与经营指标摘要。它是 `ODIN业务组件` 中最适合优先工程化的模块之一。
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px', alignContent: 'start', justifyContent: 'end' }}>
            <MetricCard label="站点覆盖" value="4 Brands" hint="多品牌统一运营" />
            <MetricCard label="活动资源" value="128" hint="活动素材与模板" />
            <MetricCard label="本周转化" value="+18.4%" hint="品牌内容转化提升" />
          </div>
        </div>
      </section>

      <section
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '12px' }}>组件拆分建议</div>
        <div style={{ display: 'grid', gap: '8px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
          <div>1. `BrandSwitcher`：品牌切换与身份展示。</div>
          <div>2. `OdinTopNav`：一级导航与当前态管理。</div>
          <div>3. `HeroCTA`：首屏标题、副标题、主操作按钮。</div>
          <div>4. `MetricRibbon`：品牌运营指标摘要卡。</div>
        </div>
      </section>
    </div>
  );
};

export default OdinHeaderSection;
