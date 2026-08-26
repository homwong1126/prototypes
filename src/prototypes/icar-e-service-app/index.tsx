/**
 * @name 售后服务 App
 *
 * 参考资料：
 * - 用户提供业务资料
 * - /rules/design-guide.md
 * - /rules/development-guide.md
 * - /src/themes/antd-new/DESIGN.md
 */

import './style.css';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  Camera,
  CarFront,
  ChevronRight,
  CircleCheckBig,
  ClipboardList,
  ClipboardPenLine,
  Clock3,
  Cog,
  Database,
  Gauge,
  HardHat,
  MessageSquareText,
  PackageCheck,
  Phone,
  ReceiptText,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  SquareKanban,
  TimerReset,
  TriangleAlert,
  UserRound,
  WalletCards,
  Wrench,
} from 'lucide-react';

import serviceReception from './assets/service-reception.png';
import cockpitCheck from './assets/cockpit-check.png';
import tireCheck from './assets/tire-check.png';
import frontDesk from './assets/front-desk.png';

type PageKey = 'todo' | 'resources' | 'dashboard' | 'mine' | 'appointments' | 'intake' | 'workorder' | 'dispatch' | 'clocking' | 'report' | 'settlement';
type AppointmentStatus = '待跟进' | '已确认' | '已到店';

type AppointmentItem = {
  id: string;
  plateNo: string;
  ownerName: string;
  phone: string;
  appointmentTime: string;
  advisor: string;
  status: AppointmentStatus;
  serviceType: string;
  pickupMode: string;
  note: string;
};

type IntakePoint = {
  id: string;
  label: string;
  status: 'normal' | 'warning';
  position: { left: string; top: string };
  view: '左前' | '右前' | '左后' | '右后';
};

const WORKFLOW_PAGES: Array<{ key: Exclude<PageKey, 'todo' | 'resources' | 'dashboard' | 'mine'>; label: string; icon: React.ReactNode }> = [
  { key: 'appointments', label: '客户预约', icon: <CalendarClock size={15} /> },
  { key: 'intake', label: '接车环检', icon: <ScanLine size={15} /> },
  { key: 'workorder', label: '委托书', icon: <ClipboardPenLine size={15} /> },
  { key: 'dispatch', label: '车间派工', icon: <Cog size={15} /> },
  { key: 'clocking', label: '技师打卡', icon: <HardHat size={15} /> },
  { key: 'report', label: '车辆报告', icon: <ShieldCheck size={15} /> },
  { key: 'settlement', label: '结算交车', icon: <ReceiptText size={15} /> },
];

const BOTTOM_TABS: Array<{ key: PageKey; label: string; icon: React.ReactNode }> = [
  { key: 'todo', label: '待办', icon: <ClipboardList size={18} /> },
  { key: 'resources', label: '资源', icon: <Database size={18} /> },
  { key: 'dashboard', label: '看板', icon: <SquareKanban size={18} /> },
  { key: 'mine', label: '我的', icon: <UserRound size={18} /> },
];

const TODO_ITEMS = [
  { key: 'intake' as PageKey, title: '待环检', count: '06', desc: '3 台已到店待拍照留痕', tone: 'warning' as const },
  { key: 'workorder' as PageKey, title: '待签字', count: '03', desc: '2 份委托书待客户电子签名', tone: 'primary' as const },
  { key: 'dispatch' as PageKey, title: '待派工', count: '05', desc: '异响诊断与保养项目待分配班组', tone: 'success' as const },
];

const RESOURCE_ITEMS = [
  { key: 'appointments' as PageKey, title: '客户档案', desc: '客户画像、历史到店、联系方式' },
  { key: 'intake' as PageKey, title: '车辆基本信息', desc: 'VIN、车系、里程、保险与权益' },
  { key: 'workorder' as PageKey, title: '备件信息', desc: '库存、价格、适配车型与领料状态' },
];

const DASHBOARD_ITEMS = [
  { key: 'report' as PageKey, title: '维修项目台账', desc: '项目明细、工时、顾问与作业记录' },
  { key: 'dispatch' as PageKey, title: '维修材料台账', desc: '材料用量、领退料、备件消耗' },
  { key: 'settlement' as PageKey, title: '结算台账', desc: '工时费、材料费、优惠与实收金额' },
];

const APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'AP20250918-021',
    plateNo: '浙A·E5268',
    ownerName: '陈先生',
    phone: '181 7712 6650',
    appointmentTime: '09:30-10:30',
    advisor: '李顾问',
    status: '待跟进',
    serviceType: '定期保养 + 异响检查',
    pickupMode: '上门接车',
    note: '需同步取送车平台下单',
  },
  {
    id: 'AP20250918-034',
    plateNo: '沪C·Q9182',
    ownerName: '王女士',
    phone: '159 8306 6114',
    appointmentTime: '10:30-11:30',
    advisor: '李顾问',
    status: '已确认',
    serviceType: '首保',
    pickupMode: '到店',
    note: '客户已确认时间，等待进店',
  },
  {
    id: 'AP20250918-057',
    plateNo: '苏B·8T223',
    ownerName: '胡先生',
    phone: '136 9011 2786',
    appointmentTime: '14:00-15:00',
    advisor: '周顾问',
    status: '已到店',
    serviceType: '轮胎检查 + 制动检测',
    pickupMode: '到店',
    note: '已引导进入接车环检',
  },
];

const INTAKE_POINTS: IntakePoint[] = [
  { id: 'p1', label: '左前翼子板划痕', status: 'warning', position: { left: '24%', top: '24%' }, view: '左前' },
  { id: 'p2', label: '前保险杠正常', status: 'normal', position: { left: '44%', top: '20%' }, view: '右前' },
  { id: 'p3', label: '右后轮胎鼓包', status: 'warning', position: { left: '72%', top: '63%' }, view: '右后' },
  { id: 'p4', label: '尾门漆面正常', status: 'normal', position: { left: '48%', top: '73%' }, view: '左后' },
];

const WORKORDER_LINES = [
  { name: 'A保养套餐', labor: 360, material: 568, status: '待开工' },
  { name: '异响诊断', labor: 180, material: 0, status: '待派工' },
  { name: '右后轮胎更换建议', labor: 120, material: 699, status: '待客户确认' },
];

const DISPATCH_TASKS = [
  { item: 'A保养套餐', group: '机修一组', tech: '张伟', duration: '1.2h', status: '已派工' },
  { item: '异响诊断', group: '机修二组', tech: '待选择', duration: '0.8h', status: '待派工' },
  { item: '右后轮胎更换', group: '轮胎快修组', tech: '赵明', duration: '0.6h', status: '待客户确认' },
];

const CLOCKING_TASKS = [
  { item: 'A保养套餐', plate: '浙A·E5268', status: '进行中', startedAt: '10:18', spent: '00:42', action: '暂停' },
  { item: '异响诊断', plate: '浙A·E5268', status: '待开工', startedAt: '--', spent: '00:00', action: '开工' },
  { item: '轮胎更换', plate: '沪C·Q9182', status: '已暂停', startedAt: '09:52', spent: '00:26', action: '恢复' },
  { item: '制动检查', plate: '苏B·8T223', status: '待完工', startedAt: '11:05', spent: '01:12', action: '完工' },
];

const REPORT_ITEMS = [
  { label: '动力电池系统', score: '良好', desc: 'SOC 处于安全区间，建议常规复检' },
  { label: '制动系统', score: '关注', desc: '右后轮胎鼓包影响制动稳定性，建议尽快处理' },
  { label: '车身外观', score: '关注', desc: '左前翼子板存在轻微划痕，建议抛光修复' },
];

const PAYMENT_METHODS = [
  { name: '移动支付', value: '¥1,648', active: true },
  { name: '会员储值', value: '¥500', active: false },
  { name: '挂账担保', value: '¥0', active: false },
];

const PAGE_BY_PATH: Record<string, PageKey> = {
  todo: 'todo',
  resources: 'resources',
  dashboard: 'dashboard',
  appointments: 'appointments',
  intake: 'intake',
  workorder: 'workorder',
  dispatch: 'dispatch',
  clocking: 'clocking',
  report: 'report',
  settlement: 'settlement',
  mine: 'mine',
  home: 'todo',
};

function getPathPage(): PageKey {
  if (typeof window === 'undefined') return 'todo';
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] !== 'prototypes' || parts[1] !== 'icar-e-service-app') return 'todo';
  const subPath = parts[2] || '';
  return PAGE_BY_PATH[subPath] || 'todo';
}

function syncLocation(page: PageKey) {
  if (typeof window === 'undefined') return;
  const basePath = '/prototypes/icar-e-service-app';
  const suffix = page === 'todo' ? '' : `/${page}`;
  const nextUrl = `${basePath}${suffix}${window.location.search}${window.location.hash}`;
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
    window.history.replaceState(window.history.state, '', nextUrl);
  }
}

function statusClass(status: AppointmentStatus) {
  if (status === '待跟进') return 'warning';
  if (status === '已确认') return 'primary';
  return 'success';
}

function SummaryCard({
  label,
  value,
  trend,
  tone = 'primary',
}: {
  label: string;
  value: string;
  trend: string;
  tone?: 'primary' | 'success' | 'warning';
}) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{trend}</em>
    </div>
  );
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {hint ? <p>{hint}</p> : null}
      </div>
      <ChevronRight size={16} />
    </div>
  );
}

