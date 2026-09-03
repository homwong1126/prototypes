/**
 * @name 政策管理编辑
 * @mode axure
 *
 * 大客户营销平台 - 政策管理编辑页面
 * 用于编辑和管理政策信息，包括政策基本信息和车型信息
 */
import React, { useRef, useState } from 'react'
import { ChevronDown, Plus, FileSpreadsheet, Trash2, X, Upload, Download, Calendar, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import './style.css'
import logoImg from './assets/logo.jpeg'
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ─── 类型定义 ────────────────────────────────────────────────────────────────────

interface VehicleModel {
  id: number
  brand: string
  level: string
  modelCode: string
  modelName: string
  yearCode: string
  yearName: string
  powertrainCode: string
  powertrainName: string
  versionCode: string
  versionName: string
  grossProfitLimit: string
  regionalTotalPermission: string
  linePermission: string
  storeOperationPermission: string
  groupPermission: string
}

interface PolicyBasicInfo {
  limitType: string
  year: string
  month: string
}

interface PolicyListItem {
  id: number
  limitType: string
  year: string
  month: string
  createTime: string
  status: string
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 1,
    brand: '奇瑞',
    level: '小蚂蚁',
    modelCode: 'QR124',
    modelName: '小蚂蚁',
    yearCode: '',
    yearName: '',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: '',
  },
  {
    id: 2,
    brand: '星途',
    level: '星纪元',
    modelCode: 'E03',
    modelName: '星纪元ES',
    yearCode: '2025N',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 3,
    brand: '星途',
    level: '星纪元',
    modelCode: 'E0Y',
    modelName: '星纪元ET',
    yearCode: '2025N',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 4,
    brand: '星途',
    level: '星途',
    modelCode: 'LYCDM',
    modelName: '揽月C-DM',
    yearCode: '2025N',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 5,
    brand: '奇瑞',
    level: '',
    modelCode: 'QR42',
    modelName: '全新艾瑞泽5',
    yearCode: 'ARZ5-2025',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 6,
    brand: '奇瑞',
    level: '车型',
    modelCode: 'QR97',
    modelName: '2024款艾瑞泽5-MT',
    yearCode: '',
    yearName: '',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 7,
    brand: '奇瑞',
    level: '年款',
    modelCode: 'QR123',
    modelName: '艾瑞泽8 PRO',
    yearCode: 'ARZ8PRO_2025年',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 8,
    brand: '奇瑞',
    level: '年款',
    modelCode: 'QR119',
    modelName: '风云A8L',
    yearCode: 'FYA-2025',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 9,
    brand: '奇瑞',
    level: '年款',
    modelCode: 'QR120',
    modelName: '风云A9L',
    yearCode: 'FYA-2025',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 10,
    brand: '奇瑞',
    level: '年款',
    modelCode: 'QR106',
    modelName: '风云T9',
    yearCode: 'FYT-2025',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
  {
    id: 11,
    brand: '奇瑞',
    level: '年款',
    modelCode: 'QR121',
    modelName: '风云T8',
    yearCode: 'FYT-2025',
    yearName: '2025款',
    powertrainCode: '',
    powertrainName: '',
    versionCode: '',
    versionName: '',
    grossProfitLimit: '',
    regionalTotalPermission: '',
    linePermission: '',
    storeOperationPermission: '',
    groupPermission: ''
  },
]

const INITIAL_POLICY_INFO: PolicyBasicInfo = {
  limitType: '常规车',
  year: '',
  month: '',
}

const LIMIT_TYPE_OPTIONS = ['常规车', '冰雹车', '超期车', '外采车', '公告到期车', '虚传车', '政策到期车', '其他'] as const
const TEMPLATE_DOWNLOAD_URL = 'file:///Users/hom/Downloads/下载专用文件夹/temp1/限价导入模板.xlsx'

const POLICY_LIST: PolicyListItem[] = [
  {
    id: 1,
    limitType: '常规车',
    year: '2026',
    month: '1',
    createTime: '2026-01-05 09:30:00',
    status: '已生效',
  },
  {
    id: 2,
    limitType: '冰雹车',
    year: '-',
    month: '-',
    createTime: '2026-06-10 14:20:00',
    status: '已生效',
  },
  {
    id: 3,
    limitType: '超期车',
    year: '-',
    month: '-',
    createTime: '2026-07-15 16:40:00',
    status: '已生效',
  },
  {
    id: 4,
    limitType: '外采车',
    year: '-',
    month: '-',
    createTime: '2026-07-18 10:15:00',
    status: '已生效',
  },
  {
    id: 5,
    limitType: '公告到期车',
    year: '-',
    month: '-',
    createTime: '2026-07-20 11:40:00',
    status: '已生效',
  },
]

// ─── 车型目录数据 ──────────────────────────────────────────────────────────────

interface VehicleCatalogItem {
  key: string
  brand: string
  level: string
  modelCode: string
  modelName: string
  yearCode: string
  yearName: string
  powertrainCode: string
  powertrainName: string
  versionCode: string
  versionName: string
}

const buildCatalogItem = (item: Omit<VehicleCatalogItem, 'key'>): VehicleCatalogItem => ({
  ...item,
  key: `${item.brand}|${item.level}|${item.modelCode}|${item.modelName}|${item.yearCode}|${item.yearName}|${item.powertrainCode}|${item.powertrainName}|${item.versionCode}|${item.versionName}`,
})

const VEHICLE_CATALOG: VehicleCatalogItem[] = [
  buildCatalogItem({ brand: '星途', level: '车型', modelCode: '004', modelName: '揽月', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '捷途', level: '车型', modelCode: '2025X70PLUS', modelName: '2025款X70PLUS冠军版', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '捷途', level: '车型', modelCode: '2025X70PLUS-1', modelName: '2025款X70PLUS', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '捷途', level: '车型', modelCode: '2025X90PLUS', modelName: '2025款X90PLUS', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '捷途', level: '车型', modelCode: '24KDSRYB', modelName: '24款大圣（燃油版）', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: 'CS2026', level: '车型', modelCode: 'cs2027', modelName: '测试车型2027', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: 'CS2026', level: '车型', modelCode: 'cscx2026', modelName: '测试车型2026', yearCode: '', yearName: '', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '星途', level: '车型', modelCode: 'E03', modelName: '星纪元ES', yearCode: '2025N', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '星途', level: '车型', modelCode: 'E0Y', modelName: '星纪元ET', yearCode: '2025N', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '星途', level: '车型', modelCode: 'LYCDM', modelName: '揽月C-DM', yearCode: '2025N', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '车型', modelCode: 'QR42', modelName: '全新艾瑞泽5', yearCode: 'ARZ5-2025', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '年款', modelCode: 'QR123', modelName: '艾瑞泽8 PRO', yearCode: 'ARZ8PRO_2025年', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '年款', modelCode: 'QR119', modelName: '风云A8L', yearCode: 'FYA-2025', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '年款', modelCode: 'QR120', modelName: '风云A9L', yearCode: 'FYA-2025', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '年款', modelCode: 'QR106', modelName: '风云T9', yearCode: 'FYT-2025', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '奇瑞', level: '年款', modelCode: 'QR121', modelName: '风云T8', yearCode: 'FYT-2025', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '捷途', level: '动总', modelCode: 'T2A-1.6T', modelName: '1.6TGDI-7DCT', yearCode: '', yearName: '', powertrainCode: 'PT16T', powertrainName: '1.6T发动机', versionCode: '', versionName: '' }),
  buildCatalogItem({ brand: '星途', level: '版型', modelCode: 'E03-版本A', modelName: '星纪元ES 四驱性能版', yearCode: '2025N', yearName: '2025款', powertrainCode: '', powertrainName: '', versionCode: 'V-A', versionName: '性能版' }),
]

const VEHICLE_CATALOG_TOTAL = 945
const CATALOG_BRAND_OPTIONS = ['星途', '捷途', '奇瑞', 'CS2026']
const CATALOG_LEVEL_OPTIONS = ['车型', '年款', '动总', '版型']

// ─── 组件 ───────────────────────────────────────────────────────────────────────

const Component = function PolicyManagementEdit() {
  const [currentPage, setCurrentPage] = useState<'list' | 'add' | 'rules'>('list')
  const [activeMenu, setActiveMenu] = useState('list')
  const [policyInfo, setPolicyInfo] = useState<PolicyBasicInfo>(INITIAL_POLICY_INFO)
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>(VEHICLE_MODELS)
  const [filterLimitType, setFilterLimitType] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showVehicleSelectModal, setShowVehicleSelectModal] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState({
    brand: '',
    level: '',
    modelCode: '',
    modelName: '',
    yearCode: '',
    yearName: '',
    powertrainCode: '',
  })
  const [selectedVehicleKeys, setSelectedVehicleKeys] = useState<string[]>([])
  const [importPage, setImportPage] = useState(1)
  const [importPageSize, setImportPageSize] = useState(20)
  const [importStartTime, setImportStartTime] = useState('')
  const [importEndTime, setImportEndTime] = useState('')
  const [importFileName, setImportFileName] = useState('')
  const importFileInputRef = useRef<HTMLInputElement>(null)
  const [importMessage, setImportMessage] = useState('')
  const [importRecords, setImportRecords] = useState([
    {
      id: 1,
      recordId: '2091753051236438018',
      importTime: '2026/08/24 13:02:45',
      operator: 'fanxin',
      fileName: '限价导入模板_1787547954405.xlsx',
      total: 8,
      sourceFile: '源文件',
      hasLog: false,
    },
    {
      id: 2,
      recordId: '2091693906315542530',
      importTime: '2026/08/24 09:07:44',
      operator: 'fanxin',
      fileName: '限价导入模板_1787533859055.xlsx',
      total: 0,
      sourceFile: '源文件',
      hasLog: true,
    },
    {
      id: 3,
      recordId: '2091693685246361601',
      importTime: '2026/08/24 09:06:51',
      operator: 'fanxin',
      fileName: '限价导入模板_1787533806590.xlsx',
      total: 0,
      sourceFile: '源文件',
      hasLog: true,
    },
    {
      id: 4,
      recordId: '2091693393398300674',
      importTime: '2026/08/24 09:05:41',
      operator: 'fanxin',
      fileName: '限价导入模板_1787533736712.xlsx',
      total: 0,
      sourceFile: '源文件',
      hasLog: true,
    },
    {
      id: 5,
      recordId: '2091692838915506177',
      importTime: '2026/08/24 09:03:29',
      operator: 'fanxin',
      fileName: '限价导入模板_1787533600622.xlsx',
      total: 0,
      sourceFile: '源文件',
      hasLog: true,
    },
    {
      id: 6,
      recordId: '2090674704217636865',
      importTime: '2026/08/21 13:37:47',
      operator: 'admin',
      fileName: '限价管理导入模板_1787290666078.xlsx',
      total: 1,
      sourceFile: '源文件',
      hasLog: false,
    },
  ])
  const isRegularLimitType = policyInfo.limitType === '常规车'

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu)
    if (menu === 'list') {
      setCurrentPage('list')
    } else if (menu === 'rules') {
      setCurrentPage('rules')
    }
  }

  const handleEditPolicy = (policy: PolicyListItem) => {
    setPolicyInfo({
      limitType: policy.limitType,
      year: policy.year === '-' ? '' : policy.year,
      month: policy.month === '-' ? '' : policy.month,
    })
    setCurrentPage('rules')
    setActiveMenu('rules')
  }

  const handleAddPolicy = () => {
    setPolicyInfo({ ...INITIAL_POLICY_INFO })
    setVehicleModels([])
    setCurrentPage('add')
    setActiveMenu('rules')
  }

  const handleSavePolicy = () => {
    if (!policyInfo.limitType || (isRegularLimitType && (!policyInfo.year || !policyInfo.month))) {
      alert('请填写限价类型、年份和月份')
      return
    }

    if (vehicleModels.length === 0) {
      alert('请至少新增一条限价规则')
      return
    }

    if (isDuplicateVersion(vehicleModels)) {
      alert('版型数据重复，不可重复导入')
      return
    }

    const requiredFields: Array<keyof VehicleModel> = [
      'grossProfitLimit',
      'regionalTotalPermission',
      'linePermission',
      'storeOperationPermission',
      'groupPermission',
    ]
    const hasEmptyRequiredField = vehicleModels.some(model =>
      requiredFields.some(field => model[field].trim() === '')
    )

    if (hasEmptyRequiredField) {
      alert('请填写所有必填权限字段')
      return
    }

    console.log('保存新增限价:', policyInfo, vehicleModels)
    alert('保存成功')
    setCurrentPage('list')
    setActiveMenu('list')
  }

  const handleLimitTypeChange = (limitType: string) => {
    setPolicyInfo(prev => ({
      ...prev,
      limitType,
      year: limitType === '常规车' ? prev.year : '',
      month: limitType === '常规车' ? prev.month : '',
    }))
  }

  const handleDeleteModel = (id: number) => {
    setVehicleModels(prev => prev.filter(model => model.id !== id))
  }

  const handleAddModel = () => {
    setShowVehicleSelectModal(true)
  }

  const handleCloseVehicleSelect = () => {
    setShowVehicleSelectModal(false)
  }

  const filteredVehicleCatalog = VEHICLE_CATALOG.filter(item => (
    (!vehicleSearch.brand || item.brand === vehicleSearch.brand) &&
    (!vehicleSearch.level || item.level === vehicleSearch.level) &&
    (!vehicleSearch.modelCode || item.modelCode.toLowerCase().includes(vehicleSearch.modelCode.toLowerCase())) &&
    (!vehicleSearch.modelName || item.modelName.includes(vehicleSearch.modelName)) &&
    (!vehicleSearch.yearCode || item.yearCode.toLowerCase().includes(vehicleSearch.yearCode.toLowerCase())) &&
    (!vehicleSearch.yearName || item.yearName.includes(vehicleSearch.yearName)) &&
    (!vehicleSearch.powertrainCode || item.powertrainCode.toLowerCase().includes(vehicleSearch.powertrainCode.toLowerCase()))
  ))

  const updateVehicleSearch = (field: keyof typeof vehicleSearch, value: string) => {
    setVehicleSearch(prev => ({ ...prev, [field]: value }))
  }

  const toggleVehicleSelection = (key: string) => {
    setSelectedVehicleKeys(prev => prev.includes(key) ? prev.filter(itemKey => itemKey !== key) : [...prev, key])
  }

  const handleConfirmVehicleSelect = () => {
    if (selectedVehicleKeys.length === 0) {
      alert('请选择车型数据')
      return
    }
    const selectedModels = VEHICLE_CATALOG.filter(item => selectedVehicleKeys.includes(item.key))
    const existingKeys = new Set(vehicleModels.map(model => `${model.brand}|${model.level}|${model.modelCode}|${model.modelName}|${model.yearCode}|${model.yearName}|${model.powertrainCode}|${model.powertrainName}|${model.versionCode}|${model.versionName}`))
    const duplicate = selectedModels.find(item => existingKeys.has(item.key))
    if (duplicate) {
      alert(`版型数据重复：${duplicate.versionName || duplicate.modelName}，不可重复添加`)
      return
    }
    let nextId = Math.max(...vehicleModels.map(m => m.id), 0)
    setVehicleModels(prev => [
      ...prev,
      ...selectedModels.map(item => ({
        id: ++nextId,
        brand: item.brand,
        level: item.level,
        modelCode: item.modelCode,
        modelName: item.modelName,
        yearCode: item.yearCode,
        yearName: item.yearName,
        powertrainCode: item.powertrainCode,
        powertrainName: item.powertrainName,
        versionCode: item.versionCode,
        versionName: item.versionName,
        grossProfitLimit: '',
        regionalTotalPermission: '',
        linePermission: '',
        storeOperationPermission: '',
        groupPermission: '',
      })),
    ])
    setSelectedVehicleKeys([])
    setShowVehicleSelectModal(false)
  }

  const handleOpenImport = () => {
    setShowImportModal(true)
  }

  const handleCloseImport = () => {
    setShowImportModal(false)
  }

  const handleDownloadTemplate = () => {
    const link = document.createElement('a')
    link.href = TEMPLATE_DOWNLOAD_URL
    link.download = '限价导入模板.xlsx'
    link.click()
  }

  const handleImportFile = (file: File | undefined) => {
    if (!file) return
    if (!/\.xlsx?$/i.test(file.name)) {
      setImportMessage('请上传 .xlsx 或 .xls 格式文件')
      return
    }
    setImportFileName(file.name)
    setImportMessage('文件已选择，点击确定开始导入')
  }

  const handleImportSearch = () => {
    console.log('导入查询', { importStartTime, importEndTime, importFileName })
  }

  const handleImportReset = () => {
    setImportStartTime('')
    setImportEndTime('')
    setImportFileName('')
    setImportMessage('')
    if (importFileInputRef.current) importFileInputRef.current.value = ''
  }

  const handleImportConfirm = () => {
    if (!importFileName) {
      setImportMessage('请先选择导入文件')
      return
    }
    if (isDuplicateVersion(vehicleModels)) {
      setImportMessage('版型数据重复，不可重复导入')
      return
    }
    setShowImportModal(false)
    setImportMessage('')
  }

  const isDuplicateVersion = (models: VehicleModel[]) => {
    const seen = new Set<string>()
    return models.some(model => {
      const key = `${model.brand}|${model.level}|${model.modelCode}|${model.modelName}|${model.yearCode}|${model.yearName}|${model.powertrainCode}|${model.powertrainName}|${model.versionCode}|${model.versionName}`
      if (seen.has(key)) return true
      seen.add(key)
      return false
    })
  }

  const handleModelChange = (id: number, field: keyof VehicleModel, value: string) => {
    setVehicleModels(prev =>
      prev.map(model =>
        model.id === id ? { ...model, [field]: value } : model
      )
    )
  }

  // 仅允许输入整数（可输入负数，不可为小数）
  const handleNumberChange = (id: number, field: keyof VehicleModel, value: string) => {
    if (value === '' || /^-?\d*$/.test(value)) {
      handleModelChange(id, field, value)
    }
  }

  const handleSave = () => {
    if (!policyInfo.limitType || (isRegularLimitType && (!policyInfo.year || !policyInfo.month))) {
      alert('请填写限价类型、年份和月份')
      return
    }

    const requiredFields: Array<keyof VehicleModel> = [
      'grossProfitLimit',
      'regionalTotalPermission',
      'linePermission',
      'storeOperationPermission',
      'groupPermission',
    ]
    const hasEmptyRequiredField = vehicleModels.some(model =>
      requiredFields.some(field => model[field].trim() === '')
    )

    if (hasEmptyRequiredField) {
      alert('请填写所有必填权限字段')
      return
    }

    console.log('保存政策信息:', policyInfo)
    console.log('保存车型信息:', vehicleModels)
    alert('保存成功')
  }

  const handleBack = () => {
    setCurrentPage('list')
    setActiveMenu('list')
  }

  return (
    <>
      <div className="policy-edit-container">
            {/* Header */}
            <header className="policy-header">
              <div className="header-left">
                <div className="logo-area">
                  <img src={logoImg} alt="Logo" className="logo" />
                </div>
              </div>
              <div className="header-right">
                <button className="header-btn icon-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="rgba(0, 0, 0, 0.88)">
                    <path d="M13.59375,1.96875 L10.37187,1.96875 C10.1,1.96875 9.85781,2.15469 9.79375,2.42656 C9.59844,3.25156 8.85937,3.84375 8,3.84375 C7.14063,3.84375 6.40156,3.25156 6.20625,2.42656 C6.17578,2.29616 6.10205,2.17992 5.99707,2.09679 C5.89208,2.01365 5.76204,1.96852 5.62813,1.96875 L2.40625,1.96875 C2.22391,1.96875 2.04905,2.04118 1.92011,2.17011 C1.79118,2.29905 1.71875,2.47392 1.71875,2.65625 L1.71875,6.59375 C1.71875,6.77609 1.79118,6.95096 1.92011,7.07989 C2.04905,7.20882 2.22391,7.28125 2.40625,7.28125 L3.57813,7.28125 L3.57813,13.34375 C3.57813,13.52605 3.65056,13.70095 3.77949,13.82985 C3.90842,13.95885 4.08329,14.03125 4.26563,14.03125 L11.73435,14.03125 C11.91675,14.03125 12.09155,13.95885 12.22055,13.82985 C12.34945,13.70095 12.42185,13.52605 12.42185,13.34375 L12.42185,7.28125 L13.59375,7.28125 C13.77605,7.28125 13.95095,7.20882 14.07985,7.07989 C14.20885,6.95096 14.28125,6.77609 14.28125,6.59375 L14.28125,2.65625 C14.28125,2.47392 14.20885,2.29905 14.07985,2.17011 C13.95095,2.04118 13.77605,1.96875 13.59375,1.96875 Z M13.15625,6.15625 L11.29687,6.15625 L11.29687,12.90625 L4.70313,12.90625 L4.70313,6.15625 L2.84375,6.15625 L2.84375,3.09375 L5.23906,3.09375 C5.67969,4.20625 6.7625,4.96875 8,4.96875 C9.2375,4.96875 10.32031,4.20625 10.76094,3.09375 L13.15625,3.09375 L13.15625,6.15625 Z"/>
                  </svg>
                </button>
                <button className="header-btn">
                  <span>中文</span>
                  <ChevronDown size={10} />
                </button>
                <div className="user-info">
                  <svg width="14" height="14" viewBox="64 64 896 896" fill="currentColor">
                    <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"/>
                  </svg>
                  <span>系统管理员</span>
                  <ChevronDown size={10} />
                </div>
              </div>
            </header>
      
            {/* Main Content */}
            <div className="main-content">
              {/* Sidebar */}
              <aside className="sidebar">
                <div className="search-box">
                  <input type="text" placeholder="搜索菜单..." />
                  <svg width="14" height="14" viewBox="64 64 896 896" fill="rgb(8, 18, 37)">
                    <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"/>
                  </svg>
                </div>
      
                <div className="menu-list">
                  <div className="menu-item active">
                    <span>限价管理</span>
                    <ChevronDown size={10} />
                  </div>
                  <div className="submenu-wrapper">
                    <div className={`submenu-item ${activeMenu === 'list' ? 'active' : ''}`} onClick={() => handleMenuClick('list')}>限价列表</div>
                    <div className={`submenu-item ${activeMenu === 'rules' ? 'active' : ''}`} onClick={() => handleMenuClick('rules')}>限价规则</div>
                  </div>
                </div>
      
                <button className="fold-button">
                  <svg width="16" height="16" viewBox="64 64 896 896" fill="rgba(0, 0, 0, 0.88)">
                    <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"/>
                  </svg>
                </button>
              </aside>
      
              {/* Content Area */}
              <main className="content-area">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                  <span className="breadcrumb-item active">
                    {currentPage === 'list' ? '限价管理/限价列表' : currentPage === 'add' ? '限价管理/新增限价' : '限价管理/限价规则'}
                  </span>
                </div>

                {/* Page Content */}
                <div className="page-content">
                  {currentPage === 'list' ? (
                    // 列表页面
                    <>
                      {/* Filter Card */}
                      <div className="card">
                        <div className="form-section">
                          <div className="form-section-title">筛选条件</div>
                          <div className="form-row">
                            <div className="form-item">
                              <label className="form-label">限价类型</label>
                              <select
                                className="form-input"
                                value={filterLimitType}
                                onChange={e => setFilterLimitType(e.target.value)}
                              >
                                <option value="">全部</option>
                                {LIMIT_TYPE_OPTIONS.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                            <div className="form-item">
                              <label className="form-label">年份</label>
                              <select
                                className="form-input"
                                value={filterYear}
                                onChange={e => setFilterYear(e.target.value)}
                              >
                                <option value="">全部</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                              </select>
                            </div>
                            <div className="form-item">
                              <label className="form-label">月份</label>
                              <select
                                className="form-input"
                                value={filterMonth}
                                onChange={e => setFilterMonth(e.target.value)}
                              >
                                <option value="">全部</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={String(i + 1)}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* List Table */}
                      <div className="table-container">
                        <div className="table-header">
                          <div className="table-title">限价列表</div>
                          <div className="table-actions">
                            <button className="btn" onClick={handleAddPolicy}>
                              <Plus size={14} />
                              新增
                            </button>
                          </div>
                        </div>
                        <div className="table-wrapper">
                          <table>
                            <thead>
                              <tr>
                                <th>序号</th>
                                <th>限价类型</th>
                                <th>年份</th>
                                <th>月份</th>
                                <th>创建时间</th>
                                <th>状态</th>
                                <th>操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {POLICY_LIST
                                .filter(item =>
                                  (filterLimitType === '' || item.limitType === filterLimitType) &&
                                  (filterYear === '' || item.year === filterYear) &&
                                  (filterMonth === '' || item.month === filterMonth)
                                )
                                .map((item, index) => (
                                  <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.limitType}</td>
                                    <td>{item.year}</td>
                                    <td>{item.month}</td>
                                    <td>{item.createTime}</td>
                                    <td>
                                      <span className={`status-badge status-${item.status === '已生效' ? 'active' : item.status === '草稿' ? 'draft' : 'expired'}`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td>
                                      <button className="btn btn-edit" onClick={() => handleEditPolicy(item)}>
                                        编辑
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    // 新增与规则编辑页面
                    <>
                      {/* Basic Info Card */}
                      <div className="card">
                    <div className="form-section">
                      <div className="form-section-title">限价基本信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label required">限价类型</label>
                          <select
                            className="form-input"
                            value={policyInfo.limitType}
                            onChange={e => handleLimitTypeChange(e.target.value)}
                          >
                            {LIMIT_TYPE_OPTIONS.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        {isRegularLimitType && (
                          <>
                            <div className="form-item">
                              <label className="form-label required">年份</label>
                              <select
                                className="form-input"
                                value={policyInfo.year}
                                onChange={e => setPolicyInfo(prev => ({ ...prev, year: e.target.value }))}
                              >
                                <option value="">请选择</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                              </select>
                            </div>
                            <div className="form-item">
                              <label className="form-label required">月份</label>
                              <select
                                className="form-input"
                                value={policyInfo.month}
                                onChange={e => setPolicyInfo(prev => ({ ...prev, month: e.target.value }))}
                              >
                                <option value="">请选择</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <option key={i + 1} value={String(i + 1)}>
                                    {i + 1}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
      
                  {/* Vehicle Info Table */}
                  <div className="table-container">
                    <div className="table-header">
                      <div className="table-title">限价规则表</div>
                      <div className="table-actions">
                        <button className="btn" onClick={handleAddModel}>
                          <Plus size={14} />
                          新增
                        </button>
                        <button className="btn" onClick={handleOpenImport}>
                          <Upload size={14} />
                          导入
                        </button>
                        <button className="btn">
                          <FileSpreadsheet size={14} />
                          导出
                        </button>
                      </div>
                    </div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>序号</th>
                            <th>品牌</th>
                            <th>车系</th>
                            <th>车型编号</th>
                            <th>车型名称</th>
                            <th>年款编号</th>
                            <th>年款名称</th>
                            <th>动总编号</th>
                            <th>动总名称</th>
                            <th>版型编号</th>
                            <th>版型名称</th>
                            <th className="required">综合毛利限价</th>
                            <th className="required">大区总权限</th>
                            <th className="required">条线权限</th>
                            <th className="required">门店运营权限</th>
                            <th className="required">集团权限</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vehicleModels.map((model, index) => (
                            <tr key={model.id}>
                              <td>{index + 1}</td>
                              <td>{model.brand}</td>
                              <td>{model.level}</td>
                              <td>{model.modelCode}</td>
                              <td>{model.modelName}</td>
                              <td>{model.yearCode}</td>
                              <td>{model.yearName}</td>
                              <td>{model.powertrainCode}</td>
                              <td>{model.powertrainName}</td>
                              <td>{model.versionCode}</td>
                              <td>{model.versionName}</td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="请输入综合毛利限价"
                                  value={model.grossProfitLimit}
                                  onChange={e => handleNumberChange(model.id, 'grossProfitLimit', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="请输入大区总权限"
                                  value={model.regionalTotalPermission}
                                  onChange={e => handleNumberChange(model.id, 'regionalTotalPermission', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="请输入条线权限"
                                  value={model.linePermission}
                                  onChange={e => handleNumberChange(model.id, 'linePermission', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="请输入门店运营权限"
                                  value={model.storeOperationPermission}
                                  onChange={e => handleNumberChange(model.id, 'storeOperationPermission', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  placeholder="请输入集团权限"
                                  value={model.groupPermission}
                                  onChange={e => handleNumberChange(model.id, 'groupPermission', e.target.value)}
                                />
                              </td>
                              <td>
                                <button className="btn btn-delete" onClick={() => handleDeleteModel(model.id)}>
                                  <Trash2 size={14} />
                                  删除
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
      
                  {/* Footer Actions */}
                  <div className="footer-actions">
                    <button className="footer-btn footer-btn-cancel" onClick={handleBack}>
                      返回
                    </button>
                    <button className="footer-btn footer-btn-save" onClick={currentPage === 'add' ? handleSavePolicy : handleSave}>
                      保存
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </main>
            </div>
      
            {/* AI Assistant Button */}
            <div className="ai-assistant">
              <button className="ai-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </button>
            </div>
          </div>
      {showVehicleSelectModal && (
        <div className="vehicle-select-mask" onClick={handleCloseVehicleSelect}>
          <div className="vehicle-select-modal" onClick={event => event.stopPropagation()}>
            <div className="vehicle-select-header">
              <span>车型选择</span>
              <button className="import-close-btn" onClick={handleCloseVehicleSelect} aria-label="关闭车型选择弹窗"><X size={20} /></button>
            </div>
            <div className="vehicle-select-body">
              <div className="vehicle-filter-grid">
                <div className="vehicle-filter-item"><label>品牌</label><select value={vehicleSearch.brand} onChange={event => updateVehicleSearch('brand', event.target.value)}><option value="">请选择品牌</option>{CATALOG_BRAND_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></div>
                <div className="vehicle-filter-item"><label>目录层级</label><select value={vehicleSearch.level} onChange={event => updateVehicleSearch('level', event.target.value)}><option value="">请选择目录层级</option>{CATALOG_LEVEL_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></div>
                <div className="vehicle-filter-item"><label>车型编码</label><input placeholder="请选择车型编码" value={vehicleSearch.modelCode} onChange={event => updateVehicleSearch('modelCode', event.target.value)} /></div>
                <div className="vehicle-filter-item"><label>车型名称</label><input placeholder="请选择车型名称" value={vehicleSearch.modelName} onChange={event => updateVehicleSearch('modelName', event.target.value)} /></div>
                <div className="vehicle-filter-item"><label>年款编码</label><input placeholder="请选择年款编码" value={vehicleSearch.yearCode} onChange={event => updateVehicleSearch('yearCode', event.target.value)} /></div>
                <div className="vehicle-filter-item"><label>年款名称</label><input placeholder="请选择年款名称" value={vehicleSearch.yearName} onChange={event => updateVehicleSearch('yearName', event.target.value)} /></div>
                <div className="vehicle-filter-item"><label>动总编码</label><input placeholder="请选择动总编码" value={vehicleSearch.powertrainCode} onChange={event => updateVehicleSearch('powertrainCode', event.target.value)} /></div>
                <div className="vehicle-filter-actions"><button className="vehicle-expand-btn">展开 <ChevronDown size={13} /></button><button className="btn btn-primary" onClick={() => setVehicleSearch(prev => ({ ...prev }))}>查 询</button><button className="btn" onClick={() => setVehicleSearch({ brand: '', level: '', modelCode: '', modelName: '', yearCode: '', yearName: '', powertrainCode: '' })}>重 置</button></div>
              </div>
              <div className="vehicle-selected-count">已选择 {selectedVehicleKeys.length} / {VEHICLE_CATALOG_TOTAL} 条数据</div>
              <div className="vehicle-table-wrap">
                <table className="vehicle-select-table">
                  <thead><tr><th><input type="checkbox" checked={filteredVehicleCatalog.length > 0 && filteredVehicleCatalog.every(item => selectedVehicleKeys.includes(item.key))} onChange={event => setSelectedVehicleKeys(event.target.checked ? filteredVehicleCatalog.map(item => item.key) : [])} /></th><th>序号</th><th>品牌</th><th>目录层级</th><th>车型编码</th><th>车型名称</th><th>年款编码</th><th>年款名称</th><th>动总编码</th><th>动总名称</th><th>版型编码</th><th>版型名称</th></tr></thead>
                  <tbody>{filteredVehicleCatalog.map((item, index) => <tr key={item.key}><td><input type="checkbox" checked={selectedVehicleKeys.includes(item.key)} onChange={() => toggleVehicleSelection(item.key)} /></td><td>{index + 1}</td><td><span className="vehicle-tag">{item.brand}</span></td><td><span className="vehicle-tag">{item.level}</span></td><td>{item.modelCode}</td><td>{item.modelName}</td><td>{item.yearCode}</td><td>{item.yearName}</td><td>{item.powertrainCode}</td><td>{item.powertrainName}</td><td>{item.versionCode}</td><td>{item.versionName}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="vehicle-pagination"><span>共 {VEHICLE_CATALOG_TOTAL} 条</span><button disabled>‹</button><button className="page-active">1</button><button>2</button><button>3</button><span>...</span><button>48</button><button>›</button><select><option>20 条/页</option></select><span>跳至</span><input aria-label="跳转页码" /><span>页</span></div>
            </div>
            <div className="vehicle-select-footer"><button className="footer-btn footer-btn-cancel" onClick={handleCloseVehicleSelect}>取消</button><button className="footer-btn footer-btn-save" onClick={handleConfirmVehicleSelect}>确定</button></div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="import-modal-mask" onClick={handleCloseImport}>
          <div className="import-modal" onClick={event => event.stopPropagation()}>
            <div className="import-modal-header">
              <span>导入政策</span>
              <button className="import-close-btn" onClick={handleCloseImport} aria-label="关闭导入弹窗">
                <X size={20} />
              </button>
            </div>
            <div className="import-modal-body">
              <div className="import-section-title">导入文件</div>
              <div className="import-upload-row">
                <button className="btn import-upload-btn" onClick={() => importFileInputRef.current?.click()}>
                  <Upload size={14} /> 导入文件
                </button>
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="import-file-hidden"
                  onChange={event => handleImportFile(event.target.files?.[0])}
                />
                <button className="import-template-link" onClick={handleDownloadTemplate}>
                  下载导入模板
                </button>
              </div>
              {importFileName && <div className="import-file-name">已选择：{importFileName}</div>}
              {importMessage && <div className="import-message">{importMessage}</div>}

              <div className="import-filter-title">创建时间</div>
              <div className="import-filter-row">
                <input className="import-date-input" type="date" value={importStartTime} onChange={event => setImportStartTime(event.target.value)} />
                <span>到</span>
                <input className="import-date-input" type="date" value={importEndTime} onChange={event => setImportEndTime(event.target.value)} />
                <button className="btn btn-primary import-query-btn" onClick={handleImportSearch}>查 询</button>
              </div>

              <div className="import-data-header">
                <span>数据列表</span>
                <Settings size={14} />
              </div>
              <div className="import-records-wrapper">
                <table className="import-records-table">
                  <thead>
                    <tr><th>序号</th><th>记录ID</th><th>导入时间</th><th>操作人</th><th>文件名</th><th>总数</th><th>操作</th></tr>
                  </thead>
                  <tbody>
                    {importRecords.slice((importPage - 1) * importPageSize, importPage * importPageSize).map(record => (
                      <tr key={record.id}>
                        <td>{record.id}</td><td>{record.recordId}</td><td>{record.importTime}</td><td>{record.operator}</td><td>{record.fileName}</td><td>{record.total}</td>
                        <td><button className="import-link-btn">源文件</button>{record.hasLog && <button className="import-link-btn">失败日志</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="import-pagination">
                <span>共 {importRecords.length === 6 ? 84 : importRecords.length} 条</span>
                <button disabled={importPage === 1} onClick={() => setImportPage(page => Math.max(1, page - 1))}><ChevronLeft size={14} /></button>
                <button className="page-active">{importPage}</button>
                <button onClick={() => setImportPage(page => page + 1)}>2</button>
                <button onClick={() => setImportPage(page => page + 1)}>3</button>
                <span>...</span><button>4</button><button><ChevronRight size={14} /></button>
                <select value={importPageSize} onChange={event => setImportPageSize(Number(event.target.value))}><option value="20">20 条/页</option><option value="50">50 条/页</option></select>
              </div>
            </div>
            <div className="import-modal-footer">
              <button className="footer-btn footer-btn-cancel" onClick={handleCloseImport}>取消</button>
              <button className="footer-btn footer-btn-save" onClick={handleImportConfirm}>确定</button>
            </div>
          </div>
        </div>
      )}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        defaultVisible
        options={{
          currentPageId: "policy-management-edit",
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </>
  )
}

export default Component;