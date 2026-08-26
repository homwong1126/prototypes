# 维修工单管理 - 多收费类型逻辑还原

**日期**：2026-06-01  
**参考版本**：repair-workorder-m02-copy2  
**修复版本**：repair-workorder-m02

---

## 📋 问题描述

用户反馈：维修工单管理（repair-workorder-m02）的"多个收费类型逻辑"需要参照 copy2 版本的逻辑还原。

---

## 🔍 问题分析

经过对比 `repair-workorder-m02` 和 `repair-workorder-m02-copy2` 两个版本，发现主要差异在**费用汇总区域**的结构和显示逻辑：

### 问题 1：创建工单页费用汇总结构错误

**m02 原有结构**（错误）：
```tsx
<div className="fee-summary">
  工时费 | 备件费 | 其他费用 | 折扣汇总 | 预估总额
</div>
<div style={{ marginTop: 12, display: 'flex', ... }}>
  <span>保险合计</span>
  <span>索赔合计</span>
  <span>内结合计</span>
  <span>客户自费</span>
</div>
```

**copy2 正确结构**：
```tsx
<div className="fee-summary">
  工时费合计 | 备件费合计 | 其他费用 | 
  保险合计 | 索赔合计 | 内结合计 | 客户自费 | 费用合计
</div>
```

### 问题 2：详情页费用汇总结构错误

**m02 原有结构**（错误）：
```tsx
<div className="fee-summary">
  工时费 | 备件费 | 其他费用 | 折扣汇总 | 预估总额
</div>
<div style={{ marginTop: 12, display: 'flex', ... }}>
  <span>保险合计</span>
  <span>索赔合计</span>
  <span>内结合计</span>
  <span>客户自费</span>
</div>
```

**copy2 正确结构**：
```tsx
<div className="fee-summary">
  工时费合计 | 备件费合计 | 
  保险合计 | 索赔合计 | 内结合计 | 客户自费 | 费用合计
</div>
```

---

## ✅ 修复内容

### 修复 1：创建工单页费用汇总（第 9128-9164 行）

**修改前**：
- 两个独立容器
- 使用 `<span>` 标签显示多收费类型汇总
- 包含"折扣汇总"和"预估总额"

**修改后**：
- 单个 `.fee-summary` 容器
- 使用 `.fee-item` 结构显示所有费用项
- 费用项顺序：工时费合计 → 备件费合计 → 其他费用 → 保险合计 → 索赔合计 → 内结合计 → 客户自费 → 费用合计
- 移除"折扣汇总"和"预估总额"，改为"费用合计"
- 标签文字改为"工时费合计"、"备件费合计"（加"合计"后缀）

### 修复 2：详情页费用汇总（第 10725-10757 行）

**修改前**：
- 两个独立容器
- 使用 `<span>` 标签显示多收费类型汇总
- 包含"其他费用"、"折扣汇总"和"预估总额"

**修改后**：
- 单个 `.fee-summary` 容器
- 使用 `.fee-item` 结构显示所有费用项
- 费用项顺序：工时费合计 → 备件费合计 → 保险合计 → 索赔合计 → 内结合计 → 客户自费 → 费用合计
- 移除"其他费用"、"折扣汇总"和"预估总额"，改为"费用合计"
- 标签文字改为"工时费合计"、"备件费合计"（加"合计"后缀）

---

## 🎯 关键变化

### 1. 结构统一
所有费用项都在**单个 `.fee-summary` 容器**内，使用统一的 `.fee-item` 结构。

### 2. 显示顺序调整
按照 copy2 的逻辑，多收费类型汇总（保险合计、索赔合计、内结合计、客户自费）与基础费用项（工时费、备件费、其他费用）在**同一层级**展示，而不是分离成两个区块。

### 3. 标签文字修正
- "工时费" → "工时费合计"
- "备件费" → "备件费合计"
- "预估总额" → "费用合计"

### 4. 移除的项目
- 创建工单页：移除"折扣汇总"
- 详情页：移除"其他费用"、"折扣汇总"

---

## 📝 代码对比

### 创建工单页费用汇总

