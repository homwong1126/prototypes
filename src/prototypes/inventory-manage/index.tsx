/**
 * @name 库存管理
 * @mode axure
 *
 * 盈丰运营管理平台 - 库存管理页面
 * 用于管理车辆库存信息，包括主列表页和编辑页
 */
import React, { useState } from 'react'
import { ChevronDown, Plus, FileSpreadsheet, Search, Calendar, Filter, Copy, ArrowUpDown } from 'lucide-react'
import './style.css'
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation';
import annotationSourceDocument from './annotation-source.json';

// ─── 类型定义 ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: number
  storeErpNo: string
  storeName: string
  businessAttribute: string
  vin: string
  purchaseOrderType: string
  inventoryStatus: string
  vehicleStatus: string
  sapMaterialCode: string
  materialCode: string
  materialName: string
  brand: string
  productSeries: string
  carSeries: string
  modelCode: string
  modelName: string
  yearModel: string
  powertrain: string
  trim: string
  exteriorColor: string
  interiorColor: string
  originalDealerErpNo: string
  originalDealerName: string
  inboundTime: string
  announcementExpiryDate: string
  productionDate: string
  shippingPostingDate: string
  vehicleType: string
  inventoryAge: number
  inStockAge: number
  shippingAge: number
  isConsignment: string
  isAdjustment: string
  purchasePrice: number
  guidePrice: number
  vehicleDefinition: string
  isReturn: string
  returnTime: string
  returnReason: string
  isWarehouseReturn: string
  warehouseReturnTime: string
  warehouseReturnReason: string
  warehouseReturnNo: string
  storageLocation: string
  storageLocationDetail: string
  secondaryNetworkName: string
  purchaseType: string
  supplierName: string
  approvalStatus: string
  modifyReason: string
  rejectReason: string
}

