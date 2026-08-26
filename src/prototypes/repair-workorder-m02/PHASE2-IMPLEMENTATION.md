# 维修工单管理 - 创建工单页面重构实施记录

**日期**：2026-06-01  
**阶段**：Phase 2 - 创建工单页面重组

---

## ✅ Phase 1 完成情况

### 已完成的数据模型扩展

#### WorkOrder 接口新增字段
```typescript
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

// 车主标签
ownerTags?: string[] // 车主标签（健身达人、敏感客户、高价值客户、投诉敏感、价格敏感等）

// 工单信息扩展
isPickupDelivery?: boolean // 是否送修
principalTechnician?: string // 责任技师（派工时的主技师）
```

#### RepairItem 接口新增字段
```typescript
packageName?: string // 套餐/活动名称
faultLocation?: string // 故障部位
assignedTechnician?: string // 指派技师（派工后回写）
workstation?: string // 工位（派工后回写）
```

#### PartItem 接口新增字段
```typescript
packageName?: string // 套餐/活动
issuer?: string // 发料人（领料后回写）
receiver?: string // 领料人（领料后回写）
issuedAt?: string // 发料时间
```

#### AdditionalFeeItem 接口新增字段
```typescript
relatedDocNo?: string // 关联单据号（取送车、道路救援）
relatedDocType?: '取送车' | '道路救援' | '其他' // 关联单据类型
```

---

## 🎯 Phase 2: 创建工单页面重组策略

### 当前页面结构分析

**现有卡片**：
1. 车主车辆信息（混合）
2. 车辆售后信息
3. 维修项目
4. 备件
5. 其他费用
6. 费用总计

**存在的问题**：
- 车主信息和车辆信息混在一起
- 缺少工单信息独立卡片
- 标签信息嵌入在车主车辆信息中，不够独立
- 维修项目和备件缺少新增字段展示

### 新的页面结构设计

**调整后的卡片顺序**：
1. ✅ 顶部车辆概览（保持不变）
2. 🆕 车主信息卡片
3. 🆕 车辆信息卡片
4. 🆕 车主标签 & 车辆标签卡片
5. 🆕 工单信息卡片
6. ✏️ 维修项目信息（增加新字段列）
7. ✏️ 备件信息（增加新字段列）
8. ✏️ 其他费用（增加关联单据）
9. ✅ 费用总计（调整标签名称）

---

## 📝 实施细节

### 1️⃣ 车主信息卡片（新建）

**包含字段**：
- 车主类别（下拉框：个人/企业/事业）
- 车主姓名
- 车主电话
- 车主邮箱（新增）
- 联系人（新增）
- 联系人电话（新增）
- 联系人邮箱（新增）
- 送修人
- 送修人电话
- 送修人邮箱（新增）

**布局**：3列网格

### 2️⃣ 车辆信息卡片（重组）

**包含字段**：
- 品牌（新增）
- 车系
- 车型
- 配置（新增）
- 外饰颜色
- 内饰颜色（新增）
- VIN
- 发动机号
- 变速箱号
- 车牌号
- 进厂里程
- 累计里程（新增）
- 换表里程（新增）
- 销售日期
- 下次保养日期（新增）
- 保修到期日期（新增）
- 保险到期日期（新增）
- 保险公司
- 是否三包（新增，Checkbox）

**布局**：3列网格

### 3️⃣ 车主标签 & 车辆标签卡片（新建）

**车主标签**：
- 高价值客户
- 投诉敏感
- 价格敏感
- 健身达人
- 敏感客户

**车辆标签**：
- 按时保养
- 降级车
- 等（现有标签）

**布局**：标签云形式，可勾选

### 4️⃣ 工单信息卡片（新建）

**包含字段**：
- 工单号（自动生成）
- 工单类型（下拉框）
- 服务顾问
- 开单时间（自动填充）
- 预计交车时间
- 保险公司
- 是否送修（Checkbox）
- 责任技师（新增）

