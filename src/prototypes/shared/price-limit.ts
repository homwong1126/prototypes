/**
 * 限价申请 - 共享数据与审核层级判定
 *
 * 审核层级判定规则（结合限价规则表各权限字段）：
 *   突破金额 = 综合毛利限价 − 预估综合毛利
 *   逐级判断 突破金额 ≤ 各级权限，取首个满足的层级为所需最高审核层级：
 *     1. 大区审核   （突破金额 ≤ 大区总权限）
 *     2. 条线审核   （… ≤ 条线权限，需 大区+条线）
 *     3. 门店审核   （… ≤ 门店运营权限，需 大区+条线+门店）
 *     4. 集团审核   （… ≤ 集团权限，需 大区+条线+门店+集团）
 *   若超出集团权限则无法通过（需人工审批 / 驳回）
 */

export type ApprovalLevel = 'daqu' | 'tiaoxian' | 'mendian' | 'jituan'
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface LimitRulePermissions {
  /** 综合毛利限价 */
  grossProfitLimit: number
  /** 大区总权限 */
  regionalTotalPermission: number
  /** 条线权限 */
  linePermission: number
  /** 门店运营权限 */
  storeOperationPermission: number
  /** 集团权限 */
  groupPermission: number
}

export interface PriceLimitOrder {
  applicationNo: string
  storeErpNo: string
  storeName: string
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
  /** 预估综合毛利 */
  estimatedMargin: number
  marginLimit: number
  reviewStatus: ReviewStatus
  createdAt: string
  reviewer: string
  reviewedAt?: string
}

export const APPROVAL_LEVEL_META: Record<ApprovalLevel, { label: string; key: string }> = {
  daqu: { label: '大区审核', key: 'daqu' },
  tiaoxian: { label: '条线审核', key: 'tiaoxian' },
  mendian: { label: '门店审核', key: 'mendian' },
  jituan: { label: '集团审核', key: 'jituan' },
}

export const APPROVAL_LEVEL_ORDER: ApprovalLevel[] = ['daqu', 'tiaoxian', 'mendian', 'jituan']

/**
 * 根据规则表权限判定所需最高审核层级
 * @returns 需要走到的最高审核层级；超出集团权限表示必驳回返回 null
 */
export function resolveApprovalLevel(order: Pick<PriceLimitOrder, 'marginLimit' | 'estimatedMargin'>, perms: LimitRulePermissions): ApprovalLevel | null {
  const exceed = order.marginLimit - order.estimatedMargin
  if (exceed <= 0) return null
  for (const level of APPROVAL_LEVEL_ORDER) {
    const limit = perms[levelToPermKey(level)]
    if (exceed <= limit) return level
  }
  return null
}

function levelToPermKey(level: ApprovalLevel): keyof LimitRulePermissions {
  switch (level) {
    case 'daqu': return 'regionalTotalPermission'
    case 'tiaoxian': return 'linePermission'
    case 'mendian': return 'storeOperationPermission'
    case 'jituan': return 'groupPermission'
  }
}

/** 由最深层级生成需要依次完成的审核链条（从大区到最深） */
export function buildApprovalChain(level: ApprovalLevel | null): ApprovalLevel[] {
  if (!level) return []
  const idx = APPROVAL_LEVEL_ORDER.indexOf(level)
  return APPROVAL_LEVEL_ORDER.slice(0, idx + 1)
}

/** 规则表权限（示例：瑞虎8 尊贵型） */
export const CURRENT_RULE_PERMISSIONS: LimitRulePermissions = {
  grossProfitLimit: 3000,
  regionalTotalPermission: 1000,
  linePermission: 2000,
  storeOperationPermission: 3000,
  groupPermission: 5000,
}

/** 申请单示例数据 */
export const PRICE_LIMIT_ORDERS: PriceLimitOrder[] = [
  {
    applicationNo: 'XJ3463-1202608260001',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
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
    estimatedMargin: 2500,
    marginLimit: 3000,
    reviewStatus: 'pending',
    createdAt: '2026-08-26 10:24:32',
    reviewer: '—',
  },
  {
    applicationNo: 'XJ3463-1202608260002',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vin: 'LVTDB21B6TDP02456',
    sapMaterialCode: 'T64706TCWJW0015',
    materialCode: 'T64706TCWJW0015',
    brand: '奇瑞',
    productSeries: '瑞虎系列',
    carSeries: '瑞虎8',
    modelName: '第五代瑞虎8-豹款',
    yearModel: '2026款',
    powertrain: '1.6T-7DCT',
    trim: '尊贵型',
    interiorColor: '瀚海蓝',
    exteriorColor: '深海蓝',
    purchaseOrderType: '周订单',
    productionDate: '2026-07-22',
    inboundTime: '2026-08-12 09:15:12',
    purchaseType: '厂家',
    purchasePrice: 74800,
    estimatedMargin: 1500,
    marginLimit: 3000,
    reviewStatus: 'pending',
    createdAt: '2026-08-26 11:02:44',
    reviewer: '—',
  },
  {
    applicationNo: 'XJ3463-1202608260003',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vin: 'LVTDB21B6TDN03247',
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
    exteriorColor: '珍珠白',
    purchaseOrderType: '周订单',
    productionDate: '2026-07-28',
    inboundTime: '2026-08-15 14:36:20',
    purchaseType: '厂家',
    purchasePrice: 75090,
    estimatedMargin: 800,
    marginLimit: 3000,
    reviewStatus: 'approved',
    createdAt: '2026-08-25 16:48:05',
    reviewer: '王经理',
    reviewedAt: '2026-08-26 09:20:11',
  },
  {
    applicationNo: 'XJ3463-1202608250004',
    storeErpNo: '3463-1',
    storeName: '上海QQ',
    vin: 'LVTDB21B6TDN14860',
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
    productionDate: '2026-07-18',
    inboundTime: '2026-08-08 11:11:45',
    purchaseType: '厂家',
    purchasePrice: 74960,
    estimatedMargin: 1200,
    marginLimit: 3000,
    reviewStatus: 'rejected',
    createdAt: '2026-08-25 09:33:27',
    reviewer: '李总监',
    reviewedAt: '2026-08-25 14:52:03',
  },
]

export function getOrderByNo(no: string): PriceLimitOrder | undefined {
  return PRICE_LIMIT_ORDERS.find(o => o.applicationNo === no)
}