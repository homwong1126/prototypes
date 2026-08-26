# Fuse Design Pc 结构化规范

## 基本信息

- 主题键：`fuse-design-pc`
- 来源文件：`/Users/hom/Downloads/Fuse.Design-Pc组件包.mg`
- 提取方式：本地 `.mg` 解包 + 文档流文本抽取
- 提取日期：`2026-04-14`

## 资源范围

本次已沉淀以下三层资源：

1. 设计系统说明
2. 组件与案例目录清单
3. 语义 token 引用清单

当前项目内已进一步推进为四层：

4. 可运行主题变量层（`globals.css`）
5. 首个业务组件演示（`ODIN页头`）
6. 首屏入口组件演示（`品牌导航卡片`）
7. 组合型首屏业务模板（`ODIN首屏模板`）
8. 设计语言还原页（`设计语言还原页`）
9. 在线文件页面清单（`pageManifest.json`）

## 信息可信度

### 高可信

- 页面目录名称
- 原子组件目录名称
- 页面案例名称
- 业务组件名称线索
- React + Ant Design 示例代码存在性
- 组件级 token 命名空间

### 中可信

- 设计语言总结
- 字体使用结论
- 业务组件用途判断

### 当前未直接导出

- 完整数值 token 表
- 全量颜色值、字号值、阴影值
- 完整组件截图与一一映射关系
- 每个业务组件的完整属性矩阵

## 内容结构

### 页面层

- `封面`
- `设计语言`
- `组件索引`
- `ODIN业务组件`
- `页面案例/国内ODIN`
- `页面案例/海外ODIN`
- `更新日志`
- `原子组件`

### 原子组件层

按能力分组沉淀：

- 通用
- 数据录入
- 数据展示
- 反馈
- 导航
- 其他

### 业务组件层

当前已识别到的典型业务组件或品牌组件名称：

- `ODIN SMART PLATFORM`
- `iCAR ODIN页头`
- `CHERY ODIN页头`
- `EXEED ODIN页头`
- `JETOUR ODIN页头`
- `CHERY X ODIN`
- `EXEED X ODIN`
- `iCAR X ODIN`

## 技术映射规则

### 组件实现基线

- 默认映射到 Ant Design 组件能力。
- 视觉层做品牌扩展，不改变核心交互语义。
- 示例代码以 React 组件写法为主。

### Token 使用方式

- 当前 `designToken.json` 以“语义 token inventory”为主。
- 不将本次提取结果误用为完整 theme 数值配置。
- 当后续拿到在线 token 导出时，可覆盖为真实数值 token。

## 后续建议

### 可直接继续做的事

- 基于该主题补 `globals.css` 或真正的数值 token
- 抽取 `ODIN` 页头/导航/卡片为业务组件
- 基于 `国内ODIN` / `海外ODIN` 复刻示例页面

## 已实现的项目内映射

- `src/themes/fuse-design-pc/globals.css`
  用于承载当前可运行的主题变量层。
- `src/themes/fuse-design-pc/index.tsx`
  用于浏览本次提取成果与主题变量落地结果。
- `src/themes/fuse-design-pc/components/OdinHeader.tsx`
  作为第一个业务组件演示，实现品牌化页头壳层。
- `src/themes/fuse-design-pc/components/BrandNavCards.tsx`
  作为第二个业务组件演示，实现多品牌首屏导航卡片矩阵。
- `src/themes/fuse-design-pc/components/OdinHeroTemplate.tsx`
  作为第三层业务模板演示，把页头、首屏信息和品牌入口矩阵沉淀为完整首屏骨架。
- `src/themes/fuse-design-pc/components/DesignLanguageShowcase.tsx`
  作为设计语言页的项目内还原版本，把设计摘要、色彩、排版、组件风格和状态反馈组织成可浏览规范页。
- `src/themes/fuse-design-pc/pageManifest.json`
  记录在线文件 `190672623414009` 的真实页面层级与关键入口 layerId。

## 在线文件验证结果

已验证在线文件：

- `fileId=190672623414009`

确认存在以下页面入口：

- `2565:147804`：封面
- `6678:263266`：设计语言
- `8:51670`：组件索引
- `6678:84864`：ODIN业务组件
- `6675:167970`：页面案例/国内ODIN
- `6675:183680`：页面案例/海外ODIN
- `3046:042182`：更新日志

同时确认：

- 文档接口权限正常
- 原始文档流可访问
- `mcp__getMeta` / `mcp__getDsl` 对以上 layerId 当前返回空结构

因此，当前对该文件的沉淀策略为：

- 在线权限与页面入口，用 `pageManifest.json` 固化
- 设计内容本身，继续以 `.mg` / raw stream 的离线提取结果为主

### 需要额外来源支持的事

- 完整视觉变量落地
- 组件截图与设计稿坐标映射
- 状态矩阵全量导出
- 品牌色体系精确还原