interface EditFormData {
  storeErpNo: string
  storeName: string
  vin: string
  purchaseOrderType: string
  sapMaterialCode: string
  materialCode: string
  materialName: string
  brand: string
  productSeries: string
  carSeries: string
  modelCode: string
  modelName: string
  yearModel: string
  powertrain: string
  trim: string
  exteriorColor: string
  interiorColor: string
  originalDealerErpNo: string
  originalDealerName: string
  announcementExpiryDate: string
  productionDate: string
  shippingPostingDate: string
  vehicleType: string
  isConsignment: string
  isAdjustment: string
  purchasePrice: string
  guidePrice: string
  vehicleDefinition: string
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const TOTAL_INVENTORY_COUNT = 85447

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    storeErpNo: '3279',
    storeName: '太原盈丰',
    businessAttribute: '直营',
    vin: 'LVVDC24B4TD299611',
    purchaseOrderType: '客户订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'M7203PTBWLB0010',
    materialCode: 'M7203PTBWLB0010',
    materialName: '奇瑞/艾瑞泽8 PRO/2027款/2.0T-7DCT/尊享型/珍珠白',
    brand: '奇瑞',
    productSeries: '艾瑞泽系列',
    carSeries: '艾瑞泽8 PRO',
    modelCode: 'QR123',
    modelName: '艾瑞泽8 PRO',
    yearModel: '2027款',
    powertrain: '2.0T-7DCT',
    trim: '尊享型',
    exteriorColor: '珍珠白',
    interiorColor: '黑红',
    originalDealerErpNo: '3279',
    originalDealerName: '合肥盈丰奇祥汽车销售服务有限公司太原分公司',
    inboundTime: '2026-08-27 12:05:57',
    announcementExpiryDate: '',
    productionDate: '2026-08-14',
    shippingPostingDate: '2026-08-22',
    vehicleType: '商品车',
    inventoryAge: 13,
    inStockAge: 0,
    shippingAge: 5,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 131400,
    guidePrice: 136900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
  {
    id: 2,
    storeErpNo: '3357',
    storeName: '阜阳风云',
    businessAttribute: '直营',
    vin: 'LVVDD24B3SD515539',
    purchaseOrderType: '增补订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'T6460RMKXUK0002',
    materialCode: 'T6460RMKXUK0002',
    materialName: '风云/风云T7/2026款/BEV/600km舒适型/流光银',
    brand: '奇瑞',
    productSeries: '风云系列',
    carSeries: '风云T系列',
    modelCode: 'QR147',
    modelName: '风云T7',
    yearModel: '2026款',
    powertrain: 'BEV',
    trim: '600km舒适型',
    exteriorColor: '流光银',
    interiorColor: '黑棕',
    originalDealerErpNo: '3357',
    originalDealerName: '阜阳风云汽车销售服务有限公司',
    inboundTime: '2026-08-27 11:48:32',
    announcementExpiryDate: '',
    productionDate: '2026-08-06',
    shippingPostingDate: '2026-08-24',
    vehicleType: '商品车',
    inventoryAge: 21,
    inStockAge: 0,
    shippingAge: 3,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 119900,
    guidePrice: 108900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
  {
    id: 3,
    storeErpNo: '3357',
    storeName: '阜阳风云',
    businessAttribute: '直营',
    vin: 'LVVDD24B4SD515540',
    purchaseOrderType: '客户订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'T6460RMKXUK0002',
    materialCode: 'T6460RMKXUK0002',
    materialName: '风云/风云T7/2026款/BEV/600km舒适型/青竹灰',
    brand: '奇瑞',
    productSeries: '风云系列',
    carSeries: '风云T系列',
    modelCode: 'QR147',
    modelName: '风云T7',
    yearModel: '2026款',
    powertrain: 'BEV',
    trim: '600km舒适型',
    exteriorColor: '青竹灰',
    interiorColor: '黑棕',
    originalDealerErpNo: '3357',
    originalDealerName: '阜阳风云汽车销售服务有限公司',
    inboundTime: '2026-08-27 10:22:15',
    announcementExpiryDate: '',
    productionDate: '2026-08-19',
    shippingPostingDate: '2026-08-23',
    vehicleType: '商品车',
    inventoryAge: 8,
    inStockAge: 0,
    shippingAge: 4,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 119900,
    guidePrice: 108900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
  {
    id: 4,
    storeErpNo: '3279',
    storeName: '太原盈丰',
    businessAttribute: '直营',
    vin: 'LVVDC24B5TD299612',
    purchaseOrderType: '客户订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'M7203PTBWLB0010',
    materialCode: 'M7203PTBWLB0010',
    materialName: '奇瑞/艾瑞泽8 PRO/2027款/2.0T-7DCT/尊享型/珍珠白',
    brand: '奇瑞',
    productSeries: '艾瑞泽系列',
    carSeries: '艾瑞泽8 PRO',
    modelCode: 'QR123',
    modelName: '艾瑞泽8 PRO',
    yearModel: '2027款',
    powertrain: '2.0T-7DCT',
    trim: '尊享型',
    exteriorColor: '珍珠白',
    interiorColor: '黑红',
    originalDealerErpNo: '3279',
    originalDealerName: '合肥盈丰奇祥汽车销售服务有限公司太原分公司',
    inboundTime: '2026-08-26 16:30:08',
    announcementExpiryDate: '',
    productionDate: '2026-08-14',
    shippingPostingDate: '2026-08-22',
    vehicleType: '商品车',
    inventoryAge: 13,
    inStockAge: 0,
    shippingAge: 5,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 131400,
    guidePrice: 136900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
  {
    id: 5,
    storeErpNo: '3357',
    storeName: '阜阳风云',
    businessAttribute: '直营',
    vin: 'LVVDD24B6SD515541',
    purchaseOrderType: '增补订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'T6460RMKXUK0002',
    materialCode: 'T6460RMKXUK0002',
    materialName: '风云/风云T7/2026款/BEV/600km舒适型/流光银',
    brand: '奇瑞',
    productSeries: '风云系列',
    carSeries: '风云T系列',
    modelCode: 'QR147',
    modelName: '风云T7',
    yearModel: '2026款',
    powertrain: 'BEV',
    trim: '600km舒适型',
    exteriorColor: '流光银',
    interiorColor: '黑棕',
    originalDealerErpNo: '3357',
    originalDealerName: '阜阳风云汽车销售服务有限公司',
    inboundTime: '2026-08-26 09:15:44',
    announcementExpiryDate: '',
    productionDate: '2026-08-06',
    shippingPostingDate: '2026-08-24',
    vehicleType: '商品车',
    inventoryAge: 21,
    inStockAge: 0,
    shippingAge: 3,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 119900,
    guidePrice: 108900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
  {
    id: 6,
    storeErpNo: '3357',
    storeName: '阜阳风云',
    businessAttribute: '直营',
    vin: 'LVVDD24B7SD515542',
    purchaseOrderType: '客户订单',
    inventoryStatus: '在库',
    vehicleStatus: '经销商仓库',
    sapMaterialCode: 'T6460RMKXUK0002',
    materialCode: 'T6460RMKXUK0002',
    materialName: '风云/风云T7/2026款/BEV/600km舒适型/青竹灰',
    brand: '奇瑞',
    productSeries: '风云系列',
    carSeries: '风云T系列',
    modelCode: 'QR147',
    modelName: '风云T7',
    yearModel: '2026款',
    powertrain: 'BEV',
    trim: '600km舒适型',
    exteriorColor: '青竹灰',
    interiorColor: '黑棕',
    originalDealerErpNo: '3357',
    originalDealerName: '阜阳风云汽车销售服务有限公司',
    inboundTime: '2026-08-25 14:08:21',
    announcementExpiryDate: '',
    productionDate: '2026-08-19',
    shippingPostingDate: '2026-08-23',
    vehicleType: '商品车',
    inventoryAge: 8,
    inStockAge: 0,
    shippingAge: 4,
    isConsignment: '否',
    isAdjustment: '否',
    purchasePrice: 119900,
    guidePrice: 108900,
    vehicleDefinition: '常规车',
    isReturn: '否',
    returnTime: '',
    returnReason: '',
    isWarehouseReturn: '否',
    warehouseReturnTime: '',
    warehouseReturnReason: '',
    warehouseReturnNo: '',
    storageLocation: '本店仓库',
    storageLocationDetail: '大库',
    secondaryNetworkName: '',
    purchaseType: '厂家采购',
    supplierName: '奇瑞汽车股份有限公司',
    approvalStatus: '',
    modifyReason: '',
    rejectReason: '',
  },
]

const INITIAL_EDIT_FORM: EditFormData = {
  storeErpNo: '3369',
  storeName: '淮安风云',
  vin: 'LURJCVS2XTA390841',
  purchaseOrderType: '客户订单',
  sapMaterialCode: 'T7000MTJVTA0024',
  materialCode: 'T7000MTJVTA0024',
  materialName: 'QQ/全新QQ3/2026款/310Km/310热爱版/丛林绿/',
  brand: '奇瑞',
  productSeries: 'QQ系列',
  carSeries: 'QQ3',
  modelCode: 'T12A',
  modelName: '全新QQ3',
  yearModel: '2026款',
  powertrain: '310Km',
  trim: '310热爱版',
  exteriorColor: '飘逸紫',
  interiorColor: '丛林绿',
  originalDealerErpNo: '3369',
  originalDealerName: '淮安和奇祥汽车销售服务有限公司',
  announcementExpiryDate: '',
  productionDate: '2026-08-15',
  shippingPostingDate: '2026-08-24',
  vehicleType: '商品车',
  isConsignment: '否',
  isAdjustment: '否',
  purchasePrice: '57900.00',
  guidePrice: '58900.00',
  vehicleDefinition: '常规车',
}

const EDIT_FORM_BY_VIN: Record<string, Partial<EditFormData>> = {
  LVVDC24B4TD299611: {
    storeErpNo: '3279',
    storeName: '太原盈丰',
    vin: 'LVVDC24B4TD299611',
    sapMaterialCode: 'M7203PTBWLB0010',
    materialCode: 'M7203PTBWLB0010',
    materialName: '奇瑞/艾瑞泽8 PRO/2027款/2.0T-7DCT/尊享型/珍珠白',
    productSeries: '艾瑞泽系列',
    carSeries: '艾瑞泽8 PRO',
    modelCode: 'QR123',
    modelName: '艾瑞泽8 PRO',
    yearModel: '2027款',
    powertrain: '2.0T-7DCT',
    trim: '尊享型',
    exteriorColor: '珍珠白',
    interiorColor: '黑红',
    originalDealerErpNo: '3279',
    originalDealerName: '合肥盈丰奇祥汽车销售服务有限公司太原分公司',
    purchasePrice: '131400.00',
    guidePrice: '136900.00',
  },
  LVVDD24B3SD515539: {
    storeErpNo: '3357',
    storeName: '阜阳风云',
    vin: 'LVVDD24B3SD515539',
    sapMaterialCode: 'T6460RMKXUK0002',
    materialCode: 'T6460RMKXUK0002',
    materialName: '风云/风云T7/2026款/BEV/600km舒适型/流光银',
    productSeries: '风云系列',
    carSeries: '风云T系列',
    modelCode: 'QR147',
    modelName: '风云T7',
    yearModel: '2026款',
    powertrain: 'BEV',
    trim: '600km舒适型',
    exteriorColor: '流光银',
    interiorColor: '黑棕',
    originalDealerErpNo: '3357',
    originalDealerName: '阜阳风云汽车销售服务有限公司',
    purchasePrice: '119900.00',
    guidePrice: '108900.00',
  },
}

const formatPrice = (value: number) => value.toLocaleString('en-US')

function TableTh({ label, filter = true, sort = false, copy = false }: { label: string; filter?: boolean; sort?: boolean; copy?: boolean }) {
  return (
    <th>
      <div className="inventory-th-content">
        {filter && <Filter size={12} className="inventory-th-filter" />}
        <span>{label}</span>
        {sort && <ArrowUpDown size={12} className="inventory-th-sort" />}
        {copy && <Copy size={12} className="inventory-th-copy" />}
      </div>
    </th>
  )
}

function TagGreen({ children }: { children: React.ReactNode }) {
  return <span className="inventory-tag inventory-tag-green">{children}</span>
}

function TagRed({ children }: { children: React.ReactNode }) {
  return <span className="inventory-tag inventory-tag-red">{children}</span>
}

// ─── 组件 ───────────────────────────────────────────────────────────────────────

const Component = function InventoryManage() {
  const [currentPage, setCurrentPage] = useState<'list' | 'edit'>('list')
  const [editForm, setEditForm] = useState<EditFormData>(INITIAL_EDIT_FORM)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'pending' | 'returned'>('all')
  const [searchFilters, setSearchFilters] = useState({
    vin: '',
    materialCode: '',
    sapMaterialCode: '',
    brand: '',
    storeErpNo: '',
    storeName: '',
    businessAttribute: '',
    inventoryStatus: '',
    vehicleStatus: '',
    startDate: '2021-12-08',
    endDate: '2026-08-27',
    storageLocation: '',
  })

  const handleEdit = (item: InventoryItem) => {
    setEditForm({
      ...INITIAL_EDIT_FORM,
      ...EDIT_FORM_BY_VIN[item.vin],
      vin: item.vin,
      materialCode: item.materialCode,
      sapMaterialCode: item.sapMaterialCode,
      storeName: item.storeName,
      storeErpNo: item.storeErpNo,
      purchaseOrderType: item.purchaseOrderType,
      vehicleDefinition: item.vehicleDefinition,
      purchasePrice: item.purchasePrice.toFixed(2),
      guidePrice: item.guidePrice.toFixed(2),
    })
    setCurrentPage('edit')
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? INVENTORY_ITEMS.map(item => item.id) : [])
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    setSelectedIds(prev => (checked ? [...prev, id] : prev.filter(itemId => itemId !== id)))
  }

  const handleSave = () => {
    console.log('保存库存信息:', editForm)
    alert('保存成功')
    setCurrentPage('list')
  }

  const handleCancel = () => {
    setCurrentPage('list')
  }

  const handleFilterChange = (field: keyof typeof searchFilters, value: string) => {
    setSearchFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    console.log('搜索条件:', searchFilters)
  }

  const handleReset = () => {
    setSearchFilters({
      vin: '',
      materialCode: '',
      sapMaterialCode: '',
      brand: '',
      storeErpNo: '',
      storeName: '',
      businessAttribute: '',
      inventoryStatus: '',
      vehicleStatus: '',
      startDate: '',
      endDate: '',
      storageLocation: '',
    })
  }

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <>
            <div className="inventory-manage-container">
              {/* Header */}
              <header className="inventory-header">
                <div className="header-left">
                  <div className="logo-area">
                    <div className="logo-text">盈丰运营管理平台</div>
                  </div>
                </div>
                <div className="header-right">
                  <button className="header-btn icon-btn">
                    <svg width="16" height="16" viewBox="64 64 896 896" fill="rgba(0, 0, 0, 0.88)">
                      <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"/>
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
                      <span>库存管理</span>
                      <ChevronDown size={10} />
                    </div>
                    <div className="submenu-wrapper">
                      <div className={`submenu-item ${currentPage === 'list' ? 'active' : ''}`} onClick={() => setCurrentPage('list')}>库存列表</div>
                      <div className="submenu-item">接车入库</div>
                      <div className="submenu-item">库存预警</div>
                      <div className="submenu-item">库存调拨</div>
                    </div>
                  </div>
      
                  <button className="fold-button">
                    <svg width="16" height="16" viewBox="64 64 896 896" fill="rgba(0, 0, 0, 0.88)">
                      <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 000 13.8z"/>
                    </svg>
                  </button>
                </aside>
      
                {/* Content Area */}
                <main className={`content-area ${currentPage === 'edit' ? 'content-area-edit' : ''}`}>
                  {/* Breadcrumb */}
                  <div className="breadcrumb">
                    {currentPage === 'list' ? (
                      <span className="breadcrumb-item active">库存管理/库存列表</span>
                    ) : (
                      <>
                        <span className="breadcrumb-item">销售管理</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">库存管理</span>
                      </>
                    )}
                  </div>
      
                  {/* Page Content */}
                  <div className="page-content">
                    {currentPage === 'list' ? (
                      // 列表页面
                      <>
                        <div className="inventory-filter-tabs" role="tablist" aria-label="库存审核状态">
                          <button
                            type="button"
                            className={`inventory-filter-tab ${activeFilterTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilterTab('all')}
                          >
                            全部
                          </button>
                          <button
                            type="button"
                            className={`inventory-filter-tab ${activeFilterTab === 'pending' ? 'active' : ''}`}
                            onClick={() => setActiveFilterTab('pending')}
                          >
                            待审核
                            <span className="inventory-filter-badge">1</span>
                          </button>
                          <button
                            type="button"
                            className={`inventory-filter-tab ${activeFilterTab === 'returned' ? 'active' : ''}`}
                            onClick={() => setActiveFilterTab('returned')}
                          >
                            退回
                            <span className="inventory-filter-badge">1</span>
                          </button>
                        </div>
      
                        {/* Filter Card */}
                        <div className="card inventory-filter-card">
                          <div className="form-section">
                            <div className="form-row inventory-filter-row">
                              <div className="form-item">
                                <label className="form-label">VIN码</label>
                                <div className="form-input-wrapper">
                                  <input
                                    type="text"
                                    className="form-input form-input-with-suffix"
                                    placeholder="请输入VIN码，可批量查询"
                                    value={searchFilters.vin}
                                    onChange={e => handleFilterChange('vin', e.target.value)}
                                  />
                                  <Search size={14} className="form-suffix-icon form-search-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">物料编码</label>
                                <div className="form-input-wrapper">
                                  <input
                                    type="text"
                                    className="form-input form-input-with-suffix"
                                    placeholder="请输入物料编码，可批量查询"
                                    value={searchFilters.materialCode}
                                    onChange={e => handleFilterChange('materialCode', e.target.value)}
                                  />
                                  <Search size={14} className="form-suffix-icon form-search-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">SAP物料编码</label>
                                <div className="form-input-wrapper">
                                  <input
                                    type="text"
                                    className="form-input form-input-with-suffix"
                                    placeholder="请输入SAP物料编码，可批量查询"
                                    value={searchFilters.sapMaterialCode}
                                    onChange={e => handleFilterChange('sapMaterialCode', e.target.value)}
                                  />
                                  <Search size={14} className="form-suffix-icon form-search-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">品牌</label>
                                <div className="form-input-wrapper">
                                  <select
                                    className="form-input form-select"
                                    value={searchFilters.brand}
                                    onChange={e => handleFilterChange('brand', e.target.value)}
                                  >
                                    <option value="">全部</option>
                                    <option value="奇瑞">奇瑞</option>
                                    <option value="风云">风云</option>
                                  </select>
                                  <ChevronDown size={12} className="form-suffix-icon" />
                                </div>
                              </div>
                            </div>
                            <div className="form-row inventory-filter-row">
                              <div className="form-item">
                                <label className="form-label">门店销售ERP号</label>
                                <div className="form-input-wrapper">
                                  <input
                                    type="text"
                                    className="form-input form-input-with-suffix"
                                    placeholder="请输入门店销售ERP号"
                                    value={searchFilters.storeErpNo}
                                    onChange={e => handleFilterChange('storeErpNo', e.target.value)}
                                  />
                                  <Search size={14} className="form-suffix-icon form-search-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">门店名称</label>
                                <div className="form-input-wrapper">
                                  <input
                                    type="text"
                                    className="form-input form-input-with-suffix"
                                    placeholder="请输入门店名称"
                                    value={searchFilters.storeName}
                                    onChange={e => handleFilterChange('storeName', e.target.value)}
                                  />
                                  <Search size={14} className="form-suffix-icon form-search-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">经营属性</label>
                                <div className="form-input-wrapper">
                                  <select
                                    className="form-input form-select"
                                    value={searchFilters.businessAttribute}
                                    onChange={e => handleFilterChange('businessAttribute', e.target.value)}
                                  >
                                    <option value="">全部</option>
                                    <option value="直营">直营</option>
                                  </select>
                                  <ChevronDown size={12} className="form-suffix-icon" />
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">库存状态</label>
                                <div className="form-input-wrapper">
                                  <select
                                    className="form-input form-select"
                                    value={searchFilters.inventoryStatus}
                                    onChange={e => handleFilterChange('inventoryStatus', e.target.value)}
                                  >
                                    <option value="">全部</option>
                                    <option value="在库">在库</option>
                                    <option value="在途">在途</option>
                                    <option value="出库">出库</option>
                                  </select>
                                  <ChevronDown size={12} className="form-suffix-icon" />
                                </div>
                              </div>
                            </div>
                            <div className="form-row inventory-filter-row">
                              <div className="form-item">
                                <label className="form-label">车辆状态</label>
                                <div className="form-input-wrapper">
                                  <select
                                    className="form-input form-select"
                                    value={searchFilters.vehicleStatus}
                                    onChange={e => handleFilterChange('vehicleStatus', e.target.value)}
                                  >
                                    <option value="">全部</option>
                                    <option value="经销商仓库">经销商仓库</option>
                                  </select>
                                  <ChevronDown size={12} className="form-suffix-icon" />
                                </div>
                              </div>
                              <div className="form-item form-item-date-range">
                                <label className="form-label">入库时间</label>
                                <div className="form-date-range">
                                  <div className="form-input-wrapper">
                                    <input
                                      type="text"
                                      className="form-input form-input-with-suffix"
                                      placeholder="开始时间"
                                      value={searchFilters.startDate}
                                      onChange={e => handleFilterChange('startDate', e.target.value)}
                                    />
                                    <Calendar size={14} className="form-suffix-icon form-calendar-icon" />
                                  </div>
                                  <span className="form-date-separator">至</span>
                                  <div className="form-input-wrapper">
                                    <input
                                      type="text"
                                      className="form-input form-input-with-suffix"
                                      placeholder="结束时间"
                                      value={searchFilters.endDate}
                                      onChange={e => handleFilterChange('endDate', e.target.value)}
                                    />
                                    <Calendar size={14} className="form-suffix-icon form-calendar-icon" />
                                  </div>
                                </div>
                              </div>
                              <div className="form-item">
                                <label className="form-label">车辆存放地</label>
                                <div className="form-input-wrapper">
                                  <select
                                    className="form-input form-select"
                                    value={searchFilters.storageLocation}
                                    onChange={e => handleFilterChange('storageLocation', e.target.value)}
                                  >
                                    <option value="">全部</option>
                                    <option value="本店仓库">本店仓库</option>
                                  </select>
                                  <ChevronDown size={12} className="form-suffix-icon" />
                                </div>
                              </div>
                              <div className="form-actions-inline">
                                <button
                                  type="button"
                                  className="btn btn-text inventory-expand-button"
                                  onClick={() => setFilterExpanded(prev => !prev)}
                                >
                                  {filterExpanded ? '收起' : '展开'}
                                  <ChevronDown size={12} className={filterExpanded ? 'inventory-expand-icon expanded' : 'inventory-expand-icon'} />
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSearch}>
                                  <Search size={14} />
                                  查 询
                                </button>
                                <button type="button" className="btn btn-default" onClick={handleReset}>
                                  重 置
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
      
                        {/* List Table */}
                        <div className="table-container">
                          <div className="table-header">
                            <div className="table-title">库存列表</div>
                            <div className="table-actions">
                              <button className="btn">
                                <Plus size={14} />
                                接车入库
                              </button>
                              <button className="btn">
                                <Plus size={14} />
                                新 增
                              </button>
                              <button className="btn">
                                <FileSpreadsheet size={14} />
                                导 入
                              </button>
                              <button className="btn">
                                <FileSpreadsheet size={14} />
                                导 出
                              </button>
                            </div>
                          </div>
                          <div className="inventory-table-selection">
                            已选择 {selectedIds.length} / {TOTAL_INVENTORY_COUNT} 条数据
                          </div>
                          <div className="table-wrapper inventory-table-wrapper">
                            <table className="inventory-table">
                              <thead>
                                <tr>
                                  <th className="inventory-col-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.length === INVENTORY_ITEMS.length && INVENTORY_ITEMS.length > 0}
                                      onChange={e => handleSelectAll(e.target.checked)}
                                    />
                                  </th>
                                  <th className="inventory-col-index">序号</th>
                                  <TableTh label="门店销售ERP号" />
                                  <TableTh label="门店名称" />
                                  <TableTh label="经营属性" />
                                  <TableTh label="VIN码" />
                                  <TableTh label="采购订单类型" />
                                  <TableTh label="库存状态" filter={false} />
                                  <TableTh label="车辆状态" />
                                  <TableTh label="SAP物料编码" />
                                  <TableTh label="物料编码" />
                                  <TableTh label="物料名称" copy />
                                  <TableTh label="品牌" sort />
                                  <TableTh label="产品系列" />
                                  <TableTh label="车系" />
                                  <TableTh label="车型编号" />
                                  <TableTh label="车型名称" />
                                  <TableTh label="年款" />
                                  <TableTh label="动力" />
                                  <TableTh label="版型" />
                                  <TableTh label="外观颜色" />
                                  <TableTh label="内饰颜色" />
                                  <TableTh label="原始进货经销商ERP号" />
                                  <TableTh label="原始进货经销商名称" />
                                  <TableTh label="入库时间" />
                                  <TableTh label="公告到期时间" />
                                  <TableTh label="生产日期" />
                                  <TableTh label="发货过账日期" />
                                  <TableTh label="车辆类型" />
                                  <TableTh label="库龄" />
                                  <TableTh label="在库库龄" />
                                  <TableTh label="发货库龄" />
                                  <TableTh label="是否寄售" />
                                  <TableTh label="是否调剂" />
                                  <th>
                                    <div className="inventory-th-content">
                                      <span>采购价格</span>
                                    </div>
                                  </th>
                                  <th>
                                    <div className="inventory-th-content">
                                      <span>指导价</span>
                                    </div>
                                  </th>
                                  <TableTh label="车辆定义" />
                                  <TableTh label="是否退车" />
                                  <TableTh label="退车时间" />
                                  <TableTh label="退车原因" />
                                  <th>
                                    <div className="inventory-th-content">
                                      <span>是否退库</span>
                                    </div>
                                  </th>
                                  <TableTh label="退库时间" />
                                  <TableTh label="退库原因" />
                                  <TableTh label="退库单号" />
                                  <TableTh label="车辆存放地" />
                                  <TableTh label="车辆存放地-细分" />
                                  <TableTh label="二网名称" />
                                  <TableTh label="采购类型" />
                                  <th>
                                    <div className="inventory-th-content">
                                      <span>供应商名称</span>
                                    </div>
                                  </th>
                                  <TableTh label="审批状态" />
                                  <TableTh label="修改原因" />
                                  <TableTh label="退回原因" />
                                  <th className="inventory-col-actions">
                                    <div className="inventory-th-content">
                                      <span>操作</span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {INVENTORY_ITEMS.map((item, index) => (
                                  <tr key={item.id}>
                                    <td className="inventory-col-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={e => handleSelectRow(item.id, e.target.checked)}
                                      />
                                    </td>
                                    <td className="inventory-col-index">{index + 1}</td>
                                    <td>{item.storeErpNo}</td>
                                    <td>{item.storeName}</td>
                                    <td><TagGreen>{item.businessAttribute}</TagGreen></td>
                                    <td className="inventory-col-vin">{item.vin}</td>
                                    <td><TagGreen>{item.purchaseOrderType}</TagGreen></td>
                                    <td><TagGreen>{item.inventoryStatus}</TagGreen></td>
                                    <td><TagGreen>{item.vehicleStatus}</TagGreen></td>
                                    <td>{item.sapMaterialCode}</td>
                                    <td>{item.materialCode}</td>
                                    <td className="inventory-col-material-name" title={item.materialName}>{item.materialName}</td>
                                    <td><TagGreen>{item.brand}</TagGreen></td>
                                    <td>{item.productSeries}</td>
                                    <td>{item.carSeries}</td>
                                    <td>{item.modelCode}</td>
                                    <td>{item.modelName}</td>
                                    <td>{item.yearModel}</td>
                                    <td>{item.powertrain}</td>
                                    <td>{item.trim}</td>
                                    <td>{item.exteriorColor}</td>
                                    <td>{item.interiorColor}</td>
                                    <td>{item.originalDealerErpNo}</td>
                                    <td className="inventory-col-dealer-name" title={item.originalDealerName}>{item.originalDealerName}</td>
                                    <td>{item.inboundTime}</td>
                                    <td>{item.announcementExpiryDate}</td>
                                    <td>{item.productionDate}</td>
                                    <td>{item.shippingPostingDate}</td>
                                    <td><TagGreen>{item.vehicleType}</TagGreen></td>
                                    <td>{item.inventoryAge}</td>
                                    <td>{item.inStockAge}</td>
                                    <td>{item.shippingAge}</td>
                                    <td><TagRed>{item.isConsignment}</TagRed></td>
                                    <td><TagRed>{item.isAdjustment}</TagRed></td>
                                    <td>{formatPrice(item.purchasePrice)}</td>
                                    <td>{formatPrice(item.guidePrice)}</td>
                                    <td>{item.vehicleDefinition}</td>
                                    <td><TagRed>{item.isReturn}</TagRed></td>
                                    <td>{item.returnTime}</td>
                                    <td>{item.returnReason}</td>
                                    <td><TagRed>{item.isWarehouseReturn}</TagRed></td>
                                    <td>{item.warehouseReturnTime}</td>
                                    <td>{item.warehouseReturnReason}</td>
                                    <td>{item.warehouseReturnNo}</td>
                                    <td><TagGreen>{item.storageLocation}</TagGreen></td>
                                    <td><TagGreen>{item.storageLocationDetail}</TagGreen></td>
                                    <td>{item.secondaryNetworkName}</td>
                                    <td>{item.purchaseType}</td>
                                    <td className="inventory-col-supplier" title={item.supplierName}>{item.supplierName}</td>
                                    <td>{item.approvalStatus}</td>
                                    <td>{item.modifyReason}</td>
                                    <td>{item.rejectReason}</td>
                                    <td className="inventory-col-actions">
                                      <button type="button" className="btn btn-link" onClick={() => handleEdit(item)}>编辑</button>
                                      <button type="button" className="btn btn-link">更新</button>
                                      <button type="button" className="btn btn-link">申请编辑</button>
                                      <button type="button" className="btn btn-link">审计日志</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {/* Pagination */}
                          <div className="pagination">
                            <span className="pagination-info">共 {TOTAL_INVENTORY_COUNT.toLocaleString('en-US')} 项</span>
                            <button className="pagination-item pagination-disabled">&lt;</button>
                            <button className="pagination-item active">1</button>
                            <button className="pagination-item">2</button>
                            <button className="pagination-item">3</button>
                            <button className="pagination-item">...</button>
                            <button className="pagination-item">12</button>
                            <button className="pagination-item">&gt;</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="edit-page">
                        <h1 className="edit-page-title">编辑库存信息</h1>
      
                        <div className="edit-form-card">
                          <div className="edit-form-grid">
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">门店销售ERP号</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.storeErpNo} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">门店名称</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.storeName} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">VIN码</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.vin} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">采购订单类型</label>
                              <div className="edit-form-input-wrapper">
                                <select
                                  className="edit-form-input edit-form-select"
                                  value={editForm.purchaseOrderType}
                                  onChange={e => handleFormChange('purchaseOrderType', e.target.value)}
                                >
                                  <option value="客户订单">客户订单</option>
                                  <option value="库存订单">库存订单</option>
                                  <option value="试驾车订单">试驾车订单</option>
                                </select>
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">SAP物料编码</label>
                              <div className="edit-form-input-wrapper">
                                <input
                                  type="text"
                                  className="edit-form-input edit-form-input-with-suffix"
                                  value={editForm.sapMaterialCode}
                                  onChange={e => handleFormChange('sapMaterialCode', e.target.value)}
                                />
                                <Search size={14} className="edit-form-suffix-icon edit-form-search-icon" />
                              </div>
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">物料编码</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.materialCode} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">物料名称</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.materialName} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">品牌</label>
                              <div className="edit-form-input-wrapper">
                                <input type="text" className="edit-form-input edit-form-input-disabled edit-form-input-with-suffix" value={editForm.brand} readOnly />
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">产品系列</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.productSeries} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">车系</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.carSeries} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">车型编号</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.modelCode} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">车型名称</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.modelName} readOnly />
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">年款</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.yearModel} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">动总</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.powertrain} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">版型</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.trim} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">外观颜色</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.exteriorColor} readOnly />
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">内饰颜色</label>
                              <input type="text" className="edit-form-input edit-form-input-disabled" value={editForm.interiorColor} readOnly />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">原始进货经销商ERP号</label>
                              <input
                                type="text"
                                className="edit-form-input"
                                value={editForm.originalDealerErpNo}
                                onChange={e => handleFormChange('originalDealerErpNo', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">原始进货经销商名称</label>
                              <input
                                type="text"
                                className="edit-form-input"
                                value={editForm.originalDealerName}
                                onChange={e => handleFormChange('originalDealerName', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label">公告到期时间</label>
                              <div className="edit-form-input-wrapper">
                                <input
                                  type="text"
                                  className="edit-form-input edit-form-input-with-suffix"
                                  placeholder="请选择公告到期时间"
                                  value={editForm.announcementExpiryDate}
                                  onChange={e => handleFormChange('announcementExpiryDate', e.target.value)}
                                />
                                <Calendar size={14} className="edit-form-suffix-icon edit-form-calendar-icon" />
                              </div>
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">生产日期</label>
                              <div className="edit-form-input-wrapper">
                                <input
                                  type="text"
                                  className="edit-form-input edit-form-input-with-suffix"
                                  value={editForm.productionDate}
                                  onChange={e => handleFormChange('productionDate', e.target.value)}
                                />
                                <Calendar size={14} className="edit-form-suffix-icon edit-form-calendar-icon" />
                              </div>
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">发货过账日期</label>
                              <div className="edit-form-input-wrapper">
                                <input
                                  type="text"
                                  className="edit-form-input edit-form-input-with-suffix"
                                  value={editForm.shippingPostingDate}
                                  onChange={e => handleFormChange('shippingPostingDate', e.target.value)}
                                />
                                <Calendar size={14} className="edit-form-suffix-icon edit-form-calendar-icon" />
                              </div>
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">车辆类型</label>
                              <div className="edit-form-input-wrapper">
                                <select
                                  className="edit-form-input edit-form-select"
                                  value={editForm.vehicleType}
                                  onChange={e => handleFormChange('vehicleType', e.target.value)}
                                >
                                  <option value="商品车">商品车</option>
                                  <option value="试驾车">试驾车</option>
                                  <option value="展车">展车</option>
                                </select>
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">是否寄售</label>
                              <div className="edit-form-input-wrapper">
                                <select
                                  className="edit-form-input edit-form-select"
                                  value={editForm.isConsignment}
                                  onChange={e => handleFormChange('isConsignment', e.target.value)}
                                >
                                  <option value="否">否</option>
                                  <option value="是">是</option>
                                </select>
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
      
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">是否调剂</label>
                              <div className="edit-form-input-wrapper">
                                <select
                                  className="edit-form-input edit-form-select"
                                  value={editForm.isAdjustment}
                                  onChange={e => handleFormChange('isAdjustment', e.target.value)}
                                >
                                  <option value="否">否</option>
                                  <option value="是">是</option>
                                </select>
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">采购价格</label>
                              <input
                                type="text"
                                className="edit-form-input"
                                value={editForm.purchasePrice}
                                onChange={e => handleFormChange('purchasePrice', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">指导价</label>
                              <input
                                type="text"
                                className="edit-form-input"
                                value={editForm.guidePrice}
                                onChange={e => handleFormChange('guidePrice', e.target.value)}
                              />
                            </div>
                            <div className="edit-form-item">
                              <label className="edit-form-label edit-form-label-required">车辆定义</label>
                              <div className="edit-form-input-wrapper">
                                <select
                                  className="edit-form-input edit-form-select"
                                  value={editForm.vehicleDefinition}
                                  onChange={e => handleFormChange('vehicleDefinition', e.target.value)}
                                >
                                  <option value="常规车">常规车</option>
                                  <option value="冰雹车">冰雹车</option>
                                  <option value="超期车">超期车</option>
                                  <option value="外采车">外采车</option>
                                  <option value="公告到期车">公告到期车</option>
                                  <option value="虚传车">虚传车</option>
                                  <option value="政策到期车">政策到期车</option>
                                  <option value="其他">其他</option>
                                </select>
                                <ChevronDown size={12} className="edit-form-suffix-icon" />
                              </div>
                            </div>
                          </div>
                        </div>
      
                        <div className="edit-footer-actions">
                          <button type="button" className="edit-footer-btn edit-footer-btn-cancel" onClick={handleCancel}>
                            返回
                          </button>
                          <button type="button" className="edit-footer-btn edit-footer-btn-confirm" onClick={handleSave}>
                            确定
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </main>
              </div>
            </div>
          </>
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        options={{
          currentPageId: (() => {
            const hashPageId = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('page');
            const searchPageId = new URLSearchParams(window.location.search.replace(/^\?/, '')).get('page');
            const pageId = hashPageId || searchPageId;
            return typeof pageId === 'string' && /^[a-z0-9-]+$/u.test(pageId)
              ? pageId
              : "inventory-manage";
          })(),
          onDirectoryRoute: (node) => {
            if (typeof node.route === 'string' && /^[a-z0-9-]+$/u.test(node.route)) {
              window.location.hash = `page=${node.route}`;
            }
          },
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

export default Component