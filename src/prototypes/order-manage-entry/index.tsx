/**
 * @name 订单管理录入
 * @mode axure
 *
 * 订单管理 - 订单录入高保真原型
 * 基于截图还原：基本信息 / 订单信息 两大卡片，4 列网格布局
 * 新增必填项：订单毛利后「预估综合毛利」— 仅整数、可负、不可小数
 */
import React, { useState } from 'react'
import { ChevronDown, Search, Calendar, Save, Plus, Upload, AlertTriangle, X, Edit3, FileText, CornerDownLeft } from 'lucide-react'
import './style.css'
import { AnnotationViewer, type AnnotationSourceDocument } from '@axhub/annotation'
import annotationSourceDocument from './annotation-source.json'

interface InvoiceForm {
  invoiceDate: string
  newCarRevenueTaxIncluded: string
  newCarRevenueTaxRate: string
  newCarRevenueTaxExcluded: string
  salesDiscountTaxIncluded: string
  storeRebateTaxIncluded: string
  hasLocalSubsidy: string
  subsidyRegion: string
  subsidyAmount: string
  invoiceBuyer: string
  invoiceRemark: string
  invoiceAmountTaxIncluded: string
  invoiceAmountTaxRate: string
  invoiceAmountTaxExcluded: string
  currentPriceTaxExcluded: string
  attachments: { id: number; name: string }[]
}

interface OrderEntryForm {
  // 基本信息 - 客户信息
  customerName: string
  contactMethod: string
  customerType: string
  salesConsultant: string
  idType: string
  idNumber: string
  brand: string
  series: string
  // 车辆
  model: string
  version: string
  exteriorColor: string
  interior: string
  guidePrice: string
  negotiatedPrice: string
  // 订单信息
  orderChannel: string
  orderType: string
  projectName: string
  secondaryNetwork: string
  orderDate: string
  expectedInvoiceDate: string
  contractNo: string
  contractAmount: string
  deposit: string
  depositDate: string
  collectedUninvoiced: string
  paymentMethod: string
  // 单车成交价区域
  singlePrice: string
  singlePriceTaxIncluded: string
  singlePriceTaxRate: string
  singlePriceTaxExcluded: string
  // 毛利区域
  orderGrossProfit: string
  estimatedComprehensiveGrossProfit: string
  vehicleGrossProfit: string
  salesGrossProfit: string
  isTestDrive: string
  testDrivePerson: string
}

const INITIAL_INVOICE_FORM: InvoiceForm = {
  invoiceDate: '2026-09-01',
  newCarRevenueTaxIncluded: '92,696',
  newCarRevenueTaxRate: '13%',
  newCarRevenueTaxExcluded: '82,031.86',
  salesDiscountTaxIncluded: '',
  storeRebateTaxIncluded: '',
  hasLocalSubsidy: '是',
  subsidyRegion: '',
  subsidyAmount: '',
  invoiceBuyer: '广东星势力企业管理咨询有限公司',
  invoiceRemark: '',
  invoiceAmountTaxIncluded: '92,696',
  invoiceAmountTaxRate: '13%',
  invoiceAmountTaxExcluded: '82,031.86',
  currentPriceTaxExcluded: '2,000',
  attachments: [
    { id: 1, name: '发票1.jpg' },
    { id: 2, name: '发票2.jpg' },
  ],
}

const INITIAL_FORM: OrderEntryForm = {
  customerName: '',
  contactMethod: '',
  customerType: '',
  salesConsultant: '',
  idType: '身份证',
  idNumber: '',
  brand: '',
  series: '',
  model: '',
  version: '',
  exteriorColor: '',
  interior: '',
  guidePrice: '',
  negotiatedPrice: '',
  orderChannel: '本店零售订单',
  orderType: '',
  projectName: '',
  secondaryNetwork: '',
  orderDate: '',
  expectedInvoiceDate: '',
  contractNo: '',
  contractAmount: '',
  deposit: '',
  depositDate: '',
  collectedUninvoiced: '',
  paymentMethod: '',
  singlePrice: '',
  singlePriceTaxIncluded: '0',
  singlePriceTaxRate: '13%',
  singlePriceTaxExcluded: '0.00',
  orderGrossProfit: '0',
  estimatedComprehensiveGrossProfit: '',
  vehicleGrossProfit: '0',
  salesGrossProfit: '0',
  isTestDrive: '',
  testDrivePerson: '',
}

