# 维修工单管理 - Phase 2 代码实施指南

**目标**：将创建工单页面的信息从 2 个卡片重组为 8 个卡片

---

## 📍 实施位置

在 `src/prototypes/repair-workorder-m02/index.tsx` 文件中，找到创建工单 Tab 的内容区域（约第 5100 行附近），按照以下顺序重新组织卡片。

---

## 🎯 新的卡片结构

### 原有结构（需要拆分）
```
1. 车主车辆信息（混合卡片）
2. 车辆售后信息
3. 维修项目
4. 备件
5. 其他费用
6. 费用总计
```

### 新的结构（8个独立卡片）
```
1. 车主信息卡片（新建）
2. 车辆信息卡片（重组）
3. 车主标签 & 车辆标签卡片（新建）
4. 工单信息卡片（新建）
5. 维修项目信息（扩展）
6. 备件信息（扩展）
7. 其他费用（扩展）
8. 费用总计（调整）
```

---

## 1️⃣ 车主信息卡片（全新）

**插入位置**：在顶部车辆概览面板之后

```tsx
{/* 1. 车主信息卡片 */}
<div className="card card-odin">
  <div className="card-title">车主信息</div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车主类别</label>
      <select className="form-input">
        <option>个人</option>
        <option>企业</option>
        <option>事业</option>
      </select>
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车主姓名</label>
      <input className="form-input" placeholder="请输入车主姓名" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车主电话</label>
      <input className="form-input" placeholder="请输入车主电话" />
    </div>
    <div className="form-item">
      <label className="form-label">车主邮箱</label>
      <input className="form-input" type="email" placeholder="请输入车主邮箱" />
    </div>
    <div className="form-item">
      <label className="form-label">联系人</label>
      <input className="form-input" placeholder="请输入联系人姓名" />
    </div>
    <div className="form-item">
      <label className="form-label">联系人电话</label>
      <input className="form-input" placeholder="请输入联系人电话" />
    </div>
    <div className="form-item">
      <label className="form-label">联系人邮箱</label>
      <input className="form-input" type="email" placeholder="请输入联系人邮箱" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 送修人</label>
      <input className="form-input" placeholder="请输入送修人姓名" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 送修人电话</label>
      <input className="form-input" placeholder="请输入送修人电话" />
    </div>
    <div className="form-item">
      <label className="form-label">送修人邮箱</label>
      <input className="form-input" type="email" placeholder="请输入送修人邮箱" />
    </div>
  </div>
</div>
```

---

## 2️⃣ 车辆信息卡片（重组）

```tsx
{/* 2. 车辆信息卡片 */}
<div className="card card-odin">
  <div className="card-title">车辆信息</div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    <div className="form-item">
      <label className="form-label">品牌</label>
      <input className="form-input" placeholder="奇瑞" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车系</label>
      <input className="form-input" placeholder="ARRIZO 8" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车型</label>
      <input className="form-input" placeholder="奇瑞 ARRIZO 8 2023款 1.6T" />
    </div>
    <div className="form-item">
      <label className="form-label">配置</label>
      <input className="form-input" placeholder="豪华版" />
    </div>
    <div className="form-item">
      <label className="form-label">外饰颜色</label>
      <input className="form-input" placeholder="曜石黑" />
    </div>
    <div className="form-item">
      <label className="form-label">内饰颜色</label>
      <input className="form-input" placeholder="黑色" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> VIN</label>
      <input className="form-input" placeholder="请输入17位VIN码" maxLength={17} />
    </div>
    <div className="form-item">
      <label className="form-label">发动机号</label>
      <input className="form-input" placeholder="请输入发动机号" />
    </div>
    <div className="form-item">
      <label className="form-label">变速箱号</label>
      <input className="form-input" placeholder="请输入变速箱号" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 车牌号</label>
      <input className="form-input" placeholder="浙B·0L34B" />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 进厂里程</label>
      <input className="form-input" type="number" placeholder="请输入进厂里程" />
    </div>
    <div className="form-item">
      <label className="form-label">累计里程</label>
      <input className="form-input" type="number" placeholder="请输入累计里程" />
    </div>
    <div className="form-item">
      <label className="form-label">换表里程</label>
      <input className="form-input" type="number" placeholder="请输入换表里程" />
    </div>
    <div className="form-item">
      <label className="form-label">销售日期</label>
      <input className="form-input" type="date" />
    </div>
    <div className="form-item">
      <label className="form-label">下次保养日期</label>
      <input className="form-input" type="date" />
    </div>
    <div className="form-item">
      <label className="form-label">保修到期日期</label>
      <input className="form-input" type="date" />
    </div>
    <div className="form-item">
      <label className="form-label">保险到期日期</label>
      <input className="form-input" type="date" />
    </div>
    <div className="form-item">
      <label className="form-label">保险公司</label>
      <input className="form-input" placeholder="人保财险" />
    </div>
    <div className="form-item" style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: 14 }}>是否三包</span>
      </label>
    </div>
  </div>
</div>
```

