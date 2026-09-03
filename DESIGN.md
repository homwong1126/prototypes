# Fuse Design Pc 设计沉淀

> 来源：本地组件包 `Fuse.Design-Pc组件包.mg` 解包提取  
> 提取时间：2026-04-14  
> 说明：当前沉淀基于 `.mg` 文件可读取到的页面目录、组件目录、示例代码与 token 引用关系；其中大部分为“语义 token 引用”和组件组织信息，不等同于完整的数值化视觉变量导出。

## 设计定位

Fuse Design Pc 是一套偏中后台、品牌化增强的桌面端设计资源。包内可稳定识别出以下一级资源：

- `📗 封面`
- `🧑‍🎨 设计语言`
- `👀 组件索引`
- `💼 ODIN业务组件`
- `📃 页面案例/国内ODIN`
- `📃 页面案例/海外ODIN`
- `📅 更新日志`
- `⚛️ 原子组件`

从设计语言页中可提取到的核心描述为：

> 全新的设计语言，带来耳目一新的视觉体验，经过重新设计优化的组件变体，轻巧且高效。

这说明该组件包不是纯 Ant Design 搬运，而是建立在 Ant Design 语义体系之上的品牌化升级版本。

## 设计语言特征

从文档结构与 token 引用可以总结出以下特征：

- 以 Ant Design 组件语义为基础组织组件和状态。
- 以品牌业务“ODIN”作为业务组件与页面案例主线。
- 设计资源同时覆盖原子层、业务层、页面案例层。
- 文档内嵌大量 React + Ant Design 示例代码，便于设计到实现的映射。
- 字体上观察到 `MiSans` 与 `PingFang SC` 的组合使用。

### 已识别字体

- `MiSans/Medium/Version 4.003`
- `MiSans/Normal/Version 4.003`
- `MiSans/Regular/Version 4.003`
- `PingFang SC/中粗体/Version 1`

## 页面案例

当前组件包中稳定识别出的页面案例包括：

- `国内ODIN`
- `海外ODIN`

这两个案例说明该资源并非只覆盖组件展示，也包含面向真实业务场景的页面落地样式。

## 业务组件线索

从文档文本中提取到的业务组件或品牌化业务模块线索包括：

- `ODIN业务组件`
- `ODIN SMART PLATFORM`
- `iCAR ODIN页头`
- `CHERY ODIN页头`
- `CHERY X ODIN`
- `EXEED ODIN页头`
- `EXEED X ODIN`
- `JETOUR ODIN页头`
- `iCAR X ODIN`

这些名称说明业务组件层更偏向车企品牌站点或品牌化中后台/门户头部模块沉淀。

## 原子组件覆盖

提取到的原子组件按能力大致分为以下几类。

### 通用

- `Button 按钮`
- `Icon 图标`
- `Typography 排版`
- `Space 间距`
- `Grid 栅格`
- `Layout 布局`
- `Divider 分隔线`

### 数据录入

- `Input 输入框`
- `InputNumber 数字输入框`
- `Select 选择器`
- `Radio 单选框`
- `Checkbox 多选框`
- `Switch 开关`
- `Slider 滑动输入条`
- `Rate 评分`
- `DatePicker 日期选择器`
- `TimePicker 时间选择框`
- `Upload 上传`
- `TreeSelect 树选择`
- `Cascader 级联选择`
- `Mentions 提及`
- `AutoComplete 自动完成`
- `Transfer 穿梭框`
- `ColorPicker 颜色选择器`
- `Form 表单`

### 数据展示

- `Table 表格`
- `Card 卡片`
- `List 列表`
- `Descriptions 描述列表`
- `Calendar 日历`
- `Tree 树形控件`
- `Timeline 时间轴`
- `Tag 标签`
- `Badge 徽标数`
- `Avatar 头像`
- `Statistic 统计数值`
- `Collapse 折叠面板`
- `Tooltip 文字提示`
- `Popover 气泡卡片`
- `QRCode 二维码`
- `Image 图片`
- `Empty 空状态`
- `Carousel 走马灯`
- `Tour 漫游式引导`

### 反馈

- `Alert 警告提示`
- `Message 全局提示`
- `Notification 通知提醒框`
- `Popconfirm 气泡确认框`
- `Modal 对话框`
- `Drawer 抽屉`
- `Progress 进度条`
- `Spin 加载中`
- `Skeleton 骨架屏`
- `Result 结果`

### 导航

- `Menu 导航菜单`
- `Tabs 标签页`
- `Breadcrumb 面包屑`
- `Pagination 分页`
- `Steps 步骤条`
- `Dropdown 下拉菜单`
- `Anchor 锚点`

### 其他

- `Affix 固钉`
- `FloatButton 悬浮按钮`
- `Watermark 水印`
- `illustration 插画库`

## Token 体系观察

