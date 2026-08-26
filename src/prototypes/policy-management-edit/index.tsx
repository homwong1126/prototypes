/**
 * @name 政策管理编辑
 * @mode axure
 *
 * 大客户营销平台 - 政策管理编辑页面
 * 用于编辑和管理政策信息，包括政策基本信息和车型信息
 */
import React, { useState } from 'react'
import { ChevronDown, Plus, FileSpreadsheet, Trash2 } from 'lucide-react'
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
  verificationAmount: string
  endDate: string
}

interface PolicyBasicInfo {
  policyNo: string
  year: string
  month: string
}

interface PolicyListItem {
  id: number
  policyNo: string
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
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
    verificationAmount: '',
    endDate: '',
  },
]

const INITIAL_POLICY_INFO: PolicyBasicInfo = {
  policyNo: '常规车',
  year: '',
  month: '',
}

const POLICY_LIST: PolicyListItem[] = [
  {
    id: 1,
    policyNo: '常规车',
    year: '2025',
    month: '1',
    createTime: '2025-01-15 10:30:00',
    status: '已生效',
  },
  {
    id: 2,
    policyNo: '常规车',
    year: '2025',
    month: '2',
    createTime: '2025-02-15 10:30:00',
    status: '已生效',
  },
  {
    id: 3,
    policyNo: '非常规车',
    year: '2025',
    month: '1',
    createTime: '2025-01-20 14:20:00',
    status: '草稿',
  },
  {
    id: 4,
    policyNo: '常规车',
    year: '2024',
    month: '12',
    createTime: '2024-12-15 10:30:00',
    status: '已失效',
  },
]

// ─── 组件 ───────────────────────────────────────────────────────────────────────

const Component = function PolicyManagementEdit() {
  const [currentPage, setCurrentPage] = useState<'list' | 'rules'>('list')
  const [activeMenu, setActiveMenu] = useState('list')
  const [policyInfo, setPolicyInfo] = useState<PolicyBasicInfo>(INITIAL_POLICY_INFO)
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>(VEHICLE_MODELS)
  const [filterPolicyNo, setFilterPolicyNo] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterMonth, setFilterMonth] = useState('')

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
      policyNo: policy.policyNo,
      year: policy.year,
      month: policy.month,
    })
    setCurrentPage('rules')
    setActiveMenu('rules')
  }

  const handleDeleteModel = (id: number) => {
    setVehicleModels(prev => prev.filter(model => model.id !== id))
  }

  const handleAddModel = () => {
    const newId = Math.max(...vehicleModels.map(m => m.id), 0) + 1
    setVehicleModels(prev => [
      ...prev,
      {
        id: newId,
        brand: '',
        level: '',
        modelCode: '',
        modelName: '',
        yearCode: '',
        yearName: '',
        powertrainCode: '',
        powertrainName: '',
        versionCode: '',
        versionName: '',
        verificationAmount: '',
        endDate: '',
      },
    ])
  }

  const handleModelChange = (id: number, field: keyof VehicleModel, value: string) => {
    setVehicleModels(prev =>
      prev.map(model =>
        model.id === id ? { ...model, [field]: value } : model
      )
    )
  }

  const handleSave = () => {
    console.log('保存政策信息:', policyInfo)
    console.log('保存车型信息:', vehicleModels)
    alert('保存成功')
  }

  const handleBack = () => {
    console.log('返回')
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
                    <div className="submenu-item">限价申请</div>
                    <div className="submenu-item">用户管理</div>
                    <div className="submenu-item">资质审核</div>
                    <div className="submenu-item">优惠券核销</div>
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
                    {currentPage === 'list' ? '限价管理/限价列表' : '限价管理/限价规则'}
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
                              <label className="form-label">政策编号</label>
                              <select
                                className="form-input"
                                value={filterPolicyNo}
                                onChange={e => setFilterPolicyNo(e.target.value)}
                              >
                                <option value="">全部</option>
                                <option value="常规车">常规车</option>
                                <option value="非常规车">非常规车</option>
                              </select>
                            </div>
                            <div className="form-item">
                              <label className="form-label">年</label>
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
                              <label className="form-label">月</label>
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
                            <button className="btn">
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
                                <th>政策编号</th>
                                <th>年</th>
                                <th>月</th>
                                <th>创建时间</th>
                                <th>状态</th>
                                <th>操作</th>
                              </tr>
                            </thead>
                            <tbody>
                              {POLICY_LIST
                                .filter(item =>
                                  (filterPolicyNo === '' || item.policyNo === filterPolicyNo) &&
                                  (filterYear === '' || item.year === filterYear) &&
                                  (filterMonth === '' || item.month === filterMonth)
                                )
                                .map((item, index) => (
                                  <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.policyNo}</td>
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
                    // 规则编辑页面
                    <>
                      {/* Basic Info Card */}
                      <div className="card">
                    <div className="form-section">
                      <div className="form-section-title">限价基本信息</div>
                      <div className="form-row">
                        <div className="form-item">
                          <label className="form-label">限价类型</label>
                          <select
                            className="form-input"
                            value={policyInfo.policyNo}
                            onChange={e => setPolicyInfo(prev => ({ ...prev, policyNo: e.target.value }))}
                          >
                            <option value="常规车">常规车</option>
                            <option value="非常规车">非常规车</option>
                          </select>
                        </div>
                        <div className="form-item">
                          <label className="form-label">年</label>
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
                          <label className="form-label">月</label>
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
                            <th className="required">核销金额</th>
                            <th className="required">终止日期</th>
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
                                  value={model.verificationAmount}
                                  onChange={e => handleModelChange(model.id, 'verificationAmount', e.target.value)}
                                />
                              </td>
                              <td>
                                <input
                                  type="text"
                                  className="table-input"
                                  value={model.endDate}
                                  onChange={e => handleModelChange(model.id, 'endDate', e.target.value)}
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
                    <button className="footer-btn footer-btn-save" onClick={handleSave}>
                      保存
                    </button>
                  </div>
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
      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
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