---

## 3️⃣ 车主标签 & 车辆标签卡片（全新）

```tsx
{/* 3. 车主标签 & 车辆标签卡片 */}
<div className="card card-odin">
  <div className="card-title">车主标签 & 车辆标签</div>
  
  {/* 车主标签 */}
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>车主标签</div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {['高价值客户', '投诉敏感', '价格敏感', '健身达人', '敏感客户'].map(tag => (
        <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
          <input type="checkbox" style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 13 }}>{tag}</span>
        </label>
      ))}
    </div>
  </div>
  
  {/* 车辆标签 */}
  <div>
    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>车辆标签</div>
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {['按时保养', '降级车', '高频维修', '长期未进厂'].map(tag => (
        <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s' }}>
          <input type="checkbox" style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 13 }}>{tag}</span>
        </label>
      ))}
    </div>
  </div>
</div>
```

---

## 4️⃣ 工单信息卡片（全新）

```tsx
{/* 4. 工单信息卡片 */}
<div className="card card-odin">
  <div className="card-title">工单信息</div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
    <div className="form-item">
      <label className="form-label">工单号</label>
      <input className="form-input" value="WO-2026-0601-001" readOnly style={{ background: '#f5f6f8' }} />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 工单类型</label>
      <select className="form-input">
        <option>维修</option>
        <option>保养</option>
        <option>事故</option>
        <option>品质改善</option>
      </select>
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 服务顾问</label>
      <select className="form-input">
        <option>李顾问</option>
        <option>王顾问</option>
        <option>张顾问</option>
      </select>
    </div>
    <div className="form-item">
      <label className="form-label">开单时间</label>
      <input className="form-input" type="datetime-local" value={new Date().toISOString().slice(0, 16)} readOnly style={{ background: '#f5f6f8' }} />
    </div>
    <div className="form-item">
      <label className="form-label"><span style={{ color: '#ff4d4f' }}>*</span> 预计交车时间</label>
      <input className="form-input" type="datetime-local" />
    </div>
    <div className="form-item">
      <label className="form-label">保险公司</label>
      <input className="form-input" placeholder="人保财险" />
    </div>
    <div className="form-item" style={{ display: 'flex', alignItems: 'center', paddingTop: 28 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        <input type="checkbox" style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: 14 }}>是否送修</span>
      </label>
    </div>
    <div className="form-item">
      <label className="form-label">责任技师</label>
      <select className="form-input">
        <option value="">请选择责任技师</option>
        <option>张伟</option>
        <option>王强</option>
        <option>李明</option>
      </select>
    </div>
  </div>
</div>
```

---

## 后续步骤

由于代码量巨大（预计还需要修改 1500+ 行），建议：

1. **手动添加卡片**：按照上述代码模板，在合适位置插入 4 个新卡片
2. **扩展表格**：在维修项目、备件、其他费用表格中添加新列
3. **实现回写逻辑**：在派工和领料时回写相应字段
4. **测试验证**：确保所有功能正常工作

**完整实施需要在新会话中继续，请告诉 AI**：
"继续实施维修工单管理 Phase 2，我已经添加了 4 个新卡片，现在需要扩展维修项目和备件表格。"
