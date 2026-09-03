/**
 * @name 限价申请列表
 * @mode axure
 *
 * 大客户营销平台 - 限价管理 - 限价申请列表
 * 展示限价申请单列表，操作列按审核层级判定显示对应审核按钮，或查看。
 */
import React, { useState, useMemo } from 'react'
import { ChevronDown, Plus, Search, Eye, AlertTriangle } from 'lucide-react'
import {
  AnnotationViewer,
  setProtoDevState,
  useProtoDevState,
  type AnnotationDirectoryRouteNode,
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation'
import annotationSourceDocument from './annotation-source.json'
import './style.css'
import logoImg from './assets/logo.jpeg'
import {
  PRICE_LIMIT_ORDERS as ORDERS,
  CURRENT_RULE_PERMISSIONS as RULES,
  resolveApprovalLevel,
  buildApprovalChain,
  APPROVAL_LEVEL_META,
  type PriceLimitOrder,
  type ApprovalLevel,
} from '../shared/price-limit'

type MenuKey = 'list' | 'apply'

type ProtoState = {
  list_status?: 'all' | 'pending' | 'approved' | 'rejected'
}

function normalizeStatus(value: unknown): 'all' | 'pending' | 'approved' | 'rejected' {
  return value === 'pending' || value === 'approved' || value === 'rejected' ? value : 'all'
}

const Component = () => {
  const protoState = useProtoDevState<ProtoState>()
  const [activeMenu, setActiveMenu] = useState<MenuKey>('apply')
  const [filterStatus, setFilterStatus] = useState(() => {
    const init = normalizeStatus(protoState.list_status)
    return init === 'all' ? '' : init
  })
  const [keyword, setKeyword] = useState('')

  const syncFilterStatus = (value: string) => {
    setFilterStatus(value)
    setProtoDevState({ list_status: normalizeStatus(value || 'all') })
  }

  const handleMenuClick = (menu: MenuKey) => {
    setActiveMenu(menu)
    if (menu === 'list') {
      window.location.href = '../policy-management-edit/'
    }
  }

  const orders = useMemo(() => {
    return ORDERS.filter(o => {
      const matchStatus = filterStatus === '' || o.reviewStatus === filterStatus
      const kw = keyword.trim()
      const matchKw = kw === '' || o.applicationNo.includes(kw) || o.vin.includes(kw) || o.storeName.includes(kw)
      return matchStatus && matchKw
    })
  }, [filterStatus, keyword])

  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    showThemeToggle: true,
    showColorFilter: true,
    toolbarEdge: 'right',
    emptyWhenNoData: false,
    currentPageId: 'list',
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      const payload = node.payload as { status?: string } | undefined
      if (payload?.status) {
        const next = normalizeStatus(payload.status)
        syncFilterStatus(next === 'all' ? '' : next)
      }
    },
  }), [])

  return (
    <div className="pll-container">
      <AnnotationViewer
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={annotationOptions}
      />
      {/* ── Header ── */}
      <header className="pll-header">
        <div className="pll-header-left">
          <img src={logoImg} alt="Logo" className="pll-logo" />
        </div>
        <div className="pll-header-right">
          <button className="pll-header-btn">
            <span>中文</span>
            <ChevronDown size={10} />
          </button>
          <div className="pll-user-info">
            <svg width="14" height="14" viewBox="64 64 896 896" fill="currentColor">
              <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
            </svg>
            <span>系统管理员</span>
            <ChevronDown size={10} />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="pll-main-content">
        {/* Sidebar */}
        <aside className="pll-sidebar">
          <div className="pll-search-box">
            <input type="text" placeholder="搜索菜单..." />
            <svg width="14" height="14" viewBox="64 64 896 896" fill="rgb(8, 18, 37)">
              <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"/>
            </svg>
          </div>

          <div className="pll-menu-list">
            <div className="pll-menu-item pll-menu-item-active">
              <span>限价管理</span>
              <ChevronDown size={10} />
            </div>
            <div className="pll-submenu-wrapper">
              <div className="pll-submenu-item" onClick={() => handleMenuClick('list')}>限价列表</div>
              <div className="pll-submenu-item">限价规则</div>
              <div className={`pll-submenu-item ${activeMenu === 'apply' ? 'pll-submenu-item-active' : ''}`} onClick={() => setActiveMenu('apply')}>限价申请</div>
              <div className="pll-submenu-item">用户管理</div>
              <div className="pll-submenu-item">资质审核</div>
              <div className="pll-submenu-item">优惠券核销</div>
            </div>
          </div>

          <button className="pll-fold-button">
            <svg width="16" height="16" viewBox="64 64 896 896" fill="rgba(0, 0, 0, 0.88)">
              <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"/>
            </svg>
          </button>
        </aside>

        {/* Content */}
        <main className="pll-content-area">
          <div className="pll-breadcrumb">
            <span className="pll-bcrumb-item">限价管理</span>
            <span className="pll-bcrumb-sep">/</span>
            <span className="pll-bcrumb-item pll-bcrumb-item-active">限价申请</span>
          </div>

          <div className="pll-page-content" data-annotation-id="pll-list-page">
            {/* 筛选条件 */}
            <div className="pll-card" data-annotation-id="pll-filter">
              <div className="pll-form-section-title">筛选条件</div>
              <div className="pll-filter-row">
                <div className="pll-form-item">
                  <label className="pll-form-label">申请单号</label>
                  <input
                    className="pll-input"
                    placeholder="请输入申请单号"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                  />
                </div>
                <div className="pll-form-item">
                  <label className="pll-form-label">审核状态</label>
                  <select className="pll-input" value={filterStatus} onChange={e => syncFilterStatus(e.target.value)}>
                    <option value="">全部</option>
                    <option value="pending">待审核</option>
                    <option value="approved">已通过</option>
                    <option value="rejected">已驳回</option>
                  </select>
                </div>
                <button className="pll-btn pll-btn-query" onClick={() => {}}>
                  <Search size={14} />
                  查询
                </button>
              </div>
            </div>

            {/* 列表 */}
            <div className="pll-card" data-annotation-id="pll-table">
              <div className="pll-table-header">
                <div className="pll-table-title">限价申请列表</div>
                <button className="pll-btn pll-btn-ghost" onClick={() => {/* 新增入口占位 */}}>
                  <Plus size={14} />
                  新增申请
                </button>
              </div>
              <div className="pll-table-wrap">
                <table className="pll-table">
                  <thead>
                    <tr>
                      <th>申请单号</th>
                      <th>VIN码</th>
                      <th>车型</th>
                      <th>门店名称</th>
                      <th>综合毛利限价</th>
                      <th>预估综合毛利</th>
                      <th>审核层级</th>
                      <th>审核状态</th>
                      <th>创建时间</th>
                      <th>审核人</th>
                      <th>审核时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="pll-empty">暂无数据</td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <OrderRow key={o.applicationNo} order={o} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Component

function OrderRow({ order }: { order: PriceLimitOrder }) {
  const level = resolveApprovalLevel(order, RULES)
  const chain = buildApprovalChain(level)
  const exceed = order.marginLimit - order.estimatedMargin

  const openReview = (targetLevel: ApprovalLevel) => {
    window.location.href = `../price-limit-apply/?app=${order.applicationNo}&mode=review&level=${targetLevel}`
  }
  const openView = () => {
    window.location.href = `../price-limit-apply/?app=${order.applicationNo}&mode=view`
  }

  return (
    <tr>
      <td className="pll-cell-no">{order.applicationNo}</td>
      <td className="pll-cell-vin">{order.vin}</td>
      <td>{order.carSeries} {order.modelName}</td>
      <td>{order.storeName}</td>
      <td>{order.marginLimit.toLocaleString()}</td>
      <td>{order.estimatedMargin.toLocaleString()}</td>
      <td data-annotation-id="pll-approval-chain">
        {chain.length > 0 ? (
          <span className="pll-level" title={`超出限价 ${exceed} 元`}>
            {chain.map((l, i) => (
              <span key={l}>
                {i > 0 && <span className="pll-level-sep">→</span>}
                <span className={`pll-level-tag pll-level-${l}`}>{APPROVAL_LEVEL_META[l].label}</span>
              </span>
            ))}
          </span>
        ) : (
          <span className="pll-level-none">—</span>
        )}
      </td>
      <td>
        <span className={`pll-status pll-status-${order.reviewStatus}`}>
          {order.reviewStatus === 'pending' ? '待审核' : order.reviewStatus === 'approved' ? '已通过' : '已驳回'}
        </span>
      </td>
      <td>{order.createdAt}</td>
      <td>{order.reviewer || '—'}</td>
      <td>{order.reviewedAt || '—'}</td>
      <td>
        <div className="pll-actions" data-annotation-id="pll-actions">
          {order.reviewStatus === 'pending' && level ? (
            <button className="pll-link-btn" onClick={() => openReview(level)}>
              {APPROVAL_LEVEL_META[level].label}
            </button>
          ) : order.reviewStatus === 'pending' ? (
            <span className="pll-overquote">
              <AlertTriangle size={13} />
              超出集团权限
            </span>
          ) : (
            <button className="pll-link-btn" onClick={openView}>
              <Eye size={13} />
              查看
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}