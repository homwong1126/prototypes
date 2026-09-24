/**
 * @name 维修工单管理
 * @mode axure
 *
 * 参考：PRD-M02-维修工单管理.md
 * 主题：Fuse Design Pc
 * - /skills/axure-export-workflow/SKILL.md
 */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  AlertTriangle,
  ArrowUpDown,
  Banknote,
  Battery,
  Bell,
  BusFront,
  CalendarDays,
  Camera,
  CarFront,
  ChartColumn,
  Check,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  Clock3,
  Copy,
  FilePlus2,
  FileSpreadsheet,
  Filter,
  FolderUp,
  GripVertical,
  Info,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Plus,
  Printer,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Search,
  Square,
  SquareCheckBig,
  UserRound,
  Upload,
  Wrench,
  X,
  Image,
} from 'lucide-react'
// chery-logo.png was missing; replaced with inline SVG
const cheryLogo = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 28"><text x="4" y="20" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1a73e8">CHERY</text></svg>')
import './style.css'

// ─── 类型 ────────────────────────────────────────────────────────────────────

type WorkOrderStatus = 'draft' | 'inspecting' | 'diagnosing' | 'pending' | 'working' | 'self_check' | 'qc_wait' | 'qc_pass' | 'qc_fail' | 'rework' | 'delivery' | 'settlement' | 'done' | 'cancel'
type WarrantyAlertLevel = 1 | 2 | 3 | 4 | 5
type WorkOrderActionType = 'view' | 'dispatch' | 'construction' | 'edit' | 'delivery' | 'rework'
type ServiceTypeValue = 'self_drive' | 'onsite' | 'rescue' | 'pickup_store' | 'roadshow'
type WorkOrderListScope = 'repair' | 'onsite'
type OnsiteServiceStatus = 'to_submit' | 'dispatch' | 'pick' | 'depart' | 'arrive' | 'inspect' | 'start' | 'finish' | 'qc' | 'settlement' | 'return' | 'return-stock' | 'done'

interface WorkOrderWarrantyAlert {
  level: WarrantyAlertLevel
  code: string
  title: string
  reason: string
  guidance: string
}

interface QcRejectItem {
  itemId: number
  itemCode: string
  itemName: string
  reason: string
  reworked?: boolean
  reworkedAt?: string
}

interface WorkOrder {
  id: string; repairType: string; vin: string; plate: string
  owner: string; advisor: string; dealerErpCode: string; dealerShortName: string; series: string; status: WorkOrderStatus
  materialStatus: 'pending' | 'partial' | 'picked' | 'none'
  estimatedDeliveryAt: string; sender: string; senderPhone: string
  customerType: string; mileage: number; confirmedStartAt: string
  completedAt?: string
  completedReviewAt: string; deliveryAt: string; settlementAt: string
  engineNo: string; gearboxNo: string; saleDate: string; color: string
  invoiceDate: string; productionDate: string; insuranceCompany: string
  completedReviewer: string; standardLaborFee: number; standardMaterialFee: number
  standardTotalFee: number; actualLaborFee: number; actualMaterialFee: number
  otherFee: number; createdAt: string; actualTotalFee: number; updatedAt: string
  repairCategory: string; technician: string; chargeType: string; isEV: boolean
  model: string; faultDesc: string; phone: string
  appointmentNo?: string
  serviceType?: ServiceTypeValue
  onsiteAddress?: string
  serviceVehicleId?: string
  serviceVehicleCode?: string
  serviceVehiclePlate?: string
  serviceVehicleName?: string
  onsiteStatus?: OnsiteServiceStatus
  onsitePickedAt?: string
  onsiteDepartedAt?: string
  onsiteArrivedAt?: string
  onsiteInspectedAt?: string
  partItems?: PartItem[]
  repairItems?: RepairItem[]
  additionalFeeItems?: AdditionalFeeItem[]
  warrantyAlert?: WorkOrderWarrantyAlert
  warrantyLocked?: boolean
  warrantyLockedAt?: string
  warrantyLockAction?: WorkOrderActionType
  dispatchedAt?: string
  dispatchInfo?: WorkOrderDispatchInfo
  signedDocAt?: string
  signedDocFileName?: string
  qcRejectedItems?: QcRejectItem[]
  qcRejectedAt?: string
  qcRejectReason?: string

  // 车主信息扩展
  ownerType?: '个人' | '企业' | '事业' // 车主类别
  contactPerson?: string // 联系人
  contactPhone?: string // 联系人电话
  contactEmail?: string // 联系人邮箱
  ownerEmail?: string // 车主邮箱
  senderEmail?: string // 送修人邮箱

  // 车辆信息扩展
  brand?: string // 品牌
  configuration?: string // 配置
  interiorColor?: string // 内饰
  totalMileage?: number // 累计里程
  replacedMileage?: number // 换表里程
  nextMaintenanceDate?: string // 下次保养日期
  warrantyExpireDate?: string // 保修到期日期
  insuranceExpireDate?: string // 保险到期日期
  isThreePack?: boolean // 是否三包
  hevMileage?: number // HEV里程/燃油里程
  fuelLevel?: number // 燃油量（%）
  batteryLevel?: number // 剩余电量（%）
  isMeterReplaced?: boolean // 是否换表

  // 车主标签
  ownerTags?: string[] // 车主标签（健身达人、敏感客户、高价值客户、投诉敏感、价格敏感等）
  vehicleTags?: string[] // 车辆标签（按时保养、降级车等）

  // 工单信息扩展
  isPickupDelivery?: boolean // 是否送修
  principalTechnician?: string // 责任技师（派工时的主技师）
}

interface WorkOrderDispatchAssignmentDetail {
  technicianId: string
  technicianName: string
  startMinutes: number
  endMinutes: number
  projects: string[]
}

interface WorkOrderDispatchInfo {
  date: string
  startMinutes: number
  endMinutes: number
  estimatedCompletionAt: string
  technicianNames: string[]
  serviceVehicleId?: string
  serviceVehicleCode?: string
  serviceVehiclePlate?: string
  serviceVehicleName?: string
  assignments: WorkOrderDispatchAssignmentDetail[]
}

type WorkOrderColumnKey =
  | 'id'
  | 'repairType'
  | 'vin'
  | 'plate'
  | 'owner'
  | 'advisor'
  | 'dealerErpCode'
  | 'dealerShortName'
  | 'series'
  | 'energyType'
  | 'serviceType'
  | 'status'
  | 'materialStatus'
  | 'onsiteAddress'
  | 'serviceVehicleCode'
  | 'estimatedDeliveryAt'
  | 'sender'
  | 'senderPhone'
  | 'customerType'
  | 'mileage'
  | 'confirmedStartAt'
  | 'completedReviewAt'
  | 'deliveryAt'
  | 'settlementAt'
  | 'engineNo'
  | 'gearboxNo'
  | 'saleDate'
  | 'color'
  | 'invoiceDate'
  | 'productionDate'
  | 'insuranceCompany'
  | 'completedReviewer'
  | 'standardLaborFee'
  | 'standardMaterialFee'
  | 'standardTotalFee'
  | 'actualLaborFee'
  | 'actualMaterialFee'
  | 'otherFee'
  | 'createdAt'
  | 'actualTotalFee'
  | 'updatedAt'
  | 'repairCategory'
  | 'technician'

type ColumnSortDirection = 'asc' | 'desc'

interface WorkOrderColumnSort {
  key: WorkOrderColumnKey
  direction: ColumnSortDirection
}

interface WorkOrderColumnFilterDraft {
  keyword: string
  selectedValues: string[]
}

interface WorkOrderColumn {
  key: WorkOrderColumnKey
  label: string
  width: number
  defaultVisible: boolean
  render: (order: WorkOrder) => React.ReactNode
}

interface VehicleLookupRecord {
  id: string
  vin: string
  vehicleUsage: string
  vehicleStatus: string
  series: string
  mileage: string
  plate: string
  engineNo: string
  motorNo: string
  batteryPackNo: string
  customerName: string
  phone: string
  model: string
  warrantyDate: string
  lastVisit: string
  ownerTags?: string[]
  vehicleTags?: string[]
  isThreePack?: boolean
}

interface AppointmentRecord {
  id: string
  appointmentNo: string // 预约单号
  source: string // 预约来源
  plate: string // 车牌号
  vin: string // VIN
  ownerName: string // 车主姓名
  phone: string // 车主手机号
  model: string // 车型名称
  reserveAt: string // 预约到店时间
  status: string // 预约状态
  appointmentType: AppointmentTypeValue // 预约类型
  // 新增字段
  contactPerson?: string // 联系人
  contactPhone?: string // 联系人手机号
  serviceAdvisor?: string // 服务顾问
  serviceStore?: string // 服务门店
  brand?: string // 品牌
  seriesCode?: string // 车系代码
  seriesName?: string // 车系名称
  modelCode?: string // 车型代码
  totalMileage?: number // 总里程
  hevMileage?: number // HEV里程/燃油里程
  color?: string // 颜色
  engineModel?: string // 发动机型号
  isPickupDelivery?: boolean // 是否取送车
  isKanbanService?: boolean // 是否看板服务
  technician?: string // 维修技师
  settlementMethod?: string // 结算方式
  customerAddress?: string // 客户地址
  problemDescription?: string // 问题描述
  pickupContact?: string // 取送车联系人
  pickupContactPhone?: string // 取送车联系人电话
  pickupAddress?: string // 取车地址
  deliveryAddress?: string // 送车地址
  scheduledPickupTime?: string // 预约取车时间
  scheduledDeliveryTime?: string // 预约送车时间
  pickupDeliveryNote?: string // 取送车备注
  createdBy?: string // 创建人
  createdAt?: string // 创建时间
  updatedBy?: string // 修改人
  updatedAt?: string // 修改时间
}

interface RepairProjectOption {
  id: number
  code: string
  name: string
  laborType: string
  custom: '是' | '否'
  hours: number
  note: string
  unitPrice: number
  type: string
  chargeType: string
}

interface DispatchAssignment {
  projectName: string
  team: string
  technician: string
}

interface RepairItem {
  id: number
  name: string
  code: string
  laborType: string
  unitPrice: number
  hours: number
  discountRate?: number
  fee: number
  type: string
  chargeType: string
  customHours?: boolean
  isUpsell?: boolean
  isDispatched?: boolean // 是否已派工
  splitMode?: 'ratio' | 'amount'
  splitValues?: Record<string, number>

  // 新增字段
  packageName?: string // 套餐/活动名称
  faultLocation?: string // 故障部位
  assignedTechnician?: string // 指派技师（派工后回写）
  workstation?: string // 工位（派工后回写）
}

interface PartItem {
  id: number
  name: string
  code: string
  unitPrice: number
  stock?: number
  qty: number
  discountRate?: number
  fee: number
  type: string
  chargeType: string
  splitMode?: 'ratio' | 'amount'
  splitValues?: Record<string, number>
  isUpsell?: boolean
  isPicked?: boolean // 是否已领料
  shortageSynced?: boolean

  // 新增字段
  packageName?: string // 套餐/活动
  issuer?: string // 发料人（领料后回写）
  receiver?: string // 领料人（领料后回写）
  issuedAt?: string // 发料时间
  isSupplierDirect?: boolean // 是否供应商直供
}

interface AdditionalFeeItem {
  id: number
  name: string
  fee: number
  chargeType: string
  splitMode?: 'ratio' | 'amount'
  splitValues?: Record<string, number>
  note?: string

  // 新增字段
  relatedDocNo?: string // 关联单据号（取送车、道路救援）
  relatedDocType?: '取送车' | '道路救援' | '其他' // 关联单据类型
}

interface PartPickerOption {
  id: number
  tab: 'part' | 'kit'
  code: string
  name: string
  alias: string
  vehicleModel: string
  unitPrice: number
  retailPrice: number
  stock: number
  qty: number
  type: string
}

interface InspectTemplateCategory {
  id: number
  category: string
  brand?: string // 品牌：奇瑞、星途、捷途、icar、FR
  items: string[]
  required: boolean
  enabled: boolean
}

interface LaborStandardRecord {
  id: number
  model: string
  type: string
  hours: number
  price: number
}

const REPAIR_TYPE_OPTIONS = ['维修', '保养', '首保', '品质改善', '服务活动', '事故', '精品加装(装潢)', 'GoodWill'] as const
const PACKAGE_TEMPLATE_TYPE_OPTIONS = ['维修', '保养'] as const

type RepairPackageTemplateProject = {
  name: string
  code: string
  laborType: string
  unitPrice: number
  hours: number
}

type RepairPackageTemplatePart = {
  name: string
  code: string
  unitPrice: number
  qty: number
}

interface RepairPackageTemplate {
  id: string
  code: string
  name: string
  type: (typeof PACKAGE_TEMPLATE_TYPE_OPTIONS)[number]
  applicableType: string
  isCustom: string
  note: string
  projects: RepairPackageTemplateProject[]
  parts: RepairPackageTemplatePart[]
}

const REPAIR_PACKAGE_TEMPLATES: RepairPackageTemplate[] = [
  {
    id: 'RT157702025092400001',
    code: 'RT157702025092400001',
    name: 'test0924',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换机油', code: 'RP-001', laborType: '保养', unitPrice: 80, hours: 0.5 },
      { name: '更换机油滤清器', code: 'RP-002', laborType: '保养', unitPrice: 50, hours: 0.3 },
    ],
    parts: [
      { name: '机油 5W-30', code: 'PT-001', unitPrice: 120, qty: 1 },
      { name: '机油滤清器', code: 'PT-002', unitPrice: 35, qty: 1 },
    ],
  },
  {
    id: 'RT157702025081400001',
    code: 'RT157702025081400001',
    name: '维修',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换空调滤芯', code: 'RP-003', laborType: '保养', unitPrice: 60, hours: 0.3 },
    ],
    parts: [
      { name: '空调滤芯', code: 'PT-003', unitPrice: 80, qty: 1 },
    ],
  },
  {
    id: 'RT157702025050700001',
    code: 'RT157702025050700001',
    name: '春季保养套餐',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换机油', code: 'RP-001', laborType: '保养', unitPrice: 80, hours: 0.5 },
      { name: '更换机油滤清器', code: 'RP-002', laborType: '保养', unitPrice: 50, hours: 0.3 },
    ],
    parts: [
      { name: '机油 5W-30', code: 'PT-001', unitPrice: 120, qty: 1 },
      { name: '机油滤清器', code: 'PT-002', unitPrice: 35, qty: 1 },
    ],
  },
  {
    id: 'RT157702025010300001',
    code: 'RT157702025010300001',
    name: 'z9999',
    type: '维修',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换雨刮电动分泵', code: 'RP-004', laborType: '机电', unitPrice: 100, hours: 1.0 },
      { name: '更换雨刮只后制动分泵', code: 'RP-005', laborType: '机电', unitPrice: 120, hours: 1.5 },
    ],
    parts: [
      { name: '制动片片套装', code: 'PT-004', unitPrice: 150, qty: 1 },
    ],
  },
  {
    id: 'RT157702024122100001',
    code: 'RT157702024122100001',
    name: 'test1',
    type: '维修',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '发动机故障诊断', code: 'RP-201', laborType: '机电', unitPrice: 120, hours: 1.0 },
    ],
    parts: [],
  },
  {
    id: 'RT157702024122000001',
    code: 'RT157702024122000001',
    name: '用友uat概览页面',
    type: '维修',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '全车检查', code: 'RP-202', laborType: '机电', unitPrice: 60, hours: 0.5 },
    ],
    parts: [],
  },
  {
    id: 'RT157702024112200001',
    code: 'RT157702024112200001',
    name: '1023',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换机油', code: 'RP-001', laborType: '保养', unitPrice: 80, hours: 0.5 },
    ],
    parts: [
      { name: '机油 5W-30', code: 'PT-001', unitPrice: 120, qty: 1 },
    ],
  },
  {
    id: 'RT157702024111800001',
    code: 'RT157702024111800001',
    name: '测试模板T18',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '测试241118',
    projects: [
      { name: '更换空调滤芯', code: 'RP-003', laborType: '保养', unitPrice: 60, hours: 0.3 },
    ],
    parts: [
      { name: '空调滤芯', code: 'PT-003', unitPrice: 80, qty: 1 },
    ],
  },
  {
    id: 'RT157702024101100001',
    code: 'RT157702024101100001',
    name: '测试test',
    type: '维修',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '制动系统检查', code: 'RP-301', laborType: '机电', unitPrice: 90, hours: 0.8 },
    ],
    parts: [
      { name: '制动液', code: 'PT-301', unitPrice: 45, qty: 1 },
    ],
  },
  {
    id: 'RT157702024091200001',
    code: 'RT157702024091200001',
    name: '1',
    type: '保养',
    applicableType: '通用',
    isCustom: '是',
    note: '—',
    projects: [
      { name: '更换机油滤清器', code: 'RP-002', laborType: '保养', unitPrice: 50, hours: 0.3 },
    ],
    parts: [
      { name: '机油滤清器', code: 'PT-002', unitPrice: 35, qty: 1 },
    ],
  },
]
const LABOR_PRICE_ADD_REPAIR_TYPE_OPTIONS = REPAIR_TYPE_OPTIONS.filter(
  option => !['品质改善', '服务活动', '事故', 'GoodWill'].includes(option),
)
const CHARGE_TYPE_OPTIONS = ['客户自费', '索赔', '保险', '内结'] as const
const MAINTENANCE_REPAIR_TYPES = new Set<string>(['保养'])
const WARRANTY_REPAIR_TYPES = new Set<string>(['GoodWill'])
const SERVICE_TYPE_OPTIONS = [
  { value: 'self_drive', label: '救援到店' },
  { value: 'onsite', label: '上门服务' },
  { value: 'rescue', label: '救援' },
  { value: 'pickup_store', label: '取车到店' },
  { value: 'roadshow', label: '技术万里行' },
] as const
const getServiceTypeLabel = (value?: ServiceTypeValue) => SERVICE_TYPE_OPTIONS.find(option => option.value === value)?.label ?? '救援到店'

// 预约类型枚举
const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'repair', label: '维修' },
  { value: 'maintenance', label: '保养' },
  { value: 'accessories', label: '精品加装' },
  { value: 'onsite', label: '上门服务' },
] as const
type AppointmentTypeValue = typeof APPOINTMENT_TYPE_OPTIONS[number]['value']
const getAppointmentTypeLabel = (value?: AppointmentTypeValue) => APPOINTMENT_TYPE_OPTIONS.find(option => option.value === value)?.label ?? '维修'

const LABOR_TYPE_OPTIONS_BY_REPAIR_TYPE: Record<string, string[]> = {
  保养: ['保养', '养护'],
  首保: ['保养', '养护'],
  维修: ['机电', '喷漆', '钣金', '软件升级', '检查'],
  品质改善: ['机电', '软件升级'],
  服务活动: ['机电', '喷漆', '钣金', '软件升级', '检查'],
  事故: ['机电', '喷漆', '钣金'],
  '精品加装(装潢)': ['装潢'],
  GoodWill: ['机电', '喷漆', '钣金', '软件升级', '检查'],
}

type ChargeTypeOption = (typeof CHARGE_TYPE_OPTIONS)[number]
type ChargeAllocatableItem = Pick<RepairItem | PartItem | AdditionalFeeItem, 'chargeType' | 'splitMode' | 'splitValues' | 'fee'>

function parseChargeTypeParts(chargeType: string) {
  return chargeType.split('+').map(part => part.trim()).filter(Boolean)
}

function serializeChargeTypeParts(parts: string[]) {
  const uniqueParts = Array.from(new Set(parts))
  return CHARGE_TYPE_OPTIONS
    .filter(option => uniqueParts.includes(option))
    .join('+')
}

function normalizeChargeTypeSelection(parts: string[], fallback: string) {
  const serialized = serializeChargeTypeParts(parts)
  return serialized || fallback || CHARGE_TYPE_OPTIONS[0]
}

function toggleChargeTypePart(chargeType: string, option: ChargeTypeOption) {
  const currentParts = parseChargeTypeParts(chargeType)
  const nextParts = currentParts.includes(option)
    ? currentParts.filter(part => part !== option)
    : [...currentParts, option]
  return normalizeChargeTypeSelection(nextParts, chargeType)
}

function isMixedChargeType(chargeType: string) {
  return parseChargeTypeParts(chargeType).length > 1
}

function defaultSplitConfig(chargeType: string) {
  const parts = parseChargeTypeParts(chargeType)
  if (parts.length <= 1) {
    return {
      splitMode: undefined,
      splitValues: undefined,
    }
  }
  const evenShare = Math.floor(100 / parts.length)
  const remainder = 100 - evenShare * parts.length
  return {
    splitMode: 'ratio' as const,
    splitValues: parts.reduce<Record<string, number>>((acc, part, index) => {
      acc[part] = evenShare + (index === parts.length - 1 ? remainder : 0)
      return acc
    }, {}),
  }
}

function buildChargeTypePatch(
  chargeType: string,
  overrides?: Partial<Pick<ChargeAllocatableItem, 'splitMode' | 'splitValues'>>,
) {
  if (!isMixedChargeType(chargeType)) {
    return {
      chargeType,
      splitMode: undefined,
      splitValues: undefined,
    }
  }

  const defaults = defaultSplitConfig(chargeType)
  return {
    chargeType,
    splitMode: overrides?.splitMode ?? defaults.splitMode,
    splitValues: overrides?.splitValues ?? defaults.splitValues,
  }
}

function getLaborTypeOptions(repairType: string) {
  return LABOR_TYPE_OPTIONS_BY_REPAIR_TYPE[repairType] ?? ['机电']
}

function getChargeSplitValidation(item: ChargeAllocatableItem) {
  const parts = parseChargeTypeParts(item.chargeType)
  if (parts.length <= 1) return null
  const splitValues = item.splitValues ?? {}

  if (item.splitMode === 'amount') {
    const allocated = parts.reduce((sum, part) => sum + (Number(splitValues[part]) || 0), 0)
    if (Math.abs(allocated - item.fee) > 0.01) {
      return `分担金额合计 ¥${allocated.toFixed(0)} 与当前费用 ¥${item.fee.toFixed(0)} 不一致，请调整。`
    }
    return null
  }

  const totalRatio = parts.reduce((sum, part) => sum + (Number(splitValues[part]) || 0), 0)
  if (totalRatio !== 100) {
    return `当前比例合计 ${totalRatio}% ，建议调整为 100%。`
  }

  return null
}

function getChargeSplitSummary(item: ChargeAllocatableItem) {
  const parts = parseChargeTypeParts(item.chargeType)
  if (parts.length <= 1) return ''
  const splitValues = item.splitValues ?? {}
  const unit = item.splitMode === 'amount' ? '元' : '%'
  const modeLabel = item.splitMode === 'amount' ? '按金额' : '按比例'
  return `${modeLabel}：${parts.map(part => `${part} ${Number(splitValues[part]) || 0}${unit}`).join(' / ')}`
}

function getShortChargeTypeLabel(label: string) {
  return label === '客户自费' ? '自费' : label
}

function getCompactChargeSplitSummary(item: ChargeAllocatableItem) {
  const parts = parseChargeTypeParts(item.chargeType)
  if (parts.length <= 1) return ''
  const splitValues = item.splitValues ?? {}
  const unit = item.splitMode === 'amount' ? '元' : '%'
  return parts.map(part => `${getShortChargeTypeLabel(part)}${Number(splitValues[part]) || 0}${unit}`).join('｜')
}

function formatChargeTypeDisplay(item: ChargeAllocatableItem) {
  const parts = parseChargeTypeParts(item.chargeType)
  if (parts.length <= 1) return parts[0] || '—'
  const summary = getCompactChargeSplitSummary(item)
  return summary || parts.join('、')
}

type ChargeTypeFieldProps = {
  scope: 'repair' | 'part' | 'extra'
  itemId: number
  item: ChargeAllocatableItem
  locked: boolean
  hideClaimOption?: boolean
  openDropdownKey: string | null
  setOpenDropdownKey: React.Dispatch<React.SetStateAction<string | null>>
  openSplitKey: string | null
  setOpenSplitKey: React.Dispatch<React.SetStateAction<string | null>>
  onUpdate: (patch: Partial<ChargeAllocatableItem & { chargeType: string }>) => void
}

function ChargeTypeField({
  scope,
  itemId,
  item,
  locked,
  hideClaimOption,
  openDropdownKey,
  setOpenDropdownKey,
  openSplitKey,
  setOpenSplitKey,
  onUpdate,
}: ChargeTypeFieldProps) {
  const rowKey = `${scope}-${itemId}`
  const chargeParts = parseChargeTypeParts(item.chargeType)
  const chargeOptions = CHARGE_TYPE_OPTIONS.filter(option => !(hideClaimOption && option === '索赔'))

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        className="charge-type-select-wrap"
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpenDropdownKey(current => current === rowKey ? null : current)
          }
        }}
      >
        <button
          type="button"
          className="form-select charge-type-trigger"
          disabled={locked}
          onClick={() => setOpenDropdownKey(current => current === rowKey ? null : rowKey)}
        >
          <span className="charge-trigger-content">
            <span className="charge-trigger-main">
              {chargeParts.length > 1 ? getCompactChargeSplitSummary(item) : chargeParts[0] || '请选择收费类型'}
            </span>
          </span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
        {!locked && openDropdownKey === rowKey && (
          <div className="charge-type-dropdown">
            {chargeOptions.map(option => {
              const checked = chargeParts.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  className="charge-type-option"
                  onClick={() => {
                    const nextChargeType = toggleChargeTypePart(item.chargeType, option)
                    onUpdate(buildChargeTypePatch(nextChargeType))
                  }}
                >
                  {checked ? <SquareCheckBig size={16} strokeWidth={1.8} /> : <Square size={16} strokeWidth={1.8} />}
                  <span>{option}</span>
                </button>
              )
            })}
            <div className="charge-type-dropdown-footer">
              <button
                type="button"
                className="btn btn-text btn-sm"
                onClick={() => {
                  setOpenDropdownKey(null)
                  if (isMixedChargeType(item.chargeType)) {
                    setOpenSplitKey(rowKey)
                  } else {
                    setOpenSplitKey(null)
                  }
                }}
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
      {isMixedChargeType(item.chargeType) && openSplitKey === rowKey && (
        <div className="charge-mix-editor">
          <div className="charge-mix-row">
            <span className="charge-mix-label">分担方式</span>
            <div className="charge-mix-switch">
              {[
                ['ratio', '按比例分担'],
                ['amount', '按金额分担'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`charge-mix-chip ${item.splitMode === value ? 'active' : ''}`}
                  onClick={() => onUpdate({ splitMode: value as 'ratio' | 'amount' })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="charge-mix-row">
            {chargeParts.map(label => {
              const currentValue = item.splitValues?.[label]
              return (
                <label key={`${itemId}-${label}`} className="charge-mix-input-group">
                  <span>{label}</span>
                  <div className="charge-mix-input-wrap">
                    <input
                      className="form-input"
                      type="number"
                      value={currentValue ?? ''}
                      onChange={e => onUpdate({
                        splitValues: {
                          ...(item.splitValues ?? {}),
                          [label]: Number(e.target.value) || 0,
                        },
                      })}
                    />
                    <span className="charge-mix-unit">{item.splitMode === 'amount' ? '元' : '%'}</span>
                  </div>
                </label>
              )
            })}
          </div>
          {getChargeSplitValidation(item) && (
            <div className="field-error-text">{getChargeSplitValidation(item)}</div>
          )}
          <div className="charge-mix-footer">
            <button type="button" className="btn btn-text btn-sm" onClick={() => setOpenSplitKey(null)}>确认</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChargeTypePresetField({
  chargeType,
  splitValues,
  onChange,
}: {
  chargeType: string
  splitValues?: Record<string, number>
  onChange: (patch: { chargeType: string; splitMode?: 'ratio' | 'amount'; splitValues?: Record<string, number> }) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const chargeParts = parseChargeTypeParts(chargeType)
  const presetDisplayItem: ChargeAllocatableItem = {
    chargeType,
    splitMode: 'ratio',
    splitValues,
    fee: 100,
  }
  const validationMessage = chargeParts.length > 1
    ? getChargeSplitValidation(presetDisplayItem)
    : null

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div
        className="charge-type-select-wrap"
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDropdownOpen(false)
          }
        }}
      >
        <button
          type="button"
          className="form-select charge-type-trigger"
          onClick={() => setDropdownOpen(current => !current)}
        >
          <span className="charge-trigger-content">
            <span className="charge-trigger-main">
              {chargeParts.length > 1 ? getCompactChargeSplitSummary(presetDisplayItem) : chargeParts[0] || '请选择收费类型'}
            </span>
          </span>
          <ChevronDown size={16} strokeWidth={1.8} />
        </button>
        {dropdownOpen && (
          <div className="charge-type-dropdown">
            {CHARGE_TYPE_OPTIONS.map(option => {
              const checked = chargeParts.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  className="charge-type-option"
                  onClick={() => {
                    const nextChargeType = toggleChargeTypePart(chargeType, option)
                    onChange(buildChargeTypePatch(nextChargeType))
                    if (!isMixedChargeType(nextChargeType)) {
                      setEditorOpen(false)
                    }
                  }}
                >
                  {checked ? <SquareCheckBig size={16} strokeWidth={1.8} /> : <Square size={16} strokeWidth={1.8} />}
                  <span>{option}</span>
                </button>
              )
            })}
            <div className="charge-type-dropdown-footer">
              <button
                type="button"
                className="btn btn-text btn-sm"
                onClick={() => {
                  setDropdownOpen(false)
                  setEditorOpen(isMixedChargeType(chargeType))
                }}
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
      {isMixedChargeType(chargeType) && editorOpen && (
        <div className="charge-mix-editor">
          <div className="charge-mix-row">
            <span className="charge-mix-label">分担方式</span>
            <div className="charge-mix-switch">
              <button type="button" className="charge-mix-chip active">
                按比例分担
              </button>
            </div>
          </div>
          <div className="charge-mix-row">
            {chargeParts.map(label => {
              const currentValue = splitValues?.[label]
              return (
                <label key={`batch-${label}`} className="charge-mix-input-group">
                  <span>{label}</span>
                  <div className="charge-mix-input-wrap">
                    <input
                      className="form-input"
                      type="number"
                      value={currentValue ?? ''}
                      onChange={event => onChange(buildChargeTypePatch(chargeType, {
                        splitMode: 'ratio',
                        splitValues: {
                          ...(splitValues ?? {}),
                          [label]: Number(event.target.value) || 0,
                        },
                      }))}
                    />
                    <span className="charge-mix-unit">%</span>
                  </div>
                </label>
              )
            })}
          </div>
          {validationMessage && (
            <div className="field-error-text">{validationMessage}</div>
          )}
          <div className="charge-mix-footer">
            <button type="button" className="btn btn-text btn-sm" onClick={() => setEditorOpen(false)}>确认</button>
          </div>
        </div>
      )}
    </div>
  )
}

function isBlockingWarrantyAlert(level: WarrantyAlertLevel) {
  return level >= 4
}

function isWarrantyLocked(order: WorkOrder) {
  return Boolean(order.warrantyAlert && order.warrantyLocked && isBlockingWarrantyAlert(order.warrantyAlert.level))
}

function getWarrantyAlertTagClass(level: WarrantyAlertLevel) {
  if (level >= 4) return 'table-mini-tag-danger'
  if (level === 3) return 'table-mini-tag-working'
  return 'table-mini-tag-warning'
}

function getWarrantyAlertLabel(level: WarrantyAlertLevel) {
  return `三包${level}级`
}

function clampDiscountRate(value: number) {
  if (!Number.isFinite(value)) return 100
  return Math.min(100, Math.max(0, value))
}

function calculateRepairItemFee(unitPrice: number, hours: number, discountRate = 100) {
  return Number((unitPrice * hours * (clampDiscountRate(discountRate) / 100)).toFixed(2))
}

function calculatePartFee(unitPrice: number, qty: number, discountRate = 100) {
  return Number((unitPrice * qty * (clampDiscountRate(discountRate) / 100)).toFixed(2))
}

function formatRuntimeDateTime(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function buildDetailRepairItems(workOrder: WorkOrder): RepairItem[] {
  const base = workOrder.repairItems?.length
    ? workOrder.repairItems
    : [
        { id: 1, name: '发动机机油更换', code: 'SVC-001', laborType: '保养', unitPrice: 80, hours: 1, fee: 80, type: '保养', chargeType: '客户自费' },
        { id: 2, name: '机油滤清器更换', code: 'SVC-002', laborType: '养护', unitPrice: 30, hours: 0.5, fee: 15, type: '保养', chargeType: '客户自费' },
        { id: 3, name: workOrder.faultDesc, code: 'JOB-FAULT-001', laborType: getLaborTypeOptions(workOrder.repairType)[0], unitPrice: workOrder.actualLaborFee || 0, hours: 1, fee: workOrder.actualLaborFee, type: workOrder.repairType, chargeType: workOrder.chargeType },
      ]
  return enrichRepairItemsFromDispatch(base.map(item => ({ ...item })), workOrder.dispatchInfo)
}

function cloneSeedData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function usePersistentState<T>(storageKey: string, fallbackValue: T, mergePersistedValue?: (persistedValue: T, fallbackValue: T) => T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      const clonedFallback = cloneSeedData(fallbackValue)
      return mergePersistedValue ? mergePersistedValue(clonedFallback, clonedFallback) : clonedFallback
    }

    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        const clonedFallback = cloneSeedData(fallbackValue)
        return mergePersistedValue ? mergePersistedValue(clonedFallback, clonedFallback) : clonedFallback
      }
      const parsed = JSON.parse(raw) as T
      return mergePersistedValue ? mergePersistedValue(parsed, cloneSeedData(fallbackValue)) : parsed
    } catch (error) {
      console.warn(`Failed to read local storage key ${storageKey}:`, error)
      const clonedFallback = cloneSeedData(fallbackValue)
      return mergePersistedValue ? mergePersistedValue(clonedFallback, clonedFallback) : clonedFallback
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state))
    } catch (error) {
      console.warn(`Failed to persist local storage key ${storageKey}:`, error)
    }
  }, [state, storageKey])

  return [state, setState] as const
}

const LOCAL_STORAGE_KEYS = {
  orders: 'repair-workorder-m02:orders',
  inspectTemplates: 'repair-workorder-m02:inspect-templates',
  laborStandards: 'repair-workorder-m02:labor-standards',
} as const

function formatWorkOrderIdDate(date = new Date()) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}${day}`
}

function buildNextWorkOrderId(existingOrders: WorkOrder[], date = new Date()) {
  const datePart = formatWorkOrderIdDate(date)
  const sameDayOrders = existingOrders.filter(order => order.id.startsWith(`WO-${datePart}-`))
  const nextSerial = `${sameDayOrders.length + 1}`.padStart(3, '0')
  return `WO-${datePart}-${nextSerial}`
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function getSeriesFromModel(model: string) {
  const parts = model.split(/\s+/).filter(Boolean)
  if (parts.length >= 3) {
    return `${parts[1]} ${parts[2]}`.replace(/\s+20\d{2}款$/, '').trim()
  }
  return parts[1] ?? parts[0] ?? '未识别车系'
}

function getUnifiedChargeType(items: Array<{ chargeType: string; fee: number }>) {
  const partsSet = new Set<string>()

  items
    .filter(item => item.fee > 0)
    .forEach(item => {
    parseChargeTypeParts(item.chargeType).forEach(part => partsSet.add(part))
  })

  return serializeChargeTypeParts(Array.from(partsSet)) || CHARGE_TYPE_OPTIONS[0]
}

function buildWarrantyReportNo(order: WorkOrder) {
  const suffix = order.id.replace(/[^0-9]/g, '').slice(-8)
  return `${order.warrantyAlert?.code ?? 'WB'}-${suffix || order.id}`
}

const WORK_ORDER_ACTION_LABELS: Record<WorkOrderActionType, string> = {
  view: '查看详情',
  dispatch: '派工',
  construction: '查看施工详情',
  edit: '编辑工单',
  delivery: '交车',
  rework: '返修处理',
}

const SERVICE_VEHICLE_OPTIONS = [
  { id: 'svc-01', code: 'FWC-01', plate: '皖B·MS006', name: '移动服务车 01' },
  { id: 'svc-03', code: 'FWC-03', plate: '皖B·MS001', name: '移动服务车 03' },
  { id: 'svc-05', code: 'FWC-05', plate: '皖B·MS009', name: '移动服务车 05' },
  { id: 'svc-07', code: 'FWC-07', plate: '皖B·MS012', name: '移动服务车 07' },
] as const

const ONSITE_DETAIL_STEPS: Array<{ key: OnsiteServiceStatus; label: string }> = [
  { key: 'to_submit', label: '待提交' },
  { key: 'dispatch', label: '待派工' },
  { key: 'pick', label: '待领料' },
  { key: 'depart', label: '待出发' },
  { key: 'arrive', label: '已出发' },
  { key: 'inspect', label: '待环检' },
  { key: 'start', label: '待开工' },
  { key: 'finish', label: '待完工' },
  { key: 'qc', label: '待质检' },
  { key: 'settlement', label: '待结算' },
  { key: 'return', label: '待回程' },
  { key: 'return-stock', label: '待退料' },
  { key: 'done', label: '完成' },
]

const ONSITE_STATUS_MAP: Record<OnsiteServiceStatus, { label: string; cls: string }> = {
  to_submit: { label: '待提交', cls: 'tag-draft' },
  dispatch: { label: '待派工', cls: 'tag-pending' },
  pick: { label: '待领料', cls: 'tag-warning' },
  depart: { label: '待出发', cls: 'tag-pending' },
  arrive: { label: '已出发', cls: 'tag-pending' },
  inspect: { label: '待环检', cls: 'tag-warning' },
  start: { label: '待开工', cls: 'tag-warning' },
  finish: { label: '待完工', cls: 'tag-working' },
  qc: { label: '待质检', cls: 'tag-qc' },
  settlement: { label: '待结算', cls: 'tag-done' },
  return: { label: '待回程', cls: 'tag-pending' },
  'return-stock': { label: '待退料', cls: 'tag-warning' },
  done: { label: '完成', cls: 'tag-done' },
}

const DEMO_ONSITE_ORDER_IDS = new Set(['WO-2026-0327-007', 'WO-2026-0327-008', 'WO-2026-0327-010'])

const DEMO_ONSITE_ADDRESSES: Record<string, string> = {
  'WO-2026-0327-007': '镜湖区伟星天境 6 栋 B2-118',
  'WO-2026-0327-008': '弋江区柏庄观邸南门 2 号位',
  'WO-2026-0327-010': '鸠江区政通路地下停车区 A-21',
}

function isOnsiteOrder(order?: WorkOrder | null) {
  return order?.serviceType === 'onsite'
}

function getDefaultServiceVehicle(orderId: string) {
  const digits = Number(orderId.replace(/\D/g, '').slice(-2)) || 0
  return SERVICE_VEHICLE_OPTIONS[digits % SERVICE_VEHICLE_OPTIONS.length]
}

function mapWorkOrderStatusToOnsiteStatus(order: WorkOrder): OnsiteServiceStatus {
  if (order.onsiteStatus) return order.onsiteStatus
  switch (order.status) {
    case 'draft':
    case 'inspecting':
    case 'diagnosing':
      return 'to_submit'
    case 'pending':
    case 'rework':
      return 'dispatch'
    case 'working':
    case 'self_check':
    case 'qc_fail':
      return 'start'
    case 'qc_wait':
      return 'qc'
    case 'qc_pass':
    case 'delivery':
      return order.settlementAt && order.settlementAt !== '—' ? 'return' : 'settlement'
    case 'done':
      return 'done'
    case 'cancel':
    default:
      return 'to_submit'
  }
}

function normalizeWorkOrder(order: WorkOrder): WorkOrder {
  const serviceType = order.serviceType ?? (DEMO_ONSITE_ORDER_IDS.has(order.id) ? 'onsite' : 'self_drive')
  if (serviceType !== 'onsite') {
    return { ...order, serviceType }
  }
  const vehicle = order.serviceVehicleId
    ? SERVICE_VEHICLE_OPTIONS.find(item => item.id === order.serviceVehicleId) ?? getDefaultServiceVehicle(order.id)
    : order.status !== 'pending'
      ? getDefaultServiceVehicle(order.id)
      : undefined
  const normalized: WorkOrder = {
    ...order,
    serviceType,
    onsiteAddress: order.onsiteAddress || DEMO_ONSITE_ADDRESSES[order.id] || '待补充上门地址',
    serviceVehicleId: order.serviceVehicleId || vehicle?.id,
    serviceVehicleCode: order.serviceVehicleCode || vehicle?.code,
    serviceVehiclePlate: order.serviceVehiclePlate || vehicle?.plate,
    serviceVehicleName: order.serviceVehicleName || vehicle?.name,
  }
  return { ...normalized, onsiteStatus: mapWorkOrderStatusToOnsiteStatus(normalized) }
}

function getOnsiteStatus(order: WorkOrder) {
  return normalizeWorkOrder(order).onsiteStatus ?? 'to_submit'
}

function getNextOnsiteStatus(status: OnsiteServiceStatus): OnsiteServiceStatus | null {
  const flow: OnsiteServiceStatus[] = ['pick', 'depart', 'arrive', 'inspect', 'start', 'finish', 'qc', 'settlement', 'return', 'return-stock', 'done']
  const index = flow.indexOf(status)
  return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null
}

function getOnsiteActionLabel(status: OnsiteServiceStatus) {
  const labels: Partial<Record<OnsiteServiceStatus, string>> = {
    pick: '完成领料',
    depart: '确认出发',
    arrive: '确认到达',
    inspect: '完成环检',
    start: '开工',
    finish: '完工',
    qc: '质检通过',
    settlement: '结算',
    return: '确认回程',
    'return-stock': '退料完成',
  }
  return labels[status] ?? ''
}

function getPartStock(part: PartItem) {
  return part.stock ?? PART_PICKER_OPTIONS.find(option => option.code === part.code)?.stock ?? part.qty
}

function getWorkOrderPartItems(order: WorkOrder): PartItem[] {
  if (order.partItems?.length) return order.partItems
  if (order.materialStatus === 'none') return []
  const sourceOptions = order.materialStatus === 'partial'
    ? [PART_PICKER_OPTIONS[0], PART_PICKER_OPTIONS[4]].filter(Boolean)
    : [PART_PICKER_OPTIONS[0], PART_PICKER_OPTIONS[1]].filter(Boolean)
  return sourceOptions.map((option, index) => ({
    id: option.id || index + 1,
    name: option.name,
    code: option.code,
    unitPrice: option.unitPrice,
    stock: option.stock,
    qty: option.qty,
    discountRate: 100,
    fee: calculatePartFee(option.unitPrice, option.qty),
    type: option.type,
    chargeType: '客户自费',
    shortageSynced: option.stock < option.qty,
  }))
}

function getShortageParts(parts: PartItem[]) {
  return parts.filter(part => getPartStock(part) < part.qty || part.shortageSynced)
}

function chargeSummaryBucket(chargeType: string) {
  switch (chargeType) {
    case '保险':
      return 'insurance'
    case '索赔':
      return 'warranty'
    case '内结':
      return 'internal'
    case '客户自费':
    default:
      return 'self'
  }
}

function allocateCharge(item: ChargeAllocatableItem) {
  const summary = {
    self: 0,
    warranty: 0,
    insurance: 0,
    internal: 0,
  }

  const parts = parseChargeTypeParts(item.chargeType)
  if (parts.length <= 1) {
    summary[chargeSummaryBucket(parts[0] || item.chargeType)] += item.fee
    return summary
  }

  const splitValues = item.splitValues ?? {}
  if (item.splitMode === 'amount') {
    parts.forEach(part => {
      summary[chargeSummaryBucket(part)] += Math.max(0, Number(splitValues[part]) || 0)
    })
    return summary
  }

  const totalRatio = parts.reduce((sum, part) => sum + Math.max(0, Number(splitValues[part]) || 0), 0) || 100
  parts.forEach((part, index) => {
    const amount = index === parts.length - 1
      ? item.fee - Object.entries(summary).reduce((sum, [, value]) => sum + value, 0)
      : item.fee * ((Math.max(0, Number(splitValues[part]) || 0)) / totalRatio)
    summary[chargeSummaryBucket(part)] += amount
  })
  return summary
}

interface WorkOrderAdvancedFilters {
  consignmentNo: string
  appointmentNo: string
  advisor: string
  brand: string
  vin: string
  plate: string
  customerName: string
  senderPhone: string
  createdDateStart: string
  createdDateEnd: string
  completedDateStart: string
  completedDateEnd: string
  settlementDateStart: string
  settlementDateEnd: string
  confirmedStartDateStart: string
  confirmedStartDateEnd: string
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const ORDERS: WorkOrder[] = [
  { id: 'WO-2026-0327-001', repairType: '维修', vin: 'KW293B1283928372', plate: '浙B·0L34B', owner: '郭富贵', advisor: '李顾问', dealerErpCode: '1070TW', dealerShortName: '赣州腾洋', series: 'ARRIZO 8', status: 'delivery', materialStatus: 'picked', estimatedDeliveryAt: '2026-03-27 17:00', sender: '郭富贵', senderPhone: '13525253744', customerType: '个人车主', mileage: 28391, confirmedStartAt: '2026-03-27 10:05', completedAt: '2026-03-27 15:20', completedReviewAt: '2026-03-27 15:45', deliveryAt: '—', settlementAt: '2026-03-27 16:18', engineNo: 'SQR481F-2B12345', gearboxNo: 'CVT25-8921', saleDate: '2024-09-16', color: '曜石黑', invoiceDate: '2024-09-20', productionDate: '2024-08-28', insuranceCompany: '人保财险', completedReviewer: '赵班组长', standardLaborFee: 860, standardMaterialFee: 420, standardTotalFee: 1280, actualLaborFee: 860, actualMaterialFee: 360, otherFee: 60, createdAt: '2026-03-27 09:15', actualTotalFee: 1280, updatedAt: '2026-03-27 16:20', repairCategory: '维修', technician: '张伟', chargeType: '客户自费', isEV: false, model: '奇瑞 ARRIZO 8 2023款 1.6T', faultDesc: '发动机异响，加速无力', phone: '13525253744',
    ownerType: '个人', ownerEmail: 'guofugui@example.com', contactPerson: '郭富贵', contactPhone: '13525253744',
    brand: '奇瑞', configuration: '1.6T 尊贵型', interiorColor: '黑色', totalMileage: 28391, hevMileage: 28391, fuelLevel: 45, batteryLevel: 0, isMeterReplaced: false, warrantyExpireDate: '2027-09-20', insuranceExpireDate: '2026-09-16', isThreePack: false,
    ownerTags: ['健身达人', '敏感客户'], vehicleTags: ['按时保养', '高价值客户'],
    isPickupDelivery: true, principalTechnician: '张伟', serviceType: 'rescue', dispatchedAt: '2026-03-27 10:05',
    repairItems: [
      { id: 101, name: '发动机异响诊断', code: 'RP-201', laborType: '机电', unitPrice: 120, hours: 1.5, discountRate: 90, fee: 162, type: '维修', chargeType: '客户自费', packageName: '春季检修套餐', faultLocation: '发动机舱', isDispatched: true, assignedTechnician: '张伟', workstation: '机电工位-03' },
      { id: 102, name: '更换火花塞', code: 'RP-202', laborType: '机电', unitPrice: 80, hours: 0.8, discountRate: 100, fee: 64, type: '维修', chargeType: '客户自费', packageName: '春季检修套餐', faultLocation: '发动机舱', isDispatched: true, assignedTechnician: '张伟', workstation: '机电工位-03' },
      { id: 103, name: '清洗节气门', code: 'RP-203', laborType: '机电', unitPrice: 100, hours: 0.6, discountRate: 100, fee: 60, type: '维修', chargeType: '客户自费', faultLocation: '进气系统', isDispatched: true, assignedTechnician: '王强', workstation: '机电工位-01' },
    ],
    partItems: [
      { id: 201, name: '火花塞（4支装）', code: 'PT-201', unitPrice: 45, stock: 12, qty: 1, fee: 180, type: '维修', chargeType: '客户自费', packageName: '春季检修套餐', isPicked: true, isSupplierDirect: true, issuer: '仓库-李明', receiver: '张伟' },
      { id: 202, name: '节气门清洗剂', code: 'PT-202', unitPrice: 35, stock: 20, qty: 1, fee: 35, type: '维修', chargeType: '客户自费', isPicked: true, isSupplierDirect: false, issuer: '仓库-李明', receiver: '王强' },
      { id: 203, name: '机油滤清器', code: 'PT-203', unitPrice: 42, stock: 8, qty: 1, fee: 42, type: '维修', chargeType: '客户自费', isPicked: true, isSupplierDirect: false, issuer: '仓库-李明', receiver: '张伟' },
    ],
    additionalFeeItems: [
      { id: 301, name: '外出救援费', fee: 60, chargeType: '客户自费', relatedDocNo: 'RS-20260327-008', relatedDocType: '道路救援', note: '拖车至店' },
    ],
    warrantyAlert: { level: 2, code: 'WB-02', title: '同部位历史索赔记录待复核', reason: '该 VIN 近 90 天存在同部位保修记录，本次交车前需提醒服务顾问复核收费结论。', guidance: '当前为提醒级预警，确认后可继续处理，后续由三包专员补齐复核记录。' } },
  { id: 'WO-2026-0327-002', repairType: '维修', vin: 'LFV2A21K0N3456789', plate: '沪A·88888', owner: '李明', advisor: '李顾问', dealerErpCode: '1052HJ', dealerShortName: '中基帅车', series: 'eQ7', status: 'pending', materialStatus: 'partial', estimatedDeliveryAt: '2026-03-27 16:00', sender: '李明', senderPhone: '13800008888', customerType: '首保客户', mileage: 15200, confirmedStartAt: '—', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: '驱动电机总成', gearboxNo: '单速减速器-EV7', saleDate: '2025-01-11', color: '冰川银', invoiceDate: '2025-01-15', productionDate: '2024-12-20', insuranceCompany: '太平洋保险', completedReviewer: '—', standardLaborFee: 300, standardMaterialFee: 120, standardTotalFee: 420, actualLaborFee: 0, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 10:30', actualTotalFee: 0, updatedAt: '2026-03-27 10:50', repairCategory: '维修', technician: '王强', chargeType: '索赔', isEV: true, model: '奇瑞 eQ7 2024款 纯电版', faultDesc: '空调制冷效果差', phone: '13800008888', warrantyAlert: { level: 4, code: 'WB-04', title: '三包关键凭证缺失', reason: '本次索赔工单缺少故障件照片与拆检结论，且尚未完成厂家审批前置校验。', guidance: '需先补齐三包资料并由三包专员复核，系统将锁定工单，禁止派工与后续业务处理。' } },
  { id: 'WO-2026-0327-003', repairType: '事故', vin: 'LFV3B31K0M1234567', plate: '粤B·12345', owner: '陈华', advisor: '王顾问', dealerErpCode: '1041TV', dealerShortName: '温州霈奇', series: 'TIGGO 8 PRO', status: 'qc_wait', materialStatus: 'picked', estimatedDeliveryAt: '2026-03-27 14:00', sender: '陈华', senderPhone: '13912345678', customerType: '保险客户', mileage: 42800, confirmedStartAt: '2026-03-27 08:35', completedAt: '2026-03-27 12:55', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRF4J16-53291', gearboxNo: 'DCT380-1123', saleDate: '2023-05-08', color: '珍珠白', invoiceDate: '2023-05-11', productionDate: '2023-04-25', insuranceCompany: '平安产险', completedReviewer: '赵班组长', standardLaborFee: 2600, standardMaterialFee: 960, standardTotalFee: 3560, actualLaborFee: 2580, actualMaterialFee: 920, otherFee: 100, createdAt: '2026-03-27 08:00', actualTotalFee: 3600, updatedAt: '2026-03-27 13:25', repairCategory: '事故', technician: '刘洋', chargeType: '保险+客户自费', isEV: false, model: '奇瑞 TIGGO 8 PRO 2023款', faultDesc: '刹车异响，制动距离偏长', phone: '13912345678',
    repairItems: [
      { id: 301, name: '制动系统检修', code: 'RP-ACC-301', laborType: '机电', unitPrice: 200, hours: 2, discountRate: 100, fee: 400, type: '事故', chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 60, 客户自费: 40 }, isDispatched: true },
      { id: 302, name: '更换制动盘', code: 'RP-ACC-302', laborType: '机电', unitPrice: 180, hours: 3, discountRate: 100, fee: 540, type: '事故', chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 70, 客户自费: 30 }, isDispatched: true },
      { id: 303, name: '四轮定位', code: 'RP-ACC-303', laborType: '机电', unitPrice: 120, hours: 1.5, discountRate: 100, fee: 180, type: '事故', chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 50, 客户自费: 50 }, isDispatched: true },
    ],
    partItems: [
      { id: 401, name: '前制动盘总成', code: 'PT-ACC-401', unitPrice: 420, stock: 4, qty: 2, fee: 840, type: '事故', chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 80, 客户自费: 20 }, isPicked: true },
      { id: 402, name: '制动片套装', code: 'PT-ACC-402', unitPrice: 80, stock: 12, qty: 1, fee: 80, type: '事故', chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 100, 客户自费: 0 }, isPicked: true },
    ],
    additionalFeeItems: [
      { id: 501, name: '拖车费', fee: 100, chargeType: '保险+客户自费', splitMode: 'ratio', splitValues: { 保险: 100, 客户自费: 0 }, relatedDocType: '道路救援', note: '事故拖车至店' },
    ],
  },
  { id: 'WO-2026-0327-004', repairType: '保养', vin: 'LFV4C41K0L9876543', plate: '京C·66666', owner: '赵磊', advisor: '王顾问', dealerErpCode: '1072VP', dealerShortName: '武汉瑞联不诺', series: 'TIGGO 7 PRO', status: 'done', materialStatus: 'picked', estimatedDeliveryAt: '2026-03-26 17:00', sender: '赵磊', senderPhone: '13666666666', customerType: '会员客户', mileage: 68900, confirmedStartAt: '2026-03-26 14:15', completedAt: '2026-03-26 16:05', completedReviewAt: '2026-03-26 16:28', deliveryAt: '2026-03-26 17:06', settlementAt: '2026-03-26 17:18', engineNo: 'SQRF4J16-31762', gearboxNo: 'CVT19-2251', saleDate: '2022-10-18', color: '曜夜灰', invoiceDate: '2022-10-21', productionDate: '2022-09-28', insuranceCompany: '国寿财险', completedReviewer: '赵班组长', standardLaborFee: 220, standardMaterialFee: 460, standardTotalFee: 680, actualLaborFee: 220, actualMaterialFee: 430, otherFee: 30, createdAt: '2026-03-26 14:00', actualTotalFee: 680, updatedAt: '2026-03-26 17:20', repairCategory: '保养', technician: '张伟', chargeType: '客户自费', isEV: false, model: '奇瑞 TIGGO 7 PRO 2022款', faultDesc: '常规保养，更换机油机滤', phone: '13666666666' },
  { id: 'WO-2026-0327-005', repairType: '维修', vin: 'LFV5D51K0K5432109', plate: '苏E·54321', owner: '孙芳', advisor: '李顾问', dealerErpCode: '1074LF', dealerShortName: '德州金万通', series: 'eQ5', status: 'qc_fail', materialStatus: 'pending', estimatedDeliveryAt: '2026-03-27 18:00', sender: '孙芳', senderPhone: '13754321000', customerType: '保修客户', mileage: 9800, confirmedStartAt: '2026-03-27 11:40', completedAt: '2026-03-27 17:00', completedReviewAt: '2026-03-27 17:20', deliveryAt: '—', settlementAt: '—', engineNo: '驱动电机总成', gearboxNo: '单速减速器-EQ5', saleDate: '2025-08-03', color: '晴空蓝', invoiceDate: '2025-08-09', productionDate: '2025-07-12', insuranceCompany: '大地保险', completedReviewer: '钱班组长', standardLaborFee: 980, standardMaterialFee: 0, standardTotalFee: 980, actualLaborFee: 760, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 11:00', actualTotalFee: 760, updatedAt: '2026-03-27 17:25', repairCategory: '维修', technician: '赵明', chargeType: '索赔', isEV: true, model: '奇瑞 eQ5 2024款 纯电版', faultDesc: '动力电池续航异常下降', phone: '13754321000', warrantyAlert: { level: 5, code: 'WB-05', title: '动力电池疑似重复索赔', reason: '同 VIN 电池总成 30 天内存在重复索赔申请，触发厂家高风险预警。', guidance: '需升级至厂家技术支持处理，工单不得继续返修或交付。' }, qcRejectedAt: '2026-03-27 17:30', qcRejectReason: '动力电池容量复测未达标，需复检后重新交付', qcRejectedItems: [ { itemId: 1, itemCode: 'JOB-FAULT-001', itemName: '动力电池续航异常下降', reason: '复测电池可用容量 84%，低于交付标准 90%' } ] },
  { id: 'WO-2026-0327-006', repairType: '品质改善', vin: 'LFV6E61K0J7654321', plate: '川A·77777', owner: '周建国', advisor: '王顾问', dealerErpCode: '1039AE', dealerShortName: '哈尔滨车商通供应链有限公司', series: 'ARRIZO 6 PRO', status: 'inspecting', materialStatus: 'none', estimatedDeliveryAt: '2026-03-28 10:00', sender: '周建国', senderPhone: '13577777777', customerType: '个人车主', mileage: 33400, confirmedStartAt: '—', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRE4T15C-8922', gearboxNo: 'CVT18-8812', saleDate: '2024-02-26', color: '皓月白', invoiceDate: '2024-03-02', productionDate: '2024-01-29', insuranceCompany: '中华联合', completedReviewer: '—', standardLaborFee: 650, standardMaterialFee: 120, standardTotalFee: 770, actualLaborFee: 0, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 13:00', actualTotalFee: 0, updatedAt: '2026-03-27 13:18', repairCategory: '品质改善', technician: '王强', chargeType: '客户自费', isEV: false, model: '奇瑞 ARRIZO 6 PRO 2023款', faultDesc: '车身异响，方向盘抖动', phone: '13577777777', warrantyAlert: { level: 3, code: 'WB-03', title: '旧件上传时点延后', reason: '本次三包相关旧件照片未在规定时点上传，需提醒补齐过程留痕。', guidance: '当前为提醒级预警，确认后可继续处理，但需在完工前补齐相关资料。' } },
  { id: 'WO-2026-0327-007', repairType: '维修', vin: 'LVTDB21B8PF012345', plate: '皖B·A2368', owner: '陈宇航', advisor: '李顾问', dealerErpCode: '46517', dealerShortName: '江西亿买车供应链有限公司', series: '捷途 X70 PLUS', status: 'pending', materialStatus: 'none', estimatedDeliveryAt: '2026-03-27 19:00', sender: '陈宇航', senderPhone: '13800138000', customerType: '个人车主', mileage: 31260, confirmedStartAt: '—', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRE4T15C-12093', gearboxNo: 'DCT300-6732', saleDate: '2023-11-18', color: '星际蓝', invoiceDate: '2023-11-22', productionDate: '2023-10-28', insuranceCompany: '人保财险', completedReviewer: '—', standardLaborFee: 480, standardMaterialFee: 220, standardTotalFee: 700, actualLaborFee: 0, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 13:45', actualTotalFee: 0, updatedAt: '2026-03-27 13:58', repairCategory: '维修', technician: '张伟', chargeType: '客户自费', isEV: false, model: '捷途 X70 PLUS 2024款 1.6T', faultDesc: '右前门升降器异响，玻璃升降卡滞', phone: '13800138000' },
  { id: 'WO-2026-0327-008', repairType: '保养', vin: 'LVTDB31B2PF067891', plate: '苏D·3M762', owner: '周博文', advisor: '王顾问', dealerErpCode: '1047YA', dealerShortName: '四川车柿', series: '捷途 X70 PRO', status: 'pending', materialStatus: 'partial', estimatedDeliveryAt: '2026-03-27 18:30', sender: '周博文', senderPhone: '15112345678', customerType: '会员客户', mileage: 24680, confirmedStartAt: '—', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRE4T15B-77120', gearboxNo: '7DCT-280-5521', saleDate: '2024-06-03', color: '极光绿', invoiceDate: '2024-06-08', productionDate: '2024-05-18', insuranceCompany: '太平洋保险', completedReviewer: '—', standardLaborFee: 260, standardMaterialFee: 530, standardTotalFee: 790, actualLaborFee: 0, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 14:10', actualTotalFee: 0, updatedAt: '2026-03-27 14:26', repairCategory: '保养', technician: '刘洋', chargeType: '客户自费', isEV: false, model: '捷途 X70 PRO 2024款', faultDesc: '两万公里常规保养，检查刹车系统', phone: '15112345678' },
  { id: 'WO-2026-0327-009', repairType: '事故', vin: 'LVUDB31B7MF028901', plate: '沪A·8K519', owner: '何佳宁', advisor: '李顾问', dealerErpCode: '15443', dealerShortName: '陕西凯瑞', series: '捷途山海 T2', status: 'pending', materialStatus: 'pending', estimatedDeliveryAt: '2026-03-28 12:00', sender: '何佳宁', senderPhone: '13588886666', customerType: '保险客户', mileage: 18620, confirmedStartAt: '—', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRH4J15-90218', gearboxNo: 'DHT-165-4301', saleDate: '2025-02-16', color: '苍岭绿', invoiceDate: '2025-02-20', productionDate: '2025-01-30', insuranceCompany: '平安产险', completedReviewer: '—', standardLaborFee: 1680, standardMaterialFee: 2360, standardTotalFee: 4040, actualLaborFee: 0, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 14:35', actualTotalFee: 0, updatedAt: '2026-03-27 14:48', repairCategory: '事故', technician: '李彬', chargeType: '保险+客户自费', isEV: false, model: '捷途山海 T2 2025款 C-DM', faultDesc: '左后翼子板剐蹭，后保险杠喷漆修复', phone: '13588886666' },
  { id: 'WO-2026-0327-010', repairType: '维修', vin: 'LVTDB41B6NF045812', plate: '闽D·9P615', owner: '林晓雨', advisor: '王顾问', dealerErpCode: '26387', dealerShortName: '广西摆个车网络科技有限公司', series: 'iCAR 03', status: 'working', materialStatus: 'picked', estimatedDeliveryAt: '2026-03-27 20:00', sender: '林晓雨', senderPhone: '15859236688', customerType: '首保客户', mileage: 8200, confirmedStartAt: '2026-03-27 14:20', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: '驱动电机总成', gearboxNo: '单速减速器-IC3', saleDate: '2025-09-10', color: '月岩灰', invoiceDate: '2025-09-13', productionDate: '2025-08-22', insuranceCompany: '中华联合', completedReviewer: '—', standardLaborFee: 520, standardMaterialFee: 180, standardTotalFee: 700, actualLaborFee: 260, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 12:40', actualTotalFee: 260, updatedAt: '2026-03-27 14:35', repairCategory: '维修', technician: '王强', chargeType: '索赔', isEV: true, model: 'iCAR 03 2025款 四驱长续航', faultDesc: '慢充口盖无法弹开，需拆检执行器', phone: '15859236688', warrantyAlert: { level: 1, code: 'WB-01', title: '索赔时效即将到期', reason: '该项目距离索赔资料提交截止时间不足 24 小时。', guidance: '提醒服务顾问及时上传照片与检测记录，确认后可继续维修处理。' } },
  { id: 'WO-2026-0327-011', repairType: '保养', vin: 'LFV7F71K0N1122334', plate: '浙A·6Q812', owner: '黄子昂', advisor: '李顾问', dealerErpCode: '45681', dealerShortName: '宁波信晨港通', series: 'TIGGO 9', status: 'working', materialStatus: 'partial', estimatedDeliveryAt: '2026-03-27 19:30', sender: '黄子昂', senderPhone: '13912348812', customerType: '会员客户', mileage: 12640, confirmedStartAt: '2026-03-27 14:50', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRF4J20C-21908', gearboxNo: '8AT-380-7712', saleDate: '2025-04-09', color: '星河紫', invoiceDate: '2025-04-12', productionDate: '2025-03-25', insuranceCompany: '太平洋保险', completedReviewer: '—', standardLaborFee: 540, standardMaterialFee: 360, standardTotalFee: 900, actualLaborFee: 360, actualMaterialFee: 0, otherFee: 0, createdAt: '2026-03-27 13:30', actualTotalFee: 360, updatedAt: '2026-03-27 15:10', repairCategory: '保养', technician: '张伟', chargeType: '客户自费', isEV: false, model: '奇瑞 TIGGO 9 2024款 1.6T', faultDesc: '一万公里常规保养，附加换变速箱油', phone: '13912348812',
    repairItems: [
      { id: 1101, name: '更换机油', code: 'RP-001', laborType: '保养', unitPrice: 80, hours: 0.5, discountRate: 100, fee: 40, type: '保养', chargeType: '客户自费', packageName: '一万公里保养套餐', faultLocation: '—', isDispatched: true, assignedTechnician: '张伟', workstation: '保养工位-02', isUpsell: false },
      { id: 1102, name: '更换机油滤清器', code: 'RP-002', laborType: '保养', unitPrice: 50, hours: 0.3, discountRate: 100, fee: 15, type: '保养', chargeType: '客户自费', packageName: '一万公里保养套餐', isDispatched: true, assignedTechnician: '张伟', workstation: '保养工位-02', isUpsell: false },
      { id: 1103, name: '更换空调滤芯', code: 'RP-003', laborType: '保养', unitPrice: 60, hours: 0.3, discountRate: 100, fee: 18, type: '保养', chargeType: '客户自费', faultLocation: '空调系统', isDispatched: false, isUpsell: false },
      { id: 1104, name: '更换变速箱油', code: 'RP-014', laborType: '保养', unitPrice: 120, hours: 0.8, discountRate: 100, fee: 96, type: '保养', chargeType: '客户自费', packageName: '增项推荐', faultLocation: '变速箱', isDispatched: false, isUpsell: true },
    ],
    partItems: [
      { id: 1201, name: '全合成机油 5W-30', code: 'PT-001', unitPrice: 120, stock: 10, qty: 5, fee: 600, type: '保养', chargeType: '客户自费', packageName: '一万公里保养套餐', isPicked: true, isSupplierDirect: true, issuer: '仓库-李明', receiver: '张伟', isUpsell: false },
      { id: 1202, name: '机油滤清器', code: 'PT-002', unitPrice: 35, stock: 15, qty: 1, fee: 35, type: '保养', chargeType: '客户自费', packageName: '一万公里保养套餐', isPicked: true, issuer: '仓库-李明', receiver: '张伟', isUpsell: false },
      { id: 1203, name: '空调滤芯', code: 'PT-003', unitPrice: 80, stock: 8, qty: 1, fee: 80, type: '保养', chargeType: '客户自费', isPicked: false, isUpsell: false },
      { id: 1204, name: '变速箱油 ATF', code: 'PT-014', unitPrice: 180, stock: 6, qty: 4, fee: 720, type: '保养', chargeType: '客户自费', packageName: '增项推荐', isPicked: false, isUpsell: true },
    ],
  },
  { id: 'WO-2026-0327-012', repairType: '维修', vin: 'LFV8G81K0M2233445', plate: '京A·T8899', owner: '张建华', advisor: '王顾问', dealerErpCode: '1058BJ', dealerShortName: '北京华瑞通', series: 'TIGGO 8 PRO', status: 'working', materialStatus: 'partial', estimatedDeliveryAt: '2026-03-27 18:00', sender: '张建华', senderPhone: '13901234567', customerType: '个人车主', mileage: 35600, confirmedStartAt: '2026-03-27 13:20', completedReviewAt: '—', deliveryAt: '—', settlementAt: '—', engineNo: 'SQRF4J16-88901', gearboxNo: 'DCT380-9823', saleDate: '2023-08-15', color: '钛金灰', invoiceDate: '2023-08-18', productionDate: '2023-07-20', insuranceCompany: '人保财险', completedReviewer: '—', standardLaborFee: 680, standardMaterialFee: 450, standardTotalFee: 1130, actualLaborFee: 480, actualMaterialFee: 280, otherFee: 0, createdAt: '2026-03-27 12:00', actualTotalFee: 760, updatedAt: '2026-03-27 13:45', repairCategory: '维修', technician: '李明', chargeType: '客户自费', isEV: false, model: '奇瑞 TIGGO 8 PRO 2023款 1.6T', faultDesc: '前刹车片磨损严重，需更换；空调异响', phone: '13901234567',
    repairItems: [
      { id: 1301, name: '更换前刹车片', code: 'RP-101', laborType: '机电', unitPrice: 120, hours: 1.2, discountRate: 100, fee: 144, type: '维修', chargeType: '客户自费', isDispatched: true, isUpsell: false },
      { id: 1302, name: '检查空调系统', code: 'RP-102', laborType: '机电', unitPrice: 80, hours: 0.8, discountRate: 100, fee: 64, type: '维修', chargeType: '客户自费', isDispatched: true, isUpsell: false },
      { id: 1303, name: '更换空调压缩机皮带', code: 'RP-103', laborType: '机电', unitPrice: 100, hours: 0.6, discountRate: 100, fee: 60, type: '维修', chargeType: '客户自费', isDispatched: false, isUpsell: false },
    ],
    partItems: [
      { id: 1401, name: '前刹车片套装', code: 'PT-101', unitPrice: 280, stock: 5, qty: 1, fee: 280, type: '维修', chargeType: '客户自费', isPicked: true, isUpsell: false },
      { id: 1402, name: '空调压缩机皮带', code: 'PT-102', unitPrice: 120, stock: 8, qty: 1, fee: 120, type: '维修', chargeType: '客户自费', isPicked: false, isUpsell: false },
    ],
  },
]

const STATUS_MAP: Record<WorkOrderStatus, { label: string; cls: string }> = {
  draft:      { label: '新建', cls: 'tag-draft' },
  inspecting: { label: '待确认', cls: 'tag-warning' },
  diagnosing: { label: '待确认', cls: 'tag-warning' },
  pending:    { label: '待派工', cls: 'tag-pending' },
  working:    { label: '待完工', cls: 'tag-working' },
  self_check: { label: '待竣工', cls: 'tag-inspect' },
  qc_wait:    { label: '待质检', cls: 'tag-qc' },
  qc_pass:    { label: '待结算', cls: 'tag-done' },
  qc_fail:    { label: '待完工', cls: 'tag-fail' },
  rework:     { label: '部分派工', cls: 'tag-fail' },
  settlement: { label: '待结算', cls: 'tag-done' },
  delivery:   { label: '待交车', cls: 'tag-done' },
  done:       { label: '已交车', cls: 'tag-done' },
  cancel:     { label: '作废', cls: 'tag-cancel' },
}

function mergePersistedWorkOrders(persistedOrders: WorkOrder[], fallbackOrders: WorkOrder[]) {
  const persistedIds = new Set(persistedOrders.map(order => order.id))
  const missingFallbackOrders = fallbackOrders.filter(order => !persistedIds.has(order.id))
  return [...persistedOrders, ...missingFallbackOrders].map(order => normalizeWorkOrder(order))
}

const HISTORY_DATA = [
  {
    entrustNo: 'WT-20260115-001',
    vin: 'KW293B1283928372',
    plate: '浙B·0L34B',
    customerName: '郭富贵',
    customerType: '个人车主',
    advisor: '李顾问',
    mileage: '28,391',
    repairCategory: '维修',
    completedReviewAt: '2026-01-15 16:20',
    admissionAt: '2026-01-15 09:10',
    estimatedDeliveryAt: '2026-01-15 17:30',
    deliveryAt: '2026-01-15 17:12',
    settlementAt: '2026-01-15 17:30',
    senderName: '郭富贵',
    senderPhone: '13525253744',
    engineNo: 'SQR481F-2B12345',
    gearboxNo: 'CVT25-8921',
    saleDate: '2024-09-20',
    productionDate: '2024-08-28',
    color: '曜石黑',
    standardLaborFee: '¥860',
    standardMaterialFee: '¥420',
    standardTotalFee: '¥1,280',
    actualLaborFee: '¥860',
    actualMaterialFee: '¥360',
    otherFee: '¥60',
    outboundServiceFee: '¥0',
    actualTotalFee: '¥1,280',
    outboundServiceRemark: '—',
    createdAt: '2026-01-15 09:02',
    updatedAt: '2026-01-15 17:28',
    date: '2026-01-15',
    dealer: '本店',
    type: '维修',
    fault: '发动机机油渗漏，更换油封',
    items: ['更换曲轴油封', '更换凸轮轴油封'],
    parts: ['曲轴油封×1', '凸轮轴油封×1'],
    fee: '¥1,280',
    chargeType: '客户自费',
    status: '已完成',
  },
  {
    entrustNo: 'WT-20250920-013',
    vin: 'KW293B1283928372',
    plate: '浙B·0L34B',
    customerName: '郭富贵',
    customerType: '个人车主',
    advisor: '李顾问',
    mileage: '21,500',
    repairCategory: '保养',
    completedReviewAt: '2025-09-20 15:40',
    admissionAt: '2025-09-20 10:05',
    estimatedDeliveryAt: '2025-09-20 16:30',
    deliveryAt: '2025-09-20 16:18',
    settlementAt: '2025-09-20 16:26',
    senderName: '郭富贵',
    senderPhone: '13525253744',
    engineNo: 'SQR481F-2B12345',
    gearboxNo: 'CVT25-8921',
    saleDate: '2024-09-20',
    productionDate: '2024-08-28',
    color: '曜石黑',
    standardLaborFee: '¥220',
    standardMaterialFee: '¥460',
    standardTotalFee: '¥680',
    actualLaborFee: '¥220',
    actualMaterialFee: '¥430',
    otherFee: '¥30',
    outboundServiceFee: '¥0',
    actualTotalFee: '¥680',
    outboundServiceRemark: '—',
    createdAt: '2025-09-20 09:48',
    updatedAt: '2025-09-20 16:25',
    date: '2025-09-20',
    dealer: '本店',
    type: '保养',
    fault: '常规保养，更换机油机滤',
    items: ['更换机油', '更换机滤'],
    parts: ['机油5L×1', '机滤×1'],
    fee: '¥680',
    chargeType: '客户自费',
    status: '已完成',
  },
  {
    entrustNo: 'WT-20250310-026',
    vin: 'KW293B1283928372',
    plate: '浙B·0L34B',
    customerName: '郭富贵',
    customerType: '个人车主',
    advisor: '王顾问',
    mileage: '14,200',
    repairCategory: '维修',
    completedReviewAt: '2025-03-10 14:20',
    admissionAt: '2025-03-10 09:30',
    estimatedDeliveryAt: '2025-03-10 15:00',
    deliveryAt: '2025-03-10 14:48',
    settlementAt: '2025-03-10 14:55',
    senderName: '郭富贵',
    senderPhone: '13525253744',
    engineNo: 'SQR481F-2B12345',
    gearboxNo: 'CVT25-8921',
    saleDate: '2024-09-20',
    productionDate: '2024-08-28',
    color: '曜石黑',
    standardLaborFee: '¥300',
    standardMaterialFee: '¥1,200',
    standardTotalFee: '¥1,500',
    actualLaborFee: '¥0',
    actualMaterialFee: '¥0',
    otherFee: '¥0',
    outboundServiceFee: '¥0',
    actualTotalFee: '¥0',
    outboundServiceRemark: '—',
    createdAt: '2025-03-10 09:12',
    updatedAt: '2025-03-10 14:53',
    date: '2025-03-10',
    dealer: '杭州西湖店',
    type: '维修',
    fault: '空调压缩机异响',
    items: ['更换空调压缩机'],
    parts: ['空调压缩机×1'],
    fee: '¥0',
    chargeType: '索赔',
    status: '已完成',
  },
  {
    entrustNo: 'WT-20240905-004',
    vin: 'KW293B1283928372',
    plate: '浙B·0L34B',
    customerName: '郭富贵',
    customerType: '首保客户',
    advisor: '李顾问',
    mileage: '7,800',
    repairCategory: '保养',
    completedReviewAt: '2024-09-05 11:20',
    admissionAt: '2024-09-05 08:55',
    estimatedDeliveryAt: '2024-09-05 12:00',
    deliveryAt: '2024-09-05 11:42',
    settlementAt: '2024-09-05 11:50',
    senderName: '郭富贵',
    senderPhone: '13525253744',
    engineNo: 'SQR481F-2B12345',
    gearboxNo: 'CVT25-8921',
    saleDate: '2024-09-20',
    productionDate: '2024-08-28',
    color: '曜石黑',
    standardLaborFee: '¥180',
    standardMaterialFee: '¥320',
    standardTotalFee: '¥500',
    actualLaborFee: '¥0',
    actualMaterialFee: '¥0',
    otherFee: '¥0',
    outboundServiceFee: '¥120',
    actualTotalFee: '¥120',
    outboundServiceRemark: '上门首保取送车服务',
    createdAt: '2024-09-05 08:40',
    updatedAt: '2024-09-05 11:47',
    date: '2024-09-05',
    dealer: '本店',
    type: '保养',
    fault: '首保，更换机油机滤',
    items: ['更换机油', '更换机滤'],
    parts: ['机油5L×1', '机滤×1'],
    fee: '¥120',
    chargeType: '索赔',
    status: '已完成',
  },
]

const MATERIAL_STATUS_MAP: Record<WorkOrder['materialStatus'], { label: string; cls: string }> = {
  pending: { label: '待领料', cls: 'tag-warning' },
  partial: { label: '部分领料', cls: 'tag-pending' },
  picked: { label: '已领料', cls: 'tag-done' },
  none: { label: '无需领料', cls: 'tag-draft' },
}

const formatMoney = (value: number) => `¥${value.toLocaleString('zh-CN')}`
const containsText = (source: string | number | null | undefined, keyword: string) => String(source ?? '').toLowerCase().includes(keyword.trim().toLowerCase())
const maskName = (value: string) => {
  if (!value) return value
  if (value.length === 1) return value
  return `${value.slice(0, 1)}${'*'.repeat(value.length - 1)}`
}
const maskPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.length < 7) return digits || value
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`
}
const getWorkOrderBrand = (order: WorkOrder) => {
  if (order.model.startsWith('星途')) return '星途'
  if (order.model.startsWith('捷途')) return '捷途'
  if (order.model.toLowerCase().includes('icar')) return 'iCAR'
  if (order.model.startsWith('FR')) return 'FR'
  return '奇瑞'
}
const getWorkOrderEnergyType = (order: WorkOrder) => {
  if (/增程/i.test(order.model)) return '增程'
  if (/(C-DM|DHT|混动|PHEV|HEV)/i.test(order.model)) return '混动'
  if (order.isEV || /(纯电|EV|eQ|iCAR)/i.test(order.model)) return '纯电'
  return '燃油'
}
const getPersonDisplayName = (value: string | null | undefined) => {
  if (!value) return '—'
  const segments = value.split(/[-\s/]+/).filter(Boolean)
  return segments[segments.length - 1] || value
}
const withinDateRange = (value: string, start?: string, end?: string) => {
  if (!start && !end) return true
  if (!value || value === '—') return false
  const normalized = value.slice(0, 10)
  if (start && normalized < start) return false
  if (end && normalized > end) return false
  return true
}

const getWorkOrderColumnText = (order: WorkOrder, key: WorkOrderColumnKey) => {
  switch (key) {
    case 'id': return order.id
    case 'repairType': return order.repairType
    case 'vin': return order.vin
    case 'plate': return order.plate
    case 'owner': return order.owner
    case 'advisor': return order.advisor
    case 'dealerErpCode': return order.dealerErpCode
    case 'dealerShortName': return order.dealerShortName
    case 'series': return order.series
    case 'energyType': return getWorkOrderEnergyType(order)
    case 'serviceType': return getServiceTypeLabel(order.serviceType)
    case 'status': return isOnsiteOrder(order) ? ONSITE_STATUS_MAP[getOnsiteStatus(order)].label : STATUS_MAP[order.status].label
    case 'materialStatus': return MATERIAL_STATUS_MAP[order.materialStatus].label
    case 'onsiteAddress': return order.onsiteAddress || '—'
    case 'serviceVehicleCode': return order.serviceVehicleCode ? `${order.serviceVehicleCode} / ${order.serviceVehiclePlate || '—'}` : '待派车'
    case 'estimatedDeliveryAt': return order.estimatedDeliveryAt
    case 'sender': return order.sender
    case 'senderPhone': return order.senderPhone.replace(/\D/g, '')
    case 'customerType': return order.customerType
    case 'mileage': return `${order.mileage.toLocaleString()} km`
    case 'confirmedStartAt': return order.confirmedStartAt
    case 'completedReviewAt': return order.completedReviewAt
    case 'deliveryAt': return order.deliveryAt
    case 'settlementAt': return order.settlementAt
    case 'engineNo': return order.engineNo
    case 'gearboxNo': return order.gearboxNo
    case 'saleDate': return order.saleDate
    case 'color': return order.color
    case 'invoiceDate': return order.invoiceDate
    case 'productionDate': return order.productionDate
    case 'insuranceCompany': return order.insuranceCompany
    case 'completedReviewer': return order.completedReviewer
    case 'standardLaborFee': return formatMoney(order.standardLaborFee)
    case 'standardMaterialFee': return formatMoney(order.standardMaterialFee)
    case 'standardTotalFee': return formatMoney(order.standardTotalFee)
    case 'actualLaborFee': return formatMoney(order.actualLaborFee)
    case 'actualMaterialFee': return formatMoney(order.actualMaterialFee)
    case 'otherFee': return formatMoney(order.otherFee)
    case 'createdAt': return order.createdAt
    case 'actualTotalFee': return formatMoney(order.actualTotalFee)
    case 'updatedAt': return order.updatedAt
    case 'repairCategory': return order.repairCategory
    case 'technician': return order.technician || '待派工'
    default: return ''
  }
}

const splitColumnFilterKeyword = (keyword: string) => (
  keyword
    .split(/[\n,，;；\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
)

const filterColumnOptionsByKeyword = (options: string[], keyword: string) => {
  const tokens = splitColumnFilterKeyword(keyword)
  if (tokens.length === 0) return options
  return options.filter(option => tokens.some(token => containsText(option, token)))
}

const compareColumnText = (a: string, b: string) => (
  a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' })
)

const formatDateDisplay = (value: string, placeholder: string) => {
  if (!value) return placeholder
  const [year, month, day] = value.split('-')
  return `${year}/${month}/${day}`
}

const getMonthMeta = (year: number, month: number) => ({
  year,
  month,
  label: `${year}年 ${month}月`,
})

const shiftMonth = (year: number, month: number, delta: number) => {
  const next = new Date(year, month - 1 + delta, 1)
  return getMonthMeta(next.getFullYear(), next.getMonth() + 1)
}

const toDateValue = (year: number, month: number, day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日']

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const startDate = new Date(year, month - 1, 1 - startWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(startDate)
    current.setDate(startDate.getDate() + index)
    return {
      value: toDateValue(current.getFullYear(), current.getMonth() + 1, current.getDate()),
      day: current.getDate(),
      inCurrentMonth: current.getMonth() + 1 === month,
    }
  })
}

const DEFAULT_WORK_ORDER_FILTERS: WorkOrderAdvancedFilters = {
  consignmentNo: '',
  appointmentNo: '',
  advisor: '',
  brand: '',
  vin: '',
  plate: '',
  customerName: '',
  senderPhone: '',
  createdDateStart: '2024-05-01',
  createdDateEnd: '2026-04-20',
  completedDateStart: '',
  completedDateEnd: '',
  settlementDateStart: '',
  settlementDateEnd: '',
  confirmedStartDateStart: '',
  confirmedStartDateEnd: '',
}

const WORK_ORDER_COLUMNS: WorkOrderColumn[] = [
  {
    key: 'id',
    label: '委托书编号',
    width: 180,
    defaultVisible: true,
    render: order => (
      <div className="workorder-id-cell">
        <span className="text-link">{order.id}</span>
      </div>
    ),
  },
  { key: 'repairType', label: '维修类型', width: 120, defaultVisible: true, render: order => <CellText value={order.repairType} /> },
  { key: 'vin', label: 'VIN', width: 180, defaultVisible: true, render: order => <CellText value={order.vin} /> },
  { key: 'plate', label: '车牌号', width: 120, defaultVisible: true, render: order => <CellText value={order.plate} className="cell-text-strong" /> },
  { key: 'owner', label: '客户姓名', width: 132, defaultVisible: true, render: order => <SensitiveText value={order.owner} maskedValue={maskName(order.owner)} /> },
  { key: 'advisor', label: '服务顾问', width: 100, defaultVisible: true, render: order => <CellText value={order.advisor} /> },
  { key: 'dealerErpCode', label: '经销商ERP号', width: 140, defaultVisible: false, render: order => <CellText value={order.dealerErpCode} /> },
  { key: 'dealerShortName', label: '经销商简称', width: 180, defaultVisible: false, render: order => <CellText value={order.dealerShortName} /> },
  { key: 'series', label: '车系', width: 120, defaultVisible: true, render: order => <CellText value={order.series} /> },
  { key: 'energyType', label: '能源类型', width: 100, defaultVisible: true, render: order => <CellText value={getWorkOrderEnergyType(order)} /> },
  { key: 'serviceType', label: '服务方式', width: 110, defaultVisible: false, render: order => <CellText value={getServiceTypeLabel(order.serviceType)} /> },
  { key: 'status', label: '单据状态', width: 110, defaultVisible: true, render: order => isOnsiteOrder(order) ? <OnsiteStatusTag status={getOnsiteStatus(order)} /> : <StatusTag status={order.status} /> },
  { key: 'materialStatus', label: '领料状态', width: 120, defaultVisible: true, render: order => <span className={`tag ${MATERIAL_STATUS_MAP[order.materialStatus].cls}`}>{MATERIAL_STATUS_MAP[order.materialStatus].label}</span> },
  { key: 'onsiteAddress', label: '上门地址', width: 220, defaultVisible: false, render: order => <CellText value={order.onsiteAddress || '—'} /> },
  { key: 'serviceVehicleCode', label: '服务车辆', width: 150, defaultVisible: false, render: order => <CellText value={order.serviceVehicleCode ? `${order.serviceVehicleCode} / ${order.serviceVehiclePlate || '—'}` : '待派车'} /> },
  { key: 'estimatedDeliveryAt', label: '预计交车时间', width: 160, defaultVisible: true, render: order => <span style={{ color: order.status === 'working' ? '#fa8c16' : 'inherit' }}>{order.estimatedDeliveryAt}</span> },
  { key: 'sender', label: '送修人', width: 132, defaultVisible: true, render: order => <SensitiveText value={order.sender} maskedValue={maskName(order.sender)} /> },
  { key: 'senderPhone', label: '送修人手机号', width: 164, defaultVisible: true, render: order => <SensitiveText value={order.senderPhone.replace(/\D/g, '')} maskedValue={maskPhoneNumber(order.senderPhone)} /> },
  { key: 'customerType', label: '客户类型', width: 110, defaultVisible: false, render: order => <CellText value={order.customerType} /> },
  { key: 'mileage', label: '行驶里程', width: 120, defaultVisible: false, render: order => <CellText value={`${order.mileage.toLocaleString()} km`} /> },
  { key: 'confirmedStartAt', label: '确认开工时间', width: 160, defaultVisible: false, render: order => <CellText value={order.confirmedStartAt} /> },
  { key: 'completedReviewAt', label: '完工审核时间', width: 160, defaultVisible: false, render: order => <CellText value={order.completedReviewAt} /> },
  { key: 'deliveryAt', label: '交车时间', width: 160, defaultVisible: false, render: order => <CellText value={order.deliveryAt} /> },
  { key: 'settlementAt', label: '结算时间', width: 160, defaultVisible: false, render: order => <CellText value={order.settlementAt} /> },
  { key: 'engineNo', label: '发动机号', width: 170, defaultVisible: false, render: order => <CellText value={order.engineNo} /> },
  { key: 'gearboxNo', label: '变速箱号', width: 170, defaultVisible: false, render: order => <CellText value={order.gearboxNo} /> },
  { key: 'saleDate', label: '销售日期', width: 120, defaultVisible: false, render: order => <CellText value={order.saleDate} /> },
  { key: 'color', label: '颜色', width: 100, defaultVisible: false, render: order => <CellText value={order.color} /> },
  { key: 'invoiceDate', label: '开票日期', width: 120, defaultVisible: false, render: order => <CellText value={order.invoiceDate} /> },
  { key: 'productionDate', label: '生产日期', width: 120, defaultVisible: false, render: order => <CellText value={order.productionDate} /> },
  { key: 'insuranceCompany', label: '责任保险公司', width: 150, defaultVisible: false, render: order => <CellText value={order.insuranceCompany} /> },
  { key: 'completedReviewer', label: '完工审查人', width: 120, defaultVisible: false, render: order => <CellText value={order.completedReviewer} /> },
  { key: 'standardLaborFee', label: '标准工时费', width: 120, defaultVisible: false, render: order => <CellText value={formatMoney(order.standardLaborFee)} /> },
  { key: 'standardMaterialFee', label: '标准材料费', width: 120, defaultVisible: false, render: order => <CellText value={formatMoney(order.standardMaterialFee)} /> },
  { key: 'standardTotalFee', label: '标准费用合计', width: 130, defaultVisible: false, render: order => <CellText value={formatMoney(order.standardTotalFee)} /> },
  { key: 'actualLaborFee', label: '实收工时费', width: 120, defaultVisible: false, render: order => <CellText value={formatMoney(order.actualLaborFee)} /> },
  { key: 'actualMaterialFee', label: '实收材料费', width: 120, defaultVisible: false, render: order => <CellText value={formatMoney(order.actualMaterialFee)} /> },
  { key: 'otherFee', label: '其他费用', width: 110, defaultVisible: false, render: order => <CellText value={formatMoney(order.otherFee)} /> },
  { key: 'createdAt', label: '开单日期', width: 150, defaultVisible: false, render: order => <CellText value={order.createdAt} /> },
  { key: 'actualTotalFee', label: '实收费用合计', width: 130, defaultVisible: false, render: order => <CellText value={formatMoney(order.actualTotalFee)} /> },
  { key: 'updatedAt', label: '修改时间', width: 150, defaultVisible: false, render: order => <CellText value={order.updatedAt} /> },
  { key: 'repairCategory', label: '维修类别', width: 110, defaultVisible: false, render: order => <CellText value={order.repairCategory} /> },
  { key: 'technician', label: '服务技师', width: 140, defaultVisible: false, render: order => <CellText value={order.technician || '待派工'} /> },
]

const DEFAULT_VISIBLE_COLUMN_KEYS = WORK_ORDER_COLUMNS.filter(column => column.defaultVisible).map(column => column.key)
const ONSITE_VISIBLE_COLUMN_KEYS: WorkOrderColumnKey[] = ['id', 'plate', 'owner', 'advisor', 'serviceType', 'status', 'onsiteAddress', 'technician', 'serviceVehicleCode', 'estimatedDeliveryAt']
const DEFAULT_FROZEN_COLUMN_KEYS: WorkOrderColumnKey[] = ['id', 'repairType', 'vin']
const ONSITE_FROZEN_COLUMN_KEYS: WorkOrderColumnKey[] = ['id', 'plate']
const DEFAULT_COLUMN_WIDTHS = WORK_ORDER_COLUMNS.reduce<Record<WorkOrderColumnKey, number>>((acc, column) => {
  acc[column.key] = column.width
  return acc
}, {} as Record<WorkOrderColumnKey, number>)
const ACTION_COLUMN_WIDTH = 220
const TABLE_COLUMN_MIN_WIDTH = 132

const VEHICLE_LOOKUP_DATA: VehicleLookupRecord[] = [
  {
    id: 'vehicle-1',
    vin: 'KW293B1283928372',
    vehicleUsage: '非营运',
    vehicleStatus: '实销完成',
    series: 'ARRIZO 8',
    mileage: '28,391',
    plate: '浙B·0L34B',
    engineNo: 'SQR481F123456',
    motorNo: '—',
    batteryPackNo: 'BATT-2023-KW293-001',
    customerName: '郭富贵',
    phone: '13525253744',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 自动豪华版',
    warrantyDate: '2031-09-16',
    lastVisit: '2026-01-15',
    ownerTags: ['健身达人', '敏感客户'],
    vehicleTags: ['按时保养'],
    isThreePack: false,
  },
  {
    id: 'vehicle-2',
    vin: 'LFV4C41K0L9876543',
    vehicleUsage: '三包车',
    vehicleStatus: '实销完成',
    series: 'TIGGO 7 PRO',
    mileage: '68,900',
    plate: '京C·66666',
    engineNo: 'SQRF4J16331762',
    motorNo: '—',
    batteryPackNo: '—',
    customerName: '赵磊',
    phone: '13666666666',
    model: '奇瑞 TIGGO 7 PRO 2022款',
    warrantyDate: '2027-10-18',
    lastVisit: '2026-03-26',
    ownerTags: ['高价值客户'],
    vehicleTags: ['高频维修'],
    isThreePack: true,
  },
  {
    id: 'vehicle-3',
    vin: 'LFV6E61K0J7654321',
    vehicleUsage: '非营运',
    vehicleStatus: '实销完成',
    series: 'ARRIZO 6 PRO',
    mileage: '33,400',
    plate: '川A·77777',
    engineNo: 'SQRE4T15892822',
    motorNo: '—',
    batteryPackNo: '—',
    customerName: '周建国',
    phone: '13577777777',
    model: '奇瑞 ARRIZO 6 PRO 2023款',
    warrantyDate: '2029-02-26',
    lastVisit: '2026-03-27',
    ownerTags: ['价格敏感'],
    vehicleTags: ['长期未进厂'],
    isThreePack: false,
  },
  {
    id: 'vehicle-4',
    vin: 'LVSAB2E32PN654321',
    vehicleUsage: '',
    vehicleStatus: '经销商仓库',
    series: 'TIGGO 9',
    mileage: '',
    plate: '',
    engineNo: 'SQRF4J16A654321',
    motorNo: '—',
    batteryPackNo: '—',
    customerName: '',
    phone: '',
    model: '奇瑞 TIGGO 9 2025款',
    warrantyDate: '',
    lastVisit: '',
  },
]

const APPOINTMENT_RECORDS: AppointmentRecord[] = [
  {
    id: 'appointment-1',
    appointmentNo: 'YY-20260428-122',
    source: 'Apollo 车主 App',
    plate: '浙B·0L34B',
    vin: 'KW293B1283928372',
    ownerName: '郭富贵',
    phone: '13525253744',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 自动豪华版',
    reserveAt: '2026-04-28 09:30',
    status: '已确认',
    appointmentType: 'repair' as AppointmentTypeValue,
    contactPerson: '郭富贵',
    contactPhone: '13525253744',
    serviceAdvisor: '张伟',
    serviceStore: '杭州奇瑞4S店',
    brand: '奇瑞',
    seriesCode: 'A8',
    seriesName: 'ARRIZO 8',
    modelCode: 'A8-1.6T-AT-LUX',
    totalMileage: 15800,
    hevMileage: 15800,
    color: '珍珠白',
    engineModel: 'SQRE4T16',
    isPickupDelivery: false,
    isKanbanService: true,
    technician: '李师傅',
    settlementMethod: '客户自费',
    customerAddress: '浙江省杭州市西湖区文三路123号',
    problemDescription: '发动机异响，需要检查',
    createdBy: '系统管理员',
    createdAt: '2026-04-27 14:30:00',
    updatedBy: '张伟',
    updatedAt: '2026-04-27 16:20:00',
  },
]

const REPAIR_PROJECT_OPTIONS: RepairProjectOption[] = [
  { id: 9999, code: '9999', name: '自定义工时', laborType: '-', custom: '是', hours: 0, note: '自定义工时', unitPrice: 0, type: '维修', chargeType: '客户自费' },
  { id: 101, code: 'A11KKK37242432701', name: '拆装后门内线束总成', laborType: '机电', custom: '否', hours: 50, note: '', unitPrice: 8, type: '维修', chargeType: '客户自费' },
  { id: 102, code: 'A11BAJ17025153751', name: '更换惰轮轴', laborType: '机电', custom: '否', hours: 10, note: '不包括：分解和组装变速器总成', unitPrice: 10, type: '维修', chargeType: '客户自费' },
  { id: 103, code: 'A11KKK35021903752', name: '更换两只后制动分泵', laborType: '机电', custom: '否', hours: 20, note: '不包括：拆装后制动器总成', unitPrice: 10, type: '事故', chargeType: '保险+客户自费' },
  { id: 104, code: 'A11KKK62051203701', name: '更换左后门锁', laborType: '机电', custom: '否', hours: 20, note: '包括：调整', unitPrice: 12, type: '维修', chargeType: '客户自费' },
  { id: 105, code: 'A11KKK53055503701', name: '更换仪表框右侧出风口', laborType: '机电', custom: '否', hours: 20, note: '', unitPrice: 9, type: '精品加装(装潢)', chargeType: '客户自费' },
  { id: 106, code: 'A11AAM10091303701', name: '更换机油标尺总成', laborType: '机电', custom: '否', hours: 20, note: '', unitPrice: 8, type: '保养', chargeType: '客户自费' },
  { id: 107, code: 'A11BAJ17011893752', name: '更换两只油封总成一输出法兰', laborType: '机电', custom: '否', hours: 30, note: '不包括：拆装传动轴包括：排放和添加变速器润滑油；调整轴向间隙；', unitPrice: 11, type: '维修', chargeType: '索赔' },
  { id: 108, code: 'A11KKK17031203701', name: '更换选挡臂总成', laborType: '机电', custom: '否', hours: 40, note: '', unitPrice: 10, type: '品质改善', chargeType: '客户自费' },
  { id: 109, code: 'A11KKK81070173751', name: '更换分发器壳体总成', laborType: '机电', custom: '否', hours: 30, note: '不包括：拆装蒸发器总成', unitPrice: 10, type: 'GoodWill', chargeType: '索赔' },
  { id: 110, code: 'A11KKK79012273701', name: '更换遥控器', laborType: '机电', custom: '否', hours: 30, note: '包括：匹配', unitPrice: 6, type: '精品加装(装潢)', chargeType: '客户自费' },
]

const PART_PICKER_OPTIONS: PartPickerOption[] = [
  { id: 2001, tab: 'part', code: 'P-OIL-001', name: '全合成机油 5W-40', alias: '保养机油', vehicleModel: 'ARRIZO 8 / TIGGO 7 PRO', unitPrice: 120, retailPrice: 168, stock: 86, qty: 4, type: '保养' },
  { id: 2002, tab: 'part', code: 'P-FLT-001', name: '机油滤清器', alias: '机滤', vehicleModel: 'ARRIZO 8 / ARRIZO 6 PRO', unitPrice: 45, retailPrice: 68, stock: 132, qty: 1, type: '保养' },
  { id: 2003, tab: 'part', code: 'P-BRAKE-110', name: '前刹车片套装', alias: '前刹车片', vehicleModel: 'TIGGO 7 PRO', unitPrice: 380, retailPrice: 520, stock: 24, qty: 1, type: '维修' },
  { id: 2004, tab: 'part', code: 'P-BAT-301', name: '蓄电池 70Ah', alias: '蓄电池', vehicleModel: 'ARRIZO 8 / TIGGO 8', unitPrice: 560, retailPrice: 728, stock: 8, qty: 1, type: '维修' },
  { id: 2005, tab: 'part', code: 'P-ACF-205', name: '空调滤芯', alias: '空调滤芯', vehicleModel: 'ARRIZO 8', unitPrice: 88, retailPrice: 126, stock: 0, qty: 1, type: '保养' },
  { id: 2101, tab: 'kit', code: 'K-MNT-001', name: 'A 保养标准套件', alias: 'A 保养套件', vehicleModel: 'ARRIZO 8', unitPrice: 525, retailPrice: 699, stock: 15, qty: 1, type: '保养' },
  { id: 2102, tab: 'kit', code: 'K-AC-002', name: '空调养护套件', alias: '空调养护', vehicleModel: 'TIGGO 7 PRO / TIGGO 8', unitPrice: 228, retailPrice: 318, stock: 6, qty: 1, type: '保养' },
  { id: 2103, tab: 'kit', code: 'K-BRK-003', name: '制动系统养护套件', alias: '制动养护', vehicleModel: '全系通用', unitPrice: 318, retailPrice: 456, stock: 0, qty: 1, type: '服务活动' },
]

const REPAIR_PROJECT_PART_SUGGESTIONS: Record<number, number[]> = {
  101: [2004],
  103: [2003],
  104: [2004],
  105: [2005],
  106: [2001, 2002],
  107: [2002],
  110: [2004],
}

const DISPATCH_TEAM_OPTIONS = ['机电一组', '机电二组', '钣喷一组', '新能源专修组'] as const
const DISPATCH_TECHNICIAN_OPTIONS: Record<(typeof DISPATCH_TEAM_OPTIONS)[number], string[]> = {
  机电一组: ['张伟', '王强', '刘洋'],
  机电二组: ['赵明', '陈凯', '孙涛'],
  钣喷一组: ['李彬', '周锋', '钱浩'],
  新能源专修组: ['王强', '赵明', '刘洋'],
}

const buildDispatchAssignments = (order: WorkOrder): DispatchAssignment[] => {
  const baseTeam = order.isEV ? '新能源专修组' : order.repairType === '事故' ? '钣喷一组' : '机电一组'
  return [
    {
      projectName: order.repairType === '事故' ? '事故维修主项目' : `${order.repairType}主项目`,
      team: baseTeam,
      technician: order.technician,
    },
    {
      projectName: order.faultDesc.split('，')[0] || '故障诊断项目',
      team: baseTeam,
      technician: order.technician,
    },
  ]
}

type TechnicianAbility = '机电' | '钣金' | '喷漆' | '新能源' | '诊断'
type TechnicianBookingType = 'appointment' | 'job'
type TechnicianBooking = {
  id: string
  technicianId: string
  type: TechnicianBookingType
  startMinutes: number
  endMinutes: number
  label: string
}
type TechnicianResource = {
  id: string
  name: string
  abilities: TechnicianAbility[]
}

const TECHNICIAN_RESOURCES: TechnicianResource[] = [
  { id: 'tech-1', name: '张伟', abilities: ['机电', '诊断'] },
  { id: 'tech-2', name: '王强', abilities: ['机电', '新能源'] },
  { id: 'tech-3', name: '李彬', abilities: ['钣金', '喷漆'] },
  { id: 'tech-4', name: '周锋', abilities: ['喷漆'] },
  { id: 'tech-5', name: '赵明', abilities: ['机电', '新能源', '诊断'] },
  { id: 'tech-6', name: '陈凯', abilities: ['机电'] },
  { id: 'tech-7', name: '孙涛', abilities: ['机电'] },
  { id: 'tech-8', name: '钱浩', abilities: ['钣金'] },
]

const TECHNICIAN_BOOKINGS_DEFAULT: TechnicianBooking[] = [
  { id: 'bk-1', technicianId: 'tech-1', type: 'appointment', startMinutes: 8 * 60, endMinutes: 10 * 60 + 30, label: 'A0-051020' },
  { id: 'bk-2', technicianId: 'tech-2', type: 'job', startMinutes: 8 * 60, endMinutes: 11 * 60 + 6, label: 'WO-2026-0327-002' },
  { id: 'bk-3', technicianId: 'tech-3', type: 'appointment', startMinutes: 9 * 60, endMinutes: 11 * 60, label: 'A0-051018' },
  { id: 'bk-4', technicianId: 'tech-5', type: 'job', startMinutes: 13 * 60, endMinutes: 15 * 60 + 30, label: 'WO-2026-0327-007' },
  { id: 'bk-6', technicianId: 'tech-6', type: 'appointment', startMinutes: 14 * 60, endMinutes: 16 * 60, label: 'A0-051021' },
  { id: 'bk-7', technicianId: 'tech-7', type: 'job', startMinutes: 15 * 60 + 30, endMinutes: 18 * 60, label: 'WO-2026-0327-010' },
]

const TECHNICIAN_TIMELINE_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18] as const
const TECHNICIAN_TIMELINE_START_MIN = TECHNICIAN_TIMELINE_HOURS[0] * 60
const TECHNICIAN_TIMELINE_END_MIN = (TECHNICIAN_TIMELINE_HOURS[TECHNICIAN_TIMELINE_HOURS.length - 1] + 1) * 60
const TECHNICIAN_TIMELINE_TOTAL_MIN = TECHNICIAN_TIMELINE_END_MIN - TECHNICIAN_TIMELINE_START_MIN

function formatBookingTime(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const WORKORDER_DETAIL_STEPS = ['待确认', '待派工', '待完工', '待质检', '待结算', '待交车', '已交车'] as const

function getWorkOrderDetailStepIndex(status: WorkOrderStatus) {
  switch (status) {
    case 'draft':
    case 'inspecting':
    case 'diagnosing':
      return 0
    case 'pending':
    case 'rework':
      return 1
    case 'working':
    case 'self_check':
    case 'qc_fail':
      return 2
    case 'qc_wait':
      return 3
    case 'qc_pass':
    case 'settlement':
      return 4
    case 'delivery':
      return 5
    case 'done':
      return 6
    case 'cancel':
    default:
      return 0
  }
}

// ─── 公共组件 ────────────────────────────────────────────────────────────────

function StatusTag({ status }: { status: WorkOrderStatus }) {
  const s = STATUS_MAP[status]
  return <span className={`tag ${s.cls}`}>{s.label}</span>
}

function OnsiteStatusTag({ status }: { status: OnsiteServiceStatus }) {
  const s = ONSITE_STATUS_MAP[status]
  return <span className={`tag ${s.cls}`}>{s.label}</span>
}

function CellText({ value, className }: { value: React.ReactNode; className?: string }) {
  const title = typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
  return <span className={`cell-text-ellipsis${className ? ` ${className}` : ''}`} title={title}>{value}</span>
}

function DetailProgress({ status, timestamps }: { status: WorkOrderStatus; timestamps: Partial<Record<(typeof WORKORDER_DETAIL_STEPS)[number], string>> }) {
  const currentStep = getWorkOrderDetailStepIndex(status)

  return (
    <div className="detail-progress">
      {WORKORDER_DETAIL_STEPS.map((label, index) => {
        const state = index < currentStep ? 'done' : index === currentStep ? 'active' : 'pending'
        const time = timestamps[label]
        const timeLabel = state === 'done' ? '完成于' : state === 'active' ? '进入于' : ''
        return (
          <div key={label} className={`detail-progress-step is-${state}`}>
            <div className="detail-progress-node-wrap">
              <div className="detail-progress-node">
                {state === 'done' ? <Check size={16} strokeWidth={2.6} /> : state === 'active' ? <Clock3 size={16} strokeWidth={2.2} /> : null}
              </div>
              {index < WORKORDER_DETAIL_STEPS.length - 1 && <div className="detail-progress-line" />}
            </div>
            <div className="detail-progress-text">
              <div className="detail-progress-label">{label}</div>
              {time ? <div className="detail-progress-time">{timeLabel} {time}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OnsiteDetailProgress({ status, timestamps }: { status: OnsiteServiceStatus; timestamps: Partial<Record<OnsiteServiceStatus, string>> }) {
  const currentStep = Math.max(0, ONSITE_DETAIL_STEPS.findIndex(step => step.key === status))

  return (
    <div className="detail-progress">
      {ONSITE_DETAIL_STEPS.map((step, index) => {
        const state = index < currentStep ? 'done' : index === currentStep ? 'active' : 'pending'
        const time = timestamps[step.key]
        const timeLabel = state === 'done' ? '完成于' : state === 'active' ? '进入于' : ''
        return (
          <div key={step.key} className={`detail-progress-step is-${state}`}>
            <div className="detail-progress-node-wrap">
              <div className="detail-progress-node">
                {state === 'done' ? <Check size={16} strokeWidth={2.6} /> : state === 'active' ? <Clock3 size={16} strokeWidth={2.2} /> : null}
              </div>
              {index < ONSITE_DETAIL_STEPS.length - 1 && <div className="detail-progress-line" />}
            </div>
            <div className="detail-progress-text">
              <div className="detail-progress-label">{step.label}</div>
              {time ? <div className="detail-progress-time">{timeLabel} {time}</div> : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function SensitiveText({ value, maskedValue }: { value: string; maskedValue: string }) {
  const [visible, setVisible] = useState(false)
  const displayValue = visible ? value : maskedValue

  return (
    <span className="sensitive-text-wrap" title={displayValue}>
      <span className="cell-text-ellipsis sensitive-text-value">{displayValue}</span>
      <button
        type="button"
        className="sensitive-text-toggle"
        aria-label={visible ? '隐藏明文' : '查看明文'}
        title={visible ? '隐藏明文' : '查看明文'}
        onClick={() => setVisible(current => !current)}
      >
        {visible ? <EyeOff size={16} strokeWidth={1.9} /> : <Eye size={16} strokeWidth={1.9} />}
      </button>
    </span>
  )
}

function WorkOrderColumnFilterPopover({
  anchorEl,
  column,
  options,
  draft,
  onChangeKeyword,
  onToggleValue,
  onToggleAllVisible,
  onApply,
  onReset,
  onClose,
}: {
  anchorEl: HTMLElement | null
  column: WorkOrderColumn
  options: string[]
  draft: WorkOrderColumnFilterDraft
  onChangeKeyword: (value: string) => void
  onToggleValue: (value: string) => void
  onToggleAllVisible: (values: string[], checked: boolean) => void
  onApply: () => void
  onReset: () => void
  onClose: () => void
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const visibleOptions = filterColumnOptionsByKeyword(options, draft.keyword)
  const selectedSet = new Set(draft.selectedValues)
  const allVisibleSelected = visibleOptions.length > 0 && visibleOptions.every(option => selectedSet.has(option))
  const partialVisibleSelected = visibleOptions.some(option => selectedSet.has(option)) && !allVisibleSelected

  const updatePosition = () => {
    const rect = anchorEl?.getBoundingClientRect()
    if (!rect) return
    const popoverWidth = 440
    const left = Math.max(8, Math.min(window.innerWidth - popoverWidth - 8, rect.left - 16))
    setPosition({ top: rect.bottom + 8, left })
  }

  useEffect(() => {
    if (!anchorEl) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorEl])

  useEffect(() => {
    if (!anchorEl) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (anchorEl.contains(target) || popoverRef.current?.contains(target)) return
      onClose()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [anchorEl, onClose])

  if (!anchorEl) return null

  return createPortal(
    <div
      ref={popoverRef}
      className="column-filter-popover"
      style={{ top: position.top, left: position.left }}
    >
      <div className="column-filter-search">
        <Search size={16} strokeWidth={1.9} />
        <input
          value={draft.keyword}
          onChange={event => onChangeKeyword(event.target.value)}
          placeholder="请输入内容，可批量查询"
          aria-label={`${column.label}查询内容`}
        />
      </div>
      <button
        type="button"
        className="column-filter-option column-filter-option-all"
        onClick={() => onToggleAllVisible(visibleOptions, !allVisibleSelected)}
      >
        <span className={`column-filter-checkbox ${allVisibleSelected ? 'checked' : partialVisibleSelected ? 'mixed' : ''}`}>
          {allVisibleSelected ? <Check size={14} strokeWidth={2.5} /> : partialVisibleSelected ? '—' : null}
        </span>
        <span>全选</span>
      </button>
      <div className="column-filter-list">
        {visibleOptions.length > 0 ? visibleOptions.map(value => {
          const checked = selectedSet.has(value)
          return (
            <button
              key={value}
              type="button"
              className="column-filter-option"
              onClick={() => onToggleValue(value)}
              title={value}
            >
              <span className={`column-filter-checkbox ${checked ? 'checked' : ''}`}>
                {checked ? <Check size={14} strokeWidth={2.5} /> : null}
              </span>
              <span className="column-filter-value">{value}</span>
            </button>
          )
        }) : (
          <div className="column-filter-empty">暂无匹配数据</div>
        )}
      </div>
      <div className="column-filter-footer">
        <button type="button" className="btn btn-primary btn-sm" onClick={onApply}>筛选</button>
        <button type="button" className="btn btn-default btn-sm" onClick={onReset}>重置</button>
      </div>
    </div>,
    document.body,
  )
}

function MoreActionsDropdown({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const updateMenuPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const menuWidth = 160
    const menuHeight = Math.max(44, React.Children.count(children) * 36 + 8)
    const left = Math.max(8, Math.min(window.innerWidth - menuWidth - 8, rect.right - menuWidth))
    const shouldOpenUp = rect.bottom + 4 + menuHeight > window.innerHeight
    const top = shouldOpenUp ? Math.max(8, rect.top - menuHeight - 4) : rect.bottom + 4
    setMenuPosition({ top, left })
  }

  useEffect(() => {
    if (!isOpen) return
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen, children])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="more-actions-dropdown-wrap">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-text btn-sm"
        onClick={() => {
          updateMenuPosition()
          setIsOpen(current => !current)
        }}
      >
        更多
        <ChevronDown size={14} strokeWidth={2} />
      </button>
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="more-actions-dropdown-menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>,
        document.body,
      )}
    </div>
  )
}

function ColumnConfigGearIcon() {
  return (
    <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false" className="column-config-gear-icon">
      <path
        d="M512 981.333333a474.58 474.58 0 0 1-73.573333-5.74 53.466667 53.466667 0 0 1-44.58-60.44 106.706667 106.706667 0 0 0-171.513334-98.893333 53.566667 53.566667 0 0 1-38.666666 11.213333 52.6 52.6 0 0 1-35.666667-19.22 468.16 468.16 0 0 1-74.346667-128.306666c-10.4-27.046667 3.013333-57.746667 29.82-68.44A106.7 106.7 0 0 0 103.333333 413.2c-26.84-10.666667-40.286667-41.333333-29.966666-68.386667A468.126667 468.126667 0 0 1 147.44 216.4a53.233333 53.233333 0 0 1 74.16-8.286667 106.606667 106.606667 0 0 0 119.433333 8.366667 106.246667 106.246667 0 0 0 52.086667-107.42 53.566667 53.566667 0 0 1 9.62-39.173333 52.613333 52.613333 0 0 1 34.546667-21.3 474.34 474.34 0 0 1 147.893333-0.24 53.46 53.46 0 0 1 44.62 60.4A106.733333 106.733333 0 0 0 735.333333 230.306667a107.333333 107.333333 0 0 0 66.266667-22.973334 53.226667 53.226667 0 0 1 74.173333 8.093334 468.233333 468.233333 0 0 1 74.46 128.24c10.393333 27.04-2.973333 57.753333-29.793333 68.466666A106.166667 106.166667 0 0 0 853.333333 511.406667v0.593333a106.153333 106.153333 0 0 0 67.273334 99.153333c26.84 10.666667 40.26 41.333333 29.92 68.413334a468 468 0 0 1-74.22 128.346666 52.606667 52.606667 0 0 1-35.653334 19.253334 53.52 53.52 0 0 1-38.706666-11.18 106.226667 106.226667 0 0 0-119.246667-8.32 106.253333 106.253333 0 0 0-52.173333 107.373333 53.48 53.48 0 0 1-44.533334 60.486667A474.16 474.16 0 0 1 512 981.333333z m-223.6-230.506666a149.4 149.4 0 0 1 147.693333 170.293333 10.786667 10.786667 0 0 0 8.973334 12.326667 431.726667 431.726667 0 0 0 134.246666-0.06 10.786667 10.786667 0 0 0 8.973334-12.333334 149.373333 149.373333 0 0 1 240-138.666666c4.733333 3.706667 11.3 3.093333 14.946666-1.4a425.506667 425.506667 0 0 0 67.473334-116.666667 10.533333 10.533333 0 0 0-5.826667-13.526667A149.333333 149.333333 0 0 1 810.666667 512v-0.56a149.333333 149.333333 0 0 1 93.94-138.926667 10.526667 10.526667 0 0 0 5.8-13.54 425.62 425.62 0 0 0-67.686667-116.566666 10.566667 10.566667 0 0 0-14.666667-1.593334 149.333333 149.333333 0 0 1-167.193333 12.173334 149.333333 149.333333 0 0 1-73.306667-150.173334 10.78 10.78 0 0 0-8.98-12.313333 431.486667 431.486667 0 0 0-134.54 0.22c-5.726667 0.913333-9.533333 6.313333-8.666666 12.293333a149.333333 149.333333 0 0 1-240.1 138.666667 10.586667 10.586667 0 0 0-14.666667 1.62A425.18 425.18 0 0 0 113.2 360a10.52 10.52 0 0 0 5.833333 13.52 149.166667 149.166667 0 0 1 67.813334 53.946667 149.386667 149.386667 0 0 1 0.146666 169.633333 149.186667 149.186667 0 0 1-67.72 54.04 10.526667 10.526667 0 0 0-5.813333 13.533333 425.42 425.42 0 0 0 67.586667 116.666667c3.653333 4.486667 10.22 5.093333 14.953333 1.38A149.24 149.24 0 0 1 276.5 751.333333q5.96-0.506667 11.9-0.506666z m383.6 38.38zM512 640c-70.58 0-128-57.42-128-128s57.42-128 128-128 128 57.42 128 128-57.42 128-128 128z m0-213.333333a85.333333 85.333333 0 1 0 85.333333 85.333333 85.426667 85.426667 0 0 0-85.333333-85.333333z"
        fill="currentColor"
      />
    </svg>
  )
}

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
    list: ClipboardList,
    create: FilePlus2,
    onsite_service: BusFront,
    work: Wrench,
    history: CarFront,
    battery: Battery,
    template: Settings2,
    labor: ChartColumn,
  }

  const Icon = iconMap[name] || ClipboardList
  return <Icon size={size} strokeWidth={1.8} className="nav-icon" />
}

function Sidebar({ active, onNav }: { active: string; onNav: (key: string) => void }) {
  const menus = [
    { section: '维修业务', items: [
      { label: '工单列表', key: 'list' },
      { label: '创建工单', key: 'create' },
      { label: '上门服务', key: 'onsite_service' },
      { label: '委托书详情', key: 'work' },
    ]},
    { section: '车辆档案', items: [
      { label: '维修历史', key: 'history' },
      { label: '电池档案', key: 'battery' },
    ]},
    { section: '基础配置', items: [
      { label: '环检模板', key: 'template' },
      { label: '工时单价设置', key: 'labor' },
    ]},
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-brand-row" aria-label="CHERY 与 ODIN">
          <img src={cheryLogo} alt="CHERY" className="sidebar-logo-image" />
          <div className="sidebar-logo-odin-mark-wrap">
            <span className="sidebar-logo-odin-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="sidebar-logo-odin-text">ODIN</span>
          </div>
        </div>
      </div>
      <div className="sidebar-search">
        <div className="sidebar-search-shell">
          <input className="sidebar-search-input" placeholder="搜索" />
          <button className="sidebar-search-button" type="button" aria-label="搜索">
            <Search size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
      {menus.map(g => (
        <div key={g.section} className="sidebar-section">
          <div className="sidebar-section-title">{g.section}</div>
          {g.items.map(item => (
            <div key={item.key} className={`sidebar-item${active === item.key ? ' active' : ''}`}
              onClick={() => onNav(item.key)}>
              <span className="icon"><NavIcon name={item.key} /></span>
              {item.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Topbar() {
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <div className="topbar">
      <button className="workspace-back-button" type="button" aria-label="返回">
        <ChevronLeft size={18} strokeWidth={2.1} />
      </button>
      <div className="workspace-tabbar">
        {['工作台', '维修工单管理'].map((item, index) => (
          <div key={item} className={`workspace-tab ${index === 1 ? 'active' : ''}`}>
            <span>{item}</span>
            <button type="button" className="workspace-tab-close" aria-label={`关闭${item}`}>
              <X size={14} strokeWidth={2.1} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="topbar-tools">
        <button className="topbar-icon-button" type="button" aria-label="通知消息">
          <Bell size={16} strokeWidth={1.8} className="topbar-icon" />
          <span className="topbar-badge">20</span>
        </button>
        <div className="topbar-user-wrap">
          <button className="topbar-user" type="button" aria-label="当前登录账户" onClick={() => setShowUserMenu(current => !current)}>
            <span className="topbar-user-avatar">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="topbar-user-avatar-icon">
                <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Zm0 1.75c-4.18 0-7.5 2.58-7.5 5.75 0 .41.34.75.75.75h13.5a.75.75 0 0 0 .75-.75c0-3.17-3.32-5.75-7.5-5.75Z" fill="currentColor" />
              </svg>
            </span>
            <span className="topbar-user-name">王泓</span>
            <ChevronDown size={14} strokeWidth={1.8} className="topbar-caret" />
          </button>
          {showUserMenu && (
            <div className="topbar-user-menu">
              <button className="topbar-user-menu-item" type="button">
                <UserRound size={18} strokeWidth={1.9} />
                <span>个人中心</span>
              </button>
              <button className="topbar-user-menu-item" type="button">
                <LogOut size={18} strokeWidth={1.9} />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DateRangeField({
  label,
  start,
  end,
  startPlaceholder = '开始时间',
  endPlaceholder = '结束时间',
  onChangeStart,
  onChangeEnd,
  defaultOpen = false,
  stacked = false,
}: {
  label: string
  start: string
  end: string
  startPlaceholder?: string
  endPlaceholder?: string
  onChangeStart: (value: string) => void
  onChangeEnd: (value: string) => void
  defaultOpen?: boolean
  stacked?: boolean
}) {
  const initialDate = start || end || '2026-04-20'
  const [initialYear, initialMonth] = initialDate.split('-').map((part, index) => index < 2 ? Number(part) : 0)
  const [panelOpen, setPanelOpen] = useState(defaultOpen)
  const [activeEdge, setActiveEdge] = useState<'start' | 'end'>(end ? 'end' : 'start')
  const [baseMonth, setBaseMonth] = useState(getMonthMeta(initialYear, initialMonth))

  const leftMonth = baseMonth
  const rightMonth = shiftMonth(baseMonth.year, baseMonth.month, 1)

  const handleSelect = (value: string) => {
    if (activeEdge === 'start') {
      onChangeStart(value)
      if (end && end < value) onChangeEnd('')
      setActiveEdge('end')
      return
    }
    onChangeEnd(value)
    if (start && value < start) onChangeStart(value)
    setPanelOpen(false)
  }

  const renderMonth = (monthMeta: { year: number; month: number; label: string }) => {
    const days = buildCalendarDays(monthMeta.year, monthMeta.month)
    return (
      <div className="range-calendar-month">
        <div className="range-calendar-title">{monthMeta.label}</div>
        <div className="range-calendar-weekdays">
          {WEEKDAY_LABELS.map(day => <span key={day}>{day}</span>)}
        </div>
        <div className="range-calendar-days">
          {days.map(day => {
            const isSelected = day.value === start || day.value === end
            const inRange = Boolean(start && end && day.value > start && day.value < end)
            return (
              <button
                key={day.value}
                type="button"
                className={`range-calendar-day${day.inCurrentMonth ? '' : ' is-muted'}${isSelected ? ' is-selected' : ''}${inRange ? ' is-in-range' : ''}`}
                onClick={() => handleSelect(day.value)}
              >
                {day.day}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`advanced-filter-item${stacked ? ' advanced-filter-item--stacked' : ''}`} onMouseLeave={() => setPanelOpen(false)}>
      <label className="advanced-filter-label">{label}</label>
      <div className="range-picker-shell advanced-filter-control">
        <button type="button" className={`range-trigger${panelOpen ? ' is-open' : ''}`} onClick={() => setPanelOpen(true)}>
          <span
            className={`range-trigger-segment${activeEdge === 'start' ? ' is-active' : ''}`}
            onClick={event => {
              event.stopPropagation()
              setPanelOpen(true)
              setActiveEdge('start')
            }}
          >
            {formatDateDisplay(start, startPlaceholder)}
          </span>
          <span className="range-trigger-divider">到</span>
          <span
            className={`range-trigger-segment${activeEdge === 'end' ? ' is-active' : ''}`}
            onClick={event => {
              event.stopPropagation()
              setPanelOpen(true)
              setActiveEdge('end')
            }}
          >
            {formatDateDisplay(end, endPlaceholder)}
          </span>
          <CalendarDays size={16} strokeWidth={1.8} className="range-trigger-icon" />
        </button>

        {panelOpen && (
          <div className="range-picker-panel">
            <div className="range-picker-toolbar">
              <div className="range-picker-nav">
                <button type="button" className="range-nav-btn" onClick={() => setBaseMonth(current => shiftMonth(current.year, current.month, -12))}><ChevronsLeft size={16} /></button>
                <button type="button" className="range-nav-btn" onClick={() => setBaseMonth(current => shiftMonth(current.year, current.month, -1))}><ChevronLeft size={16} /></button>
              </div>
              <div className="range-picker-nav">
                <button type="button" className="range-nav-btn" onClick={() => setBaseMonth(current => shiftMonth(current.year, current.month, 1))}><ChevronRight size={16} /></button>
                <button type="button" className="range-nav-btn" onClick={() => setBaseMonth(current => shiftMonth(current.year, current.month, 12))}><ChevronsRight size={16} /></button>
              </div>
            </div>
            <div className="range-picker-calendars">
              {renderMonth(leftMonth)}
              {renderMonth(rightMonth)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 质检不通过弹框 ─────────────────────────────────────────────────────────

function QcRejectModal({
  order,
  onCancel,
  onConfirm,
}: {
  order: WorkOrder
  onCancel: () => void
  onConfirm: (items: QcRejectItem[], reason: string) => void
}) {
  const repairItems = useMemo(() => buildDetailRepairItems(order), [order])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [reasons, setReasons] = useState<Record<number, string>>({})
  const [overallReason, setOverallReason] = useState('')

  const toggleSelect = (id: number) => {
    setSelectedIds(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id])
  }

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      window.alert('请勾选至少一项不合格的维修项目')
      return
    }
    const missingReason = selectedIds.find(id => !((reasons[id] || '').trim()))
    if (missingReason !== undefined) {
      window.alert('请为每个不合格项目填写不合格原因')
      return
    }
    const items: QcRejectItem[] = selectedIds.map(id => {
      const found = repairItems.find(item => item.id === id)!
      return {
        itemId: found.id,
        itemCode: found.code,
        itemName: found.name,
        reason: (reasons[id] || '').trim(),
      }
    })
    onConfirm(items, overallReason.trim())
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ width: 720 }} onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          质检不通过 · {order.id}
          <button className="btn btn-text" onClick={onCancel} style={{ color: 'rgba(0,0,0,0.45)' }}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="modal-body">
          <div className="alert-banner" style={{ marginBottom: 12 }}>
            <AlertTriangle size={16} strokeWidth={1.9} className="status-warning" />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>请勾选不合格的维修项目，并填写不合格原因</div>
              <div>确认后工单状态将变更为"待完工"，进入返修队列；技师完成返修后可重新提交质检。</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>选择</th>
                <th style={{ width: 140 }}>项目编码</th>
                <th>项目名称</th>
                <th style={{ width: 280 }}>不合格原因</th>
              </tr>
            </thead>
            <tbody>
              {repairItems.map(item => {
                const checked = selectedIds.includes(item.id)
                return (
                  <tr key={item.id} style={{ background: checked ? 'rgba(255,77,79,0.08)' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleSelect(item.id)} />
                    </td>
                    <td style={{ color: 'rgba(0,0,0,0.65)' }}>{item.code}</td>
                    <td>{item.name}</td>
                    <td>
                      <input
                        className="form-input"
                        placeholder={checked ? '请填写不合格原因' : '勾选后填写'}
                        value={reasons[item.id] || ''}
                        disabled={!checked}
                        onChange={e => setReasons(current => ({ ...current, [item.id]: e.target.value }))}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="form-item" style={{ marginTop: 16 }}>
            <label className="form-label">质检备注（可选）</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="补充整体不合格说明，例如：复测电池容量低于交付标准，需重新评估"
              value={overallReason}
              onChange={e => setOverallReason(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>取消</button>
          <button className="btn btn-danger" onClick={handleConfirm}>
            确认质检不通过
          </button>
        </div>
      </div>
    </div>
  )
}


// ─── Tab1: 工单列表 ──────────────────────────────────────────────────────────

function Tab1List({
  orders,
  listScope = 'repair',
  onCreateOrder,
  onOpenDetail,
  onEditOrder,
  onOpenWarrantyReport,
  onLockOrder,
  onCompleteWork,
  onQcPass,
  onQcReject,
  onSettle,
  onAdvanceOnsiteStatus,
}: {
  orders: WorkOrder[]
  listScope?: WorkOrderListScope
  onCreateOrder: () => void
  onOpenDetail: (order: WorkOrder, mode?: 'detail' | 'delivery' | 'dispatch', shouldStartEditing?: boolean) => void
  onEditOrder?: (order: WorkOrder) => void
  onOpenWarrantyReport: (order: WorkOrder) => void
  onLockOrder: (orderId: string, actionType: WorkOrderActionType) => void
  onCompleteWork?: (orderId: string) => void
  onQcPass?: (orderId: string) => void
  onQcReject?: (order: WorkOrder) => void
  onSettle?: (orderId: string) => void
  onAdvanceOnsiteStatus?: (orderId: string) => void
}) {
  const [draftFilterStatus, setDraftFilterStatus] = useState<string>('all')
  const [draftFilters, setDraftFilters] = useState<WorkOrderAdvancedFilters>(DEFAULT_WORK_ORDER_FILTERS)
  const [appliedFilterStatus, setAppliedFilterStatus] = useState<string>('all')
  const [appliedFilters, setAppliedFilters] = useState<WorkOrderAdvancedFilters>(DEFAULT_WORK_ORDER_FILTERS)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showFilterConfig, setShowFilterConfig] = useState(false)
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [columnOrder, setColumnOrder] = useState<WorkOrderColumnKey[]>(WORK_ORDER_COLUMNS.map(column => column.key))
  const [visibleColumns, setVisibleColumns] = useState<WorkOrderColumnKey[]>(listScope === 'onsite' ? ONSITE_VISIBLE_COLUMN_KEYS : DEFAULT_VISIBLE_COLUMN_KEYS)
  const [frozenColumns, setFrozenColumns] = useState<WorkOrderColumnKey[]>(listScope === 'onsite' ? ONSITE_FROZEN_COLUMN_KEYS : DEFAULT_FROZEN_COLUMN_KEYS)
  const [draggingColumn, setDraggingColumn] = useState<WorkOrderColumnKey | null>(null)
  const [columnWidths, setColumnWidths] = useState<Record<WorkOrderColumnKey, number>>(DEFAULT_COLUMN_WIDTHS)
  const [resizingColumn, setResizingColumn] = useState<{ key: WorkOrderColumnKey; startX: number; startWidth: number } | null>(null)
  const [columnSort, setColumnSort] = useState<WorkOrderColumnSort | null>(null)
  const [columnFilters, setColumnFilters] = useState<Partial<Record<WorkOrderColumnKey, string[]>>>({})
  const [columnFilterDrafts, setColumnFilterDrafts] = useState<Partial<Record<WorkOrderColumnKey, WorkOrderColumnFilterDraft>>>({})
  const [openColumnFilter, setOpenColumnFilter] = useState<WorkOrderColumnKey | null>(null)
  const [copyToast, setCopyToast] = useState('')
  const columnFilterButtonRefs = useRef<Partial<Record<WorkOrderColumnKey, HTMLButtonElement | null>>>({})
  const [dispatchOrder, setDispatchOrder] = useState<WorkOrder | null>(null)
  const [dispatchAssignments, setDispatchAssignments] = useState<Record<string, DispatchAssignment[]>>({})
  const [onsitePickOrder, setOnsitePickOrder] = useState<WorkOrder | null>(null)
  const [warrantyAlertDialog, setWarrantyAlertDialog] = useState<{
    order: WorkOrder
    actionType: WorkOrderActionType
    onContinue: () => void
  } | null>(null)

  const scopedOrders = orders.map(order => normalizeWorkOrder(order)).filter(order => listScope === 'onsite' ? isOnsiteOrder(order) : !isOnsiteOrder(order))

  const statusOptions = listScope === 'onsite'
    ? [
        { value: 'all', label: '全部状态' },
        ...ONSITE_DETAIL_STEPS.map(step => ({ value: step.key, label: step.label })),
      ]
    : [
        { value: 'all', label: '全部状态' },
        { value: 'draft', label: '新建' },
        { value: 'to_submit', label: '待确认' },
        { value: 'pending', label: '待派工' },
        { value: 'working', label: '待完工' },
        { value: 'qc_wait', label: '待质检' },
        { value: 'delivery', label: '待交车' },
        { value: 'done', label: '已交车' },
      ]

  const updateFilter = <K extends keyof WorkOrderAdvancedFilters>(key: K, value: WorkOrderAdvancedFilters[K]) => {
    setDraftFilters(current => ({ ...current, [key]: value }))
  }

  const handleApplyFilters = () => {
    setAppliedFilterStatus(draftFilterStatus)
    setAppliedFilters(draftFilters)
  }

  const handleResetFilters = () => {
    setDraftFilterStatus('all')
    setDraftFilters(DEFAULT_WORK_ORDER_FILTERS)
    setAppliedFilterStatus('all')
    setAppliedFilters(DEFAULT_WORK_ORDER_FILTERS)
  }

  const baseFiltered = scopedOrders.filter(o => {
    if (listScope === 'onsite') {
      if (appliedFilterStatus !== 'all' && getOnsiteStatus(o) !== appliedFilterStatus) return false
    } else if (appliedFilterStatus === 'to_submit') {
      if (o.status !== 'inspecting' && o.status !== 'diagnosing') return false
    } else if (appliedFilterStatus !== 'all' && o.status !== appliedFilterStatus) {
      return false
    }
    if (appliedFilters.advisor && !containsText(o.advisor, appliedFilters.advisor)) return false
    if (appliedFilters.consignmentNo && !containsText(o.id, appliedFilters.consignmentNo)) return false
    if (appliedFilters.appointmentNo && !containsText(`YY-${o.id}`, appliedFilters.appointmentNo)) return false
    if (appliedFilters.brand && getWorkOrderBrand(o) !== appliedFilters.brand) return false
    if (appliedFilters.vin && !containsText(o.vin, appliedFilters.vin)) return false
    if (appliedFilters.plate && !containsText(o.plate, appliedFilters.plate)) return false
    if (appliedFilters.customerName && !containsText(o.owner, appliedFilters.customerName)) return false
    if (appliedFilters.senderPhone && !containsText(o.senderPhone.replace(/\D/g, ''), appliedFilters.senderPhone.replace(/\D/g, ''))) return false
    if (!withinDateRange(o.createdAt, appliedFilters.createdDateStart, appliedFilters.createdDateEnd)) return false
    if (!withinDateRange(o.completedReviewAt, appliedFilters.completedDateStart, appliedFilters.completedDateEnd)) return false
    if (!withinDateRange(o.settlementAt, appliedFilters.settlementDateStart, appliedFilters.settlementDateEnd)) return false
    if (!withinDateRange(o.confirmedStartAt, appliedFilters.confirmedStartDateStart, appliedFilters.confirmedStartDateEnd)) return false
    return true
  })

  const columnFiltered = baseFiltered.filter(order => (
    Object.entries(columnFilters).every(([key, values]) => {
      if (!values || values.length === 0) return true
      return values.includes(getWorkOrderColumnText(order, key as WorkOrderColumnKey))
    })
  ))

  const displayedRows = columnSort
    ? [...columnFiltered].sort((left, right) => {
        const result = compareColumnText(getWorkOrderColumnText(left, columnSort.key), getWorkOrderColumnText(right, columnSort.key))
        return columnSort.direction === 'asc' ? result : -result
      })
    : columnFiltered

  const stats = listScope === 'onsite'
    ? [
        { value: 'all', label: '全部', count: scopedOrders.length, cls: 'tag-draft' },
        ...ONSITE_DETAIL_STEPS.filter(step => ['dispatch', 'pick', 'depart', 'arrive', 'inspect', 'start', 'finish', 'qc', 'settlement', 'done'].includes(step.key)).map(step => ({
          value: step.key,
          label: step.label,
          count: scopedOrders.filter(o => getOnsiteStatus(o) === step.key).length,
          cls: ONSITE_STATUS_MAP[step.key].cls,
        })),
      ]
    : [
        { value: 'all', label: '全部', count: scopedOrders.length, cls: 'tag-draft' },
        { value: 'to_submit', label: '待确认', count: scopedOrders.filter(o => o.status === 'inspecting' || o.status === 'diagnosing').length, cls: 'tag-warning' },
        { value: 'pending', label: '待派工', count: scopedOrders.filter(o => o.status === 'pending').length, cls: 'tag-pending' },
        { value: 'working', label: '待完工', count: scopedOrders.filter(o => o.status === 'working' || o.status === 'qc_fail').length, cls: 'tag-working' },
        { value: 'qc_wait', label: '待质检', count: scopedOrders.filter(o => o.status === 'qc_wait').length, cls: 'tag-qc' },
        { value: 'settlement', label: '待结算', count: scopedOrders.filter(o => o.status === 'settlement' || o.status === 'qc_pass').length, cls: 'tag-done' },
        { value: 'delivery', label: '待交车', count: scopedOrders.filter(o => o.status === 'delivery').length, cls: 'tag-done' },
        { value: 'done', label: '已交车', count: scopedOrders.filter(o => o.status === 'done').length, cls: 'tag-done' },
      ]

  const orderedColumns = columnOrder
    .map(key => WORK_ORDER_COLUMNS.find(column => column.key === key))
    .filter((column): column is WorkOrderColumn => Boolean(column))

  const getColumnWidth = (columnKey: WorkOrderColumnKey) => Math.max(TABLE_COLUMN_MIN_WIDTH, columnWidths[columnKey] ?? DEFAULT_COLUMN_WIDTHS[columnKey])
  const activeColumns = orderedColumns.filter(column => visibleColumns.includes(column.key))
  const activeFrozenColumns = orderedColumns.filter(column => visibleColumns.includes(column.key) && frozenColumns.includes(column.key))

  const stickyOffsets = activeFrozenColumns.reduce<Record<string, number>>((acc, column, index) => {
    if (index === 0) {
      acc[column.key] = 0
      return acc
    }
    const previous = activeFrozenColumns[index - 1]
    acc[column.key] = acc[previous.key] + getColumnWidth(previous.key)
    return acc
  }, {})

  useEffect(() => {
    if (!resizingColumn) return

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.max(TABLE_COLUMN_MIN_WIDTH, resizingColumn.startWidth + (event.clientX - resizingColumn.startX))
      setColumnWidths(current => ({ ...current, [resizingColumn.key]: nextWidth }))
    }

    const handleMouseUp = () => setResizingColumn(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingColumn])

  useEffect(() => {
    if (openColumnFilter && !visibleColumns.includes(openColumnFilter)) {
      setOpenColumnFilter(null)
    }
  }, [openColumnFilter, visibleColumns])

  useEffect(() => {
    if (!copyToast) return
    const timer = window.setTimeout(() => setCopyToast(''), 1600)
    return () => window.clearTimeout(timer)
  }, [copyToast])

  const handleToggleColumn = (columnKey: WorkOrderColumnKey) => {
    setVisibleColumns(current => (
      current.includes(columnKey) ? current.filter(key => key !== columnKey) : [...current, columnKey]
    ))
  }

  const handleToggleFrozen = (columnKey: WorkOrderColumnKey) => {
    setFrozenColumns(current => {
      if (current.includes(columnKey)) {
        return current.filter(key => key !== columnKey)
      }
      return [...current, columnKey]
    })
    setVisibleColumns(current => current.includes(columnKey) ? current : [...current, columnKey])
  }

  const handleReorderColumn = (targetKey: WorkOrderColumnKey) => {
    if (!draggingColumn || draggingColumn === targetKey) return
    setColumnOrder(current => {
      const next = current.filter(key => key !== draggingColumn)
      const targetIndex = next.indexOf(targetKey)
      next.splice(targetIndex, 0, draggingColumn)
      return next
    })
  }

  const getColumnFilterOptions = (columnKey: WorkOrderColumnKey) => (
    Array.from(new Set(baseFiltered.map(order => getWorkOrderColumnText(order, columnKey)).filter(Boolean)))
      .sort(compareColumnText)
  )

  const getColumnFilterDraft = (columnKey: WorkOrderColumnKey): WorkOrderColumnFilterDraft => (
    columnFilterDrafts[columnKey] ?? {
      keyword: '',
      selectedValues: columnFilters[columnKey] ?? [],
    }
  )

  const updateColumnFilterDraft = (columnKey: WorkOrderColumnKey, patch: Partial<WorkOrderColumnFilterDraft>) => {
    setColumnFilterDrafts(current => {
      const previous = current[columnKey] ?? { keyword: '', selectedValues: columnFilters[columnKey] ?? [] }
      return { ...current, [columnKey]: { ...previous, ...patch } }
    })
  }

  const handleOpenColumnFilter = (columnKey: WorkOrderColumnKey) => {
    setColumnFilterDrafts(current => {
      if (current[columnKey]) return current
      return { ...current, [columnKey]: { keyword: '', selectedValues: columnFilters[columnKey] ?? [] } }
    })
    setOpenColumnFilter(current => current === columnKey ? null : columnKey)
  }

  const handleToggleColumnFilterValue = (columnKey: WorkOrderColumnKey, value: string) => {
    const draft = getColumnFilterDraft(columnKey)
    const selected = new Set(draft.selectedValues)
    if (selected.has(value)) selected.delete(value)
    else selected.add(value)
    updateColumnFilterDraft(columnKey, { selectedValues: Array.from(selected) })
  }

  const handleToggleColumnFilterValues = (columnKey: WorkOrderColumnKey, values: string[], checked: boolean) => {
    const draft = getColumnFilterDraft(columnKey)
    const selected = new Set(draft.selectedValues)
    values.forEach(value => {
      if (checked) selected.add(value)
      else selected.delete(value)
    })
    updateColumnFilterDraft(columnKey, { selectedValues: Array.from(selected) })
  }

  const handleApplyColumnFilter = (columnKey: WorkOrderColumnKey) => {
    const options = getColumnFilterOptions(columnKey)
    const draft = getColumnFilterDraft(columnKey)
    const keywordMatchedOptions = filterColumnOptionsByKeyword(options, draft.keyword)
    const selectedValues = draft.keyword.trim() && draft.selectedValues.length === 0
      ? keywordMatchedOptions
      : draft.selectedValues
    const normalizedValues = Array.from(new Set(selectedValues)).filter(value => options.includes(value))

    setColumnFilters(current => {
      const next = { ...current }
      if (normalizedValues.length === 0 || normalizedValues.length === options.length) {
        delete next[columnKey]
      } else {
        next[columnKey] = normalizedValues
      }
      return next
    })
    setOpenColumnFilter(null)
  }

  const handleResetColumnFilter = (columnKey: WorkOrderColumnKey) => {
    setColumnFilters(current => {
      const next = { ...current }
      delete next[columnKey]
      return next
    })
    setColumnFilterDrafts(current => ({ ...current, [columnKey]: { keyword: '', selectedValues: [] } }))
  }

  const handleToggleColumnSort = (columnKey: WorkOrderColumnKey) => {
    setColumnSort(current => {
      if (current?.key !== columnKey) return { key: columnKey, direction: 'asc' }
      if (current.direction === 'asc') return { key: columnKey, direction: 'desc' }
      return null
    })
  }

  const writeTextToClipboard = async (text: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  const handleCopyColumn = async (column: WorkOrderColumn) => {
    const text = displayedRows.map(order => getWorkOrderColumnText(order, column.key)).join('\n')
    try {
      await writeTextToClipboard(text)
      setCopyToast(`已复制${column.label}`)
    } catch {
      setCopyToast('复制失败')
    }
  }

  const currentDispatchRows = dispatchOrder
    ? (dispatchAssignments[dispatchOrder.id] ?? buildDispatchAssignments(dispatchOrder))
    : []
  const onsitePickParts = onsitePickOrder ? getWorkOrderPartItems(onsitePickOrder) : []
  const onsitePickShortageParts = getShortageParts(onsitePickParts)

  const handleConfirmOnsitePick = () => {
    if (!onsitePickOrder) return
    onAdvanceOnsiteStatus?.(onsitePickOrder.id)
    setOnsitePickOrder(null)
  }

  const handleOpenDispatch = (order: WorkOrder) => {
    if (order.status !== 'pending') return
    setDispatchOrder(order)
    setDispatchAssignments(current => (
      current[order.id] ? current : { ...current, [order.id]: buildDispatchAssignments(order) }
    ))
  }

  const handleChangeDispatchRow = (index: number, field: 'team' | 'technician', value: string) => {
    if (!dispatchOrder) return
    setDispatchAssignments(current => {
      const rows = current[dispatchOrder.id] ?? buildDispatchAssignments(dispatchOrder)
      const nextRows = rows.map((row, rowIndex) => {
        if (rowIndex !== index) return row
        if (field === 'team') {
          const technicians = DISPATCH_TECHNICIAN_OPTIONS[value as keyof typeof DISPATCH_TECHNICIAN_OPTIONS] ?? []
          return {
            ...row,
            team: value,
            technician: technicians.includes(row.technician) ? row.technician : (technicians[0] ?? ''),
          }
        }
        return { ...row, technician: value }
      })
      return { ...current, [dispatchOrder.id]: nextRows }
    })
  }

  const triggerOrderAction = (
    order: WorkOrder,
    actionType: WorkOrderActionType,
    onContinue: () => void,
  ) => {
    if (!order.warrantyAlert) {
      onContinue()
      return
    }
    if (isBlockingWarrantyAlert(order.warrantyAlert.level) && !isWarrantyLocked(order)) {
      onLockOrder(order.id, actionType)
    }
    setWarrantyAlertDialog({ order, actionType, onContinue })
  }

  const handleConfirmWarrantyAlert = () => {
    if (!warrantyAlertDialog) return
    const { onContinue } = warrantyAlertDialog
    setWarrantyAlertDialog(null)
    onContinue()
  }

  return (
    <div>
      {copyToast && <div className="workorder-copy-toast">{copyToast}</div>}

      {/* 查询栏 */}
      <div className="advanced-filter-card workorder-list-filter-card">
        <div className="advanced-filter-header">
          <div className="advanced-filter-title">查询条件</div>
        </div>

        <div className="advanced-filter-grid">
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">品牌：</label>
            <select className="form-select advanced-filter-control" value={draftFilters.brand} onChange={e => updateFilter('brand', e.target.value)}>
              <option value="">全部</option>
              <option value="奇瑞">奇瑞</option>
              <option value="星途">星途</option>
              <option value="捷途">捷途</option>
              <option value="iCAR">iCAR</option>
              <option value="FR">FR</option>
              <option value="它牌">它牌</option>
            </select>
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">VIN：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.vin} onChange={e => updateFilter('vin', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">车牌号：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.plate} onChange={e => updateFilter('plate', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">客户姓名：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.customerName} onChange={e => updateFilter('customerName', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">委托书编号：</label>
            <input className="form-input advanced-filter-control" placeholder="最多输入1000个，以回车隔开" value={draftFilters.consignmentNo} onChange={e => updateFilter('consignmentNo', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">预约单号：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.appointmentNo} onChange={e => updateFilter('appointmentNo', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">服务顾问：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.advisor} onChange={e => updateFilter('advisor', e.target.value)} />
          </div>
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">送修人手机号：</label>
            <input className="form-input advanced-filter-control" value={draftFilters.senderPhone} onChange={e => updateFilter('senderPhone', e.target.value)} />
          </div>
          {!showAdvancedFilters && (
            <div className="advanced-filter-inline-actions">
              <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>查询</button>
              <button className="btn btn-default btn-sm" onClick={handleResetFilters}>重置</button>
              <button className="advanced-filter-toggle" type="button" onClick={() => setShowAdvancedFilters(true)}>
                展开
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </div>

        {showAdvancedFilters && <div className="advanced-filter-grid">
          <DateRangeField
            label="开单日期："
            start={draftFilters.createdDateStart}
            end={draftFilters.createdDateEnd}
            onChangeStart={value => updateFilter('createdDateStart', value)}
            onChangeEnd={value => updateFilter('createdDateEnd', value)}
          />
          <DateRangeField
            label="完工时间："
            start={draftFilters.completedDateStart}
            end={draftFilters.completedDateEnd}
            onChangeStart={value => updateFilter('completedDateStart', value)}
            onChangeEnd={value => updateFilter('completedDateEnd', value)}
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
          />
          <DateRangeField
            label="结算日期："
            start={draftFilters.settlementDateStart}
            end={draftFilters.settlementDateEnd}
            onChangeStart={value => updateFilter('settlementDateStart', value)}
            onChangeEnd={value => updateFilter('settlementDateEnd', value)}
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
          />

          <DateRangeField
            label="确认开工日期："
            start={draftFilters.confirmedStartDateStart}
            end={draftFilters.confirmedStartDateEnd}
            onChangeStart={value => updateFilter('confirmedStartDateStart', value)}
            onChangeEnd={value => updateFilter('confirmedStartDateEnd', value)}
            startPlaceholder="开始日期"
            endPlaceholder="结束日期"
          />
          <div className="advanced-filter-item">
            <label className="advanced-filter-label">单据状态：</label>
            <select className="form-select advanced-filter-control" value={draftFilterStatus} onChange={e => setDraftFilterStatus(e.target.value)}>
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>}

        {showAdvancedFilters && <div className="advanced-filter-collapse-row">
          <button className="advanced-filter-toggle" type="button" onClick={() => setShowAdvancedFilters(false)}>
            收起
            <ChevronUp size={16} />
          </button>
        </div>}

        {showAdvancedFilters && <div className="advanced-filter-toolbar">
          <div className="advanced-filter-toolbar-left" />
          <div className="advanced-filter-toolbar-right">
            <button className="btn btn-primary btn-sm" onClick={handleApplyFilters}>查询</button>
            <button className="btn btn-default btn-sm" onClick={handleResetFilters}>重置</button>
            <button 
              className="btn btn-default btn-sm" 
              onClick={() => setShowFilterConfig(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              title="筛选条件配置"
            >
              <Settings2 size={14} />
            </button>
          </div>
        </div>}
      </div>

      {/* 筛选条件配置弹窗 */}
      {showFilterConfig && (
        <div className="modal-overlay" onClick={() => setShowFilterConfig(false)}>
          <div className="modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              筛选条件配置
              <button className="btn btn-text" onClick={() => setShowFilterConfig(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16, color: 'rgba(0,0,0,0.65)', fontSize: 13 }}>
                可以拖拽调整筛选条件的显示顺序，勾选控制显示/隐藏
              </div>
              <div style={{ border: '1px solid var(--border-light)', borderRadius: 4, padding: 12 }}>
                {[
                  { key: 'brand', label: '品牌' },
                  { key: 'vin', label: 'VIN' },
                  { key: 'plate', label: '车牌号' },
                  { key: 'customerName', label: '客户姓名' },
                  { key: 'consignmentNo', label: '委托书编号' },
                  { key: 'appointmentNo', label: '预约单号' },
                  { key: 'advisor', label: '服务顾问' },
                  { key: 'senderPhone', label: '送修人手机号' },
                  { key: 'series', label: '车系' },
                  { key: 'repairType', label: '维修类型' },
                  { key: 'status', label: '单据状态' },
                  { key: 'materialStatus', label: '领料状态' },
                  { key: 'createdDateRange', label: '开单日期' },
                  { key: 'estimatedDeliveryDateRange', label: '预计交车时间' },
                  { key: 'confirmedStartDateRange', label: '确认开工日期' },
                  { key: 'repairProjectCode', label: '维修项目编号' },
                ].map((filter, index) => (
                  <div
                    key={filter.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderBottom: index < 15 ? '1px solid var(--border-light)' : 'none',
                      cursor: 'move',
                      background: '#fff',
                    }}
                  >
                    <input
                      type="checkbox"
                      defaultChecked={index < 8}
                      style={{ marginRight: 12 }}
                    />
                    <span style={{ flex: 1, fontSize: 13 }}>{filter.label}</span>
                    <GripVertical size={16} style={{ color: 'rgba(0,0,0,0.25)' }} />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
                <button className="btn btn-default" onClick={() => setShowFilterConfig(false)}>取消</button>
                <button className="btn btn-primary" onClick={() => setShowFilterConfig(false)}>确定</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="list-card-header">
          <div className="list-card-title-wrap">
            <div className="list-card-title">{listScope === 'onsite' ? '上门服务工单列表' : '数据列表'}</div>
            <button
              className="column-config-trigger"
              onClick={() => setShowColumnConfig(true)}
              aria-label="字段配置"
              title="字段配置"
            >
              <ColumnConfigGearIcon />
            </button>
          </div>
          <div className="list-card-actions">
            <button className="btn btn-primary btn-sm" onClick={onCreateOrder}>+ {listScope === 'onsite' ? '创建上门工单' : '创建工单'}</button>
            <button className="btn btn-default btn-sm">导出</button>
          </div>
        </div>
        <div className="list-status-strip list-status-strip--tabs">
          {stats.map(s => (
            <button
              key={s.label}
              type="button"
              className={`list-status-tab ${appliedFilterStatus === s.value ? 'active' : ''}`}
              onClick={() => {
                setDraftFilterStatus(s.value)
                setAppliedFilterStatus(s.value)
              }}
            >
              <span>{s.label}</span>
              <strong>({s.count})</strong>
            </button>
          ))}
        </div>
        <div className="table-scroll-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {activeColumns.map(column => {
                  const isFrozen = frozenColumns.includes(column.key)
                  const sortDirection = columnSort?.key === column.key ? columnSort.direction : null
                  const isSorted = Boolean(sortDirection)
                  const hasColumnFilter = Boolean(columnFilters[column.key]?.length)
                  const columnFilterOptions = getColumnFilterOptions(column.key)
                  const columnFilterDraft = getColumnFilterDraft(column.key)
                  const stickyStyle = isFrozen
                    ? { position: 'sticky' as const, left: `${stickyOffsets[column.key] ?? 0}px`, zIndex: 3, minWidth: getColumnWidth(column.key), width: getColumnWidth(column.key) }
                    : { minWidth: getColumnWidth(column.key), width: getColumnWidth(column.key) }
                  return (
                    <th
                      key={column.key}
                      className={`${isFrozen ? 'sticky-column-header' : ''}${hasColumnFilter ? ' has-column-filter' : ''}`.trim() || undefined}
                      style={stickyStyle}
                    >
                      <div className="table-header-cell">
                        <span className="table-header-title">
                          <span className="cell-text-ellipsis" title={column.label}>{column.label}</span>
                          <button
                            type="button"
                            className="column-header-action"
                            title={`复制${column.label}`}
                            aria-label={`复制${column.label}`}
                            onClick={event => {
                              event.stopPropagation()
                              handleCopyColumn(column)
                            }}
                          >
                            <Copy size={14} strokeWidth={1.8} />
                          </button>
                        </span>
                        <span className="column-header-tools">
                          <button
                            type="button"
                            className={`column-header-action ${isSorted ? 'active' : ''}`}
                            title={sortDirection ? `${sortDirection === 'asc' ? '升序' : '降序'}排序` : '排序'}
                            aria-label={`${column.label}排序`}
                            onClick={event => {
                              event.stopPropagation()
                              handleToggleColumnSort(column.key)
                            }}
                          >
                            <ArrowUpDown size={14} strokeWidth={1.9} />
                          </button>
                          <button
                            ref={node => { columnFilterButtonRefs.current[column.key] = node }}
                            type="button"
                            className={`column-header-action ${hasColumnFilter || openColumnFilter === column.key ? 'active' : ''}`}
                            title={`${column.label}查询`}
                            aria-label={`${column.label}查询`}
                            onClick={event => {
                              event.stopPropagation()
                              handleOpenColumnFilter(column.key)
                            }}
                          >
                            <Filter size={14} strokeWidth={1.9} />
                          </button>
                          <span
                            className="column-resize-handle"
                            onMouseDown={event => {
                              event.preventDefault()
                              event.stopPropagation()
                              setResizingColumn({
                                key: column.key,
                                startX: event.clientX,
                                startWidth: getColumnWidth(column.key),
                              })
                            }}
                          />
                        </span>
                      </div>
                      {openColumnFilter === column.key && (
                        <WorkOrderColumnFilterPopover
                          anchorEl={columnFilterButtonRefs.current[column.key] ?? null}
                          column={column}
                          options={columnFilterOptions}
                          draft={columnFilterDraft}
                          onChangeKeyword={value => updateColumnFilterDraft(column.key, { keyword: value })}
                          onToggleValue={value => handleToggleColumnFilterValue(column.key, value)}
                          onToggleAllVisible={(values, checked) => handleToggleColumnFilterValues(column.key, values, checked)}
                          onApply={() => handleApplyColumnFilter(column.key)}
                          onReset={() => handleResetColumnFilter(column.key)}
                          onClose={() => setOpenColumnFilter(null)}
                        />
                      )}
                    </th>
                  )
                })}
                <th className="sticky-action-header" style={{ minWidth: ACTION_COLUMN_WIDTH, width: ACTION_COLUMN_WIDTH }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map(order => (
                <tr key={order.id}>
                  {activeColumns.map(column => {
                    const isFrozen = frozenColumns.includes(column.key)
                    const stickyStyle = isFrozen
                      ? { position: 'sticky' as const, left: `${stickyOffsets[column.key] ?? 0}px`, zIndex: 2, minWidth: getColumnWidth(column.key), width: getColumnWidth(column.key), background: '#fff' }
                      : { minWidth: getColumnWidth(column.key), width: getColumnWidth(column.key) }
                    return (
                      <td
                        key={column.key}
                        className={isFrozen ? 'sticky-column-cell' : undefined}
                        style={stickyStyle}
                      >
                        <div className="table-cell-inner">
                          {column.key === 'id' ? (
                            <button
                              className="text-link-button"
                              type="button"
                              onClick={() => triggerOrderAction(order, 'view', () => onOpenDetail(order))}
                            >
                              {column.render(order)}
                            </button>
                          ) : column.render(order)}
                        </div>
                      </td>
                    )
                  })}
                  <td className="sticky-action-cell" style={{ minWidth: ACTION_COLUMN_WIDTH, width: ACTION_COLUMN_WIDTH }}>
                    <div className="list-action-group">
                      <button
                        className="btn btn-text btn-sm"
                        onClick={() => triggerOrderAction(order, 'view', () => onOpenDetail(order))}
                      >
                        查看
                      </button>
                      {listScope === 'onsite' && getOnsiteStatus(order) === 'dispatch' && (
                        <button
                          className="btn btn-text btn-sm"
                          disabled={isWarrantyLocked(order)}
                          onClick={() => triggerOrderAction(order, 'dispatch', () => onOpenDetail(order, 'dispatch'))}
                        >
                          派车派工
                        </button>
                      )}
                      {listScope === 'onsite' && getOnsiteStatus(order) !== 'dispatch' && getOnsiteStatus(order) !== 'done' && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={isWarrantyLocked(order)}
                          onClick={() => triggerOrderAction(order, 'construction', () => {
                            if (getOnsiteStatus(order) === 'pick') {
                              setOnsitePickOrder(order)
                              return
                            }
                            onAdvanceOnsiteStatus?.(order.id)
                          })}
                        >
                          {getOnsiteActionLabel(getOnsiteStatus(order)) || '推进'}
                        </button>
                      )}
                      {listScope !== 'onsite' && (order.status === 'inspecting' || order.status === 'diagnosing') && (
                        <>
                          <button
                            className="btn btn-text btn-sm"
                            disabled={isWarrantyLocked(order)}
                            onClick={() => triggerOrderAction(order, 'view', () => onOpenDetail(order))}
                          >
                            上传已签单据
                          </button>
                          <MoreActionsDropdown>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'edit', () => {
                                onOpenDetail(order, 'detail', true)
                              })}
                            >
                              <Settings2 size={14} />
                              编辑
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {listScope !== 'onsite' && order.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-text btn-sm"
                            disabled={isWarrantyLocked(order)}
                            onClick={() => triggerOrderAction(order, 'dispatch', () => onOpenDetail(order, 'dispatch'))}
                          >
                            派工
                          </button>
                          <MoreActionsDropdown>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'edit', () => {
                                onOpenDetail(order, 'detail', true)
                              })}
                            >
                              <Settings2 size={14} />
                              编辑
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {listScope !== 'onsite' && order.status === 'working' && (
                        <>
                          <MoreActionsDropdown>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'edit', () => {
                                onOpenDetail(order, 'detail', true)
                              })}
                            >
                              <Settings2 size={14} />
                              编辑
                            </button>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'construction', () => onCompleteWork?.(order.id))}
                            >
                              <CheckCircle2 size={14} />
                              完工
                            </button>
                            <button className="dropdown-item">
                              <Printer size={14} />
                              打印工单
                            </button>
                            <button className="dropdown-item">
                              <ClipboardList size={14} />
                              查看派工记录
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {listScope !== 'onsite' && order.status === 'qc_wait' && (
                        <>
                          <MoreActionsDropdown>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'edit', () => {
                                onOpenDetail(order, 'detail', true)
                              })}
                            >
                              <Settings2 size={14} />
                              编辑
                            </button>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'construction', () => onQcPass?.(order.id))}
                            >
                              <ShieldCheck size={14} />
                              质检通过
                            </button>
                            <button
                              className="dropdown-item dropdown-item-danger"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'construction', () => onQcReject?.(order))}
                            >
                              <ShieldAlert size={14} />
                              质检不通过
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {listScope !== 'onsite' && order.status === 'delivery' && (
                        <>
                          <MoreActionsDropdown>
                            {order.settlementAt === '—' && (
                              <button
                                className="dropdown-item"
                                disabled={isWarrantyLocked(order)}
                                onClick={() => triggerOrderAction(order, 'delivery', () => onSettle?.(order.id))}
                              >
                                <Banknote size={14} />
                                结算
                              </button>
                            )}
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'delivery', () => onOpenDetail(order, 'delivery'))}
                            >
                              <CheckCircle2 size={14} />
                              交车
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {listScope !== 'onsite' && order.status === 'qc_fail' && (
                        <>
                          <button
                            className="btn btn-danger-text btn-sm"
                            disabled={isWarrantyLocked(order)}
                            onClick={() => triggerOrderAction(order, 'rework', () => onOpenDetail(order))}
                          >
                            返修
                          </button>
                          <MoreActionsDropdown>
                            <button
                              className="dropdown-item"
                              disabled={isWarrantyLocked(order)}
                              onClick={() => triggerOrderAction(order, 'edit', () => {
                                onOpenDetail(order, 'detail', true)
                              })}
                            >
                              <Settings2 size={14} />
                              编辑
                            </button>
                          </MoreActionsDropdown>
                        </>
                      )}
                      {isWarrantyLocked(order) && (
                        <span className="warranty-lock-note">
                          <Lock size={12} strokeWidth={2.2} />
                          已锁定
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0 16px' }}>
          <div className="pagination">
            <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13, marginRight: 8 }}>共 {displayedRows.length} 条</span>
            <div className="page-btn">‹</div>
            <div className="page-btn active">1</div>
            <div className="page-btn">2</div>
            <div className="page-btn">3</div>
            <div className="page-btn">›</div>
          </div>
        </div>
      </div>

      {showColumnConfig && (
        <div className="modal-overlay">
          <div className="modal column-config-modal">
            <div className="modal-header">
              字段配置
              <button className="btn btn-text" onClick={() => setShowColumnConfig(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body column-config-body">
              <div
                className={`freeze-dropzone ${draggingColumn ? 'active' : ''}`}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault()
                  if (!draggingColumn) return
                  setFrozenColumns(current => current.includes(draggingColumn) ? current : [...current, draggingColumn])
                  setVisibleColumns(current => current.includes(draggingColumn) ? current : [...current, draggingColumn])
                  setDraggingColumn(null)
                }}
              >
                <div className="freeze-dropzone-subtitle">
                  以上为冻结字段
                  {activeFrozenColumns.length > 0 ? `：${activeFrozenColumns.map(column => column.label).join('、')}` : ''}
                </div>
              </div>
              <div className="column-config-grid">
                {orderedColumns.map(column => {
                  const isVisible = visibleColumns.includes(column.key)
                  const isFrozen = frozenColumns.includes(column.key)
                  return (
                    <div
                      key={column.key}
                      className={`column-config-item ${isVisible ? '' : 'is-hidden'} ${isFrozen ? 'is-frozen' : ''}`}
                      draggable
                      onDragStart={() => setDraggingColumn(column.key)}
                      onDragOver={event => event.preventDefault()}
                      onDrop={event => {
                        event.preventDefault()
                        handleReorderColumn(column.key)
                        setDraggingColumn(null)
                      }}
                      onDragEnd={() => setDraggingColumn(null)}
                    >
                      <div className="column-config-main">
                        <GripVertical size={16} strokeWidth={1.8} />
                        <span>{column.label}</span>
                      </div>
                      <div className="column-config-actions">
                        <button className={`column-config-pin ${isFrozen ? 'active' : ''}`} onClick={() => handleToggleFrozen(column.key)}>
                          {isFrozen ? '已冻结' : '冻结'}
                        </button>
                        <button className="column-config-eye" onClick={() => handleToggleColumn(column.key)}>
                          {isVisible ? <Eye size={18} strokeWidth={1.8} /> : <EyeOff size={18} strokeWidth={1.8} />}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="freeze-dropzone freeze-dropzone-tail">
                <div className="freeze-dropzone-subtitle">以下为冻结表尾字段</div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-default"
                onClick={() => {
                  setColumnOrder(WORK_ORDER_COLUMNS.map(column => column.key))
                  setVisibleColumns(DEFAULT_VISIBLE_COLUMN_KEYS)
                  setFrozenColumns(DEFAULT_FROZEN_COLUMN_KEYS)
                  setColumnWidths(DEFAULT_COLUMN_WIDTHS)
                }}
              >
                恢复默认
              </button>
              <button className="btn btn-primary" onClick={() => setShowColumnConfig(false)}>完成</button>
            </div>
          </div>
        </div>
      )}

      {dispatchOrder && (
        <div className="modal-overlay" onClick={() => setDispatchOrder(null)}>
          <div className="modal" style={{ width: 980, maxWidth: 'calc(100vw - 48px)' }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              派工
              <button className="btn btn-text" onClick={() => setDispatchOrder(null)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="dispatch-modal-summary">
                <div className="dispatch-modal-summary-item">
                  <span>委托书编号</span>
                  <strong>{dispatchOrder.id}</strong>
                </div>
                <div className="dispatch-modal-summary-item">
                  <span>车牌号</span>
                  <strong>{dispatchOrder.plate}</strong>
                </div>
                <div className="dispatch-modal-summary-item">
                  <span>客户姓名</span>
                  <strong>{dispatchOrder.owner}</strong>
                </div>
                <div className="dispatch-modal-summary-item">
                  <span>维修类型</span>
                  <strong>{dispatchOrder.repairType}</strong>
                </div>
              </div>

              <div className="dispatch-modal-table-wrap">
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 260 }}>维修项目</th>
                      <th style={{ minWidth: 180 }}>班组</th>
                      <th style={{ minWidth: 220 }}>主责任技师</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentDispatchRows.map((row, index) => {
                      const technicians = DISPATCH_TECHNICIAN_OPTIONS[row.team as keyof typeof DISPATCH_TECHNICIAN_OPTIONS] ?? []
                      return (
                        <tr key={`${dispatchOrder.id}-${index}`}>
                          <td>{row.projectName}</td>
                          <td>
                            <select className="form-select" value={row.team} onChange={event => handleChangeDispatchRow(index, 'team', event.target.value)}>
                              {DISPATCH_TEAM_OPTIONS.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select className="form-select" value={row.technician} onChange={event => handleChangeDispatchRow(index, 'technician', event.target.value)}>
                              {technicians.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setDispatchOrder(null)}>取消</button>
              <button className="btn btn-primary" onClick={() => setDispatchOrder(null)}>保存派工</button>
            </div>
          </div>
        </div>
      )}

      {onsitePickOrder && (
        <div className="modal-overlay" onClick={() => setOnsitePickOrder(null)}>
          <div className="modal" style={{ width: 760 }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              上门领料确认
              <button className="btn btn-text" onClick={() => setOnsitePickOrder(null)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="dispatch-modal-summary" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div className="dispatch-modal-summary-item">
                  <span>委托书编号</span>
                  <strong>{onsitePickOrder.id}</strong>
                </div>
                <div className="dispatch-modal-summary-item">
                  <span>上门地址</span>
                  <strong>{onsitePickOrder.onsiteAddress || '待补充上门地址'}</strong>
                </div>
                <div className="dispatch-modal-summary-item">
                  <span>服务车辆</span>
                  <strong>{onsitePickOrder.serviceVehicleCode ? `${onsitePickOrder.serviceVehicleCode} / ${onsitePickOrder.serviceVehiclePlate || '—'}` : '待派车'}</strong>
                </div>
              </div>
              {onsitePickShortageParts.length > 0 && (
                <div className="alert-banner" style={{ marginBottom: 12 }}>
                  <AlertTriangle size={16} strokeWidth={1.9} className="status-warning" />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>存在缺料备件</div>
                    <div>缺料备件已同步缺件单，确认领料后单据仍可进入待出发。</div>
                  </div>
                </div>
              )}
              <table className="data-table">
                <thead>
                  <tr>
                    <th>备件编号</th>
                    <th>备件名称</th>
                    <th>需求数量</th>
                    <th>可用库存</th>
                    <th>领料结果</th>
                  </tr>
                </thead>
                <tbody>
                  {onsitePickParts.length > 0 ? onsitePickParts.map(part => {
                    const stock = getPartStock(part)
                    const shortage = stock < part.qty || part.shortageSynced
                    return (
                      <tr key={part.code}>
                        <td>{part.code}</td>
                        <td>{part.name}</td>
                        <td>{part.qty}</td>
                        <td>{stock}</td>
                        <td><span className={`tag ${shortage ? 'tag-warning' : 'tag-done'}`}>{shortage ? '缺料待补' : '可领取'}</span></td>
                      </tr>
                    )
                  }) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>当前工单无已确认备件，可直接确认无需领料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setOnsitePickOrder(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleConfirmOnsitePick}>{onsitePickShortageParts.length > 0 ? '缺料仍确认领料' : '确认领料'}</button>
            </div>
          </div>
        </div>
      )}

      {warrantyAlertDialog?.order.warrantyAlert && (
        <div className="modal-overlay">
          <div className="modal warranty-alert-modal">
            <div className="modal-header">
              三包预警提醒
              <button className="btn btn-text" onClick={() => setWarrantyAlertDialog(null)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className={`warranty-alert-summary ${isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level) ? 'is-blocking' : ''}`}>
                <div className="warranty-alert-summary-icon">
                  {isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level)
                    ? <Lock size={18} strokeWidth={2.1} />
                    : <AlertTriangle size={18} strokeWidth={2.1} />
                  }
                </div>
                <div className="warranty-alert-summary-copy">
                  <div className="warranty-alert-summary-title">
                    {isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level)
                      ? '高等级三包预警，工单已锁定'
                      : '提醒级三包预警，确认后可继续处理'}
                  </div>
                  <div className="warranty-alert-summary-subtitle">
                    {warrantyAlertDialog.order.id} · {warrantyAlertDialog.order.plate} · {warrantyAlertDialog.order.owner}
                  </div>
                </div>
                <span className={`tag ${isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level) ? 'tag-fail' : 'tag-warning'}`}>
                  {getWarrantyAlertLabel(warrantyAlertDialog.order.warrantyAlert.level)}
                </span>
              </div>

              <div className="warranty-alert-panel">
                <div className="warranty-alert-row">
                  <span>预警编码</span>
                  <strong>{warrantyAlertDialog.order.warrantyAlert.code}</strong>
                </div>
                <div className="warranty-alert-row">
                  <span>预警标题</span>
                  <strong>{warrantyAlertDialog.order.warrantyAlert.title}</strong>
                </div>
                <div className="warranty-alert-row">
                  <span>触发原因</span>
                  <strong>{warrantyAlertDialog.order.warrantyAlert.reason}</strong>
                </div>
                <div className="warranty-alert-row">
                  <span>处理建议</span>
                  <strong>{warrantyAlertDialog.order.warrantyAlert.guidance}</strong>
                </div>
                <div className="warranty-alert-row">
                  <span>当前策略</span>
                  <strong>
                    {isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level)
                      ? '系统已锁定当前工单，派工、交车、返修等业务动作不可继续，可查看委托书详情或跳转至三包预警报告。'
                      : `确认后允许继续${WORK_ORDER_ACTION_LABELS[warrantyAlertDialog.actionType]}。`
                    }
                  </strong>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isBlockingWarrantyAlert(warrantyAlertDialog.order.warrantyAlert.level) ? (
                <>
                  <button className="btn btn-default" onClick={() => setWarrantyAlertDialog(null)}>关闭</button>
                  <button
                    className="btn btn-default"
                    onClick={() => {
                      const order = warrantyAlertDialog.order
                      setWarrantyAlertDialog(null)
                      onOpenDetail(order)
                    }}
                  >
                    查看委托书详情
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      const order = warrantyAlertDialog.order
                      setWarrantyAlertDialog(null)
                      onOpenWarrantyReport(order)
                    }}
                  >
                    查看预警报告
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-default" onClick={() => setWarrantyAlertDialog(null)}>取消</button>
                  <button className="btn btn-primary" onClick={handleConfirmWarrantyAlert}>
                    {`继续${WORK_ORDER_ACTION_LABELS[warrantyAlertDialog.actionType]}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const OWNER_TYPE_OPTIONS = ['个人', '企业', '事业'] as const
const CREATE_ORDER_TYPE_OPTIONS = ['维修', '保养', '事故', '品质改善']
const CREATE_ADVISOR_OPTIONS = ['李顾问', '王顾问', '张顾问']
const PRINCIPAL_TECHNICIAN_OPTIONS = ['张伟', '王强', '李明', '刘洋', '赵明']
const RELATED_DOC_TYPE_OPTIONS = ['取送车', '道路救援', '其他'] as const

function workstationFromTechnicianId(technicianId: string) {
  const suffix = technicianId.replace(/^tech-?/i, '').toUpperCase()
  return suffix ? `工位-${suffix}` : '工位-A1'
}

function applyDispatchWritebackToRepairItems(
  repairItems: RepairItem[] | undefined,
  dispatchInfo: WorkOrderDispatchInfo,
): RepairItem[] {
  const items = (repairItems ?? []).map(item => ({ ...item }))
  if (!items.length) return items

  let matchedAny = false
  dispatchInfo.assignments.forEach(assignment => {
    assignment.projects.forEach(projectName => {
      items.forEach(item => {
        const hit = item.name === projectName
          || projectName.includes(item.name)
          || item.name.includes(projectName)
        if (!hit) return
        matchedAny = true
        item.assignedTechnician = assignment.technicianName
        item.workstation = workstationFromTechnicianId(assignment.technicianId)
        item.isDispatched = true
      })
    })
  })

  if (!matchedAny && dispatchInfo.assignments[0]) {
    const primary = dispatchInfo.assignments[0]
    items.forEach(item => {
      item.assignedTechnician = primary.technicianName
      item.workstation = workstationFromTechnicianId(primary.technicianId)
      item.isDispatched = true
    })
  }

  return items
}

function applyMaterialPickWriteback(
  partItems: PartItem[] | undefined,
  issuer = '李明',
  receiver = '—',
): PartItem[] {
  const issuedAt = formatRuntimeDateTime()
  return (partItems ?? []).map(part => ({
    ...part,
    isPicked: true,
    issuer,
    receiver,
    issuedAt,
  }))
}

function calcDiscountSummary(repairItems: RepairItem[], partItems: PartItem[] = []) {
  const repairDiscount = repairItems.reduce((sum, item) => {
    if (item.customHours) return sum
    const original = item.unitPrice * item.hours
    return sum + Math.max(0, original - item.fee)
  }, 0)
  const partDiscount = partItems.reduce((sum, item) => {
    const original = item.unitPrice * item.qty
    return sum + Math.max(0, original - item.fee)
  }, 0)
  return repairDiscount + partDiscount
}

function formatDetailFieldValue(value: string | number | boolean | undefined | null) {
  if (value === undefined || value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? '是' : '否'
  return String(value)
}

function YesNoRadioGroup({
  name,
  value,
  onChange,
}: {
  name: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
      {([true, false] as const).map(option => (
        <label key={String(option)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
          <input type="radio" name={name} checked={value === option} onChange={() => onChange(option)} />
          {option ? '是' : '否'}
        </label>
      ))}
    </div>
  )
}

function formatPhoneEmailInput(phone?: string, email?: string) {
  return formatPhoneEmailDetail(phone, email) ?? ''
}

function parsePhoneEmailInput(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return { phone: '', email: '' }
  const segments = trimmed.split(/\s*\/\s*/).map(part => part.trim()).filter(Boolean)
  if (segments.length >= 2) {
    const emailPart = segments.find(part => part.includes('@')) ?? segments[segments.length - 1]
    const phonePart = segments.find(part => part !== emailPart) ?? ''
    return { phone: phonePart, email: emailPart }
  }
  if (trimmed.includes('@')) {
    return { phone: '', email: trimmed }
  }
  return { phone: trimmed, email: '' }
}

function formatPhoneEmailDetail(phone?: string, email?: string) {
  const parts = [phone, email].filter(part => part && part !== '—')
  return parts.length ? parts.join(' / ') : undefined
}

function PhoneEmailFormItem({
  label,
  phone,
  email,
  onPhoneChange,
  onEmailChange,
  placeholder = '请输入电话 / 邮箱',
}: {
  label: React.ReactNode
  phone: string
  email: string
  onPhoneChange: (value: string) => void
  onEmailChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div className="form-item">
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        value={formatPhoneEmailInput(phone, email)}
        onChange={event => {
          const parsed = parsePhoneEmailInput(event.target.value)
          onPhoneChange(parsed.phone)
          onEmailChange(parsed.email)
        }}
        placeholder={placeholder}
      />
    </div>
  )
}

type FeeChargeSummary = { self: number; warranty: number; insurance: number; internal: number }

function FeeSummaryPanel({
  laborTotal,
  partsTotal,
  otherFeeTotal,
  discountSummary,
  total,
  chargeSummary,
}: {
  laborTotal: number
  partsTotal: number
  otherFeeTotal: number
  discountSummary: number
  total: number
  chargeSummary: FeeChargeSummary
}) {
  const formatMoney = (value: number) => `¥${Math.round(value).toLocaleString()}`

  return (
    <div className="fee-summary-panel">
      <div className="fee-summary-main">
        <div className="fee-item">
          <div className="fee-label">工时费</div>
          <div className="fee-value">{formatMoney(laborTotal)}</div>
        </div>
        <div className="fee-item">
          <div className="fee-label">备件费</div>
          <div className="fee-value">{formatMoney(partsTotal)}</div>
        </div>
        <div className="fee-item">
          <div className="fee-label">其他费用</div>
          <div className="fee-value">{formatMoney(otherFeeTotal)}</div>
        </div>
        <div className="fee-item">
          <div className="fee-label">折扣汇总</div>
          <div className="fee-value">-{formatMoney(discountSummary)}</div>
        </div>
        <div className="fee-item fee-item--total">
          <div className="fee-label">预估总额</div>
          <div className="fee-value">{formatMoney(total)}</div>
        </div>
      </div>
      <div className="fee-summary-breakdown">
        <span>保险合计 {formatMoney(chargeSummary.insurance)}</span>
        <span>索赔合计 {formatMoney(chargeSummary.warranty)}</span>
        <span>内结合计 {formatMoney(chargeSummary.internal)}</span>
        <span>客户自费 {formatMoney(chargeSummary.self)}</span>
      </div>
    </div>
  )
}

function DetailFieldGrid({ fields }: { fields: Array<[string, string | number | boolean | undefined | null]> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {fields.map(([label, value]) => (
        <div className="form-item" key={label}>
          <label className="form-label">{label}</label>
          <input
            className="form-input"
            readOnly
            value={formatDetailFieldValue(value)}
            style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }}
          />
        </div>
      ))}
    </div>
  )
}

function enrichRepairItemsFromDispatch(repairItems: RepairItem[], dispatchInfo?: WorkOrderDispatchInfo): RepairItem[] {
  if (!dispatchInfo?.assignments.length) return repairItems
  return repairItems.map(item => {
    if (item.assignedTechnician) return item
    const match = dispatchInfo.assignments.find(assignment =>
      assignment.projects.some(projectName =>
        projectName === item.name || projectName.includes(item.name) || item.name.includes(projectName),
      ),
    )
    if (!match) return item
    return {
      ...item,
      assignedTechnician: match.technicianName,
      workstation: workstationFromTechnicianId(match.technicianId),
      isDispatched: true,
    }
  })
}

function buildDetailPartItems(workOrder: WorkOrder): PartItem[] {
  const fallback: PartItem[] = [
    { id: 1, name: '全合成机油 5W-40', code: 'P-OIL-001', unitPrice: 120, qty: 4, discountRate: 100, fee: 480, type: '保养', chargeType: '客户自费' },
    { id: 2, name: '机油滤清器', code: 'P-FLT-001', unitPrice: 45, qty: 1, discountRate: 100, fee: 45, type: '保养', chargeType: '客户自费' },
  ]
  const base = workOrder.partItems?.length ? workOrder.partItems : fallback
  return base.map(part => {
    if (!part.isPicked || (part.issuer && part.receiver)) return part
    return {
      ...part,
      discountRate: part.discountRate ?? 100,
      issuer: part.issuer || '李明',
      receiver: part.receiver || workOrder.technician || '—',
      issuedAt: part.issuedAt || workOrder.dispatchedAt || workOrder.confirmedStartAt,
    }
  })
}

// ─── Tab2: 创建工单 ──────────────────────────────────────────────────────────

function Tab2Create({
  existingOrders,
  initialServiceType = 'self_drive',
  onSubmitSuccess,
}: {
  existingOrders: WorkOrder[]
  initialServiceType?: ServiceTypeValue
  onSubmitSuccess?: (order: WorkOrder) => void
}) {
  const [plate, setPlate] = useState('')
  const [serviceType, setServiceType] = useState<ServiceTypeValue>(initialServiceType)
  const [onsiteAddress, setOnsiteAddress] = useState('')
  const [meterReplaced, setMeterReplaced] = useState<'是' | '否'>('否')
  const [meterReplaceMileage, setMeterReplaceMileage] = useState('')
  const [telemetryValues, setTelemetryValues] = useState({
    totalMileage: '',
    hevMileage: '',
    fuelMileage: '',
    fuelLevel: '',
    batteryLevel: '',
  })
  const [faultDesc, setFaultDesc] = useState('')
  const [repairPlan, setRepairPlan] = useState('')
  const [vinQuery, setVinQuery] = useState('')
  const [showRepairProjectPicker, setShowRepairProjectPicker] = useState(false)
  const [repairProjectCodeFilter, setRepairProjectCodeFilter] = useState('')
  const [repairProjectNameFilter, setRepairProjectNameFilter] = useState('')
  const [repairProjectPartNameFilter, setRepairProjectPartNameFilter] = useState('')
  const [repairProjectPartCodeFilter, setRepairProjectPartCodeFilter] = useState('')
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [repairProjectPartSelection, setRepairProjectPartSelection] = useState<Record<number, Record<number, { checked: boolean; qty: number }>>>({})
  const [showPartPicker, setShowPartPicker] = useState(false)
  const [partPickerTab, setPartPickerTab] = useState<'part' | 'kit'>('part')
  const [partPriceMinFilter, setPartPriceMinFilter] = useState('')
  const [partPriceMaxFilter, setPartPriceMaxFilter] = useState('')
  const [partCodeFilter, setPartCodeFilter] = useState('')
  const [partNameFilter, setPartNameFilter] = useState('')
  const [partAliasFilter, setPartAliasFilter] = useState('')
  const [partVehicleFilter, setPartVehicleFilter] = useState('')
  const [hideZeroStock, setHideZeroStock] = useState(true)
  const [showUnifiedPicker, setShowUnifiedPicker] = useState(false)
  const [unifiedPickerTab, setUnifiedPickerTab] = useState<'project' | 'part'>('project')
  const [showRepairPackageModal, setShowRepairPackageModal] = useState(false)
  const [packageTemplateType, setPackageTemplateType] = useState('')
  const [packageTemplateName, setPackageTemplateName] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [packageCreateDateStart, setPackageCreateDateStart] = useState('')
  const [packageCreateDateEnd, setPackageCreateDateEnd] = useState('')
  
  const selectedPackageTemplate = useMemo(
    () => REPAIR_PACKAGE_TEMPLATES.find(template => template.id === selectedPackageId) ?? null,
    [selectedPackageId],
  )

  const [pickerBatchDiscount, setPickerBatchDiscount] = useState<string>('')
  const [pickerBatchRepairType, setPickerBatchRepairType] = useState<string>('')
  const [pickerBatchChargeType, setPickerBatchChargeType] = useState<string>('')
  const [showSensitivePartInfo, setShowSensitivePartInfo] = useState(false)
  const [selectedPartPickerIds, setSelectedPartPickerIds] = useState<number[]>([])
  const [showVehicleLookup, setShowVehicleLookup] = useState(false)
  const [lookupMode, setLookupMode] = useState<'store' | 'precise'>('store')
  const [lookupVin, setLookupVin] = useState('')
  const [lookupPlate, setLookupPlate] = useState('')
  const [lookupEngineLastSix, setLookupEngineLastSix] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('vehicle-1')
  const [lookupErrors, setLookupErrors] = useState<{ vin?: string; engineLastSix?: string }>({})
  const [showBusinessPermissionModal, setShowBusinessPermissionModal] = useState(false)
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null)
  const [showVehicleHistory, setShowVehicleHistory] = useState(false)
  const [showVehicleArchiveModal, setShowVehicleArchiveModal] = useState(false)
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(APPOINTMENT_RECORDS[0]?.id ?? '')
  const [linkedAppointment, setLinkedAppointment] = useState<AppointmentRecord | null>(null)
  const [showVehicleInsightsModal, setShowVehicleInsightsModal] = useState(false)
  const [showOwnerVehicleEditModal, setShowOwnerVehicleEditModal] = useState(false)
  const [vehicleInsightsTab, setVehicleInsightsTab] = useState<'appointment' | 'rights' | 'campaign' | 'suggestion'>('appointment')
  const [vehicleInsightsModalMode, setVehicleInsightsModalMode] = useState<'full' | 'single'>('full') // full: 显示所有tab可切换, single: 只显示当前tab
  const [showVehicleTagDetails, setShowVehicleTagDetails] = useState(false)
  const [expandedRepairSuggestionIds, setExpandedRepairSuggestionIds] = useState<number[]>([])
  const [includeVehicleRights, setIncludeVehicleRights] = useState(true)
  const [showBatteryAlert, setShowBatteryAlert] = useState(false)
  const [openChargeTypeDropdownKey, setOpenChargeTypeDropdownKey] = useState<string | null>(null)
  const [openChargeSplitEditorKey, setOpenChargeSplitEditorKey] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null)
  const [pendingShortageSubmitOrder, setPendingShortageSubmitOrder] = useState<WorkOrder | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [customerConfirmed, setCustomerConfirmed] = useState(false)
  const [customerConfirmAt, setCustomerConfirmAt] = useState<string>('')
  const [draftAttachments, setDraftAttachments] = useState<Array<{ id: number; name: string; sizeKB: number }>>([])
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([])
  const [selectedQualityImprovementIds, setSelectedQualityImprovementIds] = useState<number[]>([])
  const [nextCustomItemId, setNextCustomItemId] = useState(10000) // 用于生成自定义工时的唯一ID
  const [draftOrderId] = useState(() => buildNextWorkOrderId(existingOrders))
  const [createForm, setCreateForm] = useState({
    ownerType: '个人' as (typeof OWNER_TYPE_OPTIONS)[number],
    ownerName: '郭富贵',
    ownerPhone: '13525253744',
    ownerEmail: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    sender: '郭富贵',
    senderPhone: '13525253744',
    senderEmail: '',
    brand: '奇瑞',
    series: 'ARRIZO 8',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 高能版',
    configuration: '豪华版',
    exteriorColor: '曜石黑',
    interiorColor: '黑色',
    plate: '浙B·0L34B',
    vin: 'KW293B1283928372',
    engineNo: 'SQR481F-2B12345',
    gearboxNo: 'CVT25-8921',
    mileage: '28391',
    totalMileage: '28391',
    replacedMileage: '',
    saleDate: '2024-09-16',
    nextMaintenanceDate: '2026-09-16',
    warrantyExpireDate: '2029-09-16',
    insuranceExpireDate: '2026-12-31',
    insuranceCompany: '人保财险',
    isThreePack: false,
    repairType: '维修',
    advisor: '李顾问',
    estimatedDeliveryAt: '2026-03-27T17:00',
    isPickupDelivery: false,
    principalTechnician: '',
  })
  const defaultLookupVehicle = VEHICLE_LOOKUP_DATA.find(record => record.id === 'vehicle-1')
  const [selectedOwnerTags, setSelectedOwnerTags] = useState<string[]>(defaultLookupVehicle?.ownerTags ?? [])
  const [selectedVehicleTags, setSelectedVehicleTags] = useState<string[]>(defaultLookupVehicle?.vehicleTags ?? [])
  const patchCreateForm = (patch: Partial<typeof createForm>) => setCreateForm(current => ({ ...current, ...patch }))
  const applyVehicleTagsFromRecord = (record?: VehicleLookupRecord) => {
    setSelectedOwnerTags(record?.ownerTags ?? [])
    setSelectedVehicleTags(record?.vehicleTags ?? [])
    if (record?.isThreePack !== undefined) {
      patchCreateForm({ isThreePack: record.isThreePack })
    }
  }
  // Mock数据：包含可编辑和不可编辑的项目/备件
  const [repairItems, setRepairItems] = useState<RepairItem[]>([
    { id: 101, name: '更换机油', code: 'RP-001', laborType: '保养', unitPrice: 80, hours: 0.5, discountRate: 100, fee: 40, type: '保养', chargeType: '客户自费', customHours: false, isDispatched: false, isUpsell: false, packageName: '春季保养套餐', faultLocation: '发动机舱' },
    { id: 102, name: '更换机油滤清器', code: 'RP-002', laborType: '保养', unitPrice: 50, hours: 0.3, discountRate: 100, fee: 15, type: '保养', chargeType: '客户自费', customHours: false, isDispatched: true, isUpsell: false, packageName: '春季保养套餐', faultLocation: '发动机舱', assignedTechnician: '张伟', workstation: '工位-A1' },
    { id: 103, name: '更换空调滤芯', code: 'RP-003', laborType: '保养', unitPrice: 60, hours: 0.3, discountRate: 100, fee: 18, type: '保养', chargeType: '客户自费', customHours: false, isDispatched: false, isUpsell: true, faultLocation: '空调系统' },
  ])
  const [parts, setParts] = useState<PartItem[]>([
    { id: 201, name: '机油 5W-30', code: 'PT-001', unitPrice: 120, stock: 10, qty: 1, discountRate: 100, fee: 120, type: '保养', chargeType: '客户自费', isPicked: false, isUpsell: false, packageName: '春季保养套餐' },
    { id: 202, name: '机油滤清器', code: 'PT-002', unitPrice: 35, stock: 15, qty: 1, discountRate: 100, fee: 35, type: '保养', chargeType: '客户自费', isPicked: true, isUpsell: false, packageName: '春季保养套餐', issuer: '李明', receiver: '张伟', issuedAt: '2026-03-27 10:20' },
    { id: 203, name: '空调滤芯', code: 'PT-003', unitPrice: 80, stock: 8, qty: 1, discountRate: 100, fee: 80, type: '保养', chargeType: '客户自费', isPicked: false, isUpsell: true },
  ])
  const showDispatchColumns = repairItems.some(item => item.isDispatched || item.assignedTechnician)
  const showMaterialColumns = parts.some(part => part.isPicked)
  const discountSummary = calcDiscountSummary(repairItems, parts)
  const [additionalFees, setAdditionalFees] = useState<AdditionalFeeItem[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [showBatchDiscountModal, setShowBatchDiscountModal] = useState(false)
  const [showBatchRepairTypeModal, setShowBatchRepairTypeModal] = useState(false)
  const [showBatchChargeTypeModal, setShowBatchChargeTypeModal] = useState(false)
  const [showBatchImportModal, setShowBatchImportModal] = useState(false)
  const [batchDiscountValue, setBatchDiscountValue] = useState('100')
  const [batchRepairType, setBatchRepairType] = useState('维修')
  const [batchChargeType, setBatchChargeType] = useState('客户自费')
  const [batchChargeSplitValues, setBatchChargeSplitValues] = useState<Record<string, number> | undefined>(undefined)
  const [importText, setImportText] = useState('')

  const showToast = (type: 'success' | 'warning' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  // 添加套餐包到工单
  const handleAddRepairPackage = (templateId: string) => {
    const template = REPAIR_PACKAGE_TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    // 生成新的ID（从当前最大ID+1开始）
    const maxRepairId = Math.max(...repairItems.map(item => item.id), 100)
    const maxPartId = Math.max(...parts.map(item => item.id), 200)

    // 添加项目
    const newProjects: RepairItem[] = template.projects.map((proj, index) => ({
      id: maxRepairId + index + 1,
      name: proj.name,
      code: proj.code,
      laborType: proj.laborType,
      unitPrice: proj.unitPrice,
      hours: proj.hours,
      discountRate: 100,
      fee: proj.unitPrice * proj.hours,
      type: template.type,
      chargeType: '客户自费',
      customHours: false,
      isDispatched: false,
      isUpsell: false,
      packageName: template.name,
    }))

    // 添加备件
    const newParts: PartItem[] = template.parts.map((part, index) => ({
      id: maxPartId + index + 1,
      name: part.name,
      code: part.code,
      unitPrice: part.unitPrice,
      stock: 10,
      qty: part.qty,
      discountRate: 100,
      fee: calculatePartFee(part.unitPrice, part.qty),
      type: template.type,
      chargeType: '客户自费',
      isPicked: false,
      isUpsell: false,
      packageName: template.name,
    }))

    // 更新状态
    setRepairItems(prev => [...prev, ...newProjects])
    setParts(prev => [...prev, ...newParts])
    
    showToast('success', `已添加套餐包"${template.name}"：${newProjects.length}个项目，${newParts.length}个备件`)
    setShowRepairPackageModal(false)
    setSelectedPackageId(null)
  }

  // 确认添加选中的套餐包
  const handleConfirmAddPackage = () => {
    if (selectedPackageId) {
      handleAddRepairPackage(selectedPackageId)
    }
  }

  const submitPreparedOrder = (newOrder: WorkOrder) => {
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast('success', newOrder.serviceType === 'onsite' ? '已推送车主，上门工单已进入派车派工队列' : '已推送车主，工单已进入待施工队列')
      setTimeout(() => onSubmitSuccess?.(newOrder), 1200)
    }, 800)
  }

  const handleTelemetryFieldChange = (field: keyof typeof telemetryValues, value: string) => {
    setTelemetryValues(current => ({ ...current, [field]: value }))
  }

  const handleSaveDraft = () => {
    setDraftSaved(true)
    showToast('success', '草稿已保存，请引导客户确认并补充附件')
  }

  const handleAddDraftAttachment = () => {
    const namePool = ['车辆外观.jpg', '仪表盘.png', '故障部位.jpg', '行车证.pdf', '里程照片.jpg']
    const name = namePool[draftAttachments.length % namePool.length]
    const sizeKB = 120 + Math.round(Math.random() * 800)
    setDraftAttachments(current => [...current, { id: Date.now(), name, sizeKB }])
  }

  const handleRemoveDraftAttachment = (id: number) => {
    setDraftAttachments(current => current.filter(item => item.id !== id))
  }

  const handleCustomerConfirm = () => {
    if (!draftSaved) return
    const now = formatRuntimeDateTime()
    setCustomerConfirmed(true)
    setCustomerConfirmAt(now)
    showToast('success', '客户已确认，可推送车主并进入待派工')
  }

  const handleRevokeCustomerConfirm = () => {
    setCustomerConfirmed(false)
    setCustomerConfirmAt('')
    showToast('warning', '已撤销客户确认状态')
  }

  const updateRepairItem = (itemId: number, updater: (item: RepairItem) => RepairItem) => {
    setRepairItems(current => current.map(item => item.id === itemId ? updater(item) : item))
  }

  const handleChangeCustomRepairName = (itemId: number, value: string) => {
    updateRepairItem(itemId, current => ({ ...current, name: value }))
  }

  const handleChangeCustomRepairHours = (itemId: number, value: string) => {
    const nextHours = Math.max(0, Number(value) || 0)
    updateRepairItem(itemId, current => ({
      ...current,
      hours: nextHours,
      discountRate: 100,
    }))
  }

  const handleChangeCustomRepairFee = (itemId: number, value: string) => {
    const nextFee = Math.max(0, Number(value) || 0)
    updateRepairItem(itemId, current => ({
      ...current,
      discountRate: 100,
      fee: Number(nextFee.toFixed(2)),
    }))
  }

  const handleChangeRepairDiscount = (itemId: number, value: string) => {
    const nextDiscount = clampDiscountRate(Number(value))
    updateRepairItem(itemId, current => {
      if (current.customHours) {
        return { ...current, discountRate: 100 }
      }
      return {
        ...current,
        discountRate: nextDiscount,
        fee: calculateRepairItemFee(current.unitPrice, current.hours, nextDiscount),
      }
    })
  }

  const handleSubmit = () => {
    if (!meterReplaced) {
      showToast('error', '请选择是否换表')
      return
    }
    if (meterReplaced === '是' && !meterReplaceMileage.trim()) {
      showToast('error', '请填写换表里程')
      return
    }
    if (!draftSaved) {
      showToast('error', '请先保存草稿，再让客户确认与上传附件')
      return
    }
    if (!customerConfirmed) {
      showToast('error', '请先获取客户确认后再推送车主，推送后委托书将进入待派工')
      return
    }

    const runtime = new Date()
    const createdAt = formatRuntimeDateTime(runtime)
    const estimatedDeliveryAt = formatRuntimeDateTime(addHours(runtime, 4))
    const referenceOrder = existingOrders.find(order => order.vin === vehicleInfo.vin)
    const repairType = repairItems[0]?.type || '维修'
    const chargeType = getUnifiedChargeType([...repairItems, ...parts, ...additionalFees])
    const isOnsiteService = serviceType === 'onsite'
    const newOrder: WorkOrder = {
      id: draftOrderId,
      repairType: createForm.repairType || repairType,
      vin: createForm.vin || vehicleInfo.vin || vinQuery || '待补充 VIN',
      plate: plate || createForm.plate || vehicleInfo.plate || '待补充车牌',
      owner: createForm.ownerName || vehicleInfo.ownerName || '待确认车主',
      advisor: createForm.advisor || '李顾问',
      dealerErpCode: referenceOrder?.dealerErpCode || '1070TW',
      dealerShortName: referenceOrder?.dealerShortName || '赣州腾洋',
      series: createForm.series || referenceOrder?.series || getSeriesFromModel(createForm.model || vehicleInfo.model),
      status: 'pending',
      materialStatus: parts.length ? 'pending' : 'none',
      estimatedDeliveryAt: createForm.estimatedDeliveryAt ? createForm.estimatedDeliveryAt.replace('T', ' ') : estimatedDeliveryAt,
      sender: createForm.sender || vehicleInfo.ownerName || '待确认送修人',
      senderPhone: createForm.senderPhone || vehicleInfo.phone || '—',
      customerType: createForm.ownerType === '企业' ? '企业客户' : createForm.ownerType === '事业' ? '事业单位' : (referenceOrder?.customerType || '个人车主'),
      mileage: Number(telemetryValues.totalMileage) || Number(createForm.mileage) || Number(vehicleInfo.lastMileage.replace(/,/g, '')) || 0,
      confirmedStartAt: '—',
      completedReviewAt: '—',
      deliveryAt: '—',
      settlementAt: '—',
      engineNo: createForm.engineNo || vehicleInfo.engineNo || referenceOrder?.engineNo || '—',
      gearboxNo: createForm.gearboxNo || referenceOrder?.gearboxNo || (vehicleInfo.motorNo && vehicleInfo.motorNo !== '—' ? vehicleInfo.motorNo : '待派工后回填'),
      saleDate: createForm.saleDate || referenceOrder?.saleDate || '—',
      color: createForm.exteriorColor || referenceOrder?.color || '—',
      invoiceDate: referenceOrder?.invoiceDate || '—',
      productionDate: referenceOrder?.productionDate || '—',
      insuranceCompany: createForm.insuranceCompany || referenceOrder?.insuranceCompany || '待登记',
      completedReviewer: '—',
      standardLaborFee: Number(laborTotal.toFixed(2)),
      standardMaterialFee: Number(partsTotal.toFixed(2)),
      standardTotalFee: Number(total.toFixed(2)),
      actualLaborFee: Number(laborTotal.toFixed(2)),
      actualMaterialFee: Number(partsTotal.toFixed(2)),
      otherFee: Number(additionalFeeTotal.toFixed(2)),
      createdAt,
      actualTotalFee: Number(total.toFixed(2)),
      updatedAt: createdAt,
      repairCategory: repairType,
      technician: createForm.principalTechnician || '待派工',
      chargeType,
      isEV: vehicleInfo.batteryPackNo !== '—' || /eQ|新能源|纯电|混动/i.test(createForm.model || vehicleInfo.model),
      model: createForm.model || vehicleInfo.model || referenceOrder?.model || '待补充车型',
      faultDesc: faultDesc.trim(),
      phone: createForm.ownerPhone || vehicleInfo.phone || '—',
      appointmentNo: linkedAppointment?.appointmentNo,
      serviceType,
      onsiteAddress: isOnsiteService ? onsiteAddress.trim() || '待补充上门地址' : undefined,
      onsiteStatus: isOnsiteService ? 'dispatch' : undefined,
      repairItems: repairItems.map(item => ({ ...item })),
      partItems: parts.map(item => ({ ...item })),
      additionalFeeItems: additionalFees.length ? additionalFees.map(item => ({ ...item })) : undefined,
      warrantyAlert: referenceOrder?.warrantyAlert,
      ownerType: createForm.ownerType,
      contactPerson: createForm.contactPerson || undefined,
      contactPhone: createForm.contactPhone || undefined,
      contactEmail: createForm.contactEmail || undefined,
      ownerEmail: createForm.ownerEmail || undefined,
      senderEmail: createForm.senderEmail || undefined,
      brand: createForm.brand || undefined,
      configuration: createForm.configuration || undefined,
      interiorColor: createForm.interiorColor || undefined,
      totalMileage: Number(createForm.totalMileage) || Number(telemetryValues.totalMileage) || undefined,
      replacedMileage: meterReplaced === '是' ? Number(meterReplaceMileage) || Number(createForm.replacedMileage) || undefined : Number(createForm.replacedMileage) || undefined,
      nextMaintenanceDate: createForm.nextMaintenanceDate || undefined,
      warrantyExpireDate: createForm.warrantyExpireDate || undefined,
      insuranceExpireDate: createForm.insuranceExpireDate || undefined,
      isThreePack: createForm.isThreePack,
      hevMileage: Number(telemetryValues.hevMileage) || undefined,
      fuelLevel: Number(telemetryValues.fuelLevel) || undefined,
      batteryLevel: Number(telemetryValues.batteryLevel) || undefined,
      isMeterReplaced: meterReplaced === '是',
      ownerTags: selectedOwnerTags.length ? [...selectedOwnerTags] : undefined,
      vehicleTags: selectedVehicleTags.length ? [...selectedVehicleTags] : undefined,
      isPickupDelivery: createForm.isPickupDelivery,
      principalTechnician: createForm.principalTechnician || undefined,
    }

    if (isOnsiteService && getShortageParts(parts).length > 0) {
      showToast('warning', '备件存在缺料，是否仍旧出车？')
      setPendingShortageSubmitOrder(newOrder)
      return
    }

    submitPreparedOrder(newOrder)
  }

  const [vehicleInfo, setVehicleInfo] = useState({
    ownerName: '', phone: '', plate: '',
    vin: '', model: '',
    engineNo: '', warrantyDate: '',
    motorNo: '—',
    batteryPackNo: '—',
    lastVisit: '', lastMileage: '',
  })
  const vehicleArchiveFields = [
    { label: '车主姓名', value: vehicleInfo.ownerName },
    { label: '手机号', value: vehicleInfo.phone },
    { label: '车牌号', value: vehicleInfo.plate },
    { label: 'VIN', value: vehicleInfo.vin },
    { label: '车型', value: vehicleInfo.model },
    { label: '发动机号', value: vehicleInfo.engineNo },
    { label: '电机编号', value: vehicleInfo.motorNo },
    { label: '电池包编号', value: vehicleInfo.batteryPackNo },
    { label: '保修到期日', value: vehicleInfo.warrantyDate },
    { label: '最近进厂日期', value: vehicleInfo.lastVisit },
    { label: '最近进厂里程', value: `${vehicleInfo.lastMileage} km` },
    { label: '车辆类型', value: '燃油车' },
    { label: '车辆用途', value: '非营运用车' },
    { label: '车辆性质', value: '三包车' },
    { label: '销售日期', value: '2024-09-20' },
  ]
  const vehicleRights = {
    userName: '郭富贵',
    vehicleUsage: '非营运用车',
    vehicleNature: '三包车',
    invoiceDate: '2024-09-20',
    isVip: false,
    maintenancePackage: '基础保养套餐（剩余 2 次）',
    extendedWarranty: '整车延保 2 年 / 至 2033-09-16',
    coupon: '工时代金券 500 元',
    storedValue: '保养充值卡 1000 元',
    // 新增标签
    onTimeMaintenance: true, // 按时保养
    isDegradedVehicle: false, // 降级车
    isBigCustomer: false, // 大客户车辆
    isTestDrive: false, // 试乘试驾车
  }
  const vehicleProfileTags = vehicleInfo.vin ? [
    { text: vehicleRights.vehicleUsage, tone: 'neutral' },
    { text: vehicleRights.vehicleNature, tone: 'info' },
    { text: vehicleRights.isVip ? 'VIP 车辆' : '非 VIP 车辆', tone: vehicleRights.isVip ? 'success' : 'neutral' },
    { text: '按时保养', tone: vehicleRights.onTimeMaintenance ? 'success' : 'neutral' },
    { text: '降级车', tone: vehicleRights.isDegradedVehicle ? 'warning' : 'neutral' },
    { text: '大客户车辆', tone: vehicleRights.isBigCustomer ? 'info' : 'neutral' },
    { text: '试乘试驾车', tone: vehicleRights.isTestDrive ? 'info' : 'neutral' },
  ].filter(item => {
    // 只显示有值的标签，灰色标签（neutral）表示未命中，也要显示
    if (item.text === '按时保养' && !vehicleRights.onTimeMaintenance) return true // 未按时保养显示灰色
    if (item.text === '降级车' && !vehicleRights.isDegradedVehicle) return false // 不是降级车不显示
    if (item.text === '大客户车辆' && !vehicleRights.isBigCustomer) return false // 不是大客户不显示
    if (item.text === '试乘试驾车' && !vehicleRights.isTestDrive) return false // 不是试驾车不显示
    return item.text
  }) : []
  const vehicleBenefitTags = vehicleInfo.vin ? [
    { text: '含保养套餐', tone: vehicleRights.maintenancePackage ? 'success' : 'neutral' },
    { text: '含延保产品', tone: vehicleRights.extendedWarranty ? 'warning' : 'neutral' },
    { text: '含代金券', tone: vehicleRights.coupon ? 'info' : 'neutral' },
    { text: '含充值卡', tone: vehicleRights.storedValue ? 'warning' : 'neutral' },
  ].filter((item, index) => [vehicleRights.maintenancePackage, vehicleRights.extendedWarranty, vehicleRights.coupon, vehicleRights.storedValue][index]) : []
  const vehicleRelatedTags = [...vehicleProfileTags, ...vehicleBenefitTags]
  const vehicleTagSummaryItems = [
    { label: '客户画像', value: `${vehicleProfileTags.length} 项` },
    { label: '权益命中', value: `${[vehicleRights.maintenancePackage, vehicleRights.extendedWarranty, vehicleRights.coupon, vehicleRights.storedValue].filter(Boolean).length} 项` },
  ]
  const vehicleRightsFields = [
    { label: '保养套餐', value: vehicleRights.maintenancePackage, concealedValue: vehicleRights.maintenancePackage ? '已命中' : '未命中' },
    { label: '延保产品', value: vehicleRights.extendedWarranty, concealedValue: vehicleRights.extendedWarranty ? '已命中' : '未命中' },
    { label: '代金券', value: vehicleRights.coupon, concealedValue: vehicleRights.coupon ? '已命中' : '未命中' },
    { label: '充值卡', value: vehicleRights.storedValue, concealedValue: vehicleRights.storedValue ? '已命中' : '未命中' },
  ]
  const serviceCampaigns = [
    {
      id: 1,
      name: '夏季空调系统关怀活动',
      type: '季节活动',
      scope: 'VIN 命中 / 2026-04-01 至 2026-06-30',
      benefit: '空调系统检查免费，空调滤芯工时 8 折',
      projectName: '空调系统专项检查',
      projectCode: 'ACT-AC-001',
      laborHours: 0.5,
      laborFee: 0,
      chargeType: '内结',
      added: false,
    },
    {
      id: 2,
      name: '厂家服务活动-制动系统专项检查',
      type: '厂家活动',
      scope: '安全活动命中',
      benefit: '制动系统检查免费，制动清洁材料包免费',
      projectName: '制动系统专项检查',
      projectCode: 'ACT-BRK-002',
      laborHours: 0.5,
      laborFee: 0,
      chargeType: '内结',
      added: false,
    },
  ]
  const qualityImprovements = [
    {
      id: 1,
      name: '前排安全带固定点召回检查',
      type: '召回',
      scope: 'VIN 命中 / 厂家召回批次 RC-2026-05',
      benefit: '召回范围内免费检查并按需更换固定件',
      projectName: '前排安全带固定点检查',
      projectCode: 'QI-RC-001',
      laborHours: 0.6,
      laborFee: 0,
      chargeType: '内结',
      added: false,
    },
    {
      id: 2,
      name: '制动控制软件技术升级',
      type: '技术升级',
      scope: 'VIN 命中 / 技术升级批次 TU-2026-02',
      benefit: '免费升级制动控制软件并完成路试确认',
      projectName: '制动控制软件升级',
      projectCode: 'QI-TU-002',
      laborHours: 0.8,
      laborFee: 0,
      chargeType: '内结',
      added: false,
    },
  ]
  const [campaignRecords, setCampaignRecords] = useState<typeof serviceCampaigns>(serviceCampaigns)
  const [qualityImprovementRecords, setQualityImprovementRecords] = useState<typeof qualityImprovements>(qualityImprovements)
  const [repairSuggestions, setRepairSuggestions] = useState<Array<{
    id: number
    source: string
    title: string
    detail: string
    recommendation: string
    laborHours: number
    laborFee: number
    materials: Array<{ name: string; code: string; qty: number; unitPrice: number; fee: number }>
    status: string
    added: boolean
  }>>([
    {
      id: 1,
      source: '环检后',
      title: '前刹车片更换',
      detail: '环检记录显示前刹车片厚度 3.2 mm，建议本次同步更换，避免短期内再次进厂。',
      recommendation: '建议增加前刹车片更换与制动系统养护',
      laborHours: 1.2,
      laborFee: 216,
      materials: [{ name: '前刹车片套装', code: 'P-BRK-101', qty: 1, unitPrice: 420, fee: 420 }],
      status: '待处理',
      added: false,
    },
    {
      id: 2,
      source: '远程诊断',
      title: '蓄电池检测',
      detail: '远程诊断报告显示低压蓄电池 SOC 持续低于建议值，建议到店期间完成启动系统复检。',
      recommendation: '建议补充蓄电池检测与更换建议',
      laborHours: 0.4,
      laborFee: 72,
      materials: [{ name: '蓄电池 70Ah', code: 'P-BAT-301', qty: 1, unitPrice: 560, fee: 560 }],
      status: '待处理',
      added: false,
    },
    {
      id: 3,
      source: '上次维修增项未做',
      title: '空调滤芯更换',
      detail: '上次委托书 WT-20260115-001 中已建议更换空调滤芯，客户当时暂缓，本次保养建议重新提醒。',
      recommendation: '建议本次同步处理空调滤芯更换',
      laborHours: 0,
      laborFee: 0,
      materials: [{ name: '空调滤芯', code: 'P-ACF-118', qty: 1, unitPrice: 420, fee: 420 }],
      status: '待提醒',
      added: false,
    },
  ])
  const [selectedRepairSuggestionIds, setSelectedRepairSuggestionIds] = useState<number[]>([1, 2, 3])
  const primeVehicleInsightSelections = () => {
    setIncludeVehicleRights(true)
    setSelectedCampaignIds(campaignRecords.filter(campaign => !campaign.added).map(campaign => campaign.id))
    setSelectedQualityImprovementIds(qualityImprovementRecords.filter(item => !item.added).map(item => item.id))
    setSelectedRepairSuggestionIds(repairSuggestions.filter(item => !item.added).map(item => item.id))
  }

  const openVehicleInsightsModal = (tab: 'appointment' | 'rights' | 'campaign' | 'suggestion' = 'appointment', mode: 'full' | 'single' = 'single') => {
    primeVehicleInsightSelections()
    setVehicleInsightsTab(tab)
    setVehicleInsightsModalMode(mode)
    setShowVehicleTagDetails(false)
    setExpandedRepairSuggestionIds([])
    setShowVehicleInsightsModal(true)
  }

  const toggleRepairSuggestionExpanded = (id: number) => {
    setExpandedRepairSuggestionIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  const validateLookupForm = () => {
    const nextErrors: { vin?: string; engineLastSix?: string } = {}
    if (lookupVin.trim() && lookupVin.trim().length !== 17) {
      nextErrors.vin = 'VIN 需为 17 位，请输入完整 VIN 码'
    }
    if (lookupMode === 'precise') {
      if (!lookupVin.trim()) {
        nextErrors.vin = '请输入完整 VIN 码'
      } else if (lookupVin.trim().length !== 17) {
        nextErrors.vin = 'VIN 需为 17 位，请输入完整 VIN 码'
      }
      if (!lookupEngineLastSix.trim()) {
        nextErrors.engineLastSix = '请输入发动机后 6 位'
      } else if (lookupEngineLastSix.trim().length !== 6) {
        nextErrors.engineLastSix = '发动机后 6 位长度需为 6 位'
      }
    }
    setLookupErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const lookupResults = VEHICLE_LOOKUP_DATA.filter(record => {
    if (lookupErrors.vin || lookupErrors.engineLastSix) return false

    if (lookupMode === 'store') {
      if (lookupVin && !record.vin.includes(lookupVin.trim())) return false
      if (lookupPlate && !record.plate.includes(lookupPlate.trim())) return false
      return true
    }

    if (lookupVin.trim() && record.vin !== lookupVin.trim()) return false
    if (lookupEngineLastSix.trim() && !record.engineNo.endsWith(lookupEngineLastSix.trim())) return false
    return true
  })

  const repairProjectResults = REPAIR_PROJECT_OPTIONS.filter(option => {
    if (repairProjectCodeFilter.trim() && !option.code.includes(repairProjectCodeFilter.trim().toUpperCase())) return false
    if (repairProjectNameFilter.trim() && !option.name.includes(repairProjectNameFilter.trim())) return false
    if (repairProjectPartCodeFilter.trim() || repairProjectPartNameFilter.trim()) {
      const suggestedPartIds = REPAIR_PROJECT_PART_SUGGESTIONS[option.id] ?? []
      const matchedByPart = suggestedPartIds.some(partId => {
        const partOption = PART_PICKER_OPTIONS.find(part => part.id === partId)
        if (!partOption) return false
        if (repairProjectPartCodeFilter.trim() && !partOption.code.includes(repairProjectPartCodeFilter.trim().toUpperCase())) return false
        if (repairProjectPartNameFilter.trim() && !partOption.name.includes(repairProjectPartNameFilter.trim())) return false
        return true
      })
      if (!matchedByPart) return false
    }
    return true
  })
  const selectedRepairProjectPreview = REPAIR_PROJECT_OPTIONS.filter(option => selectedProjectIds.includes(option.id))

  const partPickerResults = PART_PICKER_OPTIONS.filter(option => {
    if (option.tab !== partPickerTab) return false
    if (hideZeroStock && option.stock <= 0) return false
    if (partCodeFilter.trim() && !option.code.includes(partCodeFilter.trim().toUpperCase())) return false
    if (partNameFilter.trim() && !option.name.includes(partNameFilter.trim())) return false
    if (partAliasFilter.trim() && !option.alias.includes(partAliasFilter.trim())) return false
    if (partVehicleFilter.trim() && !option.vehicleModel.includes(partVehicleFilter.trim())) return false
    if (partPriceMinFilter.trim() && option.unitPrice < Number(partPriceMinFilter)) return false
    if (partPriceMaxFilter.trim() && option.unitPrice > Number(partPriceMaxFilter)) return false
    return true
  })
  const selectedPartPickerPreview = PART_PICKER_OPTIONS.filter(option => selectedPartPickerIds.includes(option.id))

  const applyVehicleSelection = (vehicleId: string) => {
    const selected = VEHICLE_LOOKUP_DATA.find(record => record.id === vehicleId)
    if (!selected) return
    setVehicleInfo({
      ownerName: selected.customerName,
      phone: selected.phone,
      plate: selected.plate,
      vin: selected.vin,
      model: selected.model,
      engineNo: selected.engineNo,
      motorNo: selected.motorNo,
      warrantyDate: selected.warrantyDate,
      batteryPackNo: selected.batteryPackNo,
      lastVisit: selected.lastVisit,
      lastMileage: selected.mileage,
    })
    patchCreateForm({
      ownerName: selected.customerName,
      ownerPhone: selected.phone,
      sender: selected.customerName,
      senderPhone: selected.phone,
      plate: selected.plate,
      vin: selected.vin,
      model: selected.model,
      engineNo: selected.engineNo,
      series: getSeriesFromModel(selected.model),
      brand: selected.series.split(' ')[0] || '奇瑞',
      exteriorColor: createForm.exteriorColor,
      warrantyExpireDate: selected.warrantyDate,
      mileage: selected.mileage.replace(/,/g, ''),
      totalMileage: selected.mileage.replace(/,/g, ''),
    })
    setPlate(selected.plate)
    setVinQuery(selected.vin)
    setTelemetryValues(current => ({ ...current, totalMileage: selected.mileage.replace(/,/g, '') }))
    applyVehicleTagsFromRecord(selected)
    setShowVehicleLookup(false)
    showToast('success', '车辆信息已回填')
    openVehicleInsightsModal('rights')
  }

  const handleConfirmAppointment = () => {
    const appointment = APPOINTMENT_RECORDS.find(record => record.id === selectedAppointmentId)
    if (!appointment) {
      showToast('error', '请选择预约单后再关联')
      return
    }
    const matchedVehicle = VEHICLE_LOOKUP_DATA.find(record => record.vin === appointment.vin)
    setLinkedAppointment(appointment)
    setVehicleInfo({
      ownerName: appointment.ownerName,
      phone: appointment.phone,
      plate: appointment.plate,
      vin: appointment.vin,
      model: appointment.model,
      engineNo: matchedVehicle?.engineNo || vehicleInfo.engineNo,
      motorNo: matchedVehicle?.motorNo || vehicleInfo.motorNo,
      warrantyDate: matchedVehicle?.warrantyDate || vehicleInfo.warrantyDate,
      batteryPackNo: matchedVehicle?.batteryPackNo || vehicleInfo.batteryPackNo,
      lastVisit: matchedVehicle?.lastVisit || vehicleInfo.lastVisit,
      lastMileage: matchedVehicle?.mileage || vehicleInfo.lastMileage,
    })
    patchCreateForm({
      ownerName: appointment.ownerName,
      ownerPhone: appointment.phone,
      contactPerson: appointment.contactPerson || '',
      contactPhone: appointment.contactPhone || '',
      sender: appointment.ownerName,
      senderPhone: appointment.phone,
      plate: appointment.plate,
      vin: appointment.vin,
      model: appointment.model,
      brand: appointment.brand || createForm.brand,
      series: appointment.seriesName || getSeriesFromModel(appointment.model),
      exteriorColor: appointment.color || createForm.exteriorColor,
      engineNo: matchedVehicle?.engineNo || createForm.engineNo,
      totalMileage: appointment.totalMileage ? String(appointment.totalMileage) : createForm.totalMileage,
      advisor: appointment.serviceAdvisor || createForm.advisor,
      isPickupDelivery: !!appointment.isPickupDelivery,
      principalTechnician: appointment.technician || createForm.principalTechnician,
    })
    setPlate(appointment.plate)
    setVinQuery(appointment.vin)
    applyVehicleTagsFromRecord(matchedVehicle)
    if (appointment.isPickupDelivery) {
      setServiceType('onsite')
      setOnsiteAddress(appointment.pickupAddress || appointment.customerAddress || '芜湖市镜湖区中山北路 88 号')
    }
    setShowVehicleInsightsModal(false)
    showToast('success', `已关联预约单 ${appointment.appointmentNo}`)
  }

  const handleSelectVehicleWithGuard = (vehicleId: string) => {
    const selected = VEHICLE_LOOKUP_DATA.find(record => record.id === vehicleId)
    if (!selected) return
    if (selected.vehicleStatus === '实销完成') {
      setPendingVehicleId(vehicleId)
      setShowBusinessPermissionModal(true)
      return
    }
    applyVehicleSelection(vehicleId)
  }

  const handleConfirmVehicle = () => {
    if (!validateLookupForm()) {
      showToast('error', '请先修正查询条件后再选择车辆')
      return
    }
    handleSelectVehicleWithGuard(selectedVehicleId)
  }

  const handleConfirmRepairProjects = () => {
    const selectedProjects = REPAIR_PROJECT_OPTIONS.filter(option => selectedProjectIds.includes(option.id))
    const overrideDiscount = pickerBatchDiscount !== '' ? clampDiscountRate(Number(pickerBatchDiscount) || 100) : null
    const overrideType = pickerBatchRepairType || ''
    const overrideCharge = pickerBatchChargeType || ''
    
    let customIdCounter = nextCustomItemId
    const mappedProjects = selectedProjects.map(option => {
      const customHours = option.code === '9999'
      // 为自定义工时生成唯一ID
      const itemId = customHours ? customIdCounter++ : option.id
      
      const effectiveType = overrideType || option.type
      let effectiveCharge = overrideCharge || option.chargeType
      if (effectiveType === 'GoodWill') effectiveCharge = '索赔'
      if (customHours && effectiveCharge === '索赔') effectiveCharge = '客户自费'
      const discountRate = overrideDiscount !== null && !customHours ? overrideDiscount : 100
      return {
        id: itemId,
        name: option.name,
        code: option.code,
        laborType: option.laborType,
        unitPrice: option.unitPrice,
        hours: option.hours / 10,
        discountRate,
        fee: calculateRepairItemFee(option.unitPrice, option.hours / 10, discountRate),
        type: effectiveType,
        chargeType: effectiveCharge,
        customHours,
        isDispatched: false,
        isUpsell: false, // 创建工单时不标记为增项
        ...defaultSplitConfig(effectiveCharge),
      }
    })
    
    // 更新自定义ID计数器
    setNextCustomItemId(customIdCounter)

    // 创建工单时直接添加到原始数据
    setRepairItems(current => {
      const currentIds = new Set(current.map(item => item.id))
      const retained = current.filter(item => !selectedProjectIds.includes(item.id) || currentIds.has(item.id))
      const merged = [...retained]
      mappedProjects.forEach(project => {
        if (project.customHours) {
          merged.push(project)
        } else {
          const existingIndex = merged.findIndex(item => item.id === project.id)
          if (existingIndex >= 0) {
            merged[existingIndex] = project
          } else {
            merged.push(project)
          }
        }
      })
      return merged
    })

    const partAdditions: Array<{ option: PartPickerOption; qty: number }> = []
    selectedProjectIds.forEach(projectId => {
      const suggestions = REPAIR_PROJECT_PART_SUGGESTIONS[projectId]
      if (!suggestions) return
      suggestions.forEach(partId => {
        const sel = repairProjectPartSelection[projectId]?.[partId]
        if (!sel?.checked) return
        const partOption = PART_PICKER_OPTIONS.find(option => option.id === partId)
        if (!partOption) return
        partAdditions.push({ option: partOption, qty: Math.max(1, sel.qty) })
      })
    })

    if (partAdditions.length) {
      const updateParts = (current: PartItem[]) => {
        const merged = [...current]
        let nextId = merged.length ? Math.max(...merged.map(item => item.id)) + 1 : 1
        partAdditions.forEach(({ option, qty }) => {
          const existingIndex = merged.findIndex(item => item.code === option.code)
          if (existingIndex >= 0) {
            const existing = merged[existingIndex]
            const nextQty = existing.qty + qty
            merged[existingIndex] = {
              ...existing,
              stock: existing.stock ?? option.stock,
              qty: nextQty,
              fee: calculatePartFee(existing.unitPrice, nextQty, existing.discountRate ?? 100),
              shortageSynced: getPartStock({ ...existing, stock: existing.stock ?? option.stock }) < nextQty,
            }
          } else {
            merged.push({
              id: nextId++,
              name: option.name,
              code: option.code,
              unitPrice: option.unitPrice,
              qty,
              discountRate: 100,
              fee: calculatePartFee(option.unitPrice, qty),
              type: option.type,
              chargeType: '客户自费',
              stock: option.stock,
              shortageSynced: option.stock < qty,
              isPicked: false,
              isUpsell: false, // 创建工单时不标记为增项
              ...defaultSplitConfig('客户自费'),
            })
          }
        })
        return merged
      }

      // 创建工单模式，直接更新主数据
      setParts(updateParts)
    }

    setShowRepairProjectPicker(false)
    const partMsg = partAdditions.length ? `，并附带 ${partAdditions.length} 项关联备件` : ''
    showToast('success', `已添加 ${mappedProjects.length} 个维修项目${partMsg}`)
  }

  const resetPartPickerFilters = () => {
    setPartPriceMinFilter('')
    setPartPriceMaxFilter('')
    setPartCodeFilter('')
    setPartNameFilter('')
    setPartAliasFilter('')
    setPartVehicleFilter('')
    setHideZeroStock(true)
    setShowSensitivePartInfo(false)
  }

  const openPartPickerModal = () => {
    resetPartPickerFilters()
    setPartPickerTab('part')
    setSelectedPartPickerIds([])
    setShowPartPicker(true)
  }

  const handleConfirmParts = () => {
    const selectedParts = PART_PICKER_OPTIONS.filter(option => selectedPartPickerIds.includes(option.id))
    if (!selectedParts.length) {
      showToast('warning', '请先选择备件后再确认')
      return
    }

    const zeroStockParts = selectedParts.filter(option => option.stock <= 0)
    const overrideType = pickerBatchRepairType || ''
    const overrideCharge = pickerBatchChargeType || ''

    const updateParts = (current: PartItem[]) => {
      const merged = [...current]
      selectedParts.forEach(option => {
        const existingIndex = merged.findIndex(item => item.code === option.code)
        const effectiveType = overrideType || option.type
        const effectiveCharge = (effectiveType === 'GoodWill' ? '索赔' : (overrideCharge || '客户自费'))
        const mappedPart: PartItem = {
          id: option.id,
          name: option.name,
          code: option.code,
          unitPrice: option.unitPrice,
          stock: option.stock,
          qty: option.qty,
          discountRate: 100,
          fee: calculatePartFee(option.unitPrice, option.qty),
          type: effectiveType,
          chargeType: effectiveCharge,
          shortageSynced: option.stock < option.qty,
          isPicked: false,
          isUpsell: false,
          isSupplierDirect: false,
          ...defaultSplitConfig(effectiveCharge),
        }
        if (existingIndex >= 0) {
          merged[existingIndex] = mappedPart
        } else {
          merged.push(mappedPart)
        }
      })
      return merged
    }

    setParts(updateParts)

    setShowPartPicker(false)
    if (zeroStockParts.length > 0) {
      showToast('success', `已添加 ${selectedParts.length} 项备件，零库存备件已自动同步至缺件单管理`)
      return
    }
    showToast('success', `已添加 ${selectedParts.length} 项备件`)
  }

  const handleChangePartQty = (partId: number, qtyValue: string) => {
    const nextQty = Math.max(1, Number(qtyValue) || 1)
    setParts(current => current.map(item => item.id === partId
      ? { ...item, qty: nextQty, fee: calculatePartFee(item.unitPrice, nextQty, item.discountRate ?? 100), shortageSynced: getPartStock(item) < nextQty }
      : item))
  }

  const handleChangePartDiscount = (partId: number, value: string) => {
    const nextDiscount = clampDiscountRate(Number(value))
    setParts(current => current.map(item => item.id === partId
      ? { ...item, discountRate: nextDiscount, fee: calculatePartFee(item.unitPrice, item.qty, nextDiscount) }
      : item))
  }

  const handleChangePartType = (partId: number, type: string) => {
    setParts(current => current.map(item => item.id === partId ? { ...item, type } : item))
  }

  const handleDeleteRepairItem = (itemId: number) => {
    setRepairItems(current => current.filter(item => item.id !== itemId || item.isDispatched))
    setSelectedItemIds(current => current.filter(id => id !== `repair-${itemId}`))
  }

  const handleDeletePart = (partId: number) => {
    setParts(current => current.filter(item => item.id !== partId || item.isPicked))
    setSelectedItemIds(current => current.filter(id => id !== `part-${partId}`))
  }

  const handleAddAdditionalFee = () => {
    setAdditionalFees(current => [
      ...current,
      {
        id: Date.now(),
        name: `其他费用${current.length + 1}`,
        fee: 0,
        chargeType: '客户自费',
        note: '',
        relatedDocNo: '',
        relatedDocType: '其他',
      },
    ])
  }

  const handleChangeAdditionalFeeName = (itemId: number, value: string) => {
    setAdditionalFees(current => current.map(item => item.id === itemId ? { ...item, name: value } : item))
  }

  const handleChangeAdditionalFeeAmount = (itemId: number, value: string) => {
    const nextFee = Math.max(0, Number(value) || 0)
    setAdditionalFees(current => current.map(item => item.id === itemId ? { ...item, fee: Number(nextFee.toFixed(2)) } : item))
  }

  const handleDeleteAdditionalFee = (itemId: number) => {
    setAdditionalFees(current => current.filter(item => item.id !== itemId))
  }

  const handleBatchSetDiscount = () => {
    const discount = Number(batchDiscountValue) || 100
    const clampedDiscount = clampDiscountRate(discount)

    selectedItemIds.forEach(id => {
      if (id.startsWith('repair-')) {
        const itemId = Number(id.replace('repair-', ''))
        setRepairItems(current => current.map(item => {
          if (item.id === itemId && !item.customHours && !item.isDispatched) {
            const newFee = calculateRepairItemFee(item.unitPrice, item.hours, clampedDiscount)
            return { ...item, discountRate: clampedDiscount, fee: newFee }
          }
          return item
        }))
      }
    })

    setShowBatchDiscountModal(false)
    showToast('success', `已批量设置 ${selectedItemIds.filter(id => id.startsWith('repair-')).length} 项折扣为 ${clampedDiscount}%`)
    setSelectedItemIds([])
  }

  const handleBatchSetRepairType = () => {
    selectedItemIds.forEach(id => {
      if (id.startsWith('repair-')) {
        const itemId = Number(id.replace('repair-', ''))
        setRepairItems(current => current.map(item =>
          item.id === itemId && !item.isDispatched ? { ...item, type: batchRepairType } : item
        ))
      } else if (id.startsWith('part-')) {
        const partId = Number(id.replace('part-', ''))
        setParts(current => current.map(part =>
          part.id === partId && !part.isPicked ? { ...part, type: batchRepairType } : part
        ))
      }
    })

    setShowBatchRepairTypeModal(false)
    showToast('success', `已批量设置 ${selectedItemIds.length} 项维修类型为 ${batchRepairType}`)
    setSelectedItemIds([])
  }

  const handleBatchSetChargeType = () => {
    const repairIds = new Set(
      selectedItemIds
        .filter(id => id.startsWith('repair-'))
        .map(id => Number(id.replace('repair-', ''))),
    )
    const partIds = new Set(
      selectedItemIds
        .filter(id => id.startsWith('part-'))
        .map(id => Number(id.replace('part-', ''))),
    )
    const chargePatch = buildChargeTypePatch(batchChargeType, {
      splitMode: isMixedChargeType(batchChargeType) ? 'ratio' : undefined,
      splitValues: isMixedChargeType(batchChargeType) ? batchChargeSplitValues : undefined,
    })

    if (repairIds.size > 0) {
      setRepairItems(current => current.map(item => (
        repairIds.has(item.id) && !item.isDispatched ? { ...item, ...chargePatch } : item
      )))
    }

    if (partIds.size > 0) {
      setParts(current => current.map(part => (
        partIds.has(part.id) && !part.isPicked ? { ...part, ...chargePatch } : part
      )))
    }

    setShowBatchChargeTypeModal(false)
    setBatchChargeType('客户自费')
    setBatchChargeSplitValues(undefined)
    showToast('success', `已批量设置 ${selectedItemIds.length} 项收费类型为 ${batchChargeType}`)
    setSelectedItemIds([])
  }

  const handleBatchImport = () => {
    const lines = importText.trim().split('\n').filter(line => line.trim())
    let importedCount = 0

    lines.forEach(line => {
      const parts = line.split('\t').map(p => p.trim())
      if (parts.length < 3) return

      const [name, code, priceStr, ...rest] = parts
      const unitPrice = Number(priceStr) || 0

      // 判断是项目还是备件（简单规则：如果有工时数则为项目，否则为备件）
      const isProject = rest.length > 0 && rest[0] && !isNaN(Number(rest[0])) && Number(rest[0]) < 100

      if (isProject) {
        const hours = Number(rest[0]) || 1
        const newItem: RepairItem = {
          id: Date.now() + importedCount,
          name,
          code,
          laborType: '机电',
          unitPrice,
          hours,
          discountRate: 100,
          fee: calculateRepairItemFee(unitPrice, hours, 100),
          type: '维修',
          chargeType: '客户自费',
          customHours: false,
        }
        setRepairItems(current => [...current, newItem])
      } else {
        const qty = Number(rest[0]) || 1
        const newPart: PartItem = {
          id: Date.now() + importedCount,
          name,
          code,
          unitPrice,
          qty,
          discountRate: 100,
          fee: calculatePartFee(unitPrice, qty),
          type: '维修',
          chargeType: '客户自费',
        }
        setParts(current => [...current, newPart])
      }

      importedCount++
    })

    setShowBatchImportModal(false)
    setImportText('')
    showToast('success', `已导入 ${importedCount} 项`)
  }


  const laborTotal = repairItems.reduce((s, i) => s + i.fee, 0)
  const partsTotal = parts.reduce((s, p) => s + p.fee, 0)
  const additionalFeeTotal = additionalFees.reduce((sum, item) => sum + item.fee, 0)
  const total = laborTotal + partsTotal + additionalFeeTotal
  const selectableItemIds = [
    ...repairItems.filter(item => !item.isDispatched).map(item => `repair-${item.id}`),
    ...parts.filter(part => !part.isPicked).map(part => `part-${part.id}`),
  ]
  const renderRepairChargeTypeCell = (item: RepairItem) => {
    return (
      <ChargeTypeField
        scope="repair"
        itemId={item.id}
        item={item}
        locked={item.isDispatched || item.type === 'GoodWill'}
        hideClaimOption={!!item.customHours}
        openDropdownKey={openChargeTypeDropdownKey}
        setOpenDropdownKey={setOpenChargeTypeDropdownKey}
        openSplitKey={openChargeSplitEditorKey}
        setOpenSplitKey={setOpenChargeSplitEditorKey}
        onUpdate={patch => updateRepairItem(item.id, current => ({ ...current, ...patch }))}
      />
    )
  }

  const renderPartChargeTypeCell = (part: PartItem) => {
    return (
      <ChargeTypeField
        scope="part"
        itemId={part.id}
        item={part}
        locked={!!part.isPicked}
        openDropdownKey={openChargeTypeDropdownKey}
        setOpenDropdownKey={setOpenChargeTypeDropdownKey}
        openSplitKey={openChargeSplitEditorKey}
        setOpenSplitKey={setOpenChargeSplitEditorKey}
        onUpdate={patch => setParts(current => current.map(item => item.id === part.id ? { ...item, ...patch } : item))}
      />
    )
  }
  const currentVehicleHistory = HISTORY_DATA
  const latestHistory = currentVehicleHistory[0]

  const handleConfirmVehicleInsights = () => {
    const selectedCampaigns = campaignRecords.filter(campaign => selectedCampaignIds.includes(campaign.id) && !campaign.added)
    const selectedQualityItems = qualityImprovementRecords.filter(item => selectedQualityImprovementIds.includes(item.id) && !item.added)
    const selectedSuggestions = repairSuggestions.filter(item => selectedRepairSuggestionIds.includes(item.id) && !item.added)

    if (vehicleInsightsTab === 'campaign' && (selectedCampaigns.length || selectedQualityItems.length)) {
      setRepairItems(current => {
        const existingCodes = new Set(current.map(item => item.code))
        const campaignRows = selectedCampaigns
          .filter(campaign => !existingCodes.has(campaign.projectCode))
          .map(campaign => ({
            id: 9000 + campaign.id,
            name: campaign.projectName,
            code: campaign.projectCode,
            laborType: getLaborTypeOptions('服务活动')[0],
            unitPrice: campaign.laborHours > 0 ? Number((campaign.laborFee / campaign.laborHours).toFixed(2)) : campaign.laborFee,
            hours: campaign.laborHours,
            discountRate: 100,
            fee: calculateRepairItemFee(
              campaign.laborHours > 0 ? Number((campaign.laborFee / campaign.laborHours).toFixed(2)) : campaign.laborFee,
              campaign.laborHours,
            ),
            type: '服务活动',
            chargeType: campaign.chargeType,
            ...defaultSplitConfig(campaign.chargeType),
          }))
        const qualityRows = selectedQualityItems
          .filter(item => !existingCodes.has(item.projectCode))
          .map(item => ({
            id: 9500 + item.id,
            name: item.projectName,
            code: item.projectCode,
            laborType: getLaborTypeOptions('品质改善')[0],
            unitPrice: item.laborHours > 0 ? Number((item.laborFee / item.laborHours).toFixed(2)) : item.laborFee,
            hours: item.laborHours,
            discountRate: 100,
            fee: calculateRepairItemFee(
              item.laborHours > 0 ? Number((item.laborFee / item.laborHours).toFixed(2)) : item.laborFee,
              item.laborHours,
            ),
            type: '品质改善',
            chargeType: item.chargeType,
            ...defaultSplitConfig(item.chargeType),
          }))
        return [...current, ...campaignRows, ...qualityRows]
      })
      if (selectedCampaigns.length) {
        setCampaignRecords(current => current.map(campaign => selectedCampaignIds.includes(campaign.id) ? { ...campaign, added: true } : campaign))
      }
      if (selectedQualityItems.length) {
        setQualityImprovementRecords(current => current.map(item => selectedQualityImprovementIds.includes(item.id) ? { ...item, added: true } : item))
      }
    }

    if (vehicleInsightsTab === 'suggestion' && selectedSuggestions.length) {
      setRepairItems(current => {
        const existingCodes = new Set(current.map(item => item.code))
        const suggestionRows = selectedSuggestions
          .filter(item => !existingCodes.has(`SUG-${String(item.id).padStart(3, '0')}`))
          .map(item => {
            const code = `SUG-${String(item.id).padStart(3, '0')}`
            const unitPrice = item.laborHours > 0 ? Number((item.laborFee / item.laborHours).toFixed(2)) : item.laborFee
            return {
              id: 9800 + item.id,
              name: item.recommendation,
              code,
              laborType: getLaborTypeOptions('维修')[0],
              unitPrice,
              hours: item.laborHours,
              discountRate: 100,
              fee: calculateRepairItemFee(unitPrice, item.laborHours),
              type: '维修',
              chargeType: '客户自费',
              isUpsell: true,
            }
          })
        return suggestionRows.length ? [...current, ...suggestionRows] : current
      })
      setParts(current => {
        const existingCodes = new Set(current.map(item => item.code))
        const suggestionParts = selectedSuggestions.flatMap(item =>
          item.materials
            .filter(material => !existingCodes.has(material.code))
            .map((material, index) => ({
              id: 12000 + item.id * 10 + index,
              name: material.name,
              code: material.code,
              unitPrice: material.unitPrice,
              qty: material.qty,
              discountRate: 100,
              fee: calculatePartFee(material.unitPrice, material.qty),
              type: '维修',
              chargeType: '客户自费',
              isUpsell: true,
            })),
        )
        return suggestionParts.length ? [...current, ...suggestionParts] : current
      })
      setRepairSuggestions(current => current.map(item => selectedRepairSuggestionIds.includes(item.id) ? { ...item, added: true, status: '已加入工单' } : item))
    }

    setShowVehicleInsightsModal(false)
    showToast('success', '已完成当前内容处理')
  }
  const pendingCampaignRecords = campaignRecords.filter(item => !item.added)
  const pendingQualityImprovements = qualityImprovementRecords.filter(item => !item.added)
  const pendingRepairSuggestions = repairSuggestions.filter(item => !item.added)
  const pendingAppointmentCount = APPOINTMENT_RECORDS.length
  const pendingCampaignQualityCount = pendingCampaignRecords.length + pendingQualityImprovements.length
  const allVehicleInsightTabs: Array<{ key: 'appointment' | 'rights' | 'campaign' | 'suggestion'; label: string; count: number }> = [
    { key: 'appointment', label: '关联预约单', count: pendingAppointmentCount },
    { key: 'rights', label: '车辆权益', count: 0 },
    { key: 'campaign', label: '服务活动 / 品质改善', count: pendingCampaignQualityCount },
    { key: 'suggestion', label: '维修建议', count: pendingRepairSuggestions.length },
  ]
  // 完整模式显示所有Tab，独立模式只显示当前Tab
  const vehicleInsightTabs = vehicleInsightsModalMode === 'full'
    ? allVehicleInsightTabs
    : allVehicleInsightTabs.filter(tab => tab.key === vehicleInsightsTab)

  const importHistoryRecord = (record: typeof HISTORY_DATA[number]) => {
    setFaultDesc(current => {
      if (!current.trim()) return record.fault
      if (current.includes(record.fault)) return current
      return `${current}\n参考历史：${record.fault}`
    })

    setRepairPlan(current => {
      const historyPlan = `参考历史维修：${record.items.join('，')}`
      if (!current.trim()) return historyPlan
      if (current.includes(historyPlan)) return current
      return `${current}\n${historyPlan}`
    })

    setRepairItems(current => {
      const existingNames = new Set(current.map(item => item.name))
      const importedItems = record.items
        .filter(name => !existingNames.has(name))
        .map((name, index) => ({
          id: Date.now() + index,
          name,
          code: `HIS-${record.date.replace(/-/g, '')}-${index + 1}`,
          laborType: getLaborTypeOptions(record.type)[0],
          unitPrice: 0,
          hours: 1,
          discountRate: 100,
          fee: calculateRepairItemFee(0, 1),
          type: record.type,
          chargeType: record.chargeType,
          ...defaultSplitConfig(record.chargeType),
        }))
      return importedItems.length ? [...current, ...importedItems] : current
    })

    setParts(current => {
      const existingNames = new Set(current.map(item => item.name))
      const importedParts = record.parts
        .map(name => name.replace(/×\d+$/, '').trim())
        .filter(name => !existingNames.has(name))
        .map((name, index) => ({
          id: Date.now() + 100 + index,
          name,
          code: `HIS-P-${record.date.replace(/-/g, '')}-${index + 1}`,
          unitPrice: 0,
          qty: 1,
          fee: 0,
          type: record.type,
          chargeType: '客户自费',
        }))
      return importedParts.length ? [...current, ...importedParts] : current
    })

    setShowVehicleHistory(false)
    showToast('success', `已带入 ${record.date} 的历史故障、维修项目和备件信息`)
  }

  return (
    <div>
      {/* Toast 提示 */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '10px 20px', borderRadius: 6,
          background: toast.type === 'success' ? '#f6ffed' : toast.type === 'error' ? '#fff2f0' : '#fffbe6',
          border: `1px solid ${toast.type === 'success' ? '#b7eb8f' : toast.type === 'error' ? '#ffa39e' : '#ffe58f'}`,
          color: toast.type === 'success' ? '#389e0d' : toast.type === 'error' ? '#cf1322' : '#7c4a00',
          fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
        }}>
          {toast.type === 'success' && <CheckCircle2 size={16} strokeWidth={2} />}
          {toast.type === 'error' && <X size={16} strokeWidth={2} />}
          {toast.type === 'warning' && <AlertTriangle size={16} strokeWidth={2} />}
          {toast.msg}
        </div>
      )}
      {pendingShortageSubmitOrder && (
        <div className="modal-overlay" onClick={() => setPendingShortageSubmitOrder(null)}>
          <div className="modal" style={{ width: 680 }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              缺料出车确认
              <button className="btn btn-text" onClick={() => setPendingShortageSubmitOrder(null)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="alert-banner" style={{ marginBottom: 12 }}>
                <AlertTriangle size={16} strokeWidth={1.9} className="status-warning" />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>备件存在缺料，是否仍旧出车？</div>
                  <div>以下缺料备件已同步缺件单，确认后上门工单仍会提交并进入派车派工队列。</div>
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>备件编号</th>
                    <th>备件名称</th>
                    <th>需求数量</th>
                    <th>可用库存</th>
                  </tr>
                </thead>
                <tbody>
                  {getShortageParts(pendingShortageSubmitOrder.partItems ?? []).map(part => (
                    <tr key={part.code}>
                      <td>{part.code}</td>
                      <td>{part.name}</td>
                      <td>{part.qty}</td>
                      <td>{getPartStock(part)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setPendingShortageSubmitOrder(null)}>取消</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const order = pendingShortageSubmitOrder
                  setPendingShortageSubmitOrder(null)
                  if (!order) return
                  submitPreparedOrder(order)
                }}
              >
                仍旧出车并提交
              </button>
            </div>
          </div>
        </div>
      )}
      {showBatteryAlert && (
        <div className="alert-banner">
          <AlertTriangle size={16} strokeWidth={1.9} className="status-warning" />
          <div>
            <div style={{ fontWeight: 500 }}>检测到动力电池相关维修项目</div>
          </div>
          <button className="btn btn-warning btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }} onClick={() => setShowBatteryAlert(false)}>知道了</button>
        </div>
      )}

      {/* 车主车辆信息 */}
      <div className="vehicle-overview-panel">
        <div className="vehicle-overview-main">
          <div className="vehicle-overview-kicker">创建工单</div>
          <div className="vehicle-overview-title">
            <span>{vehicleInfo.plate || '浙B·0L34B'}</span>
            <span className="vehicle-overview-divider">/</span>
            <span
              style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
              onClick={() => setShowVehicleArchiveModal(true)}
            >
              {vehicleInfo.vin}
            </span>
          </div>
          <div className="vehicle-overview-subtitle">{vehicleInfo.model}</div>
          <div className="vehicle-overview-meta">
            <span>保修到期日 {vehicleInfo.warrantyDate}</span>
            <span>最近进厂 {vehicleInfo.lastVisit}</span>
            <span>最近里程 {vehicleInfo.lastMileage} km</span>
            {linkedAppointment && (
              <span
                style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}
                onClick={() => setShowAppointmentDetailModal(true)}
              >
                预约单 {linkedAppointment.appointmentNo}
              </span>
            )}
          </div>
        </div>
        <div className="vehicle-overview-actions" style={{ display: 'flex', flexWrap: 'nowrap', gap: 8 }}>
          <button className="btn btn-default btn-sm" onClick={() => openVehicleInsightsModal('appointment')}>
            关联预约单{pendingAppointmentCount > 0 ? `（${pendingAppointmentCount}）` : ''}
          </button>
          <button className="btn btn-default btn-sm" onClick={() => setShowVehicleHistory(true)}>委托书履历</button>
          <button className="btn btn-default btn-sm" onClick={() => openVehicleInsightsModal('rights')}>车辆权益</button>
          <button className="btn btn-default btn-sm" onClick={() => openVehicleInsightsModal('campaign')}>
            服务活动 / 品质改善{pendingCampaignQualityCount > 0 ? `（${pendingCampaignQualityCount}）` : ''}
          </button>
          <button className="btn btn-default btn-sm" onClick={() => openVehicleInsightsModal('suggestion')}>
            维修建议{pendingRepairSuggestions.length > 0 ? `（${pendingRepairSuggestions.length}）` : ''}
          </button>
          <button className="btn btn-default btn-sm" onClick={() => setShowOwnerVehicleEditModal(true)}>
            车主车辆信息变更
          </button>
          {draftSaved && (
            <button className="btn btn-default btn-sm" onClick={() => showToast('success', '工单打印任务已创建')}>
              打印工单
            </button>
          )}
        </div>
      </div>

      <div className="card card-odin card-vehicle-info">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>车辆查询</div>
        </div>
        <div className="vehicle-query-bar">
          <input className="form-input" style={{ width: 160 }} placeholder="输入车牌号" value={plate} onChange={e => { setPlate(e.target.value); patchCreateForm({ plate: e.target.value }) }} />
          <button className="btn btn-primary btn-sm">查询</button>
          <span className="vehicle-query-separator">或输入 VIN 查询</span>
          <input className="form-input" style={{ width: 220 }} placeholder="输入 VIN（17位）" value={vinQuery} onChange={e => { setVinQuery(e.target.value); patchCreateForm({ vin: e.target.value }) }} />
          <button className="btn btn-default btn-sm" onClick={() => setShowVehicleLookup(true)}>按 VIN 查询车辆</button>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">车主标签 & 车辆标签</div>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: 'var(--text-tertiary)' }}>选定车辆后由系统根据客户画像与车辆档案自动带出，不可手工勾选。</p>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>车主标签</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {selectedOwnerTags.length > 0
              ? selectedOwnerTags.map(tag => <span key={tag} className="info-pill tone-info">{tag}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{createForm.vin ? '暂无车主标签' : '请先查询并选定车辆'}</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>车辆标签</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {selectedVehicleTags.length > 0
              ? selectedVehicleTags.map(tag => <span key={tag} className="info-pill tone-success">{tag}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{createForm.vin ? '暂无车辆标签' : '请先查询并选定车辆'}</span>}
          </div>
          <div className="insight-strip">
            <div className="insight-strip-header">
              <div className="insight-strip-title">系统推荐标签</div>
              <button type="button" className="privacy-toggle-button" onClick={() => setShowVehicleTagDetails(current => !current)}>
                {showVehicleTagDetails ? <EyeOff size={14} strokeWidth={1.9} /> : <Eye size={14} strokeWidth={1.9} />}
                {showVehicleTagDetails ? '收起明细' : '查看明细'}
              </button>
            </div>
            <div className="insight-summary-row">
              {vehicleTagSummaryItems.map(item => (
                <div key={item.label} className="insight-summary-chip">
                  <span className="insight-summary-label">{item.label}</span>
                  <strong className="insight-summary-value">{item.value}</strong>
                </div>
              ))}
            </div>
            {showVehicleTagDetails && (
              <div className="insight-tag-row" style={{ marginTop: 10 }}>
                {vehicleRelatedTags.map(tag => (
                  <span key={tag.text} className={`info-pill tone-${tag.tone}`}>{tag.text}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">车主信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 车主类别</label>
            <select className="form-input" value={createForm.ownerType} onChange={e => patchCreateForm({ ownerType: e.target.value as (typeof OWNER_TYPE_OPTIONS)[number] })}>
              {OWNER_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 车主姓名</label>
            <input className="form-input" placeholder="请输入车主姓名" value={createForm.ownerName} onChange={e => { patchCreateForm({ ownerName: e.target.value }); setVehicleInfo(current => ({ ...current, ownerName: e.target.value })) }} />
          </div>
          <PhoneEmailFormItem
            label={<><span className="required">*</span> 车主电话/邮箱</>}
            phone={createForm.ownerPhone}
            email={createForm.ownerEmail}
            placeholder="请输入车主电话 / 邮箱"
            onPhoneChange={value => {
              patchCreateForm({ ownerPhone: value })
              setVehicleInfo(current => ({ ...current, phone: value }))
            }}
            onEmailChange={value => patchCreateForm({ ownerEmail: value })}
          />
          <div className="form-item">
            <label className="form-label">联系人</label>
            <input className="form-input" placeholder="请输入联系人姓名" value={createForm.contactPerson} onChange={e => patchCreateForm({ contactPerson: e.target.value })} />
          </div>
          <PhoneEmailFormItem
            label="联系人电话/邮箱"
            phone={createForm.contactPhone}
            email={createForm.contactEmail}
            placeholder="请输入联系人电话 / 邮箱"
            onPhoneChange={value => patchCreateForm({ contactPhone: value })}
            onEmailChange={value => patchCreateForm({ contactEmail: value })}
          />
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 送修人</label>
            <input className="form-input" placeholder="请输入送修人姓名" value={createForm.sender} onChange={e => patchCreateForm({ sender: e.target.value })} />
          </div>
          <PhoneEmailFormItem
            label={<><span className="required">*</span> 送修人电话/邮箱</>}
            phone={createForm.senderPhone}
            email={createForm.senderEmail}
            placeholder="请输入送修人电话 / 邮箱"
            onPhoneChange={value => patchCreateForm({ senderPhone: value })}
            onEmailChange={value => patchCreateForm({ senderEmail: value })}
          />
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">车辆信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="form-item">
            <label className="form-label">品牌</label>
            <input className="form-input" placeholder="奇瑞" value={createForm.brand} onChange={e => patchCreateForm({ brand: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 车系</label>
            <input className="form-input" placeholder="ARRIZO 8" value={createForm.series} onChange={e => patchCreateForm({ series: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 车型</label>
            <input className="form-input" placeholder="奇瑞 ARRIZO 8 2023款 1.6T" value={createForm.model} onChange={e => { patchCreateForm({ model: e.target.value }); setVehicleInfo(current => ({ ...current, model: e.target.value })) }} />
          </div>
          <div className="form-item">
            <label className="form-label">配置</label>
            <input className="form-input" placeholder="豪华版" value={createForm.configuration} onChange={e => patchCreateForm({ configuration: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">外饰颜色</label>
            <input className="form-input" placeholder="曜石黑" value={createForm.exteriorColor} onChange={e => patchCreateForm({ exteriorColor: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">内饰颜色</label>
            <input className="form-input" placeholder="黑色" value={createForm.interiorColor} onChange={e => patchCreateForm({ interiorColor: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> VIN</label>
            <input className="form-input" placeholder="请输入17位VIN码" maxLength={17} value={createForm.vin} onChange={e => { patchCreateForm({ vin: e.target.value }); setVinQuery(e.target.value); setVehicleInfo(current => ({ ...current, vin: e.target.value })) }} />
          </div>
          <div className="form-item">
            <label className="form-label">发动机号</label>
            <input className="form-input" placeholder="请输入发动机号" value={createForm.engineNo} onChange={e => patchCreateForm({ engineNo: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">变速箱号</label>
            <input className="form-input" placeholder="请输入变速箱号" value={createForm.gearboxNo} onChange={e => patchCreateForm({ gearboxNo: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 车牌号</label>
            <input className="form-input" placeholder="浙B·0L34B" value={createForm.plate} onChange={e => { patchCreateForm({ plate: e.target.value }); setPlate(e.target.value); setVehicleInfo(current => ({ ...current, plate: e.target.value })) }} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 进厂里程</label>
            <input className="form-input" type="number" placeholder="请输入进厂里程" value={telemetryValues.totalMileage} onChange={e => { handleTelemetryFieldChange('totalMileage', e.target.value); patchCreateForm({ mileage: e.target.value, totalMileage: e.target.value }) }} />
          </div>
          <div className="form-item">
            <label className="form-label">HEV里程/燃油里程</label>
            <input className="form-input" type="number" placeholder="请输入 HEV/燃油里程" value={telemetryValues.hevMileage} onChange={e => handleTelemetryFieldChange('hevMileage', e.target.value)} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 是否换表</label>
            <YesNoRadioGroup name="meterReplaced" value={meterReplaced === '是'} onChange={value => setMeterReplaced(value ? '是' : '否')} />
          </div>
          {meterReplaced === '是' && (
            <div className="form-item">
              <label className="form-label"><span className="required">*</span> 换表里程（km）</label>
              <input
                className="form-input"
                type="number"
                value={meterReplaceMileage}
                onChange={e => setMeterReplaceMileage(e.target.value)}
                placeholder="请输入换表里程"
              />
            </div>
          )}
          <div className="form-item">
            <label className="form-label">累计里程</label>
            <input className="form-input" type="number" placeholder="请输入累计里程" value={createForm.totalMileage} onChange={e => patchCreateForm({ totalMileage: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 燃油量（%）</label>
            <input className="form-input" type="number" min={0} max={100} placeholder="0-100" value={telemetryValues.fuelLevel} onChange={e => handleTelemetryFieldChange('fuelLevel', e.target.value)} />
          </div>
          <div className="form-item">
            <label className="form-label">剩余电量（%）</label>
            <input className="form-input" type="number" min={0} max={100} placeholder="0-100" value={telemetryValues.batteryLevel} onChange={e => handleTelemetryFieldChange('batteryLevel', e.target.value)} />
          </div>
          <div className="form-item">
            <label className="form-label">销售日期</label>
            <input className="form-input" type="date" value={createForm.saleDate} onChange={e => patchCreateForm({ saleDate: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">下次保养日期</label>
            <input className="form-input" type="date" value={createForm.nextMaintenanceDate} onChange={e => patchCreateForm({ nextMaintenanceDate: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">保修到期日期</label>
            <input className="form-input" type="date" value={createForm.warrantyExpireDate} onChange={e => patchCreateForm({ warrantyExpireDate: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">保险到期日期</label>
            <input className="form-input" type="date" value={createForm.insuranceExpireDate} onChange={e => patchCreateForm({ insuranceExpireDate: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">保险公司</label>
            <input className="form-input" placeholder="人保财险" value={createForm.insuranceCompany} onChange={e => patchCreateForm({ insuranceCompany: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">是否三包</label>
            <YesNoRadioGroup name="isThreePack" value={createForm.isThreePack} onChange={value => patchCreateForm({ isThreePack: value })} />
          </div>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">工单信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div className="form-item">
            <label className="form-label">工单号</label>
            <input className="form-input" value={draftOrderId} readOnly style={{ background: '#f5f6f8' }} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 服务方式</label>
            <select className="form-select" value={serviceType} onChange={e => setServiceType(e.target.value as ServiceTypeValue)} style={{ width: '100%' }}>
              {SERVICE_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {serviceType === 'onsite' && (
            <div className="form-item">
              <label className="form-label"><span className="required">*</span> 上门服务地址</label>
              <input
                className="form-input"
                value={onsiteAddress}
                onChange={e => setOnsiteAddress(e.target.value)}
                placeholder="请输入客户上门服务地址，如小区/楼栋/车位"
              />
            </div>
          )}
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 工单类型</label>
            <select className="form-input" value={createForm.repairType} onChange={e => patchCreateForm({ repairType: e.target.value })}>
              {CREATE_ORDER_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 服务顾问</label>
            <select className="form-input" value={createForm.advisor} onChange={e => patchCreateForm({ advisor: e.target.value })}>
              {CREATE_ADVISOR_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="form-item">
            <label className="form-label">开单时间</label>
            <input className="form-input" type="datetime-local" value={new Date().toISOString().slice(0, 16)} readOnly style={{ background: '#f5f6f8' }} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span> 预计交车时间</label>
            <input className="form-input" type="datetime-local" value={createForm.estimatedDeliveryAt} onChange={e => patchCreateForm({ estimatedDeliveryAt: e.target.value })} />
          </div>
          <div className="form-item">
            <label className="form-label">责任技师</label>
            <select className="form-input" value={createForm.principalTechnician} onChange={e => patchCreateForm({ principalTechnician: e.target.value })}>
              <option value="">请选择责任技师</option>
              {PRINCIPAL_TECHNICIAN_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
          <div className="form-item">
            <label className="form-label">是否送修</label>
            <YesNoRadioGroup name="isPickupDelivery" value={createForm.isPickupDelivery} onChange={value => patchCreateForm({ isPickupDelivery: value })} />
          </div>
        </div>
      </div>

      {showVehicleArchiveModal && (
        <div className="modal-overlay" onClick={() => setShowVehicleArchiveModal(false)}>
          <div className="modal" style={{ width: 860, maxWidth: 'calc(100vw - 48px)' }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              车辆档案信息
              <button className="btn btn-text" onClick={() => setShowVehicleArchiveModal(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 16 }}>
              <div className="vehicle-archive-grid">
                {vehicleArchiveFields.map(field => (
                  <div key={field.label} className="vehicle-archive-cell">
                    <div className="vehicle-archive-label">{field.label}</div>
                    <div className="vehicle-archive-value">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAppointmentDetailModal && linkedAppointment && (
        <div className="modal-overlay" onClick={() => setShowAppointmentDetailModal(false)}>
          <div className="modal" style={{ width: 900, maxWidth: 'calc(100vw - 48px)' }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              预约单详情
              <button className="btn btn-text" onClick={() => setShowAppointmentDetailModal(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 16 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>基本信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约单号</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{linkedAppointment.appointmentNo}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约来源</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.source}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约状态</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.status}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约到店时间</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.reserveAt}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约类型</div>
                    <div style={{ fontSize: 14 }}><span className="tag tag-pending">{getAppointmentTypeLabel(linkedAppointment.appointmentType)}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>服务门店</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.serviceStore || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>客户信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>车主姓名</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.ownerName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>车主手机号</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.phone}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>联系人</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.contactPerson || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>联系人手机号</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.contactPhone || '—'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>客户地址</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.customerAddress || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>车辆信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>车牌号</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.plate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>VIN</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.vin}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>品牌</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.brand || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>车系名称</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.seriesName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>车型名称</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.model}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>颜色</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.color || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>总里程</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.totalMileage ? `${linkedAppointment.totalMileage} km` : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>HEV里程/燃油里程</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.hevMileage ? `${linkedAppointment.hevMileage} km` : '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>发动机型号</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.engineModel || '—'}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>服务信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>服务顾问</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.serviceAdvisor || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>维修技师</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.technician || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>结算方式</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.settlementMethod || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>是否取送车</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.isPickupDelivery ? '是' : '否'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>是否看板服务</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.isKanbanService ? '是' : '否'}</div>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>问题描述</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.problemDescription || '—'}</div>
                  </div>
                </div>
              </div>

              {linkedAppointment.isPickupDelivery && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>取送车信息</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 24px' }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>取送车联系人</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.pickupContact || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>联系人电话</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.pickupContactPhone || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约取车时间</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.scheduledPickupTime || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>取车地址</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.pickupAddress || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>预约送车时间</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.scheduledDeliveryTime || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '2 / -1' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>送车地址</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.deliveryAddress || '—'}</div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>取送车备注</div>
                      <div style={{ fontSize: 14 }}>{linkedAppointment.pickupDeliveryNote || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'rgba(0,0,0,0.85)' }}>操作信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 24px' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>创建人</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.createdBy || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>创建时间</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.createdAt || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>修改人</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.updatedBy || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>修改时间</div>
                    <div style={{ fontSize: 14 }}>{linkedAppointment.updatedAt || '—'}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowAppointmentDetailModal(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {showVehicleInsightsModal && (
        <div className="modal-overlay" onClick={() => setShowVehicleInsightsModal(false)}>
          <div className="modal" style={{ width: 1180, maxWidth: 'calc(100vw - 48px)' }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              {vehicleInsightsTab === 'appointment' && '关联预约单'}
              {vehicleInsightsTab === 'rights' && '车辆权益'}
              {vehicleInsightsTab === 'campaign' && '服务活动 / 品质改善'}
              {vehicleInsightsTab === 'suggestion' && '维修建议'}
              <button className="btn btn-text" onClick={() => setShowVehicleInsightsModal(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="tab-nav tab-nav-odin" style={{ padding: '0 24px', marginBottom: 0, borderBottom: '1px solid var(--border-light)', display: vehicleInsightsModalMode === 'full' ? 'flex' : 'none' }}>
              {vehicleInsightTabs.map(tab => (
                <div
                  key={tab.key}
                  className={`tab-item ${vehicleInsightsTab === tab.key ? 'active' : ''}`}
                  onClick={() => setVehicleInsightsTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="create-subtab-badge" style={{ minWidth: 20, height: 20, fontSize: 11, marginLeft: 2 }}>{tab.count}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
              {vehicleInsightsTab === 'appointment' && (
                <>
                  <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{plate || vehicleInfo.plate || '待输入车牌'}</div>
                    <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>{vehicleInfo.ownerName}</div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
                      <thead>
                        <tr>
                          <th>选择</th>
                          <th>预约单号</th>
                          <th>预约来源</th>
                          <th>车牌号</th>
                          <th>VIN</th>
                          <th>客户姓名</th>
                          <th>手机号</th>
                          <th>预约时间</th>
                          <th>预约类型</th>
                          <th>状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {APPOINTMENT_RECORDS.map(record => (
                          <tr key={record.id} onClick={() => setSelectedAppointmentId(record.id)} style={{ cursor: 'pointer' }}>
                            <td>
                              <input
                                type="radio"
                                checked={selectedAppointmentId === record.id}
                                onChange={() => setSelectedAppointmentId(record.id)}
                              />
                            </td>
                            <td style={{ fontWeight: 600 }}>{record.appointmentNo}</td>
                            <td>{record.source}</td>
                            <td>{record.plate}</td>
                            <td>{record.vin}</td>
                            <td>{record.ownerName}</td>
                            <td>{record.phone}</td>
                            <td>{record.reserveAt}</td>
                            <td><span className="tag tag-pending">{getAppointmentTypeLabel(record.appointmentType)}</span></td>
                            <td>{record.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {vehicleInsightsTab === 'rights' && (
                <>
                  <div className="rights-hero" style={{ padding: '12px 16px' }}>
                    <div>
                      <div className="rights-hero-title">{vehicleInfo.plate || '未绑定车牌'} / {vehicleInfo.vin}</div>
                      <div className="rights-hero-subtitle">{vehicleInfo.model} · 发票日期 {vehicleRights.invoiceDate}</div>
                    </div>
                    <div className="rights-hero-side">
                      <div className="insight-tag-row">
                        <span className={`info-pill ${vehicleRights.isVip ? 'tone-success' : 'tone-neutral'}`}>{vehicleRights.isVip ? 'VIP 车辆' : '非 VIP 车辆'}</span>
                        <span className="info-pill tone-info">{vehicleRights.vehicleUsage}</span>
                        <span className="info-pill tone-warning">{vehicleRights.vehicleNature}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card card-odin" style={{ marginBottom: 0 }}>
                    <div className="section-header" style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>车辆权益</div>
                    </div>
                    <div className="rights-grid" style={{ gap: '8px 12px' }}>
                      {vehicleRightsFields.map(field => (
                        <div key={field.label} className="rights-grid-item">
                          <div className="rights-grid-label" style={{ fontSize: 12 }}>{field.label}</div>
                          <div className="rights-grid-value" style={{ fontSize: 13 }}>{field.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {vehicleInsightsTab === 'campaign' && (
                <>
                  <div className="card card-odin" style={{ marginBottom: 0 }}>
                    <div className="section-header" style={{ marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={pendingCampaignRecords.length > 0 && selectedCampaignIds.length === pendingCampaignRecords.length}
                          onChange={() => setSelectedCampaignIds(current => current.length === pendingCampaignRecords.length ? [] : pendingCampaignRecords.map(item => item.id))}
                        />
                        服务活动
                        {pendingCampaignRecords.length > 0 && (
                          <span className="create-subtab-badge" style={{ minWidth: 20, height: 20, fontSize: 11 }}>{pendingCampaignRecords.length}</span>
                        )}
                      </label>
                    </div>
                    {campaignRecords.length > 0 ? (
                      <table className="data-table" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}></th>
                            <th>活动名称</th>
                            <th>活动类型</th>
                            <th>命中范围</th>
                            <th>优惠内容</th>
                            <th>关联项目</th>
                            <th>状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaignRecords.map(campaign => (
                            <tr key={campaign.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedCampaignIds.includes(campaign.id)}
                                  disabled={campaign.added}
                                  onChange={() => setSelectedCampaignIds(current => current.includes(campaign.id) ? current.filter(id => id !== campaign.id) : [...current, campaign.id])}
                                />
                              </td>
                              <td style={{ fontWeight: 600 }}>{campaign.name}</td>
                              <td><span className="tag tag-pending">{campaign.type}</span></td>
                              <td>{campaign.scope}</td>
                              <td>{campaign.benefit}</td>
                              <td>{campaign.projectName} / {campaign.projectCode}</td>
                              <td><span className={`tag ${campaign.added ? 'tag-done' : 'tag-warning'}`}>{campaign.added ? '已加入工单' : '待处理'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '12px 4px', fontSize: 13, color: 'var(--text-tertiary)' }}>暂无命中服务活动</div>
                    )}
                  </div>
                  <div className="card card-odin" style={{ marginBottom: 0 }}>
                    <div className="section-header" style={{ marginBottom: 8 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        <input
                          type="checkbox"
                          checked={pendingQualityImprovements.length > 0 && selectedQualityImprovementIds.length === pendingQualityImprovements.length}
                          onChange={() => setSelectedQualityImprovementIds(current => current.length === pendingQualityImprovements.length ? [] : pendingQualityImprovements.map(item => item.id))}
                        />
                        品质改善
                        {pendingQualityImprovements.length > 0 && (
                          <span className="create-subtab-badge" style={{ minWidth: 20, height: 20, fontSize: 11 }}>{pendingQualityImprovements.length}</span>
                        )}
                      </label>
                    </div>
                    {qualityImprovementRecords.length > 0 ? (
                      <table className="data-table" style={{ fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}></th>
                            <th>活动名称</th>
                            <th>分类</th>
                            <th>命中范围</th>
                            <th>优惠内容</th>
                            <th>关联项目</th>
                            <th>状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qualityImprovementRecords.map(item => (
                            <tr key={item.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedQualityImprovementIds.includes(item.id)}
                                  disabled={item.added}
                                  onChange={() => setSelectedQualityImprovementIds(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id])}
                                />
                              </td>
                              <td style={{ fontWeight: 600 }}>{item.name}</td>
                              <td><span className={`tag ${item.type === '召回' ? 'tag-fail' : 'tag-pending'}`}>{item.type}</span></td>
                              <td>{item.scope}</td>
                              <td>{item.benefit}</td>
                              <td>{item.projectName} / {item.projectCode}</td>
                              <td><span className={`tag ${item.added ? 'tag-done' : 'tag-warning'}`}>{item.added ? '已加入工单' : '待处理'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ padding: '12px 4px', fontSize: 13, color: 'var(--text-tertiary)' }}>暂无命中品质改善</div>
                    )}
                  </div>
                </>
              )}

              {vehicleInsightsTab === 'suggestion' && (
                <div className="card card-odin" style={{ marginBottom: 0 }}>
                  <div className="section-header" style={{ marginBottom: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={pendingRepairSuggestions.length > 0 && selectedRepairSuggestionIds.length === pendingRepairSuggestions.length}
                        onChange={() => setSelectedRepairSuggestionIds(current => current.length === pendingRepairSuggestions.length ? [] : pendingRepairSuggestions.map(item => item.id))}
                      />
                      维修建议
                      {pendingRepairSuggestions.length > 0 && (
                        <span className="create-subtab-badge" style={{ minWidth: 20, height: 20, fontSize: 11 }}>{pendingRepairSuggestions.length}</span>
                      )}
                    </label>
                  </div>
                  <div className="upsell-list" style={{ gap: 10 }}>
                    {repairSuggestions.map(item => {
                      const selected = selectedRepairSuggestionIds.includes(item.id)
                      const expanded = expandedRepairSuggestionIds.includes(item.id)
                      const materialSummary = item.materials.map(material => `${material.name} ×${material.qty}`).join('，')
                      const estimatedTotal = item.laborFee + item.materials.reduce((sum, material) => sum + material.fee, 0)
                      return (
                        <div
                          key={item.id}
                          className={`upsell-card ${item.added ? 'is-added' : ''}`}
                          style={{
                            padding: '12px 14px',
                            borderColor: selected ? 'var(--primary)' : undefined,
                            boxShadow: selected ? '0 0 0 2px rgba(23,107,248,0.08)' : undefined,
                          }}
                        >
                          <div className="upsell-card-head" style={{ marginBottom: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={item.added}
                                onChange={() => setSelectedRepairSuggestionIds(current => selected ? current.filter(id => id !== item.id) : [...current, item.id])}
                              />
                              <div style={{ flex: 1 }}>
                                <div className="upsell-card-title">{item.title}</div>
                                <div className="upsell-card-meta">来源：{item.source}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className={`tag ${item.added ? 'tag-done' : 'tag-pending'}`}>{item.status}</span>
                              <button
                                type="button"
                                className="btn btn-text btn-sm"
                                onClick={() => toggleRepairSuggestionExpanded(item.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}
                                aria-expanded={expanded}
                              >
                                {expanded ? '收起' : '展开'}
                                {expanded ? <ChevronUp size={14} strokeWidth={2} /> : <ChevronDown size={14} strokeWidth={2} />}
                              </button>
                            </div>
                          </div>
                          {expanded && (
                            <>
                              <div className="upsell-card-desc" style={{ marginTop: 12 }}>{item.detail}</div>
                              <div className="upsell-card-fields" style={{ marginTop: 12 }}>
                                <div className="upsell-card-field">
                                  <span className="upsell-card-field-label">建议项目</span>
                                  <span className="upsell-card-field-value">{item.recommendation}</span>
                                </div>
                                <div className="upsell-card-field">
                                  <span className="upsell-card-field-label">建议材料</span>
                                  <span className="upsell-card-field-value">{materialSummary}</span>
                                </div>
                                <div className="upsell-card-field">
                                  <span className="upsell-card-field-label">预估工时</span>
                                  <span className="upsell-card-field-value">{item.laborHours} h</span>
                                </div>
                                <div className="upsell-card-field">
                                  <span className="upsell-card-field-label">预估费用</span>
                                  <span className="upsell-card-field-value" style={{ color: '#fa8c16', fontWeight: 600 }}>¥{estimatedTotal}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowVehicleInsightsModal(false)}>关闭</button>
              {vehicleInsightsTab === 'appointment' && (
                <button className="btn btn-primary" onClick={handleConfirmAppointment}>关联选中预约单</button>
              )}
              {(vehicleInsightsTab === 'campaign' || vehicleInsightsTab === 'suggestion') && (
                <button className="btn btn-primary" onClick={handleConfirmVehicleInsights}>确认</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showVehicleHistory && (
        <div className="modal-overlay" onClick={() => setShowVehicleHistory(false)}>
          <div className="modal" onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              当前车辆维修历史
              <button className="btn btn-text" onClick={() => setShowVehicleHistory(false)} style={{ fontSize: 18, color: 'rgba(0,0,0,0.45)' }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{vehicleInfo.plate}</div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>{vehicleInfo.model}</div>
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>VIN：{vehicleInfo.vin}</div>
              </div>

              {currentVehicleHistory.length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                    {[
                      { label: '历史进厂次数', value: `${currentVehicleHistory.length} 次` },
                      { label: '最近进厂日期', value: latestHistory?.date || '-' },
                      { label: '最近进厂里程', value: latestHistory ? `${latestHistory.mileage} km` : '-' },
                      { label: '最近故障', value: latestHistory?.fault || '-' },
                    ].map(item => (
                      <div key={item.label} style={{ border: '1px solid #f0f0f0', borderRadius: 6, padding: '12px 14px' }}>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.88)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
                      <thead>
                        <tr>
                        <th>委托书编号</th>
                        <th>VIN</th>
                        <th>车牌号</th>
                        <th>客户姓名</th>
                        <th>客户类型</th>
                        <th>服务顾问</th>
                        <th>行驶里程</th>
                        <th>维修类别</th>
                        <th>完工审核时间</th>
                        <th>进厂时间</th>
                        <th>预计交车时间</th>
                        <th>交车时间</th>
                        <th>结算时间</th>
                        <th>送修人姓名</th>
                        <th>送修人电话</th>
                        <th>发动机号</th>
                        <th>变速箱号</th>
                        <th>销售时间</th>
                        <th>生产日期</th>
                        <th>颜色</th>
                        <th>标准工时费</th>
                        <th>标准材料费</th>
                        <th>标准费用合计</th>
                        <th>实收工时费</th>
                        <th>实收材料费</th>
                        <th>其他费用</th>
                        <th>外出服务费</th>
                        <th>实收费用合计</th>
                        <th>外出服务费说明</th>
                        <th>创建时间</th>
                        <th>修改时间</th>
                        <th>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentVehicleHistory.map((record, index) => (
                          <tr key={`${record.date}-${index}`}>
                          <td style={{ fontWeight: 500 }}>{record.entrustNo}</td>
                          <td>{record.vin}</td>
                          <td>{record.plate}</td>
                          <td><SensitiveText value={record.customerName} maskedValue={maskName(record.customerName)} /></td>
                          <td>{record.customerType}</td>
                          <td>{record.advisor}</td>
                          <td>{record.mileage} km</td>
                          <td><span className={`tag ${MAINTENANCE_REPAIR_TYPES.has(record.repairCategory) ? 'tag-pending' : WARRANTY_REPAIR_TYPES.has(record.repairCategory) ? 'tag-done' : 'tag-working'}`}>{record.repairCategory}</span></td>
                          <td>{record.completedReviewAt}</td>
                          <td>{record.admissionAt}</td>
                          <td>{record.estimatedDeliveryAt}</td>
                          <td>{record.deliveryAt}</td>
                          <td>{record.settlementAt}</td>
                          <td><SensitiveText value={record.senderName} maskedValue={maskName(record.senderName)} /></td>
                          <td><SensitiveText value={record.senderPhone} maskedValue={maskPhoneNumber(record.senderPhone)} /></td>
                          <td>{record.engineNo}</td>
                          <td>{record.gearboxNo}</td>
                          <td>{record.saleDate}</td>
                          <td>{record.productionDate}</td>
                          <td>{record.color}</td>
                          <td>{record.standardLaborFee}</td>
                          <td>{record.standardMaterialFee}</td>
                          <td>{record.standardTotalFee}</td>
                          <td>{record.actualLaborFee}</td>
                          <td>{record.actualMaterialFee}</td>
                          <td>{record.otherFee}</td>
                          <td>{record.outboundServiceFee}</td>
                          <td style={{ fontWeight: 500 }}>{record.actualTotalFee}</td>
                          <td>{record.outboundServiceRemark}</td>
                          <td>{record.createdAt}</td>
                          <td>{record.updatedAt}</td>
                          <td>
                            <button className="btn btn-text btn-sm" onClick={() => importHistoryRecord(record)}>一键带入当前工单</button>
                          </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>
                  当前车辆暂无维修历史记录
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowVehicleHistory(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}

      {/* 车主车辆信息变更弹窗 */}
      {showOwnerVehicleEditModal && (
        <div className="modal-overlay" onClick={() => setShowOwnerVehicleEditModal(false)}>
          <div className="modal" style={{ width: 1100, maxWidth: 'calc(100vw - 32px)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <X size={20} style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.45)' }} onClick={() => setShowOwnerVehicleEditModal(false)} />
                <span>编辑车主档案</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-default" onClick={() => setShowOwnerVehicleEditModal(false)}>取消</button>
                <button className="btn btn-primary" onClick={() => { showToast('success', '车主车辆信息已更新'); setShowOwnerVehicleEditModal(false); }}>确认</button>
              </div>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {/* 车主档案部分 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px 24px' }}>
                  <div className="form-item">
                    <label className="form-label">车主编码</label>
                    <input className="form-input" value="CO701001126010000006" readOnly style={{ background: '#f5f6f8' }} />
                  </div>
                  <div className="form-item">
                    <label className="form-label">车主类型</label>
                    <select className="form-input">
                      <option>个人</option>
                      <option>企业</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">车主姓名</label>
                    <input className="form-input" placeholder="张三" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">车主电话</label>
                    <input className="form-input" value="13800138000" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">邮箱</label>
                    <input className="form-input" value="zhangsan@example.com" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">证件类型</label>
                    <select className="form-input">
                      <option>居民身份证</option>
                      <option>护照</option>
                      <option>军官证</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">证件号码</label>
                    <input className="form-input" value="410101199001011234" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">性别</label>
                    <select className="form-input">
                      <option>男</option>
                      <option>女</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">联系人姓名</label>
                    <input className="form-input" value="张三" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">联系人电话</label>
                    <input className="form-input" value="13800138000" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">会员编号</label>
                    <input className="form-input" value="VIP001" style={{ borderColor: '#1890ff' }} />
                  </div>
                  <div className="form-item">
                    <label className="form-label">会员级别</label>
                    <input className="form-input" value="金牌" readOnly style={{ background: '#f5f6f8' }} />
                  </div>
                  <div className="form-item">
                    <label className="form-label">国家</label>
                    <select className="form-input">
                      <option>中国</option>
                      <option>美国</option>
                      <option>日本</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">省份/州</label>
                    <select className="form-input">
                      <option>北京市</option>
                      <option>上海市</option>
                      <option>广东省</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">城市/县</label>
                    <select className="form-input">
                      <option>北京市</option>
                      <option>朝阳区</option>
                      <option>海淀区</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">区县</label>
                    <input className="form-input" value="朝阳区" />
                  </div>
                  <div className="form-item" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">详细地址</label>
                    <input className="form-input" value="建国路100号" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">邮政编码</label>
                    <input className="form-input" value="100020" />
                  </div>
                </div>
                <div className="form-item" style={{ marginTop: 16 }}>
                  <label className="form-label">备注</label>
                  <textarea className="form-textarea" rows={3} placeholder="请输入备注信息" style={{ width: '100%' }} />
                </div>
              </div>

              {/* 分隔线 */}
              <div style={{ height: 1, background: '#f0f0f0', margin: '24px 0' }} />

              {/* 车辆档案部分 */}
              <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.88)' }}>编辑车辆档案</div>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 24px' }}>
                  <div className="form-item">
                    <label className="form-label">VIN码</label>
                    <input className="form-input" value="L09ZA26C03D180006" readOnly style={{ background: '#f5f6f8' }} />
                  </div>
                  <div className="form-item">
                    <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车牌号</label>
                    <input className="form-input" value="京A12345" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">品牌</label>
                    <select className="form-input">
                      <option>捷途</option>
                      <option>奇瑞</option>
                      <option>星途</option>
                    </select>
                  </div>
                  <div className="form-item">
                    <label className="form-label">车型</label>
                    <input className="form-input" value="大圣i-DM" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">发动机号</label>
                    <input className="form-input" value="ENG001234567" />
                  </div>
                  <div className="form-item">
                    <label className="form-label">变速箱号</label>
                    <input className="form-input" value="GRB001234567" />
                  </div>
                  <div className="form-item">
                    <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车主姓名</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="form-input" value="张三" style={{ flex: 1 }} />
                      <button className="btn btn-default btn-sm" style={{ padding: '0 12px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="btn btn-default btn-sm" style={{ padding: '0 12px' }}>+</button>
                    </div>
                  </div>
                  <div className="form-item">
                    <label className="form-label">车辆用途</label>
                    <select className="form-input">
                      <option>非营运车</option>
                      <option>营运车</option>
                      <option>租赁车</option>
                    </select>
                  </div>
                </div>
                <div className="form-item" style={{ marginTop: 16 }}>
                  <label className="form-label">变更原因</label>
                  <textarea className="form-textarea" rows={3} placeholder="无" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVehicleLookup && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 1280, maxWidth: 'calc(100vw - 48px)' }}>
            <div className="modal-header">
              车辆查询
              <button className="btn btn-text" onClick={() => setShowVehicleLookup(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 0 }}>
              <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--border-light)', marginBottom: 18, paddingTop: 8 }}>
                {[
                  { key: 'store', label: '车辆查询' },
                  { key: 'precise', label: '车辆精确查询' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className="btn"
                    onClick={() => {
                      setLookupMode(tab.key as 'store' | 'precise')
                      setLookupErrors({})
                    }}
                    style={{
                      height: 42,
                      borderRadius: '10px 10px 0 0',
                      border: '1px solid var(--border-light)',
                      borderBottomColor: lookupMode === tab.key ? '#fff' : 'var(--border-light)',
                      background: lookupMode === tab.key ? '#fff' : '#fafbfd',
                      color: lookupMode === tab.key ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      marginBottom: -1,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {lookupMode === 'store' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                  <div className="form-item">
                    <label className="form-label">VIN：</label>
                    <input
                      className="form-input"
                      style={{ width: '100%', borderColor: lookupErrors.vin ? 'var(--error)' : undefined }}
                      placeholder="请输入 VIN"
                      value={lookupVin}
                      onChange={e => {
                        setLookupVin(e.target.value.toUpperCase())
                        setLookupErrors(current => ({ ...current, vin: undefined }))
                      }}
                      onBlur={validateLookupForm}
                    />
                    {lookupErrors.vin && <div className="field-error-text">{lookupErrors.vin}</div>}
                  </div>
                  <div className="form-item">
                    <label className="form-label">车牌号：</label>
                    <input className="form-input" style={{ width: '100%' }} placeholder="请输入车牌号" value={lookupPlate} onChange={e => setLookupPlate(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!validateLookupForm()) {
                          showToast('error', 'VIN 长度不满足 17 位，请检查后重试')
                          return
                        }
                        showToast('success', '车辆查询条件已应用')
                      }}
                    >
                      查询
                    </button>
                    <button
                      className="btn btn-default"
                      onClick={() => {
                        setLookupVin('')
                        setLookupPlate('')
                        setLookupErrors({})
                      }}
                    >
                      重置
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                  <div className="form-item">
                    <label className="form-label">VIN：</label>
                    <input
                      className="form-input"
                      style={{ width: '100%', borderColor: lookupErrors.vin ? 'var(--error)' : undefined }}
                      placeholder="请输入完整 VIN 码"
                      value={lookupVin}
                      onChange={e => {
                        setLookupVin(e.target.value.toUpperCase())
                        setLookupErrors(current => ({ ...current, vin: undefined }))
                      }}
                      onBlur={validateLookupForm}
                    />
                    {lookupErrors.vin && <div className="field-error-text">{lookupErrors.vin}</div>}
                  </div>
                  <div className="form-item">
                    <label className="form-label">发动机后 6 位：</label>
                    <input
                      className="form-input"
                      style={{ width: '100%', borderColor: lookupErrors.engineLastSix ? 'var(--error)' : undefined }}
                      placeholder="请输入发动机后6位"
                      maxLength={6}
                      value={lookupEngineLastSix}
                      onChange={e => {
                        setLookupEngineLastSix(e.target.value.toUpperCase())
                        setLookupErrors(current => ({ ...current, engineLastSix: undefined }))
                      }}
                      onBlur={validateLookupForm}
                    />
                    {lookupErrors.engineLastSix && <div className="field-error-text">{lookupErrors.engineLastSix}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        if (!validateLookupForm()) {
                          showToast('error', '请按要求输入完整 VIN 和发动机后 6 位')
                          return
                        }
                        showToast('success', '车辆精确查询条件已应用')
                      }}
                    >
                      查询
                    </button>
                    <button
                      className="btn btn-default"
                      onClick={() => {
                        setLookupVin('')
                        setLookupEngineLastSix('')
                        setLookupErrors({})
                      }}
                    >
                      重置
                    </button>
                  </div>
                </div>
              )}

              <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} strokeWidth={2} />
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleConfirmVehicle}>确认</button>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 42 }}></th>
                    <th>VIN</th>
                    <th>车辆用途</th>
                    <th>车辆状态</th>
                    <th>车系</th>
                    <th>里程</th>
                    <th>车牌号</th>
                    <th>发动机号</th>
                    <th>客户姓名</th>
                  </tr>
                </thead>
                <tbody>
                  {lookupResults.map(record => (
                    <tr
                      key={record.id}
                      style={{ cursor: 'pointer', background: selectedVehicleId === record.id ? 'rgba(23,107,248,0.06)' : '' }}
                      onClick={() => setSelectedVehicleId(record.id)}
                      onDoubleClick={() => {
                        setSelectedVehicleId(record.id)
                        handleSelectVehicleWithGuard(record.id)
                      }}
                    >
                      <td>
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${selectedVehicleId === record.id ? 'var(--primary)' : 'var(--border-input)'}`, background: selectedVehicleId === record.id ? 'var(--primary)' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selectedVehicleId === record.id && <Check size={11} strokeWidth={2.8} color="#fff" />}
                        </div>
                      </td>
                      <td>{record.vin}</td>
                      <td>{record.vehicleUsage || '—'}</td>
                      <td>{record.vehicleStatus}</td>
                      <td>{record.series}</td>
                      <td>{record.mileage ? `${record.mileage} km` : '—'}</td>
                      <td>{record.plate || '—'}</td>
                      <td>{record.engineNo}</td>
                      <td>{record.customerName || '—'}</td>
                    </tr>
                  ))}
                  {lookupResults.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', padding: '48px 12px' }}>
                        暂无匹配车辆，请调整查询条件后重试
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showBusinessPermissionModal && pendingVehicleId && (
        <div className="modal-overlay">
          <div className="modal business-permission-modal">
            <div className="modal-header">
              经营权限提示
              <button
                className="btn btn-text"
                onClick={() => {
                  setShowBusinessPermissionModal(false)
                  setPendingVehicleId(null)
                }}
                style={{ color: 'rgba(0,0,0,0.45)' }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="business-permission-summary">
                <div className="business-permission-icon">
                  <Info size={18} strokeWidth={2.2} />
                </div>
                <div className="business-permission-copy">
                  <div className="business-permission-title">
                    {VEHICLE_LOOKUP_DATA.find(item => item.id === pendingVehicleId)?.series || '该车系'}
                  </div>
                </div>
              </div>

              <div className="business-permission-panel">
                {[
                  { label: '维修权限', allowed: true },
                  { label: '保修权限', allowed: true },
                  { label: '电池维修权限', allowed: false },
                ].map(item => (
                  <div key={item.label} className="business-permission-row">
                    <div className="business-permission-label">{item.label}</div>
                    <div className={`business-permission-badge ${item.allowed ? 'is-allowed' : 'is-denied'}`}>
                      <span className="business-permission-badge-icon">
                        {item.allowed ? <Check size={14} strokeWidth={2.4} /> : <X size={14} strokeWidth={2.4} />}
                      </span>
                      <span>{item.allowed ? '有权限' : '无权限'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                style={{ minWidth: 96 }}
                onClick={() => {
                  const vehicleId = pendingVehicleId
                  setShowBusinessPermissionModal(false)
                  setPendingVehicleId(null)
                  if (vehicleId) {
                    applyVehicleSelection(vehicleId)
                    // 自动打开整合弹框（完整模式，显示所有tab）
                    setTimeout(() => {
                      openVehicleInsightsModal('rights', 'full')
                    }, 100)
                  }
                }}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 故障信息 */}
      <div className="card card-odin">
        <div className="card-title">故障信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-item">
            <label className="form-label">备注 <span style={{ color: 'rgba(0,0,0,0.45)', fontWeight: 400 }}>（≤2048字）</span></label>
            <textarea className="form-textarea" rows={4} placeholder="其他备注信息..." style={{ width: '100%' }} />
          </div>
          <div className="form-item">
            <label className="form-label">上传图片 <span style={{ color: 'rgba(0,0,0,0.45)', fontWeight: 400 }}>（jpg/png，≤50M，≤10张）</span></label>
            <div className="upload-area" style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Camera size={18} strokeWidth={1.8} className="upload-icon" />
              <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>点击上传</span>
            </div>
          </div>
        </div>
      </div>

      {/* 维修项目信息 */}
      <div className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>维修项目信息</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-default btn-sm" onClick={() => setShowUnifiedPicker(true)}>+ 添加项目</button>
            <button className="btn btn-default btn-sm" onClick={() => setShowRepairPackageModal(true)}>+ 添加套餐包</button>
            <button className="btn btn-default btn-sm" onClick={() => setShowBatchImportModal(true)}>批量导入</button>
          </div>
        </div>
        {selectedItemIds.filter(id => id.startsWith('repair-')).length > 0 && (
          <div style={{ padding: '8px 16px', background: '#f0f7ff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>已选 {selectedItemIds.filter(id => id.startsWith('repair-')).length} 项</span>
            <button className="btn btn-text btn-sm" onClick={() => setShowBatchDiscountModal(true)}>批量设置折扣</button>
            <button className="btn btn-text btn-sm" onClick={() => setShowBatchRepairTypeModal(true)}>批量设置维修类型</button>
            <button className="btn btn-text btn-sm" onClick={() => setShowBatchChargeTypeModal(true)}>批量设置收费类型</button>
            <button className="btn btn-text btn-sm" onClick={() => setSelectedItemIds(current => current.filter(id => !id.startsWith('repair-')))}>取消选择</button>
          </div>
        )}
        <div className="table-scroll-wrap table-scroll-wrap--line-items">
        <table className="data-table data-table--line-items">
          <thead>
            <tr>
              <th style={{ width: 48 }}>
                <input
                  type="checkbox"
                  checked={repairItems.filter(item => !item.isDispatched).length > 0 && selectedItemIds.filter(id => id.startsWith('repair-') && repairItems.some(item => `repair-${item.id}` === id && !item.isDispatched)).length === repairItems.filter(item => !item.isDispatched).length}
                  onChange={() => {
                    const selectableRepairIds = repairItems.filter(item => !item.isDispatched).map(item => `repair-${item.id}`)
                    const allSelected = selectableRepairIds.every(id => selectedItemIds.includes(id))
                    setSelectedItemIds(current => allSelected ? current.filter(id => !id.startsWith('repair-')) : [...current.filter(id => !id.startsWith('repair-')), ...selectableRepairIds])
                  }}
                />
              </th>
              <th className="col-code">项目代码</th><th className="col-item-name">项目名称</th><th className="col-package">套餐/活动</th><th className="col-fault">故障部位</th><th className="col-num">工时单价</th>
              <th className="col-num">标准工时</th><th className="col-num">折扣(%)</th><th className="col-num">总价格</th><th className="col-select">维修类型</th><th className="col-labor-type">工种类型</th><th className="col-charge-type">收费类型</th>
              {showDispatchColumns && <><th className="col-staff">技师</th><th className="col-staff">工位</th></>}
              <th className="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            {repairItems.map(item => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(`repair-${item.id}`)}
                    disabled={item.isDispatched}
                    onChange={() => setSelectedItemIds(current =>
                      current.includes(`repair-${item.id}`)
                        ? current.filter(id => id !== `repair-${item.id}`)
                        : [...current, `repair-${item.id}`]
                    )}
                  />
                </td>
                <td className="col-code" style={{ color: 'rgba(0,0,0,0.45)' }}>{item.code}</td>
                <td className="col-item-name">
                  {item.customHours ? (
                    <input
                      className="form-input"
                      value={item.name}
                      onChange={event => handleChangeCustomRepairName(item.id, event.target.value)}
                      disabled={item.isDispatched}
                      placeholder="请输入维修项目名称"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                      <span className="text-link">{item.name}</span>
                      {item.isUpsell && <span className="tag tag-warning">增项</span>}
                    </div>
                  )}
                </td>
                <td className="col-package" style={{ color: 'var(--text-secondary)' }}>{item.packageName || '—'}</td>
                <td className="col-fault">
                  <input className="form-input" value={item.faultLocation || ''} placeholder="故障部位" disabled={item.isDispatched} onChange={event => updateRepairItem(item.id, current => ({ ...current, faultLocation: event.target.value }))} />
                </td>
                <td>¥{item.unitPrice}</td>
                <td>
                  {item.customHours ? (
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      step={0.1}
                      value={item.hours}
                      disabled={item.isDispatched}
                      onChange={event => handleChangeCustomRepairHours(item.id, event.target.value)}
                      style={{ width: 70 }}
                    />
                  ) : (
                    <input
                      className="form-input"
                      type="number"
                      value={item.hours}
                      readOnly
                      style={{ width: 70, background: '#f5f6f8', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                    />
                  )}
                </td>
                <td>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={item.discountRate ?? 100}
                      readOnly={item.customHours || item.isDispatched}
                      onChange={event => handleChangeRepairDiscount(item.id, event.target.value)}
                      style={{
                        width: 76,
                        background: item.customHours || item.isDispatched ? '#f5f6f8' : undefined,
                        color: item.customHours || item.isDispatched ? 'var(--text-secondary)' : undefined,
                        cursor: item.customHours || item.isDispatched ? 'not-allowed' : undefined,
                      }}
                    />
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>%</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>
                  {item.customHours ? (
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.fee}
                      disabled={item.isDispatched}
                      onChange={event => handleChangeCustomRepairFee(item.id, event.target.value)}
                      style={{ width: 96 }}
                    />
                  ) : (
                    <>¥{item.fee}</>
                  )}
                </td>
                <td className="col-select">
                  <select
                    className="form-select"
                    value={item.type}
                    disabled={item.isDispatched}
                    onChange={e => updateRepairItem(item.id, current => {
                      const nextType = e.target.value
                      const laborTypeOptions = getLaborTypeOptions(nextType)
                      const nextChargeType = nextType === 'GoodWill'
                        ? '索赔'
                        : current.customHours && current.chargeType === '索赔'
                          ? '客户自费'
                          : current.chargeType
                      return {
                        ...current,
                        type: nextType,
                        laborType: laborTypeOptions.includes(current.laborType) ? current.laborType : laborTypeOptions[0],
                        chargeType: nextChargeType,
                        ...defaultSplitConfig(nextChargeType),
                      }
                    })}
                  >
                    {REPAIR_TYPE_OPTIONS
                      .filter(option => !(item.customHours && option === 'GoodWill'))
                      .map(option => <option key={option}>{option}</option>)}
                  </select>
                </td>
                <td className="col-labor-type">
                  <input
                    className="form-input"
                    value={item.laborType}
                    readOnly
                    style={{ background: '#f5f6f8', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                  />
                </td>
                <td className="col-charge-type">{renderRepairChargeTypeCell(item)}</td>
                {showDispatchColumns && (
                  <>
                    <td style={{ color: item.assignedTechnician ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{item.assignedTechnician || '—'}</td>
                    <td style={{ color: item.workstation ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{item.workstation || '—'}</td>
                  </>
                )}
                <td>
                  {item.isDispatched ? (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>
                  ) : (
                    <button className="btn btn-danger-text btn-sm" onClick={() => handleDeleteRepairItem(item.id)}>删除</button>
                  )}
                </td>
              </tr>
            ))}
            {repairItems.length === 0 && (
              <tr>
                <td colSpan={showDispatchColumns ? 13 : 11} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '36px 12px' }}>
                  暂无维修项目，请点击右上角按钮添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* 备件信息 */}
      <div className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>备件信息</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-default btn-sm" onClick={() => setShowUnifiedPicker(true)}>+ 添加备件</button>
          </div>
        </div>
        {selectedItemIds.filter(id => id.startsWith('part-')).length > 0 && (
          <div style={{ padding: '8px 16px', background: '#f0f7ff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>已选 {selectedItemIds.filter(id => id.startsWith('part-')).length} 项</span>
            <button className="btn btn-text btn-sm" onClick={() => setShowBatchRepairTypeModal(true)}>批量设置维修类型</button>
            <button className="btn btn-text btn-sm" onClick={() => setShowBatchChargeTypeModal(true)}>批量设置收费类型</button>
            <button className="btn btn-text btn-sm" onClick={() => setSelectedItemIds(current => current.filter(id => !id.startsWith('part-')))}>取消选择</button>
          </div>
        )}
        <div className="table-scroll-wrap table-scroll-wrap--line-items">
        <table className="data-table data-table--line-items">
          <thead>
            <tr>
              <th style={{ width: 48 }}>
                <input
                  type="checkbox"
                  checked={parts.filter(part => !part.isPicked).length > 0 && selectedItemIds.filter(id => id.startsWith('part-') && parts.some(part => `part-${part.id}` === id && !part.isPicked)).length === parts.filter(part => !part.isPicked).length}
                  onChange={() => {
                    const selectablePartIds = parts.filter(part => !part.isPicked).map(part => `part-${part.id}`)
                    const allSelected = selectablePartIds.every(id => selectedItemIds.includes(id))
                    setSelectedItemIds(current => allSelected ? current.filter(id => !id.startsWith('part-')) : [...current.filter(id => !id.startsWith('part-')), ...selectablePartIds])
                  }}
                />
              </th>
              <th className="col-code">备件代码</th><th className="col-part-name">备件名称</th><th className="col-package">套餐/活动</th><th className="col-num">单价</th>
              <th className="col-num">数量</th><th className="col-num">折扣(%)</th><th className="col-num">总价格</th><th className="col-select">维修类型</th><th className="col-labor-type">工种类型</th><th className="col-charge-type">收费类型</th><th className="col-supplier-direct">是否供应商直供</th>
              {showMaterialColumns && <><th className="col-staff">发料人</th><th className="col-staff">领料人</th></>}
              <th className="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            {parts.map(part => (
              <tr key={`part-${part.id}`} style={part.shortageSynced ? { background: '#fff7e6' } : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(`part-${part.id}`)}
                    disabled={part.isPicked}
                    onChange={() => setSelectedItemIds(current =>
                      current.includes(`part-${part.id}`)
                        ? current.filter(id => id !== `part-${part.id}`)
                        : [...current, `part-${part.id}`]
                    )}
                  />
                </td>
                <td className="col-code" style={{ color: 'rgba(0,0,0,0.45)' }}>{part.code}</td>
                <td className="col-part-name">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <span className="text-link">{part.name}</span>
                    {part.shortageSynced && <span className="tag tag-warning">已同步缺件单</span>}
                    {part.isUpsell && <span className="tag tag-warning">增项</span>}
                  </div>
                </td>
                <td className="col-package" style={{ color: 'var(--text-secondary)' }}>{part.packageName || '—'}</td>
                <td>¥{part.unitPrice}</td>
                <td>
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={part.qty}
                    disabled={part.isPicked}
                    onChange={event => handleChangePartQty(part.id, event.target.value)}
                    style={{ width: 70 }}
                  />
                </td>
                <td>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={part.discountRate ?? 100}
                      readOnly={part.isPicked}
                      onChange={event => handleChangePartDiscount(part.id, event.target.value)}
                      style={{
                        width: 76,
                        background: part.isPicked ? '#f5f6f8' : undefined,
                        color: part.isPicked ? 'var(--text-secondary)' : undefined,
                        cursor: part.isPicked ? 'not-allowed' : undefined,
                      }}
                    />
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>%</span>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>¥{part.fee}</td>
                <td className="col-select">
                  <select className="form-select" value={part.type} disabled={part.isPicked} onChange={event => handleChangePartType(part.id, event.target.value)}>
                    {REPAIR_TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
                  </select>
                </td>
                <td style={{ color: 'var(--text-tertiary)' }}>—</td>
                <td className="col-charge-type">{renderPartChargeTypeCell(part)}</td>
                <td className="col-supplier-direct">
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: part.isPicked ? 'not-allowed' : 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!part.isSupplierDirect}
                      disabled={part.isPicked}
                      onChange={event => setParts(current => current.map(row => row.id === part.id ? { ...row, isSupplierDirect: event.target.checked } : row))}
                    />
                    <span style={{ fontSize: 12 }}>{part.isSupplierDirect ? '是' : '否'}</span>
                  </label>
                </td>
                {showMaterialColumns && (
                  <>
                    <td style={{ color: part.issuer ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{getPersonDisplayName(part.issuer)}</td>
                    <td style={{ color: part.receiver ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{getPersonDisplayName(part.receiver)}</td>
                  </>
                )}
                <td>
                  {part.isPicked ? (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>
                  ) : (
                    <button className="btn btn-danger-text btn-sm" onClick={() => handleDeletePart(part.id)}>删除</button>
                  )}
                </td>
              </tr>
            ))}
            {parts.length === 0 && (
              <tr>
                <td colSpan={showMaterialColumns ? 14 : 12} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '36px 12px' }}>
                  暂无备件，请点击右上角按钮添加
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* 批量设置折扣弹窗 */}
      {showBatchDiscountModal && (
        <div className="modal-overlay" onClick={() => setShowBatchDiscountModal(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              批量设置折扣
              <button className="btn btn-text" onClick={() => setShowBatchDiscountModal(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">折扣比例（%）</label>
                <input
                  className="form-input"
                  type="number"
                  min={0}
                  max={100}
                  value={batchDiscountValue}
                  onChange={e => setBatchDiscountValue(e.target.value)}
                  placeholder="请输入折扣比例"
                />
                <div className="field-hint">将为选中的 {selectedItemIds.filter(id => id.startsWith('repair-')).length} 个维修项目设置折扣</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowBatchDiscountModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleBatchSetDiscount}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 批量设置维修类型弹窗 */}
      {showBatchRepairTypeModal && (
        <div className="modal-overlay" onClick={() => setShowBatchRepairTypeModal(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              批量设置维修类型
              <button className="btn btn-text" onClick={() => setShowBatchRepairTypeModal(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">维修类型</label>
                <select
                  className="form-select"
                  value={batchRepairType}
                  onChange={e => setBatchRepairType(e.target.value)}
                >
                  {REPAIR_TYPE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <div className="field-hint">将为选中的 {selectedItemIds.length} 项设置维修类型</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowBatchRepairTypeModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleBatchSetRepairType}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 批量设置收费类型弹窗 */}
      {showBatchChargeTypeModal && (
        <div className="modal-overlay" onClick={() => setShowBatchChargeTypeModal(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              批量设置收费类型
              <button className="btn btn-text" onClick={() => setShowBatchChargeTypeModal(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">收费类型</label>
                <ChargeTypePresetField
                  chargeType={batchChargeType}
                  splitValues={batchChargeSplitValues}
                  onChange={patch => {
                    setBatchChargeType(patch.chargeType)
                    setBatchChargeSplitValues(patch.splitValues)
                  }}
                />
                <div className="field-hint">将为选中的 {selectedItemIds.length} 项设置收费类型</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowBatchChargeTypeModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleBatchSetChargeType}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 批量导入弹窗 */}
      {showBatchImportModal && (
        <div className="modal-overlay" onClick={() => setShowBatchImportModal(false)}>
          <div className="modal" style={{ width: 720 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              批量导入项目/备件
              <button className="btn btn-text" onClick={() => setShowBatchImportModal(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <label className="form-label">导入数据</label>
                <textarea
                  className="form-input"
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="请粘贴 Excel 数据，每行一项，使用 Tab 分隔&#10;格式：名称[Tab]编码[Tab]单价[Tab]工时数或数量&#10;&#10;示例（维修项目）：&#10;更换机油滤清器	A11-001	45	0.5&#10;&#10;示例（备件）：&#10;机油滤清器	P-FLT-001	45	1"
                  rows={12}
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
                <div className="field-hint">
                  支持从 Excel 复制粘贴，自动识别项目和备件。工时数小于 100 的识别为维修项目，否则识别为备件。
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowBatchImportModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleBatchImport} disabled={!importText.trim()}>导入</button>
            </div>
          </div>
        </div>
      )}

      {/* 添加套餐包弹窗 */}
      {showRepairPackageModal && (
        <div className="modal-overlay" onClick={() => setShowRepairPackageModal(false)}>
          <div className="modal" style={{ width: 1280, maxWidth: 'calc(100vw - 32px)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              套餐模板
              <button className="btn btn-text" onClick={() => setShowRepairPackageModal(false)}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              {/* 筛选条件 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px', marginBottom: 16 }}>
                <div className="form-item">
                  <label className="form-label">套餐模板编号：</label>
                  <input 
                    className="form-input"
                    placeholder="请输入"
                  />
                </div>
                <div className="form-item">
                  <label className="form-label">套餐模板名称：</label>
                  <input 
                    className="form-input"
                    placeholder="请输入"
                  />
                </div>
                <div className="form-item">
                  <label className="form-label">套餐模板类型：</label>
                  <select
                    className="form-input"
                    value={packageTemplateType}
                    onChange={e => setPackageTemplateType(e.target.value)}
                  >
                    <option value="">请选择</option>
                    {PACKAGE_TEMPLATE_TYPE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label">是否自定义：</label>
                  <select className="form-input">
                    <option value="">请选择</option>
                    <option value="是">是</option>
                    <option value="否">否</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <DateRangeField
                    label="创建时间："
                    start={packageCreateDateStart}
                    end={packageCreateDateEnd}
                    startPlaceholder="开始日期"
                    endPlaceholder="结束日期"
                    onChangeStart={setPackageCreateDateStart}
                    onChangeEnd={setPackageCreateDateEnd}
                    stacked
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <button className="btn btn-primary btn-sm">查询</button>
                <button className="btn btn-default btn-sm">重置</button>
              </div>

              {/* 提示信息 */}
              <div style={{ 
                background: '#e6f7ff', 
                border: '1px solid #91d5ff', 
                borderRadius: 4, 
                padding: '8px 12px', 
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Info size={14} style={{ color: '#1890ff', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#595959' }}>可以双击行选择</span>
                <div style={{ flex: 1 }} />
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleConfirmAddPackage}
                  disabled={!selectedPackageId}
                >
                  确认
                </button>
              </div>

              <div className="package-template-picker">
                <div className="package-template-picker__list">
                  <div style={{ border: '1px solid var(--border-light)', borderRadius: 4, overflow: 'auto', maxHeight: 420 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th style={{ width: 44 }}></th>
                          <th>套餐模板编号</th>
                          <th>套餐模板名称</th>
                          <th style={{ width: 96 }}>套餐模板类型</th>
                          <th style={{ width: 80 }}>适用类型</th>
                          <th style={{ width: 88 }}>是否自定义</th>
                          <th style={{ width: 100 }}>备注</th>
                        </tr>
                      </thead>
                      <tbody>
                        {REPAIR_PACKAGE_TEMPLATES.map(template => (
                          <tr
                            key={template.id}
                            style={{ cursor: 'pointer', background: selectedPackageId === template.id ? '#e6f7ff' : undefined }}
                            onClick={() => setSelectedPackageId(template.id)}
                            onDoubleClick={() => handleAddRepairPackage(template.id)}
                          >
                            <td><input type="radio" name="package" checked={selectedPackageId === template.id} readOnly /></td>
                            <td>{template.code}</td>
                            <td>{template.name}</td>
                            <td>{template.type}</td>
                            <td>{template.applicableType}</td>
                            <td>{template.isCustom}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{template.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="package-template-picker__preview">
                  <div className="package-template-picker__preview-title">套餐内容预览</div>
                  {selectedPackageTemplate ? (
                    <>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPackageTemplate.name}</span>
                        <span style={{ margin: '0 8px' }}>·</span>
                        {selectedPackageTemplate.code}
                        <span className="tag tag-pending" style={{ marginLeft: 8 }}>{selectedPackageTemplate.type}</span>
                      </div>
                      <div className="package-template-picker__preview-section">
                        <div className="package-template-picker__preview-label">
                          维修项目
                          <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                            {selectedPackageTemplate.projects.length} 项
                          </span>
                        </div>
                        {selectedPackageTemplate.projects.length > 0 ? (
                          <table className="data-table data-table--compact">
                            <thead>
                              <tr>
                                <th>项目编号</th>
                                <th>项目名称</th>
                                <th>工种</th>
                                <th style={{ width: 56 }}>工时</th>
                                <th style={{ width: 72 }}>单价</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPackageTemplate.projects.map(project => (
                                <tr key={project.code}>
                                  <td style={{ color: 'var(--text-secondary)' }}>{project.code}</td>
                                  <td>{project.name}</td>
                                  <td>{project.laborType}</td>
                                  <td>{project.hours}</td>
                                  <td>¥{project.unitPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="package-template-picker__empty">暂无维修项目</div>
                        )}
                      </div>
                      <div className="package-template-picker__preview-section">
                        <div className="package-template-picker__preview-label">
                          备件
                          <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', marginLeft: 6 }}>
                            {selectedPackageTemplate.parts.length} 项
                          </span>
                        </div>
                        {selectedPackageTemplate.parts.length > 0 ? (
                          <table className="data-table data-table--compact">
                            <thead>
                              <tr>
                                <th>备件编号</th>
                                <th>备件名称</th>
                                <th style={{ width: 56 }}>数量</th>
                                <th style={{ width: 72 }}>单价</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPackageTemplate.parts.map(part => (
                                <tr key={part.code}>
                                  <td style={{ color: 'var(--text-secondary)' }}>{part.code}</td>
                                  <td>{part.name}</td>
                                  <td>{part.qty}</td>
                                  <td>¥{part.unitPrice}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="package-template-picker__empty">暂无备件</div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="package-template-picker__empty" style={{ marginTop: 48 }}>
                      请在左侧选择套餐模板，预览包含的维修项目与备件
                    </div>
                  )}
                </div>
              </div>

              {/* 分页 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>共 74 条记录</span>
                <button className="pagination-btn" disabled>«</button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">4</button>
                <button className="pagination-btn">5</button>
                <button className="pagination-btn">6</button>
                <button className="pagination-btn">7</button>
                <button className="pagination-btn">8</button>
                <button className="pagination-btn">»</button>
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>10 条/页</span>
                <button className="btn btn-text btn-sm">跳至</button>
                <input 
                  type="text" 
                  style={{ 
                    width: 50, 
                    height: 28, 
                    border: '1px solid #d9d9d9', 
                    borderRadius: 4, 
                    textAlign: 'center',
                    fontSize: 13
                  }} 
                  defaultValue="1"
                />
                <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>页</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统一的项目/备件选择器 */}
      {showUnifiedPicker && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 1420, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh' }}>
            <div className="modal-header">
              添加项目/备件
              <button className="btn btn-text" onClick={() => { setShowUnifiedPicker(false); setPickerBatchDiscount(''); setPickerBatchRepairType(''); setPickerBatchChargeType(''); }} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 0 }}>
              {/* Tab 切换 */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setUnifiedPickerTab('project')}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: unifiedPickerTab === 'project' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: unifiedPickerTab === 'project' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: unifiedPickerTab === 'project' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  维修项目
                </button>
                <button
                  type="button"
                  onClick={() => setUnifiedPickerTab('part')}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: unifiedPickerTab === 'part' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: unifiedPickerTab === 'part' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: unifiedPickerTab === 'part' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  备件
                </button>
              </div>

              {/* 维修项目 Tab 内容 */}
              {unifiedPickerTab === 'project' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                    <div className="form-item">
                      <label className="form-label">项目编号：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目编号" value={repairProjectCodeFilter} onChange={e => setRepairProjectCodeFilter(e.target.value.toUpperCase())} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">项目名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目名称" value={repairProjectNameFilter} onChange={e => setRepairProjectNameFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">备件名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件名称" value={repairProjectPartNameFilter} onChange={e => setRepairProjectPartNameFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">备件编号：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件编号" value={repairProjectPartCodeFilter} onChange={e => setRepairProjectPartCodeFilter(e.target.value.toUpperCase())} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary">查询</button>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={14} strokeWidth={2} />
                    <span>
                      已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedProjectIds.length}</span> 项，
                      <button
                        type="button"
                        style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => setSelectedProjectIds([])}
                      >
                        清除选择
                      </button>
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { handleConfirmRepairProjects(); setShowUnifiedPicker(false); setPickerBatchDiscount(''); setPickerBatchRepairType(''); setPickerBatchChargeType(''); }}>确认</button>
                  </div>

                  {selectedProjectIds.length > 0 && (
                    <div style={{ padding: '10px 14px', background: '#fafafa', border: '1px solid var(--border-light)', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>批量设置（应用于本次添加）：</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>折扣(%)</label>
                        <input
                          className="form-input"
                          type="number"
                          min={0}
                          max={100}
                          style={{ width: 96, height: 28 }}
                          placeholder="不修改"
                          value={pickerBatchDiscount}
                          onChange={e => setPickerBatchDiscount(e.target.value)}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>维修类型</label>
                        <select className="form-select" style={{ width: 140, height: 28 }} value={pickerBatchRepairType} onChange={e => setPickerBatchRepairType(e.target.value)}>
                          <option value="">不修改</option>
                          {REPAIR_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>收费类型</label>
                        <select className="form-select" style={{ width: 130, height: 28 }} value={pickerBatchChargeType} onChange={e => setPickerBatchChargeType(e.target.value)}>
                          <option value="">不修改</option>
                          {CHARGE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <button className="btn btn-text btn-sm" onClick={() => { setPickerBatchDiscount(''); setPickerBatchRepairType(''); setPickerBatchChargeType(''); }}>重置</button>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 16, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 46 }}>
                              <input
                                type="checkbox"
                                checked={repairProjectResults.length > 0 && repairProjectResults.every(option => selectedProjectIds.includes(option.id))}
                                onChange={event => {
                                  if (event.target.checked) {
                                    setSelectedProjectIds(Array.from(new Set([...selectedProjectIds, ...repairProjectResults.map(option => option.id)])))
                                  } else {
                                    setSelectedProjectIds(current => current.filter(id => !repairProjectResults.some(option => option.id === id)))
                                  }
                                }}
                              />
                            </th>
                            <th>维修项目编号</th>
                            <th>维修项目名称</th>
                            <th>工种类别</th>
                            <th>是否自定义</th>
                            <th>工时</th>
                            <th>备注</th>
                          </tr>
                        </thead>
                        <tbody>
                          {repairProjectResults.map(option => {
                            const checked = selectedProjectIds.includes(option.id)
                            return (
                              <tr
                                key={option.id}
                                style={{ background: checked ? 'rgba(47,140,255,0.12)' : undefined, cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedProjectIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                }}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={event => {
                                      event.stopPropagation()
                                      setSelectedProjectIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                    }}
                                  />
                                </td>
                                <td>{option.code}</td>
                                <td>{option.name}</td>
                                <td>{option.laborType}</td>
                                <td>{option.custom}</td>
                                <td>{option.hours}</td>
                                <td>{option.note || '—'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16, color: 'rgba(0,0,0,0.65)' }}>
                        <span>共 2165 条记录</span>
                        <div className="pagination" style={{ padding: 0 }}>
                          <div className="page-btn">‹</div>
                          <div className="page-btn">1</div>
                          <div className="page-btn">…</div>
                          <div className="page-btn">212</div>
                          <div className="page-btn">213</div>
                          <div className="page-btn active">214</div>
                          <div className="page-btn">215</div>
                          <div className="page-btn">216</div>
                          <div className="page-btn">217</div>
                          <div className="page-btn">›</div>
                        </div>
                        <div className="form-select" style={{ width: 100, display: 'flex', alignItems: 'center' }}>10 条/页</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>跳至</span>
                          <input className="form-input" style={{ width: 56 }} defaultValue="214" />
                          <span>页</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                        <strong style={{ fontSize: 13 }}>已选维修项目</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedRepairProjectPreview.length} 项</span>
                      </div>
                      <div style={{ maxHeight: 430, overflowY: 'auto', padding: 12 }}>
                        {selectedRepairProjectPreview.length === 0 ? (
                          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                        ) : (
                          selectedRepairProjectPreview.map(item => {
                            const suggestedPartIds = REPAIR_PROJECT_PART_SUGGESTIONS[item.id] ?? []
                            return (
                              <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                                  </div>
                                  <button className="btn btn-text btn-sm" onClick={() => setSelectedProjectIds(current => current.filter(id => id !== item.id))}>移除</button>
                                </div>
                                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                                  <span>工种：{item.laborType}</span>
                                  <span>工时：{item.hours}</span>
                                </div>
                                {suggestedPartIds.length > 0 && (
                                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border-light)' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>关联备件</div>
                                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ color: 'var(--text-tertiary)' }}>
                                          <th style={{ width: 24, padding: '4px 0', textAlign: 'left', fontWeight: 500 }}></th>
                                          <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件编号</th>
                                          <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件名称</th>
                                          <th style={{ width: 64, padding: '4px 0', textAlign: 'right', fontWeight: 500 }}>数量</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {suggestedPartIds.map(partId => {
                                          const partOption = PART_PICKER_OPTIONS.find(option => option.id === partId)
                                          if (!partOption) return null
                                          const sel = repairProjectPartSelection[item.id]?.[partId] ?? { checked: false, qty: partOption.qty }
                                          const updateSel = (next: { checked: boolean; qty: number }) => {
                                            setRepairProjectPartSelection(current => ({
                                              ...current,
                                              [item.id]: {
                                                ...(current[item.id] ?? {}),
                                                [partId]: next,
                                              },
                                            }))
                                          }
                                          return (
                                            <tr key={partId}>
                                              <td style={{ padding: '4px 0' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={sel.checked}
                                                  onChange={event => updateSel({ ...sel, checked: event.target.checked })}
                                                />
                                              </td>
                                              <td style={{ padding: '4px 4px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{partOption.code}</td>
                                              <td style={{ padding: '4px 4px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partOption.name}</td>
                                              <td style={{ padding: '4px 0', textAlign: 'right' }}>
                                                <input
                                                  className="form-input"
                                                  type="number"
                                                  min={1}
                                                  value={sel.qty}
                                                  onChange={event => updateSel({ ...sel, qty: Math.max(1, Number(event.target.value) || 1) })}
                                                  style={{ width: 60, height: 26, padding: '0 6px', fontSize: 12 }}
                                                />
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 备件 Tab 内容 */}
              {unifiedPickerTab === 'part' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                      <button
                        type="button"
                        className={`btn ${partPickerTab === 'part' ? 'btn-primary' : 'btn-default'} btn-sm`}
                        onClick={() => setPartPickerTab('part')}
                      >
                        备件查询
                      </button>
                      <button
                        type="button"
                        className={`btn ${partPickerTab === 'kit' ? 'btn-primary' : 'btn-default'} btn-sm`}
                        onClick={() => setPartPickerTab('kit')}
                      >
                        套件查询
                      </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end' }}>
                      <div className="form-item">
                        <label className="form-label">出库价区间：</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input className="form-input" placeholder="最低价" value={partPriceMinFilter} onChange={e => setPartPriceMinFilter(e.target.value)} />
                          <span>-</span>
                          <input className="form-input" placeholder="最高价" value={partPriceMaxFilter} onChange={e => setPartPriceMaxFilter(e.target.value)} />
                        </div>
                      </div>
                      <div className="form-item">
                        <label className="form-label">编号：</label>
                        <input className="form-input" placeholder="请输入备件编号" value={partCodeFilter} onChange={e => setPartCodeFilter(e.target.value)} />
                      </div>
                      <div className="form-item">
                        <label className="form-label">名称：</label>
                        <input className="form-input" placeholder="请输入备件名称" value={partNameFilter} onChange={e => setPartNameFilter(e.target.value)} />
                      </div>
                      <div className="form-item">
                        <label className="form-label">自定义名称：</label>
                        <input className="form-input" placeholder="请输入自定义名称" value={partAliasFilter} onChange={e => setPartAliasFilter(e.target.value)} />
                      </div>
                      <button className="btn btn-primary">查询</button>
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                      <div className="form-item">
                        <label className="form-label">适用车型：</label>
                        <input className="form-input" placeholder="请输入适用车型" value={partVehicleFilter} onChange={e => setPartVehicleFilter(e.target.value)} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={hideZeroStock} onChange={e => setHideZeroStock(e.target.checked)} />
                        <span>去掉零库存</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', userSelect: 'none' }}>
                        <input type="checkbox" checked={showSensitivePartInfo} onChange={e => setShowSensitivePartInfo(e.target.checked)} />
                        <span>显示敏感信息</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={14} strokeWidth={2} />
                    <span>
                      已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedPartPickerIds.length}</span> 项，
                      <button
                        type="button"
                        style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => setSelectedPartPickerIds([])}
                      >
                        清除选择
                      </button>
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => { handleConfirmParts(); setShowUnifiedPicker(false); setPickerBatchDiscount(''); setPickerBatchRepairType(''); setPickerBatchChargeType(''); }}>确认</button>
                  </div>

                  {selectedPartPickerIds.length > 0 && (
                    <div style={{ padding: '10px 14px', background: '#fafafa', border: '1px solid var(--border-light)', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>批量设置（应用于本次添加）：</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>维修类型</label>
                        <select className="form-select" style={{ width: 140, height: 28 }} value={pickerBatchRepairType} onChange={e => setPickerBatchRepairType(e.target.value)}>
                          <option value="">不修改</option>
                          {REPAIR_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>收费类型</label>
                        <select className="form-select" style={{ width: 130, height: 28 }} value={pickerBatchChargeType} onChange={e => setPickerBatchChargeType(e.target.value)}>
                          <option value="">不修改</option>
                          {CHARGE_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <button className="btn btn-text btn-sm" onClick={() => { setPickerBatchRepairType(''); setPickerBatchChargeType(''); }}>重置</button>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 420px', gap: 16, alignItems: 'start' }}>
                    <div style={{ minWidth: 0 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 46 }}>
                              <input
                                type="checkbox"
                                checked={partPickerResults.length > 0 && partPickerResults.every(option => selectedPartPickerIds.includes(option.id))}
                                onChange={event => {
                                  if (event.target.checked) {
                                    setSelectedPartPickerIds(Array.from(new Set([...selectedPartPickerIds, ...partPickerResults.map(option => option.id)])))
                                  } else {
                                    setSelectedPartPickerIds(current => current.filter(id => !partPickerResults.some(option => option.id === id)))
                                  }
                                }}
                              />
                            </th>
                            <th>备件编号</th>
                            <th>备件名称</th>
                            <th>库存数量</th>
                            <th>出库价</th>
                            {showSensitivePartInfo && <th>零售指导价</th>}
                            <th>适用车型</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partPickerResults.map(option => {
                            const checked = selectedPartPickerIds.includes(option.id)
                            return (
                              <tr
                                key={option.id}
                                style={{ background: checked ? 'rgba(47,140,255,0.12)' : undefined, cursor: 'pointer' }}
                                onClick={() => {
                                  setSelectedPartPickerIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                }}
                              >
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={event => {
                                      event.stopPropagation()
                                      setSelectedPartPickerIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                    }}
                                  />
                                </td>
                                <td>{option.code}</td>
                                <td>{option.name}</td>
                                <td>{option.stock}</td>
                                <td>{formatMoney(option.unitPrice)}</td>
                                {showSensitivePartInfo && <td>{formatMoney(option.retailPrice)}</td>}
                                <td>{option.vehicleModel}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                        <strong style={{ fontSize: 13 }}>已选备件</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPartPickerPreview.length} 项</span>
                      </div>
                      <div style={{ maxHeight: 430, overflowY: 'auto', padding: 12 }}>
                        {selectedPartPickerPreview.length === 0 ? (
                          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                        ) : (
                          selectedPartPickerPreview.map(item => (
                            <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                  <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                                </div>
                                <button className="btn btn-text btn-sm" onClick={() => setSelectedPartPickerIds(current => current.filter(id => id !== item.id))}>移除</button>
                              </div>
                              <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                                <span>数量：{item.qty}</span>
                                <span>库存：{item.stock}</span>
                                <span>单价：{formatMoney(item.unitPrice)}</span>
                                <span>金额：{formatMoney(item.unitPrice * item.qty)}</span>
                              </div>
                              <div style={{ marginTop: 6, color: 'var(--text-tertiary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>适用车型：{item.vehicleModel}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showRepairProjectPicker && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 1420, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh' }}>
            <div className="modal-header">
              维修项目
              <button className="btn btn-text" onClick={() => setShowRepairProjectPicker(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                <div className="form-item">
                  <label className="form-label">项目编号：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目编号" value={repairProjectCodeFilter} onChange={e => setRepairProjectCodeFilter(e.target.value.toUpperCase())} />
                </div>
                <div className="form-item">
                  <label className="form-label">项目名称：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目名称" value={repairProjectNameFilter} onChange={e => setRepairProjectNameFilter(e.target.value)} />
                </div>
                <div className="form-item">
                  <label className="form-label">备件名称：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件名称" value={repairProjectPartNameFilter} onChange={e => setRepairProjectPartNameFilter(e.target.value)} />
                </div>
                <div className="form-item">
                  <label className="form-label">备件编号：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件编号" value={repairProjectPartCodeFilter} onChange={e => setRepairProjectPartCodeFilter(e.target.value.toUpperCase())} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary">查询</button>
                </div>
              </div>

              <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} strokeWidth={2} />
                <span>
                  已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedProjectIds.length}</span> 项，
                  <button
                    type="button"
                    style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => setSelectedProjectIds([])}
                  >
                    清除选择
                  </button>
                </span>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleConfirmRepairProjects}>确认</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
                <div style={{ minWidth: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 46 }}>
                          <input
                            type="checkbox"
                            checked={repairProjectResults.length > 0 && repairProjectResults.every(option => selectedProjectIds.includes(option.id))}
                            onChange={event => {
                              if (event.target.checked) {
                                setSelectedProjectIds(Array.from(new Set([...selectedProjectIds, ...repairProjectResults.map(option => option.id)])))
                              } else {
                                setSelectedProjectIds(current => current.filter(id => !repairProjectResults.some(option => option.id === id)))
                              }
                            }}
                          />
                        </th>
                        <th>维修项目编号</th>
                        <th>维修项目名称</th>
                        <th>工种类别</th>
                        <th>是否自定义</th>
                        <th>工时</th>
                        <th>备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairProjectResults.map(option => {
                        const checked = selectedProjectIds.includes(option.id)
                        return (
                          <tr
                            key={option.id}
                            style={{ background: checked ? 'rgba(47,140,255,0.12)' : undefined, cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedProjectIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={event => {
                                  event.stopPropagation()
                                  setSelectedProjectIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                }}
                              />
                            </td>
                            <td>{option.code}</td>
                            <td>{option.name}</td>
                            <td>{option.laborType}</td>
                            <td>{option.custom}</td>
                            <td>{option.hours}</td>
                            <td>{option.note || '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16, color: 'rgba(0,0,0,0.65)' }}>
                    <span>共 2165 条记录</span>
                    <div className="pagination" style={{ padding: 0 }}>
                      <div className="page-btn">‹</div>
                      <div className="page-btn">1</div>
                      <div className="page-btn">…</div>
                      <div className="page-btn">212</div>
                      <div className="page-btn">213</div>
                      <div className="page-btn active">214</div>
                      <div className="page-btn">215</div>
                      <div className="page-btn">216</div>
                      <div className="page-btn">217</div>
                      <div className="page-btn">›</div>
                    </div>
                    <div className="form-select" style={{ width: 100, display: 'flex', alignItems: 'center' }}>10 条/页</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>跳至</span>
                      <input className="form-input" style={{ width: 56 }} defaultValue="214" />
                      <span>页</span>
                    </div>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                  <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                    <strong style={{ fontSize: 13 }}>已选维修项目</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedRepairProjectPreview.length} 项</span>
                  </div>
                  <div style={{ maxHeight: 430, overflowY: 'auto', padding: 12 }}>
                    {selectedRepairProjectPreview.length === 0 ? (
                      <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                    ) : (
                      selectedRepairProjectPreview.map(item => {
                        const suggestedPartIds = REPAIR_PROJECT_PART_SUGGESTIONS[item.id] ?? []
                        return (
                          <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                              </div>
                              <button className="btn btn-text btn-sm" onClick={() => setSelectedProjectIds(current => current.filter(id => id !== item.id))}>移除</button>
                            </div>
                            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                              <span>工种：{item.laborType}</span>
                              <span>工时：{item.hours}</span>
                              <span>类型：{item.type}</span>
                              <span>收费：{item.chargeType}</span>
                            </div>
                            {suggestedPartIds.length > 0 && (
                              <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border-light)' }}>
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>关联备件</div>
                                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                  <thead>
                                    <tr style={{ color: 'var(--text-tertiary)' }}>
                                      <th style={{ width: 24, padding: '4px 0', textAlign: 'left', fontWeight: 500 }}></th>
                                      <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件编号</th>
                                      <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件名称</th>
                                      <th style={{ width: 64, padding: '4px 0', textAlign: 'right', fontWeight: 500 }}>数量</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {suggestedPartIds.map(partId => {
                                      const partOption = PART_PICKER_OPTIONS.find(option => option.id === partId)
                                      if (!partOption) return null
                                      const sel = repairProjectPartSelection[item.id]?.[partId] ?? { checked: false, qty: partOption.qty }
                                      const updateSel = (next: { checked: boolean; qty: number }) => {
                                        setRepairProjectPartSelection(current => ({
                                          ...current,
                                          [item.id]: {
                                            ...(current[item.id] ?? {}),
                                            [partId]: next,
                                          },
                                        }))
                                      }
                                      return (
                                        <tr key={partId}>
                                          <td style={{ padding: '4px 0' }}>
                                            <input
                                              type="checkbox"
                                              checked={sel.checked}
                                              onChange={event => updateSel({ ...sel, checked: event.target.checked })}
                                            />
                                          </td>
                                          <td style={{ padding: '4px 4px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{partOption.code}</td>
                                          <td style={{ padding: '4px 4px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partOption.name}</td>
                                          <td style={{ padding: '4px 0', textAlign: 'right' }}>
                                            <input
                                              className="form-input"
                                              type="number"
                                              min={1}
                                              value={sel.qty}
                                              onChange={event => updateSel({ ...sel, qty: Math.max(1, Number(event.target.value) || 1) })}
                                              style={{ width: 60, height: 26, padding: '0 6px', fontSize: 12 }}
                                            />
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPartPicker && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 1420, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh' }}>
            <div className="modal-header">
              添加备件
              <button className="btn btn-text" onClick={() => setShowPartPicker(false)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 18 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                {[
                  { key: 'part', label: '备件查询' },
                  { key: 'kit', label: '套件查询' },
                ].map(tab => {
                  const active = partPickerTab === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-default'}`}
                      onClick={() => {
                        setPartPickerTab(tab.key as 'part' | 'kit')
                        setSelectedPartPickerIds([])
                      }}
                      style={{ minWidth: 88 }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr 1.1fr 1.1fr 1.2fr auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                <div className="form-item">
                  <label className="form-label">出库价：</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: 8, alignItems: 'center' }}>
                    <input className="form-input" placeholder="最低价" value={partPriceMinFilter} onChange={e => setPartPriceMinFilter(e.target.value.replace(/[^\d.]/g, ''))} />
                    <span style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)' }}>-</span>
                    <input className="form-input" placeholder="最高价" value={partPriceMaxFilter} onChange={e => setPartPriceMaxFilter(e.target.value.replace(/[^\d.]/g, ''))} />
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label">{partPickerTab === 'part' ? '备件编号：' : '套件编号：'}</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder={`请输入${partPickerTab === 'part' ? '备件' : '套件'}编号`} value={partCodeFilter} onChange={e => setPartCodeFilter(e.target.value.toUpperCase())} />
                </div>
                <div className="form-item">
                  <label className="form-label">{partPickerTab === 'part' ? '备件名称：' : '套件名称：'}</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder={`请输入${partPickerTab === 'part' ? '备件' : '套件'}名称`} value={partNameFilter} onChange={e => setPartNameFilter(e.target.value)} />
                </div>
                <div className="form-item">
                  <label className="form-label">自定义名称：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入自定义名称" value={partAliasFilter} onChange={e => setPartAliasFilter(e.target.value)} />
                </div>
                <div className="form-item">
                  <label className="form-label">适用车型：</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入适用车型" value={partVehicleFilter} onChange={e => setPartVehicleFilter(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-default" type="button" onClick={resetPartPickerFilters}>重置</button>
                  <button className="btn btn-primary" type="button">查询</button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 12, color: 'rgba(0,0,0,0.72)', fontSize: 13 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={hideZeroStock} onChange={e => setHideZeroStock(e.target.checked)} />
                  <span>去掉零库存</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showSensitivePartInfo} onChange={e => setShowSensitivePartInfo(e.target.checked)} />
                  <span>显示敏感信息</span>
                </label>
              </div>

              <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} strokeWidth={2} />
                <span>
                  已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedPartPickerIds.length}</span> 项，
                  <button
                    type="button"
                    style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                    onClick={() => setSelectedPartPickerIds([])}
                  >
                    清除选择
                  </button>
                </span>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleConfirmParts}>确认</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
                <div style={{ minWidth: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 46 }}>
                          <input
                            type="checkbox"
                            checked={partPickerResults.length > 0 && partPickerResults.every(option => selectedPartPickerIds.includes(option.id))}
                            onChange={event => {
                              if (event.target.checked) {
                                setSelectedPartPickerIds(Array.from(new Set([...selectedPartPickerIds, ...partPickerResults.map(option => option.id)])))
                              } else {
                                setSelectedPartPickerIds(current => current.filter(id => !partPickerResults.some(option => option.id === id)))
                              }
                            }}
                          />
                        </th>
                        <th>{partPickerTab === 'part' ? '备件编号' : '套件编号'}</th>
                        <th>{partPickerTab === 'part' ? '备件名称' : '套件名称'}</th>
                        <th>自定义名称</th>
                        <th>适用车型</th>
                        <th className="text-right">库存数量</th>
                        <th className="text-right">出库价</th>
                        {showSensitivePartInfo && <th className="text-right">零售指导价</th>}
                        <th>维修类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partPickerResults.map(option => {
                        const checked = selectedPartPickerIds.includes(option.id)
                        return (
                          <tr
                            key={option.id}
                            style={{ background: checked ? 'rgba(47,140,255,0.12)' : undefined, cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedPartPickerIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                            }}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={event => {
                                  event.stopPropagation()
                                  setSelectedPartPickerIds(current => checked ? current.filter(id => id !== option.id) : [...current, option.id])
                                }}
                              />
                            </td>
                            <td>{option.code}</td>
                            <td>{option.name}</td>
                            <td>{option.alias}</td>
                            <td>{option.vehicleModel}</td>
                            <td className="text-right">{option.stock}</td>
                            <td className="text-right">{formatMoney(option.unitPrice)}</td>
                            {showSensitivePartInfo && <td className="text-right">{formatMoney(option.retailPrice)}</td>}
                            <td>{option.type}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 16, color: 'rgba(0,0,0,0.65)' }}>
                    <span>共 2165 条记录</span>
                    <div className="pagination" style={{ padding: 0 }}>
                      <div className="page-btn">‹</div>
                      <div className="page-btn">1</div>
                      <div className="page-btn">…</div>
                      <div className="page-btn">108</div>
                      <div className="page-btn active">109</div>
                      <div className="page-btn">110</div>
                      <div className="page-btn">…</div>
                      <div className="page-btn">217</div>
                      <div className="page-btn">›</div>
                    </div>
                    <div className="form-select" style={{ width: 100, display: 'flex', alignItems: 'center' }}>10 条/页</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>跳至</span>
                      <input className="form-input" style={{ width: 56 }} defaultValue="109" />
                      <span>页</span>
                    </div>
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                  <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                    <strong style={{ fontSize: 13 }}>已选备件明细</strong>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPartPickerPreview.length} 项</span>
                  </div>
                  <div style={{ maxHeight: 430, overflowY: 'auto', padding: 12 }}>
                    {selectedPartPickerPreview.length === 0 ? (
                      <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                    ) : (
                      selectedPartPickerPreview.map(item => (
                        <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                              <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                            </div>
                            <button className="btn btn-text btn-sm" onClick={() => setSelectedPartPickerIds(current => current.filter(id => id !== item.id))}>移除</button>
                          </div>
                          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                            <span>数量：{item.qty}</span>
                            <span>库存：{item.stock}</span>
                            <span>单价：{formatMoney(item.unitPrice)}</span>
                            <span>金额：{formatMoney(item.unitPrice * item.qty)}</span>
                          </div>
                          <div style={{ marginTop: 6, color: 'var(--text-tertiary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>适用车型：{item.vehicleModel}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>其他费用</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-default btn-sm" onClick={handleAddAdditionalFee}>+ 添加其他费用</button>
          </div>
        </div>
        <div>
          <table className="data-table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>费用名称</th><th>金额</th><th style={{ minWidth: 320 }}>收费类型</th><th>关联单据号</th><th>关联单据类型</th><th>备注</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {additionalFees.length > 0 ? additionalFees.map(item => (
                <tr key={item.id}>
                  <td>
                    <input
                      className="form-input"
                      value={item.name}
                      placeholder="请输入费用名称"
                      onChange={event => handleChangeAdditionalFeeName(item.id, event.target.value)}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>¥</span>
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={item.fee}
                        onChange={event => handleChangeAdditionalFeeAmount(item.id, event.target.value)}
                        style={{ width: 120 }}
                      />
                    </div>
                  </td>
                  <td>
                    <ChargeTypeField
                      scope="extra"
                      itemId={item.id}
                      item={item}
                      locked={false}
                      openDropdownKey={openChargeTypeDropdownKey}
                      setOpenDropdownKey={setOpenChargeTypeDropdownKey}
                      openSplitKey={openChargeSplitEditorKey}
                      setOpenSplitKey={setOpenChargeSplitEditorKey}
                      onUpdate={patch => setAdditionalFees(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, ...patch } : currentItem))}
                    />
                  </td>
                  <td>
                    <input
                      className="form-input"
                      value={item.relatedDocNo || ''}
                      placeholder="取送车/道路救援单号"
                      onChange={event => setAdditionalFees(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, relatedDocNo: event.target.value } : currentItem))}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={item.relatedDocType || '其他'}
                      onChange={event => setAdditionalFees(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, relatedDocType: event.target.value as (typeof RELATED_DOC_TYPE_OPTIONS)[number] } : currentItem))}
                      style={{ width: '100%' }}
                    >
                      {RELATED_DOC_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-input"
                      value={item.note || ''}
                      placeholder="请输入备注"
                      onChange={event => setAdditionalFees(current => current.map(currentItem => currentItem.id === item.id ? { ...currentItem, note: event.target.value } : currentItem))}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td><button className="btn btn-danger-text btn-sm" onClick={() => handleDeleteAdditionalFee(item.id)}>删除</button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} style={{ padding: '20px 16px', textAlign: 'center', color: 'rgba(0,0,0,0.45)' }}>
                    暂无其他费用
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 费用汇总 */}
      <div className="card card-odin card-fee-summary">
        <div className="card-title">费用汇总</div>
        {(() => {
          const chargeSummary = [...repairItems, ...parts, ...additionalFees].reduce((acc, item) => {
            const allocation = allocateCharge(item)
            acc.self += allocation.self
            acc.warranty += allocation.warranty
            acc.insurance += allocation.insurance
            acc.internal += allocation.internal
            return acc
          }, { self: 0, warranty: 0, insurance: 0, internal: 0 })

          return (
            <FeeSummaryPanel
              laborTotal={laborTotal}
              partsTotal={partsTotal}
              otherFeeTotal={additionalFeeTotal}
              discountSummary={discountSummary}
              total={total}
              chargeSummary={chargeSummary}
            />
          )
        })()}
      </div>

      {/* 客户确认 & 附件上传（保存草稿后展开） */}
      {draftSaved && (
        <div className="card card-odin" style={{ borderLeft: customerConfirmed ? '3px solid #52c41a' : '3px solid #faad14' }}>
          <div className="section-header" style={{ alignItems: 'center' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>客户确认 & 附件上传</div>
            <span className={`tag ${customerConfirmed ? 'tag-done' : 'tag-warning'}`} style={{ marginLeft: 8 }}>
              {customerConfirmed ? `客户已确认 · ${customerConfirmAt}` : '待客户确认'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-tertiary)' }}>推送车主后委托书将进入「待派工」</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 12 }}>
            <div style={{ border: '1px dashed var(--border-light)', borderRadius: 8, padding: 14, background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <strong style={{ fontSize: 13 }}>附件上传</strong>
                <button className="btn btn-default btn-sm" onClick={handleAddDraftAttachment}>
                  <Upload size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                  添加附件
                </button>
              </div>
              {draftAttachments.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  支持上传 jpg / png / pdf，单个不超过 10MB
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {draftAttachments.map(file => (
                    <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: '#fff', border: '1px solid var(--border-light)', borderRadius: 6 }}>
                      <FilePlus2 size={14} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                      <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)' }}>{file.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{file.sizeKB.toLocaleString()} KB</span>
                      <button className="btn btn-text btn-sm" onClick={() => handleRemoveDraftAttachment(file.id)} style={{ color: '#ff4d4f' }}>移除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 8, padding: 14, background: '#fff' }}>
              <strong style={{ fontSize: 13 }}>客户确认</strong>
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                客户已阅读维修方案、报价明细及附件信息，并同意按照本工单进行作业。
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!customerConfirmed ? (
                  <button className="btn btn-primary btn-sm" onClick={handleCustomerConfirm}>
                    <CheckCircle2 size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                    客户已确认
                  </button>
                ) : (
                  <>
                    <span className="inline-status" style={{ color: '#52c41a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} strokeWidth={2} />
                      已于 {customerConfirmAt} 完成确认
                    </span>
                    <button className="btn btn-text btn-sm" onClick={handleRevokeCustomerConfirm} style={{ marginLeft: 'auto' }}>撤销确认</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部操作 */}
      <div className="sticky-action-bar">
        <button className="btn btn-default" onClick={handleSaveDraft}>{draftSaved ? '已保存草稿' : '保存草稿'}</button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting || !draftSaved || !customerConfirmed}
          style={{ opacity: (submitting || !draftSaved || !customerConfirmed) ? 0.5 : 1, minWidth: 120, cursor: (!draftSaved || !customerConfirmed) ? 'not-allowed' : 'pointer' }}
          title={!draftSaved ? '请先保存草稿' : (!customerConfirmed ? '请先获取客户确认' : '')}
        >
          {submitting ? '推送中...' : '推送车主'}
        </button>
      </div>
    </div>
  )
}

// ─── Tab3: 施工详情 ──────────────────────────────────────────────────────────

type DispatchAssignmentSlot = {
  id: number
  technicianId: string
  startMinutes: number
  endMinutes: number
  projects: string[]
}

function DispatchCalendarPanel({ order, onConfirmDispatch }: { order: WorkOrder; onConfirmDispatch?: (orderId: string, info: WorkOrderDispatchInfo) => void }) {
  const isOnsiteDispatch = isOnsiteOrder(order)
  const projectOptions = React.useMemo(() => {
    const fromItems = (order.repairItems ?? []).map(item => item.name).filter(Boolean)
    if (fromItems.length) return Array.from(new Set(fromItems))
    const list = buildDispatchAssignments(order).map(row => row.projectName)
    return Array.from(new Set(list)).filter(Boolean)
  }, [order.id, order.repairItems])

  const [dispatchDate, setDispatchDate] = useState('2026-03-27')
  const [selectedServiceVehicleId, setSelectedServiceVehicleId] = useState(order.serviceVehicleId || SERVICE_VEHICLE_OPTIONS[0]?.id || '')
  const [bookings] = useState<TechnicianBooking[]>(TECHNICIAN_BOOKINGS_DEFAULT)
  const [assignments, setAssignments] = useState<DispatchAssignmentSlot[]>([])
  const [activeSlot, setActiveSlot] = useState<{ technicianId: string; startMinutes: number; endMinutes: number; assignmentId?: number } | null>(null)
  const [slotProjects, setSlotProjects] = useState<string[]>([])
  const [slotStart, setSlotStart] = useState('08:00')
  const [slotEnd, setSlotEnd] = useState('09:00')

  const estimateRange = React.useMemo(() => {
    if (!assignments.length) return null
    const start = Math.min(...assignments.map(item => item.startMinutes))
    const end = Math.max(...assignments.map(item => item.endMinutes))
    return { start, end }
  }, [assignments])

  const openSlotEditor = (technicianId: string, startMinutes: number, assignmentId?: number) => {
    const existing = assignments.find(item => item.id === assignmentId)
    const baseStart = existing ? existing.startMinutes : startMinutes
    const baseEnd = existing ? existing.endMinutes : Math.min(startMinutes + 60, TECHNICIAN_TIMELINE_END_MIN)
    setActiveSlot({ technicianId, startMinutes: baseStart, endMinutes: baseEnd, assignmentId })
    setSlotProjects(existing ? existing.projects : (projectOptions.length ? [projectOptions[0]] : []))
    setSlotStart(formatBookingTime(baseStart))
    setSlotEnd(formatBookingTime(baseEnd))
  }

  const parseTimeInput = (value: string) => {
    const [h, m] = value.split(':').map(part => Number(part))
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
  }

  const handleConfirmSlot = () => {
    if (!activeSlot) return
    const startMin = parseTimeInput(slotStart)
    const endMin = parseTimeInput(slotEnd)
    if (startMin === null || endMin === null || endMin <= startMin) return
    setAssignments(current => {
      const next = activeSlot.assignmentId
        ? current.map(item => item.id === activeSlot.assignmentId
            ? { ...item, technicianId: activeSlot.technicianId, startMinutes: startMin, endMinutes: endMin, projects: slotProjects }
            : item)
        : [
            ...current,
            {
              id: Date.now(),
              technicianId: activeSlot.technicianId,
              startMinutes: startMin,
              endMinutes: endMin,
              projects: slotProjects,
            },
          ]
      return next
    })
    setActiveSlot(null)
  }

  const handleDeleteSlot = () => {
    if (!activeSlot?.assignmentId) {
      setActiveSlot(null)
      return
    }
    setAssignments(current => current.filter(item => item.id !== activeSlot.assignmentId))
    setActiveSlot(null)
  }

  const toggleSlotProject = (project: string) => {
    setSlotProjects(current => current.includes(project)
      ? current.filter(item => item !== project)
      : [...current, project])
  }

  const handleConfirmDispatchClick = () => {
    if (!assignments.length) return
    const start = Math.min(...assignments.map(item => item.startMinutes))
    const end = Math.max(...assignments.map(item => item.endMinutes))
    const detailAssignments: WorkOrderDispatchAssignmentDetail[] = assignments.map(item => {
      const tech = TECHNICIAN_RESOURCES.find(t => t.id === item.technicianId)
      return {
        technicianId: item.technicianId,
        technicianName: tech?.name ?? item.technicianId,
        startMinutes: item.startMinutes,
        endMinutes: item.endMinutes,
        projects: item.projects,
      }
    })
    const technicianNames = Array.from(new Set(detailAssignments.map(item => item.technicianName)))
    const selectedVehicle = SERVICE_VEHICLE_OPTIONS.find(item => item.id === selectedServiceVehicleId)
    const info: WorkOrderDispatchInfo = {
      date: dispatchDate,
      startMinutes: start,
      endMinutes: end,
      estimatedCompletionAt: `${dispatchDate} ${formatBookingTime(end)}`,
      technicianNames,
      serviceVehicleId: isOnsiteDispatch ? selectedVehicle?.id : undefined,
      serviceVehicleCode: isOnsiteDispatch ? selectedVehicle?.code : undefined,
      serviceVehiclePlate: isOnsiteDispatch ? selectedVehicle?.plate : undefined,
      serviceVehicleName: isOnsiteDispatch ? selectedVehicle?.name : undefined,
      assignments: detailAssignments,
    }
    onConfirmDispatch?.(order.id, info)
  }

  const technicianLeftWidth = 220

  return (
    <div className="card card-odin" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border-light)', gap: 12 }}>
        <div className="card-title" style={{ marginBottom: 0 }}>可用技师时间</div>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{order.id} · {order.plate} · {order.repairType}{isOnsiteDispatch ? ` · ${order.onsiteAddress || '待补充上门地址'}` : ''}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          {isOnsiteDispatch && (
            <select className="form-select" value={selectedServiceVehicleId} onChange={event => setSelectedServiceVehicleId(event.target.value)} style={{ width: 190, height: 28 }}>
              {SERVICE_VEHICLE_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>{option.code} / {option.plate}</option>
              ))}
            </select>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarDays size={14} strokeWidth={1.9} style={{ color: 'var(--text-tertiary)' }} />
            <input className="form-input" type="date" value={dispatchDate} onChange={event => setDispatchDate(event.target.value)} style={{ width: 150, height: 28 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, border: '1px solid var(--border-light)', background: '#fff' }} />
              可用
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#b7eb8f' }} />
              预约
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#91caff' }} />
              工单
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#2251ff' }} />
              本次派工
            </span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 1080 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `${technicianLeftWidth}px 1fr`, alignItems: 'stretch' }}>
            <div style={{ padding: '10px 14px', background: '#fafafa', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', fontSize: 12, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>技师</span>
              <span>能力</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TECHNICIAN_TIMELINE_HOURS.length}, 1fr)`, background: '#fafafa', borderBottom: '1px solid var(--border-light)' }}>
              {TECHNICIAN_TIMELINE_HOURS.map(hour => (
                <div key={hour} style={{ padding: '10px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', borderLeft: '1px solid var(--border-light)' }}>
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
          {TECHNICIAN_RESOURCES.map(tech => {
            const techBookings = bookings.filter(item => item.technicianId === tech.id)
            const techAssignments = assignments.filter(item => item.technicianId === tech.id)
            return (
              <div key={tech.id} style={{ display: 'grid', gridTemplateColumns: `${technicianLeftWidth}px 1fr`, borderBottom: '1px solid var(--border-light)', minHeight: 56 }}>
                <div style={{ padding: '10px 14px', borderRight: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserRound size={14} strokeWidth={1.9} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{tech.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {tech.abilities.map(ability => (
                      <span key={ability} style={{ fontSize: 11, padding: '1px 6px', borderRadius: 10, border: '1px solid #91caff', color: '#176bf8', background: '#e6f4ff' }}>
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${TECHNICIAN_TIMELINE_HOURS.length}, 1fr)` }}>
                  {TECHNICIAN_TIMELINE_HOURS.map(hour => (
                    <button
                      key={`${tech.id}-${hour}`}
                      type="button"
                      onClick={() => openSlotEditor(tech.id, hour * 60)}
                      style={{ background: 'transparent', border: 'none', borderLeft: '1px solid var(--border-light)', cursor: 'pointer', padding: 0 }}
                      title={`${tech.name} ${String(hour).padStart(2, '0')}:00 添加派工`}
                    />
                  ))}
                  {techBookings.map(booking => {
                    const leftPct = ((booking.startMinutes - TECHNICIAN_TIMELINE_START_MIN) / TECHNICIAN_TIMELINE_TOTAL_MIN) * 100
                    const widthPct = ((booking.endMinutes - booking.startMinutes) / TECHNICIAN_TIMELINE_TOTAL_MIN) * 100
                    const isAppointment = booking.type === 'appointment'
                    return (
                      <div
                        key={booking.id}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: 8,
                          bottom: 8,
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: isAppointment ? 'rgba(82,196,26,0.18)' : 'rgba(22,107,248,0.18)',
                          border: `1px solid ${isAppointment ? '#52c41a' : '#1d6dfe'}`,
                          color: isAppointment ? '#135200' : '#0f3fb5',
                          fontSize: 11,
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                        }}
                      >
                        {booking.label} · {formatBookingTime(booking.startMinutes)}-{formatBookingTime(booking.endMinutes)}
                      </div>
                    )
                  })}
                  {techAssignments.map(slot => {
                    const leftPct = ((slot.startMinutes - TECHNICIAN_TIMELINE_START_MIN) / TECHNICIAN_TIMELINE_TOTAL_MIN) * 100
                    const widthPct = ((slot.endMinutes - slot.startMinutes) / TECHNICIAN_TIMELINE_TOTAL_MIN) * 100
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => openSlotEditor(slot.technicianId, slot.startMinutes, slot.id)}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: 6,
                          bottom: 6,
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'rgba(34,81,255,0.85)',
                          border: '1px solid #1d3ed8',
                          color: '#fff',
                          fontSize: 11,
                          lineHeight: 1.4,
                          cursor: 'pointer',
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {slot.projects.join(' / ') || '本次派工'} · {formatBookingTime(slot.startMinutes)}-{formatBookingTime(slot.endMinutes)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{isOnsiteDispatch ? '预估上门服务时间：' : '预估服务时间：'}</span>
        <strong style={{ fontSize: 13, color: estimateRange ? '#176bf8' : 'var(--text-tertiary)' }}>
          {estimateRange
            ? `${dispatchDate} ${formatBookingTime(estimateRange.start)} - ${dispatchDate} ${formatBookingTime(estimateRange.end)}`
            : '点击下方时段添加派工'}
        </strong>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn-default" onClick={() => setAssignments([])} disabled={!assignments.length}>清空</button>
          <button className="btn btn-primary" onClick={handleConfirmDispatchClick} disabled={!assignments.length || (isOnsiteDispatch && !selectedServiceVehicleId)}>
            {isOnsiteDispatch ? '确认派车派工' : '确认派工'}
          </button>
        </div>
      </div>

      {activeSlot && (
        <div className="modal-overlay" onClick={() => setActiveSlot(null)}>
          <div className="modal" style={{ width: 460 }} onClick={event => event.stopPropagation()}>
            <div className="modal-header">
              选择技师时间
              <button className="btn btn-text" onClick={() => setActiveSlot(null)} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--text-tertiary)' }}>
                技师：{TECHNICIAN_RESOURCES.find(item => item.id === activeSlot.technicianId)?.name ?? '—'}
              </div>
              <div className="form-item" style={{ marginBottom: 12 }}>
                <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 维修项目（多选）</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {projectOptions.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>当前工单暂无可派项目</span>}
                  {projectOptions.map(project => {
                    const checked = slotProjects.includes(project)
                    return (
                      <button
                        key={project}
                        type="button"
                        onClick={() => toggleSlotProject(project)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 14,
                          border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-light)'}`,
                          background: checked ? 'rgba(34,81,255,0.08)' : '#fff',
                          color: checked ? 'var(--primary)' : 'var(--text-secondary)',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {checked && <Check size={11} strokeWidth={2.4} style={{ marginRight: 4, verticalAlign: -1 }} />}
                        {project}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="form-item">
                <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 时间（{dispatchDate}）</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="form-input" type="time" value={slotStart} onChange={event => setSlotStart(event.target.value)} step={300} style={{ width: 130 }} />
                  <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                  <input className="form-input" type="time" value={slotEnd} onChange={event => setSlotEnd(event.target.value)} step={300} style={{ width: 130 }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {activeSlot.assignmentId && (
                <button className="btn btn-default" onClick={handleDeleteSlot} style={{ marginRight: 'auto', color: '#ff4d4f' }}>删除</button>
              )}
              <button className="btn btn-default" onClick={() => setActiveSlot(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleConfirmSlot} disabled={slotProjects.length === 0}>确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Tab3Work({ order, mode = 'detail', startEditing = false, onStartEditingHandled, onConfirmDelivery, onOpenWarrantyReport, onOpenDispatch, onConfirmDispatch, onCompleteWork, onQcPass, onQcReject, onReworkComplete, onSettle, onUploadSignedDoc, onUpdateItems }: { order?: WorkOrder | null; mode?: 'detail' | 'delivery' | 'dispatch'; startEditing?: boolean; onStartEditingHandled?: () => void; onConfirmDelivery?: (orderId: string) => void; onOpenWarrantyReport?: (order: WorkOrder) => void; onOpenDispatch?: (order: WorkOrder) => void; onConfirmDispatch?: (orderId: string, info: WorkOrderDispatchInfo) => void; onCompleteWork?: (orderId: string) => void; onQcPass?: (orderId: string) => void; onQcReject?: (order: WorkOrder) => void; onReworkComplete?: (orderId: string) => void; onSettle?: (orderId: string) => void; onUploadSignedDoc?: (orderId: string, fileName: string) => void; onUpdateItems?: (orderId: string, repairItems: RepairItem[], partItems: PartItem[]) => void }) {
  const workOrder = normalizeWorkOrder(order ?? ORDERS[0])
  const isOnsiteDetail = isOnsiteOrder(workOrder)
  const onsiteStatus = getOnsiteStatus(workOrder)
  const isDeliveryMode = mode === 'delivery' && workOrder.status === 'delivery'
  const isDispatchMode = mode === 'dispatch' && workOrder.status === 'pending'
  const warrantyAlert = workOrder.warrantyAlert
  const lockedByWarranty = isWarrantyLocked(workOrder)
  const formatTimelineTime = (value?: string) => (value && value !== '—' ? value.replace(/-/g, '/').slice(0, 16) : '')
  const isAwaitingSignedDoc = workOrder.status === 'inspecting' || workOrder.status === 'diagnosing'
  const signedDocInputRef = React.useRef<HTMLInputElement | null>(null)
  const handleSignedDocChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUploadSignedDoc?.(workOrder.id, file.name)
    event.target.value = ''
  }
  const progressTimestamps: Partial<Record<(typeof WORKORDER_DETAIL_STEPS)[number], string>> = {
    待确认: formatTimelineTime(workOrder.createdAt),
    待派工: formatTimelineTime(workOrder.confirmedStartAt) || formatTimelineTime(workOrder.createdAt),
    待完工: formatTimelineTime(workOrder.completedAt),
    待质检: formatTimelineTime(workOrder.completedReviewAt),
    待结算: formatTimelineTime(workOrder.settlementAt),
    待交车: formatTimelineTime(workOrder.deliveryAt),
    已交车: formatTimelineTime(workOrder.deliveryAt),
  }
  const onsiteProgressTimestamps: Partial<Record<OnsiteServiceStatus, string>> = {
    to_submit: formatTimelineTime(workOrder.createdAt),
    dispatch: formatTimelineTime(workOrder.signedDocAt) || formatTimelineTime(workOrder.createdAt),
    pick: formatTimelineTime(workOrder.dispatchedAt),
    depart: formatTimelineTime(workOrder.onsitePickedAt) || formatTimelineTime(workOrder.dispatchedAt),
    arrive: formatTimelineTime(workOrder.onsiteDepartedAt),
    inspect: formatTimelineTime(workOrder.onsiteArrivedAt),
    start: formatTimelineTime(workOrder.onsiteInspectedAt) || formatTimelineTime(workOrder.confirmedStartAt),
    finish: formatTimelineTime(workOrder.completedAt),
    qc: formatTimelineTime(workOrder.completedReviewAt),
    settlement: formatTimelineTime(workOrder.settlementAt),
    return: formatTimelineTime(workOrder.settlementAt),
    'return-stock': formatTimelineTime(workOrder.settlementAt),
    done: formatTimelineTime(workOrder.deliveryAt),
  }
  const detailRepairItems: RepairItem[] = buildDetailRepairItems(workOrder)
  const detailParts: PartItem[] = buildDetailPartItems(workOrder)
  const detailOwnerTags = workOrder.ownerTags?.length
    ? workOrder.ownerTags
    : (workOrder.owner === '郭富贵' ? ['健身达人', '敏感客户'] : [])
  const detailVehicleTags = workOrder.vehicleTags?.length
    ? workOrder.vehicleTags
    : (workOrder.series ? ['按时保养'] : [])
  
  // Toast 提示
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null)
  const showToast = (type: 'success' | 'warning' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }
  
  // ── 编辑模式（仅 working 状态可用） ──
  const canEditOrder = workOrder.status === 'working' && !lockedByWarranty && mode === 'detail'
  const [isEditing, setIsEditing] = useState(false)
  const [editingRepairItems, setEditingRepairItems] = useState<RepairItem[]>([])
  const [editingParts, setEditingParts] = useState<PartItem[]>([])
  
  // 统一选择器相关状态
  const [showUnifiedPicker, setShowUnifiedPicker] = useState(false)
  const [unifiedPickerTab, setUnifiedPickerTab] = useState<'project' | 'part'>('project')
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([])
  const [repairProjectPartSelection, setRepairProjectPartSelection] = useState<Record<number, Record<number, { checked: boolean; qty: number }>>>({})
  const [repairProjectCodeFilter, setRepairProjectCodeFilter] = useState('')
  const [repairProjectNameFilter, setRepairProjectNameFilter] = useState('')
  const [repairProjectPartNameFilter, setRepairProjectPartNameFilter] = useState('')
  const [repairProjectPartCodeFilter, setRepairProjectPartCodeFilter] = useState('')
  const [selectedPartPickerIds, setSelectedPartPickerIds] = useState<number[]>([])
  const [partCodeFilter, setPartCodeFilter] = useState('')
  const [partNameFilter, setPartNameFilter] = useState('')
  const [partAliasFilter, setPartAliasFilter] = useState('')
  const [partVehicleFilter, setPartVehicleFilter] = useState('')
  const [hideZeroStock, setHideZeroStock] = useState(true)
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)
  const [pickerBatchDiscount, setPickerBatchDiscount] = useState('')
  const [pickerBatchRepairType, setPickerBatchRepairType] = useState('')
  const [pickerBatchChargeType, setPickerBatchChargeType] = useState('')
  const [openChargeTypeDropdownKey, setOpenChargeTypeDropdownKey] = useState<string | null>(null)
  const [openChargeSplitEditorKey, setOpenChargeSplitEditorKey] = useState<string | null>(null)
  
  // 当工单切换或状态变化时，重置编辑模式
  useEffect(() => {
    setIsEditing(false)
    setOpenChargeTypeDropdownKey(null)
    setOpenChargeSplitEditorKey(null)
  }, [workOrder.id, workOrder.status])
  const enterEditMode = () => {
    setEditingRepairItems(detailRepairItems.map(item => ({ ...item })))
    setEditingParts(detailParts.map(item => ({ ...item })))
    setOpenChargeTypeDropdownKey(null)
    setOpenChargeSplitEditorKey(null)
    setIsEditing(true)
  }
  useEffect(() => {
    if (!startEditing) return
    if (canEditOrder) {
      enterEditMode()
    }
    onStartEditingHandled?.()
  }, [startEditing, canEditOrder, workOrder.id])
  const cancelEditMode = () => {
    setIsEditing(false)
    setOpenChargeTypeDropdownKey(null)
    setOpenChargeSplitEditorKey(null)
  }
  const saveEditMode = () => {
    onUpdateItems?.(workOrder.id, editingRepairItems, editingParts)
    setIsEditing(false)
  }
  const updateEditingRepairItem = (id: number, updater: (item: RepairItem) => RepairItem) => {
    setEditingRepairItems(current => current.map(item => item.id === id ? updater(item) : item))
  }
  const updateEditingPart = (id: number, updater: (item: PartItem) => PartItem) => {
    setEditingParts(current => current.map(item => item.id === id ? updater(item) : item))
  }
  // 编辑模式：添加项目（增项）
  const addEditingRepairItem = () => {
    setShowUnifiedPicker(true)
    setUnifiedPickerTab('project')
  }
  // 编辑模式：添加备件（增项）
  const addEditingPart = () => {
    setShowUnifiedPicker(true)
    setUnifiedPickerTab('part')
  }
  const removeEditingRepairItem = (id: number) => {
    setEditingRepairItems(current => current.filter(item => item.id !== id))
  }
  const removeEditingPart = (id: number) => {
    setEditingParts(current => current.filter(item => item.id !== id))
  }
  
  // 确认添加项目（编辑模式）
  const handleConfirmRepairProjectsInEdit = () => {
    const selectedProjects = REPAIR_PROJECT_OPTIONS.filter(option => selectedProjectIds.includes(option.id))
    const overrideDiscount = pickerBatchDiscount !== '' ? clampDiscountRate(Number(pickerBatchDiscount) || 100) : null
    const overrideType = pickerBatchRepairType || ''
    const overrideCharge = pickerBatchChargeType || ''
    
    const mappedProjects = selectedProjects.map(option => {
      const customHours = option.code === '9999'
      const itemId = option.id
      
      const effectiveType = overrideType || option.type
      let effectiveCharge = overrideCharge || option.chargeType
      if (effectiveType === 'GoodWill') effectiveCharge = '索赔'
      if (customHours && effectiveCharge === '索赔') effectiveCharge = '客户自费'
      const discountRate = overrideDiscount !== null && !customHours ? overrideDiscount : 100
      return {
        id: itemId,
        name: option.name,
        code: option.code,
        laborType: option.laborType,
        unitPrice: option.unitPrice,
        hours: option.hours / 10,
        discountRate,
        fee: calculateRepairItemFee(option.unitPrice, option.hours / 10, discountRate),
        type: effectiveType,
        chargeType: effectiveCharge,
        customHours,
        isDispatched: false,
        isUpsell: true, // 编辑模式下添加的项目标记为增项
        ...defaultSplitConfig(effectiveCharge),
      }
    })

    setEditingRepairItems(current => {
      const merged = [...current]
      mappedProjects.forEach(project => {
        const existingIndex = merged.findIndex(item => item.id === project.id)
        if (existingIndex >= 0) {
          merged[existingIndex] = project
        } else {
          merged.push(project)
        }
      })
      return merged
    })

    // 处理关联备件
    const partAdditions: Array<{ option: PartPickerOption; qty: number }> = []
    selectedProjectIds.forEach(projectId => {
      const suggestions = REPAIR_PROJECT_PART_SUGGESTIONS[projectId]
      if (!suggestions) return
      suggestions.forEach(partId => {
        const sel = repairProjectPartSelection[projectId]?.[partId]
        if (!sel?.checked) return
        const partOption = PART_PICKER_OPTIONS.find(option => option.id === partId)
        if (!partOption) return
        partAdditions.push({ option: partOption, qty: Math.max(1, sel.qty) })
      })
    })

    if (partAdditions.length) {
      setEditingParts(current => {
        const merged = [...current]
        let nextId = merged.length ? Math.max(...merged.map(item => item.id)) + 1 : 1
        partAdditions.forEach(({ option, qty }) => {
          const existingIndex = merged.findIndex(item => item.code === option.code)
          if (existingIndex >= 0) {
            const existing = merged[existingIndex]
            const nextQty = existing.qty + qty
            merged[existingIndex] = {
              ...existing,
              stock: existing.stock ?? option.stock,
              qty: nextQty,
              fee: calculatePartFee(existing.unitPrice, nextQty, existing.discountRate ?? 100),
            }
          } else {
            merged.push({
              id: nextId++,
              name: option.name,
              code: option.code,
              unitPrice: option.unitPrice,
              qty,
              discountRate: 100,
              fee: calculatePartFee(option.unitPrice, qty),
              type: option.type,
              chargeType: '客户自费',
              stock: option.stock,
              isPicked: false,
              isUpsell: true, // 编辑模式下添加的备件标记为增项
              ...defaultSplitConfig('客户自费'),
            })
          }
        })
        return merged
      })
    }

    setShowUnifiedPicker(false)
    setSelectedProjectIds([])
    setRepairProjectPartSelection({})
    setPickerBatchDiscount('')
    setPickerBatchRepairType('')
    setPickerBatchChargeType('')
    showToast('success', `已添加 ${mappedProjects.length} 个维修项目${partAdditions.length ? `，并附带 ${partAdditions.length} 项关联备件` : ''}`)
  }
  
  // 确认添加备件（编辑模式）
  const handleConfirmPartsInEdit = () => {
    const selectedParts = PART_PICKER_OPTIONS.filter(option => selectedPartPickerIds.includes(option.id))
    if (!selectedParts.length) {
      showToast('warning', '请先选择备件后再确认')
      return
    }

    const overrideType = pickerBatchRepairType || ''
    const overrideCharge = pickerBatchChargeType || ''

    setEditingParts(current => {
      const merged = [...current]
      selectedParts.forEach(option => {
        const existingIndex = merged.findIndex(item => item.code === option.code)
        const effectiveType = overrideType || option.type
        const effectiveCharge = (effectiveType === 'GoodWill' ? '索赔' : (overrideCharge || '客户自费'))
        const mappedPart: PartItem = {
          id: option.id,
          name: option.name,
          code: option.code,
          unitPrice: option.unitPrice,
          stock: option.stock,
          qty: option.qty,
          discountRate: 100,
          fee: calculatePartFee(option.unitPrice, option.qty),
          type: effectiveType,
          chargeType: effectiveCharge,
          isPicked: false,
          isUpsell: true, // 编辑模式下添加的备件标记为增项
          isSupplierDirect: false,
          ...defaultSplitConfig(effectiveCharge),
        }
        if (existingIndex >= 0) {
          merged[existingIndex] = mappedPart
        } else {
          merged.push(mappedPart)
        }
      })
      return merged
    })

    setShowUnifiedPicker(false)
    setSelectedPartPickerIds([])
    setPickerBatchDiscount('')
    setPickerBatchRepairType('')
    setPickerBatchChargeType('')
    showToast('success', `已添加 ${selectedParts.length} 项备件`)
  }
  // 渲染时优先使用编辑副本
  const renderRepairItems: RepairItem[] = isEditing ? editingRepairItems : detailRepairItems
  const renderParts: PartItem[] = isEditing ? editingParts : detailParts
  const showDetailDispatchColumns = renderRepairItems.some(item => item.isDispatched || item.assignedTechnician)
  const showDetailMaterialColumns = renderParts.some(part => part.isPicked)
  const detailDiscountSummary = calcDiscountSummary(renderRepairItems, renderParts)
  const laborTotal = renderRepairItems.reduce((sum, item) => sum + item.fee, 0)
  const partsTotal = renderParts.reduce((sum, item) => sum + item.fee, 0)
  const detailAdditionalFees: AdditionalFeeItem[] = workOrder.additionalFeeItems?.length
    ? workOrder.additionalFeeItems
    : (workOrder.otherFee
      ? [{ id: 9001, name: '其他费用', fee: workOrder.otherFee, chargeType: workOrder.chargeType }]
      : [])
  const otherFeeTotal = detailAdditionalFees.reduce((sum, item) => sum + item.fee, 0)
  const total = laborTotal + partsTotal + otherFeeTotal
  const chargeSummary = [...renderRepairItems, ...renderParts, ...detailAdditionalFees].reduce((acc, item) => {
    const allocation = allocateCharge(item)
    acc.self += allocation.self
    acc.warranty += allocation.warranty
    acc.insurance += allocation.insurance
    acc.internal += allocation.internal
    return acc
  }, { self: 0, warranty: 0, insurance: 0, internal: 0 })
  const hasSelfPay = parseChargeTypeParts(workOrder.chargeType).includes('客户自费')
  const canConfirmDelivery = isDeliveryMode && workOrder.completedReviewAt !== '—' && (!hasSelfPay || workOrder.settlementAt !== '—') && !lockedByWarranty

  return (
    <div>
      <div className="card card-odin">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{isDeliveryMode ? '交车管理' : (isDispatchMode ? (isOnsiteDetail ? '派车派工管理' : '派工管理') : workOrder.id)}</div>
            <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', marginTop: 6 }}>{workOrder.plate} · {workOrder.owner} · {workOrder.model}</div>
          </div>
          {isOnsiteDetail ? <OnsiteStatusTag status={onsiteStatus} /> : <StatusTag status={workOrder.status} />}
          {lockedByWarranty && <span className="tag tag-fail"><Lock size={12} strokeWidth={2.2} /> 工单锁定</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <input
              ref={signedDocInputRef}
              type="file"
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              onChange={handleSignedDocChange}
            />
            <button className="btn btn-default btn-sm">
              <Printer size={13} strokeWidth={2} style={{ marginRight: 4 }} />
              打印委托书
            </button>
            {isAwaitingSignedDoc && !lockedByWarranty && (
              <button className="btn btn-primary btn-sm" onClick={() => signedDocInputRef.current?.click()}>
                <Upload size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                上传已签单据
              </button>
            )}
            {lockedByWarranty && <button className="btn btn-default btn-sm" onClick={() => onOpenWarrantyReport?.(workOrder)}>查看预警报告</button>}
            {workOrder.status === 'pending' && !isDispatchMode && !lockedByWarranty && (
              <button className="btn btn-primary btn-sm" onClick={() => onOpenDispatch?.(workOrder)}>
                <Wrench size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                {isOnsiteDetail ? '派车派工' : '派工'}
              </button>
            )}
            {workOrder.status === 'working' && !lockedByWarranty && (
              <>
                {canEditOrder && !isEditing && (
                  <button className="btn btn-default btn-sm" onClick={enterEditMode}>
                    <FilePlus2 size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                    编辑工单
                  </button>
                )}
                {canEditOrder && isEditing && (
                  <>
                    <button className="btn btn-default btn-sm" onClick={cancelEditMode}>
                      取消编辑
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={saveEditMode}>
                      <Check size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                      保存修改
                    </button>
                  </>
                )}
                {!isEditing && (
                  <button className="btn btn-primary btn-sm" onClick={() => onCompleteWork?.(workOrder.id)}>
                    <CheckCircle2 size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                    完工
                  </button>
                )}
              </>
            )}
            {workOrder.status === 'qc_wait' && !lockedByWarranty && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => onQcPass?.(workOrder.id)}>
                  <ShieldCheck size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                  质检通过
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onQcReject?.(workOrder)}>
                  <ShieldAlert size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                  质检不通过
                </button>
              </>
            )}
            {workOrder.status === 'qc_fail' && !lockedByWarranty && (
              <button className="btn btn-primary btn-sm" onClick={() => onReworkComplete?.(workOrder.id)}>
                <Wrench size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                完成返修并重新提交质检
              </button>
            )}
            {workOrder.status === 'delivery' && !lockedByWarranty && workOrder.settlementAt === '—' && (
              <button className="btn btn-primary btn-sm" onClick={() => onSettle?.(workOrder.id)}>
                <Banknote size={13} strokeWidth={2} style={{ marginRight: 4 }} />
                结算
              </button>
            )}
            <button className="btn btn-default btn-sm">查看结算信息</button>
          </div>
        </div>
        {isOnsiteDetail
          ? <OnsiteDetailProgress status={onsiteStatus} timestamps={onsiteProgressTimestamps} />
          : <DetailProgress status={workOrder.status} timestamps={progressTimestamps} />
        }
      </div>

      {isOnsiteDetail && (
        <div className="card card-odin">
          <div className="card-title">上门服务信息</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              ['上门地址', workOrder.onsiteAddress || '待补充上门地址'],
              ['服务技师', workOrder.technician || '待派工'],
              ['服务车辆', workOrder.serviceVehicleCode ? `${workOrder.serviceVehicleCode} / ${workOrder.serviceVehiclePlate || '—'}` : '待派车'],
            ].map(([label, value]) => (
              <div className="form-item" key={label}>
                <label className="form-label">{label}</label>
                <input className="form-input" readOnly value={value} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isAwaitingSignedDoc && !lockedByWarranty && (
        <div className="alert-banner">
          <ShieldAlert size={16} strokeWidth={1.9} className="status-warning" />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>等待客户签字纸质单据</div>
            <div>请打印委托书让客户当面签字确认，扫描或拍照上传后委托书将自动转入「待派工」。</div>
          </div>
        </div>
      )}

      {workOrder.signedDocAt && (
        <div className="alert-banner" style={{ background: '#f6ffed', borderColor: '#b7eb8f', color: '#135200' }}>
          <CheckCircle2 size={16} strokeWidth={2.1} style={{ color: '#52c41a' }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>已签纸质单据已上传</div>
            <div>{workOrder.signedDocFileName || '签字单据'} · 上传时间 {workOrder.signedDocAt}</div>
          </div>
        </div>
      )}

      {isDispatchMode && (
        <DispatchCalendarPanel order={workOrder} onConfirmDispatch={onConfirmDispatch} />
      )}

      {!isDispatchMode && workOrder.dispatchInfo && (
        <div className="card card-odin">
          <div className="section-header" style={{ alignItems: 'center' }}>
            <div className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={14} strokeWidth={2} style={{ color: 'var(--primary)' }} />
              派工详情
            </div>
            <span className="tag tag-working">已派工</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 12 }}>
            <div className="form-item">
              <label className="form-label">派工技师</label>
              <input className="form-input" readOnly value={workOrder.dispatchInfo.technicianNames.join('、') || '—'} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
            </div>
            <div className="form-item">
              <label className="form-label">派工时间</label>
              <input className="form-input" readOnly value={workOrder.dispatchedAt || '—'} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
            </div>
            <div className="form-item">
              <label className="form-label">预计开工时间</label>
              <input className="form-input" readOnly value={`${workOrder.dispatchInfo.date} ${formatBookingTime(workOrder.dispatchInfo.startMinutes)}`} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
            </div>
            <div className="form-item">
              <label className="form-label">预计完工时间</label>
              <input className="form-input" readOnly value={workOrder.dispatchInfo.estimatedCompletionAt || '—'} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
            </div>
            {isOnsiteDetail && (
              <div className="form-item">
                <label className="form-label">服务车辆</label>
                <input className="form-input" readOnly value={workOrder.dispatchInfo.serviceVehicleCode ? `${workOrder.dispatchInfo.serviceVehicleCode} / ${workOrder.dispatchInfo.serviceVehiclePlate || '—'}` : '—'} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
              </div>
            )}
          </div>
          {workOrder.dispatchInfo.assignments.length > 0 && (
            <table className="data-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>技师</th>
                  <th>时间段</th>
                  <th>维修项目</th>
                </tr>
              </thead>
              <tbody>
                {workOrder.dispatchInfo.assignments.map((item, index) => (
                  <tr key={`${item.technicianId}-${index}`}>
                    <td>{item.technicianName}</td>
                    <td>{workOrder.dispatchInfo!.date} {formatBookingTime(item.startMinutes)} - {formatBookingTime(item.endMinutes)}</td>
                    <td>{item.projects.join(' / ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {warrantyAlert && (
        <div className={`alert-banner ${lockedByWarranty ? 'alert-banner-danger' : ''}`}>
          {lockedByWarranty
            ? <Lock size={16} strokeWidth={2.1} />
            : <ShieldAlert size={16} strokeWidth={1.9} className="status-warning" />
          }
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {getWarrantyAlertLabel(warrantyAlert.level)}{lockedByWarranty ? ' · 工单已锁定' : ''}
            </div>
            <div>{warrantyAlert.title}。{warrantyAlert.reason}</div>
            <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>
              {lockedByWarranty
                ? '当前工单仅支持查看详情，派工、交车、返修等业务操作已禁用。'
                : `当前为提醒级预警，可继续处理，但需重点关注：${warrantyAlert.guidance}`
              }
            </div>
          </div>
        </div>
      )}

      {isDeliveryMode && (
        <div className="card card-odin">
          <div className="section-header" style={{ alignItems: 'center' }}>
            <div className="card-title" style={{ marginBottom: 0 }}>交车确认</div>
            <span className="tag tag-done">待交车</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 8 }}>
            {[
              ['委托书编号', workOrder.id],
              ['车牌号', workOrder.plate],
              ['VIN', workOrder.vin],
              ['车型', workOrder.model],
              ['车主姓名', workOrder.owner],
              ['服务顾问', workOrder.advisor],
              ['维修类型', workOrder.repairType],
              ['预计交车时间', workOrder.estimatedDeliveryAt],
            ].map(([label, value]) => (
              <div className="form-item" key={label}>
                <label className="form-label">{label}</label>
                <input className="form-input" readOnly value={value} style={{ background: '#f5f6f8', color: 'var(--text-secondary)' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: hasSelfPay ? '1fr 1fr' : '1fr', gap: 16, marginTop: 16 }}>
            <div style={{ padding: '16px 18px', border: '1px solid #b7eb8f', borderRadius: 8, background: '#f6ffed' }}>
              <div style={{ fontSize: 12, color: '#389e0d', marginBottom: 8 }}>质检状态</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: '#135200' }}>
                <CheckCircle2 size={18} strokeWidth={2.2} />
                质检已通过
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>完工审核时间：{workOrder.completedReviewAt}</div>
            </div>
            {hasSelfPay && (
              <div style={{ padding: '16px 18px', border: '1px solid #91caff', borderRadius: 8, background: '#f0f8ff' }}>
                <div style={{ fontSize: 12, color: '#176bf8', marginBottom: 8 }}>客户自费结算</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: '#003eb3' }}>
                  <CheckCircle2 size={18} strokeWidth={2.2} />
                  结算已结清
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>客户自费金额：¥{Math.round(chargeSummary.self).toLocaleString()} · 结算时间：{workOrder.settlementAt}</div>
              </div>
            )}
          </div>
          <div className="form-item" style={{ marginTop: 16 }}>
            <label className="form-label">是否回访</label>
            <div style={{ display: 'flex', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="needFollowUp" value="yes" defaultChecked />
                <span>是</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" name="needFollowUp" value="no" />
                <span>否</span>
              </label>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '20px 0 0', marginTop: 20 }}>
            {lockedByWarranty && (
              <span className="inline-status inline-status-danger" style={{ marginRight: 'auto' }}>
                <Lock size={12} strokeWidth={2.2} />
                三包高等级预警已锁定工单，当前不可确认交车
              </span>
            )}
            <button
              className="btn btn-primary"
              onClick={() => onConfirmDelivery?.(workOrder.id)}
              disabled={!canConfirmDelivery}
              style={{ opacity: canConfirmDelivery ? 1 : 0.4, cursor: canConfirmDelivery ? 'pointer' : 'not-allowed' }}
            >
              确认交车
            </button>
          </div>
        </div>
      )}

      <div className="vehicle-overview-panel">
        <div className="vehicle-overview-main">
          <div className="vehicle-overview-kicker">委托书详情</div>
          <div className="vehicle-overview-title">
            <span>{workOrder.plate}</span>
            <span className="vehicle-overview-divider">/</span>
            <span>{workOrder.vin}</span>
          </div>
          <div className="vehicle-overview-subtitle">{workOrder.model}</div>
          <div className="vehicle-overview-meta">
            <span>保修到期日 {workOrder.warrantyExpireDate || workOrder.invoiceDate || '—'}</span>
            <span>最近进厂 {workOrder.createdAt.slice(0, 10)}</span>
            <span>行驶里程 {workOrder.mileage.toLocaleString()} km</span>
            {workOrder.appointmentNo && <span>预约单 {workOrder.appointmentNo}</span>}
          </div>
        </div>
        <div className="vehicle-overview-actions">
          <button className="btn btn-default btn-sm">委托书履历</button>
          <button className="btn btn-default btn-sm">车辆权益</button>
          <button className="btn btn-default btn-sm">服务活动</button>
          <button className="btn btn-default btn-sm">维修建议</button>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">车主标签 & 车辆标签</div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>车主标签</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {detailOwnerTags.length > 0
              ? detailOwnerTags.map(tag => <span key={tag} className="info-pill tone-info">{tag}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>暂无车主标签</span>}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>车辆标签</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {detailVehicleTags.length > 0
              ? detailVehicleTags.map(tag => <span key={tag} className="info-pill tone-success">{tag}</span>)
              : <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>暂无车辆标签</span>}
          </div>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">车主信息</div>
        <DetailFieldGrid fields={[
          ['车主类别', workOrder.ownerType || workOrder.customerType],
          ['车主姓名', workOrder.owner],
          ['车主电话/邮箱', formatPhoneEmailDetail(workOrder.phone, workOrder.ownerEmail)],
          ['联系人', workOrder.contactPerson],
          ['联系人电话/邮箱', formatPhoneEmailDetail(workOrder.contactPhone, workOrder.contactEmail)],
          ['送修人', workOrder.sender],
          ['送修人电话/邮箱', formatPhoneEmailDetail(workOrder.senderPhone, workOrder.senderEmail)],
        ]} />
      </div>

      <div className="card card-odin">
        <div className="card-title">车辆信息</div>
        <DetailFieldGrid fields={[
          ['品牌', workOrder.brand || '奇瑞'],
          ['车系', workOrder.series],
          ['车型', workOrder.model],
          ['配置', workOrder.configuration],
          ['外饰颜色', workOrder.color],
          ['内饰颜色', workOrder.interiorColor],
          ['VIN', workOrder.vin],
          ['发动机号', workOrder.engineNo],
          ['变速箱号', workOrder.gearboxNo],
          ['车牌号', workOrder.plate],
          ['进厂里程', workOrder.mileage ? `${workOrder.mileage} km` : undefined],
          ['HEV里程/燃油里程', workOrder.hevMileage ? `${workOrder.hevMileage} km` : undefined],
          ['是否换表', workOrder.isMeterReplaced ?? (workOrder.replacedMileage ? true : undefined)],
          ['换表里程', workOrder.replacedMileage ? `${workOrder.replacedMileage} km` : undefined],
          ['累计里程', workOrder.totalMileage ? `${workOrder.totalMileage} km` : undefined],
          ['燃油量（%）', workOrder.fuelLevel !== undefined ? `${workOrder.fuelLevel}%` : undefined],
          ['剩余电量（%）', workOrder.batteryLevel !== undefined ? `${workOrder.batteryLevel}%` : undefined],
          ['销售日期', workOrder.saleDate],
          ['下次保养日期', workOrder.nextMaintenanceDate],
          ['保修到期日期', workOrder.warrantyExpireDate || workOrder.invoiceDate],
          ['保险到期日期', workOrder.insuranceExpireDate],
          ['保险公司', workOrder.insuranceCompany],
          ['是否三包', workOrder.isThreePack ?? (workOrder.customerType?.includes('三包') ? true : undefined)],
        ]} />
      </div>

      <div className="card card-odin">
        <div className="card-title">工单信息</div>
        <DetailFieldGrid fields={[
          ['工单号', workOrder.id],
          ['服务方式', getServiceTypeLabel(workOrder.serviceType)],
          ...(workOrder.serviceType === 'onsite' ? [['上门服务地址', workOrder.onsiteAddress || '待补充上门地址'] as [string, string]] : []),
          ['工单类型', workOrder.repairType],
          ['服务顾问', workOrder.advisor],
          ['开单时间', workOrder.createdAt],
          ['预计交车时间', workOrder.estimatedDeliveryAt],
          ['责任技师', workOrder.principalTechnician || workOrder.technician],
          ['是否送修', workOrder.isPickupDelivery],
          ['预约单号', workOrder.appointmentNo],
        ]} />
      </div>

      <div className="card card-odin">
        <div className="card-title">车辆售后信息</div>
        <DetailFieldGrid fields={[
          ['客户类型', workOrder.customerType],
          ['确认开工时间', workOrder.confirmedStartAt],
          ['完工审核时间', workOrder.completedReviewAt],
          ['结算时间', workOrder.settlementAt],
          ['派工时间', workOrder.dispatchedAt],
          ['领料状态', MATERIAL_STATUS_MAP[workOrder.materialStatus].label],
        ]} />
      </div>

      <div className="card card-odin">
        <div className="card-title">故障信息</div>
        <div className="form-item">
          <label className="form-label">备注</label>
          <textarea className="form-textarea" readOnly rows={4} value={workOrder.faultDesc} style={{ width: '100%', background: '#f5f6f8', color: 'var(--text-secondary)' }} />
        </div>
        <div className="form-item" style={{ marginTop: 16 }}>
          <label className="form-label">上传图片</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ width: 80, height: 80, border: '1px dashed #d9d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
                <Image size={24} style={{ color: '#bfbfbf' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {workOrder.qcRejectedItems && workOrder.qcRejectedItems.length > 0 && (workOrder.status === 'qc_fail' || workOrder.status === 'qc_wait') && (
        <div className="card card-odin" style={{ borderLeft: workOrder.status === 'qc_fail' ? '3px solid #ff4d4f' : '3px solid #faad14' }}>
          <div className="section-header">
            <div className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldAlert size={16} strokeWidth={2.2} style={{ color: workOrder.status === 'qc_fail' ? '#ff4d4f' : '#faad14' }} />
              质检反馈
              {workOrder.status === 'qc_fail' && (
                <span className="tag tag-fail" style={{ marginLeft: 4 }}>待返修</span>
              )}
              {workOrder.status === 'qc_wait' && (workOrder.qcRejectedItems || []).every(item => item.reworked) && (
                <span className="tag tag-qc" style={{ marginLeft: 4 }}>返修完成 · 待复检</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
              {workOrder.qcRejectedAt && <span>质检不通过时间：{workOrder.qcRejectedAt}</span>}
              {workOrder.completedReviewer && workOrder.completedReviewer !== '—' && <span style={{ marginLeft: 12 }}>质检员：{workOrder.completedReviewer}</span>}
            </div>
          </div>
          {workOrder.qcRejectReason && (
            <div className="alert-banner" style={{ marginTop: 8 }}>
              <Info size={16} strokeWidth={1.9} className="status-warning" />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>质检备注</div>
                <div>{workOrder.qcRejectReason}</div>
              </div>
            </div>
          )}
          <table className="data-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>项目编码</th>
                <th>项目名称</th>
                <th>不合格原因</th>
                <th style={{ width: 140 }}>返修状态</th>
              </tr>
            </thead>
            <tbody>
              {workOrder.qcRejectedItems.map(item => (
                <tr key={item.itemId}>
                  <td style={{ color: 'rgba(0,0,0,0.65)' }}>{item.itemCode}</td>
                  <td>{item.itemName}</td>
                  <td style={{ color: '#cf1322' }}>{item.reason}</td>
                  <td>
                    {item.reworked
                      ? <span className="inline-status inline-status-success"><CheckCircle2 size={12} strokeWidth={2.2} />已返修 {item.reworkedAt ? `· ${item.reworkedAt}` : ''}</span>
                      : <span className="inline-status" style={{ color: '#cf1322' }}><Wrench size={12} strokeWidth={2.2} />待返修</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            维修项目信息
            {isEditing && (
              <span className="tag" style={{ color: '#176bf8', borderColor: 'rgba(23,107,248,0.3)', background: '#e6f4ff' }}>编辑中</span>
            )}
          </div>
          {isEditing && (
            <button className="btn btn-default btn-sm" onClick={addEditingRepairItem}>
              <Plus size={13} strokeWidth={2} style={{ marginRight: 4 }} />
              添加项目（增项）
            </button>
          )}
        </div>
        <div className="table-scroll-wrap table-scroll-wrap--line-items">
        <table className="data-table data-table--line-items">
          <thead>
            <tr>
              <th className="col-code">项目代码</th>
              <th className="col-item-name">项目名称</th>
              <th className="col-package">套餐/活动</th>
              <th className="col-fault">故障部位</th>
              <th className="col-num">工时单价</th>
              <th className="col-num">标准工时</th>
              <th className="col-num">折扣(%)</th>
              <th className="col-num">总价格</th>
              <th className="col-select">维修类型</th>
              <th className="col-labor-type">工种类型</th>
              <th className="col-charge-type">收费类型</th>
              {showDetailDispatchColumns && <><th className="col-staff">技师</th><th className="col-staff">工位</th></>}
              {isEditing && <th className="col-action">状态/操作</th>}
            </tr>
          </thead>
          <tbody>
            {renderRepairItems.map(item => {
              const dispatched = !!item.isDispatched
              const upsell = !!item.isUpsell
              const editable = isEditing && !dispatched
              const isCustomHours = item.code === '9999' // 自定义工时可以编辑所有字段
              const canEditBasicFields = editable && isCustomHours // 只有自定义工时可以编辑基础字段
              return (
                <tr key={item.id} style={upsell && isEditing ? { background: '#fffbe6' } : undefined}>
                  <td className="col-code" style={{ color: 'rgba(0,0,0,0.45)' }}>{item.code}</td>
                  <td className="col-item-name">
                    {canEditBasicFields ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                        <input
                          className="form-input"
                          value={item.name}
                          placeholder="项目名称"
                          onChange={e => updateEditingRepairItem(item.id, current => ({ ...current, name: e.target.value }))}
                        />
                        {upsell && <span className="tag tag-warning">增项</span>}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                        <span>{item.name}</span>
                        {upsell && <span className="tag tag-warning">增项</span>}
                      </div>
                    )}
                  </td>
                  <td className="col-package" style={{ color: 'var(--text-secondary)' }}>{item.packageName || '—'}</td>
                  <td className="col-fault" style={{ color: 'var(--text-secondary)' }}>{item.faultLocation || '—'}</td>
                  <td>
                    {canEditBasicFields ? (
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={e => {
                          const unitPrice = Number(e.target.value) || 0
                          updateEditingRepairItem(item.id, current => ({
                            ...current,
                            unitPrice,
                            fee: calculateRepairItemFee(unitPrice, current.hours, current.discountRate ?? 100),
                          }))
                        }}
                        style={{ width: 88 }}
                      />
                    ) : <>¥{item.unitPrice}</>}
                  </td>
                  <td>
                    {canEditBasicFields ? (
                      <input
                        className="form-input"
                        type="number"
                        min={0}
                        step={0.1}
                        value={item.hours}
                        onChange={e => {
                          const hours = Number(e.target.value) || 0
                          updateEditingRepairItem(item.id, current => ({
                            ...current,
                            hours,
                            fee: calculateRepairItemFee(current.unitPrice, hours, current.discountRate ?? 100),
                          }))
                        }}
                        style={{ width: 70 }}
                      />
                    ) : item.hours}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.discountRate ?? 100}%</td>
                  <td style={{ fontWeight: 500 }}>¥{item.fee}</td>
                  <td className="col-select">
                    {editable ? (
                      <select
                        className="form-select"
                        value={item.type}
                        onChange={e => updateEditingRepairItem(item.id, current => ({ ...current, type: e.target.value }))}
                      >
                        {REPAIR_TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
                      </select>
                    ) : item.type}
                  </td>
                  <td className="col-labor-type">{item.laborType}</td>
                  <td className="col-charge-type">
                    {editable ? (
                      <ChargeTypeField
                        scope="repair"
                        itemId={item.id}
                        item={item}
                        locked={dispatched || item.type === 'GoodWill'}
                        hideClaimOption={!!item.customHours}
                        openDropdownKey={openChargeTypeDropdownKey}
                        setOpenDropdownKey={setOpenChargeTypeDropdownKey}
                        openSplitKey={openChargeSplitEditorKey}
                        setOpenSplitKey={setOpenChargeSplitEditorKey}
                        onUpdate={patch => updateEditingRepairItem(item.id, current => ({ ...current, ...patch }))}
                      />
                    ) : formatChargeTypeDisplay(item)}
                  </td>
                  {showDetailDispatchColumns && (
                    <>
                      <td style={{ color: item.assignedTechnician ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{item.assignedTechnician || '—'}</td>
                      <td style={{ color: item.workstation ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{item.workstation || '—'}</td>
                    </>
                  )}
                  {isEditing && (
                    <td>
                      {dispatched ? (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>
                      ) : (
                        <button className="btn btn-text btn-sm" style={{ color: '#cf1322' }} onClick={() => removeEditingRepairItem(item.id)}>
                          删除
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      <div className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            备件信息
            {isEditing && (
              <span className="tag" style={{ color: '#176bf8', borderColor: 'rgba(23,107,248,0.3)', background: '#e6f4ff' }}>编辑中</span>
            )}
          </div>
          {isEditing && (
            <button className="btn btn-default btn-sm" onClick={addEditingPart}>
              <Plus size={13} strokeWidth={2} style={{ marginRight: 4 }} />
              添加备件（增项）
            </button>
          )}
        </div>
        <div className="table-scroll-wrap table-scroll-wrap--line-items">
        <table className="data-table data-table--line-items">
          <thead>
            <tr>
              <th className="col-code">备件代码</th>
              <th className="col-part-name">备件名称</th>
              <th className="col-package">套餐/活动</th>
              <th className="col-num">单价</th>
              <th className="col-num">数量</th>
              <th className="col-num">折扣(%)</th>
              <th className="col-num">总价格</th>
              <th className="col-select">维修类型</th>
              <th className="col-labor-type">工种类型</th>
              <th className="col-charge-type">收费类型</th>
              <th className="col-supplier-direct">是否供应商直供</th>
              {showDetailMaterialColumns && <><th className="col-staff">发料人</th><th className="col-staff">领料人</th></>}
              {isEditing && <th className="col-action">状态/操作</th>}
            </tr>
          </thead>
          <tbody>
            {renderParts.map(item => {
              const picked = !!item.isPicked
              const upsell = !!item.isUpsell
              const editable = isEditing && !picked
              return (
                <tr key={item.id} style={upsell && isEditing ? { background: '#fffbe6' } : undefined}>
                  <td className="col-code" style={{ color: 'rgba(0,0,0,0.45)' }}>{item.code}</td>
                  <td className="col-part-name">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                      <span>{item.name}</span>
                      {upsell && <span className="tag tag-warning">增项</span>}
                    </div>
                  </td>
                  <td className="col-package" style={{ color: 'var(--text-secondary)' }}>{item.packageName || '—'}</td>
                  <td>¥{item.unitPrice}</td>
                  <td>
                    {editable ? (
                      <input
                        className="form-input"
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={e => {
                          const qty = Number(e.target.value) || 0
                          updateEditingPart(item.id, current => ({
                            ...current,
                            qty,
                            fee: calculatePartFee(current.unitPrice, qty, current.discountRate ?? 100),
                          }))
                        }}
                        style={{ width: 70 }}
                      />
                    ) : item.qty}
                  </td>
                  <td>
                    {editable ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <input
                          className="form-input"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={item.discountRate ?? 100}
                          onChange={e => {
                            const discountRate = clampDiscountRate(Number(e.target.value))
                            updateEditingPart(item.id, current => ({
                              ...current,
                              discountRate,
                              fee: calculatePartFee(current.unitPrice, current.qty, discountRate),
                            }))
                          }}
                          style={{ width: 76 }}
                        />
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>%</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>{item.discountRate ?? 100}%</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>¥{item.fee}</td>
                  <td className="col-select">
                    {editable ? (
                      <select
                        className="form-select"
                        value={item.type}
                        onChange={e => updateEditingPart(item.id, current => ({ ...current, type: e.target.value }))}
                      >
                        {REPAIR_TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
                      </select>
                    ) : item.type}
                  </td>
                  <td style={{ color: 'var(--text-tertiary)' }}>—</td>
                  <td className="col-charge-type">
                    {editable ? (
                      <ChargeTypeField
                        scope="part"
                        itemId={item.id}
                        item={item}
                        locked={picked}
                        openDropdownKey={openChargeTypeDropdownKey}
                        setOpenDropdownKey={setOpenChargeTypeDropdownKey}
                        openSplitKey={openChargeSplitEditorKey}
                        setOpenSplitKey={setOpenChargeSplitEditorKey}
                        onUpdate={patch => updateEditingPart(item.id, current => ({ ...current, ...patch }))}
                      />
                    ) : formatChargeTypeDisplay(item)}
                  </td>
                  <td className="col-supplier-direct">
                    {editable ? (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={!!item.isSupplierDirect}
                          onChange={e => updateEditingPart(item.id, current => ({ ...current, isSupplierDirect: e.target.checked }))}
                        />
                        <span style={{ fontSize: 12 }}>{item.isSupplierDirect ? '是' : '否'}</span>
                      </label>
                    ) : (item.isSupplierDirect ? '是' : '否')}
                  </td>
                  {showDetailMaterialColumns && (
                    <>
                      <td style={{ color: item.issuer ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{getPersonDisplayName(item.issuer)}</td>
                      <td style={{ color: item.receiver ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{getPersonDisplayName(item.receiver)}</td>
                    </>
                  )}
                  {isEditing && (
                    <td>
                      {picked ? (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>—</span>
                      ) : (
                        <button className="btn btn-text btn-sm" style={{ color: '#cf1322' }} onClick={() => removeEditingPart(item.id)}>
                          删除
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">其他费用</div>
        <table className="data-table" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>费用名称</th>
              <th>金额</th>
              <th>收费区分</th>
              <th>关联单据号</th>
              <th>关联单据类型</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {detailAdditionalFees.length > 0 ? detailAdditionalFees.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td style={{ fontWeight: 500 }}>¥{item.fee.toLocaleString()}</td>
                <td>{formatChargeTypeDisplay(item)}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{item.relatedDocNo || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{item.relatedDocType || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{item.note || '—'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} style={{ padding: '20px 16px', textAlign: 'center', color: 'rgba(0,0,0,0.45)' }}>
                  暂无其他费用
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card card-odin card-fee-summary">
        <div className="card-title">费用汇总</div>
        <FeeSummaryPanel
          laborTotal={laborTotal}
          partsTotal={partsTotal}
          otherFeeTotal={otherFeeTotal}
          discountSummary={detailDiscountSummary}
          total={total}
          chargeSummary={chargeSummary}
        />
      </div>

      {/* 统一的项目/备件选择器（编辑模式下的增项功能） */}
      {showUnifiedPicker && isEditing && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: 1420, maxWidth: 'calc(100vw - 32px)', maxHeight: '90vh' }}>
            <div className="modal-header">
              添加项目/备件（增项）
              <button className="btn btn-text" onClick={() => { setShowUnifiedPicker(false); setSelectedProjectIds([]); setSelectedPartPickerIds([]); setRepairProjectPartSelection({}); setPickerBatchDiscount(''); setPickerBatchRepairType(''); setPickerBatchChargeType(''); }} style={{ color: 'rgba(0,0,0,0.45)' }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 0 }}>
              {/* Tab 切换 */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => setUnifiedPickerTab('project')}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: unifiedPickerTab === 'project' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: unifiedPickerTab === 'project' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: unifiedPickerTab === 'project' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  维修项目
                </button>
                <button
                  type="button"
                  onClick={() => setUnifiedPickerTab('part')}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: unifiedPickerTab === 'part' ? '2px solid var(--primary)' : '2px solid transparent',
                    color: unifiedPickerTab === 'part' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: unifiedPickerTab === 'part' ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  备件
                </button>
              </div>

              {/* 维修项目 Tab */}
              {unifiedPickerTab === 'project' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                    <div className="form-item">
                      <label className="form-label">项目编号：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目编号" value={repairProjectCodeFilter} onChange={e => setRepairProjectCodeFilter(e.target.value.toUpperCase())} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">项目名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入维修项目名称" value={repairProjectNameFilter} onChange={e => setRepairProjectNameFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">备件名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件名称" value={repairProjectPartNameFilter} onChange={e => setRepairProjectPartNameFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">备件编号：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入关联备件编号" value={repairProjectPartCodeFilter} onChange={e => setRepairProjectPartCodeFilter(e.target.value.toUpperCase())} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary">查询</button>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={14} strokeWidth={2} />
                    <span>
                      已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedProjectIds.length}</span> 项，
                      <button
                        type="button"
                        style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => { setSelectedProjectIds([]); setRepairProjectPartSelection({}); }}
                      >
                        清除选择
                      </button>
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleConfirmRepairProjectsInEdit}>确认</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                    <div style={{ maxHeight: 500, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}></th>
                            <th>项目编号</th>
                            <th>项目名称</th>
                            <th>工种类别</th>
                            <th>工时</th>
                            <th>备注</th>
                          </tr>
                        </thead>
                        <tbody>
                          {REPAIR_PROJECT_OPTIONS.filter(option => {
                            if (repairProjectCodeFilter && !option.code.includes(repairProjectCodeFilter)) return false
                            if (repairProjectNameFilter && !option.name.includes(repairProjectNameFilter)) return false
                            return true
                          }).map(option => (
                            <tr key={option.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedProjectIds.includes(option.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedProjectIds(current => [...current, option.id])
                                    } else {
                                      setSelectedProjectIds(current => current.filter(id => id !== option.id))
                                    }
                                  }}
                                />
                              </td>
                              <td>{option.code}</td>
                              <td>{option.name}</td>
                              <td>{option.laborType}</td>
                              <td>{option.hours / 10}</td>
                              <td style={{ color: 'rgba(0,0,0,0.45)' }}>{option.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                        <strong style={{ fontSize: 13 }}>已选维修项目</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedProjectIds.length} 项</span>
                      </div>
                      <div style={{ maxHeight: 458, overflowY: 'auto', padding: 12 }}>
                        {selectedProjectIds.length === 0 ? (
                          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                        ) : (
                          selectedProjectIds.map(projectId => {
                            const item = REPAIR_PROJECT_OPTIONS.find(opt => opt.id === projectId)
                            if (!item) return null
                            const suggestedPartIds = REPAIR_PROJECT_PART_SUGGESTIONS[item.id] ?? []
                            return (
                              <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                                  </div>
                                  <button className="btn btn-text btn-sm" onClick={() => setSelectedProjectIds(current => current.filter(id => id !== item.id))}>移除</button>
                                </div>
                                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                                  <span>工种：{item.laborType}</span>
                                  <span>工时：{item.hours / 10}</span>
                                </div>
                                {suggestedPartIds.length > 0 && (
                                  <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed var(--border-light)' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6 }}>关联备件</div>
                                    <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                      <thead>
                                        <tr style={{ color: 'var(--text-tertiary)' }}>
                                          <th style={{ width: 24, padding: '4px 0', textAlign: 'left', fontWeight: 500 }}></th>
                                          <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件编号</th>
                                          <th style={{ padding: '4px 4px', textAlign: 'left', fontWeight: 500 }}>备件名称</th>
                                          <th style={{ width: 64, padding: '4px 0', textAlign: 'right', fontWeight: 500 }}>数量</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {suggestedPartIds.map(partId => {
                                          const partOption = PART_PICKER_OPTIONS.find(option => option.id === partId)
                                          if (!partOption) return null
                                          const sel = repairProjectPartSelection[item.id]?.[partId] ?? { checked: false, qty: partOption.qty }
                                          const updateSel = (next: { checked: boolean; qty: number }) => {
                                            setRepairProjectPartSelection(current => ({
                                              ...current,
                                              [item.id]: {
                                                ...(current[item.id] ?? {}),
                                                [partId]: next,
                                              },
                                            }))
                                          }
                                          return (
                                            <tr key={partId}>
                                              <td style={{ padding: '4px 0' }}>
                                                <input
                                                  type="checkbox"
                                                  checked={sel.checked}
                                                  onChange={event => updateSel({ ...sel, checked: event.target.checked })}
                                                />
                                              </td>
                                              <td style={{ padding: '4px 4px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{partOption.code}</td>
                                              <td style={{ padding: '4px 4px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{partOption.name}</td>
                                              <td style={{ padding: '4px 0', textAlign: 'right' }}>
                                                <input
                                                  className="form-input"
                                                  type="number"
                                                  min={1}
                                                  value={sel.qty}
                                                  onChange={event => updateSel({ ...sel, qty: Math.max(1, Number(event.target.value) || 1) })}
                                                  style={{ width: 60, height: 26, padding: '0 6px', fontSize: 12 }}
                                                />
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 备件 Tab */}
              {unifiedPickerTab === 'part' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end', marginBottom: 18 }}>
                    <div className="form-item">
                      <label className="form-label">备件编号：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入备件编号" value={partCodeFilter} onChange={e => setPartCodeFilter(e.target.value.toUpperCase())} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">备件名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入备件名称" value={partNameFilter} onChange={e => setPartNameFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">自定义名称：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入自定义名称" value={partAliasFilter} onChange={e => setPartAliasFilter(e.target.value)} />
                    </div>
                    <div className="form-item">
                      <label className="form-label">适用车型：</label>
                      <input className="form-input" style={{ width: '100%' }} placeholder="请输入适用车型" value={partVehicleFilter} onChange={e => setPartVehicleFilter(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn btn-primary">查询</button>
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#e6f4ff', borderRadius: 12, fontSize: 13, color: '#0f5dc7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={14} strokeWidth={2} />
                    <span>
                      已选择 <span style={{ color: '#2f8cff', fontWeight: 700 }}>{selectedPartPickerIds.length}</span> 项，
                      <button
                        type="button"
                        style={{ marginLeft: 10, color: '#ff4d4f', fontWeight: 700, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => setSelectedPartPickerIds([])}
                      >
                        清除选择
                      </button>
                    </span>
                    <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleConfirmPartsInEdit}>确认</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                    <div style={{ maxHeight: 500, overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: 8 }}>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: 48 }}></th>
                            <th>备件编号</th>
                            <th>备件名称</th>
                            <th>库存</th>
                            <th>单价</th>
                            <th>数量</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PART_PICKER_OPTIONS.filter(option => {
                            if (partCodeFilter && !option.code.includes(partCodeFilter)) return false
                            if (partNameFilter && !option.name.includes(partNameFilter)) return false
                            if (hideZeroStock && option.stock <= 0) return false
                            return true
                          }).map(option => (
                            <tr key={option.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={selectedPartPickerIds.includes(option.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedPartPickerIds(current => [...current, option.id])
                                    } else {
                                      setSelectedPartPickerIds(current => current.filter(id => id !== option.id))
                                    }
                                  }}
                                />
                              </td>
                              <td>{option.code}</td>
                              <td>{option.name}</td>
                              <td>{option.stock}</td>
                              <td>¥{option.unitPrice}</td>
                              <td>{option.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ border: '1px solid var(--border-light)', borderRadius: 10, background: '#fff', overflow: 'hidden' }}>
                      <div style={{ height: 42, padding: '0 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', background: '#fafafa' }}>
                        <strong style={{ fontSize: 13 }}>已选备件</strong>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPartPickerIds.length} 项</span>
                      </div>
                      <div style={{ maxHeight: 458, overflowY: 'auto', padding: 12 }}>
                        {selectedPartPickerIds.length === 0 ? (
                          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>勾选左侧数据后在此预览</div>
                        ) : (
                          selectedPartPickerIds.map(partId => {
                            const item = PART_PICKER_OPTIONS.find(opt => opt.id === partId)
                            if (!item) return null
                            return (
                              <div key={item.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ marginTop: 4, color: 'var(--text-tertiary)', fontSize: 12 }}>{item.code}</div>
                                  </div>
                                  <button className="btn btn-text btn-sm" onClick={() => setSelectedPartPickerIds(current => current.filter(id => id !== item.id))}>移除</button>
                                </div>
                                <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                                  <span>库存：{item.stock}</span>
                                  <span>单价：¥{item.unitPrice}</span>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast && (
        <div className={`toast toast-${toast.type}`} style={{ position: 'fixed', top: 80, right: 24, zIndex: 10000 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Tab4: 维修历史 ──────────────────────────────────────────────────────────

function Tab4History() {
  const [scope, setScope] = useState<'local' | 'network'>('local')
  const [showDetail, setShowDetail] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<typeof HISTORY_DATA[0] | null>(null)
  const showPriceColumns = scope === 'local'

  const historyStats = [
    { label: '累计进厂次数', value: '7', sub: '次', color: '#176bf8' },
    { label: '最近进厂日期', value: '2026-01-15', sub: '', color: 'rgba(0,0,0,0.88)' },
    { label: '累计维修费用', value: showPriceColumns ? '¥12,680' : '—', sub: showPriceColumns ? '（含保修）' : '', color: '#fa8c16' },
    { label: '常见故障', value: '制动系统', sub: '发动机 / 空调', color: 'rgba(0,0,0,0.88)' },
    { label: '保修次数', value: '3', sub: '次', color: '#52c41a' },
  ]

  return (
    <div>
      {/* 车辆信息条 */}
      <div className="card" style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>浙B·0L34B</div>
          <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)' }}>郭富贵 · 奇瑞 ARRIZO 8 2023款 · VIN: KW293B1283928372</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-default btn-sm">导出维修报告</button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="history-stats">
        {historyStats.map(s => (
          <div key={s.label} className="history-stat">
            <div className="h-label">{s.label}</div>
            <div className="h-value" style={{ color: s.color, fontSize: s.value.length > 6 ? 16 : 22 }}>{s.value}</div>
            {s.sub && <div className="h-sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* 范围切换 + 筛选 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div className="scope-switch">
          <button className={`scope-btn ${scope === 'local' ? 'active' : ''}`} onClick={() => setScope('local')}>本门店</button>
          <button className={`scope-btn ${scope === 'network' ? 'active' : ''}`} onClick={() => setScope('network')}>全网络</button>
        </div>
        <div style={{ flex: 1 }} />
        <select className="form-select" style={{ width: 140 }}>
          <option>全部类型</option>{REPAIR_TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
        </select>
        <select className="form-select" style={{ width: 120 }}>
          <option>全部收费</option><option>客户自费</option><option>索赔</option><option>保险</option>
        </select>
        <input className="form-input" style={{ width: 180 }} placeholder="搜索故障/项目/备件" />
      </div>

      {/* 历史列表 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
	          <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
	            <thead>
	              <tr>
              <th>委托书编号</th>
              <th>VIN</th>
              <th>车牌号</th>
              <th>客户姓名</th>
              <th>客户类型</th>
              <th>服务顾问</th>
              <th>行驶里程</th>
              <th>维修类别</th>
              <th>完工审核时间</th>
              <th>进厂时间</th>
              <th>预计交车时间</th>
              <th>交车时间</th>
              <th>结算时间</th>
              <th>送修人姓名</th>
              <th>送修人电话</th>
              <th>发动机号</th>
              <th>变速箱号</th>
	              <th>销售时间</th>
	              <th>生产日期</th>
	              <th>颜色</th>
                {showPriceColumns && (
                  <>
	                <th>标准工时费</th>
	                <th>标准材料费</th>
	                <th>标准费用合计</th>
	                <th>实收工时费</th>
	                <th>实收材料费</th>
	                <th>其他费用</th>
	                <th>外出服务费</th>
	                <th>实收费用合计</th>
	                <th>外出服务费说明</th>
                  </>
                )}
	              <th>创建时间</th>
	              <th>修改时间</th>
	              </tr>
            </thead>
            <tbody>
              {HISTORY_DATA.map((r, i) => (
                <tr key={i}>
                <td style={{ fontWeight: 500 }}>
                  <button
                    type="button"
                    className="btn btn-text btn-sm"
                    style={{ padding: 0, minHeight: 'auto' }}
                    onClick={() => { setSelectedRecord(r); setShowDetail(true) }}
                  >
                    {r.entrustNo}
                  </button>
                </td>
                <td>{r.vin}</td>
                <td>{r.plate}</td>
                <td><SensitiveText value={r.customerName} maskedValue={scope === 'network' ? maskName(r.customerName) : r.customerName} /></td>
                <td>{r.customerType}</td>
                <td>{r.advisor}</td>
                <td>{r.mileage} km</td>
                <td><span className={`tag ${MAINTENANCE_REPAIR_TYPES.has(r.repairCategory) ? 'tag-pending' : WARRANTY_REPAIR_TYPES.has(r.repairCategory) ? 'tag-done' : 'tag-working'}`}>{r.repairCategory}</span></td>
                <td>{r.completedReviewAt}</td>
                <td>{r.admissionAt}</td>
                <td>{r.estimatedDeliveryAt}</td>
                <td>{r.deliveryAt}</td>
                <td>{r.settlementAt}</td>
                <td><SensitiveText value={r.senderName} maskedValue={scope === 'network' ? maskName(r.senderName) : r.senderName} /></td>
                <td><SensitiveText value={r.senderPhone} maskedValue={scope === 'network' ? maskPhoneNumber(r.senderPhone) : r.senderPhone} /></td>
	                <td>{r.engineNo}</td>
	                <td>{r.gearboxNo}</td>
	                <td>{r.saleDate}</td>
	                <td>{r.productionDate}</td>
	                <td>{r.color}</td>
                  {showPriceColumns && (
                    <>
	                  <td>{r.standardLaborFee}</td>
	                  <td>{r.standardMaterialFee}</td>
	                  <td>{r.standardTotalFee}</td>
	                  <td>{r.actualLaborFee}</td>
	                  <td>{r.actualMaterialFee}</td>
	                  <td>{r.otherFee}</td>
	                  <td>{r.outboundServiceFee}</td>
	                  <td style={{ fontWeight: 500 }}>{r.actualTotalFee}</td>
	                  <td style={{ color: 'rgba(0,0,0,0.65)', maxWidth: 180 }}>{r.outboundServiceRemark}</td>
                    </>
                  )}
	                <td>{r.createdAt}</td>
	                <td>{r.updatedAt}</td>
	                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetail && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              维修历史详情
              <button className="btn btn-text" onClick={() => setShowDetail(false)} style={{ color: 'rgba(0,0,0,0.45)' }}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body">
	              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
	                {[
	                  { label: '委托书编号', value: selectedRecord.entrustNo },
	                  { label: '维修门店', value: selectedRecord.dealer },
	                  { label: '进厂里程', value: selectedRecord.mileage + ' km' },
	                  { label: '维修类型', value: selectedRecord.type },
	                  { label: '收费类型', value: selectedRecord.chargeType },
                    ...(showPriceColumns ? [{ label: '实收费用', value: selectedRecord.actualTotalFee }] : []),
	                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>故障描述</div>
                <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', background: '#fafafa', padding: '8px 12px', borderRadius: 4 }}>{selectedRecord.fault}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>维修项目</div>
                {selectedRecord.items.map((item, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>• {item}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>更换备件</div>
                {selectedRecord.parts.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>• {p}</div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowDetail(false)}>关闭</button>
              <button className="btn btn-primary">导出 PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab5: 电池维修登记 ──────────────────────────────────────────────────────

function Tab5Battery() {
  const [safetyChecks, setSafetyChecks] = useState([false, false, false, false, false])
  const [repairType, setRepairType] = useState('replace_pack')
  const [detectionResult, setDetectionResult] = useState('replace')
  const [submitBlocked, setSubmitBlocked] = useState(false)

  const safetyItems = [
    { label: '高压断电确认', desc: '已断开高压电源，并确认无电' },
    { label: '绝缘防护确认', desc: '已佩戴绝缘手套、绝缘鞋' },
    { label: '警示标识确认', desc: '已在车辆周围放置"高压作业"警示牌' },
    { label: '消防器材确认', desc: '灭火器、沙箱等消防器材就位' },
    { label: '通风环境确认', desc: '作业区域通风良好' },
  ]

  const toggleSafety = (i: number) => {
    setSafetyChecks(prev => { const n = [...prev]; n[i] = !n[i]; return n })
    setSubmitBlocked(false)
  }

  const handleSubmit = () => {
    if (!safetyChecks.every(Boolean)) setSubmitBlocked(true)
  }

  const batteryInfo = [
    { label: '电池包编号', value: 'BATT-2023-KW293-001' },
    { label: '电池类型', value: '三元锂（NCM）' },
    { label: '电池容量', value: '70 kWh' },
    { label: '生产日期', value: '2023-08-15' },
    { label: '装车日期', value: '2023-09-16' },
    { label: '保修到期日', value: '2031-09-16' },
    { label: '累计充电次数', value: '312 次' },
    { label: '当前 SOH', value: '78%' },
  ]

  return (
    <div>
      {/* 警示横幅 */}
      <div className="alert-banner">
        <ShieldAlert size={18} strokeWidth={1.9} className="status-warning" />
        <div>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>新能源车辆 · 动力电池维修登记</div>
          <div style={{ fontSize: 12 }}>本登记为强制要求，所有安全检查清单必须全部勾选后方可提交。记录提交后不可删除，永久存档。</div>
        </div>
      </div>

      {/* 电池基础信息 */}
      <div className="card">
        <div className="card-title">电池基础信息</div>
        <div className="battery-grid">
          {batteryInfo.map(f => (
            <div key={f.label} className="battery-field">
              <label>{f.label}</label>
              <div className={`field-value readonly`}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 电池检测信息 */}
      <div className="card">
        <div className="card-title">电池检测信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>检测日期</label>
            <input className="form-input" type="datetime-local" defaultValue="2026-03-27T10:30" />
          </div>
          <div className="form-item">
            <label className="form-label">检测人员</label>
            <input className="form-input" value="张伟（技师）" readOnly style={{ background: '#fafafa', color: 'rgba(0,0,0,0.65)' }} />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>检测设备</label>
            <select className="form-select">
              <option>博世 KTS 590</option>
              <option>元征 X431 PRO</option>
              <option>道通 MaxiSys MS909</option>
            </select>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>电池电压（V）</label>
            <input className="form-input" type="number" step="0.01" defaultValue="398.56" />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>单体最高电压（V）</label>
            <input className="form-input" type="number" step="0.001" defaultValue="3.856" />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>单体最低电压（V）</label>
            <input className="form-input" type="number" step="0.001" defaultValue="3.612" />
          </div>
          <div className="form-item">
            <label className="form-label">电压差（V）<span style={{ color: 'rgba(0,0,0,0.45)', fontWeight: 400 }}>（自动计算）</span></label>
            <input className="form-input" value="0.244" readOnly style={{ background: '#fff2f0', color: '#ff4d4f', fontWeight: 600 }} />
            <div className="inline-status inline-status-danger" style={{ marginTop: 2 }}><AlertTriangle size={12} strokeWidth={2.2} /> 电压差偏大</div>
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>电池温度（℃）</label>
            <input className="form-input" type="number" step="0.1" defaultValue="28.5" />
          </div>
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>绝缘电阻（MΩ）</label>
            <input className="form-input" type="number" step="0.01" defaultValue="12.80" />
          </div>
          <div className="form-item" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">故障代码（DTC）</label>
            <input className="form-input" style={{ width: '100%' }} defaultValue="P0A80, P0A1F" placeholder="多个故障码用逗号分隔" />
          </div>
          <div className="form-item" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label"><span className="required">*</span>检测结论</label>
            <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
              {[['normal', '正常'], ['abnormal', '异常'], ['replace', '需更换']].map(([v, l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="detectionResult" value={v} checked={detectionResult === v} onChange={() => setDetectionResult(v)} />
                  <span style={{ color: v === 'replace' ? '#ff4d4f' : v === 'abnormal' ? '#faad14' : '#52c41a', fontWeight: detectionResult === v ? 600 : 400 }}>{l}</span>
                </label>
              ))}
            </div>
          </div>
          {(detectionResult === 'abnormal' || detectionResult === 'replace') && (
            <div className="form-item" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label"><span className="required">*</span>异常说明</label>
              <textarea className="form-textarea" rows={3} style={{ width: '100%' }} defaultValue="电池单体电压差超过0.2V阈值，SOH降至78%，建议整包更换以保障行驶安全。" />
            </div>
          )}
        </div>
      </div>

      {/* 维修/更换信息 */}
      <div className="card">
        <div className="card-title">维修/更换信息</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div className="form-item" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label"><span className="required">*</span>维修类型</label>
            <div style={{ display: 'flex', gap: 20, paddingTop: 4 }}>
              {[['repair', '维修'], ['replace_pack', '更换电池包'], ['replace_module', '更换电池模组'], ['replace_cell', '更换单体电池']].map(([v, l]) => (
                <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="repairType" value={v} checked={repairType === v} onChange={() => setRepairType(v)} />
                  {l}
                </label>
              ))}
            </div>
          </div>
          {repairType.startsWith('replace') && (
            <>
              <div className="form-item">
                <label className="form-label"><span className="required">*</span>新电池包编号</label>
                <input className="form-input" placeholder="输入新电池包唯一编号" defaultValue="BATT-2026-NEW-0327" />
              </div>
              <div className="form-item">
                <label className="form-label"><span className="required">*</span>旧电池包处理</label>
                <select className="form-select">
                  <option>返厂</option><option>报废</option><option>暂存</option>
                </select>
              </div>
              <div className="form-item" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label"><span className="required">*</span>旧电池包去向</label>
                <input className="form-input" style={{ width: '100%' }} placeholder="填写返厂单号/报废单号/暂存位置" defaultValue="返厂单号：RTN-2026-0327-001" />
              </div>
            </>
          )}
          <div className="form-item">
            <label className="form-label"><span className="required">*</span>维修后电压（V）</label>
            <input className="form-input" type="number" step="0.01" placeholder="维修完成后复测" />
          </div>
          <div className="form-item">
            <label className="form-label">维修后 SOH（%）</label>
            <input className="form-input" type="number" placeholder="维修完成后复测" />
          </div>
          <div className="form-item" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label"><span className="required">*</span>维修照片（≥3张，含维修前/中/后）</label>
            <div className="upload-area" style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Upload size={18} strokeWidth={1.8} className="upload-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* 安全检查清单 */}
      <div className="safety-card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ShieldAlert size={16} strokeWidth={1.9} style={{ color: '#cf1322' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#cf1322' }}>安全检查清单（必须全部勾选）</span>
          {submitBlocked && (
            <span className="inline-status inline-status-danger"><AlertTriangle size={12} strokeWidth={2.2} /> 请完成所有安全检查后再提交</span>
          )}
        </div>
        {safetyItems.map((item, i) => (
          <div key={i} className="safety-item" onClick={() => toggleSafety(i)} style={{ cursor: 'pointer' }}>
            <div className={`safety-check ${safetyChecks[i] ? 'checked' : ''}`}>
              {safetyChecks[i] && <Check size={11} strokeWidth={2.8} color="#fff" />}
            </div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 1 }}>{item.desc}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: 12 }}>
              {safetyChecks[i]
                ? <span className="inline-status inline-status-success"><CheckCircle2 size={12} strokeWidth={2.2} /> 已确认</span>
                : <span style={{ color: '#ff4d4f' }}>待确认</span>
              }
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: '8px 12px', background: safetyChecks.every(Boolean) ? '#f6ffed' : '#fff2f0', borderRadius: 4, fontSize: 12, color: safetyChecks.every(Boolean) ? '#52c41a' : '#ff4d4f', display: 'flex', alignItems: 'center', gap: 6 }}>
          {safetyChecks.every(Boolean)
            ? <><CheckCircle2 size={14} strokeWidth={2.2} /> 所有安全检查已完成，可以提交</>
            : <><AlertTriangle size={14} strokeWidth={2.2} /> 还有 {safetyChecks.filter(c => !c).length} 项安全检查未完成</>
          }
        </div>
      </div>

      {/* 底部操作 */}
      <div className="sticky-action-bar">
        <button className="btn btn-default">暂存</button>
        <button className="btn btn-primary" onClick={handleSubmit}
          style={!safetyChecks.every(Boolean) ? { opacity: 0.6 } : {}}>
          提交电池维修登记
        </button>
      </div>
    </div>
  )
}

// ─── Tab6: 环检模板 ──────────────────────────────────────────────────────────

const INSPECT_BRAND_OPTIONS = [
  { value: 'chery', label: '奇瑞' },
  { value: 'exeed', label: '星途' },
  { value: 'jetour', label: '捷途' },
  { value: 'icar', label: 'icar' },
  { value: 'fr', label: 'FR' },
]

const DEFAULT_INSPECT_TEMPLATES: InspectTemplateCategory[] = [
  { id: 1, category: '外观检查', items: ['车身划痕/凹陷', '玻璃裂纹', '轮胎磨损/气压', '灯具完好性'], required: true, enabled: true },
  { id: 2, category: '内饰检查', items: ['座椅/地毯状态', '仪表盘警示灯', '车内异味'], required: true, enabled: true },
  { id: 3, category: '底盘检查', items: ['漏油/漏水', '排气管状态'], required: false, enabled: true },
  { id: 4, category: '随车物品', items: ['备胎', '随车工具', '行驶证/保险单'], required: false, enabled: true },
  { id: 5, category: '仪表读数', items: ['进厂里程', '燃油量', '剩余电量（新能源）'], required: true, enabled: true },
]

function Tab6InspectTemplate() {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newItem, setNewItem] = useState('')
  const [templateList, setTemplateList] = usePersistentState<InspectTemplateCategory[]>(
    LOCAL_STORAGE_KEYS.inspectTemplates,
    DEFAULT_INSPECT_TEMPLATES,
  )
  const [newItems, setNewItems] = useState<string[]>([])

  const handleAddCategory = () => {
    if (!newCategory.trim()) return
    const allItems = [...newItems.filter(i => i.trim()), newItem.trim()].filter(Boolean)
    setTemplateList(prev => [...prev, {
      id: Date.now(), category: newCategory.trim(),
      brand: newBrand || undefined,
      items: allItems.length ? allItems : ['新检查项'],
      required: false, enabled: true,
    }])
    setShowAddModal(false)
    setNewCategory('')
    setNewBrand('')
    setNewItem('')
    setNewItems([])
  }

  const handleToggleEnabled = (id: number) => {
    setTemplateList(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t))
  }

  const handleRemoveItem = (tId: number, idx: number) => {
    setTemplateList(prev => prev.map(t => t.id === tId ? { ...t, items: t.items.filter((_, i) => i !== idx) } : t))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>环检模板配置</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={14} strokeWidth={2.2} /> 新增检查大类</button>
      </div>

      {templateList.map(t => (
        <div key={t.id} className="card" style={{ marginBottom: 10, opacity: t.enabled ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{t.category}</span>
            {t.brand && <span className="tag" style={{ fontSize: 11, background: '#e6f7ff', color: '#1890ff', border: '1px solid #91d5ff' }}>
              {INSPECT_BRAND_OPTIONS.find(opt => opt.value === t.brand)?.label || t.brand}
            </span>}
            {t.required && <span className="tag tag-pending" style={{ fontSize: 11 }}>必检</span>}
            {!t.enabled && <span className="tag tag-cancel" style={{ fontSize: 11 }}>已停用</span>}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <button className="btn btn-text btn-sm" onClick={() => setEditingId(editingId === t.id ? null : t.id)}>
                {editingId === t.id ? '收起' : '编辑'}
              </button>
              <button className="btn btn-danger-text btn-sm" onClick={() => handleToggleEnabled(t.id)}>
                {t.enabled ? '停用' : '启用'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {t.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#f5f5f5', borderRadius: 4, fontSize: 13 }}>
                {item}
                {editingId === t.id && (
                  <span style={{ color: '#ff4d4f', cursor: 'pointer', marginLeft: 2, display: 'inline-flex', alignItems: 'center' }}
                    onClick={() => handleRemoveItem(t.id, i)}><X size={12} strokeWidth={2.2} /></span>
                )}
              </div>
            ))}
            {editingId === t.id && (
              <button className="btn btn-default btn-sm" onClick={() => {
                setTemplateList(prev => prev.map(tp => tp.id === t.id ? { ...tp, items: [...tp.items, '新检查项'] } : tp))
              }}><Plus size={14} strokeWidth={2.2} /> 添加检查项</button>
            )}
          </div>
        </div>
      ))}

      {/* 新增大类弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" style={{ width: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              新增检查大类
              <button className="btn btn-text" onClick={() => setShowAddModal(false)} style={{ color: 'rgba(0,0,0,0.45)' }}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body">
              <div className="form-item" style={{ marginBottom: 16 }}>
                <label className="form-label"><span className="required">*</span>大类名称</label>
                <input className="form-input" style={{ width: '100%' }} placeholder="如：电气检查"
                  value={newCategory} onChange={e => setNewCategory(e.target.value)} autoFocus />
              </div>
              <div className="form-item" style={{ marginBottom: 16 }}>
                <label className="form-label">品牌</label>
                <select className="form-select" style={{ width: '100%' }} value={newBrand} onChange={e => setNewBrand(e.target.value)}>
                  <option value="">全部品牌</option>
                  {INSPECT_BRAND_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-item">
                <label className="form-label">检查项（每行一项）</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {newItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6 }}>
                      <input className="form-input" style={{ flex: 1 }} value={item}
                        onChange={e => setNewItems(prev => prev.map((v, idx) => idx === i ? e.target.value : v))} />
                      <button className="btn btn-danger-text btn-sm"
                        onClick={() => setNewItems(prev => prev.filter((_, idx) => idx !== i))}><X size={12} strokeWidth={2.2} /></button>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="form-input" style={{ flex: 1 }} placeholder="输入检查项名称"
                      value={newItem} onChange={e => setNewItem(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && newItem.trim()) { setNewItems(p => [...p, newItem.trim()]); setNewItem('') } }} />
                    <button className="btn btn-default btn-sm" onClick={() => { if (newItem.trim()) { setNewItems(p => [...p, newItem.trim()]); setNewItem('') } }}>添加</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowAddModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleAddCategory}
                style={{ opacity: newCategory.trim() ? 1 : 0.5 }}>确认新增</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab7: 工时标准 ──────────────────────────────────────────────────────────

const VEHICLE_MODELS = [
  { code: 'LY01',  name: '星途凌云',           series: '星途凌云',  product: '星途系列',   brand: '星途' },
  { code: 'YG',    name: '星途瑶光',           series: '星途瑶光',  product: '星途系列',   brand: '星途' },
  { code: 'YGCDM', name: '瑶光C-DM',          series: '星途瑶光',  product: '星途系列',   brand: '星途' },
  { code: 'S61FL', name: '舒享家-ICAR',        series: 'eQ7系',    product: 'eQ系列',     brand: 'ICAR' },
  { code: 'M1AEV', name: '艾瑞泽e',           series: '艾瑞泽e系', product: '艾瑞泽系列', brand: 'ICAR' },
  { code: 'ARZ8',  name: 'ARRIZO 8 2023款',   series: 'ARRIZO系', product: '艾瑞泽系列', brand: '奇瑞' },
  { code: 'TG8P',  name: 'TIGGO 8 PRO 2023款',series: 'TIGGO系',  product: '瑞虎系列',   brand: '奇瑞' },
  { code: 'TG7P',  name: 'TIGGO 7 PRO 2023款',series: 'TIGGO系',  product: '瑞虎系列',   brand: '奇瑞' },
  { code: 'EQ7',   name: 'eQ7 2024款',        series: 'eQ系',     product: 'eQ系列',     brand: '奇瑞' },
  { code: 'EQ5',   name: 'eQ5 2024款',        series: 'eQ系',     product: 'eQ系列',     brand: '奇瑞' },
  { code: 'ARZ6P', name: 'ARRIZO 6 PRO 2023款',series: 'ARRIZO系',product: '艾瑞泽系列', brand: '奇瑞' },
]

const DEFAULT_LABOR_STANDARDS: LaborStandardRecord[] = [
  { id: 1, model: 'ARRIZO 8 2023款', type: '保养', hours: 1.0, price: 80 },
  { id: 2, model: 'ARRIZO 8 2023款', type: '维修', hours: 1.0, price: 80 },
  { id: 3, model: '', type: '维修', hours: 1.0, price: 80 },
  { id: 4, model: 'TIGGO 8 PRO 2023款', type: '保养', hours: 1.0, price: 85 },
  { id: 5, model: 'TIGGO 8 PRO 2023款', type: '精品加装(装潢)', hours: 1.0, price: 85 },
  { id: 6, model: 'eQ7 2024款', type: '维修', hours: 1.0, price: 90 },
  { id: 7, model: '', type: '精品加装(装潢)', hours: 1.0, price: 90 },
]

function Tab7LaborStandard() {
  const [filterModel, setFilterModel] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [editingStandardId, setEditingStandardId] = useState<number | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerBrand, setPickerBrand] = useState('')
  const [pickerSelected, setPickerSelected] = useState('')
  const [newStandard, setNewStandard] = useState({ model: '', type: '维修', hours: '1.0', price: '' })
  const [standardList, setStandardList] = usePersistentState<LaborStandardRecord[]>(
    LOCAL_STORAGE_KEYS.laborStandards,
    DEFAULT_LABOR_STANDARDS,
  )

  const listModels = ['all', ...Array.from(new Set(standardList.map(s => s.model).filter(Boolean)))]
  const filtered = standardList.filter(s => {
    const matchModel = filterModel === 'all' || s.model === filterModel
    const matchType = filterType === 'all' || s.type === filterType
    return matchModel && matchType
  })

  const brands = Array.from(new Set(VEHICLE_MODELS.map(m => m.brand)))
  const pickerFiltered = VEHICLE_MODELS.filter(m => {
    const matchBrand = !pickerBrand || m.brand === pickerBrand
    const matchSearch = !pickerSearch || m.name.includes(pickerSearch) || m.code.includes(pickerSearch)
    return matchBrand && matchSearch
  })

  const handleConfirmModel = () => {
    if (!pickerSelected) return
    setNewStandard(p => ({ ...p, model: pickerSelected }))
    setShowModelPicker(false)
  }

  const closeStandardModal = () => {
    setShowAddModal(false)
    setEditingStandardId(null)
    setNewStandard({ model: '', type: '维修', hours: '1.0', price: '' })
    setPickerSelected('')
  }

  const handleOpenAddModal = () => {
    setEditingStandardId(null)
    setNewStandard({ model: '', type: '维修', hours: '1.0', price: '' })
    setPickerSelected('')
    setShowAddModal(true)
  }

  const handleEditStandard = (record: LaborStandardRecord) => {
    setEditingStandardId(record.id)
    setNewStandard({
      model: record.model,
      type: record.type,
      hours: record.hours.toFixed(1),
      price: `${record.price}`,
    })
    setPickerSelected(record.model)
    setShowAddModal(true)
  }

  const handleAddStandard = () => {
    if (!newStandard.hours || !newStandard.price) return
    const nextRecord: LaborStandardRecord = {
      id: editingStandardId ?? Date.now(),
      model: newStandard.model,
      type: newStandard.type,
      hours: parseFloat(newStandard.hours),
      price: parseFloat(newStandard.price),
    }

    setStandardList(prev => {
      if (editingStandardId === null) {
        return [...prev, nextRecord]
      }
      return prev.map(item => item.id === editingStandardId ? nextRecord : item)
    })

    closeStandardModal()
  }

  const handleDelete = (id: number) => {
    setStandardList(prev => prev.filter(s => s.id !== id))
  }

  // 模拟导入预览数据
  const previewData = [
    { model: 'TIGGO 7 PRO 2023款', type: '保养', hours: 1.0, price: 80 },
    { model: '', type: '维修', hours: 1.0, price: 80 },
    { model: 'ARRIZO 6 PRO 2023款', type: '保养', hours: 1.0, price: 80 },
  ]

  const handleImportConfirm = () => {
    setStandardList(prev => [...prev, ...previewData.map((d, i) => ({ ...d, id: Date.now() + i }))])
    setImportStep('done')
    setTimeout(() => { setShowImportModal(false); setImportStep('upload') }, 1500)
  }

  const isAddValid = !!(newStandard.hours && newStandard.price)
  const standardModalTitle = editingStandardId === null ? '新增工时单价' : '编辑工时单价'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>工时单价设置</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-default btn-sm" onClick={() => { setShowImportModal(true); setImportStep('upload') }}>导入 Excel</button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}><Plus size={14} strokeWidth={2.2} /> 新增工时单价</button>
        </div>
      </div>

      <div className="filter-bar">
        <select className="form-select" style={{ width: 200 }} value={filterModel} onChange={e => setFilterModel(e.target.value)}>
          {listModels.map(m => <option key={m} value={m}>{m === 'all' ? '全部车型' : m}</option>)}
        </select>
        <select className="form-select" style={{ width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">全部类型</option>{LABOR_PRICE_ADD_REPAIR_TYPE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
        <div className="spacer" />
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>共 {filtered.length} 条</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>车型</th><th>维修类型</th>
              <th className="text-right">标准工时（h）</th>
              <th className="text-right">工时单价（元/h）</th>
              <th className="text-right">标准费用</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 500 }}>{s.model || '全部车型'}</td>
                <td><span className={`tag ${MAINTENANCE_REPAIR_TYPES.has(s.type) ? 'tag-pending' : WARRANTY_REPAIR_TYPES.has(s.type) ? 'tag-done' : 'tag-working'}`}>{s.type}</span></td>
                <td className="text-right">{s.hours.toFixed(1)}</td>
                <td className="text-right">¥{s.price}</td>
                <td className="text-right" style={{ fontWeight: 500 }}>¥{(s.hours * s.price).toFixed(0)}</td>
                <td>
                  <button className="btn btn-text btn-sm" onClick={() => handleEditStandard(s)}>编辑</button>
                  <button className="btn btn-danger-text btn-sm" onClick={() => handleDelete(s.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增标准弹窗 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeStandardModal}>
          <div className="modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {standardModalTitle}
              <button className="btn btn-text" onClick={closeStandardModal} style={{ color: 'rgba(0,0,0,0.45)' }}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-item" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">车型</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" style={{ flex: 1, background: '#fafafa', cursor: 'default', color: newStandard.model ? 'rgba(0,0,0,0.88)' : 'rgba(0,0,0,0.25)' }}
                      value={newStandard.model} placeholder="可不选，默认全部车型" readOnly />
                    <button className="btn btn-default" onClick={() => { setPickerSelected(newStandard.model); setShowModelPicker(true) }}>选择车型</button>
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="required">*</span>维修类型</label>
                  <select className="form-select" style={{ width: '100%' }} value={newStandard.type}
                    onChange={e => setNewStandard(p => ({ ...p, type: e.target.value }))}>
                    {LABOR_PRICE_ADD_REPAIR_TYPE_OPTIONS.map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="required">*</span>标准工时（h）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" step="0.5" placeholder="1.0"
                    value={newStandard.hours} onChange={e => setNewStandard(p => ({ ...p, hours: e.target.value }))} />
                </div>
                <div className="form-item">
                  <label className="form-label"><span className="required">*</span>工时单价（元/h）</label>
                  <input className="form-input" style={{ width: '100%' }} type="number" placeholder="80"
                    value={newStandard.price} onChange={e => setNewStandard(p => ({ ...p, price: e.target.value }))} />
                </div>
                {newStandard.hours && newStandard.price && (
                  <div style={{ gridColumn: '1 / -1', padding: '8px 12px', background: '#f6ffed', borderRadius: 4, fontSize: 13, color: '#389e0d' }}>
                    标准费用预览：¥{(parseFloat(newStandard.hours || '0') * parseFloat(newStandard.price || '0')).toFixed(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={closeStandardModal}>取消</button>
              <button className="btn btn-primary" onClick={handleAddStandard}
                disabled={!isAddValid}
                style={{ opacity: isAddValid ? 1 : 0.4, cursor: isAddValid ? 'pointer' : 'not-allowed' }}>
                {editingStandardId === null ? '确认新增' : '保存修改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 车型选择弹窗 */}
      {showModelPicker && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setShowModelPicker(false)}>
          <div className="modal" style={{ width: 760 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              选择车型
              <button className="btn btn-text" onClick={() => setShowModelPicker(false)} style={{ color: 'rgba(0,0,0,0.45)' }}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body" style={{ paddingBottom: 8 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
                <div className="form-item" style={{ flex: 1 }}>
                  <label className="form-label" style={{ marginBottom: 2 }}>品牌</label>
                  <select className="form-select" style={{ width: '100%' }} value={pickerBrand} onChange={e => setPickerBrand(e.target.value)}>
                    <option value="">请选择品牌</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-item" style={{ flex: 2 }}>
                  <label className="form-label" style={{ marginBottom: 2 }}>车型名称</label>
                  <input className="form-input" style={{ width: '100%' }} placeholder="请输入车型名称"
                    value={pickerSearch} onChange={e => setPickerSearch(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 6, paddingBottom: 1 }}>
                  <button className="btn btn-primary btn-sm">查询</button>
                  <button className="btn btn-default btn-sm" onClick={() => { setPickerBrand(''); setPickerSearch('') }}>重置</button>
                </div>
              </div>
              <div style={{ padding: '6px 12px', background: '#e6f4ff', borderRadius: 4, fontSize: 12, color: '#003eb3', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={13} strokeWidth={2.2} />
                <span>已选择：</span>
                <span style={{ fontWeight: 600 }}>{pickerSelected || '—'}</span>
                {pickerSelected && (
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto', height: 24, padding: '0 10px', fontSize: 12 }}
                    onClick={handleConfirmModel}>确认</button>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6, fontWeight: 500 }}>数据列表</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>车型编码</th><th>车型名称</th><th>车系</th><th>产品系列</th><th>品牌</th>
                  </tr>
                </thead>
                <tbody>
                  {pickerFiltered.map(m => (
                    <tr key={m.code}
                      style={{ cursor: 'pointer', background: pickerSelected === m.name ? 'rgba(23,107,248,0.06)' : '' }}
                      onClick={() => setPickerSelected(m.name)}
                      onDoubleClick={() => { setNewStandard(p => ({ ...p, model: m.name })); setShowModelPicker(false) }}>
                      <td>
                        <div style={{ width: 16, height: 16, borderRadius: 3, border: `2px solid ${pickerSelected === m.name ? 'var(--primary)' : 'var(--border-input)'}`, background: pickerSelected === m.name ? 'var(--primary)' : '', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {pickerSelected === m.name && <Check size={11} strokeWidth={2.8} color="#fff" />}
                        </div>
                      </td>
                      <td style={{ color: 'rgba(0,0,0,0.65)' }}>{m.code}</td>
                      <td style={{ fontWeight: pickerSelected === m.name ? 600 : 400, color: pickerSelected === m.name ? 'var(--primary)' : '' }}>{m.name}</td>
                      <td style={{ color: 'rgba(0,0,0,0.65)' }}>{m.series}</td>
                      <td style={{ color: 'rgba(0,0,0,0.65)' }}>{m.product}</td>
                      <td style={{ color: 'rgba(0,0,0,0.65)' }}>{m.brand}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 10, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                <span>共计 {pickerFiltered.length} 条</span>
                <div className="pagination" style={{ padding: 0 }}>
                  {[1,2,3,4,5,6,7].map(p => (
                    <div key={p} className={`page-btn ${p === 1 ? 'active' : ''}`} style={{ width: 28, height: 28, fontSize: 12 }}>{p}</div>
                  ))}
                  <div className="page-btn" style={{ width: 28, height: 28, fontSize: 12 }}>›</div>
                </div>
                <select className="form-select" style={{ width: 80, height: 28, fontSize: 12 }}>
                  <option>20 条/页</option><option>50 条/页</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-default" onClick={() => setShowModelPicker(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleConfirmModel} disabled={!pickerSelected}
                style={{ opacity: pickerSelected ? 1 : 0.4 }}>确认</button>
            </div>
          </div>
        </div>
      )}

      {/* 导入 Excel 弹窗 */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => { setShowImportModal(false); setImportStep('upload') }}>
          <div className="modal" style={{ width: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              导入 Excel
              <button className="btn btn-text" onClick={() => { setShowImportModal(false); setImportStep('upload') }} style={{ color: 'rgba(0,0,0,0.45)' }}><X size={16} strokeWidth={2} /></button>
            </div>
            <div className="modal-body">
              {importStep === 'upload' && (
                <div>
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: '#e6f4ff', borderRadius: 6, fontSize: 13, color: '#003eb3' }}>
                    <span className="inline-status" style={{ color: '#003eb3', marginRight: 6 }}><ClipboardList size={14} strokeWidth={2.1} /></span>
                    <span className="text-link" style={{ marginLeft: 8 }}>下载模板</span>
                  </div>
                  <div className="upload-area" style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={() => setImportStep('preview')}>
                    <FolderUp size={28} strokeWidth={1.8} className="upload-icon" />
                  </div>
                </div>
              )}
              {importStep === 'preview' && (
                <div>
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="inline-status inline-status-success"><CheckCircle2 size={13} strokeWidth={2.2} /> 文件解析成功</span>
                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>共识别 {previewData.length} 条数据</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr><th>车型</th><th>类型</th><th className="text-right">工时</th><th className="text-right">单价</th></tr>
                    </thead>
                    <tbody>
                      {previewData.map((d, i) => (
                        <tr key={i}>
                          <td>{d.model || '全部车型'}</td>
                          <td><span className={`tag ${d.type === '保养' ? 'tag-pending' : 'tag-working'}`}>{d.type}</span></td>
                          <td className="text-right">{d.hours}</td>
                          <td className="text-right">¥{d.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {importStep === 'done' && (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={40} strokeWidth={1.8} color="#52c41a" /></div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#52c41a' }}>导入成功</div>
                  <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)', marginTop: 4 }}>已成功导入 {previewData.length} 条工时单价</div>
                </div>
              )}
            </div>
            {importStep !== 'done' && (
              <div className="modal-footer">
                <button className="btn btn-default" onClick={() => { setShowImportModal(false); setImportStep('upload') }}>取消</button>
                {importStep === 'upload' && <button className="btn btn-default" onClick={() => setImportStep('preview')}>模拟上传文件</button>}
                {importStep === 'preview' && <button className="btn btn-primary" onClick={handleImportConfirm}>确认导入</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Tab8WarrantyAlertReport({ order, onBackList, onOpenDetail }: { order?: WorkOrder | null; onBackList: () => void; onOpenDetail: (order: WorkOrder) => void }) {
  if (!order?.warrantyAlert) {
    return (
      <div className="card card-odin">
        <div className="card-title">三包预警报告</div>
        <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>当前未选择触发三包预警的工单。</div>
      </div>
    )
  }

  const blockedActions = ['派工', '交车', '返修', '施工详情']
  const isBlocking = isBlockingWarrantyAlert(order.warrantyAlert.level)
  const lockAt = order.warrantyLockedAt ?? order.updatedAt

  return (
    <div>
      <div className="card card-odin">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>三包预警报告</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1f1f1f' }}>{order.id}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>
              {order.plate} · {order.owner} · {order.model}
            </div>
          </div>
          <span className={`tag ${isBlocking ? 'tag-fail' : 'tag-warning'}`}>{getWarrantyAlertLabel(order.warrantyAlert.level)}</span>
          {order.warrantyLocked && <span className="tag tag-fail"><Lock size={12} strokeWidth={2.2} /> 已自动锁单</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-default btn-sm" onClick={onBackList}>返回工单列表</button>
            <button className="btn btn-primary btn-sm" onClick={() => onOpenDetail(order)}>查看委托书详情</button>
          </div>
        </div>
      </div>

      <div className="alert-banner alert-banner-danger">
        <ShieldAlert size={16} strokeWidth={1.9} />
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>系统已自动锁定单据并拦截业务处理</div>
          <div>{order.warrantyAlert.title}。{order.warrantyAlert.reason}</div>
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">报告摘要</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {[
            ['报告编号', buildWarrantyReportNo(order)],
            ['锁单时间', lockAt],
            ['触发动作', order.warrantyLockAction ? WORK_ORDER_ACTION_LABELS[order.warrantyLockAction] : '系统校验'],
            ['当前状态', order.warrantyLocked ? '已锁定' : '待处理'],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #edf1f7', background: '#fafcff' }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1f1f1f' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">预警明细</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['预警编码', order.warrantyAlert.code],
            ['预警标题', order.warrantyAlert.title],
            ['触发原因', order.warrantyAlert.reason],
            ['处理建议', order.warrantyAlert.guidance],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, padding: '12px 0', borderBottom: '1px solid #f0f2f5' }}>
              <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>{label}</div>
              <div style={{ fontSize: 13, color: '#1f1f1f', lineHeight: 1.7 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-odin">
        <div className="card-title">系统处理结果</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} strokeWidth={2.2} style={{ color: '#52c41a' }} />
            <span style={{ fontSize: 13, color: '#1f1f1f' }}>已将工单标记为高等级三包预警锁单状态</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} strokeWidth={2.2} style={{ color: '#52c41a' }} />
            <span style={{ fontSize: 13, color: '#1f1f1f' }}>服务顾问可从预警弹窗或委托书详情页进入三包预警报告，供三包专员复核</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Lock size={16} strokeWidth={2.2} style={{ color: '#cf1322', marginTop: 1 }} />
            <div style={{ fontSize: 13, color: '#1f1f1f', lineHeight: 1.7 }}>
              当前已禁用的业务动作：{blockedActions.join('、')}。如需继续处理，需先由三包专员解除预警并重新校验。
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

const Component = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [orders, setOrders] = usePersistentState<WorkOrder[]>(LOCAL_STORAGE_KEYS.orders, ORDERS, mergePersistedWorkOrders)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id ?? null)
  const [detailMode, setDetailMode] = useState<'detail' | 'delivery' | 'dispatch'>('detail')
  const [startEditing, setStartEditing] = useState(false)
  const [activeWarrantyReportOrderId, setActiveWarrantyReportOrderId] = useState<string | null>(null)
  const [qcRejectingOrder, setQcRejectingOrder] = useState<WorkOrder | null>(null)
  const selectedOrder = orders.find(order => order.id === selectedOrderId) ?? orders[0] ?? null
  const selectedWarrantyReportOrder = orders.find(order => order.id === activeWarrantyReportOrderId) ?? null

  const KEY_TO_TAB: Record<string, number> = {
    list: 0, create: 1, onsite_service: 2, work: 3, warranty_report: 4, history: 5, battery: 6, template: 7, labor: 8,
  }
  const TAB_TO_KEY = ['list', 'create', 'onsite_service', 'work', 'warranty_report', 'history', 'battery', 'template', 'labor']
  const pageMeta = [
    { title: '工单列表', breadcrumb: '维修业务 / 工单列表' },
    { title: '创建工单', breadcrumb: '维修业务 / 创建工单' },
    { title: '上门服务', breadcrumb: '维修业务 / 上门服务' },
    (() => {
      const isDeliveryActive = detailMode === 'delivery' && selectedOrder?.status === 'delivery'
      const isDispatchActive = detailMode === 'dispatch' && selectedOrder?.status === 'pending'
      const sectionName = isDeliveryActive ? '交车管理' : isDispatchActive ? '派工管理' : '委托书详情'
      return { title: selectedOrder ? `${sectionName} / ${selectedOrder.id}` : sectionName, breadcrumb: `维修业务 / ${sectionName}` }
    })(),
    { title: selectedWarrantyReportOrder ? `三包预警报告 / ${selectedWarrantyReportOrder.id}` : '三包预警报告', breadcrumb: '维修业务 / 三包预警报告' },
    { title: '维修历史', breadcrumb: '车辆档案 / 维修历史' },
    { title: '电池维修登记', breadcrumb: '车辆档案 / 电池维修登记' },
    { title: '环检模板', breadcrumb: '基础配置 / 环检模板' },
    { title: '工时单价设置', breadcrumb: '基础配置 / 工时单价设置' },
  ]

  const handleNav = (key: string) => {
    if (KEY_TO_TAB[key] !== undefined) setActiveTab(KEY_TO_TAB[key])
  }

  const handleOpenOrder = (order: WorkOrder, mode: 'detail' | 'delivery' | 'dispatch' = 'detail', shouldStartEditing = false) => {
    setSelectedOrderId(order.id)
    setDetailMode(mode)
    setStartEditing(shouldStartEditing)
    setActiveTab(3)
  }

  const handleOpenDispatch = (order: WorkOrder) => {
    if (order.status !== 'pending') return
    setSelectedOrderId(order.id)
    setDetailMode('dispatch')
    setActiveTab(3)
  }

  const handleConfirmDispatch = (orderId: string, info: WorkOrderDispatchInfo) => {
    const confirmedAt = formatRuntimeDateTime()
    const technicianLabel = info.technicianNames.length ? info.technicianNames.join('、') : '已派工'
    const principalTechnician = info.assignments[0]?.technicianName || technicianLabel.split('、')[0]
    setOrders(current => current.map(order => {
      if (order.id !== orderId) return order
      const repairItems = applyDispatchWritebackToRepairItems(order.repairItems, info)
      return {
        ...order,
        status: 'working' as WorkOrderStatus,
        onsiteStatus: isOnsiteOrder(order) ? 'pick' as OnsiteServiceStatus : order.onsiteStatus,
        technician: technicianLabel,
        principalTechnician: principalTechnician || order.principalTechnician,
        confirmedStartAt: confirmedAt,
        dispatchedAt: confirmedAt,
        dispatchInfo: info,
        repairItems,
        serviceVehicleId: info.serviceVehicleId ?? order.serviceVehicleId,
        serviceVehicleCode: info.serviceVehicleCode ?? order.serviceVehicleCode,
        serviceVehiclePlate: info.serviceVehiclePlate ?? order.serviceVehiclePlate,
        serviceVehicleName: info.serviceVehicleName ?? order.serviceVehicleName,
        estimatedDeliveryAt: info.estimatedCompletionAt || order.estimatedDeliveryAt,
        updatedAt: confirmedAt,
      }
    }))
    setDetailMode('detail')
  }

  const handleUploadSignedDoc = (orderId: string, fileName: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId && (order.status === 'inspecting' || order.status === 'diagnosing')
        ? {
            ...order,
            status: 'pending' as WorkOrderStatus,
            signedDocAt: now,
            signedDocFileName: fileName,
            updatedAt: now,
          }
        : order
    )))
  }

  const handleCompleteWork = (orderId: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId && order.status === 'working'
        ? { ...order, status: 'qc_wait' as WorkOrderStatus, onsiteStatus: isOnsiteOrder(order) ? 'qc' as OnsiteServiceStatus : order.onsiteStatus, completedAt: now, updatedAt: now }
        : order
    )))
  }

  const handleQcPass = (orderId: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId && order.status === 'qc_wait'
        ? { ...order, status: 'delivery' as WorkOrderStatus, onsiteStatus: isOnsiteOrder(order) ? 'settlement' as OnsiteServiceStatus : order.onsiteStatus, completedReviewAt: now, completedReviewer: order.completedReviewer && order.completedReviewer !== '—' ? order.completedReviewer : '当前班组长', updatedAt: now }
        : order
    )))
  }

  const handleQcReject = (orderId: string, payload: { items: QcRejectItem[]; reason?: string }) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId && order.status === 'qc_wait'
        ? {
            ...order,
            status: 'qc_fail' as WorkOrderStatus,
            onsiteStatus: isOnsiteOrder(order) ? 'finish' as OnsiteServiceStatus : order.onsiteStatus,
            qcRejectedAt: now,
            qcRejectedItems: payload.items.map(item => ({ ...item, reworked: false })),
            qcRejectReason: payload.reason || order.qcRejectReason,
            completedReviewer: order.completedReviewer && order.completedReviewer !== '—' ? order.completedReviewer : '当前班组长',
            updatedAt: now,
          }
        : order
    )))
  }

  const handleReworkComplete = (orderId: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => {
      if (order.id !== orderId || order.status !== 'qc_fail') return order
      const reworkedItems = (order.qcRejectedItems || []).map(item => ({ ...item, reworked: true, reworkedAt: now }))
      return {
        ...order,
        status: 'qc_wait' as WorkOrderStatus,
        onsiteStatus: isOnsiteOrder(order) ? 'qc' as OnsiteServiceStatus : order.onsiteStatus,
        qcRejectedItems: reworkedItems,
        completedAt: now,
        updatedAt: now,
      }
    }))
  }

  const handleUpdateItems = (orderId: string, repairItems: RepairItem[], partItems: PartItem[]) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId
        ? {
            ...order,
            repairItems: repairItems.map(item => ({ ...item })),
            partItems: partItems.map(item => ({ ...item })),
            actualLaborFee: repairItems.reduce((sum, item) => sum + (item.fee || 0), 0),
            actualMaterialFee: partItems.reduce((sum, item) => sum + (item.fee || 0), 0),
            actualTotalFee:
              repairItems.reduce((sum, item) => sum + (item.fee || 0), 0)
              + partItems.reduce((sum, item) => sum + (item.fee || 0), 0)
              + (order.otherFee || 0),
            updatedAt: now,
          }
        : order
    )))
  }

  const handleSettle = (orderId: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId && order.status === 'delivery'
        ? { ...order, onsiteStatus: isOnsiteOrder(order) ? 'return' as OnsiteServiceStatus : order.onsiteStatus, settlementAt: now, updatedAt: now }
        : order
    )))
  }

  const handleAdvanceOnsiteStatus = (orderId: string) => {
    const now = formatRuntimeDateTime()
    setOrders(current => current.map(order => {
      if (order.id !== orderId || !isOnsiteOrder(order)) return order
      const currentStatus = getOnsiteStatus(order)
      const nextStatus = getNextOnsiteStatus(currentStatus)
      if (!nextStatus) return order
      const partItems = nextStatus === 'depart' && currentStatus === 'pick'
        ? applyMaterialPickWriteback(order.partItems, '李明', order.technician || '—')
        : order.partItems
      const nextOrder: WorkOrder = {
        ...order,
        onsiteStatus: nextStatus,
        partItems,
        updatedAt: now,
      }
      if (nextStatus === 'depart') {
        nextOrder.materialStatus = getShortageParts(getWorkOrderPartItems(order)).length > 0 ? 'partial' : 'picked'
        nextOrder.onsitePickedAt = now
      } else if (nextStatus === 'arrive') {
        nextOrder.onsiteDepartedAt = now
      } else if (nextStatus === 'inspect') {
        nextOrder.onsiteArrivedAt = now
      } else if (nextStatus === 'start') {
        nextOrder.onsiteInspectedAt = now
        nextOrder.confirmedStartAt = now
      } else if (nextStatus === 'finish') {
        nextOrder.status = 'qc_wait'
        nextOrder.completedAt = now
      } else if (nextStatus === 'qc') {
        nextOrder.status = 'qc_wait'
      } else if (nextStatus === 'settlement') {
        nextOrder.status = 'delivery'
        nextOrder.completedReviewAt = now
      } else if (nextStatus === 'return') {
        nextOrder.settlementAt = now
      } else if (nextStatus === 'done') {
        nextOrder.status = 'done'
        nextOrder.deliveryAt = now
      }
      return nextOrder
    }))
  }

  const handleOpenWarrantyReport = (order: WorkOrder) => {
    setSelectedOrderId(order.id)
    setActiveWarrantyReportOrderId(order.id)
    setDetailMode('detail')
    setActiveTab(4)
  }

  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId(null)
      return
    }
    if (!selectedOrderId || !orders.some(order => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id)
    }
  }, [orders, selectedOrderId])

  const handleConfirmDelivery = (orderId: string) => {
    const deliveredAt = '2026-03-27 16:36'
    setOrders(current => current.map(order => (
      order.id === orderId
        ? { ...order, status: 'done', onsiteStatus: isOnsiteOrder(order) ? 'done' as OnsiteServiceStatus : order.onsiteStatus, deliveryAt: deliveredAt, updatedAt: deliveredAt }
        : order
    )))
    setDetailMode('detail')
  }

  const handleLockWarrantyOrder = (orderId: string, actionType: WorkOrderActionType) => {
    const lockedAt = formatRuntimeDateTime()
    setOrders(current => current.map(order => (
      order.id === orderId
        ? { ...order, warrantyLocked: true, warrantyLockedAt: lockedAt, warrantyLockAction: actionType, updatedAt: lockedAt }
        : order
    )))
  }

  const handleCreatedOrder = (newOrder: WorkOrder) => {
    setOrders(current => [newOrder, ...current])
    setSelectedOrderId(newOrder.id)
    setDetailMode('detail')
    setActiveTab(3)
  }

  const handleResetDemoData = () => {
    if (typeof window === 'undefined') return
    const confirmed = window.confirm('确定恢复维修工单管理的本地演示数据吗？当前浏览器中的工单、模板和工时单价修改会被清空。')
    if (!confirmed) return
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => window.localStorage.removeItem(key))
    window.location.reload()
  }

  return (
    <div className="layout">
      <Sidebar active={TAB_TO_KEY[activeTab] ?? 'list'} onNav={handleNav} />
      <div className="main">
        <Topbar />
        <div className="content">
          <div className="page-breadcrumb">{pageMeta[activeTab]?.breadcrumb}</div>
          {activeTab === 0 && <Tab1List orders={orders} onCreateOrder={() => setActiveTab(1)} onOpenDetail={handleOpenOrder} onOpenWarrantyReport={handleOpenWarrantyReport} onLockOrder={handleLockWarrantyOrder} onCompleteWork={handleCompleteWork} onQcPass={handleQcPass} onQcReject={setQcRejectingOrder} onSettle={handleSettle} />}
          {activeTab === 1 && <Tab2Create existingOrders={orders} onSubmitSuccess={handleCreatedOrder} />}
          {activeTab === 2 && <Tab1List orders={orders} listScope="onsite" onCreateOrder={() => setActiveTab(1)} onOpenDetail={handleOpenOrder} onOpenWarrantyReport={handleOpenWarrantyReport} onLockOrder={handleLockWarrantyOrder} onCompleteWork={handleCompleteWork} onQcPass={handleQcPass} onQcReject={setQcRejectingOrder} onSettle={handleSettle} onAdvanceOnsiteStatus={handleAdvanceOnsiteStatus} />}
          {activeTab === 3 && <Tab3Work order={selectedOrder} mode={detailMode} startEditing={startEditing} onStartEditingHandled={() => setStartEditing(false)} onConfirmDelivery={handleConfirmDelivery} onOpenWarrantyReport={handleOpenWarrantyReport} onOpenDispatch={handleOpenDispatch} onConfirmDispatch={handleConfirmDispatch} onCompleteWork={handleCompleteWork} onQcPass={handleQcPass} onQcReject={setQcRejectingOrder} onReworkComplete={handleReworkComplete} onSettle={handleSettle} onUploadSignedDoc={handleUploadSignedDoc} onUpdateItems={handleUpdateItems} />}
          {activeTab === 4 && <Tab8WarrantyAlertReport order={selectedWarrantyReportOrder} onBackList={() => setActiveTab(0)} onOpenDetail={order => handleOpenOrder(order)} />}
          {activeTab === 5 && <Tab4History />}
          {activeTab === 6 && <Tab5Battery />}
          {activeTab === 7 && <Tab6InspectTemplate />}
          {activeTab === 8 && <Tab7LaborStandard />}
        </div>
      </div>
      {qcRejectingOrder && (
        <QcRejectModal
          order={qcRejectingOrder}
          onCancel={() => setQcRejectingOrder(null)}
          onConfirm={(items, reason) => {
            handleQcReject(qcRejectingOrder.id, { items, reason })
            setQcRejectingOrder(null)
          }}
        />
      )}
    </div>
  )
}

export default Component
