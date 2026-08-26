import React, { useState } from 'react';

type BrandCard = {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  accent: string;
  metrics: string[];
  actions: string[];
};

const cards: BrandCard[] = [
  {
    id: 'chery',
    brand: 'CHERY',
    title: '品牌官网运营中台',
    subtitle: '统一管理主品牌站点、车型专题、活动入口和内容编排。',
    accent: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    metrics: ['站点模板 18', '专题活动 32', '月活 UV 126W'],
    actions: ['进入品牌站', '查看活动页'],
  },
  {
    id: 'exeed',
    brand: 'EXEED',
    title: '高端品牌体验门户',
    subtitle: '围绕车型亮点、试驾转化和品牌故事打造沉浸式内容中枢。',
    accent: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    metrics: ['车型专题 12', '试驾转化 +14%', '品牌内容 86'],
    actions: ['查看体验页', '管理专区'],
  },
  {
    id: 'jetour',
    brand: 'JETOUR',
    title: '活动营销与投放阵地',
    subtitle: '适合活动 campaign、落地页矩阵和区域营销资源快速投放。',
    accent: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
    metrics: ['投放页 44', '地区素材 76', '线索收集 9.8K'],
    actions: ['查看投放页', '管理表单'],
  },
  {
    id: 'icar',
    brand: 'iCAR',
    title: '年轻化品牌互动阵地',
    subtitle: '强调品牌表达、社区内容与互动组件联动的轻量型品牌中枢。',
    accent: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
    metrics: ['互动模块 21', '社区活动 15', '分享转发 +22%'],
    actions: ['进入社区页', '查看互动组件'],
  },
];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--muted)',
        border: '1px solid var(--border-light)',
        color: 'var(--secondary-foreground)',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export const BrandNavCardsSection: React.FC = () => {
  const [activeBrand, setActiveBrand] = useState('chery');
  const current = cards.find(card => card.id === activeBrand) ?? cards[0];

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '30px', color: 'var(--foreground)' }}>品牌导航卡片</h1>
        <p style={{ margin: 0, color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
          用于承接 `ODIN页头` 之后的首页首屏导航区，把不同品牌站点、品牌阵地和业务入口做成清晰的卡片矩阵。
        </p>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
          gap: '18px',
        }}
      >
        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {cards.map(card => {
              const active = card.id === activeBrand;
              return (
                <button
                  key={card.id}
                  onClick={() => setActiveBrand(card.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0',
                    background: active ? 'var(--primary-soft)' : 'var(--card)',
                    border: active ? '1px solid rgba(34, 81, 255, 0.32)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <div style={{ height: '6px', background: card.accent }} />
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--subtle)', fontWeight: 700 }}>
                        {card.brand}
                      </span>
                      <span style={{ fontSize: '12px', color: active ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: 700 }}>
                        {active ? '当前查看' : '切换'}
                      </span>
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>{card.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>{card.subtitle}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ padding: '18px 18px 16px', background: current.accent, color: '#ffffff' }}>
            <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px' }}>
              {current.brand}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.15, marginBottom: '10px' }}>{current.title}</div>
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.86)' }}>{current.subtitle}</div>
          </div>

          <div style={{ padding: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '10px' }}>品牌核心指标</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
              {current.metrics.map(item => (
                <Chip key={item}>{item}</Chip>
              ))}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '10px' }}>推荐动作</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {current.actions.map(action => (
                <button
                  key={action}
                  style={{
                    height: '38px',
                    padding: '0 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
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
        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)', marginBottom: '12px' }}>适用场景</div>
        <div style={{ display: 'grid', gap: '8px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
          <div>1. 品牌官网首页的品牌分区入口。</div>
          <div>2. 多品牌运营后台的快捷入口面板。</div>
          <div>3. 活动平台或内容平台的导航矩阵。</div>
          <div>4. 与 `ODIN页头` 组合成完整首屏业务壳层。</div>
        </div>
      </section>
    </div>
  );
};

export default BrandNavCardsSection;
