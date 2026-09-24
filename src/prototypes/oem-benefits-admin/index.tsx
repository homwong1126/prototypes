/**
 * @name 主机厂权益中心管理后台
 * @mode axure
 *
 * 参考资料：
 * - /skills/axure-export-workflow/SKILL.md
 * - /src/themes/fuse-design-pc/DESIGN.md
 *
 * 参考：主机厂售后维保系统完整PRD.md
 * 主题：Fuse Design Pc
 */
import React, { useState } from 'react'
import cheryLogo from '../../assets/chery-logo.png'
import './style.css'

// ─── 公共组件 ────────────────────────────────────────────────────────────────

type IconName =
  | 'overview'
  | 'mall'
  | 'package'
  | 'rescue'
  | 'warranty'
  | 'lifetime'
  | 'distribute'
  | 'records'
  | 'brand'
  | 'success'
  | 'error'
  | 'close'
  | 'warning'
  | 'activity'

function Icon({ name, size = 18, stroke = 'currentColor' }: { name: IconName; size?: number; stroke?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'overview':
      return <svg {...common}><path d="M4 19V10" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19V8" /></svg>
    case 'mall':
      return <svg {...common}><path d="M4 8h16l-1.5 11H5.5L4 8Z" /><path d="M9 8V6a3 3 0 1 1 6 0v2" /></svg>
    case 'package':
      return <svg {...common}><path d="m12 3 8 4.5-8 4.5L4 7.5 12 3Z" /><path d="M4 7.5V16l8 5 8-5V7.5" /><path d="M12 12v9" /></svg>
    case 'rescue':
      return <svg {...common}><path d="M10 13 8 9l-3 5" /><path d="M14 13h5l-2.5-4" /><path d="M12 3v6" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" /></svg>
    case 'warranty':
      return <svg {...common}><path d="M12 3 5 6v5c0 4.5 2.8 7.8 7 10 4.2-2.2 7-5.5 7-10V6l-7-3Z" /><path d="m9.5 12 1.7 1.7 3.3-3.7" /></svg>
    case 'lifetime':
      return <svg {...common}><path d="M18 8c-1.7 0-2.8 1-4 2.5C12.8 9 11.7 8 10 8a4 4 0 0 0 0 8c1.7 0 2.8-1 4-2.5 1.2 1.5 2.3 2.5 4 2.5a4 4 0 0 0 0-8Z" /></svg>
    case 'distribute':
      return <svg {...common}><path d="M4 12h11" /><path d="m11 5 7 7-7 7" /><path d="M4 6h6" /><path d="M4 18h6" /></svg>
    case 'records':
      return <svg {...common}><path d="M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z" /><path d="M9 8h6" /><path d="M9 12h6" /></svg>
    case 'brand':
      return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 15.5V8.5h5.2a2.3 2.3 0 1 1 0 4.6H8" /><path d="M13.4 13.1 16 15.5" /></svg>
    case 'success':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.2 2.3 2.3 4.7-5" /></svg>
    case 'error':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6" /><path d="m15 9-6 6" /></svg>
    case 'close':
      return <svg {...common}><path d="m6 6 12 12" /><path d="M18 6 6 18" /></svg>
    case 'warning':
      return <svg {...common}><path d="M12 4 3.8 19h16.4L12 4Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>
    case 'activity':
      return <svg {...common}><path d="M3 12h4l2-5 4 10 2-5h6" /></svg>
  }
}

function Switch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div className={`switch ${on ? 'on' : 'off'}`} onClick={onChange}>
      <div className="switch-dot" />
    </div>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        <Icon name={type === 'success' ? 'success' : 'error'} size={16} />
      </span>
      {msg}
    </div>
  )
}

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const show = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }
  return { toast, show }
}

// ─── 侧边栏 ──────────────────────────────────────────────────────────────────

