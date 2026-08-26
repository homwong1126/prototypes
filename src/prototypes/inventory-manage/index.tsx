/**
 * @name 库存管理
 * @mode axure
 *
 * 盈丰运营管理平台 - 库存管理页面
 * 用于管理车辆库存信息，包括主列表页和编辑页
 */
import React, { useState } from 'react'
import { ChevronDown, Plus, FileSpreadsheet, Search, Filter } from 'lucide-react'
import './style.css'

// ─── 类型定义 ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: number
  vin: string
  materialCode: string
  sapMaterialCode: string
  storeName: string
  secondaryNetworkName: string
  inventoryAge: string
  inboundDate: string
}

interface EditFormData {
  vin: string
  materialCode: string
  sapMaterialCode: string
  materialName: string
  storeErpNo: string
  storeName: string
  secondaryNetworkName: string
  salesConsultant: string
  vehicleColor: string
  interiorColor: string
  guidePrice: string
  actualPrice: string
  inventoryStatus: string
  inventoryAge: string
  inboundDate: string
  expectedOutboundDate: string
  remarks: string
}

// ─── 示例数据 ────────────────────────────────────────────────────────────────

const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 1,
    vin: 'LSVAA4186KS123456',
    materialCode: 'MAT001',
    sapMaterialCode: 'SAP001',
    storeName: '北京盈丰4S店',
    secondaryNetworkName: '-',
    inventoryAge: '15天',
    inboundDate: '2024-01-15',
  },
  {
    id: 2,
    vin: 'LSVAA4186KS123457',
    materialCode: 'MAT002',
    sapMaterialCode: 'SAP002',
    storeName: '上海盈丰4S店',
    secondaryNetworkName: '上海二网A',
    inventoryAge: '30天',
    inboundDate: '2024-01-01',
  },
  {
    id: 3,
    vin: 'LSVAA4186KS123458',
    materialCode: 'MAT003',
    sapMaterialCode: 'SAP003',
    storeName: '广州盈丰4S店',
    secondaryNetworkName: '-',
    inventoryAge: '7天',
    inboundDate: '2024-01-23',
  },
]

const INITIAL_EDIT_FORM: EditFormData = {
  vin: 'LSVAA4186KS123456',
  materialCode: 'MAT001',
  sapMaterialCode: 'SAP001',
  materialName: '奇瑞瑞虎8 PLUS 1.6T 自动豪华型',
  storeErpNo: 'ERP001234',
  storeName: '北京盈丰4S店',
  secondaryNetworkName: '',
  salesConsultant: '',
  vehicleColor: '珍珠白',
  interiorColor: '黑色',
  guidePrice: '139900',
  actualPrice: '128000',
  inventoryStatus: '在库',
  inventoryAge: '15',
  inboundDate: '2024-01-15',
  expectedOutboundDate: '',
  remarks: '',
}

// ─── 组件 ───────────────────────────────────────────────────────────────────────

