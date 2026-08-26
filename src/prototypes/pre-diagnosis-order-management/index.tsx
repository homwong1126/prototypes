/**
 * @name 预诊单管理
 * @mode axure
 *
 * 参考资料：
 * - /src/prototypes/repair-workorder-m02
 * - /src/prototypes/pre-diagnosis-template-config
 */
import React, { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CarFront,
  Check,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  FileText,
  Gauge,
  History,
  Plus,
  Settings,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import {
  AnnotationViewer,
  type AnnotationDirectoryRouteNode,
  type AnnotationSourceDocument,
  type AnnotationViewerOptions,
} from '@axhub/annotation'
import annotationSourceDocument from './annotation-source.json'
import './style.css'

type PageKey = 'list' | 'create' | 'detail'
type PreDiagnosisStatus = '待预诊' | '待转工单' | '已完成'
type AppointmentLinkState = '未查询' | '未命中' | '待关联' | '已关联'
type LookupMode = 'store' | 'precise'
type InspectionGroupKey = 'reception' | 'cabin'
type VehicleInsightModalKey = 'appointment' | 'history' | 'rights' | 'campaign' | 'suggestion' | 'ownerVehicle'

interface PreDiagnosisOrder {
  id: string
  status: PreDiagnosisStatus
  plate: string
  vin: string
  customerName: string
  customerPhone: string
  model: string
  advisor: string
  appointmentNo?: string
  appointmentState: AppointmentLinkState
  problemCategory: string
  symptom: string
  urgency: string
  source: string
  serviceType: string
  mileage: string
  customerDesc: string
  createdAt: string
  expectedFinishAt: string
  workOrderNo?: string
  diagnosisProcess?: DiagnosisProcessRecord[]
  technicianRecords?: TechnicianRecord[]
  finalDiagnosis?: string
  generalInspectionAbnormal?: '是' | '否'
  faultLevel1?: string
  faultLevel2?: string
  attachments?: string[]
  workOrderFaultDesc?: string
}

interface VehicleRecord {
  id: string
  vin: string
  vehicleUsage: string
  vehicleStatus: string
  series: string
  mileage: string
  plate: string
  engineNo: string
  customerName: string
  phone: string
  model: string
}

interface AppointmentRecord {
  id: string
  appointmentNo: string
  source: string
  plate: string
  vin: string
  ownerName: string
  phone: string
  model: string
  reserveAt: string
  serviceType: string
  status: string
  customerDesc: string
}

interface DiagnosisGuideStep {
  id: string
  title: string
  station: string
  operation: string
  keyPoints: string[]
  result: string
}

interface DiagnosisProcessRecord {
  id: string
  time: string
  step: string
  status: string
  operator: string
  action: string
  finding: string
  evidence: string
}

interface TechnicianRecord {
  id: string
  technician: string
  role: string
  time: string
  recordType: string
  content: string
  conclusion: string
}

interface GeneralInspectionItem {
  title: string
  details: string[]
}

interface GeneralInspectionGroup {
  key: InspectionGroupKey
  title: string
  scene: string
  items: GeneralInspectionItem[]
}

interface InspectionFaultSelection {
  level1: string
  level2: string
  symptom: string
  attachments: string[]
}

interface FaultSubCategoryOption {
  name: string
  symptoms: string[]
}

interface FaultCategoryOption {
  name: string
  subCategories: FaultSubCategoryOption[]
}

const statusClassMap: Record<PreDiagnosisStatus, string> = {
  待预诊: 'tag-pending',
  待转工单: 'tag-warning',
  已完成: 'tag-done',
}

const appointmentStateClassMap: Record<AppointmentLinkState, string> = {
  未查询: 'tag-draft',
  未命中: 'tag-cancel',
  待关联: 'tag-warning',
  已关联: 'tag-done',
}

const serviceTypeOptions = ['自驾到店', '救援', '取车到店']
const customerSymptomOptions = ['车机屏幕黑屏', '倒车影像延迟', '氛围灯不亮', '12V蓄电池电压低', '鼓风机异响', '门把手弹出/收回异常']
const faultCategoryOptions: FaultCategoryOption[] = [
  {
    name: '低压电气',
    subCategories: [
      { name: '12V电源网络', symptoms: ['12V蓄电池电压低', '大量U码通讯异常', '模块供电/搭铁异常'] },
    ],
  },
  {
    name: '智能座舱/车联网',
    subCategories: [
      { name: '屏幕/显示', symptoms: ['车机屏幕黑屏', '屏幕触控异常', '屏幕亮度/坏点异常', '倒车影像延迟'] },
      { name: '音响/车联网', symptoms: ['音响单声道无声', '蓝牙钥匙异常', 'NFC钥匙异常', '车联网连接异常'] },
    ],
  },
  {
    name: '车身附件',
    subCategories: [
      { name: '车窗/天窗', symptoms: ['车窗防夹误触发', '天窗滑轨异响'] },
      { name: '门把手/灯光', symptoms: ['门把手弹出/收回异常', '氛围灯不亮', '灯光控制异常'] },
    ],
  },
  {
    name: '空调',
    subCategories: [
      { name: '鼓风机/制冷制热', symptoms: ['鼓风机异响', '制冷/制热切换异常', '出风异常'] },
    ],
  },
]
const attachmentSeed = ['接待区环检照片.jpeg', '车机黑屏照片.png', '诊断仪报告.pdf']
const deepDiagnosisEvidenceSeed = ['车机黑屏复现照片.png', '12V电压测量照片.jpeg', '全车DTC基准报告.pdf']
const inspectionAttachmentSeed: Record<InspectionGroupKey, string[]> = {
  reception: ['接待区环检照片.jpeg', '车机黑屏照片.png'],
  cabin: ['12V电压测量照片.jpeg', '全车DTC基准报告.pdf'],
}
const generalInspectionGroups: GeneralInspectionGroup[] = [
  {
    key: 'reception',
    title: '接待区 外观与内外饰快速环检',
    scene: '接待区',
    items: [
      { title: '四角高度', details: ['绕车一周，看四角高低是否一致，判断是否有空气悬架趴窝或弹簧断裂'] },
      { title: '灯光外观', details: ['灯罩有无裂纹、进水、起雾'] },
      { title: '外饰件', details: ['饰条、保险杠、轮眉缝隙、门把手伸缩状态'] },
      { title: '轮胎', details: ['胎面偏磨、胎壁鼓包、扎钉'] },
      { title: '内饰', details: ['仪表台、顶棚、座椅有无明显破损、塌陷、水渍'] },
      { title: '储物件', details: ['手套箱、扶手箱开闭是否正常'] },
    ],
  },
  {
    key: 'cabin',
    title: '车内（低压上电）检查',
    scene: '车内（低压上电，不踩刹车）',
    items: [
      {
        title: '12V蓄电池静态检查',
        details: ['用万用表直接量12V电池端电压', '低于11.8V则补充电后再查，或直接标记为可疑', '必须在诊断仪之前做，因为亏电会造成大量虚假故障码'],
      },
      {
        title: '诊断仪全车扫描',
        details: ['连接OBD口，钥匙ON挡，不启动高压', '先读取全车DTC，截图保存作为基准', '全车清码，留待后续验证哪些是真实故障', '重点看通讯类故障码（U码）的数量和分布', '如果大量模块通讯丢失，先检查12V供电、搭铁、网关，不要急着换件'],
      },
      {
        title: '座舱与车身电气功能测试',
        details: ['屏幕：逐块检查触控、亮度、坏点', '音响：每个声道单独听一遍', '空调：鼓风机1挡到最大挡听异响，制冷/制热切换感受', '灯光：近光、远光、双闪、雾灯、氛围灯全开一遍', '车窗：四门一键升降，到顶是否防夹误触发', '天窗：全开/全关，听滑轨有无异响', '门把手：用钥匙、手机蓝牙、NFC分别试一遍弹出/收回'],
      },
    ],
  },
]

const sidebarGroups = [
  {
    section: '维修业务',
    items: [
      { key: 'workbench', label: '工作台', icon: ClipboardList },
      { key: 'repair', label: '维修工单管理', icon: Wrench },
      { key: 'prediag', label: '预诊单管理', icon: ClipboardCheck },
    ],
  },
  {
    section: '预诊配置',
    items: [
      { key: 'template', label: '预诊模板配置', icon: FileText },
      { key: 'rule', label: '预诊规则配置', icon: Settings },
    ],
  },
]

const vehicleRecords: VehicleRecord[] = [
  {
    id: 'vehicle-1',
    vin: 'LFV2A21K0N3456789',
    vehicleUsage: '非营运',
    vehicleStatus: '实销完成',
    series: 'FR神行者8',
    mileage: '18,620',
    plate: '沪A·88888',
    engineNo: 'ENG345678',
    customerName: '李明',
    phone: '13826082608',
    model: 'FR神行者8',
  },
  {
    id: 'vehicle-2',
    vin: 'KW293B1283928372',
    vehicleUsage: '非营运',
    vehicleStatus: '实销完成',
    series: 'ARRIZO 8',
    mileage: '28,391',
    plate: '浙B·0L34B',
    engineNo: 'ENG128392',
    customerName: '郭富贵',
    phone: '13525253744',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 自动豪华版',
  },
  {
    id: 'vehicle-3',
    vin: 'LFV4C41K0L9876543',
    vehicleUsage: '三包车',
    vehicleStatus: '实销完成',
    series: 'TIGGO 7 PRO',
    mileage: '12,040',
    plate: '京C·66666',
    engineNo: 'ENG987654',
    customerName: '赵磊',
    phone: '13666666666',
    model: '奇瑞 TIGGO 7 PRO 2022款',
  },
  {
    id: 'vehicle-4',
    vin: 'LVSAB2E32PN654321',
    vehicleUsage: '—',
    vehicleStatus: '经销商仓库',
    series: 'TIGGO 9',
    mileage: '—',
    plate: '—',
    engineNo: 'ENG654321',
    customerName: '—',
    phone: '—',
    model: '奇瑞 TIGGO 9 展车',
  },
]

const appointmentRecords: AppointmentRecord[] = [
  {
    id: 'appointment-1',
    appointmentNo: 'YY-20260527-018',
    source: 'apollo',
    plate: '沪A·88888',
    vin: 'LFV2A21K0N3456789',
    ownerName: '李明',
    phone: '13826082608',
    model: 'FR神行者8',
    reserveAt: '2026/05/27 14:30',
    serviceType: '自驾到店',
    status: '待到店',
    customerDesc: '车机屏幕偶发黑屏，重启后恢复，最近一周出现 3 次。',
  },
  {
    id: 'appointment-2',
    appointmentNo: 'YY-20260527-026',
    source: 'apollo',
    plate: '浙B·0L34B',
    vin: 'KW293B1283928372',
    ownerName: '郭富贵',
    phone: '13525253744',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 自动豪华版',
    reserveAt: '2026/05/27 16:00',
    serviceType: '自驾到店',
    status: '已确认',
    customerDesc: '中控屏偶发卡顿，倒车影像延迟。',
  },
]

const prediagVehicleHistoryRecords = [
  {
    entrustNo: 'WT-20260418-102',
    admissionAt: '2026/04/18 09:25',
    completedAt: '2026/04/18 16:42',
    mileage: '17,880',
    repairCategory: '保养',
    symptom: '二保常规检查，客户反馈屏幕偶发卡顿',
    amount: '¥1,268.00',
  },
  {
    entrustNo: 'WT-20260303-066',
    admissionAt: '2026/03/03 10:12',
    completedAt: '2026/03/03 15:06',
    mileage: '15,310',
    repairCategory: '维修',
    symptom: '远程启动失败，完成车联网模块升级',
    amount: '¥0.00',
  },
  {
    entrustNo: 'WT-20260115-001',
    admissionAt: '2026/01/15 08:40',
    completedAt: '2026/01/15 13:28',
    mileage: '12,450',
    repairCategory: '维修',
    symptom: '空调滤芯异味，客户暂缓更换',
    amount: '¥368.00',
  },
]

const vehicleRightsRecords = [
  { label: '保养套餐', value: '基础保养套餐剩余 2 次', status: '可用' },
  { label: '延保产品', value: '三电系统延保至 2029/05/30', status: '有效' },
  { label: '代金券', value: '工时抵扣券 ¥200 × 1', status: '可用' },
  { label: '充值卡', value: '客户储值余额 ¥1,280.00', status: '可用' },
]

const serviceActivityRecords = [
  {
    id: 1,
    name: '厂家服务活动-座舱系统专项检查',
    type: '服务活动',
    scope: 'VIN 命中 / FR神行者8',
    benefit: '免费完成座舱软件版本检查',
    project: '座舱系统检查',
    status: '待确认',
    added: false,
  },
  {
    id: 2,
    name: '厂家服务活动-制动系统专项检查',
    type: '服务活动',
    scope: '本店在保车辆',
    benefit: '制动系统检查免费，制动清洁材料包免费',
    project: '制动系统检查',
    status: '待确认',
    added: false,
  },
]

const qualityImprovementRecords = [
  {
    id: 1,
    name: '显示链路控制策略升级',
    type: '技术升级',
    scope: 'VIN 命中 / 批次 TU-2026-02',
    benefit: '免费升级显示控制策略并完成复测',
    project: '车机显示链路升级',
    status: '待确认',
    added: false,
  },
  {
    id: 2,
    name: '前排安全带固定点召回检查',
    type: '召回',
    scope: '厂家召回批次 RC-2026-05',
    benefit: '召回范围内免费检查并按需更换固定件',
    project: '前排安全带固定点检查',
    status: '待确认',
    added: false,
  },
]

const repairSuggestionRecords = [
  {
    id: 1,
    title: '座舱软件升级',
    source: '预诊规则',
    detail: '当前车机软件版本低于推荐版本，建议创建工单后执行升级与复测。',
    project: '座舱软件升级 / 日志采集',
    estimate: '0.8 h / ¥0',
    status: '待处理',
    added: false,
  },
  {
    id: 2,
    title: '12V蓄电池复检',
    source: '远程诊断',
    detail: '低压上电场景存在瞬时电压波动，建议维修工单中补充电压复测。',
    project: '12V蓄电池检测',
    estimate: '0.4 h / ¥72',
    status: '待处理',
    added: false,
  },
  {
    id: 3,
    title: '空调滤芯更换',
    source: '上次委托书暂缓项目',
    detail: '历史委托书记录空调滤芯异味，客户当时暂缓，本次接待可重新提醒。',
    project: '空调滤芯更换',
    estimate: '0 h / ¥420',
    status: '待提醒',
    added: false,
  },
]

const seedOrders: PreDiagnosisOrder[] = [
  {
    id: 'PD-20260527-0018',
    status: '待转工单',
    plate: '沪A·88888',
    vin: 'LFV2A21K0N3456789',
    customerName: '李明',
    customerPhone: '13826082608',
    model: 'FR神行者8',
    advisor: '李顾问',
    appointmentNo: 'YY-20260527-018',
    appointmentState: '已关联',
    problemCategory: '智能座舱/车联网 / 屏幕/显示',
    symptom: '车机屏幕黑屏',
    urgency: '高',
    source: '预约单转入',
    serviceType: '自驾到店',
    mileage: '18,620',
    customerDesc: '车机屏幕偶发黑屏，重启后恢复，最近一周出现 3 次。',
    createdAt: '2026/05/27 14:05',
    expectedFinishAt: '2026/05/27 15:30',
    finalDiagnosis: '通用技术检查识别接待区与车内低压上电检查异常，深度诊断确认车机显示服务异常重启。',
    generalInspectionAbnormal: '是',
    faultLevel1: '智能座舱/车联网',
    faultLevel2: '屏幕/显示',
    attachments: attachmentSeed,
    workOrderFaultDesc: '车机屏幕黑屏；通用技术检查异常，已完成智能座舱/车联网 / 屏幕/显示深度诊断，建议转维修工单处理。',
  },
  {
    id: 'PD-20260527-0017',
    status: '待转工单',
    plate: '浙B·0L34B',
    vin: 'KW293B1283928372',
    customerName: '郭富贵',
    customerPhone: '13525253744',
    model: '奇瑞 ARRIZO 8 2023款 1.6T 自动豪华版',
    advisor: '王顾问',
    appointmentNo: 'YY-20260527-026',
    appointmentState: '已关联',
    problemCategory: '智能座舱/车联网 / 屏幕/显示',
    symptom: '倒车影像延迟',
    urgency: '中',
    source: '预约单转入',
    serviceType: '自驾到店',
    mileage: '28,391',
    customerDesc: '倒车影像延迟 2-3 秒，偶尔伴随屏幕卡顿。',
    createdAt: '2026/05/27 11:26',
    expectedFinishAt: '2026/05/27 12:20',
  },
  {
    id: 'PD-20260527-0016',
    status: '待预诊',
    plate: '京C·66666',
    vin: 'LFV4C41K0L9876543',
    customerName: '赵磊',
    customerPhone: '13666666666',
    model: '奇瑞 TIGGO 7 PRO 2022款',
    advisor: '陈顾问',
    appointmentState: '未命中',
    problemCategory: '车身附件 / 门把手/灯光',
    symptom: '氛围灯不亮',
    urgency: '低',
    source: '现场接车',
    serviceType: '自驾到店',
    mileage: '12,040',
    customerDesc: '主驾门板氛围灯不亮。',
    createdAt: '2026/05/27 10:08',
    expectedFinishAt: '2026/05/27 11:00',
  },
  {
    id: 'PD-20260526-0092',
    status: '已完成',
    plate: '皖B·Q7821',
    vin: 'LVVDC21B8TD102931',
    customerName: '赵琳',
    customerPhone: '13800555562',
    model: '奇瑞 瑞虎 8 PRO 390T',
    advisor: '李顾问',
    appointmentNo: 'YY-20260526-044',
    appointmentState: '已关联',
    problemCategory: '动力系统 / 起动',
    symptom: '冷车启动抖动',
    urgency: '中',
    source: '预约单转入',
    serviceType: '自驾到店',
    mileage: '36,800',
    customerDesc: '冷车启动 5 秒内有明显抖动。',
    createdAt: '2026/05/26 16:14',
    expectedFinishAt: '2026/05/26 17:20',
    workOrderNo: 'WT-20260526-081',
  },
]

const diagnosisGuideCollections: Record<string, DiagnosisGuideStep[]> = {
  低压电气: [
    {
      id: 'low-voltage-guide-1',
      title: '12V端电压与负载复测',
      station: '车内（低压上电）',
      operation: '复测12V电池端电压，记录静态电压、上电瞬间压降和负载开启后的稳定电压。',
      keyPoints: ['低于11.8V先补充电后复测', '确认电池桩头、搭铁点是否松动或氧化'],
      result: '静态电压偏低，补充电后复测并保留测量照片。',
    },
    {
      id: 'low-voltage-guide-2',
      title: '供电/搭铁/网关链路确认',
      station: '车内与前舱',
      operation: '检查模块供电、搭铁和网关通讯状态，排除低压异常导致的大量虚假故障码。',
      keyPoints: ['先排低压再判断模块故障', '大量U码优先看网关与搭铁'],
      result: '通讯异常集中于低压波动相关模块，建议转维修工单继续处理。',
    },
  ],
  '智能座舱/车联网': [
    {
      id: 'cockpit-guide-1',
      title: '接车区确认症状操作',
      station: '接车区',
      operation: '与客户复述故障场景，确认黑屏发生频率、持续时间、是否伴随声音中断，并拍摄屏幕黑屏状态照片。',
      keyPoints: ['确认是否为整屏无显示，而非应用卡死', '记录车辆上电状态、环境温度、最近一次出现时间'],
      result: '客户确认黑屏发生于低压上电后 1 分钟内，音频仍可播放。',
    },
    {
      id: 'cockpit-guide-2',
      title: '座舱功能复现与日志采集',
      station: '车内（低压上电）',
      operation: '低压上电后逐块检查屏幕触控、亮度、坏点、音响声道和车联网连接状态，并采集车机日志。',
      keyPoints: ['屏幕背光是否闪烁', '音响/车联网是否同步异常', '日志时间是否与故障复现时间一致'],
      result: '复现一次背光闪烁后黑屏，日志显示显示服务异常重启。',
    },
    {
      id: 'cockpit-guide-3',
      title: '软件版本与显示链路确认',
      station: '车内（诊断仪连接）',
      operation: '进入诊断工具读取IVI主机软件版本、DTC和显示链路状态，判断是否需要升级或转维修工单。',
      keyPoints: ['软件版本是否低于推荐版本', '显示链路DTC是否复现', '是否需要转维修工单升级或更换部件'],
      result: '读取到显示服务异常重启日志，建议转维修工单继续处理。',
    },
  ],
  车身附件: [
    {
      id: 'body-guide-1',
      title: '车身附件动作复现',
      station: '车内与车外',
      operation: '复现车窗、天窗、门把手、灯光和氛围灯动作，记录异常发生条件。',
      keyPoints: ['一键升降到顶是否误触防夹', '天窗滑轨是否异响', '门把手多种钥匙方式是否一致'],
      result: '已记录车身附件异常复现场景和照片证据。',
    },
    {
      id: 'body-guide-2',
      title: '执行器与控制模块检查',
      station: '车内（诊断仪连接）',
      operation: '读取车身控制模块DTC，检查执行器响应、线束插接和控制命令状态。',
      keyPoints: ['执行器是否卡滞', '控制命令与实际动作是否一致', '是否存在车身控制模块DTC'],
      result: '车身附件控制链路存在异常，建议转维修工单处理。',
    },
  ],
  空调: [
    {
      id: 'air-guide-1',
      title: '鼓风机与制冷制热复现',
      station: '车内（低压上电）',
      operation: '鼓风机1挡到最大挡逐档检查异响，切换制冷/制热并记录出风温度变化。',
      keyPoints: ['异响出现档位', '制冷/制热切换响应时间', '出风是否稳定'],
      result: '鼓风机高档位异响明显，制冷制热切换响应偏慢。',
    },
    {
      id: 'air-guide-2',
      title: 'HVAC数据流与DTC确认',
      station: '车内（诊断仪连接）',
      operation: '读取HVAC模块DTC、压力温度数据和风门执行器状态，判断是否转维修工单。',
      keyPoints: ['压力温度数据是否合理', '风门执行器是否卡滞', 'DTC是否清码后复现'],
      result: 'HVAC模块存在可复现异常，建议转维修工单处理。',
    },
  ],
}

function getDiagnosisGuideSteps(level1: string, level2: string, symptom: string) {
  if (!level1 || !level2 || !symptom) return []
  const category = faultCategoryOptions.find(item => item.name === level1)
  const matchedSubCategory = category?.subCategories.find(item => item.name === level2)
  if (!matchedSubCategory?.symptoms.includes(symptom)) return []
  return diagnosisGuideCollections[level1] ?? []
}

const diagnosisProcessSeed: DiagnosisProcessRecord[] = [
  {
    id: 'process-1',
    time: '14:10',
    step: '通用技术检查',
    status: '已完成',
    operator: '李顾问',
    action: '完成接待区外观与内外饰快速环检，并在车内低压上电状态完成12V蓄电池静态检查、诊断仪全车扫描和座舱与车身电气功能测试。',
    finding: '通用技术检查发现异常，客户描述的车机黑屏问题需要进入专项深度诊断。',
    evidence: '接待区环检照片.jpeg、全车DTC基准报告.pdf',
  },
  {
    id: 'process-2',
    time: '14:18',
    step: '异常故障分类',
    status: '已完成',
    operator: '李顾问',
    action: '选择一级分类“智能座舱/车联网”、二级分类“屏幕/显示”和故障现象“车机屏幕黑屏”。',
    finding: '分类与故障现象已形成深度诊断步骤指导匹配条件。',
    evidence: '车机黑屏照片.png',
  },
  {
    id: 'process-3',
    time: '14:28',
    step: '深度诊断记录',
    status: '进行中',
    operator: '张技师',
    action: '按智能座舱/车联网 / 屏幕/显示步骤指导执行低压供电、背光响应、显示链路和系统日志检查。',
    finding: '读取到显示服务异常重启日志，当前软件版本低于推荐版本。',
    evidence: '诊断仪报告.pdf',
  },
]

const technicianRecordsSeed: TechnicianRecord[] = [
  {
    id: 'tech-record-1',
    technician: '张技师',
    role: '智能座舱技师',
    time: '2026/05/27 14:30',
    recordType: '过程记录',
    content: '按照步骤指导完成低压上电、背光响应、保险丝和插接件检查，并上传复现照片与诊断仪报告。',
    conclusion: '初步判断为车机显示服务异常重启，建议转维修工单进行软件升级和进一步确认。',
  },
]

const processLogs = [
  { time: '2026/05/27 14:05', title: '创建预诊单', desc: '李顾问通过 VIN 查询车辆后创建预诊单' },
  { time: '2026/05/27 14:07', title: '关联预约单', desc: '关联预约单 YY-20260527-018，并带入客户描述' },
  { time: '2026/05/27 14:18', title: '保存检查记录', desc: '完成接车区症状确认和低压上电检查' },
  { time: '2026/05/27 14:32', title: '提交预诊', desc: '建议转维修工单进行软件日志分析和部件检查' },
]

const PRE_DIAGNOSIS_DETAIL_STEPS = ['已创建', '车辆确认', '预约关联', '诊断检查', '待转工单', '已完成'] as const

function getPreDiagnosisDetailStepIndex(order: PreDiagnosisOrder) {
  if (order.status === '已完成') return 5
  if (order.status === '待转工单') return 4
  if (order.appointmentState === '已关联') return 2
  if (order.appointmentState === '待关联' || order.appointmentState === '未命中') return 1
  return 0
}

function maskPhone(phone: string) {
  if (!phone || phone === '—') return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function getAppointmentsForVehicle(vehicle?: Pick<VehicleRecord, 'vin' | 'plate'> | null) {
  if (!vehicle) return []
  return appointmentRecords.filter(item => item.vin === vehicle.vin || item.plate === vehicle.plate)
}

function AppShell({ active, onNavigate, children }: { active: PageKey; onNavigate: (page: PageKey) => void; children: React.ReactNode }) {
  const tabs = [
    { label: '预诊单列表', key: 'list' as PageKey, icon: ClipboardList },
    { label: '创建预诊单', key: 'create' as PageKey, icon: Plus },
    { label: '预诊单详情', key: 'detail' as PageKey, icon: FileText },
  ]

  return (
    <div className="layout prediag-order-page">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark" aria-hidden="true">CHERY</div>
          <span>ODIN</span>
        </div>
        {sidebarGroups.map(group => (
          <div key={group.section} className="sidebar-section">
            <div className="sidebar-section-title">{group.section}</div>
            {group.items.map(item => {
              const Icon = item.icon
              return (
                <div key={item.key} className={`sidebar-item${item.key === 'prediag' ? ' active' : ''}`}>
                  <span className="icon"><Icon size={15} strokeWidth={2} /></span>
                  {item.label}
                </div>
              )
            })}
          </div>
        ))}
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="prediag-order-top-title">售后服务 / 预诊单管理</div>
          <div className="prediag-order-top-spacer" />
          <span className="prediag-order-store">奇瑞上海浦东体验中心</span>
          <span className="prediag-order-user">王泓</span>
        </header>
        <div className="tab-nav tab-nav-odin">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <div key={tab.key} className={`tab-item ${active === tab.key ? 'active' : ''}`} onClick={() => onNavigate(tab.key)}>
                <Icon size={15} strokeWidth={2} />
                {tab.label}
              </div>
            )
          })}
        </div>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function StatusTag({ status }: { status: PreDiagnosisStatus }) {
  return <span className={`tag ${statusClassMap[status]}`}>{status}</span>
}

