import React, { useMemo, useState } from 'react'
import yfLogo from '../../assets/yf-logo.png'
import './style.css'

type ReceiptFile = { name: string; url: string }
type Receipt = { id: number; amount: number; date: string; status: '待财务确认' | '待核销' | '已核销' | '已退回'; note: string; files: ReceiptFile[] }

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
  { id: 'YFSC202511200001', ym: '2025-11', name: '冬季关怀', category: '保客活动', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '审批中', currentOp: '总部审核中', nextOp: '总部审核', planFee: 8000, factoryFee: 8000, writeoff: null, arrived: null, diff: 0, selfFee: 0, executed: '', needWriteoff: '', creator: '杨奥宇', created: '2025/11/20 10:00:00' },
  { id: 'YFSC202510110002', ym: '2025-10', name: '嗡嗡嗡', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '待核销', currentOp: '总部审核通过', nextOp: '门店核销', planFee: 9000, factoryFee: 9000, writeoff: null, arrived: null, diff: 0, selfFee: 0, executed: '', needWriteoff: '', creator: '杨奥宇', created: '2025/10/11 15:19:24' },
  { id: 'YFSC202510110001', ym: '2025-10', name: '？？？', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '挂起', currentOp: '财务审核通过', nextOp: '门店回款登记', planFee: 9000, factoryFee: 9000, writeoff: 9000, arrived: null, diff: 9000, selfFee: 0, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/10/11 15:15:01' },
  { id: 'YFSC202510100003', ym: '2025-10', name: '割韭菜', category: '收割活动', brand: '奇瑞', region: '豫晋大区', erp: '3059', store: '郑州盈丰', status: '退回', currentOp: '财务审核不通过', nextOp: '门店修改核销', planFee: 900, factoryFee: 900, writeoff: 900, arrived: null, diff: 900, selfFee: 0, executed: '是', needWriteoff: '是', creator: '郑州信息员', created: '2025/10/10 16:13:11' },
  { id: 'YFSC202510100001', ym: '2025-10', name: '11项目名称1010', category: '保客活动', brand: '奇瑞', region: '苏沪闽', erp: '3278', store: '上海盈丰', status: '退回', currentOp: '总部审核不通过', nextOp: '门店修改提交', planFee: 333, factoryFee: 444, writeoff: null, arrived: null, diff: 0, selfFee: 555, executed: '', needWriteoff: '', creator: 'hom', created: '2025/10/10 13:27:54' },
  { id: 'YFSC202509290002', ym: '2025-09', name: '11项目名称0929-3', category: '新增平台', brand: '奇瑞', region: '苏沪闽', erp: '3278', store: '上海盈丰', status: '待核销', currentOp: '总部审核通过', nextOp: '门店核销', planFee: 3355, factoryFee: 444, writeoff: null, arrived: null, diff: 0, selfFee: 555, executed: '', needWriteoff: '', creator: 'hom', created: '2025/09/29 14:40:53' },
  { id: 'YFSC202509280009', ym: '2025-09', name: '1234', category: '新增投放', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '挂起', currentOp: '财务审核通过', nextOp: '门店回款登记', planFee: 1234, factoryFee: 1234, writeoff: 1234, arrived: 0, diff: 1234, selfFee: 12345, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/09/28 15:25:28' },
  { id: 'YFSC202509280008', ym: '2025-09', name: 'test_0928', category: '集客活动', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '挂起', currentOp: '财务审核通过', nextOp: '门店回款登记', planFee: 10000, factoryFee: 10000, writeoff: 10000, arrived: 7000, diff: 3000, selfFee: 0, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/09/28 14:00:00', receipts: [{ id: 1, amount: 3000, date: '2025/09/28 14:00:00', status: '已核销', note: '', files: [] }, { id: 2, amount: 4000, date: '2025/10/08 11:20:00', status: '已核销', note: '', files: [] }, { id: 3, amount: 3000, date: '2025/10/20 16:45:00', status: '待核销', note: '', files: [] }] },
  { id: 'YFSC202509150001', ym: '2025-09', name: '到店礼', category: '礼品', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '已完成', currentOp: '财务已核销', nextOp: '查看', planFee: 5000, factoryFee: 5000, writeoff: 5000, arrived: 5000, diff: 0, selfFee: 0, executed: '是', needWriteoff: '是', creator: '杨奥宇', created: '2025/09/15 09:00:00', receipts: [{ id: 1, amount: 5000, date: '2025/09/20 10:00:00', status: '已核销', note: '', files: [] }] },
  { id: 'YFSC202509100001', ym: '2025-09', name: '取消投放', category: '日常物料', brand: '奇瑞', region: '安徽', erp: '3070', store: '合肥盈丰', status: '已结束', currentOp: '门店确认不执行', nextOp: '查看', planFee: 2000, factoryFee: 2000, writeoff: null, arrived: null, diff: 0, selfFee: 0, executed: '否', needWriteoff: '', creator: '杨奥宇', created: '2025/09/10 09:00:00' },
]

const fmt = (n: number | null) => (n === null || n === undefined ? '-' : n.toLocaleString())

const STATUS_CLASS: Record<string, string> = {
  '退回': 'st-back', '待核销': 'st-todo', '挂起': 'st-hang', '审批中': 'st-doing', '已完成': 'st-done', '已结束': 'st-end',
}
const PLAN_STATUSES = ['待核销', '退回', '已结束', '审批中', '挂起', '已完成']

function Field({ label, children, required }: { label: string, children: React.ReactNode, required?: boolean }) {
  return (
    <label className="mpd-field"><span>{required && <i>*</i>}{label}</span>{children}</label>
  )
}

function FileThumb({ name, url, editable, onPreview, onDelete }: { name: string; url?: string; editable?: boolean; onPreview: () => void; onDelete?: () => void }) {
  return (
    <span className="mpd-thumb" title={name}>
      {url ? <img src={url} alt={name} /> : <span className="mpd-thumb-ph">附件</span>}
      <span className="mpd-thumb-mask">
        <i title="预览" onClick={e => { e.stopPropagation(); onPreview() }}>👁</i>
        {url && <a title="下载" href={url} download={name} onClick={e => e.stopPropagation()}>⬇</a>}
        {editable && onDelete && <i title="删除" className="danger" onClick={e => { e.stopPropagation(); onDelete() }}>🗑</i>}
      </span>
    </span>
  )
}

function DetailPage({ p, onBack, editMode }: { p: Plan, onBack: () => void, editMode?: 'project' | 'writeoff' }) {
  const flowNode = p.currentOp.includes('财务') ? '财务审核' : '总部审核'
  const canEditProject = editMode === 'project'
  const canEditWriteoff = editMode === 'writeoff'
  const categories = ['集客活动', '日常物料', '礼品', '新增平台', '收割活动', '保客活动', '新增投放']
  const [proj, setProj] = useState({ ym: p.ym, category: p.category, name: p.name, planFee: String(p.planFee), factoryFee: String(p.factoryFee), selfFee: String(p.selfFee) })
  const setProjK = (k: string, v: string) => setProj(prev => ({ ...prev, [k]: v }))
  const [projFiles, setProjFiles] = useState<string[]>(['合同', '发票'])
  const [executed, setExecuted] = useState(p.executed || '')
  const [needWriteoff, setNeedWriteoff] = useState(p.needWriteoff || '')
  const [saved, setSaved] = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>((p.receipts || (p.writeoff !== null ? [{ id: 1, amount: p.writeoff, date: p.created, status: '待核销', note: '' }] : [])).map(r => ({ ...r, files: (r as Receipt).files || [] })))
  const [amount, setAmount] = useState('')
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().slice(0, 10))
  const [receiptError, setReceiptError] = useState('')
  const [previewImg, setPreviewImg] = useState<{ name: string; url: string } | null>(null)
  const fileToUrl = (f: File | undefined) => (f ? URL.createObjectURL(f) : '')
  const totalRegistered = receipts.filter(r => r.status !== '已退回').reduce((sum, r) => sum + r.amount, 0)
  const totalConfirmed = receipts.filter(r => r.status === '待核销' || r.status === '已核销').reduce((sum, r) => sum + r.amount, 0)
  const totalWrittenOff = receipts.filter(r => r.status === '已核销').reduce((sum, r) => sum + r.amount, 0)
  const remaining = Math.max(0, p.factoryFee - totalRegistered)
  const addReceipt = () => {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return setReceiptError('请输入大于 0 的回款金额')
    if (value > remaining) return setReceiptError(`本次金额不能超过未登记金额 ${fmt(remaining)} 元`)
    setReceipts(current => [...current, { id: Date.now(), amount: value, date: `${receiptDate} ${new Date().toTimeString().slice(0, 5)}`, status: '待财务确认', note: '', files: [] }])
    setAmount('')
    setReceiptError('')
  }
  const updateReceipt = (id: number, status: Receipt['status']) => setReceipts(current => current.map(r => r.id === id ? { ...r, status } : r))
  const removeReceipt = (id: number) => setReceipts(current => current.filter(r => r.id !== id))
  const addFiles = (id: number, list: FileList | null) => {
    if (!list?.length) return
    const items: ReceiptFile[] = Array.from(list).map(f => ({ name: f.name, url: fileToUrl(f) }))
    setReceipts(cur => cur.map(x => x.id === id ? { ...x, files: [...x.files, ...items] } : x))
    setReceiptError('')
  }
  const removeFile = (id: number, idx: number) => setReceipts(cur => cur.map(x => x.id === id ? { ...x, files: x.files.filter((_, i) => i !== idx) } : x))
  const handleSave = () => {
    if (canEditWriteoff && receipts.some(r => !r.files.length)) return setReceiptError('请为每一笔回款上传附件（至少 1 张）')
    setSaved(true); onBack()
  }
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
            <Field label="年/月" required><input disabled={!canEditProject} value={canEditProject ? proj.ym : p.ym} onChange={e => setProjK('ym', e.target.value)} /></Field>
            <Field label="项目分类" required>{canEditProject ? <select className="mpd-select" value={proj.category} onChange={e => setProjK('category', e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select> : <input disabled value={p.category} />}</Field>
            <Field label="项目名称" required><input disabled={!canEditProject} value={canEditProject ? proj.name : p.name} onChange={e => setProjK('name', e.target.value)} /></Field>
            <Field label="计划费用（元）" required><input disabled={!canEditProject} value={canEditProject ? proj.planFee : p.planFee.toFixed(2)} onChange={e => setProjK('planFee', e.target.value)} /></Field>
            <Field label="厂家承担（元）" required><input disabled={!canEditProject} value={canEditProject ? proj.factoryFee : p.factoryFee.toFixed(2)} onChange={e => setProjK('factoryFee', e.target.value)} /></Field>
            <Field label="自行承担（元）" required><input disabled={!canEditProject} value={canEditProject ? proj.selfFee : p.selfFee.toFixed(2)} onChange={e => setProjK('selfFee', e.target.value)} /></Field>
          </div>
          <Field label="附件上传" required>
            <span className="mpd-cases">
              {projFiles.map(n => <span key={n} className="mpd-case">{n}{canEditProject && <i className="mpd-case-x" onClick={() => setProjFiles(cur => cur.filter(x => x !== n))}>×</i>}</span>)}
              {canEditProject && <label className="mpd-case dash">＋ 上传图片<input type="file" hidden accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setProjFiles(cur => [...cur, f.name]) }} /></label>}
            </span>
          </Field>
        </section>

        <section className="mpd-card">
          <h4>核销登记</h4>
          <div className="mpd-grid">
            <Field label="是否执行" required>
              {canEditWriteoff ? (
                <span className="mpd-radio" style={{ color: '#262626' }}>
                  <span onClick={() => { setExecuted('否'); setNeedWriteoff('') }} style={{ cursor: 'pointer' }}><i className={executed === '否' ? 'dot on blue' : 'dot'} />否</span>
                  <span onClick={() => setExecuted('是')} style={{ cursor: 'pointer' }}><i className={executed === '是' ? 'dot on blue' : 'dot'} />是</span>
                </span>
              ) : (
                <span className="mpd-radio">
                  <span><i className={executed !== '是' ? 'dot on' : 'dot'} />否</span>
                  <span><i className={executed === '是' ? 'dot on' : 'dot'} />是</span>
                </span>
              )}
            </Field>
            {executed === '是' && (
              <Field label="是否核销" required>
                {canEditWriteoff ? (
                  <span className="mpd-radio" style={{ color: '#262626' }}>
                    <span onClick={() => setNeedWriteoff('否')} style={{ cursor: 'pointer' }}><i className={needWriteoff === '否' ? 'dot on blue' : 'dot'} />否</span>
                    <span onClick={() => setNeedWriteoff('是')} style={{ cursor: 'pointer' }}><i className={needWriteoff === '是' ? 'dot on blue' : 'dot'} />是</span>
                  </span>
                ) : (
                  <span className="mpd-radio">
                    <span><i className={needWriteoff !== '是' ? 'dot on' : 'dot'} />否</span>
                    <span><i className={needWriteoff === '是' ? 'dot on' : 'dot'} />是</span>
                  </span>
                )}
              </Field>
            )}
          </div>
        </section>

        {(executed === '是' && needWriteoff === '是') || !canEditWriteoff ? (
          <section className="mpd-card">
          <div className="mpd-section-title"><div><h4>回款与核销明细</h4><span>每笔到账独立确认、独立核销，可分多次登记</span></div><span className="mpd-cap">厂家承担总额 <b>¥{fmt(p.factoryFee)}</b></span></div>
          <div className="mpd-ledger-summary">
            <div><span>已登记回款</span><b>¥{fmt(totalRegistered)}</b></div>
            <div><span>已确认到账</span><b>¥{fmt(totalConfirmed)}</b></div>
            <div><span>已核销</span><b>¥{fmt(totalWrittenOff)}</b></div>
            <div><span>待回款 / 可登记</span><b className="hl-orange">¥{fmt(remaining)}</b></div>
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
            <thead><tr><th>期次</th><th>回款金额（元）</th><th>到账时间</th><th>附件<i style={{ fontStyle: 'normal', color: '#f5222d' }}>*</i></th><th>回款状态</th><th>核销状态</th><th>核销时间</th><th>操作</th></tr></thead>
            <tbody>{receipts.length ? receipts.map((r, i) => (
              <tr key={r.id}><td>第 {i + 1} 次</td><td className="num">{fmt(r.amount)}</td><td>{r.date}</td>
                <td><span className="mpd-file-cell">{r.files.map((fl, fi) => <FileThumb key={`${r.id}-${fi}`} name={fl.name} url={fl.url} editable={canEditWriteoff} onPreview={() => setPreviewImg({ name: fl.name, url: fl.url })} onDelete={() => removeFile(r.id, fi)} />)}{canEditWriteoff && <label className="mpd-thumb-add">＋<input type="file" hidden multiple accept="image/*" onChange={e => addFiles(r.id, e.target.files)} /></label>}{!r.files.length && <span className="mpd-file-empty">未上传</span>}</span></td>
                <td><span className={r.status === '待财务确认' ? 'tag-amber' : r.status === '已退回' ? 'tag-red' : 'tag-green'}>{r.status === '待财务确认' ? '待财务确认' : r.status === '已退回' ? '已退回' : '已到账'}</span></td>
                <td><span className={r.status === '已核销' ? 'tag-green' : 'tag-amber'}>{r.status === '已核销' ? '已核销' : r.status === '待核销' ? '待核销' : '未核销'}</span></td>
                <td>{r.status === '已核销' ? r.date : '-'}</td>
                <td className="nowrap">{r.status === '待财务确认' && <><button className="mpd-action" onClick={() => updateReceipt(r.id, '待核销')}>确认到账</button>{canEditWriteoff && <button className="mpd-action danger" onClick={() => removeReceipt(r.id)}>删除</button>}</>}{r.status === '待核销' && <><button className="mpd-action" onClick={() => updateReceipt(r.id, '已核销')}>核销本次</button>{canEditWriteoff && <button className="mpd-action danger" onClick={() => removeReceipt(r.id)}>删除</button>}</>}{r.status === '已核销' && <span className="muted">已完成</span>}{r.status === '已退回' && <span className="muted">请重新登记</span>}{canEditWriteoff && (r.status === '已核销' || r.status === '已退回') && <button className="mpd-action danger" onClick={() => removeReceipt(r.id)}>删除</button>}</td>
              </tr>
            )) : <tr><td colSpan={8} className="empty">暂无回款记录，登记到账后可逐笔确认和核销</td></tr>}</tbody>
          </table></div>
          <p className="mpd-sum">到账确认 ¥{fmt(totalConfirmed)}　已核销 ¥{fmt(totalWrittenOff)}　未核销 ¥{fmt(totalConfirmed - totalWrittenOff)}</p>
        </section>
        ) : null}

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

        <div className="mpd-foot"><button onClick={onBack}>返 回</button>{editMode && <button className="primary" onClick={handleSave}>保 存</button>}{saved}</div>
      </main>
      {previewImg && (
        <div className="mpm-modal-mask" onClick={() => setPreviewImg(null)}>
          <div className="mpm-modal mpm-preview" onClick={e => e.stopPropagation()}>
            <div className="mpm-modal-head"><span>{previewImg.name || '附件预览'}</span><span className="mpm-modal-x" onClick={() => setPreviewImg(null)}>×</span></div>
            <div className="mpm-preview-body">{previewImg.url ? <img src={previewImg.url} alt={previewImg.name} /> : <span className="muted">暂无可预览的图片</span>}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function CreatePage({ onCancel }: { onCancel: () => void }) {
  const curYm = new Date().toISOString().slice(0, 7)
  const categories = ['集客活动', '日常物料', '礼品', '新增平台', '收割活动', '保客活动', '新增投放']
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
            <Field label="品牌" required><input disabled defaultValue="奇瑞" /></Field>
            <Field label="大区名称" required><input disabled defaultValue="安徽一区" /></Field>
            <Field label="门店销售ERP号" required><input disabled defaultValue="3070" /></Field>
            <Field label="门店名称" required><input disabled defaultValue="合肥盈丰" /></Field>
          </div>
        </section>

        <section className="mpd-card">
          <h4>项目信息</h4>
          <div className="mpd-grid">
            <Field label="年/月" required><input defaultValue={curYm} /></Field>
            <Field label="项目分类" required><select className="mpd-select" defaultValue="">{['请选择项目分类', ...categories].map(c => <option key={c} value={c === '请选择项目分类' ? '' : c} disabled={c === '请选择项目分类'}>{c}</option>)}</select></Field>
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
  const [batchOpen, setBatchOpen] = useState(false)
  const [audit, setAudit] = useState<'退回' | '通过'>('通过')
  const [comment, setComment] = useState('')
  const [tab, setTab] = useState('门店待办事项')
  const showBatch = tab === '总部待办事项' && selected.length >= 2

  const rows = useMemo(() => PLANS.filter(p => {
    if (tab === '门店待办事项' && !p.nextOp.includes('门店') && !p.nextOp.includes('核销')) return false
    if (tab === '财务待办事项' && !(p.currentOp.includes('财务') || p.nextOp.includes('回款') || p.nextOp.includes('核销'))) return false
    if (tab === '总部待办事项' && !p.currentOp.includes('总部')) return false
    return (!f.pid || p.id.includes(f.pid)) && (!f.pname || p.name.includes(f.pname)) &&
      (!f.status || p.status === f.status) && (!f.category || p.category === f.category) &&
      (!f.store || p.store.includes(f.store)) && (!f.ym || p.ym.includes(f.ym))
  }), [f, tab])

  const planRegistered = (pl: Plan) => (pl.receipts?.length ? pl.receipts.reduce((s, r) => s + r.amount, 0) : (pl.writeoff ?? 0))
  const planRemaining = (pl: Plan) => Math.max(0, pl.factoryFee - planRegistered(pl))
  const openAudit = (ids: string[]) => { setSelected(ids); setAudit('通过'); setComment(''); setBatchOpen(true) }
  const rowAction = (p: Plan) => {
    if (tab === '总部待办事项') return '总部审核'
    if (tab === '财务待办事项') return '财务审核'
    if (planRemaining(p) <= 0 && planRegistered(p) > 0) return '查看'
    if (p.nextOp.includes('回款登记') || p.nextOp.includes('继续核销')) return '回款登记'
    if (p.currentOp.includes('财务') && planRegistered(p) > 0 && planRemaining(p) > 0) return '回款登记'
    if (p.currentOp.includes('总部审核通过') || p.nextOp.includes('门店核销')) return '门店核销'
    if (p.currentOp.includes('退回') || p.currentOp.includes('不通过')) return '编辑'
    if (p.status === '已结束' || p.status === '已完成') return '查看'
    return '查看'
  }

  const toggleSel = (id: string) => setSelected((s: string[]) => s.includes(id) ? s.filter((x: string) => x !== id) : [...s, id])
  const toggleExp = (id: string) => setExpanded((s: string[]) => s.includes(id) ? s.filter((x: string) => x !== id) : [...s, id])
  const set = (k: string, v: string) => setF((prev: typeof f) => ({ ...prev, [k]: v }))

  const openDetail = (p: Plan) => { setDetail(p) }
  const editModeFor = (pl: Plan): 'project' | 'writeoff' | undefined => {
    const a = rowAction(pl)
    if (a === '门店核销' || a === '回款登记' || pl.nextOp.includes('核销') || pl.nextOp.includes('回款')) return 'writeoff'
    if (a === '编辑') return pl.currentOp.includes('财务') ? 'writeoff' : 'project'
    return undefined
  }

  if (creating) return <CreatePage onCancel={() => setCreating(false)} />
  if (detail) return <DetailPage p={detail} onBack={() => setDetail(null)} editMode={editModeFor(detail)} />

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
          {[['门店待办事项', 2], ['财务待办事项', 4], ['总部待办事项', 2], ['全部', 0]].map(([t, n]) => (
            <span key={t as string} className={tab === t ? 'on' : ''} onClick={() => { setTab(t as string); setSelected([]) }}>{t}{!!n && <b>{n as number}</b>}</span>
          ))}
        </nav>

        <section className="lq-filter">
          {!collapsed && (
            <div className="lq-grid">
              {[['门店销售ERP编号', 'erp', '3070'], ['门店名称', 'store', '请输入门店名称'], ['年/月', 'ym', '请选择年/月'], ['项目编号', 'pid', '请输入项目编号'], ['项目名称', 'pname', '请输入项目名称'], ['项目分类', 'category', '请选择项目分类'], ['当前操作', 'currentOp', '请选择当前操作'], ['下一步操作', 'nextOp', '门店核销，门店回款登记'], ['创建日期', 'created', '开始日期 → 结束日期']].map(([label, key, ph]) => (
                <label key={key}>{label}<input value={(f as any)[key] || ''} onChange={e => set(key, e.target.value)} placeholder={ph as string} /></label>
              ))}
              <label>状态<select className="mpd-select" value={f.status} onChange={e => set('status', e.target.value)}><option value="">请选择状态</option>{PLAN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
            </div>
          )}
          <div className="lq-filter-foot">
            <span className="lq-collapse" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开 ▽' : '收起 △'}</span>
            <span><button className="primary">查 询</button><button>重 置</button></span>
          </div>
        </section>

        <section className="lq-list">
          <div className="lq-list-head"><span>◎ 数据列表</span><span>{showBatch && <button className="primary sm" onClick={() => { setAudit('通过'); setComment(''); setBatchOpen(true) }}>批量审核</button>}<button className="primary sm" onClick={() => setCreating(true)}>新增</button><button className="sm">导出</button></span></div>
          <div className="lq-sel">已选择 {selected.length} / {rows.length} 条数据</div>
          <div className="mpm-table-wrap">
            <table className="mpm-table lq-table">
              <thead><tr>
                <th></th><th><input type="checkbox" onChange={e => setSelected(e.target.checked ? rows.map(r => r.id) : [])} /></th>
                <th>序号</th><th>项目编号</th><th>年/月</th><th>项目名称</th><th>项目分类</th><th>品牌</th><th>大区名称</th><th>门店销售ERP号</th><th>门店名称</th><th>状态</th><th>操作</th>
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
                      <td><span className={STATUS_CLASS[p.status] || ''}>{p.status}</span></td>
                      <td className="nowrap">{tab === '总部待办事项' || tab === '财务待办事项' ? <a onClick={() => openAudit([p.id])}>{rowAction(p)}</a> : <a onClick={() => openDetail(p)}>{rowAction(p)}</a>}</td>
                    </tr>
                    {expanded.includes(p.id) && (
                      <tr className="mpm-subrow"><td></td><td colSpan={12}>
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
      {batchOpen && (
        <div className="mpm-modal-mask" onClick={() => setBatchOpen(false)}>
          <div className="mpm-modal" onClick={e => e.stopPropagation()}>
            <div className="mpm-modal-head"><span>{selected.length > 1 ? `批量审核（已选 ${selected.length} 条）` : `${tab === '财务待办事项' ? '财务' : '总部'}审核`}</span><span className="mpm-modal-x" onClick={() => setBatchOpen(false)}>×</span></div>
            <div className="mpm-modal-body">
              <div className="mpm-audit-col">
                <span className="mpm-audit-label"><i>*</i> 审核信息</span>
                <span className="mpd-radio" style={{ color: '#262626' }}>
                  <span onClick={() => setAudit('退回')} style={{ cursor: 'pointer' }}><i className={audit === '退回' ? 'dot on blue' : 'dot'} />退回</span>
                  <span onClick={() => setAudit('通过')} style={{ cursor: 'pointer' }}><i className={audit === '通过' ? 'dot on blue' : 'dot'} />通过</span>
                </span>
              </div>
              {audit === '退回' && (
                <div className="mpm-audit-col">
                  <span className="mpm-audit-label"><i>*</i> 退回意见</span>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} rows={5} placeholder="请输入退回意见" />
                </div>
              )}
            </div>
            <div className="mpm-modal-foot"><button onClick={() => setBatchOpen(false)}>取 消</button><button className="primary" disabled={audit === '退回' && !comment.trim()} onClick={() => { setBatchOpen(false); setSelected([]) }}>确 定</button></div>
          </div>
        </div>
      )}

    </div>
  )
}