function Sidebar({ active, onNav }: { active: string; onNav: (k: string) => void }) {
  const menus = [
    { section: '权益管理', items: [
      { icon: 'overview' as IconName, label: '权益总览', key: 'overview' },
      { icon: 'mall' as IconName, label: '商城权益', key: 'mall' },
      { icon: 'package' as IconName, label: '保养套餐', key: 'package' },
      { icon: 'rescue' as IconName, label: '道路救援', key: 'rescue' },
      { icon: 'warranty' as IconName, label: '延保服务', key: 'warranty' },
      { icon: 'lifetime' as IconName, label: '终身质保', key: 'lifetime' },
    ]},
    { section: '发放管理', items: [
      { icon: 'distribute' as IconName, label: '批量发放', key: 'distribute' },
      { icon: 'records' as IconName, label: '发放记录', key: 'records' },
    ]},
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={cheryLogo} alt="CHERY" className="sidebar-logo-image" />
        权益中心
      </div>
      {menus.map(g => (
        <div key={g.section} className="sidebar-section">
          <div className="sidebar-section-title">{g.section}</div>
          {g.items.map(item => (
            <div key={item.key} className={`sidebar-item ${active === item.key ? 'active' : ''}`} onClick={() => onNav(item.key)}>
              <span className="sidebar-item-icon"><Icon name={item.icon} size={16} /></span>{item.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Tab0: 权益总览 ───────────────────────────────────────────────────────────

function TabOverview({ onNav }: { onNav: (k: string) => void }) {
  const stats = [
    { icon: 'mall' as IconName, label: '商城权益', value: 24, sub: '12 个活跃', color: '#2251ff', key: 'mall' },
    { icon: 'package' as IconName, label: '保养套餐', value: 8, sub: '6 个在售', color: '#22a06b', key: 'package' },
    { icon: 'rescue' as IconName, label: '道路救援', value: 3, sub: '规则配置', color: '#f08c2e', key: 'rescue' },
    { icon: 'warranty' as IconName, label: '延保服务', value: 5, sub: '4 个在售', color: '#5b4fe9', key: 'warranty' },
    { icon: 'lifetime' as IconName, label: '终身质保', value: 2, sub: '2 个方案', color: '#c4841d', key: 'lifetime' },
    { icon: 'distribute' as IconName, label: '本月发放', value: '12,480', sub: '权益份数', color: '#0f9fb8', key: 'distribute' },
  ]
  const logs = [
    { color: '#176bf8', text: '新增优惠券模板「618大促满减券」', time: '2026-03-27 14:32', op: '张运营' },
    { color: '#52c41a', text: '修改保养套餐「全合成机油套餐」价格为 ¥680', time: '2026-03-27 11:15', op: '李管理' },
    { color: '#d48806', text: '启用终身质保方案「首任车主终身质保」', time: '2026-03-26 16:40', op: '王总监' },
    { color: '#722ed1', text: '新增延保方案「5年延保豪华版」', time: '2026-03-26 10:20', op: '张运营' },
    { color: '#fa8c16', text: '修改道路救援年度次数为 5 次', time: '2026-03-25 15:08', op: '李管理' },
    { color: '#ff4d4f', text: '停用优惠券模板「旧版新人券」', time: '2026-03-25 09:30', op: '张运营' },
  ]
  return (
    <div>
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.key} className="stat-card" onClick={() => onNav(s.key)}>
            <div className="s-icon" style={{ color: s.color }}><Icon name={s.icon} size={22} stroke={s.color} /></div>
            <div className="s-value" style={{ color: s.color }}>{s.value}</div>
            <div className="s-label">{s.label}</div>
            <div className="s-change" style={{ color: 'rgba(0,0,0,0.35)' }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-title">近期操作记录</div>
        {logs.map((l, i) => (
          <div key={i} className="log-item">
            <div className="log-dot" style={{ background: l.color }} />
            <div className="log-content">
              <div>{l.text}</div>
              <div className="log-time">{l.time} · {l.op}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tab1: 商城权益 ───────────────────────────────────────────────────────────

const COUPONS_TMPL = [
  { id: 1, name: '新人专享满减券', type: '满减券', amount: '满200减50', scope: '全场通用', total: 5000, used: 1280, status: true, expire: '2026-06-30' },
  { id: 2, name: '618大促满减券', type: '满减券', amount: '满300减80', scope: '商城全场', total: 10000, used: 0, status: true, expire: '2026-06-18' },
  { id: 3, name: '配件专属折扣券', type: '折扣券', amount: '9折', scope: '原厂配件', total: 2000, used: 456, status: true, expire: '2026-12-31' },
  { id: 4, name: '保养代金券', type: '代金券', amount: '¥100', scope: '保养项目', total: 3000, used: 890, status: false, expire: '2026-09-30' },
  { id: 5, name: '旧版新人券', type: '满减券', amount: '满100减20', scope: '全场通用', total: 1000, used: 1000, status: false, expire: '2025-12-31' },
]

function TabMall() {
  const [coupons, setCoupons] = useState(COUPONS_TMPL)
  const [showModal, setShowModal] = useState(false)
  const [pointsRule, setPointsRule] = useState({ base: '1', multiple: '2', maxMonth: '5000' })
  const { toast, show } = useToast()

  const toggleStatus = (id: number) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: !c.status } : c))
    show('状态已更新')
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* 积分规则 */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">积分规则配置</div>
          <button className="btn btn-primary btn-sm" onClick={() => show('积分规则已保存')}>保存设置</button>
        </div>
        <div className="form-grid form-grid-3">
          <div className="form-item">
            <label className="form-label"><span className="req">*</span>消费积分比例</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>每消费 ¥1 获得</span>
              <input className="form-input" style={{ width: 60 }} value={pointsRule.base} onChange={e => setPointsRule(p => ({ ...p, base: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>积分</span>
            </div>
          </div>
          <div className="form-item">
            <label className="form-label">活动积分倍数</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>活动期间</span>
              <input className="form-input" style={{ width: 60 }} value={pointsRule.multiple} onChange={e => setPointsRule(p => ({ ...p, multiple: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>倍</span>
            </div>
          </div>
          <div className="form-item">
            <label className="form-label">每月积分上限</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className="form-input" style={{ width: 80 }} value={pointsRule.maxMonth} onChange={e => setPointsRule(p => ({ ...p, maxMonth: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>积分/月</span>
            </div>
          </div>
        </div>
      </div>

      {/* 优惠券模板 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>优惠券模板管理</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ 新建模板</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>模板名称</th><th>类型</th><th>优惠内容</th><th>适用范围</th><th>发放总量</th><th>已使用</th><th>有效期</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 500 }}>{c.name}</td>
                <td><span className="tag tag-blue">{c.type}</span></td>
                <td style={{ fontWeight: 600, color: '#ff4d4f' }}>{c.amount}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{c.scope}</td>
                <td>{c.total.toLocaleString()}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-bar" style={{ width: 60 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((c.used / c.total) * 100, 100)}%`, background: '#176bf8' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{c.used.toLocaleString()}</span>
                  </div>
                </td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{c.expire}</td>
                <td><Switch on={c.status} onChange={() => toggleStatus(c.id)} /></td>
                <td>
                  <button className="btn btn-text btn-sm">编辑</button>
                  <button className="btn btn-text btn-sm">发放</button>
                  <button className="btn btn-danger-text btn-sm">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新建模板弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">新建优惠券模板 <button className="btn btn-icon" onClick={() => setShowModal(false)}><Icon name="close" size={16} /></button></div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: 16 }}>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label"><span className="req">*</span>模板名称</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="如：618大促满减券" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>券类型</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>满减券</option><option>折扣券</option><option>代金券</option>
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>适用范围</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>全场通用</option><option>原厂配件</option><option>保养项目</option><option>商城全场</option>
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>使用门槛（元）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" placeholder="200" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>优惠金额（元）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" placeholder="50" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>发放总量</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" placeholder="5000" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>有效期至</label>
                  <input className="form-input" style={{ width: '100%' }} type="date" />
                </div>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">使用说明</label>
                  <textarea className="form-textarea" rows={2} style={{ width: '100%' }} placeholder="券的使用说明，将展示给车主" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); show('优惠券模板创建成功') }}>确认创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab2: 保养套餐 ───────────────────────────────────────────────────────────

const PACKAGES_DATA = [
  { id: 1, name: '基础保养套餐', items: '机油+机滤+检查', times: 5, price: 1280, models: '全系车型', status: true, sold: 3420 },
  { id: 2, name: '全合成机油套餐', items: '5W-40全合成+机滤', times: 3, price: 680, models: '全系车型', status: true, sold: 1890 },
  { id: 3, name: '大保养套餐', items: '机油+机滤+空滤+空调滤+火花塞', times: 2, price: 1980, models: 'ARRIZO/TIGGO系', status: true, sold: 560 },
  { id: 4, name: '免费洗车套餐', items: '外观清洗+内饰清洁', times: 10, price: 380, models: '全系车型', status: false, sold: 2100 },
]

function TabPackage() {
  const [packages, setPackages] = useState(PACKAGES_DATA)
  const [showModal, setShowModal] = useState(false)
  const [editPkg, setEditPkg] = useState<typeof PACKAGES_DATA[0] | null>(null)
  const [coverageChecked, setCoverageChecked] = useState<string[]>(['机油更换', '机滤更换', '检查刹车', '检查轮胎气压'])
  const { toast, show } = useToast()

  const allItems = ['机油更换', '机滤更换', '空气滤芯', '空调滤芯', '火花塞', '检查刹车', '检查轮胎气压', '检查灯光', '检查雨刮', '底盘检查', '外观清洗', '内饰清洁']

  const toggleItem = (item: string) => {
    setCoverageChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>保养套餐管理</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditPkg(null); setCoverageChecked(['机油更换', '机滤更换']); setShowModal(true) }}>+ 新建套餐</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>套餐名称</th><th>包含项目</th><th>次数</th><th>售价</th><th>适用车型</th><th>已售</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            {packages.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)', maxWidth: 180 }}>{p.items}</td>
                <td><span className="tag tag-blue">{p.times} 次</span></td>
                <td style={{ fontWeight: 600, color: '#176bf8' }}>¥{p.price}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{p.models}</td>
                <td>{p.sold.toLocaleString()} 份</td>
                <td><Switch on={p.status} onChange={() => { setPackages(prev => prev.map(pkg => pkg.id === p.id ? { ...pkg, status: !pkg.status } : pkg)); show('状态已更新') }} /></td>
                <td>
                  <button className="btn btn-text btn-sm" onClick={() => { setEditPkg(p); setShowModal(true) }}>编辑</button>
                  <button className="btn btn-danger-text btn-sm">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">{editPkg ? '编辑套餐' : '新建保养套餐'} <button className="btn btn-icon" onClick={() => setShowModal(false)}><Icon name="close" size={16} /></button></div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label"><span className="req">*</span>套餐名称</label>
                  <input className="form-input" style={{ width: '100%' }} defaultValue={editPkg?.name} placeholder="如：基础保养套餐" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>套餐次数</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input className="form-input" style={{ width: 80 }} type="number" defaultValue={editPkg?.times ?? 5} />
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>次</span>
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>售价（元）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" defaultValue={editPkg?.price} placeholder="1280" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>有效期（月）</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input className="form-input" style={{ width: 80 }} type="number" defaultValue={24} />
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>个月</span>
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label">适用车型</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>全系车型</option><option>ARRIZO系</option><option>TIGGO系</option><option>eQ系</option><option>星途系</option>
                  </select>
                </div>
              </div>
              <div className="form-item">
                <label className="form-label"><span className="req">*</span>包含服务项目</label>
                <div className="coverage-grid" style={{ marginTop: 8 }}>
                  {allItems.map(item => (
                    <div key={item} className={`coverage-check ${coverageChecked.includes(item) ? 'checked' : ''}`} onClick={() => toggleItem(item)}>
                      <div className={`check-box ${coverageChecked.includes(item) ? 'checked' : ''}`}>
                        {coverageChecked.includes(item) && <span style={{ color: '#fff', fontSize: 10, display: 'inline-flex' }}><Icon name="success" size={10} stroke="#fff" /></span>}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="form-hint">已选 {coverageChecked.length} 项</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); show(editPkg ? '套餐已更新' : '套餐创建成功') }}>确认{editPkg ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab3: 道路救援 ───────────────────────────────────────────────────────────

function TabRescue() {
  const [rules, setRules] = useState({ yearTimes: '5', freeTow: '50', responseTime: '60', newEnergy: true })
  const [services] = useState([
    { name: '现场维修', desc: '轻微故障现场处理', enabled: true },
    { name: '拖车服务', desc: `${rules.freeTow}km内免费拖车`, enabled: true },
    { name: '应急充电', desc: '新能源应急充电', enabled: true },
    { name: '开锁服务', desc: '车辆锁闭紧急开锁', enabled: true },
    { name: '送油服务', desc: '紧急送燃油上门', enabled: true },
    { name: '换胎服务', desc: '轮胎爆胎现场更换', enabled: true },
  ])
  const { toast, show } = useToast()

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="card">
        <div className="section-header">
          <div className="section-title">道路救援规则配置</div>
          <button className="btn btn-primary btn-sm" onClick={() => show('救援规则已保存')}>保存设置</button>
        </div>
        <div className="form-grid form-grid-3" style={{ marginBottom: 16 }}>
          <div className="form-item">
            <label className="form-label"><span className="req">*</span>年度救援次数</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className="form-input" style={{ width: 80 }} type="number" value={rules.yearTimes} onChange={e => setRules(p => ({ ...p, yearTimes: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>次/年</span>
            </div>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="req">*</span>免费拖车距离</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className="form-input" style={{ width: 80 }} type="number" value={rules.freeTow} onChange={e => setRules(p => ({ ...p, freeTow: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>km内免费</span>
            </div>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="req">*</span>响应时间承诺</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input className="form-input" style={{ width: 80 }} type="number" value={rules.responseTime} onChange={e => setRules(p => ({ ...p, responseTime: e.target.value }))} />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>分钟内响应</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #f0f0f0' }}>
          <Switch on={rules.newEnergy} onChange={() => setRules(p => ({ ...p, newEnergy: !p.newEnergy }))} />
          <span style={{ fontSize: 13 }}>新能源车辆额外提供应急充电服务</span>
          <span className="tag tag-green" style={{ marginLeft: 4 }}>推荐开启</span>
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 12 }}>服务项目配置</div>
        <table className="data-table">
          <thead><tr><th>服务名称</th><th>服务说明</th><th>启用状态</th><th>操作</th></tr></thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{s.desc}</td>
                <td><Switch on={s.enabled} onChange={() => show('状态已更新')} /></td>
                <td><button className="btn btn-text btn-sm">编辑说明</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Tab4: 延保服务 ───────────────────────────────────────────────────────────

const WARRANTY_PLANS = [
  { id: 1, name: '3年延保标准版', years: 3, price: 2800, models: '全系车型', coverage: '发动机+变速箱', status: true, sold: 1240 },
  { id: 2, name: '5年延保豪华版', years: 5, price: 4200, models: '全系车型', coverage: '全系统覆盖', status: true, sold: 680 },
  { id: 3, name: '新能源三电延保', years: 5, price: 3600, models: 'eQ系/星途系', coverage: '电池+电机+电控', status: true, sold: 320 },
  { id: 4, name: '2年延保入门版', years: 2, price: 1800, models: '全系车型', coverage: '发动机+变速箱', status: false, sold: 890 },
]

const COVERAGE_ITEMS = ['发动机总成', '变速箱总成', '三电系统', '空调系统', '转向系统', '制动系统', '悬挂系统', '电气系统', '车身附件']

function TabWarranty() {
  const [plans, setPlans] = useState(WARRANTY_PLANS)
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState<typeof WARRANTY_PLANS[0] | null>(null)
  const [coverageChecked, setCoverageChecked] = useState<string[]>(['发动机总成', '变速箱总成'])
  const { toast, show } = useToast()

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>延保方案管理</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditPlan(null); setCoverageChecked(['发动机总成', '变速箱总成']); setShowModal(true) }}>+ 新建方案</button>
        </div>
        <table className="data-table">
          <thead><tr><th>方案名称</th><th>延保年限</th><th>覆盖范围</th><th>适用车型</th><th>售价</th><th>已售</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td><span className="tag tag-purple">{p.years} 年</span></td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{p.coverage}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{p.models}</td>
                <td style={{ fontWeight: 600, color: '#722ed1' }}>¥{p.price.toLocaleString()}</td>
                <td>{p.sold.toLocaleString()} 份</td>
                <td><Switch on={p.status} onChange={() => { setPlans(prev => prev.map(pl => pl.id === p.id ? { ...pl, status: !pl.status } : pl)); show('状态已更新') }} /></td>
                <td>
                  <button className="btn btn-text btn-sm" onClick={() => { setEditPlan(p); setCoverageChecked(p.coverage.split('+')); setShowModal(true) }}>编辑</button>
                  <button className="btn btn-danger-text btn-sm">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">{editPlan ? '编辑延保方案' : '新建延保方案'} <button className="btn btn-icon" onClick={() => setShowModal(false)}><Icon name="close" size={16} /></button></div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label"><span className="req">*</span>方案名称</label>
                  <input className="form-input" style={{ width: '100%' }} defaultValue={editPlan?.name} placeholder="如：5年延保豪华版" />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>延保年限</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input className="form-input" style={{ width: 80 }} type="number" defaultValue={editPlan?.years ?? 3} />
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>年</span>
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="req">*</span>售价（元）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" defaultValue={editPlan?.price} placeholder="2800" />
                </div>
                <div className="form-item">
                  <label className="form-label">适用车型</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>全系车型</option><option>ARRIZO系</option><option>TIGGO系</option><option>eQ系</option><option>星途系</option>
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label">购买条件</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>购车时同步购买</option><option>购车后3年内可购</option><option>无限制</option>
                  </select>
                </div>
              </div>
              <div className="form-item">
                <label className="form-label"><span className="req">*</span>覆盖范围</label>
                <div className="coverage-grid" style={{ marginTop: 8 }}>
                  {COVERAGE_ITEMS.map(item => (
                    <div key={item} className={`coverage-check ${coverageChecked.includes(item) ? 'checked' : ''}`}
                      onClick={() => setCoverageChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}>
                      <div className={`check-box ${coverageChecked.includes(item) ? 'checked' : ''}`}>
                        {coverageChecked.includes(item) && <span style={{ color: '#fff', fontSize: 10, display: 'inline-flex' }}><Icon name="success" size={10} stroke="#fff" /></span>}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="form-hint">已选 {coverageChecked.length} 项</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); show(editPlan ? '方案已更新' : '方案创建成功') }}>确认{editPlan ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab5: 终身质保 ───────────────────────────────────────────────────────────

const LIFETIME_PLANS = [
  { id: 1, name: '首任车主终身质保', condition: '首任车主，按时保养', scope: '发动机+变速箱', transfer: false, status: true, activated: 8420 },
  { id: 2, name: '三电终身质保（新能源）', condition: '首任车主，按时保养', scope: '电池+电机+电控', transfer: false, status: true, activated: 2180 },
]

const LIFETIME_COVERAGE = ['发动机总成', '变速箱总成', '三电系统（新能源）', '车身结构件', '防锈防腐']

function TabLifetime() {
  const [plans, setPlans] = useState(LIFETIME_PLANS)
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState<typeof LIFETIME_PLANS[0] | null>(null)
  const [coverageChecked, setCoverageChecked] = useState<string[]>(['发动机总成', '变速箱总成'])
  const [conditions, setConditions] = useState({
    firstOwner: true, maintenanceRequired: true, mileageLimit: false, maxMileage: '200000',
    transferable: false, activationRequired: true,
  })
  const { toast, show } = useToast()

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* 说明横幅 */}
      <div style={{ background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: '10px 16px', marginBottom: 12, fontSize: 13, color: '#7c4a00', display: 'flex', gap: 8 }}>
        <span className="banner-icon"><Icon name="lifetime" size={16} stroke="#7c4a00" /></span>
        <div>终身质保是主机厂提供的最高级别质量保障，需严格设置激活条件和覆盖范围，建议与法务部门确认条款后再启用。</div>
      </div>

      {/* 方案列表 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>终身质保方案</div>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditPlan(null); setCoverageChecked(['发动机总成', '变速箱总成']); setShowModal(true) }}>+ 新建方案</button>
        </div>
        <table className="data-table">
          <thead><tr><th>方案名称</th><th>激活条件</th><th>覆盖范围</th><th>可转让</th><th>已激活车辆</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {plans.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.name}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{p.condition}</td>
                <td style={{ color: 'rgba(0,0,0,0.65)' }}>{p.scope}</td>
                <td>{p.transfer ? <span className="tag tag-green">可转让</span> : <span className="tag tag-gray">不可转让</span>}</td>
                <td style={{ fontWeight: 500 }}>{p.activated.toLocaleString()} 辆</td>
                <td><Switch on={p.status} onChange={() => { setPlans(prev => prev.map(pl => pl.id === p.id ? { ...pl, status: !pl.status } : pl)); show('状态已更新') }} /></td>
                <td>
                  <button className="btn btn-text btn-sm" onClick={() => { setEditPlan(p); setShowModal(true) }}>编辑</button>
                  <button className="btn btn-text btn-sm">查看激活记录</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 全局激活条件 */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">全局激活条件配置</div>
          <button className="btn btn-primary btn-sm" onClick={() => show('激活条件已保存')}>保存设置</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'firstOwner', label: '仅限首任车主', desc: '车辆过户后终身质保自动失效' },
            { key: 'maintenanceRequired', label: '按时保养要求', desc: '须在授权门店按规定里程/时间完成保养' },
            { key: 'mileageLimit', label: '里程限制', desc: '超过限定里程后质保失效' },
            { key: 'transferable', label: '允许转让', desc: '车辆过户时质保权益可随车转让' },
            { key: 'activationRequired', label: '需要主动激活', desc: '车主需在 App 或门店完成激活操作' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <Switch on={conditions[item.key as keyof typeof conditions] as boolean}
                onChange={() => setConditions(p => ({ ...p, [item.key]: !p[item.key as keyof typeof conditions] }))} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 1 }}>{item.desc}</div>
              </div>
              {item.key === 'mileageLimit' && conditions.mileageLimit && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input className="form-input" style={{ width: 100 }} type="number" value={conditions.maxMileage}
                    onChange={e => setConditions(p => ({ ...p, maxMileage: e.target.value }))} />
                  <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>km</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 新建/编辑弹窗 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ width: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">{editPlan ? '编辑终身质保方案' : '新建终身质保方案'} <button className="btn btn-icon" onClick={() => setShowModal(false)}><Icon name="close" size={16} /></button></div>
            <div className="modal-body">
              <div className="form-grid form-grid-2" style={{ gap: 16, marginBottom: 16 }}>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label"><span className="req">*</span>方案名称</label>
                  <input className="form-input" style={{ width: '100%' }} defaultValue={editPlan?.name} placeholder="如：首任车主终身质保" />
                </div>
                <div className="form-item">
                  <label className="form-label">适用车型</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>全系车型</option><option>ARRIZO系</option><option>TIGGO系</option><option>eQ系（新能源）</option><option>星途系</option>
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label">是否可转让</label>
                  <select className="form-select" style={{ width: '100%' }}>
                    <option>不可转让（过户失效）</option><option>可转让（随车转移）</option>
                  </select>
                </div>
                <div className="form-item" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">激活条件说明</label>
                  <textarea className="form-textarea" rows={2} style={{ width: '100%' }} defaultValue={editPlan?.condition} placeholder="描述车主需满足的激活条件" />
                </div>
              </div>
              <div className="form-item">
                <label className="form-label"><span className="req">*</span>质保覆盖范围</label>
                <div className="coverage-grid" style={{ marginTop: 8 }}>
                  {LIFETIME_COVERAGE.map(item => (
                    <div key={item} className={`coverage-check ${coverageChecked.includes(item) ? 'checked' : ''}`}
                      onClick={() => setCoverageChecked(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])}>
                      <div className={`check-box ${coverageChecked.includes(item) ? 'checked' : ''}`}>
                        {coverageChecked.includes(item) && <span style={{ color: '#fff', fontSize: 10, display: 'inline-flex' }}><Icon name="success" size={10} stroke="#fff" /></span>}
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16, padding: '10px 14px', background: '#fff7e6', borderRadius: 6, fontSize: 12, color: '#7c4a00' }}>
                <span className="warning-inline"><Icon name="warning" size={14} stroke="#7c4a00" /></span> 终身质保方案启用后，将对符合条件的新购车辆自动生效，请确认条款无误后再启用。
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={() => { setShowModal(false); show(editPlan ? '方案已更新' : '方案创建成功，待审核后生效') }}>确认{editPlan ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

const Component = () => {
  const [activeKey, setActiveKey] = useState('overview')

  const KEY_TO_TAB: Record<string, number> = {
    overview: 0, mall: 1, package: 2, rescue: 3, warranty: 4, lifetime: 5,
  }
  const TAB_TO_KEY = ['overview', 'mall', 'package', 'rescue', 'warranty', 'lifetime']
  const [activeTab, setActiveTab] = useState(0)

  const handleNav = (key: string) => {
    if (KEY_TO_TAB[key] !== undefined) {
      setActiveTab(KEY_TO_TAB[key])
      setActiveKey(key)
    }
  }

  const tabs = [
    { label: '权益总览' },
    { label: '商城权益' },
    { label: '保养套餐' },
    { label: '道路救援' },
    { label: '延保服务' },
    { label: '终身质保' },
  ]

  return (
    <div className="layout">
      <Sidebar active={activeKey} onNav={handleNav} />
      <div className="main">
        {/* 顶部导航 */}
        <div className="topbar">
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>主机厂后台</span>
          <span style={{ color: '#d9d9d9' }}>/</span>
          <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>权益中心管理</span>
          <div style={{ flex: 1 }} />
          <button className="btn btn-default btn-sm"><Icon name="activity" size={14} />操作日志</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#176bf8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>张</div>
            <span style={{ fontSize: 13 }}>张运营</span>
          </div>
        </div>

        {/* Tab 导航 */}
        <div className="tab-nav">
          {tabs.map((t, i) => (
            <div key={i} className={`tab-item ${activeTab === i ? 'active' : ''}`}
              onClick={() => { setActiveTab(i); setActiveKey(TAB_TO_KEY[i]) }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* 内容区 */}
        <div className="content">
          {activeTab === 0 && <TabOverview onNav={handleNav} />}
          {activeTab === 1 && <TabMall />}
          {activeTab === 2 && <TabPackage />}
          {activeTab === 3 && <TabRescue />}
          {activeTab === 4 && <TabWarranty />}
          {activeTab === 5 && <TabLifetime />}
        </div>
      </div>
    </div>
  )
}

export default Component
