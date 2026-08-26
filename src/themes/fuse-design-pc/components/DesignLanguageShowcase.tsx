import React from 'react';
import page01 from '../assets/pdf-foundation/page-01.png';
import page02 from '../assets/pdf-foundation/page-02.png';
import page03 from '../assets/pdf-foundation/page-03.png';
import page04 from '../assets/pdf-foundation/page-04.png';
import page05 from '../assets/pdf-foundation/page-05.png';
import page06 from '../assets/pdf-foundation/page-06.png';
import page07 from '../assets/pdf-foundation/page-07.png';
import page08 from '../assets/pdf-foundation/page-08.png';

type Chapter = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  bullets: string[];
  image: string;
};

const chapters: Chapter[] = [
  {
    id: 'radius',
    title: '圆角',
    subtitle: 'PC 端基础圆角规则',
    summary: 'PDF 明确把圆角约束为三档，目标是解决不同界面密度下的通用圆角使用问题。',
    bullets: [
      '圆角梯度固定为 8px、4px、2px。',
      '规则用于指导后续组件设计，不针对单一组件单独定义。',
      '整体视觉基底干净，圆角不是装饰，而是密度控制工具。',
    ],
    image: page01,
  },
  {
    id: 'shadow',
    title: '阴影',
    subtitle: '默认向下的三层阴影体系',
    summary: 'PDF 给出了阴影的使用场景、方向和三级深度，是这套规范里最可直接工程化的一页。',
    bullets: [
      '默认阴影方向为向下，适合组件本身与组件内部结构。',
      '一级阴影：0 1 2 -2 / 0 3 6 0 / 0 5 12 4。',
      '二级阴影：0 3 6 -4 / 0 6 16 0 / 0 9 28 8。',
      '三级阴影：0 6 16 -8 / 0 9 28 0 / 0 12 48 16。',
    ],
    image: page02,
  },
  {
    id: 'type',
    title: '文字',
    subtitle: 'MiSans 主字体系',
    summary: '这页定义了字体选型、字号行高、字重和数字展示方式，信息密度很高，也是 PDF 里最适合直接产品化的规范页之一。',
    bullets: [
      '设计确认字体统一使用 MiSans。',
      '字号梯度：12 / 14 / 16 / 18 / 20 / 22 / 24 / 28 / 32 / 40。',
      '对应行高：20 / 22 / 24 / 26 / 28 / 30 / 32 / 36 / 40 / 48。',
      '推荐字重仅使用 400 与 500，并给出数字与金额的展示规则。',
    ],
    image: page03,
  },
  {
    id: 'color',
    title: '色彩',
    subtitle: '主色、功能色与系统色板',
    summary: '色彩页完整覆盖主色、主色 2、功能色、消息色/状态色、中性色以及多条系统色阶，是 PDF 中色彩资产最完整的一页。',
    bullets: [
      '主色区和主色 2 提供品牌蓝灰体系。',
      '功能色覆盖成功、警告、提醒、错误四类语义。',
      '中性色区同时给出了亮底与暗底使用方式。',
      '系统色板延展到红、橙、黄、绿、青、蓝、紫、洋红等多组梯度。',
    ],
    image: page04,
  },
  {
    id: 'spacing',
    title: '间距',
    subtitle: '8 基础倍数的空间系统',
    summary: 'PDF 把间距拆成水平、垂直、组件内间距、对齐和分隔符，说明它并不是单纯 token 表，而是实际排版规则。',
    bullets: [
      '水平间距推荐 8 / 16 / 24。',
      '垂直间距默认围绕 8 的倍数组织。',
      '组件内间距建议统一为 8 的倍数设置。',
      '明确支持居中、顶部、底部与自定义对齐方式。',
    ],
    image: page05,
  },
  {
    id: 'layout',
    title: '布局',
    subtitle: '大屏与桌面容器结构',
    summary: '布局页关注 Header、侧栏、内容区和常见大屏宽度，是 PC 端页面框架最接近产品模板的一页。',
    bullets: [
      '定义了顶部、侧栏、内容区的标准壳层关系。',
      '列出常见宽度场景，例如 1024、1280、1440 等。',
      '给出内部多模块布局的分区示例。',
      '适合直接转化为页面壳层模板与响应规则参考。',
    ],
    image: page06,
  },
  {
    id: 'grid',
    title: '栅格',
    subtitle: '24 栏响应式网格',
    summary: '栅格页信息完整度很高，明确写出了 24 栏栅格体系及使用原则，适合直接沉淀为开发规范。',
    bullets: [
      'DMS Design 基于 24 栏栅格组织 PC 页面。',
      '基础结构包含 Grid、Gutter、Column、Content、Margin 与 Container。',
      '用错示意和业务页面示例说明了栅格边界与对齐约束。',
      '列出常见分辨率与默认断点布局参考。',
    ],
    image: page07,
  },
  {
    id: 'icon',
    title: '图标',
    subtitle: '图标栅格与分类体系',
    summary: '图标页除了说明 1024 设计稿尺寸和辅助图形系统外，还附带了完整的图标分类清单，适合做成资产目录入口。',
    bullets: [
      '设计尺寸基于 1024 的图标画板。',
      '展示了圆、方、三角等基础图形的辅助图标系统。',
      '给出视觉元素、情感化设计和圆角处理原则。',
      '图标分类覆盖方向、建议、编辑、数据、品牌与应用等大类。',
    ],
    image: page08,
  },
];

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-md)',
};

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  color: 'var(--primary)',
};

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.76)',
        color: 'var(--secondary-foreground)',
        fontSize: '12px',
        fontWeight: 700,
      }}
    >
      {children}
    </span>
  );
}