虽然当前 `.mg` 文件未直接导出完整的数值 token 表，但已稳定识别出 500+ 语义 token 引用，且命名空间覆盖完整。这说明该设计系统具备较成熟的组件级 token 分层。

### 代表性 token 命名空间

- `Alert`
- `Anchor`
- `Avatar`
- `Badge`
- `Breadcrumb`
- `Button`
- `Calendar`
- `Card`
- `Checkbox`
- `Collapse`
- `DatePicker`
- `Descriptions`
- `Divider`
- `Drawer`
- `Dropdown`
- `FloatButton`
- `Input`
- `InputNumber`
- `List`
- `Menu`
- `Message`
- `Modal`
- `Notification`
- `Pagination`
- `Popover`
- `Progress`
- `Radio`
- `Result`
- `Segmented`
- `Select`
- `Skeleton`
- `Slider`
- `Statistic`
- `Steps`
- `Switch`
- `Table`
- `Tabs`
- `Typography`

### 代表性 token 类型

- 颜色：`colorPrimary`、`colorText`、`colorBorder`、`colorBgContainer`
- 尺寸：`controlHeight`、`paddingXS`、`paddingSM`
- 圆角：`borderRadius`、`borderRadiusSM`、`borderRadiusLG`
- 线框：`lineWidth`
- 间距：`marginXS`、`marginXXS`
- 排版：`typography`

## 设计到开发映射

组件包内提取到 376 条左右的 React + Ant Design 示例代码。已观察到的映射方式包括：

- `Typography.Text` 的 `mark`、`disabled`、`danger`、`secondary`、`italic` 等变体
- `Button` 的 `primary`、`dashed`、`danger`、`round`、`icon-only`、不同 size 组合
- `Badge`、`Table` 等组件的标准 Ant Design 使用方式

这说明该组件包不仅沉淀视觉稿，也沉淀了比较明确的前端实现参考。

## 落地建议

当前项目已经把这份组件包往“可复用资源”推进到了模板层，建议按以下顺序持续工程化：

- 先保留 `globals.css` 作为运行时主题变量入口，等待后续真实 token 数值覆盖。
- 以 `ODIN页头`、`品牌导航卡片`、`ODIN首屏模板` 形成业务层基准组件。
- 再从 `国内ODIN` 或 `海外ODIN` 页面案例中挑选一张整页，继续沉淀为页面级模板。

目前这套资源在项目中的角色已经从“设计提取结果”升级为“主题 + 业务组件 + 业务模板”的可浏览资产包。

将 Fuse Design Pc 作为项目资源使用时，建议遵循以下策略：

- 把它作为 `Ant Design + 品牌化 ODIN 扩展` 的主题参考，而不是完全独立的新组件库。
- 原子组件层优先复用现有 Ant Design 组件 API。
- 业务组件层优先抽象“页头、品牌化导航、业务卡片、业务信息区块”等品牌模块。
- 页面案例层适合作为后续原型视觉基准，尤其适用于品牌化门户或品牌管理后台。
- 真正需要数值级 token 时，建议后续补一次可访问的 MasterGo 在线 token 导出。

## 当前项目内推进结果

本轮已在项目中继续落地两层可运行资产：

- `globals.css`：将提取结果进一步映射为主题变量层。
- `ODIN页头`：作为首个品牌业务组件演示，验证这套资源可被工程化消费。
- `品牌导航卡片`：作为第二个业务组件演示，补齐首页首屏入口矩阵。

当前 `ODIN页头` 的实现重点包括：

- 品牌位与多品牌站点标识
- 一级导航与当前态
- 首屏标题区与行动按钮
- 经营数据摘要卡

当前 `品牌导航卡片` 的实现重点包括：

- 多品牌入口卡片矩阵
- 当前品牌聚焦态
- 品牌指标摘要
- 品牌级推荐动作入口

这使得 Fuse Design Pc 已从“资源沉淀”推进到“主题底座 + 业务组件演示”阶段。

## 在线文件补充验证

针对在线文件 `190672623414009`，本次又做了一轮原始文档流验证。

已确认这份文件的页面层级与本地 `.mg` 提取结果一致，关键页包括：

- `封面`：`2565:147804`
- `设计语言`：`6678:263266`
- `组件索引`：`8:51670`
- `ODIN业务组件`：`6678:84864`
- `页面案例/国内ODIN`：`6675:167970`
- `页面案例/海外ODIN`：`6675:183680`
- `更新日志`：`3046:042182`

需要特别说明的是：

- 该在线文件可以访问
- 其原始文档流也可以抓取
- 但当前 MasterGo MCP 对这些 layerId 返回的 DSL 仍然为空

因此在项目里，已经额外补充了一份页面清单：

- `pageManifest.json`

它用于固定在线文件的真实页面入口，方便后续继续做离线增强沉淀或等待 MCP 提取恢复正常。

## 资源文件

- 封面图：`assets/cover.png`
- 结构化规范：`DESIGN-SPEC.md`
- 机器可读清单：`designToken.json`