**布局**：3列网格

### 5️⃣ 维修项目信息表格（扩展）

**新增列**：
- 套餐/活动名称
- 故障部位

**派工后显示列**：
- 技师（派工后回写）
- 工位（派工后回写）

**表格列顺序**：
项目代码 | 项目名称 | 套餐/活动 | 故障部位 | 工时单价 | 标准工时 | 总价格 | 收费类型 | 折扣 | 技师 | 工位 | 操作

### 6️⃣ 备件信息表格（扩展）

**新增列**：
- 套餐/活动

**领料后显示列**：
- 发料人（领料后回写）
- 领料人（领料后回写）

**表格列顺序**：
备件代码 | 备件名称 | 套餐/活动 | 单价 | 数量 | 总价格 | 收费区分 | 折扣 | 发料人 | 领料人 | 操作

### 7️⃣ 其他费用表格（扩展）

**新增列**：
- 关联单据号
- 关联单据类型（下拉：取送车/道路救援/其他）

**表格列顺序**：
费用名称 | 金额 | 收费类型 | 关联单据号 | 关联单据类型 | 备注 | 操作

### 8️⃣ 费用总计（调整）

**调整**：
- 将"附件费"改为"其他费用"
- 显示项目：工时费、备件费、其他费用、折扣汇总、预估总额

---

## 🔧 技术实现要点

### 条件显示逻辑

```typescript
// 维修项目表格
const showDispatchColumns = order.dispatchedAt !== undefined

// 备件表格
const showMaterialColumns = partItem.isPicked === true

// 根据工单状态决定是否显示回写字段
```

### 派工回写逻辑

```typescript
// 在派工完成时，将技师和工位信息回写到 RepairItem
const handleDispatchComplete = (orderId: string, assignments: Assignment[]) => {
  assignments.forEach(assign => {
    // 找到对应的维修项目
    const repairItem = findRepairItem(orderId, assign.projectId)
    if (repairItem) {
      repairItem.assignedTechnician = assign.technician
      repairItem.workstation = assign.workstation
    }
  })
}
```

### 领料回写逻辑

```typescript
// 在领料完成时，将发料人和领料人信息回写到 PartItem
const handleMaterialIssue = (orderId: string, partId: number, issuer: string, receiver: string) => {
  const partItem = findPartItem(orderId, partId)
  if (partItem) {
    partItem.issuer = issuer
    partItem.receiver = receiver
    partItem.issuedAt = new Date().toISOString()
    partItem.isPicked = true
  }
}
```

---

## ⚠️ 注意事项

1. **保持向后兼容**：所有新增字段都是可选的
2. **不破坏现有逻辑**：派工、领料、质检流程保持不变
3. **条件显示**：新增字段在合适的时机显示
4. **数据校验**：新增必填字段的校验逻辑
5. **样式一致性**：保持与现有页面风格一致

---

## 📊 进度追踪

- [x] Phase 1: 数据模型扩展
- [x] Phase 2: 创建工单页面重组
  - [x] 车主信息卡片
  - [x] 车辆信息卡片
  - [x] 车主标签 & 车辆标签卡片
  - [x] 工单信息卡片
  - [x] 维修项目表格扩展
  - [x] 备件表格扩展
  - [x] 其他费用表格扩展
  - [x] 费用总计调整
- [x] Phase 3: 派工回写逻辑（确认派工时回写技师/工位）
- [x] Phase 4: 领料回写逻辑（上门领料确认后回写发料人/领料人）
- [x] Phase 5: 详情页更新（与创建页信息架构对齐：8 类卡片、扩展表格列、其他费用、费用汇总）
- [x] Phase 6: 测试与验收（浏览器验证 WO-2026-0327-001 详情页卡片与表格列；本原型 TS/Lint 无新增错误；全项目 typecheck 仍受其他原型历史错误影响）

---

**状态**：Phase 1–6 已完成（2026-06-04）
