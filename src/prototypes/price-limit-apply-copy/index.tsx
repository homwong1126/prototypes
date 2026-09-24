/**
 * @name 限价申请
 * @mode axure
 *
 * 大客户营销平台 - 限价管理 - 限价申请
 * - 申请单列表：展示申请单号、车辆信息、审核状态、创建/审核时间、审核人及操作列
 * - 审核级别判定：
 *   1) 预估综合毛利 >= 综合毛利限价：无需审批
 *   2) 预估综合毛利为负值：走全部审批（集团审核）
 *   3) 预估综合毛利 < 综合毛利限价：按降幅命中层级配置金额判定审核级别
 *      大区(1000) → 条线(2000) → 门店(3000) → 集团(不限)
 * - 操作列：待审核单据显示对应级别审核按钮，审核完成只显示"查看"（只读详情页）
 *
 * 参考资料：
 * - rules/axure-export-workflow.md
 * - rules/prototype-development-guide.md
 * - rules/axure-api-guide.md
 */
import React, { useState, useCallback, useMemo } from 'react'
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronLeft,
  Lock,
  Check,
  X,
  AlertTriangle,
  Info,
  Search,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
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

// ─── 类型 ────────────────────────────────────────────────────────────────────

type ApproveLevel = '大区' | '条线' | '门店' | '集团'
type ApplicationStatus = '待审核' | '已通过' | '已驳回'
type ViewMode = 'message' | 'list' | 'review' | 'detail'

interface VehicleInfo {
  vin: string
  sapMaterialCode: string
  materialCode: string
  brand: string
  productSeries: string
  carSeries: string
  modelName: string
  yearModel: string
  powertrain: string
  trim: string
  interiorColor: string
  exteriorColor: string
  purchaseOrderType: string
  productionDate: string
  inboundTime: string
  purchaseType: string
  purchasePrice: number
}

interface PriceLimitApplication {
  id: string
  storeErpNo: string
  storeName: string
  vehicle: VehicleInfo
  marginLimit: number
  estimatedMargin: number
  status: ApplicationStatus
  createdAt: string
  approver: string
  approvedAt: string
  reviewComment: string
}

// ─── 审核级别判定规则 ────────────────────────────────────────────────────────

const LEVEL_ORDER: ApproveLevel[] = ['大区', '条线', '门店', '集团']

const LEVEL_PERMISSION: Record<ApproveLevel, number> = {
  大区: 1000,
  条线: 2000,
  门店: 3000,
  集团: Infinity,
}

export type MarginApprovalStatus = 'none' | 'negative' | 'below' | 'ok'

/**
 * 审批逻辑（整体调整）：
 * 1. 预估综合毛利 >= 综合毛利限价：无需审批
 * 2. 预估综合毛利为负值：走全部审批（集团审核）
 * 3. 预估综合毛利 < 综合毛利限价（且非负）：
 *    按降幅（限价 - 预估毛利）命中层级配置金额判定审核级别，
 *    未超过任一权限额度时由大区审核，超出条线/门店额度逐级上报至集团
 */
export function computeMarginApproval(
  marginLimit: number,
  estimatedMargin: number,
): { status: MarginApprovalStatus; level: ApproveLevel | null; drop: number } {
  const drop = marginLimit - estimatedMargin
  if (estimatedMargin >= marginLimit) {
    return { status: 'ok', level: null, drop: Math.max(drop, 0) }
  }
  if (estimatedMargin < 0) {
    return { status: 'negative', level: '集团', drop }
  }
  let level: ApproveLevel = '大区'
  for (const item of LEVEL_ORDER) {
    if (drop > LEVEL_PERMISSION[item]) {
      level = item
    }
  }
  return { status: 'below', level, drop }
}