```tsx
// 修改前（错误）
<div className="fee-summary">
  <div className="fee-item">
    <div className="fee-label">工时费</div>
    <div className="fee-value">¥{laborTotal.toLocaleString()}</div>
  </div>
  {/* ... 其他基础费用项 ... */}
  <div className="fee-item">
    <div className="fee-label">折扣汇总</div>
    <div className="fee-value">-¥{discountSummary.toLocaleString()}</div>
  </div>
  <div className="fee-item total">
    <div className="fee-label">预估总额</div>
    <div className="fee-value">¥{total.toLocaleString()}</div>
  </div>
</div>
<div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
  <div className="fee-item">
    <div className="fee-label">保险合计</div>
    <div className="fee-value">¥{Math.round(chargeSummary.insurance).toLocaleString()}</div>
  </div>
  {/* ... 其他多收费类型汇总 ... */}
</div>

// 修改后（正确）
<div className="fee-summary">
  <div className="fee-item">
    <div className="fee-label">工时费合计</div>
    <div className="fee-value">¥{laborTotal.toLocaleString()}</div>
  </div>
  <div className="fee-item">
    <div className="fee-label">备件费合计</div>
    <div className="fee-value">¥{partsTotal.toLocaleString()}</div>
  </div>
  <div className="fee-item">
    <div className="fee-label">其他费用</div>
    <div className="fee-value">¥{additionalFeeTotal.toLocaleString()}</div>
  </div>
  <div className="fee-item">
    <div className="fee-label">保险合计</div>
    <div className="fee-value">¥{Math.round(chargeSummary.insurance).toLocaleString()}</div>
  </div>
  <div className="fee-item">
    <div className="fee-label">索赔合计</div>
    <div className="fee-value">¥{Math.round(chargeSummary.warranty).toLocaleString()}</div>
  </div>
  <div className="fee-item">
    <div className="fee-label">内结合计</div>
    <div className="fee-value">¥{Math.round(chargeSummary.internal).toLocaleString()}</div>
  </div>
  <div className="fee-item self-pay">
    <div className="fee-label">客户自费</div>
    <div className="fee-value">¥{Math.round(chargeSummary.self).toLocaleString()}</div>
  </div>
  <div className="fee-item total">
    <div className="fee-label">费用合计</div>
    <div className="fee-value">¥{total.toLocaleString()}</div>
  </div>
</div>
```

---

## ✅ 验收检查

- [x] 创建工单页费用汇总结构已还原
- [x] 详情页费用汇总结构已还原
- [x] 多收费类型汇总在同一容器内显示
- [x] 费用项顺序与 copy2 一致
- [x] 标签文字与 copy2 一致
- [x] 无编译错误

---

## 🎯 影响范围

### 修改文件
- `src/prototypes/repair-workorder-m02/index.tsx`

### 修改行数
- 创建工单页：第 9128-9164 行（37 行）
- 详情页：第 10725-10757 行（33 行）
- 总计：约 70 行代码修改

### 不受影响的功能
- ✅ 多收费类型选择逻辑（parseChargeTypeParts、serializeChargeTypeParts 等函数）
- ✅ 收费分担编辑器（splitMode、splitValues 逻辑）
- ✅ 收费类型下拉菜单
- ✅ 费用计算逻辑（allocateCharge 函数）
- ✅ 维修项目、备件、其他费用的收费类型设置

---

## 💡 技术说明

### 为什么要还原？

1. **一致性**：copy2 版本的费用汇总结构更清晰，所有费用项在同一层级展示，用户体验更好。

2. **可维护性**：单个容器的结构更易于维护，避免多个独立块的样式不一致问题。

3. **逻辑完整性**：copy2 版本的多收费类型汇总与基础费用项在同一容器中，体现了费用汇总的整体性。

### 关键 CSS 类

- `.fee-summary`：费用汇总容器
- `.fee-item`：单个费用项
- `.fee-label`：费用项标签
- `.fee-value`：费用项金额
- `.fee-item.self-pay`：客户自费项（可能有特殊样式）
- `.fee-item.total`：费用合计项（通常加粗或有特殊样式）

---

## 📊 对比总结

| 项目 | m02 修改前 | copy2 参考版本 | m02 修改后 |
|------|-----------|---------------|-----------|
| 费用汇总容器 | 2个独立块 | 1个统一容器 | ✅ 1个统一容器 |
| 多收费汇总显示 | `<span>` 标签 | `.fee-item` 结构 | ✅ `.fee-item` 结构 |
| 费用项顺序 | 基础费用 + 多收费 | 混合排列 | ✅ 混合排列 |
| 标签文字 | "工时费"、"预估总额" | "工时费合计"、"费用合计" | ✅ "工时费合计"、"费用合计" |
| 包含"折扣汇总" | ✅ | ❌ | ✅ ❌（已移除） |

---

**修复状态**：✅ 已完成  
**验证状态**：✅ 无编译错误  
**建议**：在浏览器中验证费用汇总显示效果