const Component = function InventoryManage() {
  const [currentPage, setCurrentPage] = useState<'list' | 'edit'>('list')
  const [editForm, setEditForm] = useState<EditFormData>(INITIAL_EDIT_FORM)
  const [searchFilters, setSearchFilters] = useState({
    vin: '',
    materialCode: '',
    sapMaterialCode: '',
    storeErpNo: '',
    storeName: '',
    startDate: '',
    endDate: '',
    secondaryNetworkName: '',
    inventoryAge: '',
  })

  const handleEdit = (item: InventoryItem) => {
    setEditForm({
      vin: item.vin,
      materialCode: item.materialCode,
      sapMaterialCode: item.sapMaterialCode,
      materialName: '奇瑞瑞虎8 PLUS 1.6T 自动豪华型',
      storeErpNo: 'ERP001234',
      storeName: item.storeName,
      secondaryNetworkName: item.secondaryNetworkName === '-' ? '' : item.secondaryNetworkName,
      salesConsultant: '',
      vehicleColor: '珍珠白',
      interiorColor: '黑色',
      guidePrice: '139900',
      actualPrice: '128000',
      inventoryStatus: '在库',
      inventoryAge: item.inventoryAge.replace('天', ''),
      inboundDate: item.inboundDate,
      expectedOutboundDate: '',
      remarks: '',
    })
    setCurrentPage('edit')
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
      storeErpNo: '',
      storeName: '',
      startDate: '',
      endDate: '',
      secondaryNetworkName: '',
      inventoryAge: '',
    })
  }

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  return (
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
          <main className="content-area">
            {/* Breadcrumb */}
            <div className="breadcrumb">
              <span className="breadcrumb-item active">
                {currentPage === 'list' ? '库存管理/库存列表' : '库存管理/编辑库存'}
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
                          <label className="form-label">VIN码</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入VIN码，可批量查询"
                            value={searchFilters.vin}
                            onChange={e => handleFilterChange('vin', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">物料编码</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入物料编码，可批量查询"
                            value={searchFilters.materialCode}
                            onChange={e => handleFilterChange('materialCode', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">SAP物料编码</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入SAP物料编码，可批量查询"
                            value={searchFilters.sapMaterialCode}
                            onChange={e => handleFilterChange('sapMaterialCode', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">门店销售ERP号</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入门店销售ERP号"
                            value={searchFilters.storeErpNo}
                            onChange={e => handleFilterChange('storeErpNo', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">门店名称</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入门店名称"
                            value={searchFilters.storeName}
                            onChange={e => handleFilterChange('storeName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">时间范围</label>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="开始时间"
                              style={{ width: '140px' }}
                              value={searchFilters.startDate}
                              onChange={e => handleFilterChange('startDate', e.target.value)}
                            />
                            <span>至</span>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="结束时间"
                              style={{ width: '140px' }}
                              value={searchFilters.endDate}
                              onChange={e => handleFilterChange('endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-item">
                          <label className="form-label">二网名称</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入二网名称"
                            value={searchFilters.secondaryNetworkName}
                            onChange={e => handleFilterChange('secondaryNetworkName', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">在库库龄≥</label>
                          <input
                            type="number"
                            className="form-input"
                            placeholder="请输入在库库龄≥"
                            style={{ width: '120px' }}
                            value={searchFilters.inventoryAge}
                            onChange={e => handleFilterChange('inventoryAge', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="button" className="btn btn-text">展开</button>
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
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>VIN码</th>
                            <th>物料编码</th>
                            <th>SAP物料编码</th>
                            <th>门店名称</th>
                            <th>二网名称</th>
                            <th>在库库龄</th>
                            <th>入库时间</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {INVENTORY_ITEMS.map((item) => (
                            <tr key={item.id}>
                              <td>{item.vin}</td>
                              <td>{item.materialCode}</td>
                              <td>{item.sapMaterialCode}</td>
                              <td>{item.storeName}</td>
                              <td>{item.secondaryNetworkName}</td>
                              <td>{item.inventoryAge}</td>
                              <td>{item.inboundDate}</td>
                              <td>
                                <button className="btn btn-link" onClick={() => handleEdit(item)}>编辑</button>
                                <button className="btn btn-link">更新</button>
                                <button className="btn btn-link">申请编辑</button>
                                <button className="btn btn-link">审计日志</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="pagination">
                      <span className="pagination-info">共 120 项</span>
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
                // 编辑页面
                <>
                  {/* Edit Form */}
                  <div className="card">
                    <div className="form-section">
                      <div className="form-section-title">基本信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label form-label-required">VIN码</label>
                          <input
                            type="text"
                            className="form-input form-input-disabled"
                            value={editForm.vin}
                            readOnly
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label form-label-required">物料编码</label>
                          <input
                            type="text"
                            className="form-input form-input-disabled"
                            value={editForm.materialCode}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label form-label-required">SAP物料编码</label>
                          <input
                            type="text"
                            className="form-input form-input-disabled"
                            value={editForm.sapMaterialCode}
                            readOnly
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">物料名称</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editForm.materialName}
                            onChange={e => handleFormChange('materialName', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">门店信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label form-label-required">门店销售ERP号</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editForm.storeErpNo}
                            onChange={e => handleFormChange('storeErpNo', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label form-label-required">门店名称</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editForm.storeName}
                            onChange={e => handleFormChange('storeName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">二网名称</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入二网名称"
                            value={editForm.secondaryNetworkName}
                            onChange={e => handleFormChange('secondaryNetworkName', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">销售顾问</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请输入销售顾问"
                            value={editForm.salesConsultant}
                            onChange={e => handleFormChange('salesConsultant', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">车辆信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">车辆颜色</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editForm.vehicleColor}
                            onChange={e => handleFormChange('vehicleColor', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">内饰颜色</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editForm.interiorColor}
                            onChange={e => handleFormChange('interiorColor', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">指导价</label>
                          <input
                            type="number"
                            className="form-input"
                            value={editForm.guidePrice}
                            onChange={e => handleFormChange('guidePrice', e.target.value)}
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">实际售价</label>
                          <input
                            type="number"
                            className="form-input"
                            value={editForm.actualPrice}
                            onChange={e => handleFormChange('actualPrice', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">库存状态</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label form-label-required">库存状态</label>
                          <select
                            className="form-input"
                            value={editForm.inventoryStatus}
                            onChange={e => handleFormChange('inventoryStatus', e.target.value)}
                          >
                            <option value="在库">在库</option>
                            <option value="已售">已售</option>
                            <option value="调拨中">调拨中</option>
                          </select>
                        </div>
                        <div className="form-item">
                          <label className="form-label">在库库龄</label>
                          <input
                            type="number"
                            className="form-input form-input-disabled"
                            value={editForm.inventoryAge}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">入库时间</label>
                          <input
                            type="text"
                            className="form-input form-input-disabled"
                            value={editForm.inboundDate}
                            readOnly
                          />
                        </div>
                        <div className="form-item">
                          <label className="form-label">预计出库时间</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="请选择预计出库时间"
                            value={editForm.expectedOutboundDate}
                            onChange={e => handleFormChange('expectedOutboundDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-section-title">备注信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">备注</label>
                          <textarea
                            className="form-textarea"
                            placeholder="请输入备注信息"
                            value={editForm.remarks}
                            onChange={e => handleFormChange('remarks', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="footer-actions">
                    <button className="footer-btn footer-btn-cancel" onClick={handleCancel}>
                      返回
                    </button>
                    <button className="footer-btn footer-btn-save" onClick={handleSave}>
                      保存
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default Component