const LEVEL_TAG_CLASS: Record<ApproveLevel, string> = {
  大区: 'pla-level-tag pla-level-da',
  条线: 'pla-level-tag pla-level-tiao',
  门店: 'pla-level-tag pla-level-men',
  集团: 'pla-level-tag pla-level-ji',
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const BASE_VEHICLE: VehicleInfo = {
  vin: 'LVTDB21B6TDN02238',
  sapMaterialCode: 'T64706TCWJW0015',
  materialCode: 'T64706TCWJW0015',
  brand: '奇瑞',
  productSeries: '瑞虎系列',
  carSeries: '瑞虎8',
  modelName: '第五代瑞虎8-豹款',
  yearModel: '2026款',
  powertrain: '1.6T-7DCT',
  trim: '尊贵型',
  interiorColor: '琥珀棕',
  exteriorColor: '石墨黑(新)',
  purchaseOrderType: '周订单',
  productionDate: '2026-07-30',
  inboundTime: '2026-08-17 10:47:47',
  purchaseType: '厂家',
  purchasePrice: 75180,
}

function makeVehicle(vin: string, interior: string, exterior: string, price: number): VehicleInfo {
  return { ...BASE_VEHICLE, vin, interiorColor: interior, exteriorColor: exterior, purchasePrice: price }
}

const INITIAL_APPLICATIONS: PriceLimitApplication[] = [
  {
    id: 'XJ3356202609010001',
    storeErpNo: '3356',
    storeName: '上海盈丰',
    vehicle: makeVehicle('LVTDB21B6TDN03356', '琥珀棕', '珍珠白', 75080),
    marginLimit: 3000,
    estimatedMargin: 1200,
    status: '待审核',
    createdAt: '2026-09-01 10:08:00',
    approver: '',
    approvedAt: '',
    reviewComment: '',
  },
  {
    id: 'XJ3463-1202608260001',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN02238', '琥珀棕', '石墨黑(新)', 75180),
    marginLimit: 3000,
    estimatedMargin: 2500,
    status: '待审核',
    createdAt: '2026-08-26 09:15:30',
    approver: '',
    approvedAt: '',
    reviewComment: '',
  },
  {
    id: 'XJ3463-1202608260002',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN03147', '云灰', '珍珠白', 74800),
    marginLimit: 3000,
    estimatedMargin: 1500,
    status: '待审核',
    createdAt: '2026-08-26 10:02:11',
    approver: '',
    approvedAt: '',
    reviewComment: '',
  },
  {
    id: 'XJ3463-1202608260003',
    storeErpNo: '3463-2',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN04522', '琥珀棕', '激光绿', 75600),
    marginLimit: 3000,
    estimatedMargin: 500,
    status: '待审核',
    createdAt: '2026-08-26 11:40:05',
    approver: '',
    approvedAt: '',
    reviewComment: '',
  },
  {
    id: 'XJ3463-1202608260004',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN05893', '云灰', '石墨黑(新)', 76120),
    marginLimit: 3000,
    estimatedMargin: -300,
    status: '待审核',
    createdAt: '2026-08-26 14:26:47',
    approver: '',
    approvedAt: '',
    reviewComment: '',
  },
  {
    id: 'XJ3463-1202608260005',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN01204', '琥珀棕', '珍珠白', 74990),
    marginLimit: 3000,
    estimatedMargin: 2800,
    status: '已通过',
    createdAt: '2026-08-25 16:08:20',
    approver: '王审核',
    approvedAt: '2026-08-25 17:30:00',
    reviewComment: '同意，本次降价幅度在权限范围内',
  },
  {
    id: 'XJ3463-1202608260007',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN06331', '琥珀棕', '珍珠白', 75260),
    marginLimit: 3000,
    estimatedMargin: 3500,
    status: '已通过',
    createdAt: '2026-08-24 15:20:11',
    approver: '-',
    approvedAt: '-',
    reviewComment: '预估综合毛利不低于限价，无需审批',
  },
  {
    id: 'XJ3463-1202608260006',
    storeErpNo: '3463-2',
    storeName: '上海QQ',
    vehicle: makeVehicle('LVTDB21B6TDN02661', '云灰', '激光绿', 75450),
    marginLimit: 3000,
    estimatedMargin: 1200,
    status: '已驳回',
    createdAt: '2026-08-25 11:25:44',
    approver: '李审核',
    approvedAt: '2026-08-25 15:02:30',
    reviewComment: '申请材料不完整，请补充客户订单信息后重新提交',
  },
]

const STATUS_BADGE_CLASS: Record<ApplicationStatus, string> = {
  待审核: 'pla-status-badge pla-status-pending',
  已通过: 'pla-status-badge pla-status-approved',
  已驳回: 'pla-status-badge pla-status-rejected',
}

function normalizeViewMode(value: unknown): ViewMode {
  return value === 'message' || value === 'review' || value === 'detail' ? (value as ViewMode) : 'list'
}

// ─── 组件 ────────────────────────────────────────────────────────────────────

type ProtoState = {
  filter_status?: string
  filter_level?: string
  review_level?: string
}

function normalizeProtoString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

const Component = function Component() {
  const protoState = useProtoDevState<ProtoState>()
  const [viewMode, setViewMode] = useState<ViewMode>('message')
  const [applications, setApplications] = useState<PriceLimitApplication[]>(INITIAL_APPLICATIONS)
  const [selectedId, setSelectedId] = useState<string>('XJ3356202609010001')
  const [reviewComment, setReviewComment] = useState('')
  const [showCommentError, setShowCommentError] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [reviewOrigin, setReviewOrigin] = useState<ViewMode>('list')

  // 列表筛选（受控于标注面板）
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    const v = protoState.filter_status
    return v === '待审核' || v === '已通过' || v === '已驳回' ? v : ''
  })
  const [filterLevel, setFilterLevel] = useState<string>(() => {
    const v = protoState.filter_level
    return v === '大区' || v === '条线' || v === '门店' || v === '集团' ? v : ''
  })
  const [keyword, setKeyword] = useState('')

  const effectiveViewMode = viewMode

  const syncViewMode = useCallback((next: ViewMode) => {
    setViewMode(next)
  }, [])

  const syncFilterStatus = useCallback((value: string) => {
    setFilterStatus(value)
    setProtoDevState({ filter_status: value || 'all' })
  }, [])

  React.useEffect(() => {
    const v = normalizeProtoString(protoState.filter_status, 'all')
    const next = v === '待审核' || v === '已通过' || v === '已驳回' ? v : ''
    if (next !== filterStatus) setFilterStatus(next)
  }, [protoState.filter_status])

  const selected = useMemo(
    () => applications.find(app => app.id === selectedId) || null,
    [applications, selectedId],
  )

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const openReview = useCallback((id: string, origin: ViewMode = 'list') => {
    setReviewOrigin(origin)
    setSelectedId(id)
    setReviewComment('')
    setShowCommentError(false)
    syncViewMode('review')
  }, [syncViewMode])

  const openDetail = useCallback((id: string) => {
    setSelectedId(id)
    syncViewMode('detail')
  }, [syncViewMode])

  const backToList = useCallback(() => {
    setSelectedId('')
    setReviewComment('')
    setShowCommentError(false)
    syncViewMode('list')
  }, [syncViewMode])

  const backFromReview = useCallback(() => {
    if (reviewOrigin === 'message') {
      setReviewComment('')
      setShowCommentError(false)
      syncViewMode('message')
      return
    }
    backToList()
  }, [backToList, reviewOrigin, syncViewMode])

  const handleApprove = useCallback(() => {
    if (!selected) return
    const now = new Date()
    const nowText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setApplications(prev =>
      prev.map(app =>
        app.id === selected.id
          ? {
              ...app,
              status: '已通过' as const,
              approver: '审核员',
              approvedAt: nowText,
              reviewComment: reviewComment.trim() || '同意',
            }
          : app,
      ),
    )
    showToast('审核通过，限价申请已批准', 'success')
    setSelectedId('')
    setReviewComment('')
    setShowCommentError(false)
    syncViewMode('list')
  }, [selected, reviewComment, showToast, syncViewMode])

  const handleReject = useCallback(() => {
    if (!selected) return
    if (!reviewComment.trim()) {
      setShowCommentError(true)
      return
    }
    const now = new Date()
    const nowText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    setApplications(prev =>
      prev.map(app =>
        app.id === selected.id
          ? {
              ...app,
              status: '已驳回' as const,
              approver: '审核员',
              approvedAt: nowText,
              reviewComment: reviewComment.trim(),
            }
          : app,
      ),
    )
    showToast('已驳回，申请已退回门店', 'error')
    setSelectedId('')
    setReviewComment('')
    setShowCommentError(false)
    syncViewMode('list')
  }, [selected, reviewComment, showToast, syncViewMode])

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      if (filterStatus && app.status !== filterStatus) return false
      const { level } = computeMarginApproval(app.marginLimit, app.estimatedMargin)
      if (filterLevel && level !== filterLevel) return false
      if (
        keyword.trim() &&
        !app.id.includes(keyword.trim()) &&
        !app.vehicle.vin.includes(keyword.trim())
      ) {
        return false
      }
      return true
    })
  }, [applications, filterStatus, filterLevel, keyword])

  const resetFilters = useCallback(() => {
    setFilterStatus('')
    setFilterLevel('')
    setKeyword('')
  }, [])

  const annotationOptions = useMemo<AnnotationViewerOptions>(() => ({
    showToolbar: true,
    showThemeToggle: true,
    showColorFilter: true,
    toolbarEdge: 'right',
    emptyWhenNoData: false,
    currentPageId: effectiveViewMode,
    onDirectoryRoute: (node: AnnotationDirectoryRouteNode) => {
      if (typeof node.route === 'string') {
        const next = normalizeViewMode(node.route)
        syncViewMode(next)
        if (next === 'list') {
          setSelectedId('')
          setReviewComment('')
          setShowCommentError(false)
        }
      }
      const payload = node.payload as { view_mode?: ViewMode } | undefined
      if (payload?.view_mode) {
        syncViewMode(normalizeViewMode(payload.view_mode))
      }
    },
  }), [effectiveViewMode, syncViewMode])

  return (
    <>
      <AnnotationViewer
        source={annotationSourceDocument as AnnotationSourceDocument}
        options={annotationOptions}
      />
      <div className={`pla-container pla-mode-${effectiveViewMode}`}>
      {/* ── Header ── */}
      <header className="pla-header">
        <div className="pla-header-left">
          <img src={logoImg} alt="Logo" className="pla-logo" />
        </div>
        <div className="pla-header-right">
          <button className="pla-header-btn">
            <span>中文</span>
            <ChevronDown size={10} />
          </button>
          <div className="pla-user-info">
            <svg width="14" height="14" viewBox="64 64 896 896" fill="currentColor">
              <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
            </svg>
            <span>系统管理员</span>
            <ChevronDown size={10} />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="pla-main-content">
        {/* Sidebar */}
        <aside className="pla-sidebar">
          <div className="pla-search-box">
            <input type="text" placeholder="搜索菜单..." />
            <svg width="14" height="14" viewBox="64 64 896 896" fill="rgb(8, 18, 37)">
              <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"/>
            </svg>
          </div>

          <div className="pla-menu-list">
            <div className="pla-menu-item pla-menu-item-active">
              <span>限价管理</span>
              <ChevronDown size={10} />
            </div>
            <div className="pla-submenu-wrapper">
              <div className="pla-submenu-item pla-submenu-item-active">限价申请</div>
            </div>
          </div>

          <button className="pla-fold-button">
            <svg width="16" height="16" viewBox="64 64 896 896" fill="rgba(0, 0, 0, 0.88)">
              <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"/>
            </svg>
          </button>
        </aside>

        {/* Content Area */}
        <main className="pla-content-area">
          <div className="pla-breadcrumb">
            <span className="pla-breadcrumb-item">限价管理</span>
            <span className="pla-breadcrumb-separator">/</span>
            <span className="pla-breadcrumb-item pla-breadcrumb-item-active">
              {effectiveViewMode === 'list' ? '限价申请' : effectiveViewMode === 'review' ? '限价申请 / 审核' : '限价申请 / 详情'}
            </span>
          </div>

        <div className="pla-page-content pla-review-page-content" data-annotation-id="pla-page-content">
            {effectiveViewMode === 'list' && (
              <ListPage
                applications={filteredApplications}
                filterStatus={filterStatus}
                filterLevel={filterLevel}
                keyword={keyword}
                onFilterStatus={setFilterStatus}
                onFilterLevel={setFilterLevel}
                onKeyword={setKeyword}
                onReset={resetFilters}
                onReview={openReview}
                onDetail={openDetail}
              />
            )}

            {effectiveViewMode === 'message' && (
              <MessagePage
                onOpenReview={() => openReview('XJ3356202609010001', 'message')}
              />
            )}

            {effectiveViewMode === 'review' && selected && (
              <ReviewPage
                application={selected}
                reviewComment={reviewComment}
                showCommentError={showCommentError}
                onCommentChange={value => {
                  setReviewComment(value)
                  if (showCommentError) setShowCommentError(false)
                }}
                onBack={backFromReview}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            )}

            {effectiveViewMode === 'detail' && selected && (
              <DetailPage application={selected} onBack={backToList} />
            )}
            {effectiveViewMode !== 'list' && !selected && (
              <div className="pla-card" style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', padding: 32 }}>
                请先在列表中选择一条申请单，或通过标注面板切换回列表
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`pla-toast pla-toast-${toast.type}`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          <span>{toast.message}</span>
        </div>
      )}
      </div>
    </>
  )
}