function ChapterCard({ chapter }: { chapter: Chapter }) {
  return (
    <button
      onClick={() => document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      style={{
        ...cardStyle,
        padding: '18px',
        textAlign: 'left',
        cursor: 'pointer',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
      }}
    >
      <div style={{ marginBottom: '6px', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--subtle)' }}>
        Chapter
      </div>
      <div style={{ marginBottom: '6px', fontSize: '20px', fontWeight: 800, color: 'var(--foreground)' }}>{chapter.title}</div>
      <div style={{ marginBottom: '10px', fontSize: '13px', color: 'var(--primary)', fontWeight: 700 }}>{chapter.subtitle}</div>
      <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{chapter.summary}</div>
    </button>
  );
}

function ChapterSection({ chapter }: { chapter: Chapter }) {
  return (
    <section id={chapter.id} style={{ ...cardStyle, padding: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '18px', alignItems: 'start' }}>
        <div>
          <div style={{ marginBottom: '8px', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--subtle)' }}>
            PDF Chapter
          </div>
          <h2 style={{ margin: 0, marginBottom: '8px', fontSize: '30px', color: 'var(--foreground)' }}>{chapter.title}</h2>
          <div style={{ marginBottom: '14px', fontSize: '15px', color: 'var(--primary)', fontWeight: 700 }}>{chapter.subtitle}</div>
          <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--secondary-foreground)', lineHeight: 1.8 }}>{chapter.summary}</p>
          <div style={{ display: 'grid', gap: '10px' }}>
            {chapter.bullets.map(item => (
              <div
                key={item}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--muted)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--secondary-foreground)',
                  lineHeight: 1.7,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, overflow: 'hidden', background: '#f7f8fb' }}>
          <img src={chapter.image} alt={chapter.title} style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      </div>
    </section>
  );
}

export const DesignLanguageShowcaseSection: React.FC = () => {
  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section
        style={{
          ...cardStyle,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 0% 0%, rgba(34,81,255,0.16), transparent 28%), radial-gradient(circle at 92% 14%, rgba(47,124,255,0.14), transparent 24%), linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%)',
        }}
      >
        <div style={{ padding: '32px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
            <MetaPill>PDF 直还原</MetaPill>
            <MetaPill>8 Pages</MetaPill>
            <MetaPill>设计中台基础规范 V1.0</MetaPill>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: '20px' }}>
            <div>
              <h1 style={{ margin: 0, marginBottom: '14px', fontSize: '44px', lineHeight: 1.04, color: 'var(--foreground)' }}>
                基于 PDF 原页
                <br />
                直接还原设计语言
              </h1>
              <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.9, color: 'var(--secondary-foreground)' }}>
                这次不再以 `.mg` 文档流推断为主，而是直接以 [Fuse.Design-Pc组件包.pdf](/Users/hom/Downloads/下载专用文件夹/Fuse.Design-Pc组件包.pdf) 的 8 页基础规范为准，恢复出 `圆角 / 阴影 / 文字 / 色彩 / 间距 / 布局 / 栅格 / 图标`
                这套设计语言目录。
              </p>
            </div>

            <div style={{ ...cardStyle, padding: '20px', background: 'rgba(255,255,255,0.84)' }}>
              <div style={{ marginBottom: '12px', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--subtle)' }}>
                PDF Source
              </div>
              <div style={{ display: 'grid', gap: '10px', color: 'var(--secondary-foreground)', lineHeight: 1.7 }}>
                <div>文件名：Fuse.Design-Pc组件包.pdf</div>
                <div>页数：8</div>
                <div>页面尺寸：1680 × 1680</div>
                <div>规范归属：设计中台基础规范 V1.0</div>
                <div style={monoStyle}>/Users/hom/Downloads/下载专用文件夹/Fuse.Design-Pc组件包.pdf</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div style={{ marginBottom: '14px', fontSize: '24px', fontWeight: 800, color: 'var(--foreground)' }}>PDF 章节目录</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {chapters.map(chapter => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      </section>

      {chapters.map(chapter => (
        <ChapterSection key={chapter.id} chapter={chapter} />
      ))}

      <section style={{ ...cardStyle, padding: '24px' }}>
        <div style={{ marginBottom: '12px', fontSize: '24px', fontWeight: 800, color: 'var(--foreground)' }}>项目内沉淀结果</div>
        <div style={{ display: 'grid', gap: '10px', color: 'var(--secondary-foreground)', lineHeight: 1.8 }}>
          <div>1. 现有 `设计语言还原页` 已切换为 PDF 主导的基础规范还原。</div>
          <div>2. 8 张 PDF 页面预览已进入主题资源目录，可持续复用。</div>
          <div>3. 这套页面适合作为后续继续拆分 `色彩规范 / 排版规范 / 图标规范` 的章节入口。</div>
        </div>
      </section>
    </div>
  );
};

export default DesignLanguageShowcaseSection;