function TodoView({ goTo }: { goTo: (page: PageKey) => void }) {
  return (
    <>
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">今日待办</div>
          <h2>先处理待环检、待签字、待派工</h2>
          <p>把一线顾问最急的动作压到首屏，减少在流程页之间来回切换。</p>
          <button className="primary-button" onClick={() => goTo('intake')}>
            进入待环检
          </button>
        </div>
        <img src={serviceReception} alt="门店接待场景" />
      </section>

      <section className="panel">
        <SectionTitle title="待办总览" hint="今日关键动作" />
        <div className="summary-grid">
          <SummaryCard label="待环检" value="06" trend="3 台已到店待留痕" tone="warning" />
          <SummaryCard label="待签字" value="03" trend="2 份委托书已生成" />
          <SummaryCard label="待派工" value="05" trend="异响诊断优先处理" />
          <SummaryCard label="待结算" value="05" trend="1 单存在担保信息" tone="success" />
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="四个待办入口" hint="点击进入对应处理页" />
        <div className="shortcut-list">
          {TODO_ITEMS.map((item) => (
            <button key={item.title} className="shortcut-item" onClick={() => goTo(item.key)}>
              <span className="shortcut-icon">{item.key === 'intake' ? <ScanLine size={15} /> : item.key === 'workorder' ? <ClipboardPenLine size={15} /> : <Cog size={15} />}</span>
              <span className="shortcut-copy">
                <strong>{item.title}</strong>
                <em>{item.desc}</em>
              </span>
              <strong>{item.count}</strong>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="待办时间线" hint="按处理先后推进" />
        <div className="timeline-list">
          {[
            { time: '09:30', title: '浙A·E5268 待环检', desc: '客户已到店，需完成外观五视图与签字前检查', tone: 'warning' },
            { time: '10:40', title: '沪C·Q9182 环检完成', desc: '已可转委托书，客户待签字', tone: 'primary' },
            { time: '13:20', title: '苏B·8T223 待派工', desc: '异响诊断项目已开单，等待分配机修二组', tone: 'warning' },
            { time: '16:10', title: '浙A·M9201 待结算', desc: '已生成结算单，等待移动支付', tone: 'success' },
          ].map((item) => (
            <div key={item.time} className="timeline-item">
              <span className={`timeline-dot timeline-dot--${item.tone}`} />
              <div className="timeline-time">{item.time}</div>
              <div className="timeline-copy">
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ResourceView({ goTo }: { goTo: (page: PageKey) => void }) {
  return (
    <>
      <section className="panel">
        <SectionTitle title="业务资源" hint="一线查询入口" />
        <div className="shortcut-list">
          {RESOURCE_ITEMS.map((item) => (
            <button key={item.title} className="shortcut-item" onClick={() => goTo(item.key)}>
              <span className="shortcut-icon">{item.title === '客户档案' ? <UserRound size={15} /> : item.title === '车辆基本信息' ? <CarFront size={15} /> : <PackageCheck size={15} />}</span>
              <span className="shortcut-copy">
                <strong>{item.title}</strong>
                <em>{item.desc}</em>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="常查字段" hint="资源内容示意" />
        <div className="check-list">
          <div className="check-row"><span>客户档案</span><strong>姓名 / 手机 / 历史到店 / 满意度</strong></div>
          <div className="check-row"><span>车辆基本信息</span><strong>VIN / 车型 / 里程 / 权益 / 保险</strong></div>
          <div className="check-row"><span>备件信息</span><strong>库存 / 价格 / 适用车型 / 领料状态</strong></div>
        </div>
      </section>
    </>
  );
}

function DashboardView({ goTo }: { goTo: (page: PageKey) => void }) {
  return (
    <>
      <section className="panel">
        <SectionTitle title="业务看板" hint="台账入口" />
        <div className="shortcut-list">
          {DASHBOARD_ITEMS.map((item) => (
            <button key={item.title} className="shortcut-item" onClick={() => goTo(item.key)}>
              <span className="shortcut-icon">{item.title === '结算台账' ? <ReceiptText size={15} /> : item.title === '维修材料台账' ? <PackageCheck size={15} /> : <Wrench size={15} />}</span>
              <span className="shortcut-copy">
                <strong>{item.title}</strong>
                <em>{item.desc}</em>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="今日看板摘要" hint="台账焦点" />
        <div className="summary-grid">
          <SummaryCard label="维修项目台账" value="128" trend="高频项目：A保养套餐" />
          <SummaryCard label="维修材料台账" value="86" trend="轮胎与机油消耗较高" tone="warning" />
          <SummaryCard label="结算台账" value="42" trend="今日实收 ¥58,420" tone="success" />
        </div>
      </section>
    </>
  );
}

function AppointmentView() {
  const [status, setStatus] = useState<AppointmentStatus>('待跟进');
  const visibleItems = useMemo(() => APPOINTMENTS.filter((item) => item.status === status), [status]);
  const selected = visibleItems[0] || APPOINTMENTS[0];

  return (
    <>
      <section className="panel panel--tight">
        <div className="filter-row">
          {(['待跟进', '已确认', '已到店'] as AppointmentStatus[]).map((item) => (
            <button key={item} className={`chip ${status === item ? 'active' : ''}`} onClick={() => setStatus(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="tool-row">
          <div className="search-box">
            <Search size={14} />
            <span>车牌号 / VIN / 联系人</span>
          </div>
          <button className="ghost-pill">仅看自己</button>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="预约列表" hint="预约跟进" />
        <div className="appointment-list">
          {visibleItems.map((item) => (
            <article key={item.id} className="appointment-card">
              <div className="appointment-top">
                <div>
                  <strong>{item.plateNo}</strong>
                  <p>{item.ownerName} · {item.serviceType}</p>
                </div>
                <span className={`status-pill status-pill--${statusClass(item.status)}`}>{item.status}</span>
              </div>
              <dl>
                <div><dt>预约时间</dt><dd>{item.appointmentTime}</dd></div>
                <div><dt>服务顾问</dt><dd>{item.advisor}</dd></div>
                <div><dt>交车方式</dt><dd>{item.pickupMode}</dd></div>
              </dl>
              <div className="appointment-actions">
                <button><Phone size={14} /> 拨号</button>
                <button>跟进</button>
                <button className="button-primary-inline">调整时段</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dual-panel dual-panel--appointments">
        <article className="panel">
          <SectionTitle title="预约时段看板" hint="时段余量" />
          <div className="slot-board">
            {[
              ['09:00', 1],
              ['10:00', 3],
              ['11:00', 0],
              ['13:00', 2],
              ['14:00', 2],
              ['15:00', 1],
            ].map(([time, remain]) => (
              <div key={time} className={`slot-item ${Number(remain) === 0 ? 'disabled' : ''}`}>
                <strong>{time}</strong>
                <span>剩余 {remain}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="新建预约单" hint="预约核心字段预填" />
          <div className="form-preview">
            <div className="field-row"><span>车牌号</span><strong>{selected.plateNo}</strong></div>
            <div className="field-row"><span>联系人</span><strong>{selected.ownerName} / {selected.phone}</strong></div>
            <div className="field-row"><span>预计来店</span><strong>2025-09-18 {selected.appointmentTime}</strong></div>
            <div className="field-row"><span>交车方式</span><strong>{selected.pickupMode}</strong></div>
            <div className="hint-banner">
              <TriangleAlert size={16} />
              <span>{selected.note}</span>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

function IntakeView() {
  const [currentView, setCurrentView] = useState<'左前' | '右前' | '左后' | '右后'>('左前');

  return (
    <>
      <section className="hero-strip">
        <img src={cockpitCheck} alt="驾驶舱检查场景" />
        <div>
          <strong>浙A·E5268</strong>
          <p>OCR 扫牌已识别，VIN 与本店车辆信息匹配</p>
          <div className="tag-row">
            <span className="mini-tag"><ScanLine size={12} /> VIN 已核验</span>
            <span className="mini-tag"><Camera size={12} /> 水印留痕开启</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="车辆基础信息" hint="接车建档字段" />
        <div className="grid-lines">
          <div><span>里程</span><strong>18,420 km</strong></div>
          <div><span>保险到期</span><strong>2026-03-18</strong></div>
          <div><span>油量 / 电量</span><strong>31% / 68%</strong></div>
          <div><span>洗车 / 补能</span><strong>是 / 是</strong></div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="外观五视图检查" hint="异常点记录" />
        <div className="view-tabs">
          {(['左前', '右前', '左后', '右后'] as Array<'左前' | '右前' | '左后' | '右后'>).map((item) => (
            <button key={item} className={`chip chip--small ${currentView === item ? 'active' : ''}`} onClick={() => setCurrentView(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="car-view">
          <div className="car-silhouette">
            <CarFront size={92} />
            {INTAKE_POINTS.filter((item) => item.view === currentView).map((point) => (
              <span
                key={point.id}
                className={`damage-dot damage-dot--${point.status}`}
                style={{ left: point.position.left, top: point.position.top }}
              />
            ))}
          </div>
          <div className="issue-list">
            {INTAKE_POINTS.filter((item) => item.view === currentView).map((item) => (
              <div key={item.id} className="issue-row">
                <span className={`bullet bullet--${item.status}`} />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.status === 'warning' ? '已拍 2 张照片，等待客户确认' : '已完成检查，记录正常'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="内饰检查" hint="异常项必须留证" />
          <div className="check-list">
            {[
              ['仪表报警灯', '正常'],
              ['空调制冷效果', '需关注'],
              ['贵重物品确认', '已带离'],
              ['车机功能', '正常'],
            ].map(([label, result]) => (
              <div key={label} className="check-row">
                <span>{label}</span>
                <strong className={result === '需关注' ? 'text-warning' : ''}>{result}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="客户诉求与签字" hint="客户确认信息" />
          <div className="quote-box">
            <MessageSquareText size={16} />
            <p>“右后轮高速有轻微抖动，保养同时帮忙看看胎噪问题。”</p>
          </div>
          <div className="signature-box">
            <span>客户电子签字</span>
            <strong>陈先生</strong>
          </div>
        </article>
      </section>
    </>
  );
}

function WorkOrderView() {
  return (
    <>
      <section className="hero-strip">
        <img src={frontDesk} alt="门店服务顾问场景" />
        <div>
          <strong>委托书 WO2025-0918-028</strong>
          <p>由环检单转入，含保养、异响诊断与轮胎建议项目</p>
          <div className="tag-row">
            <span className="mini-tag"><Clock3 size={12} /> 待派工</span>
            <span className="mini-tag"><PackageCheck size={12} /> 材料已匹配</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="委托摘要" hint="工时、材料、折扣权限联动" />
        <div className="grid-lines">
          <div><span>车牌 / VIN</span><strong>浙A·E5268 / LFV1A23...</strong></div>
          <div><span>服务顾问</span><strong>李顾问</strong></div>
          <div><span>维修类别</span><strong>定期保养 + 异响检查</strong></div>
          <div><span>预计交车</span><strong>今日 18:30</strong></div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="维修项目与材料" hint="移动开单结构" />
        <div className="order-lines">
          {WORKORDER_LINES.map((line) => (
            <div key={line.name} className="order-line">
              <div>
                <strong>{line.name}</strong>
                <p>工时 ¥{line.labor} · 材料 ¥{line.material}</p>
              </div>
              <span className={`status-pill status-pill--${line.status === '待客户确认' ? 'warning' : 'primary'}`}>{line.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="费用汇总" hint="折扣校验后的可视结果" />
          <div className="fee-breakdown">
            <div><span>工时费</span><strong>¥660</strong></div>
            <div><span>材料费</span><strong>¥1,267</strong></div>
            <div><span>顾问折扣</span><strong className="text-success">- ¥279</strong></div>
            <div className="total-line"><span>预计应收</span><strong>¥1,648</strong></div>
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="附件与确认" hint="附件记录" />
          <div className="attachment-list">
            <div><Camera size={14} /> 仪表里程照片</div>
            <div><Camera size={14} /> 右后轮胎异常照片</div>
            <div><ClipboardPenLine size={14} /> 客户签字已同步</div>
          </div>
        </article>
      </section>
    </>
  );
}

function DispatchView() {
  const [tasks, setTasks] = useState(() => DISPATCH_TASKS.map((task, index) => ({ ...task, selected: index === 0 })));
  const [dispatchNotice, setDispatchNotice] = useState('点击项目按钮可勾选待派工任务');
  const groupOptions = ['机修一组', '机修二组', '轮胎快修组', '电诊专岗'];
  const techMap: Record<string, string> = {
    '机修一组': '张伟',
    '机修二组': '刘洋',
    '轮胎快修组': '赵明',
    '电诊专岗': '周凯',
  };

  const selectedCount = tasks.filter((task) => task.selected).length;
  const dispatchedCount = tasks.filter((task) => task.status === '已派工').length;
  const adjustableCount = tasks.filter((task) => task.status === '待派工').length;

  const toggleTask = (item: string) => {
    setTasks((current) =>
      current.map((task) => (task.item === item ? { ...task, selected: !task.selected } : task)),
    );
    setDispatchNotice(`已切换 ${item} 的勾选状态`);
  };

  const rotateGroup = (item: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.item !== item || task.status === '待客户确认') return task;
        const currentIndex = groupOptions.indexOf(task.group);
        const nextGroup = groupOptions[(currentIndex + 1) % groupOptions.length];
        return {
          ...task,
          group: nextGroup,
          tech: techMap[nextGroup] || task.tech,
        };
      }),
    );
    setDispatchNotice(`已为 ${item} 切换班组`);
  };

  const confirmDispatch = (item: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.item !== item || task.status === '待客户确认') return task;
        const nextStatus = task.status === '已派工' ? '待派工' : '已派工';
        return {
          ...task,
          status: nextStatus,
          selected: nextStatus === '已派工' ? false : task.selected,
          tech: task.tech === '待选择' && nextStatus === '已派工' ? techMap[task.group] || '张伟' : task.tech,
        };
      }),
    );
    setDispatchNotice(`已更新 ${item} 的派工状态`);
  };

  return (
    <>
      <section className="panel">
        <SectionTitle title="待派工总览" hint="委托书确认开工后进入派工池" />
        <div className="summary-grid">
          <SummaryCard label="待派工项目" value={String(selectedCount).padStart(2, '0')} trend="1 项等待客户确认" tone="warning" />
          <SummaryCard label="可用班组" value="04" trend="机修 2 组 / 快修 1 组" />
          <SummaryCard label="今日已派工" value={String(dispatchedCount).padStart(2, '0')} trend="派工完成率 84%" tone="success" />
          <SummaryCard label="待调整派工" value={String(adjustableCount).padStart(2, '0')} trend="异响诊断尚未指定技师" />
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="项目派工明细" hint="派工处理" />
        <div className="hint-banner hint-banner--soft">
          <Cog size={16} />
          <span>{dispatchNotice}</span>
        </div>
        <div className="dispatch-list">
          {tasks.map((task) => (
            <article key={task.item} className={`dispatch-card ${task.selected ? 'dispatch-card--selected' : ''}`}>
              <div className="dispatch-head">
                <div>
                  <strong>{task.item}</strong>
                  <p>{task.group} · 预计 {task.duration}</p>
                </div>
                <span className={`status-pill status-pill--${task.status === '已派工' ? 'success' : task.status === '待派工' ? 'warning' : 'primary'}`}>{task.status}</span>
              </div>
              <div className="field-row"><span>当前技师</span><strong>{task.tech}</strong></div>
              <div className="dispatch-actions">
                <button className={`ghost-pill ${task.selected ? 'ghost-pill--active' : ''}`} onClick={() => toggleTask(task.item)}>
                  {task.selected ? '已勾选项目' : '勾选项目'}
                </button>
                <button className="ghost-pill" onClick={() => rotateGroup(task.item)} disabled={task.status === '待客户确认'}>
                  选择班组
                </button>
                <button className="button-primary-inline" onClick={() => confirmDispatch(task.item)} disabled={task.status === '待客户确认'}>
                  {task.status === '已派工' ? '修改派工' : '确认派工'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="班组负荷" hint="派工前快速判断工位余量" />
          <div className="check-list">
            <div className="check-row"><span>机修一组</span><strong>4 / 5 工位</strong></div>
            <div className="check-row"><span>机修二组</span><strong>3 / 4 工位</strong></div>
            <div className="check-row"><span>轮胎快修组</span><strong>2 / 3 工位</strong></div>
            <div className="check-row"><span>电诊专岗</span><strong>1 / 2 工位</strong></div>
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="派工规则" hint="处理要求" />
          <div className="attachment-list">
            <div><PackageCheck size={14} /> 委托书需先确认开工</div>
            <div><Cog size={14} /> 可按班组或技师分配</div>
            <div><TriangleAlert size={14} /> 已派工项目可再次调整</div>
          </div>
        </article>
      </section>
    </>
  );
}

function ClockingView() {
  const [tasks, setTasks] = useState(CLOCKING_TASKS);
  const [clockingNotice, setClockingNotice] = useState('请选择当前施工状态');

  const progressCount = tasks.filter((task) => task.status === '进行中').length;
  const pendingCount = tasks.filter((task) => task.status === '待开工').length;
  const pausedCount = tasks.filter((task) => task.status === '已暂停').length;
  const finishableCount = tasks.filter((task) => task.status === '待完工').length;

  const advanceClocking = (item: string) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.item !== item) return task;
        if (task.action === '开工') {
          return { ...task, status: '进行中', startedAt: '11:20', spent: '00:08', action: '暂停' };
        }
        if (task.action === '暂停') {
          return { ...task, status: '已暂停', action: '恢复' };
        }
        if (task.action === '恢复') {
          return { ...task, status: '待完工', action: '完工', spent: '00:38' };
        }
        return { ...task, status: '已完工', action: '已完工', spent: '01:20' };
      }),
    );
    setClockingNotice(`已更新 ${item} 的打卡状态`);
  };

  return (
    <>
      <section className="panel">
        <SectionTitle title="技师任务看板" hint="只显示派给本人的施工项目" />
        <div className="summary-grid">
          <SummaryCard label="进行中" value={String(progressCount).padStart(2, '0')} trend="A保养套餐已开工" />
          <SummaryCard label="待开工" value={String(pendingCount).padStart(2, '0')} trend="异响诊断待接手" tone="warning" />
          <SummaryCard label="已暂停" value={String(pausedCount).padStart(2, '0')} trend="轮胎更换等待配件" />
          <SummaryCard label="待完工" value={String(finishableCount).padStart(2, '0')} trend="制动检查可提交完工" tone="success" />
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="开工打卡记录" hint="施工状态" />
        <div className="hint-banner hint-banner--soft">
          <TimerReset size={16} />
          <span>{clockingNotice}</span>
        </div>
        <div className="clocking-list">
          {tasks.map((task) => (
            <article key={`${task.plate}-${task.item}`} className="clock-card">
              <div className="dispatch-head">
                <div>
                  <strong>{task.item}</strong>
                  <p>{task.plate}</p>
                </div>
                <span className={`status-pill status-pill--${task.status === '进行中' || task.status === '待完工' ? 'success' : task.status === '待开工' ? 'warning' : 'primary'}`}>{task.status}</span>
              </div>
              <div className="clock-meta">
                <div><span>开工时间</span><strong>{task.startedAt}</strong></div>
                <div><span>累计工时</span><strong>{task.spent}</strong></div>
              </div>
              <div className="dispatch-actions">
                <button className="ghost-pill"><TimerReset size={14} /> 维修记录</button>
                <button className="button-primary-inline" onClick={() => advanceClocking(task.item)} disabled={task.action === '已完工'}>
                  {task.action}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="打卡时间线" hint="施工记录" />
          <div className="timeline-list timeline-list--compact">
            {[
              { time: '10:18', title: 'A保养套餐开工', desc: '张伟已开始施工', tone: 'success' },
              { time: '10:44', title: '轮胎更换暂停', desc: '等待客户确认增项', tone: 'warning' },
              { time: '11:05', title: '制动检查恢复', desc: '补拍工序照片后继续', tone: 'primary' },
            ].map((item) => (
              <div key={item.time} className="timeline-item">
                <span className={`timeline-dot timeline-dot--${item.tone}`} />
                <div className="timeline-time">{item.time}</div>
                <div className="timeline-copy">
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="完工前检查" hint="进入质检前的最后动作" />
          <div className="attachment-list">
            <div><CircleCheckBig size={14} /> 必做工序已完成</div>
            <div><Camera size={14} /> 必拍照片已上传</div>
            <div><HardHat size={14} /> 可提交完工，等待质检验收</div>
          </div>
        </article>
      </section>
    </>
  );
}

function ReportView() {
  return (
    <>
      <section className="panel report-hero">
        <div className="score-ring">
          <div className="score-ring__inner">
            <span>综合评分</span>
            <strong>79.1</strong>
          </div>
        </div>
        <div className="report-copy">
          <h3>检测已完成，请优先确认轮胎与外观异常</h3>
          <p>当前报告已生成，可用于结果确认与增项处理。</p>
          <div className="tag-row">
            <span className="mini-tag"><Gauge size={12} /> 16 个检测点</span>
            <span className="mini-tag"><CircleCheckBig size={12} /> 已完成拍照留证</span>
          </div>
        </div>
      </section>

      <section className="panel image-panel">
        <img src={tireCheck} alt="轮胎检测场景" />
        <div>
          <SectionTitle title="异常检测结果" hint="技师留言与推荐项目联动" />
          <div className="report-list">
            {REPORT_ITEMS.map((item) => (
              <div key={item.label} className="report-item">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.desc}</p>
                </div>
                <span className={`status-pill status-pill--${item.score === '良好' ? 'success' : 'warning'}`}>{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="推荐增项" hint="建议项目" />
          <div className="recommend-card">
            <Wrench size={18} />
            <div>
              <strong>右后轮胎更换</strong>
              <p>推荐工时 0.6h，材料 ¥699，影响高速稳定性</p>
            </div>
          </div>
          <div className="recommend-card">
            <Sparkles size={18} />
            <div>
              <strong>左前翼子板抛光修复</strong>
              <p>建议作为快修增项，提升客户满意度</p>
            </div>
          </div>
        </article>

        <article className="panel">
          <SectionTitle title="结果确认状态" hint="确认进度" />
          <div className="check-list">
            <div className="check-row"><span>确认状态</span><strong className="text-warning">待确认</strong></div>
            <div className="check-row"><span>预计处理时长</span><strong>06 分钟</strong></div>
            <div className="check-row"><span>分享状态</span><strong>未分享</strong></div>
            <div className="check-row"><span>增项结果</span><strong>待客户确认</strong></div>
          </div>
        </article>
      </section>
    </>
  );
}

function SettlementView() {
  return (
    <>
      <section className="panel">
        <SectionTitle title="结算单摘要" hint="费用汇总" />
        <div className="invoice-card">
          <div className="invoice-card__top">
            <div>
              <strong>SET2025-0918-106</strong>
              <p>委托书 WO2025-0918-028 · 结算专员 张琳</p>
            </div>
            <span className="status-pill status-pill--success">待支付</span>
          </div>
          <div className="invoice-total">¥1,648</div>
          <div className="fee-breakdown">
            <div><span>维修项目</span><strong>¥1,180</strong></div>
            <div><span>材料费用</span><strong>¥1,267</strong></div>
            <div><span>优惠金额</span><strong className="text-success">- ¥799</strong></div>
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="支付方式" hint="付款信息" />
        <div className="payment-grid">
          {PAYMENT_METHODS.map((item) => (
            <button key={item.name} className={`payment-item ${item.active ? 'active' : ''}`}>
              <span>{item.name}</span>
              <strong>{item.value}</strong>
            </button>
          ))}
        </div>
        <div className="hint-banner hint-banner--soft">
          <WalletCards size={16} />
          <span>若支付金额小于应收金额，需补充担保人信息。</span>
        </div>
      </section>

      <section className="dual-panel">
        <article className="panel">
          <SectionTitle title="交车提醒" hint="交车信息" />
          <div className="check-list">
            <div className="check-row"><span>担保人</span><strong>无需担保</strong></div>
            <div className="check-row"><span>回访时段</span><strong>明日 14:00-16:00</strong></div>
            <div className="check-row"><span>下次保养里程</span><strong>24,000 km</strong></div>
            <div className="check-row"><span>下次保养日期</span><strong>2026-03-18</strong></div>
          </div>
        </article>

        <article className="panel action-panel">
          <SectionTitle title="结算动作" hint="交车确认" />
          <button className="primary-button primary-button--large">确认结算并交车</button>
          <button className="secondary-button">编辑支付方式</button>
        </article>
      </section>
    </>
  );
}

function MineView() {
  return (
    <>
      <section className="panel profile-panel">
        <div className="avatar-card">李</div>
        <div>
          <h3>李顾问</h3>
          <p>杭州滨江门店 · 服务顾问</p>
        </div>
      </section>

      <section className="panel">
        <SectionTitle title="账号与门店" />
        <div className="check-list">
          <div className="check-row"><span>登录方式</span><strong>企业微信</strong></div>
          <div className="check-row"><span>企业编号</span><strong>HZ-SVC-018</strong></div>
          <div className="check-row"><span>工作身份</span><strong>服务顾问</strong></div>
          <div className="check-row"><span>当前门店</span><strong>杭州滨江门店</strong></div>
        </div>
      </section>
    </>
  );
}

const Component = () => {
  const [activePage, setActivePage] = useState<PageKey>(() => getPathPage());

  useEffect(() => {
    syncLocation(activePage);
  }, [activePage]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const updateHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty('--icar-app-height', `${Math.round(height)}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('resize', updateHeight);
    };
  }, []);

  const activeWorkflow = WORKFLOW_PAGES.find((item) => item.key === activePage);
  const pageTitle =
    activePage === 'todo'
      ? '待办'
      : activePage === 'resources'
        ? '资源'
        : activePage === 'dashboard'
          ? '看板'
          : activePage === 'mine'
            ? '我的'
            : activeWorkflow?.label;
  const pageDesc =
    activePage === 'todo'
      ? '门店业务待处理中心'
      : activePage === 'resources'
        ? '客户、车辆、备件资源入口'
        : activePage === 'dashboard'
          ? '维修项目、材料、结算台账'
          : activePage === 'mine'
            ? '个人与门店信息'
            : '业务处理页面';

  return (
    <div className="icar-app-shell">
      <div className="icar-device">
        <div className="icar-screen">
          <header className="icar-header">
            <div className="status-row">
              <span>9:41</span>
              <span>5G · 100%</span>
            </div>
            <div className="title-row">
              <div>
                <div className="header-kicker">售后服务</div>
                <h1>{pageTitle}</h1>
                <p>{pageDesc}</p>
              </div>
              <div className="header-badge">
                <span>今日待办</span>
                <strong>14</strong>
              </div>
            </div>
            <div className="workflow-strip">
              {WORKFLOW_PAGES.map((item) => (
                <button
                  key={item.key}
                  className={`workflow-pill ${activePage === item.key ? 'active' : ''}`}
                  onClick={() => setActivePage(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </header>

          <main className="icar-content">
            {activePage === 'todo' && <TodoView goTo={setActivePage} />}
            {activePage === 'resources' && <ResourceView goTo={setActivePage} />}
            {activePage === 'dashboard' && <DashboardView goTo={setActivePage} />}
            {activePage === 'appointments' && <AppointmentView />}
            {activePage === 'intake' && <IntakeView />}
            {activePage === 'workorder' && <WorkOrderView />}
            {activePage === 'dispatch' && <DispatchView />}
            {activePage === 'clocking' && <ClockingView />}
            {activePage === 'report' && <ReportView />}
            {activePage === 'settlement' && <SettlementView />}
            {activePage === 'mine' && <MineView />}
          </main>

          <nav className="bottom-nav">
            {BOTTOM_TABS.map((item) => {
              const isActive =
                activePage === item.key;

              return (
                <button
                  key={item.key}
                  className={`bottom-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setActivePage(item.key)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Component;