function AppointmentStateTag({ state }: { state: AppointmentLinkState }) {
  return <span className={`tag ${appointmentStateClassMap[state]}`}>{state}</span>
}

function ListPage({ orders, onCreate, onDetail }: { orders: PreDiagnosisOrder[]; onCreate: () => void; onDetail: (id: string) => void }) {
  const [statusFilter, setStatusFilter] = useState('全部状态')
  const [plateKeyword, setPlateKeyword] = useState('')
  const [vinKeyword, setVinKeyword] = useState('')
  const [customerKeyword, setCustomerKeyword] = useState('')
  const [advisorKeyword, setAdvisorKeyword] = useState('')
  const [createdDateKeyword, setCreatedDateKeyword] = useState('')

  const filteredOrders = useMemo(() => orders.filter(order => {
    const matchStatus = statusFilter === '全部状态' || order.status === statusFilter
    const matchPlate = !plateKeyword || order.plate.toLowerCase().includes(plateKeyword.toLowerCase())
    const matchVin = !vinKeyword || order.vin.toLowerCase().includes(vinKeyword.toLowerCase())
    const matchCustomer = !customerKeyword || order.customerName.toLowerCase().includes(customerKeyword.toLowerCase())
    const matchAdvisor = !advisorKeyword || order.advisor.toLowerCase().includes(advisorKeyword.toLowerCase())
    const normalizedCreatedDateKeyword = createdDateKeyword.replace(/[-.]/g, '/').trim()
    const matchCreatedDate = !normalizedCreatedDateKeyword || order.createdAt.includes(normalizedCreatedDateKeyword)
    return matchStatus && matchPlate && matchVin && matchCustomer && matchAdvisor && matchCreatedDate
  }), [advisorKeyword, createdDateKeyword, customerKeyword, orders, plateKeyword, statusFilter, vinKeyword])

  const stats = [
    { label: '全部', value: '全部状态', count: orders.length },
    { label: '待预诊', value: '待预诊', count: orders.filter(order => order.status === '待预诊').length },
    { label: '待转工单', value: '待转工单', count: orders.filter(order => order.status === '待转工单').length },
    { label: '已完成', value: '已完成', count: orders.filter(order => order.status === '已完成').length },
  ]

  return (
    <>
      <section className="advanced-filter-card" data-annotation-id="prediag-order-filters">
        <div className="advanced-filter-header">
          <div className="advanced-filter-title">查询条件</div>
        </div>
        <div className="advanced-filter-grid prediag-order-filter-grid">
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">车牌号</span>
            <input className="form-input advanced-filter-control" value={plateKeyword} placeholder="请输入车牌号" onChange={event => setPlateKeyword(event.target.value)} />
          </label>
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">VIN码</span>
            <input className="form-input advanced-filter-control" value={vinKeyword} placeholder="请输入 VIN 码" onChange={event => setVinKeyword(event.target.value.toUpperCase())} />
          </label>
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">客户</span>
            <input className="form-input advanced-filter-control" value={customerKeyword} placeholder="请输入客户姓名" onChange={event => setCustomerKeyword(event.target.value)} />
          </label>
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">状态</span>
            <select className="form-select advanced-filter-control" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              {['全部状态', '待预诊', '待转工单', '已完成'].map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">服务顾问</span>
            <input className="form-input advanced-filter-control" value={advisorKeyword} placeholder="请输入服务顾问" onChange={event => setAdvisorKeyword(event.target.value)} />
          </label>
          <label className="advanced-filter-item">
            <span className="advanced-filter-label">创建日期</span>
            <input className="form-input advanced-filter-control" value={createdDateKeyword} placeholder="2026/05/27" onChange={event => setCreatedDateKeyword(event.target.value)} />
          </label>
        </div>
        <div className="advanced-filter-toolbar">
          <div className="advanced-filter-toolbar-left" />
          <div className="advanced-filter-toolbar-right">
            <button className="btn btn-primary btn-sm" type="button">查询</button>
            <button className="btn btn-default btn-sm" type="button" onClick={() => { setStatusFilter('全部状态'); setPlateKeyword(''); setVinKeyword(''); setCustomerKeyword(''); setAdvisorKeyword(''); setCreatedDateKeyword('') }}>重置</button>
          </div>
        </div>
      </section>

      <section className="card card-odin prediag-list-card" data-annotation-id="prediag-order-table-section">
        <div className="list-card-header">
          <div className="list-card-title-wrap">
            <div className="list-card-title">数据列表</div>
          </div>
          <div className="list-card-actions">
            <button className="btn btn-primary btn-sm" onClick={onCreate}><Plus size={14} /> 新增预诊单</button>
            <button className="btn btn-default btn-sm">批量导出</button>
          </div>
        </div>
        <div className="list-status-strip list-status-strip--tabs">
          {stats.map(item => (
            <button
              key={item.label}
              type="button"
              className={`list-status-tab ${statusFilter === item.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(item.value)}
            >
              <span>{item.label}</span>
              <strong>({item.count})</strong>
            </button>
          ))}
        </div>
        <div className="prediag-selection-info">已展示 {filteredOrders.length} / {orders.length} 条数据</div>
        <div className="prediag-table-scroll">
          <table className="data-table prediag-order-table" data-annotation-id="prediag-order-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}><input type="checkbox" /></th>
                <th>预诊单号</th>
                <th>状态</th>
                <th>车牌号</th>
                <th>VIN</th>
                <th>客户姓名</th>
                <th>预约单号</th>
                <th>问题分类</th>
                <th>故障现象</th>
                <th>服务顾问</th>
                <th>创建时间</th>
                <th>预计完成</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td><input type="checkbox" /></td>
                  <td><button className="text-link-button" onClick={() => onDetail(order.id)}>{order.id}</button></td>
                  <td><StatusTag status={order.status} /></td>
                  <td className="prediag-strong-cell">{order.plate}</td>
                  <td>{order.vin}</td>
                  <td>{order.customerName}</td>
                  <td>{order.appointmentNo || '—'}</td>
                  <td>{order.problemCategory}</td>
                  <td>{order.symptom}</td>
                  <td>{order.advisor}</td>
                  <td>{order.createdAt}</td>
                  <td>{order.expectedFinishAt}</td>
                  <td>
                    <div className="prediag-row-actions">
                      <button className="btn btn-text btn-sm" onClick={() => onDetail(order.id)}>查看</button>
                      {order.status !== '已完成' && (
                        <button className="btn btn-text btn-sm">编辑</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="prediag-pagination-bar">
          <span>共计 {filteredOrders.length} 条</span>
          <div className="prediag-pages"><button className="active">1</button><button>2</button><button>3</button></div>
          <span>100 条/页</span>
        </div>
      </section>
    </>
  )
}

function VehicleLookupModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (vehicle: VehicleRecord) => void
}) {
  const [lookupMode, setLookupMode] = useState<LookupMode>('store')
  const [lookupVin, setLookupVin] = useState('LFV2A21K0N3456789')
  const [lookupPlate, setLookupPlate] = useState('')
  const [engineLastSix, setEngineLastSix] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleRecords[0].id)

  if (!open) return null

  const selectedVehicle = vehicleRecords.find(item => item.id === selectedVehicleId) ?? vehicleRecords[0]

  return (
    <div className="modal-overlay">
      <div className="modal prediag-vehicle-modal">
        <div className="modal-header">
          车辆查询
          <button className="btn btn-text" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ paddingTop: 0 }}>
          <div className="prediag-lookup-tabs">
            {[
              { key: 'store', label: '车辆查询' },
              { key: 'precise', label: '车辆精确查询' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`prediag-lookup-tab ${lookupMode === tab.key ? 'active' : ''}`}
                onClick={() => setLookupMode(tab.key as LookupMode)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {lookupMode === 'store' ? (
            <div className="prediag-lookup-form store">
              <label className="form-item">
                <span className="form-label">VIN：</span>
                <input className="form-input" placeholder="请输入 VIN" value={lookupVin} onChange={event => setLookupVin(event.target.value.toUpperCase())} />
              </label>
              <label className="form-item">
                <span className="form-label">车牌号：</span>
                <input className="form-input" placeholder="请输入车牌号" value={lookupPlate} onChange={event => setLookupPlate(event.target.value)} />
              </label>
              <div className="prediag-lookup-actions">
                <button className="btn btn-primary">查询</button>
                <button className="btn btn-default" onClick={() => { setLookupVin(''); setLookupPlate('') }}>重置</button>
              </div>
            </div>
          ) : (
            <div className="prediag-lookup-form precise">
              <label className="form-item">
                <span className="form-label">VIN：</span>
                <input className="form-input" placeholder="请输入完整 VIN 码" value={lookupVin} onChange={event => setLookupVin(event.target.value.toUpperCase())} />
              </label>
              <label className="form-item">
                <span className="form-label">发动机后 6 位：</span>
                <input className="form-input" placeholder="请输入发动机后6位" maxLength={6} value={engineLastSix} onChange={event => setEngineLastSix(event.target.value.toUpperCase())} />
              </label>
              <div className="prediag-lookup-actions">
                <button className="btn btn-primary">查询</button>
                <button className="btn btn-default" onClick={() => { setLookupVin(''); setEngineLastSix('') }}>重置</button>
              </div>
            </div>
          )}

          <div className="prediag-lookup-tip">
            <AlertCircle size={14} />
            <span>选择车辆后回填车主车辆信息，并自动匹配预约单。</span>
            <button className="btn btn-primary btn-sm" onClick={() => onConfirm(selectedVehicle)}>确认</button>
          </div>

          <table className="data-table prediag-lookup-table">
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
              {vehicleRecords.map(record => (
                <tr key={record.id} className={selectedVehicleId === record.id ? 'selected' : ''} onClick={() => setSelectedVehicleId(record.id)} onDoubleClick={() => onConfirm(record)}>
                  <td>
                    <span className="prediag-select-box">{selectedVehicleId === record.id ? <Check size={11} /> : null}</span>
                  </td>
                  <td>{record.vin}</td>
                  <td>{record.vehicleUsage}</td>
                  <td>{record.vehicleStatus}</td>
                  <td>{record.series}</td>
                  <td>{record.mileage === '—' ? '—' : `${record.mileage} km`}</td>
                  <td>{record.plate}</td>
                  <td>{record.engineNo}</td>
                  <td>{record.customerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function VehicleInsightModal({
  tab,
  vehicle,
  appointments,
  selectedAppointmentId,
  onSelectAppointment,
  onConfirmAppointment,
  serviceActivities,
  qualityImprovements,
  repairSuggestions,
  selectedServiceActivityIds,
  selectedQualityImprovementIds,
  selectedRepairSuggestionIds,
  onToggleServiceActivity,
  onToggleQualityImprovement,
  onToggleRepairSuggestion,
  onConfirmVehicleInsights,
  onClose,
  onApplyOwnerVehicle,
  onApplyHistoryRecord,
}: {
  tab: VehicleInsightModalKey
  vehicle: VehicleRecord | null
  appointments: AppointmentRecord[]
  selectedAppointmentId: string
  onSelectAppointment: (id: string) => void
  onConfirmAppointment: () => void
  serviceActivities: typeof serviceActivityRecords
  qualityImprovements: typeof qualityImprovementRecords
  repairSuggestions: typeof repairSuggestionRecords
  selectedServiceActivityIds: number[]
  selectedQualityImprovementIds: number[]
  selectedRepairSuggestionIds: number[]
  onToggleServiceActivity: (id: number) => void
  onToggleQualityImprovement: (id: number) => void
  onToggleRepairSuggestion: (id: number) => void
  onConfirmVehicleInsights: () => void
  onClose: () => void
  onApplyOwnerVehicle: (patch: Partial<Pick<VehicleRecord, 'customerName' | 'phone' | 'plate' | 'vin' | 'model'>>) => void
  onApplyHistoryRecord: (record: (typeof prediagVehicleHistoryRecords)[number]) => void
}) {
  const currentVehicle = vehicle ?? vehicleRecords[0]
  const visibleAppointments = appointments.slice(0, 1)
  const [ownerForm, setOwnerForm] = useState({
    customerName: currentVehicle.customerName === '—' ? '' : currentVehicle.customerName,
    phone: currentVehicle.phone === '—' ? '' : currentVehicle.phone,
    plate: currentVehicle.plate === '—' ? '' : currentVehicle.plate,
    vin: currentVehicle.vin,
    model: currentVehicle.model,
  })

  const titleMap: Record<VehicleInsightModalKey, string> = {
    appointment: '关联预约单',
    history: '委托书履历',
    rights: '车辆权益',
    campaign: '服务活动 / 品质改善',
    suggestion: '维修建议',
    ownerVehicle: '车主车辆信息变更',
  }

  const updateOwnerForm = (key: keyof typeof ownerForm, value: string) => {
    setOwnerForm(current => ({ ...current, [key]: key === 'vin' ? value.toUpperCase() : value }))
  }

  const handleConfirm = () => {
    if (tab === 'ownerVehicle') {
      onApplyOwnerVehicle(ownerForm)
      return
    }
    onClose()
  }

  const shouldShowOwnerConfirm = tab === 'ownerVehicle'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal prediag-insight-modal" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          {titleMap[tab]}
          <button className="btn btn-text" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body prediag-insight-modal-body">
          {tab === 'appointment' && (
            <table className="data-table prediag-insight-table" data-annotation-id="prediag-appointment-table">
              <thead>
                <tr>
                  <th style={{ width: 52 }}>选择</th>
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
                {visibleAppointments.map(record => (
                  <tr key={record.id} onClick={() => onSelectAppointment(record.id)}>
                    <td><input type="radio" checked={selectedAppointmentId === record.id} onChange={() => onSelectAppointment(record.id)} /></td>
                    <td className="prediag-strong-cell">{record.appointmentNo}</td>
                    <td>{record.source}</td>
                    <td>{record.plate}</td>
                    <td>{record.vin}</td>
                    <td>{record.ownerName}</td>
                    <td>{maskPhone(record.phone)}</td>
                    <td>{record.reserveAt}</td>
                    <td><span className="tag tag-pending">{record.serviceType}</span></td>
                    <td>{record.status}</td>
                  </tr>
                ))}
                {visibleAppointments.length === 0 && (
                  <tr>
                    <td colSpan={10} className="prediag-modal-empty">当前车辆暂无可关联预约单</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'history' && (
            <>
              <div className="prediag-insight-summary">
                {[
                  { label: '历史进厂次数', value: `${prediagVehicleHistoryRecords.length} 次` },
                  { label: '最近委托书', value: prediagVehicleHistoryRecords[0].entrustNo },
                  { label: '最近里程', value: `${prediagVehicleHistoryRecords[0].mileage} km` },
                  { label: '最近问题', value: prediagVehicleHistoryRecords[0].symptom },
                ].map(item => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
              <div className="prediag-modal-table-scroll">
                <table className="data-table prediag-insight-table">
                  <thead>
                    <tr>
                      <th>委托书编号</th>
                      <th>进厂时间</th>
                      <th>完工时间</th>
                      <th>维修类别</th>
                      <th>行驶里程</th>
                      <th>故障现象</th>
                      <th>结算金额</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prediagVehicleHistoryRecords.map(record => (
                      <tr key={record.entrustNo}>
                        <td className="prediag-strong-cell">{record.entrustNo}</td>
                        <td>{record.admissionAt}</td>
                        <td>{record.completedAt}</td>
                        <td><span className="tag tag-working">{record.repairCategory}</span></td>
                        <td>{record.mileage} km</td>
                        <td>{record.symptom}</td>
                        <td>{record.amount}</td>
                        <td><button className="btn btn-text btn-sm" onClick={() => onApplyHistoryRecord(record)}>带入问题</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'rights' && (
            <>
              <div className="prediag-insight-vehicle-line">
                <strong>{currentVehicle.plate === '—' ? ownerForm.plate || '待补充车牌' : currentVehicle.plate}</strong>
                <span>{currentVehicle.vin}</span>
                <span>{currentVehicle.model}</span>
              </div>
              <div className="prediag-rights-grid">
                {vehicleRightsRecords.map(record => (
                  <div key={record.label} className="prediag-right-card">
                    <span>{record.label}</span>
                    <strong>{record.value}</strong>
                    <em>{record.status}</em>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'campaign' && (
            <div className="prediag-insight-sections">
              <section className="prediag-insight-section">
                <div className="prediag-insight-section-title">服务活动</div>
                <table className="data-table prediag-insight-table">
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
                    {serviceActivities.map(record => (
                      <tr key={record.name}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedServiceActivityIds.includes(record.id)}
                            disabled={record.added}
                            onChange={() => onToggleServiceActivity(record.id)}
                          />
                        </td>
                        <td className="prediag-strong-cell">{record.name}</td>
                        <td><span className="tag tag-pending">{record.type}</span></td>
                        <td>{record.scope}</td>
                        <td>{record.benefit}</td>
                        <td>{record.project}</td>
                        <td><span className={`tag ${record.added ? 'tag-done' : 'tag-warning'}`}>{record.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section className="prediag-insight-section">
                <div className="prediag-insight-section-title">品质改善</div>
                <table className="data-table prediag-insight-table">
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
                    {qualityImprovements.map(record => (
                      <tr key={record.name}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedQualityImprovementIds.includes(record.id)}
                            disabled={record.added}
                            onChange={() => onToggleQualityImprovement(record.id)}
                          />
                        </td>
                        <td className="prediag-strong-cell">{record.name}</td>
                        <td><span className="tag tag-working">{record.type}</span></td>
                        <td>{record.scope}</td>
                        <td>{record.benefit}</td>
                        <td>{record.project}</td>
                        <td><span className={`tag ${record.added ? 'tag-done' : 'tag-warning'}`}>{record.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          )}

          {tab === 'suggestion' && (
            <div className="prediag-suggestion-list">
              {repairSuggestions.map(record => (
                <label key={record.title} className="prediag-suggestion-card">
                  <input
                    type="checkbox"
                    checked={selectedRepairSuggestionIds.includes(record.id)}
                    disabled={record.added}
                    onChange={() => onToggleRepairSuggestion(record.id)}
                  />
                  <div>
                    <div className="prediag-suggestion-head">
                      <strong>{record.title}</strong>
                      <span>{record.source}</span>
                    </div>
                    <p>{record.detail}</p>
                    <div className="prediag-suggestion-meta">
                      <span>{record.project}</span>
                      <em>{record.estimate}</em>
                    </div>
                    <span className={`tag ${record.added ? 'tag-done' : 'tag-warning'}`}>{record.status}</span>
                  </div>
                </label>
              ))}
            </div>
          )}

          {tab === 'ownerVehicle' && (
            <div className="prediag-owner-form">
              <label className="form-item">
                <span className="form-label">客户姓名</span>
                <input className="form-input" value={ownerForm.customerName} onChange={event => updateOwnerForm('customerName', event.target.value)} />
              </label>
              <label className="form-item">
                <span className="form-label">手机号</span>
                <input className="form-input" value={ownerForm.phone} onChange={event => updateOwnerForm('phone', event.target.value)} />
              </label>
              <label className="form-item">
                <span className="form-label">车牌号</span>
                <input className="form-input" value={ownerForm.plate} onChange={event => updateOwnerForm('plate', event.target.value)} />
              </label>
              <label className="form-item">
                <span className="form-label">VIN</span>
                <input className="form-input" value={ownerForm.vin} onChange={event => updateOwnerForm('vin', event.target.value)} />
              </label>
              <label className="form-item full">
                <span className="form-label">车型</span>
                <input className="form-input" value={ownerForm.model} onChange={event => updateOwnerForm('model', event.target.value)} />
              </label>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>关闭</button>
          {tab === 'appointment' && (
            <button className="btn btn-primary" disabled={visibleAppointments.length === 0} onClick={onConfirmAppointment}>关联选中预约单</button>
          )}
          {(tab === 'campaign' || tab === 'suggestion') && (
            <button className="btn btn-primary" onClick={onConfirmVehicleInsights}>确认</button>
          )}
          {shouldShowOwnerConfirm && (
            <button className="btn btn-primary" onClick={handleConfirm}>
              确认变更
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function AppointmentDetailModal({
  appointment,
  onClose,
}: {
  appointment: AppointmentRecord
  onClose: () => void
}) {
  const sections = [
    {
      title: '基本信息',
      items: [
        ['预约单号', appointment.appointmentNo],
        ['预约来源', appointment.source],
        ['预约状态', appointment.status],
        ['预约到店时间', appointment.reserveAt],
        ['预约类型', appointment.serviceType],
        ['服务门店', '上海体验中心'],
      ],
    },
    {
      title: '客户信息',
      items: [
        ['车主姓名', appointment.ownerName],
        ['车主手机号', appointment.phone],
        ['联系人', appointment.ownerName],
        ['联系人手机号', appointment.phone],
        ['客户地址', '上海市浦东新区世纪大道 88 号'],
      ],
    },
    {
      title: '车辆信息',
      items: [
        ['车牌号', appointment.plate],
        ['VIN', appointment.vin],
        ['车型名称', appointment.model],
        ['总里程', appointment.vin === 'KW293B1283928372' ? '28,391 km' : '18,620 km'],
        ['车辆颜色', '星河银'],
        ['发动机号', appointment.vin === 'KW293B1283928372' ? 'ENG128392' : 'ENG345678'],
      ],
    },
    {
      title: '服务信息',
      items: [
        ['服务顾问', '李顾问'],
        ['服务方式', appointment.serviceType],
        ['是否取送车', '否'],
        ['问题描述', appointment.customerDesc],
      ],
    },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal prediag-appointment-detail-modal" data-annotation-id="prediag-appointment-detail" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          预约单详情
          <button className="btn btn-text" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body prediag-appointment-detail-body">
          {sections.map(section => (
            <section key={section.title} className="prediag-detail-modal-section">
              <div className="prediag-detail-modal-title">{section.title}</div>
              <div className="prediag-detail-modal-grid">
                {section.items.map(([label, value]) => (
                  <div key={`${section.title}-${label}`} className={label === '问题描述' || label === '客户地址' ? 'full' : ''}>
                    <span>{label}</span>
                    <strong>{value || '—'}</strong>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

function PreDiagnosisDetailProgress({ order }: { order: PreDiagnosisOrder }) {
  const currentStep = getPreDiagnosisDetailStepIndex(order)
  const timestamps: Partial<Record<(typeof PRE_DIAGNOSIS_DETAIL_STEPS)[number], string>> = {
    已创建: order.createdAt,
    车辆确认: order.createdAt,
    预约关联: order.appointmentNo ? order.createdAt : undefined,
    诊断检查: order.expectedFinishAt,
    待转工单: order.status === '待转工单' || order.status === '已完成' ? order.expectedFinishAt : undefined,
    已完成: order.status === '已完成' ? order.expectedFinishAt : undefined,
  }

  return (
    <div className="detail-progress">
      {PRE_DIAGNOSIS_DETAIL_STEPS.map((label, index) => {
        const state = index < currentStep ? 'done' : index === currentStep ? 'active' : 'pending'
        const time = timestamps[label]
        const timeLabel = state === 'done' ? '完成于' : state === 'active' ? '进入于' : ''
        return (
          <div key={label} className={`detail-progress-step is-${state}`}>
            <div className="detail-progress-node-wrap">
              <div className="detail-progress-node">
                {state === 'done' ? <Check size={16} strokeWidth={2.6} /> : state === 'active' ? <Clock3 size={16} strokeWidth={2.2} /> : null}
              </div>
              {index < PRE_DIAGNOSIS_DETAIL_STEPS.length - 1 && <div className="detail-progress-line" />}
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

function CreatePage({ onSubmitSuccess }: { onSubmitSuccess: (order: PreDiagnosisOrder) => void }) {
  const [plate, setPlate] = useState('沪A·88888')
  const [vinQuery, setVinQuery] = useState('LFV2A21K0N3456789')
  const [vehicleInfo, setVehicleInfo] = useState<VehicleRecord | null>(vehicleRecords[0])
  const [showVehicleLookup, setShowVehicleLookup] = useState(false)
  const [insightModal, setInsightModal] = useState<VehicleInsightModalKey | null>(null)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('appointment-1')
  const [linkedAppointment, setLinkedAppointment] = useState<AppointmentRecord | null>(appointmentRecords[0])
  const [serviceActivities, setServiceActivities] = useState(serviceActivityRecords)
  const [qualityImprovements, setQualityImprovements] = useState(qualityImprovementRecords)
  const [repairSuggestions, setRepairSuggestions] = useState(repairSuggestionRecords)
  const [selectedServiceActivityIds, setSelectedServiceActivityIds] = useState(serviceActivityRecords.map(record => record.id))
  const [selectedQualityImprovementIds, setSelectedQualityImprovementIds] = useState(qualityImprovementRecords.map(record => record.id))
  const [selectedRepairSuggestionIds, setSelectedRepairSuggestionIds] = useState(repairSuggestionRecords.map(record => record.id))
  const [customerDesc, setCustomerDesc] = useState(appointmentRecords[0].customerDesc)
  const [serviceType, setServiceType] = useState(appointmentRecords[0].serviceType)
  const [symptom, setSymptom] = useState('车机屏幕黑屏')
  const [urgency, setUrgency] = useState('高')
  const [checkResult, setCheckResult] = useState('读取到显示服务异常重启日志，当前软件版本低于推荐版本，建议转维修工单继续处理。')
  const [generalInspectionAbnormal, setGeneralInspectionAbnormal] = useState<'是' | '否'>('是')
  const [inspectionSelections, setInspectionSelections] = useState<Record<InspectionGroupKey, InspectionFaultSelection>>({
    reception: { level1: '', level2: '', symptom: '', attachments: inspectionAttachmentSeed.reception },
    cabin: { level1: '', level2: '', symptom: '', attachments: inspectionAttachmentSeed.cabin },
  })
  const [deepDiagnosisEvidence, setDeepDiagnosisEvidence] = useState(deepDiagnosisEvidenceSeed)
  const [photoUploadFeedback, setPhotoUploadFeedback] = useState('')
  const [showGeneralCheckTip, setShowGeneralCheckTip] = useState(false)
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)

  const matchedAppointments = getAppointmentsForVehicle(vehicleInfo)
  const pendingServiceActivities = serviceActivities.filter(record => !record.added)
  const pendingQualityImprovements = qualityImprovements.filter(record => !record.added)
  const pendingRepairSuggestions = repairSuggestions.filter(record => !record.added)
  const campaignQualityCount = pendingServiceActivities.length + pendingQualityImprovements.length
  const appointmentState: AppointmentLinkState = linkedAppointment ? '已关联' : vehicleInfo ? (matchedAppointments.length ? '待关联' : '未命中') : '未查询'
  const completedInspectionSelections = generalInspectionGroups
    .map(group => inspectionSelections[group.key])
    .filter(selection => selection.level1 && selection.level2 && selection.symptom)
  const primaryInspectionSelection = completedInspectionSelections[0] ?? inspectionSelections.reception
  const faultLevel1 = primaryInspectionSelection.level1
  const faultLevel2 = primaryInspectionSelection.level2
  const faultSymptom = primaryInspectionSelection.symptom
  const allInspectionAttachments = generalInspectionGroups.flatMap(group => inspectionSelections[group.key].attachments)
  const matchedGuideSteps = getDiagnosisGuideSteps(faultLevel1, faultLevel2, faultSymptom)
  const hasFaultSelection = Boolean(faultLevel1 && faultLevel2 && faultSymptom)

  const getFaultLevel2Options = (level1: string) => faultCategoryOptions.find(item => item.name === level1)?.subCategories ?? []
  const getFaultSymptomOptions = (level1: string, level2: string) => getFaultLevel2Options(level1).find(item => item.name === level2)?.symptoms ?? []
  const latestHistory = prediagVehicleHistoryRecords[0]
  const warrantyExpireAt = vehicleInfo?.id === 'vehicle-2' ? '2028/11/12' : vehicleInfo?.id === 'vehicle-3' ? '2028/06/20' : '2029/05/30'
  const currentPlate = plate || vehicleInfo?.plate || '待补充车牌'
  const currentVin = vinQuery || vehicleInfo?.vin || '待补充 VIN'
  const currentModel = linkedAppointment?.model || vehicleInfo?.model || '待补充车型'
  const currentMileage = vehicleInfo?.mileage && vehicleInfo.mileage !== '—' ? `${vehicleInfo.mileage} km` : '—'

  const openVehicleInsight = (tab: VehicleInsightModalKey) => {
    if (tab === 'campaign') {
      setSelectedServiceActivityIds(pendingServiceActivities.map(record => record.id))
      setSelectedQualityImprovementIds(pendingQualityImprovements.map(record => record.id))
    }
    if (tab === 'suggestion') {
      setSelectedRepairSuggestionIds(pendingRepairSuggestions.map(record => record.id))
    }
    setInsightModal(tab)
  }

  const updateInspectionSelection = (groupKey: InspectionGroupKey, patch: Partial<InspectionFaultSelection>) => {
    setInspectionSelections(current => ({
      ...current,
      [groupKey]: {
        ...current[groupKey],
        ...patch,
      },
    }))
  }

  const handleInspectionLevel1Change = (groupKey: InspectionGroupKey, level1: string) => {
    updateInspectionSelection(groupKey, { level1, level2: '', symptom: '' })
  }

  const handleInspectionLevel2Change = (groupKey: InspectionGroupKey, level2: string) => {
    updateInspectionSelection(groupKey, { level2, symptom: '' })
  }

  const handleInspectionSymptomChange = (groupKey: InspectionGroupKey, nextSymptom: string) => {
    updateInspectionSelection(groupKey, { symptom: nextSymptom })
    if (nextSymptom) setSymptom(nextSymptom)
  }

  const handleInspectionAttachmentUpload = (groupKey: InspectionGroupKey) => {
    const groupLabel = groupKey === 'reception' ? '接待区补充附件' : '车内低压上电补充附件'
    setInspectionSelections(current => {
      const nextFile = `${groupLabel}${current[groupKey].attachments.length + 1}.jpeg`
      return {
        ...current,
        [groupKey]: {
          ...current[groupKey],
          attachments: [...current[groupKey].attachments, nextFile],
        },
      }
    })
  }

  const handleDeepPhotoUpload = () => {
    setDeepDiagnosisEvidence(current => {
      const nextFile = `技师补充诊断照片${current.length + 1}.jpeg`
      setPhotoUploadFeedback(`已上传 ${nextFile}`)
      return [...current, nextFile]
    })
  }

  const renderInspectionFaultPanel = (group: GeneralInspectionGroup) => {
    const selection = inspectionSelections[group.key]
    const level2Options = getFaultLevel2Options(selection.level1)
    const symptomOptions = getFaultSymptomOptions(selection.level1, selection.level2)

    return (
      <div className="prediag-inspection-fault-panel" key={`${group.key}-fault-panel`}>
        <div className="prediag-inspection-fault-head">
          <strong>{group.title}异常分类</strong>
          <span>{group.scene}</span>
        </div>
        <div className="prediag-fault-tag-panel">
          <label className="form-item">
            <span className="form-label">一级分类</span>
            <select className="form-select" value={selection.level1} onChange={event => handleInspectionLevel1Change(group.key, event.target.value)}>
              <option value="">请选择一级分类</option>
              {faultCategoryOptions.map(option => <option key={option.name} value={option.name}>{option.name}</option>)}
            </select>
          </label>
          <label className="form-item">
            <span className="form-label">二级分类</span>
            <select className="form-select" value={selection.level2} disabled={!selection.level1} onChange={event => handleInspectionLevel2Change(group.key, event.target.value)}>
              <option value="">请选择二级分类</option>
              {level2Options.map(option => <option key={option.name} value={option.name}>{option.name}</option>)}
            </select>
          </label>
          <label className="form-item">
            <span className="form-label">故障现象</span>
            <select className="form-select" value={selection.symptom} disabled={!selection.level2} onChange={event => handleInspectionSymptomChange(group.key, event.target.value)}>
              <option value="">请选择故障现象</option>
              {symptomOptions.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="prediag-attachment-box">
            <div>
              <strong>附件上传</strong>
              <span>支持 jpeg / jpg / png / pdf，单个文件不超过 50M</span>
            </div>
            <button className="btn btn-default btn-sm" onClick={() => handleInspectionAttachmentUpload(group.key)}>上传附件</button>
          </div>
          <div className="prediag-attachment-list">
            {selection.attachments.map(file => <span key={file}>{file}</span>)}
          </div>
        </div>
      </div>
    )
  }

  const handleSelectVehicle = (vehicle: VehicleRecord) => {
    const matches = getAppointmentsForVehicle(vehicle)
    setVehicleInfo(vehicle)
    setPlate(vehicle.plate === '—' ? '' : vehicle.plate)
    setVinQuery(vehicle.vin)
    setLinkedAppointment(null)
    setSelectedAppointmentId(matches[0]?.id ?? '')
    setShowVehicleLookup(false)
    if (matches.length > 0) {
      openVehicleInsight('appointment')
    }
  }

  const handlePlateSearch = () => {
    const found = vehicleRecords.find(record => record.plate === plate || record.vin === vinQuery) ?? null
    if (found) handleSelectVehicle(found)
  }

  const handleConfirmAppointment = () => {
    const selected = appointmentRecords.find(item => item.id === selectedAppointmentId)
    if (!selected) return
    const matchedVehicle = vehicleRecords.find(record => record.vin === selected.vin) ?? vehicleInfo ?? vehicleRecords[0]
    setLinkedAppointment(selected)
    setVehicleInfo({
      ...matchedVehicle,
      plate: selected.plate,
      vin: selected.vin,
      customerName: selected.ownerName,
      phone: selected.phone,
      model: selected.model,
    })
    setCustomerDesc(selected.customerDesc)
    setServiceType(serviceTypeOptions.includes(selected.serviceType) ? selected.serviceType : '自驾到店')
    setPlate(selected.plate)
    setVinQuery(selected.vin)
    setInsightModal(null)
  }

  const toggleServiceActivity = (id: number) => {
    setSelectedServiceActivityIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  const toggleQualityImprovement = (id: number) => {
    setSelectedQualityImprovementIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  const toggleRepairSuggestion = (id: number) => {
    setSelectedRepairSuggestionIds(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  }

  const handleConfirmVehicleInsights = () => {
    if (insightModal === 'campaign') {
      setServiceActivities(current => current.map(record => (
        selectedServiceActivityIds.includes(record.id) ? { ...record, added: true, status: '已确认' } : record
      )))
      setQualityImprovements(current => current.map(record => (
        selectedQualityImprovementIds.includes(record.id) ? { ...record, added: true, status: '已确认' } : record
      )))
    }

    if (insightModal === 'suggestion') {
      const selectedTitles = repairSuggestions
        .filter(record => selectedRepairSuggestionIds.includes(record.id) && !record.added)
        .map(record => record.title)
      setRepairSuggestions(current => current.map(record => (
        selectedRepairSuggestionIds.includes(record.id) ? { ...record, added: true, status: '已转入预诊' } : record
      )))
      if (selectedTitles.length > 0) {
        setCustomerDesc(current => current.includes('维修建议：') ? current : `${current}\n维修建议：${selectedTitles.join('、')}`)
      }
    }

    setInsightModal(null)
  }

  const handleApplyOwnerVehicle = (patch: Partial<Pick<VehicleRecord, 'customerName' | 'phone' | 'plate' | 'vin' | 'model'>>) => {
    setVehicleInfo(current => {
      const base = current ?? vehicleRecords[0]
      return {
        ...base,
        ...patch,
      }
    })
    if (patch.plate !== undefined) setPlate(patch.plate)
    if (patch.vin !== undefined) setVinQuery(patch.vin)
    setInsightModal(null)
  }

  const handleApplyHistoryRecord = (record: (typeof prediagVehicleHistoryRecords)[number]) => {
    setCustomerDesc(`参考历史委托书 ${record.entrustNo}：${record.symptom}`)
    setInsightModal(null)
  }

  const createOrder = (status: PreDiagnosisStatus) => {
    const vehicle = vehicleInfo ?? vehicleRecords[0]
    const nextOrder: PreDiagnosisOrder = {
      id: `PD-20260527-${Math.floor(1000 + Math.random() * 8999)}`,
      status,
      plate: plate || vehicle.plate,
      vin: vinQuery || vehicle.vin,
      customerName: linkedAppointment?.ownerName || vehicle.customerName || '待补充客户',
      customerPhone: linkedAppointment?.phone || vehicle.phone || '—',
      model: linkedAppointment?.model || vehicle.model || '待补充车型',
      advisor: '李顾问',
      appointmentNo: linkedAppointment?.appointmentNo,
      appointmentState,
      problemCategory: faultLevel1 && faultLevel2 ? `${faultLevel1} / ${faultLevel2}` : '待选择分类',
      symptom: faultSymptom || symptom,
      urgency,
      source: linkedAppointment ? '预约单转入' : '现场接车',
      serviceType,
      mileage: vehicle.mileage === '—' ? '待补充' : vehicle.mileage,
      customerDesc,
      createdAt: '2026/05/27 19:58',
      expectedFinishAt: '2026/05/27 21:00',
      diagnosisProcess: diagnosisProcessSeed,
      technicianRecords: technicianRecordsSeed,
      finalDiagnosis: checkResult,
      generalInspectionAbnormal,
      faultLevel1: generalInspectionAbnormal === '是' ? faultLevel1 : undefined,
      faultLevel2: generalInspectionAbnormal === '是' ? faultLevel2 : undefined,
      attachments: generalInspectionAbnormal === '是' ? allInspectionAttachments : [],
      workOrderFaultDesc: generalInspectionAbnormal === '是'
        ? `${faultSymptom || symptom}；通用技术检查异常，已完成${faultLevel1 || '待选择一级分类'} / ${faultLevel2 || '待选择二级分类'}深度诊断，建议带入维修工单故障现象。`
        : '通用技术检查未发现异常，暂不生成维修工单故障现象。',
    }
    onSubmitSuccess(nextOrder)
  }

  return (
    <>
      <div className="page-breadcrumb">售后服务 / 预诊单管理 / 创建预诊单</div>

      <section className="card card-odin card-vehicle-info">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>车主车辆信息</div>
        </div>
        <div className="vehicle-query-bar">
          <input className="form-input" style={{ width: 160 }} placeholder="输入车牌号" value={plate} onChange={event => setPlate(event.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={handlePlateSearch}>查询</button>
          <span className="vehicle-query-separator">或输入 VIN 查询</span>
          <input className="form-input" style={{ width: 220 }} placeholder="输入 VIN（17位）" value={vinQuery} onChange={event => setVinQuery(event.target.value.toUpperCase())} />
          <button className="btn btn-default btn-sm" onClick={() => setShowVehicleLookup(true)}>按 VIN 查询车辆</button>
        </div>

        <div className="vehicle-overview-panel" data-annotation-id="prediag-vehicle-overview">
          <div className="vehicle-overview-main">
            <div className="vehicle-overview-kicker">创建预诊单</div>
            <div className="vehicle-overview-title">
              <span>{currentPlate}</span>
              <span className="vehicle-overview-divider">/</span>
              <span className="prediag-vin-link">{currentVin}</span>
            </div>
            <div className="vehicle-overview-subtitle">{currentModel}</div>
            <div className="vehicle-overview-meta">
              <span>保修到期日 {warrantyExpireAt}</span>
              <span>最近进厂 {latestHistory.admissionAt.split(' ')[0]}</span>
              <span>最近里程 {currentMileage}</span>
              {linkedAppointment && (
                <button className="prediag-meta-link" data-annotation-id="prediag-linked-appointment-chip" onClick={() => setShowAppointmentDetail(true)}>
                  预约单 {linkedAppointment.appointmentNo}
                </button>
              )}
            </div>
          </div>
          <div className="vehicle-overview-actions">
            <button className="btn btn-default btn-sm" data-annotation-id="prediag-appointment-entry" onClick={() => openVehicleInsight('appointment')}>
              关联预约单{matchedAppointments.length > 0 ? `（${matchedAppointments.length}）` : ''}
            </button>
            <button className="btn btn-default btn-sm" onClick={() => openVehicleInsight('history')}>委托书履历</button>
            <button className="btn btn-default btn-sm" onClick={() => openVehicleInsight('rights')}>车辆权益</button>
            <button className="btn btn-default btn-sm" onClick={() => openVehicleInsight('campaign')}>
              服务活动 / 品质改善{campaignQualityCount > 0 ? `（${campaignQualityCount}）` : ''}
            </button>
            <button className="btn btn-default btn-sm" onClick={() => openVehicleInsight('suggestion')}>
              维修建议{pendingRepairSuggestions.length > 0 ? `（${pendingRepairSuggestions.length}）` : ''}
            </button>
            <button className="btn btn-default btn-sm" onClick={() => openVehicleInsight('ownerVehicle')}>车主车辆信息变更</button>
          </div>
        </div>
      </section>

      <div className="prediag-create-stack">
        <section className="card card-odin" data-annotation-id="prediag-basic-info">
          <div className="card-title">预诊基础信息</div>
          <div className="prediag-form-grid">
            <label className="form-item"><span className="form-label">服务顾问</span><input className="form-input" value="李顾问" readOnly /></label>
            <label className="form-item"><span className="form-label">服务方式</span><select className="form-select" value={serviceType} onChange={event => setServiceType(event.target.value)}>{serviceTypeOptions.map(option => <option key={option}>{option}</option>)}</select></label>
            <label className="form-item"><span className="form-label">进厂里程</span><input className="form-input" defaultValue={vehicleInfo?.mileage === '—' ? '' : vehicleInfo?.mileage} /></label>
            <label className="form-item"><span className="form-label">预计完成</span><input className="form-input" defaultValue="2026/05/27 21:00" /></label>
          </div>
          {!linkedAppointment && (
            <div className="prediag-empty-note">未关联预约单，可继续手工补录预诊基础信息。</div>
          )}
        </section>

        <section className="card card-odin" data-annotation-id="prediag-customer-problem">
          <div className="card-title">客户问题</div>
          <div className="prediag-form-grid single">
            <label className="form-item"><span className="form-label">问题分类</span><select className="form-select" defaultValue="智能座舱/车联网 / 屏幕/显示"><option>智能座舱/车联网 / 屏幕/显示</option><option>低压电气 / 12V电源网络</option><option>车身附件 / 门把手/灯光</option><option>空调 / 鼓风机/制冷制热</option></select></label>
            <label className="form-item"><span className="form-label">故障现象</span><select className="form-select" value={symptom} onChange={event => setSymptom(event.target.value)}>{customerSymptomOptions.map(option => <option key={option}>{option}</option>)}</select></label>
            <label className="form-item"><span className="form-label">紧急程度</span><select className="form-select" value={urgency} onChange={event => setUrgency(event.target.value)}><option>高</option><option>中</option><option>低</option></select></label>
            <label className="form-item full"><span className="form-label">客户问题描述</span><textarea className="form-textarea" value={customerDesc} onChange={event => setCustomerDesc(event.target.value)} /></label>
          </div>
        </section>
      </div>

      <section className="card card-odin" data-annotation-id="prediag-general-diagnosis">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>通用技术检查与深度诊断</div>
        </div>
        <div className="prediag-general-check-card" data-annotation-id="prediag-general-check-card">
          <div className="prediag-general-check-head">
            <div>
              <div className="prediag-check-title-row">
                <strong>通用技术检查项目</strong>
                <button
                  type="button"
                  className={`prediag-info-icon-button${showGeneralCheckTip ? ' active' : ''}`}
                  aria-label="查看通用技术检查说明"
                  onClick={() => setShowGeneralCheckTip(current => !current)}
                >
                  <AlertCircle size={14} />
                </button>
                {showGeneralCheckTip && (
                  <div className="prediag-info-popover">先完成通用技术检查，再判断是否进入故障分类和深度诊断。</div>
                )}
              </div>
            </div>
            <div className="prediag-radio-group">
              <span>是否异常</span>
              {(['是', '否'] as const).map(option => (
                <label key={option} className={`prediag-radio-pill ${generalInspectionAbnormal === option ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="generalInspectionAbnormal"
                    checked={generalInspectionAbnormal === option}
                    onChange={() => setGeneralInspectionAbnormal(option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div className="prediag-general-check-groups">
            {generalInspectionGroups.map(group => (
              <div key={group.title} className="prediag-general-check-group">
                <div className="prediag-general-check-group-head">
                  <strong>{group.title}</strong>
                  <span>{group.scene}</span>
                </div>
                <div className="prediag-general-check-grid">
                  {group.items.map((item, index) => (
                    <div key={`${group.title}-${item.title}`} className="prediag-general-check-item">
                      <span>{index + 1}</span>
                      <div>
                        <strong>{item.title}</strong>
                        {item.details.map(detail => <p key={detail}>{detail}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {generalInspectionAbnormal === '是' ? (
          <>
            <div className="prediag-inspection-fault-stack">
              {generalInspectionGroups.map(group => renderInspectionFaultPanel(group))}
            </div>

            {hasFaultSelection ? (
              <div className="prediag-guide-layout" data-annotation-id="prediag-guide-layout">
                <div>
                  <div className="prediag-subsection-title">深度诊断步骤指导</div>
                  <div className="prediag-guide-list">
                    {matchedGuideSteps.map((step, index) => (
                      <div key={step.id} className="prediag-guide-card">
                        <div className="prediag-guide-index">{index + 1}</div>
                        <div>
                          <div className="prediag-guide-title">{step.title}</div>
                          <div className="prediag-guide-station">{step.station}</div>
                          <p>{step.operation}</p>
                          <div className="prediag-keypoints">
                            {step.keyPoints.map(point => <span key={point}>{point}</span>)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="prediag-check-panel" data-annotation-id="prediag-check-panel">
                  <div className="prediag-check-title">最终诊断结论</div>
                  <div className="prediag-tech-upload-box">
                    <div>
                      <strong>深度诊断照片</strong>
                      <span>技师执行深度诊断时上传现场照片、测量照片或诊断报告</span>
                    </div>
                    <button className="btn btn-default btn-sm" onClick={handleDeepPhotoUpload}>上传照片</button>
                  </div>
                  <div className="prediag-attachment-list compact">
                    {deepDiagnosisEvidence.map(file => <span key={file}>{file}</span>)}
                  </div>
                  {photoUploadFeedback && <div className="prediag-upload-feedback">{photoUploadFeedback}</div>}
                  <textarea className="form-textarea" value={checkResult} onChange={event => setCheckResult(event.target.value)} />
                  <div className="prediag-check-meta">
                    <span><ShieldCheck size={14} /> 已完成 {matchedGuideSteps.length} / {matchedGuideSteps.length} 项步骤指导</span>
                    <span><Clock3 size={14} /> 预计 18 分钟</span>
                  </div>
                  <div className="prediag-workorder-preview">
                    <strong>转工单故障现象</strong>
                    <p>{`${faultSymptom}；通用技术检查异常，已完成${faultLevel1} / ${faultLevel2}深度诊断。`}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prediag-guide-empty">请选择一级分类、二级分类和故障现象后，系统再展示对应深度诊断步骤指导。</div>
            )}
          </>
        ) : (
          <div className="prediag-no-abnormal-card">
            <ShieldCheck size={16} />
            <span>通用技术检查未发现异常，当前无需选择故障分类和深度诊断步骤指导。</span>
          </div>
        )}

        <div className="prediag-diagnosis-split">
          <div className="prediag-process-panel" data-annotation-id="prediag-process-panel">
            <div className="prediag-panel-header">
              <div>
                <strong>诊断过程记录</strong>
                <span>沉淀通用检查、异常分类、深度诊断和证据材料</span>
              </div>
              <button className="btn btn-default btn-sm">新增过程</button>
            </div>
            <div className="prediag-process-list">
              {diagnosisProcessSeed.map(record => (
                <div key={record.id} className="prediag-process-item">
                  <div className="prediag-process-time">{record.time}</div>
                  <div className="prediag-process-body">
                    <div className="prediag-process-title">
                      <strong>{record.step}</strong>
                      <span className={`tag ${record.status === '已完成' ? 'tag-done' : 'tag-working'}`}>{record.status}</span>
                    </div>
                    <div className="prediag-process-operator">执行人：{record.operator}</div>
                    <p>{record.action}</p>
                    <div className="prediag-process-finding">发现：{record.finding}</div>
                    <div className="prediag-process-evidence">证据：{record.evidence}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="prediag-tech-record-panel" data-annotation-id="prediag-tech-record-panel">
            <div className="prediag-panel-header">
              <div>
                <strong>技师记录</strong>
                <span>沉淀技师过程说明、深度诊断照片和最终判断</span>
              </div>
              <button className="btn btn-default btn-sm">新增记录</button>
            </div>
            <div className="prediag-tech-record-list">
              {technicianRecordsSeed.map(record => (
                <div key={record.id} className="prediag-tech-record-card">
                  <div className="prediag-tech-record-head">
                    <div>
                      <strong>{record.technician}</strong>
                      <span>{record.role}</span>
                    </div>
                    <span className="tag tag-pending">{record.recordType}</span>
                  </div>
                  <p>{record.content}</p>
                  <div className="prediag-tech-conclusion">结论：{record.conclusion}</div>
                  <div className="prediag-tech-time">{record.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky-action-bar">
        <button className="btn btn-default" onClick={() => createOrder('待预诊')}>保存</button>
        <button className="btn btn-primary" onClick={() => createOrder('待转工单')}>提交预诊</button>
      </div>

      <VehicleLookupModal open={showVehicleLookup} onClose={() => setShowVehicleLookup(false)} onConfirm={handleSelectVehicle} />
      {insightModal && (
        <VehicleInsightModal
          tab={insightModal}
          vehicle={vehicleInfo}
          appointments={matchedAppointments}
          selectedAppointmentId={selectedAppointmentId}
          onSelectAppointment={setSelectedAppointmentId}
          onConfirmAppointment={handleConfirmAppointment}
          serviceActivities={serviceActivities}
          qualityImprovements={qualityImprovements}
          repairSuggestions={repairSuggestions}
          selectedServiceActivityIds={selectedServiceActivityIds}
          selectedQualityImprovementIds={selectedQualityImprovementIds}
          selectedRepairSuggestionIds={selectedRepairSuggestionIds}
          onToggleServiceActivity={toggleServiceActivity}
          onToggleQualityImprovement={toggleQualityImprovement}
          onToggleRepairSuggestion={toggleRepairSuggestion}
          onConfirmVehicleInsights={handleConfirmVehicleInsights}
          onClose={() => setInsightModal(null)}
          onApplyOwnerVehicle={handleApplyOwnerVehicle}
          onApplyHistoryRecord={handleApplyHistoryRecord}
        />
      )}
      {showAppointmentDetail && linkedAppointment && (
        <AppointmentDetailModal
          appointment={linkedAppointment}
          onClose={() => setShowAppointmentDetail(false)}
        />
      )}
    </>
  )
}

function AnnotationLayer({ currentPageId }: { currentPageId: PageKey }) {
  const viewerOptions = useMemo<AnnotationViewerOptions>(() => ({
    currentPageId,
    toolbarEdge: 'right',
    showToolbar: true,
    showThemeToggle: true,
    showColorFilter: true,
    emptyWhenNoData: false,
  }), [currentPageId])

  return (
    <AnnotationViewer
      source={annotationSourceDocument as unknown as AnnotationSourceDocument}
      options={viewerOptions}
    />
  )
}

export default function Component() {
  const [activePage, setActivePage] = useState<PageKey>('list')
  const [orders, setOrders] = useState<PreDiagnosisOrder[]>(seedOrders)
  const [selectedOrderId, setSelectedOrderId] = useState(seedOrders[0].id)

  const selectedOrder = orders.find(order => order.id === selectedOrderId) ?? orders[0]

  const handleCreateSuccess = (order: PreDiagnosisOrder) => {
    setOrders(current => [order, ...current])
    setSelectedOrderId(order.id)
    setActivePage('detail')
  }

  return (
    <>
      <AppShell active={activePage} onNavigate={setActivePage}>
        {activePage === 'list' && (
          <ListPage
            orders={orders}
            onCreate={() => setActivePage('create')}
            onDetail={id => {
              setSelectedOrderId(id)
              setActivePage('detail')
            }}
          />
        )}
        {activePage === 'create' && <CreatePage onSubmitSuccess={handleCreateSuccess} />}
        {activePage === 'detail' && <DetailPage order={selectedOrder} />}
      </AppShell>
      <AnnotationLayer currentPageId={activePage} />
    </>
  )
}

function DetailPage({ order }: { order: PreDiagnosisOrder }) {
  const diagnosisProcess = order.diagnosisProcess ?? diagnosisProcessSeed
  const technicianRecords = order.technicianRecords ?? technicianRecordsSeed
  const finalDiagnosis = order.finalDiagnosis ?? '读取到显示服务异常重启日志，建议转维修工单继续处理。'
  const generalInspectionAbnormal = order.generalInspectionAbnormal ?? '是'
  const faultLevel1 = order.faultLevel1 ?? '智能座舱/车联网'
  const faultLevel2 = order.faultLevel2 ?? '屏幕/显示'
  const attachments = order.attachments ?? attachmentSeed
  const detailGuideSteps = getDiagnosisGuideSteps(faultLevel1, faultLevel2, order.symptom)
  const workOrderFaultDesc = order.workOrderFaultDesc ?? `${order.symptom}；通用技术检查异常，已完成${faultLevel1} / ${faultLevel2}深度诊断。`

  return (
    <>
      <div className="prediag-detail-hero" data-annotation-id="prediag-detail-hero">
        <div>
          <div className="prediag-page-eyebrow">Pre-diagnosis Detail</div>
          <h1>{order.id}</h1>
          <div className="prediag-detail-meta">
            <StatusTag status={order.status} />
            <span>{order.plate}</span>
            <span>{order.vin}</span>
            <span>{order.customerName} / {maskPhone(order.customerPhone)}</span>
          </div>
        </div>
        <div className="prediag-detail-actions">
          <button className="btn btn-default"><History size={14} /> 处理记录</button>
          <button className="btn btn-primary"><Wrench size={14} /> 转维修工单</button>
        </div>
      </div>

      <section className="card card-odin">
        <PreDiagnosisDetailProgress order={order} />
      </section>

      <div className="prediag-detail-grid">
        <section className="card card-odin">
          <div className="card-title">基础信息</div>
          <div className="prediag-info-grid">
            <div><span>客户姓名</span><strong>{order.customerName}</strong></div>
            <div><span>手机号</span><strong>{maskPhone(order.customerPhone)}</strong></div>
            <div><span>车牌号</span><strong>{order.plate}</strong></div>
            <div><span>VIN</span><strong>{order.vin}</strong></div>
            <div><span>车型</span><strong>{order.model}</strong></div>
            <div><span>进厂里程</span><strong>{order.mileage} km</strong></div>
            <div><span>服务方式</span><strong>{order.serviceType}</strong></div>
            <div><span>服务顾问</span><strong>{order.advisor}</strong></div>
          </div>
        </section>

        <section className="card card-odin">
          <div className="card-title">预约与来源</div>
          <div className="prediag-appointment-summary" data-annotation-id="prediag-detail-appointment-summary">
            <AppointmentStateTag state={order.appointmentState} />
            <strong>{order.appointmentNo || '未关联预约单'}</strong>
            <span>{order.source}</span>
            {order.workOrderNo ? <span>维修工单：{order.workOrderNo}</span> : <span>尚未转维修工单</span>}
          </div>
        </section>
      </div>

      <section className="card card-odin">
        <div className="card-title">客户问题、通用检查与深度诊断</div>
        <div className="prediag-problem-summary">
          <div><span>问题分类</span><strong>{order.problemCategory}</strong></div>
          <div><span>故障现象</span><strong>{order.symptom}</strong></div>
          <div><span>紧急程度</span><strong>{order.urgency}</strong></div>
          <div><span>客户描述</span><strong>{order.customerDesc}</strong></div>
          <div><span>通用技术检查</span><strong>{generalInspectionAbnormal === '是' ? '异常' : '无异常'}</strong></div>
          <div><span>一级分类</span><strong>{generalInspectionAbnormal === '是' ? faultLevel1 : '—'}</strong></div>
          <div><span>二级分类</span><strong>{generalInspectionAbnormal === '是' ? faultLevel2 : '—'}</strong></div>
          <div><span>附件</span><strong>{attachments.length} 个</strong></div>
        </div>
        <div className="prediag-detail-general-check">
          <div className="prediag-subsection-title">通用技术检查项目</div>
          <div className="prediag-general-check-groups">
            {generalInspectionGroups.map(group => (
              <div key={group.title} className="prediag-general-check-group">
                <div className="prediag-general-check-group-head">
                  <strong>{group.title}</strong>
                  <span>{group.scene}</span>
                </div>
                <div className="prediag-general-check-grid">
                  {group.items.map((item, index) => (
                    <div key={`${group.title}-${item.title}`} className="prediag-general-check-item">
                      <span>{index + 1}</span>
                      <div>
                        <strong>{item.title}</strong>
                        {item.details.map(detail => <p key={detail}>{detail}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {generalInspectionAbnormal === '是' && (
          <div className="prediag-detail-attachment-row">
            {attachments.map(file => <span key={file}>{file}</span>)}
          </div>
        )}
        <div className="prediag-detail-guide-list">
          {detailGuideSteps.map((step, index) => (
            <div key={step.id} className="prediag-detail-guide-row">
              <div className="prediag-guide-index">{index + 1}</div>
              <div>
                <strong>{step.title}</strong>
                <p>{step.operation}</p>
                <div className="prediag-detail-result">检查结果：{step.result}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>诊断过程</div>
          <span className="prediag-guide-source"><Clock3 size={14} /> 已记录 {diagnosisProcess.length} 个过程节点</span>
        </div>
        <div className="prediag-process-table-wrap">
          <table className="data-table prediag-process-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>阶段</th>
                <th>状态</th>
                <th>执行人</th>
                <th>执行动作</th>
                <th>发现问题</th>
                <th>证据材料</th>
              </tr>
            </thead>
            <tbody>
              {diagnosisProcess.map(record => (
                <tr key={record.id}>
                  <td className="prediag-strong-cell">{record.time}</td>
                  <td>{record.step}</td>
                  <td><span className={`tag ${record.status === '已完成' ? 'tag-done' : 'tag-working'}`}>{record.status}</span></td>
                  <td>{record.operator}</td>
                  <td><span className="prediag-wrap-cell">{record.action}</span></td>
                  <td><span className="prediag-wrap-cell">{record.finding}</span></td>
                  <td>{record.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-odin">
        <div className="section-header">
          <div className="card-title" style={{ marginBottom: 0 }}>技师记录</div>
          <span className="prediag-guide-source"><UserRound size={14} /> 技师过程记录 / 深度诊断照片 / 最终结论</span>
        </div>
        <div className="prediag-detail-tech-layout">
          <div className="prediag-tech-record-list">
            {technicianRecords.map(record => (
              <div key={record.id} className="prediag-tech-record-card">
                <div className="prediag-tech-record-head">
                  <div>
                    <strong>{record.technician}</strong>
                    <span>{record.role}</span>
                  </div>
                  <span className="tag tag-pending">{record.recordType}</span>
                </div>
                <p>{record.content}</p>
                <div className="prediag-tech-conclusion">结论：{record.conclusion}</div>
                <div className="prediag-tech-time">{record.time}</div>
              </div>
            ))}
          </div>
          <div className="prediag-final-diagnosis-card">
            <div className="prediag-check-title">最终诊断结论</div>
            <p>{finalDiagnosis}</p>
            <div className="prediag-workorder-preview">
              <strong>转工单故障现象</strong>
              <p>{workOrderFaultDesc}</p>
            </div>
            <div className="prediag-final-tags">
              <span className="tag tag-working">建议转工单</span>
              <span className="tag tag-done">证据完整</span>
              <span className="tag tag-warning">需软件升级确认</span>
            </div>
          </div>
        </div>
      </section>

      <section className="card card-odin">
        <div className="card-title">处理记录</div>
        <div className="prediag-timeline">
          {processLogs.map(log => (
            <div key={`${log.time}-${log.title}`} className="prediag-timeline-item">
              <div className="prediag-timeline-dot" />
              <div>
                <strong>{log.title}</strong>
                <p>{log.desc}</p>
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