const Component = function OrderManageEntry() {
  const [form, setForm] = useState<OrderEntryForm>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof OrderEntryForm, string>>>({})
  const [toast, setToast] = useState<string | null>(null)

  // ─── 新车开票 ─────────────────────────────────────────────────────────────
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(INITIAL_INVOICE_FORM)
  const [invoiceEditing, setInvoiceEditing] = useState(false)
  const [hasPendingPriceLimit, setHasPendingPriceLimit] = useState(true)
  const [showPriceLimitModal, setShowPriceLimitModal] = useState(false)
  const [nextAttachmentId, setNextAttachmentId] = useState(3)

  const updateInvoice = (field: keyof InvoiceForm, value: string) => {
    setInvoiceForm(prev => ({ ...prev, [field]: value }))
  }

  const handleInvoiceEdit = () => {
    if (hasPendingPriceLimit) {
      setShowPriceLimitModal(true)
    } else {
      setInvoiceEditing(true)
    }
  }

  const handleInvoiceExitEdit = () => {
    setInvoiceEditing(false)
    setInvoiceForm(INITIAL_INVOICE_FORM)
  }

  const handleInvoiceSave = () => {
    const required: (keyof InvoiceForm)[] = [
      'invoiceDate',
      'newCarRevenueTaxIncluded',
      'newCarRevenueTaxRate',
      'newCarRevenueTaxExcluded',
      'hasLocalSubsidy',
      'invoiceBuyer',
      'invoiceAmountTaxIncluded',
      'invoiceAmountTaxRate',
      'invoiceAmountTaxExcluded',
      'currentPriceTaxExcluded',
    ]
    const emptyField = required.find(k => !String(invoiceForm[k] ?? '').trim())
    if (emptyField) {
      setToast('请完善新车开票必填项')
      setTimeout(() => setToast(null), 2400)
      return
    }
    if (invoiceForm.attachments.length === 0) {
      setToast('请上传发票附件')
      setTimeout(() => setToast(null), 2400)
      return
    }
    setInvoiceEditing(false)
    setToast('新车开票信息保存成功')
    setTimeout(() => setToast(null), 2400)
  }

  const handleUploadAttachment = (file: File | undefined) => {
    if (!file) return
    setInvoiceForm(prev => ({
      ...prev,
      attachments: [...prev.attachments, { id: nextAttachmentId, name: file.name }],
    }))
    setNextAttachmentId(id => id + 1)
  }

  const handleRemoveAttachment = (id: number) => {
    setInvoiceForm(prev => ({ ...prev, attachments: prev.attachments.filter(item => item.id !== id) }))
  }

  const update = (field: keyof OrderEntryForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleIntegerChange = (field: keyof OrderEntryForm, value: string) => {
    if (value === '' || /^-?\d*$/.test(value)) {
      update(field, value)
    }
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof OrderEntryForm, string>> = {}
    const required: (keyof OrderEntryForm)[] = [
      'customerName',
      'contactMethod',
      'customerType',
      'salesConsultant',
      'idType',
      'idNumber',
      'brand',
      'series',
      'model',
      'version',
      'exteriorColor',
      'interior',
      'guidePrice',
      'negotiatedPrice',
      'orderChannel',
      'orderType',
      'projectName',
      'orderDate',
      'expectedInvoiceDate',
      'contractNo',
      'contractAmount',
      'deposit',
      'depositDate',
      'collectedUninvoiced',
      'paymentMethod',
      'singlePrice',
      'singlePriceTaxIncluded',
      'singlePriceTaxRate',
      'singlePriceTaxExcluded',
      'orderGrossProfit',
      'estimatedComprehensiveGrossProfit',
      'isTestDrive',
      'testDrivePerson',
    ]
    required.forEach(k => {
      if (!String(form[k] ?? '').trim()) e[k] = '必填'
    })
    if (form.estimatedComprehensiveGrossProfit && !/^-?\d+$/.test(form.estimatedComprehensiveGrossProfit.trim())) {
      e.estimatedComprehensiveGrossProfit = '请输入整数，可为负数，不可含小数点'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      setToast('请完善必填项')
      setTimeout(() => setToast(null), 2200)
      return
    }
    console.log('保存订单录入', form)
    setToast('保存成功')
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div className="ome-container">
      <header className="ome-header">
        <div className="ome-header-left">
          <div className="ome-logo">盈丰运营管理平台</div>
          <span className="ome-header-divider" />
          <span className="ome-header-sub">订单管理 / 订单录入</span>
        </div>
        <div className="ome-header-right">
          <button className="ome-btn ome-btn-primary" onClick={handleSave}>
            <Save size={14} /> 保存
          </button>
        </div>
      </header>

      <div className="ome-main">
        <aside className="ome-sidebar">
          <div className="ome-search-box">
            <input placeholder="搜索菜单..." />
            <Search size={14} />
          </div>
          <div className="ome-menu">
            <div className="ome-menu-group">
              <div className="ome-menu-title">订单管理 <ChevronDown size={12} /></div>
              <div className="ome-menu-item active">订单录入</div>
              <div className="ome-menu-item">订单列表</div>
              <div className="ome-menu-item">订单审核</div>
            </div>
            <div className="ome-menu-group">
              <div className="ome-menu-title">库存管理</div>
            </div>
            <div className="ome-menu-group">
              <div className="ome-menu-title">限价管理</div>
            </div>
          </div>
        </aside>

        <main className="ome-content">
          <div className="ome-breadcrumb">
            <span>订单管理</span>
            <span className="ome-bc-sep">/</span>
            <span className="active">订单录入</span>
          </div>

          <div className="ome-page">
            {/* 基本信息 */}
            <div className="ome-card">
              <div className="ome-card-hd" onClick={() => {}}>
                <span className="ome-collapse-arrow">▾</span>
                <span className="ome-card-title">基本信息</span>
              </div>

              <div className="ome-section">
                <div className="ome-section-label">客户信息</div>
                <div className="ome-grid">
                  <div className="ome-field">
                    <label className="ome-label required">客户姓名</label>
                    <input className={`ome-input ${errors.customerName ? 'ome-input-error' : ''}`} placeholder="请填入客户姓名" value={form.customerName} onChange={e => update('customerName', e.target.value)} />
                    {errors.customerName && <span className="ome-err">{errors.customerName}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">联系方式</label>
                    <input className={`ome-input ${errors.contactMethod ? 'ome-input-error' : ''}`} placeholder="请填入联系方式" value={form.contactMethod} onChange={e => update('contactMethod', e.target.value)} />
                    {errors.contactMethod && <span className="ome-err">{errors.contactMethod}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">客户类型</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.customerType ? 'ome-input-error' : ''}`} value={form.customerType} onChange={e => update('customerType', e.target.value)}>
                        <option value="">请选择客户类型</option>
                        <option value="个人">个人</option>
                        <option value="企业">企业</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.customerType && <span className="ome-err">{errors.customerType}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">销售顾问姓名</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.salesConsultant ? 'ome-input-error' : ''}`} value={form.salesConsultant} onChange={e => update('salesConsultant', e.target.value)}>
                        <option value="">请选择销售顾问</option>
                        <option value="张三">张三</option>
                        <option value="李四">李四</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.salesConsultant && <span className="ome-err">{errors.salesConsultant}</span>}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">证件类型</label>
                    <div className="ome-select-wrap">
                      <select className="ome-input ome-select" value={form.idType} onChange={e => update('idType', e.target.value)}>
                        <option value="身份证">身份证</option>
                        <option value="护照">护照</option>
                        <option value="营业执照">营业执照</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">证件号码</label>
                    <input className={`ome-input ${errors.idNumber ? 'ome-input-error' : ''}`} placeholder="请填入证件号码" value={form.idNumber} onChange={e => update('idNumber', e.target.value)} />
                    {errors.idNumber && <span className="ome-err">{errors.idNumber}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">品牌</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.brand ? 'ome-input-error' : ''}`} value={form.brand} onChange={e => update('brand', e.target.value)}>
                        <option value="">请选择品牌</option>
                        <option value="奇瑞">奇瑞</option>
                        <option value="捷途">捷途</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.brand && <span className="ome-err">{errors.brand}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">车系</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.series ? 'ome-input-error' : ''}`} value={form.series} onChange={e => update('series', e.target.value)}>
                        <option value="">请选择车系</option>
                        <option value="瑞虎8">瑞虎8</option>
                        <option value="艾瑞泽8">艾瑞泽8</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.series && <span className="ome-err">{errors.series}</span>}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">车型</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.model ? 'ome-input-error' : ''}`} value={form.model} onChange={e => update('model', e.target.value)}>
                        <option value="">请选择车型</option>
                        <option value="瑞虎8 PRO">瑞虎8 PRO</option>
                        <option value="艾瑞泽8 PRO">艾瑞泽8 PRO</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.model && <span className="ome-err">{errors.model}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">版本</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.version ? 'ome-input-error' : ''}`} value={form.version} onChange={e => update('version', e.target.value)}>
                        <option value="">请选择版本</option>
                        <option value="尊贵型">尊贵型</option>
                        <option value="豪华型">豪华型</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.version && <span className="ome-err">{errors.version}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">外观颜色</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.exteriorColor ? 'ome-input-error' : ''}`} value={form.exteriorColor} onChange={e => update('exteriorColor', e.target.value)}>
                        <option value="">请选择外观颜色</option>
                        <option value="珍珠白">珍珠白</option>
                        <option value="星空黑">星空黑</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.exteriorColor && <span className="ome-err">{errors.exteriorColor}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">内饰</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.interior ? 'ome-input-error' : ''}`} value={form.interior} onChange={e => update('interior', e.target.value)}>
                        <option value="">请选择内饰</option>
                        <option value="黑棕">黑棕</option>
                        <option value="纯黑">纯黑</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.interior && <span className="ome-err">{errors.interior}</span>}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">指导价</label>
                    <input className={`ome-input ${errors.guidePrice ? 'ome-input-error' : ''}`} placeholder="请输入指导价" value={form.guidePrice} onChange={e => update('guidePrice', e.target.value)} />
                    {errors.guidePrice && <span className="ome-err">{errors.guidePrice}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">议价结果（含税）</label>
                    <input className={`ome-input ${errors.negotiatedPrice ? 'ome-input-error' : ''}`} placeholder="请输入议价结果（含税）" value={form.negotiatedPrice} onChange={e => update('negotiatedPrice', e.target.value)} />
                    {errors.negotiatedPrice && <span className="ome-err">{errors.negotiatedPrice}</span>}
                  </div>
                  <div className="ome-field empty" />
                  <div className="ome-field empty" />
                </div>
              </div>
            </div>

            {/* 订单信息 */}
            <div className="ome-card">
              <div className="ome-section">
                <div className="ome-section-label">订单信息</div>
                <div className="ome-grid">
                  <div className="ome-field">
                    <label className="ome-label required">订单渠道</label>
                    <div className="ome-select-wrap">
                      <select className="ome-input ome-select" value={form.orderChannel} onChange={e => update('orderChannel', e.target.value)}>
                        <option value="本店零售订单">本店零售订单</option>
                        <option value="二网订单">二网订单</option>
                        <option value="大客户订单">大客户订单</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">订单类型</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.orderType ? 'ome-input-error' : ''}`} value={form.orderType} onChange={e => update('orderType', e.target.value)}>
                        <option value="">请选择订单类型</option>
                        <option value="正常订单">正常订单</option>
                        <option value="预订单">预订单</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.orderType && <span className="ome-err">{errors.orderType}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">项目名称</label>
                    <div className="ome-input-with-icon">
                      <input className={`ome-input ${errors.projectName ? 'ome-input-error' : ''}`} placeholder="请选择项目名称" value={form.projectName} onChange={e => update('projectName', e.target.value)} />
                      <Search size={12} className="ome-input-icon" />
                    </div>
                    {errors.projectName && <span className="ome-err">{errors.projectName}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">二级/直营店名称</label>
                    <input className="ome-input" placeholder="请输入二级/直营店名称" value={form.secondaryNetwork} onChange={e => update('secondaryNetwork', e.target.value)} />
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">订单日期</label>
                    <div className="ome-input-with-icon">
                      <input className={`ome-input ${errors.orderDate ? 'ome-input-error' : ''}`} placeholder="请选择订单日期" value={form.orderDate} onChange={e => update('orderDate', e.target.value)} />
                      <Calendar size={12} className="ome-input-icon muted" />
                    </div>
                    {errors.orderDate && <span className="ome-err">{errors.orderDate}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">预计开票日期</label>
                    <div className="ome-input-with-icon">
                      <input className={`ome-input ${errors.expectedInvoiceDate ? 'ome-input-error' : ''}`} placeholder="请选择预计开票日期" value={form.expectedInvoiceDate} onChange={e => update('expectedInvoiceDate', e.target.value)} />
                      <Calendar size={12} className="ome-input-icon muted" />
                    </div>
                    {errors.expectedInvoiceDate && <span className="ome-err">{errors.expectedInvoiceDate}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">合同编号</label>
                    <input className={`ome-input ${errors.contractNo ? 'ome-input-error' : ''}`} placeholder="请输入合同编号" value={form.contractNo} onChange={e => update('contractNo', e.target.value)} />
                    {errors.contractNo && <span className="ome-err">{errors.contractNo}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">合同金额</label>
                    <input className={`ome-input ${errors.contractAmount ? 'ome-input-error' : ''}`} placeholder="请输入合同总金额" value={form.contractAmount} onChange={e => update('contractAmount', e.target.value)} />
                    {errors.contractAmount && <span className="ome-err">{errors.contractAmount}</span>}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">定金</label>
                    <input className={`ome-input ${errors.deposit ? 'ome-input-error' : ''}`} placeholder="请输入定金" value={form.deposit} onChange={e => update('deposit', e.target.value)} />
                    {errors.deposit && <span className="ome-err">{errors.deposit}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">定金日期</label>
                    <div className="ome-input-with-icon">
                      <input className={`ome-input ${errors.depositDate ? 'ome-input-error' : ''}`} placeholder="请选择定金日期" value={form.depositDate} onChange={e => update('depositDate', e.target.value)} />
                      <Calendar size={12} className="ome-input-icon muted" />
                    </div>
                    {errors.depositDate && <span className="ome-err">{errors.depositDate}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">已收未开票金额</label>
                    <input className={`ome-input ${errors.collectedUninvoiced ? 'ome-input-error' : ''}`} placeholder="请输入已收未开票金额" value={form.collectedUninvoiced} onChange={e => update('collectedUninvoiced', e.target.value)} />
                    {errors.collectedUninvoiced && <span className="ome-err">{errors.collectedUninvoiced}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">付款方式</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.paymentMethod ? 'ome-input-error' : ''}`} value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}>
                        <option value="">请选择付款方式</option>
                        <option value="全款">全款</option>
                        <option value="按揭">按揭</option>
                        <option value="融资租赁">融资租赁</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.paymentMethod && <span className="ome-err">{errors.paymentMethod}</span>}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label">单车成交价</label>
                    <input className="ome-input ome-input-readonly" placeholder="请输入单车售价" value={form.singlePrice} onChange={e => update('singlePrice', e.target.value)} />
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">单车成交价(含税)</label>
                    <input className={`ome-input ${errors.singlePriceTaxIncluded ? 'ome-input-error' : ''}`} value={form.singlePriceTaxIncluded} onChange={e => update('singlePriceTaxIncluded', e.target.value)} />
                    {errors.singlePriceTaxIncluded && <span className="ome-err">{errors.singlePriceTaxIncluded}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">单车成交价-税率</label>
                    <div className="ome-select-wrap">
                      <select className="ome-input ome-select" value={form.singlePriceTaxRate} onChange={e => update('singlePriceTaxRate', e.target.value)}>
                        <option value="13%">13%</option>
                        <option value="6%">6%</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">单车成交价(不含税)</label>
                    <input className="ome-input ome-input-readonly" value={form.singlePriceTaxExcluded} readOnly />
                  </div>

                  <div className="ome-field">
                    <label className="ome-label">订单毛利</label>
                    <input className="ome-input ome-input-readonly" value={form.orderGrossProfit} readOnly />
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">整车毛利</label>
                    <input className="ome-input ome-input-readonly" value={form.vehicleGrossProfit} readOnly />
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">销售毛利</label>
                    <input className="ome-input ome-input-readonly" value={form.salesGrossProfit} readOnly />
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">预估综合毛利</label>
                    <input
                      className={`ome-input ${errors.estimatedComprehensiveGrossProfit ? 'ome-input-error' : ''}`}
                      placeholder="请输入整数，可为负数"
                      value={form.estimatedComprehensiveGrossProfit}
                      onChange={e => handleIntegerChange('estimatedComprehensiveGrossProfit', e.target.value)}
                    />
                    {errors.estimatedComprehensiveGrossProfit && <span className="ome-err">{errors.estimatedComprehensiveGrossProfit}</span>}
                    <span className="ome-hint">仅支持整数，不可输入小数点，可为负整数</span>
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">是否试乘试驾</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.isTestDrive ? 'ome-input-error' : ''}`} value={form.isTestDrive} onChange={e => update('isTestDrive', e.target.value)}>
                        <option value="">请选择是否试乘试驾</option>
                        <option value="是">是</option>
                        <option value="否">否</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.isTestDrive && <span className="ome-err">{errors.isTestDrive}</span>}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">试乘试驾人员</label>
                    <div className="ome-select-wrap">
                      <select className={`ome-input ome-select ${errors.testDrivePerson ? 'ome-input-error' : ''}`} value={form.testDrivePerson} onChange={e => update('testDrivePerson', e.target.value)}>
                        <option value="">请选择试乘试驾人员</option>
                        <option value="张教练">张教练</option>
                        <option value="李教练">李教练</option>
                      </select>
                      <ChevronDown size={12} className="ome-select-icon" />
                    </div>
                    {errors.testDrivePerson && <span className="ome-err">{errors.testDrivePerson}</span>}
                  </div>
                  <div className="ome-field empty" />
                  <div className="ome-field empty" />
                </div>
              </div>
            </div>

            {/* 新车开票 */}
            <div className="ome-card">
              <div className="ome-card-hd">
                <ChevronDown size={14} className="ome-collapse-arrow" />
                <span className="ome-card-title">新车开票</span>
                {!invoiceEditing && (
                  <button className="ome-icon-card-btn" onClick={handleInvoiceEdit}>
                    <Edit3 size={14} /> 编辑
                  </button>
                )}
                <span className="ome-simulate-tag" title="原型演示：切换是否命中未完成审批的限价申请">
                  <label className="ome-simulate-label">
                    <input
                      type="checkbox"
                      checked={hasPendingPriceLimit}
                      onChange={e => setHasPendingPriceLimit(e.target.checked)}
                    />
                    演示：有限价审批未完成
                  </label>
                </span>
              </div>
              <div className="ome-section">
                <div className="ome-grid">
                  <div className="ome-field">
                    <label className="ome-label required">开票日期</label>
                    {invoiceEditing ? (
                      <div className="ome-input-with-icon">
                        <input className="ome-input" value={invoiceForm.invoiceDate} onChange={e => updateInvoice('invoiceDate', e.target.value)} />
                        <Calendar size={12} className="ome-input-icon muted" />
                      </div>
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceDate}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">新车收入（含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input" value={invoiceForm.newCarRevenueTaxIncluded} onChange={e => updateInvoice('newCarRevenueTaxIncluded', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.newCarRevenueTaxIncluded}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">新车收入-税率</label>
                    {invoiceEditing ? (
                      <div className="ome-select-wrap">
                        <select className="ome-input ome-select" value={invoiceForm.newCarRevenueTaxRate} onChange={e => updateInvoice('newCarRevenueTaxRate', e.target.value)}>
                          <option value="13%">13%</option>
                          <option value="6%">6%</option>
                        </select>
                        <ChevronDown size={12} className="ome-select-icon" />
                      </div>
                    ) : (
                      <div className="ome-value">{invoiceForm.newCarRevenueTaxRate}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">新车收入（不含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input ome-input-readonly" value={invoiceForm.newCarRevenueTaxExcluded} readOnly />
                    ) : (
                      <div className="ome-value">{invoiceForm.newCarRevenueTaxExcluded}</div>
                    )}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label">销售折让（含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input" placeholder="请输入销售折让（含税）" value={invoiceForm.salesDiscountTaxIncluded} onChange={e => updateInvoice('salesDiscountTaxIncluded', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.salesDiscountTaxIncluded || '-'}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">建店返利（含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input" placeholder="请输入建店返利（含税）" value={invoiceForm.storeRebateTaxIncluded} onChange={e => updateInvoice('storeRebateTaxIncluded', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.storeRebateTaxIncluded || '-'}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">是否地补</label>
                    {invoiceEditing ? (
                      <div className="ome-select-wrap">
                        <select className="ome-input ome-select" value={invoiceForm.hasLocalSubsidy} onChange={e => updateInvoice('hasLocalSubsidy', e.target.value)}>
                          <option value="是">是</option>
                          <option value="否">否</option>
                        </select>
                        <ChevronDown size={12} className="ome-select-icon" />
                      </div>
                    ) : (
                      <div className="ome-value">{invoiceForm.hasLocalSubsidy}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">享受地补地区</label>
                    {invoiceEditing ? (
                      <div className="ome-select-wrap">
                        <select className="ome-input ome-select" value={invoiceForm.subsidyRegion} onChange={e => updateInvoice('subsidyRegion', e.target.value)}>
                          <option value="">请选择省市</option>
                          <option value="安徽省-芜湖市">安徽省-芜湖市</option>
                          <option value="广东省-广州市">广东省-广州市</option>
                        </select>
                        <ChevronDown size={12} className="ome-select-icon" />
                      </div>
                    ) : (
                      <div className="ome-value">{invoiceForm.subsidyRegion || '-'}</div>
                    )}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label">享受地补金额</label>
                    {invoiceEditing ? (
                      <input className="ome-input" placeholder="请输入享受地补金额" value={invoiceForm.subsidyAmount} onChange={e => updateInvoice('subsidyAmount', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.subsidyAmount || '-'}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">发票购买方</label>
                    {invoiceEditing ? (
                      <input className="ome-input" value={invoiceForm.invoiceBuyer} onChange={e => updateInvoice('invoiceBuyer', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceBuyer}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label">开票备注</label>
                    {invoiceEditing ? (
                      <input className="ome-input" placeholder="请输入开票备注" value={invoiceForm.invoiceRemark} onChange={e => updateInvoice('invoiceRemark', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceRemark || '-'}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">开票金额（含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input" value={invoiceForm.invoiceAmountTaxIncluded} onChange={e => updateInvoice('invoiceAmountTaxIncluded', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceAmountTaxIncluded}</div>
                    )}
                  </div>

                  <div className="ome-field">
                    <label className="ome-label required">开票金额-税率</label>
                    {invoiceEditing ? (
                      <div className="ome-select-wrap">
                        <select className="ome-input ome-select" value={invoiceForm.invoiceAmountTaxRate} onChange={e => updateInvoice('invoiceAmountTaxRate', e.target.value)}>
                          <option value="13%">13%</option>
                          <option value="6%">6%</option>
                        </select>
                        <ChevronDown size={12} className="ome-select-icon" />
                      </div>
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceAmountTaxRate}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">开票金额（不含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input ome-input-readonly" value={invoiceForm.invoiceAmountTaxExcluded} readOnly />
                    ) : (
                      <div className="ome-value">{invoiceForm.invoiceAmountTaxExcluded}</div>
                    )}
                  </div>
                  <div className="ome-field">
                    <label className="ome-label required">现价金额（不含税）</label>
                    {invoiceEditing ? (
                      <input className="ome-input" value={invoiceForm.currentPriceTaxExcluded} onChange={e => updateInvoice('currentPriceTaxExcluded', e.target.value)} />
                    ) : (
                      <div className="ome-value">{invoiceForm.currentPriceTaxExcluded}</div>
                    )}
                  </div>
                  <div className="ome-field empty" />
                </div>

                <div className="ome-attach-block">
                  <div className="ome-attach-hint">文件格式：.rar,.zip,.pdf,.jpg,.png,.jpeg,.ppt</div>
                  <div className="ome-attach-table">
                    <div className="ome-attach-row ome-attach-head">
                      <span className="ome-attach-item-col">项目</span>
                      <span className="ome-attach-file-col">附件</span>
                    </div>
                    <div className="ome-attach-row">
                      <span className="ome-attach-item-col required">发票</span>
                      <span className="ome-attach-file-col">
                        {invoiceEditing && (
                          <>
                            <label className="ome-upload-box">
                              <Plus size={14} /> 上传附件
                              <input
                                type="file"
                                className="ome-file-hidden"
                                onChange={e => handleUploadAttachment(e.target.files?.[0])}
                              />
                            </label>
                            {invoiceForm.attachments.map(attachment => (
                              <span className="ome-attach-item" key={attachment.id}>
                                <FileText size={14} />
                                <span className="ome-attach-name">{attachment.name}</span>
                                <button className="ome-attach-remove" onClick={() => handleRemoveAttachment(attachment.id)} aria-label="删除附件">
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </>
                        )}
                        {!invoiceEditing && invoiceForm.attachments.map(attachment => (
                          <span className="ome-attach-thumb" key={attachment.id}>
                            <span className="ome-doc-preview">
                              <span className="ome-doc-line" />
                              <span className="ome-doc-line short" />
                              <span className="ome-doc-seal" />
                            </span>
                          </span>
                        ))}
                        {!invoiceEditing && invoiceForm.attachments.length === 0 && <span className="ome-value">-</span>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {invoiceEditing && (
                <div className="ome-card-actions">
                  <button className="ome-btn ome-btn-default" onClick={handleInvoiceExitEdit}>
                    <CornerDownLeft size={14} /> 退出编辑
                  </button>
                  <button className="ome-btn ome-btn-primary" onClick={handleInvoiceSave}>
                    <Save size={14} /> 保存
                  </button>
                </div>
              )}
            </div>

            <div className="ome-footer">
              <button className="ome-btn ome-btn-default" onClick={() => setForm({ ...INITIAL_FORM })}>
                重置
              </button>
              <button className="ome-btn ome-btn-primary" onClick={handleSave}>
                保存
              </button>
            </div>
          </div>
        </main>
      </div>

      {showPriceLimitModal && (
        <div className="ome-modal-mask" onClick={() => setShowPriceLimitModal(false)}>
          <div className="ome-modal" onClick={event => event.stopPropagation()}>
            <div className="ome-modal-header">
              <span>限价审批提醒</span>
              <button className="ome-modal-close" onClick={() => setShowPriceLimitModal(false)} aria-label="关闭提醒">
                <X size={18} />
              </button>
            </div>
            <div className="ome-modal-body">
              <div className="ome-modal-warning">
                <AlertTriangle size={20} className="ome-modal-warning-icon" />
                <span>订单已触发限价审批，通过限价管理-限价申请跟踪审批进度。</span>
              </div>
            </div>
            <div className="ome-modal-footer">
              <button className="ome-btn ome-btn-default" onClick={() => setShowPriceLimitModal(false)}>取消</button>
              <button className="ome-btn ome-btn-primary" onClick={() => setShowPriceLimitModal(false)}>知道了</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ome-toast">{toast}</div>}

      <AnnotationViewer
        source={annotationSourceDocument as unknown as AnnotationSourceDocument}
        defaultVisible
        options={{
          currentPageId: 'order-manage-entry',
          toolbarEdge: 'right',
          showToolbar: true,
          showThemeToggle: true,
          showColorFilter: true,
          emptyWhenNoData: true,
        }}
      />
    </div>
  )
}

export default Component