// ─── 申请单列表页 ────────────────────────────────────────────────────────────

interface ListPageProps {
  applications: PriceLimitApplication[]
  filterStatus: string
  filterLevel: string
  keyword: string
  onFilterStatus: (value: string) => void
  onFilterLevel: (value: string) => void
  onKeyword: (value: string) => void
  onReset: () => void
  onReview: (id: string) => void
  onDetail: (id: string) => void
}

function ListPage(props: ListPageProps) {
  const {
    applications,
    filterStatus,
    filterLevel,
    keyword,
    onFilterStatus,
    onFilterLevel,
    onKeyword,
    onReset,
    onReview,
    onDetail,
  } = props

  return (
    <>
      {/* 筛选条件 */}
      <div className="pla-card pla-desktop-filter" data-annotation-id="pla-list-filter">
        <div className="pla-section-title">
          <Info size={14} />
          <span>筛选条件</span>
        </div>
        <div className="pla-form-grid pla-list-filter">
          <div className="pla-form-item">
            <label className="pla-form-label">申请单号 / VIN码</label>
            <div className="pla-input-wrap pla-input-with-icon">
              <input
                type="text"
                className="pla-form-input"
                placeholder="请输入申请单号或VIN码"
                value={keyword}
                onChange={e => onKeyword(e.target.value)}
              />
              <Search size={14} className="pla-input-suffix" />
            </div>
          </div>
          <div className="pla-form-item">
            <label className="pla-form-label">审核状态</label>
            <select
              className="pla-form-input"
              value={filterStatus}
              onChange={e => onFilterStatus(e.target.value)}
            >
              <option value="">全部</option>
              <option value="待审核">待审核</option>
              <option value="已通过">已通过</option>
              <option value="已驳回">已驳回</option>
            </select>
          </div>
          <div className="pla-form-item">
            <label className="pla-form-label">需审核级别</label>
            <select
              className="pla-form-input"
              value={filterLevel}
              onChange={e => onFilterLevel(e.target.value)}
            >
              <option value="">全部</option>
              <option value="大区">大区审核</option>
              <option value="条线">条线审核</option>
              <option value="门店">门店审核</option>
              <option value="集团">集团审核</option>
            </select>
          </div>
          <div className="pla-form-item pla-list-filter-actions">
            <button className="pla-filter-btn" onClick={onReset}>重置</button>
          </div>
        </div>
      </div>

      {/* 申请单列表 */}
      <div className="pla-table-container" data-annotation-id="pla-list-table">
        <div className="pla-table-header">
          <div className="pla-table-title">限价申请单列表</div>
          <div className="pla-table-actions">
            <button className="pla-btn pla-btn-ghost">
              <FileSpreadsheet size={14} />
              导出
            </button>
          </div>
        </div>
        <div className="pla-table-wrapper">
          <table className="pla-table">
            <thead>
              <tr>
                <th>申请单号</th>
                <th>VIN码</th>
                <th>车系</th>
                <th>车型</th>
                <th>预估综合毛利</th>
                <th>综合毛利限价</th>
                <th>需审核级别</th>
                <th>审核状态</th>
                <th>创建时间</th>
                <th>审核人</th>
                <th>审核时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => {
                const { level } = computeMarginApproval(app.marginLimit, app.estimatedMargin)
                const isPending = app.status === '待审核'
                return (
                  <tr key={app.id}>
                    <td className="pla-cell-mono">{app.id}</td>
                    <td className="pla-cell-mono">{app.vehicle.vin}</td>
                    <td>{app.vehicle.carSeries}</td>
                    <td>{app.vehicle.modelName}</td>
                    <td className={app.estimatedMargin < app.marginLimit ? 'pla-cell-warn' : ''}>
                      {app.estimatedMargin.toLocaleString()}
                    </td>
                    <td>{app.marginLimit.toLocaleString()}</td>
                    <td>
                      {level ? <span className={LEVEL_TAG_CLASS[level]}>{level}审核</span> : <span className="pla-level-none">无需审批</span>}
                    </td>
                    <td>
                      <span className={STATUS_BADGE_CLASS[app.status]}>{app.status}</span>
                    </td>
                    <td>{app.createdAt}</td>
                    <td>{app.approver || '-'}</td>
                    <td>{app.approvedAt || '-'}</td>
                    <td>
                      {isPending ? (
                        level ? (
                          <button className="pla-btn pla-btn-primary" onClick={() => onReview(app.id)}>
                            {level}审核
                          </button>
                        ) : (
                          <span className="pla-level-none">无需审批</span>
                        )
                      ) : (
                        <button className="pla-btn pla-btn-view" onClick={() => onDetail(app.id)}>
                          <Eye size={14} />
                          查看
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={12} className="pla-table-empty">暂无符合条件的数据</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 移动端申请单卡片列表 */}
      <div className="pla-mobile-list">
        <header className="pla-mobile-list-header">
          <div>
            <h1>限价申请</h1>
            <p>{applications.length} 条申请</p>
          </div>
          <button className="pla-btn pla-btn-ghost" onClick={onReset}>重置</button>
        </header>
        <div className="pla-mobile-filter">
          <div className="pla-input-wrap pla-input-with-icon">
            <input
              type="text"
              className="pla-form-input"
              placeholder="申请单号 / VIN码"
              value={keyword}
              onChange={e => onKeyword(e.target.value)}
            />
            <Search size={16} className="pla-input-suffix" />
          </div>
          <div className="pla-mobile-chips" role="tablist" aria-label="审核状态筛选">
            {[
              { value: '', label: '全部' },
              { value: '待审核', label: '待审核' },
              { value: '已通过', label: '已通过' },
              { value: '已驳回', label: '已驳回' },
            ].map(option => (
              <button
                key={option.label}
                className={`pla-mobile-chip ${filterStatus === option.value ? 'pla-mobile-chip-active' : ''}`}
                onClick={() => onFilterStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="pla-mobile-cards">
          {applications.map(app => {
            const { level } = computeMarginApproval(app.marginLimit, app.estimatedMargin)
            const isPending = app.status === '待审核'
            return (
              <article key={app.id} className="pla-mobile-card">
                <div className="pla-mobile-card-top">
                  <span className="pla-cell-mono">{app.id}</span>
                  <span className={STATUS_BADGE_CLASS[app.status]}>{app.status}</span>
                </div>
                <div className="pla-mobile-card-title">
                  <strong>{app.vehicle.modelName}</strong>
                  <span>{app.vehicle.carSeries}</span>
                </div>
                <div className="pla-mobile-card-grid">
                  <div>
                    <span className="pla-v-label">预估综合毛利</span>
                    <span className={app.estimatedMargin < app.marginLimit ? 'pla-mobile-value pla-cell-warn' : 'pla-mobile-value'}>
                      {app.estimatedMargin.toLocaleString()} 元
                    </span>
                  </div>
                  <div>
                    <span className="pla-v-label">综合毛利限价</span>
                    <span className="pla-mobile-value">{app.marginLimit.toLocaleString()} 元</span>
                  </div>
                  <div>
                    <span className="pla-v-label">需审核级别</span>
                    <span className="pla-mobile-value">{level ? `${level}审核` : '无需审批'}</span>
                  </div>
                  <div>
                    <span className="pla-v-label">创建时间</span>
                    <span className="pla-mobile-value">{app.createdAt}</span>
                  </div>
                  <div>
                    <span className="pla-v-label">审核人</span>
                    <span className="pla-mobile-value">{app.approver || '-'}</span>
                  </div>
                  <div>
                    <span className="pla-v-label">审核时间</span>
                    <span className="pla-mobile-value">{app.approvedAt || '-'}</span>
                  </div>
                </div>
                <div className="pla-mobile-card-actions">
                  {isPending && level ? (
                    <button className="pla-btn pla-btn-primary" onClick={() => onReview(app.id)}>
                      {level}审核
                    </button>
                  ) : !isPending ? (
                    <button className="pla-btn pla-btn-view" onClick={() => onDetail(app.id)}>
                      <Eye size={14} />
                      查看
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
          {applications.length === 0 && (
            <div className="pla-mobile-card pla-mobile-empty">暂无符合条件的数据</div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── 消息提醒页 ──────────────────────────────────────────────────────────────

function MessagePage({ onOpenReview }: { onOpenReview: () => void }) {
  const messages = [
    {
      id: 'message-20260901',
      idLabel: 'XJ3356202609010001+3356',
      module: '限价申请',
      approvers: '张三/李四',
      submittedLabel: '单据提交时间',
      submittedAt: '2026-09-01 10:08:00',
      time: '9月1日 10:08',
    },
    {
      id: 'message-20260415',
      idLabel: 'RF20250924009+10145',
      module: '返利资金划转申请',
      approvers: '王泓/樊昕/测试曹子良',
      submittedLabel: '单据提交日期',
      submittedAt: '2026-04-15 13:53:30',
      time: '4月15日 13:53',
    },
    {
      id: 'message-20260715',
      idLabel: 'RF20250924022+10145',
      module: '返利资金划转申请',
      approvers: '王泓/樊昕/测试曹子良',
      submittedLabel: '单据提交日期',
      submittedAt: '2026-07-15 15:47:02',
      time: '7月15日 15:47',
    },
    {
      id: 'message-20260904',
      idLabel: 'RF20260630001+10145',
      module: '返利资金划转申请',
      approvers: '王泓/樊昕/测试曹子良',
      submittedLabel: '单据提交日期',
      submittedAt: '2026-09-04 15:11:56',
      time: '9月4日 15:12',
    },
  ]

  return (
    <div className="pla-message-page" data-annotation-id="pla-message-page">
      <header className="pla-message-header">
        <button className="pla-message-nav-btn" aria-label="返回">
          <ChevronLeft size={22} />
        </button>
        <div className="pla-message-title-wrap">
          <div className="pla-message-title-row">
            <h1>盈丰平台消息提醒</h1>
            <span className="pla-message-robot">机器人</span>
            <ChevronDown size={13} />
          </div>
          <p>盈丰平台消息提醒</p>
        </div>
        <button className="pla-message-nav-btn" aria-label="更多">
          <span className="pla-message-more-dot" />
          <span className="pla-message-more-dot" />
          <span className="pla-message-more-dot" />
        </button>
      </header>

      <div className="pla-message-body">
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <div className="pla-message-divider"><span>{message.time.split(' ')[0]}</span></div>
            <div className="pla-message-time">{message.time}</div>
            <div className="pla-message-thread">
              <div className="pla-message-avatar"><Bell size={18} /></div>
              <article className="pla-message-card">
                <div>
                  <span className="pla-message-field">流程标题：</span>
                  {index === 0 ? (
                    <button className="pla-message-link" onClick={onOpenReview}>{message.idLabel}</button>
                  ) : (
                    <span>{message.idLabel}</span>
                  )}
                </div>
                <div><span className="pla-message-field">流程模块：</span><span>{message.module}</span></div>
                <div><span className="pla-message-field">当前审批人：</span><span>{message.approvers}</span></div>
                <div><span className="pla-message-field">{message.submittedLabel}：</span><span>{message.submittedAt}</span></div>
              </article>
            </div>
          </React.Fragment>
        ))}
      </div>

      <footer className="pla-message-inputbar">
        <div className="pla-message-input">暂时无法给该机器人发消息 <span>如何配置?</span></div>
        <div className="pla-message-toolbar">
          {['😊', '@', '🎙', '🖼', 'Aa', '＋'].map(item => <span key={item}>{item}</span>)}
        </div>
      </footer>
    </div>
  )
}

// ─── 申请单审核页 ────────────────────────────────────────────────────────────

interface ReviewPageProps {
  application: PriceLimitApplication
  reviewComment: string
  showCommentError: boolean
  onCommentChange: (value: string) => void
  onBack: () => void
  onApprove: () => void
  onReject: () => void
}

function ReviewPage(props: ReviewPageProps) {
  const { application: app, reviewComment, showCommentError, onCommentChange, onBack, onApprove, onReject } = props
  const approval = computeMarginApproval(app.marginLimit, app.estimatedMargin)
  const level = approval.level
  const drop = approval.drop

  return (
    <div className="pla-mobile-review">
      <header className="pla-mobile-review-header">
        <button className="pla-mobile-back" onClick={onBack} aria-label="返回列表">
          <ArrowLeft size={18} />
        </button>
        <div className="pla-mobile-review-heading">
          <h1>审核</h1>
          <span>{level ? `${level}审核` : '无需审批'}</span>
        </div>
      </header>

      {/* 申请单信息 */}
      <div className="pla-card" data-annotation-id="pla-review-app-info">
        <div className="pla-section-title">
          <Info size={14} />
          <span>申请单信息</span>
        </div>
        <div className="pla-form-grid">
          <div className="pla-form-item">
            <label className="pla-form-label">申请单号</label>
            <div className="pla-input-wrap">
              <input type="text" value={app.id} readOnly disabled className="pla-form-input pla-form-input-disabled" />
              <Lock size={14} className="pla-input-suffix" />
            </div>
            <p className="pla-form-hint">
              不可编辑
            </p>
          </div>
          <div className="pla-form-item">
            <label className="pla-form-label">门店销售ERP号</label>
            <div className="pla-input-wrap">
              <input type="text" value={app.storeErpNo} readOnly disabled className="pla-form-input pla-form-input-disabled" />
            </div>
          </div>
          <div className="pla-form-item pla-form-item-full">
            <label className="pla-form-label">门店名称</label>
            <div className="pla-input-wrap">
              <input type="text" value={app.storeName} readOnly disabled className="pla-form-input pla-form-input-disabled" />
            </div>
          </div>
        </div>
      </div>

      {/* 车辆信息 */}
      <VehicleInfoCard vehicle={app.vehicle} isReview />

      {/* 限价信息 */}
      <div className="pla-card" data-annotation-id="pla-review-margin">
        <div className="pla-section-title">
          <Info size={14} />
          <span>限价信息</span>
        </div>
        <div className="pla-margin-row">
          <div className="pla-margin-box pla-margin-box-limit">
            <span className="pla-margin-label">综合毛利限价</span>
            <span className="pla-margin-number">{app.marginLimit.toLocaleString()} <em>元</em></span>
          </div>
          <span className="pla-margin-arrow">→</span>
          <div className="pla-margin-box pla-margin-box-estimate">
            <span className="pla-margin-label">预估综合毛利</span>
            <span className="pla-margin-number">{app.estimatedMargin.toLocaleString()} <em>元</em></span>
            {approval.status === 'ok' ? null : (
              <span className="pla-margin-warning">
                <AlertTriangle size={12} />
                {approval.status === 'negative' ? '预估毛利为负值，需集团审核' : `低于限价 ${approval.drop.toLocaleString()} 元，需审核确认`}
              </span>
            )}
          </div>
          <div className="pla-margin-box pla-margin-box-level">
            <span className="pla-margin-label">需审核级别</span>
            {level ? (
              <span className={LEVEL_TAG_CLASS[level]} style={{ fontSize: 16, padding: '4px 14px' }}>
                {level}审核
              </span>
            ) : (
              <span className="pla-level-none" style={{ fontSize: 16, padding: '4px 14px' }}>无需审批</span>
            )}
            {level && approval.status !== 'ok' && (
              <span className="pla-form-hint">
                降幅 {approval.drop.toLocaleString()} 元，未超过{level === '大区' ? '大区' : level === '条线' ? '条线' : level === '门店' ? '门店' : ''}权限额度{level === '集团' ? '，需集团审核' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 审核信息 */}
      <div className="pla-card" data-annotation-id="pla-review-approval">
        <div className="pla-section-title">
          <Info size={14} />
          <span>审核信息</span>
        </div>
        <div className="pla-review-row">
          <span className="pla-form-label pla-review-label">审核状态</span>
          <span className="pla-status-badge pla-status-pending">待审核</span>
          <span className="pla-form-label pla-review-label">创建时间</span>
          <span className="pla-review-text">{app.createdAt}</span>
        </div>
        <div className="pla-form-item pla-form-item-full pla-review-comment">
          <label className="pla-form-label">审核意见</label>
          <textarea
            className={`pla-textarea ${showCommentError ? 'pla-textarea-error' : ''}`}
            placeholder="请输入审核意见..."
            value={reviewComment}
            onChange={e => onCommentChange(e.target.value)}
            rows={4}
          />
          {showCommentError && (
            <p className="pla-form-error">驳回时请填写审核意见</p>
          )}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="pla-footer-actions pla-mobile-footer">
        <button className="pla-footer-btn pla-footer-btn-cancel pla-desktop-back" onClick={onBack}>返回</button>
        <button className="pla-footer-btn pla-footer-btn-reject" onClick={onReject}>
          <X size={14} />
          驳回
        </button>
        <button className="pla-footer-btn pla-footer-btn-approve" onClick={onApprove}>
          <Check size={14} />
          通过
        </button>
      </div>
    </div>
  )
}

// ─── 申请单详情页（只读） ─────────────────────────────────────────────────────

interface DetailPageProps {
  application: PriceLimitApplication
  onBack: () => void
}

function DetailPage(props: DetailPageProps) {
  const { application: app, onBack } = props
  const approval = computeMarginApproval(app.marginLimit, app.estimatedMargin)
  const level = approval.level
  const isApproved = app.status === '已通过'

  return (
    <>
      {/* 申请单信息 */}
      <div className="pla-card">
        <div className="pla-section-title">
          <Info size={14} />
          <span>申请单信息</span>
        </div>
        <div className="pla-detail-grid">
          <div className="pla-detail-item">
            <span className="pla-v-label">申请单号</span>
            <span className="pla-detail-value pla-cell-mono">{app.id}</span>
          </div>
          <div className="pla-detail-item">
            <span className="pla-v-label">门店销售ERP号</span>
            <span className="pla-detail-value">{app.storeErpNo}</span>
          </div>
          <div className="pla-detail-item">
            <span className="pla-v-label">门店名称</span>
            <span className="pla-detail-value">{app.storeName}</span>
          </div>
        </div>
      </div>

      {/* 车辆信息 */}
      <VehicleInfoCard vehicle={app.vehicle} />

      {/* 限价信息 */}
      <div className="pla-card" data-annotation-id="pla-review-margin">
        <div className="pla-section-title">
          <Info size={14} />
          <span>限价信息</span>
        </div>
        <div className="pla-margin-row">
          <div className="pla-margin-box pla-margin-box-limit">
            <span className="pla-margin-label">综合毛利限价</span>
            <span className="pla-margin-number">{app.marginLimit.toLocaleString()} <em>元</em></span>
          </div>
          <span className="pla-margin-arrow">→</span>
          <div className="pla-margin-box pla-margin-box-estimate">
            <span className="pla-margin-label">预估综合毛利</span>
            <span className="pla-margin-number">{app.estimatedMargin.toLocaleString()} <em>元</em></span>
            {approval.status !== 'ok' && (
              <span className="pla-margin-warning">
                <AlertTriangle size={12} />
                {approval.status === 'negative' ? '预估毛利为负值，需集团审核' : `低于限价 ${approval.drop.toLocaleString()} 元`}
              </span>
            )}
          </div>
          <div className="pla-margin-box pla-margin-box-level">
            <span className="pla-margin-label">需审核级别</span>
            {level ? (
              <span className={LEVEL_TAG_CLASS[level]} style={{ fontSize: 16, padding: '4px 14px' }}>
                {level}审核
              </span>
            ) : (
              <span className="pla-level-none" style={{ fontSize: 16, padding: '4px 14px' }}>无需审批</span>
            )}
          </div>
        </div>
      </div>

      {/* 审核信息（只读） */}
      <div className="pla-card" data-annotation-id="pla-detail-approval">
        <div className="pla-section-title">
          <Info size={14} />
          <span>审核信息</span>
        </div>
        <div className="pla-detail-grid">
          <div className="pla-detail-item">
            <span className="pla-v-label">审核状态</span>
            <span className={STATUS_BADGE_CLASS[app.status]}>{app.status}</span>
          </div>
          <div className="pla-detail-item">
            <span className="pla-v-label">审核人</span>
            <span className="pla-detail-value">{app.approver || '-'}</span>
          </div>
          <div className="pla-detail-item">
            <span className="pla-v-label">审核时间</span>
            <span className="pla-detail-value">{app.approvedAt || '-'}</span>
          </div>
          <div className="pla-detail-item pla-detail-item-full">
            <span className="pla-v-label">审核意见</span>
            <span className={`pla-detail-value pla-detail-comment ${isApproved ? 'pla-detail-comment-approve' : ''}`}>
              {app.reviewComment || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="pla-footer-actions">
        <button className="pla-footer-btn pla-footer-btn-cancel" onClick={onBack}>返回列表</button>
      </div>
    </>
  )
}

// ─── 车辆信息卡片（共用） ─────────────────────────────────────────────────────

function VehicleInfoCard({ vehicle, isReview }: { vehicle: VehicleInfo; isReview?: boolean }) {
  const rows: Array<[string, string]> = [
    ['VIN码', vehicle.vin],
    ['SAP物料编号', vehicle.sapMaterialCode],
    ['物料编号', vehicle.materialCode],
    ['品牌', vehicle.brand],
    ['产品系列', vehicle.productSeries],
    ['车系', vehicle.carSeries],
    ['车型', vehicle.modelName],
    ['年款', vehicle.yearModel],
    ['动力', vehicle.powertrain],
    ['版型', vehicle.trim],
    ['内饰颜色', vehicle.interiorColor],
    ['外观颜色', vehicle.exteriorColor],
    ['采购订单类型', vehicle.purchaseOrderType],
    ['采购类型', vehicle.purchaseType],
    ['生产日期', vehicle.productionDate],
    ['入库时间', vehicle.inboundTime],
    ['采购价格（含税）', `${vehicle.purchasePrice.toLocaleString()} 元`],
  ]

  return (
    <div className="pla-card" data-annotation-id="pla-review-vehicle">
      <div className="pla-section-title">
        <Info size={14} />
        <span>车辆信息</span>
      </div>
      <div className="pla-vehicle-grid">
        {rows.map(([label, value]) => (
          <div key={label} className="pla-vehicle-item">
            <span className="pla-v-label">{label}</span>
            <span
              className={[
                'pla-v-value',
                label === 'VIN码' ? 'pla-v-value-highlight' : '',
                label === '采购价格（含税）' ? 'pla-v-value-price' : '',
              ].join(' ')}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Component
