import React, { useMemo, useState } from 'react'
import yfLogo from '../../assets/yf-logo.png'
import './style.css'

type Receipt = { id: number; amount: number; date: string; status: '待财务确认' | '待核销' | '已核销' | '已退回'; note: string }

type Plan = {
  id: string
  ym: string
  name: string
  category: string
  brand: string
  region: string
  erp: string
  store: string
  status: string
  currentOp: string
  nextOp: string
  planFee: number
  factoryFee: number
  writeoff: number | null
  arrived: number | null
  diff: number
  selfFee: number
  executed: string
  needWriteoff: string
  creator: string
  created: string
  receipts?: Receipt[]
}

const PLANS: Plan[] = [
  { id: 'YFSC202512150001', ym: '2025-12', name: '请我', category: '集客活动', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '退回', currentOp: '总部审核不通过', nextOp: '门店修改提交', planFee: 5, factoryFee: 5, writeoff: null, arrived: null, diff: 0, selfFee: 1, executed: '', needWriteoff: '', creator: '杨奥宇', created: '2025/12/15 09:06:49' },
  { id: 'YFSC202510110002', ym: '2025-10', name: '嗡嗡嗡', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '待核销', currentOp: '总部审核通过', nextOp: '门店核销', planFee: 9000, factoryFee: 9000, writeoff: null, arrived: null, diff: 0, selfFee: 0, executed: '', needWriteoff: '', creator: '杨奥宇', created: '2025/10/11 15:19:24' },
  { id: 'YFSC202510110001', ym: '2025-10', name: '？？？', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '挂起', currentOp: '财务审核通过', nextOp: '门店回款登记', planFee: 9000, factoryFee: 9000, writeoff: 9000, arrived: null, diff: 9000, selfFee: 0, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/10/11 15:15:01' },
  { id: 'YFSC202510100003', ym: '2025-10', name: '割韭菜', category: '收割活动', brand: '奇瑞', region: '豫晋大区', erp: '3059', store: '郑州盈丰', status: '退回', currentOp: '财务审核不通过', nextOp: '门店修改核销', planFee: 900, factoryFee: 900, writeoff: 900, arrived: null, diff: 900, selfFee: 0, executed: '是', needWriteoff: '是', creator: '郑州信息员', created: '2025/10/10 16:13:11' },
  { id: 'YFSC202510100001', ym: '2025-10', name: '11项目名称1010', category: '保客活动', brand: '奇瑞', region: '苏沪闽', erp: '3278', store: '上海盈丰', status: '退回', currentOp: '总部审核不通过', nextOp: '门店修改提交', planFee: 333, factoryFee: 444, writeoff: null, arrived: null, diff: 0, selfFee: 555, executed: '', needWriteoff: '', creator: 'hom', created: '2025/10/10 13:27:54' },
  { id: 'YFSC202509290002', ym: '2025-09', name: '11项目名称0929-3', category: '新增平台', brand: '奇瑞', region: '苏沪闽', erp: '3278', store: '上海盈丰', status: '待核销', currentOp: '总部审核通过', nextOp: '门店核销', planFee: 3355, factoryFee: 444, writeoff: null, arrived: null, diff: 0, selfFee: 555, executed: '', needWriteoff: '', creator: 'hom', created: '2025/09/29 14:40:53' },
  { id: 'YFSC202509280009', ym: '2025-09', name: '1234', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '挂起', currentOp: '财务审核通过', nextOp: '门店回款登记', planFee: 1234, factoryFee: 1234, writeoff: 1234, arrived: 0, diff: 1234, selfFee: 12345, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/09/28 15:25:28' },
  { id: 'YFSC202509280008', ym: '2025-09', name: 'test_0928', category: '集客活动', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '部分核销', currentOp: '财务确认回款', nextOp: '继续核销', planFee: 10000, factoryFee: 10000, writeoff: 10000, arrived: 7000, diff: 3000, selfFee: 0, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/09/28 14:00:00', receipts: [{ id: 1, amount: 3000, date: '2025/09/28 14:00:00', status: '已核销', note: '' }, { id: 2, amount: 4000, date: '2025/10/08 11:20:00', status: '已核销', note: '' }, { id: 3, amount: 3000, date: '2025/10/20 16:45:00', status: '待核销', note: '' }] },
]

const fmt = (n: number | null) => (n === null || n === undefined ? '-' : n.toLocaleString())

const STATUS_CLASS: Record<string, string> = {
  '退回': 'st-back', '待核销': 'st-todo', '挂起': 'st-hang',
}

function Field({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
  return (
    <label className="mpd-field"><span>{required && <i>*</i>}{label}</span>{children}</label>
  )
}

function DetailPage({ p, onBack }: { p: Plan, onBack: () => void }) {
  const flowNode = p.currentOp.includes('财务') ? '财务审核' : '总部审核'
  const [receipts, setReceipts] = useState<Receipt[]>(p.receipts || (p.writeoff !== null ? [{ id: 1, amount: p.writeoff, date: p.created, status: '待核销', note: '' }] : []))
  const [amount, setAmount] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10))
  const [receiptError, setReceiptError] = useState('')
  const totalRegistered = receipts.filter(r => r.status !== '已退回').reduce((sum, r) => sum + r.amount, 0)
  const totalConfirmed = receipts.filter(r => r.status === '待核销' || r.status === '已核销').reduce((sum, r) => sum + r.amount, 0)
  const totalWrittenOff = receipts.filter(r => r.status === '已核销').reduce((sum, r) => sum + r.amount, 0)
  const remaining = Math.max(0, p.factoryFee - totalRegistered)
  const addReceipt = () => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setReceiptError('请输入大于 0 的回款金额')
    if (value > remaining) return setReceiptError(`本次金额不能超过未登记金额 ${fmt(remaining)} 元`)
    setReceipts(current => [...current, { id: Date.now(), amount: value, date: `${receiptDate} ${new Date().toTimeString().slice(0, 5)}`, status: '待财务确认', note: '' }])
    setAmount('')
    setReceiptError('')
  }
  const updateReceipt = (id: number, status: Receipt['status']) => setReceipts(current => current.map(r => r.id === id ? { ...r, status } : r))
  return (
    <div className="mpm">
      <aside className="mpm-side lq-side">
        <div className="lq-logo"><img src={yfLogo} alt="盈丰投资 奇瑞汽车" /></div>
        <div className="mpm-menu active">市场费用管理</div>
      </aside>
      <main className="mpm-main mpd">
        <header className="mpm-top">市场费用管理 <span className="mpm-sub">/ 市场计划管理 / 详情</span>
          <span className="mpm-user">系统管理员</span></header>
        <h3 className="mpd-title">详情</h3>

        <section className="mpd-card">
          <h4>基础信息</h4>
          <div className="mpd-grid">
            <Field label="品牌" required><input disabled value={p.brand} /></Field>
            <Field label="大区名称" required><input disabled value={p.region} /></Field>
            <Field label="门店销售ERP号" required><input disabled value={p.erp} /></Field>
            <Field label="门店名称" required><input disabled value={p.store} /></Field>
          </div>
        </section>

        <section className="mpd-card">
          <h4>项目信息</h4>
          <div className="mpd-grid">
            <Field label="年/月" required><input disabled value={p.ym} /></Field>
            <Field label="项目分类" required><input disabled value={p.category} /></Field>
            <Field label="项目名称" required><input disabled value={p.name} /></Field>
            <Field label="计划费用（元）" required><input disabled value={p.planFee.toFixed(2)} /></Field>
            <Field label="厂家承担（元）" required><input disabled value={p.factoryFee.toFixed(2)} /></Field>
            <Field label="自行承担（元）" required><input disabled value={p.selfFee.toFixed(2)} /></Field>
          </div>
          <Field label="附件上传" required>
            <span className="mpd-cases">
              <span className="mpd-case">合同</span>
              <span className="mpd-case">发票</span>
            </span>
          </Field>
        </section>

        <section className="mpd-card">
          <h4>核销登记</h4>
          <Field label="是否执行" required>
            <span className="mpd-radio">
              <span><i className={p.executed !== '是' ? 'dot on' : 'dot'} />否</span>
              <span><i className={p.executed === '是' ? 'dot on' : 'dot'} />是</span>
            </span>
          </Field>
        </section>

        <section className="mpd-card">
          <div className="mpd-section-title"><div><h4>回款与核销明细</h4><span>每笔到账独立确认、独立核销，可分多次登记</span></div><span className="mpd-cap">厂家承担总额 <b>¥{fmt(p.factoryFee)}</b></span></div>
          <div className="mpd-ledger-summary">
            <div><span>已登记回款</span><b>¥{fmt(totalRegistered)}</b></div>
            <div><span>已确认到账</span><b>¥{fmt(totalConfirmed)}</b></div>
            <div><span>已核销</span><b>¥{fmt(totalWrittenOff)}</b></div>
            <div><span>待回款 / 可登记</span><b>¥{fmt(remaining)}</b></div>
            <div><span>待核销</span><b>¥{fmt(totalConfirmed - totalWrittenOff)}</b></div>
          </div>
          <div className="mpd-add-receipt">
            <label>本次回款金额<input type="number" min="0.01" step="0.01" max={remaining} value={amount} onChange={e => setAmount(e.target.value)} placeholder="请输入本次到账金额" /></label>
            <label>到账日期<input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} /></label>
            <button className="primary" onClick={addReceipt} disabled={remaining <= 0}>登记本次回款</button>
            <span className="mpd-remaining-hint">最多可登记 ¥{fmt(remaining)}</span>
          </div>
          {receiptError && <div className="mpd-error">{receiptError}</div>}
          <div className="mpd-ledger-scroll"><table className="mpm-sub mpd-ledger">
            <thead><tr><th>期次</th><th>回款金额（元）</th><th>到账时间</th><th>回款状态</th><th>核销状态</th><th>核销时间</th><th>操作</th></tr></thead>
            <tbody>{receipts.length ? receipts.map((r, i) => (
              <tr key={r.id}><td>第 {i + 1} 次</td><td className="num">{fmt(r.amount)}</td><td>{r.date}</td>
                <td><span className={r.status === '待财务确认' ? 'tag-amber' : r.status === '已退回' ? 'tag-red' : 'tag-green'}>{r.status === '待财务确认' ? '待财务确认' : r.status === '已退回' ? '已退回' : '已到账'}</span></td>
                <td><span className={r.status === '已核销' ? 'tag-green' : 'tag-amber'}>{r.status === '已核销' ? '已核销' : r.status === '待核销' ? '待核销' : '未核销'}</span></td>
                <td>{r.status === '已核销' ? r.date : '-'}</td>
                <td className="nowrap">{r.status === '待财务确认' && <><button className="mpd-action" onClick={() => updateReceipt(r.id, '待核销')}>确认到账</button><button className="mpd-action danger" onClick={() => updateReceipt(r.id, '已退回')}>退回</button></>}{r.status === '待核销' && <button className="mpd-action" onClick={() => updateReceipt(r.id, '已核销')}>核销本次</button>}{r.status === '已核销' && <span className="muted">已完成</span>}{r.status === '已退回' && <span className="muted">请重新登记</span>}</td>
              </tr>
            )) : <tr><td colSpan={7} className="empty">暂无回款记录，登记到账后可逐笔确认和核销</td></tr>}</tbody>
          </table></div>
          <p className="mpd-sum">到账确认 ¥{fmt(totalConfirmed)}　已核销 ¥{fmt(totalWrittenOff)}　未核销 ¥{fmt(totalConfirmed - totalWrittenOff)}</p>
        </section>

        <section className="mpd-card">
          <h4>流转明细</h4>
          <table className="mpm-sub">
            <thead><tr><th>序号</th><th>节点名称</th><th>节点处理人</th><th>处理时间</th><th>处理结果</th><th>处理意见</th></tr></thead>
            <tbody>
              <tr><td>1</td><td><span className="tag-green">门店提交</span></td><td>{p.creator}</td><td>{p.created.replace(/\//g, '-')}</td><td><span className="tag-green">通过</span></td><td></td></tr>
              <tr><td>2</td><td><span className="tag-green">{flowNode}</span></td><td>系统管理员</td><td>-</td><td>{p.status === '退回' ? <span className="tag-red">退回</span> : <span className="tag-green">{p.status}</span>}</td><td>{p.status === '退回' ? '12' : ''}</td></tr>
            </tbody>
          </table>
        </section>

        <div className="mpd-foot"><button onClick={onBack}>返 回</button></div>
      </main>
    </div>
  )
}

function CreatePage({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="mpm">
      <aside className="mpm-side lq-side">
        <div className="lq-logo"><img src={yfLogo} alt="盈丰投资 奇瑞汽车" /></div>
        <div className="mpm-menu active">市场费用管理</div>
      </aside>
      <main className="mpm-main mpd">
        <header className="mpm-top">市场费用管理 <span className="mpm-sub">/ 市场计划管理 / 新增</span>
          <span className="mpm-user">合肥盈丰店总经理-2</span></header>
        <h3 className="mpd-title">新增</h3>

        <section className="mpd-card">
          <h4>基础信息</h4>
          <div className="mpd-grid">
            <Field label="品牌" required><input defaultValue="奇瑞" /></Field>
            <Field label="大区名称" required><input defaultValue="安徽一区" /></Field>
            <Field label="门店销售ERP号" required><input defaultValue="3070" /></Field>
            <Field label="门店名称" required><input defaultValue="合肥盈丰" /></Field>
          </div>
        </section>

        <section className="mpd-card">
          <h4>项目信息</h4>
          <div className="mpd-grid">
            <Field label="年/月" required><input defaultValue="2026-09" /></Field>
            <Field label="项目分类" required><input placeholder="请选择项目分类" /></Field>
            <Field label="项目名称" required><input placeholder="请输入项目名称" /></Field>
            <Field label="计划费用（元）" required><input placeholder="请输入计划费用（元）" /></Field>
            <Field label="厂家承担（元）" required><input placeholder="请输入厂家承担（元）" /></Field>
            <Field label="自行承担（元）" required><input placeholder="请输入自行承担（元）" /></Field>
          </div>
          <Field label="附件上传" required>
            <span className="mpd-cases"><span className="mpd-case dash">＋ 上传图片</span></span>
          </Field>
        </section>

        <div className="mpd-foot"><button onClick={onCancel}>取 消</button><button className="primary" onClick={onCancel}>确 定</button></div>
      </main>
    </div>
  )
}

export default function MarketPlanManage() {
  const [collapsed, setCollapsed] = useState(false)
  const [detail, setDetail] = useState<Plan | null>(null)
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ brand: '', region: '', erp: '', store: '', ym: '', pid: '', pname: '', category: '', status: '', currentOp: '', nextOp: '' })
  const [selected, setSelected] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])

  const rows = useMemo(() => PLANS.filter(p =>
    (!f.pid || p.id.includes(f.pid)) && (!f.pname || p.name.includes(f.pname)) &&
    (!f.status || p.status === f.status) && (!f.category || p.category === f.category) &&
    (!f.store || p.store.includes(f.store)) && (!f.ym || p.ym.includes(f.ym))
  ), [f])

  const toggleSel = (id: string) => setSelected((s: string[]) => s.includes(id) ? s.filter((x: string) => x !== id) : [...s, id])
  const toggleExp = (id: string) => setExpanded((s: string[]) => s.includes(id) ? s.filter((x: string) => x !== id) : [...s, id])
  const set = (k: string, v: string) => setF((prev: typeof f) => ({ ...prev, [k]: v }))

  const openDetail = (p: Plan) => { setDetail(p) }

  if (creating) return <CreatePage onCancel={() => setCreating(false)} />
  if (detail) return <DetailPage p={detail} onBack={() => setDetail(null)} />

  return (
    <div className="mpm">
      <aside className="mpm-side lq-side">
        <div className="lq-logo"><img src={yfLogo} alt="盈丰投资 奇瑞汽车" /></div>
        <div className="mpm-menu active">市场费用管理</div>
      </aside>
      <main className="mpm-main lq">
        <header className="mpm-top">市场费用管理 <span className="mpm-sub">/ 市场计划管理</span>
          <span className="mpm-user">合肥盈丰店总经理-2</span></header>

        <nav className="lq-tabs">
          {[['门店待办事项', 2, true], ['财务待办事项', 4, false], ['总部待办事项', 2, false], ['全部', 0, false]].map(([t, n, on]) => (
            <span key={t as string} className={on ? 'on' : ''}>{t}{!!n && <b>{n as number}</b>}</span>
          ))}
        </nav>

        <section className="lq-filter">
          {!collapsed && (
            <div className="lq-grid">
              {[['门店销售ERP编号', 'erp', '3070'], ['门店名称', 'store', '请输入门店名称'], ['年/月', 'ym', '请选择年/月'], ['项目编号', 'pid', '请输入项目编号'], ['项目名称', 'pname', '请输入项目名称'], ['项目分类', 'category', '请选择项目分类'], ['状态', 'status', '请选择状态'], ['当前操作', 'currentOp', '请选择当前操作'], ['下一步操作', 'nextOp', '门店核销，门店回款登记'], ['创建日期', 'created', '开始日期 → 结束日期']].map(([label, key, ph]) => (
                <label key={key}>{label}<input value={(f as any)[key] || ''} onChange={e => set(key, e.target.value)} placeholder={ph as string} /></label>
              ))}
            </div>
          )}
          <div className="lq-filter-foot">
            <span className="lq-collapse" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开 ▽' : '收起 △'}</span>
            <span><button className="primary">查 询</button><button>重 置</button></span>
          </div>
        </section>

        <section className="lq-list">
          <div className="lq-list-head"><span>◎ 数据列表</span><span><button className="primary sm" onClick={() => setCreating(true)}>新增</button><button className="sm">导出</button></span></div>
          <div className="lq-sel">已选择 {selected.length} / {rows.length} 条数据</div>
          <div className="mpm-table-wrap">
            <table className="mpm-table lq-table">
              <thead><tr>
                <th></th><th><input type="checkbox" onChange={e => setSelected(e.target.checked ? rows.map(r => r.id) : [])} /></th>
                <th>序号</th><th>项目编号</th><th>年/月</th><th>项目名称</th><th>项目分类</th><th>品牌</th><th>大区名称</th><th>门店销售ERP号</th><th>门店名称</th><th>操作</th>
              </tr></thead>
              <tbody>
                {rows.map((p, i) => (
                  <React.Fragment key={p.id}>
                    <tr>
                      <td className="lq-exp" onClick={() => toggleExp(p.id)}>{expanded.includes(p.id) ? '－' : '＋'}</td>
                      <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSel(p.id)} /></td>
                      <td>{i + 1}</td>
                      <td><a onClick={() => openDetail(p)}>{p.id}</a></td>
                      <td>{p.ym}</td><td>{p.name}</td>
                      <td><span className="pill">{p.category}</span></td>
                      <td><span className="pill">{p.brand}</span></td>
                      <td><span className="pill">{p.region}</span></td>
                      <td>{p.erp}</td><td>{p.store}</td>
                      <td className="nowrap"><a onClick={() => openDetail(p)}>{p.nextOp.includes('核销') ? '门店核销' : '编辑'}</a></td>
                    </tr>
                    {expanded.includes(p.id) && (
                      <tr className="mpm-subrow"><td></td><td colSpan={11}>
                        <table className="mpm-sub"><thead><tr><th>期次</th><th>登记金额</th><th>回款日期</th><th>回款状态</th><th>核销状态</th><th>操作</th></tr></thead>
                          <tbody>{p.receipts?.length ? p.receipts.map((r, index) => <tr key={r.id}><td>第 {index + 1} 次</td><td className="num">{fmt(r.amount)}</td><td>{r.date}</td><td>{r.status === '待财务确认' ? '待财务确认' : r.status === '已退回' ? '已退回' : '已到账'}</td><td>{r.status === '已核销' ? '已核销' : r.status === '待核销' ? '待核销' : '未核销'}</td><td>{r.status === '待核销' ? '可核销' : '-'}</td></tr>) : p.writeoff !== null ? <tr><td>第 1 次</td><td className="num">{fmt(p.writeoff)}</td><td>{p.created}</td><td>已到账</td><td>待核销</td><td>可核销</td></tr> : <tr><td colSpan={6} className="empty">暂无回款记录</td></tr>}</tbody></table>
                      </td></tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mpm-page"><span>共 {rows.length} 条</span><b>1</b><span>2</span><span>〉</span><span>10 条/页</span></div>
        </section>
      </main>

    </div>
  )
}
