# 维修工单管理本地项目说明

本目录基于 `repair-workorder-m02` 高保真原型补齐了可本地运行的业务骨架，适合继续做前后端联调前的本地开发。

## 已补齐能力

- 创建工单会真正生成新工单，并写入工单列表与详情页上下文
- 工单列表、环检模板、工时单价设置支持浏览器本地持久化
- 工时单价支持新增、编辑、删除、模拟导入
- 页面顶部提供“恢复演示数据”，可一键清空本地缓存并回到默认样例

## 本地启动

在仓库根目录执行：

```bash
npm run dev
```

默认访问路径：

```text
/prototypes/repair-workorder-m02
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 本地缓存键

- `repair-workorder-m02:orders`
- `repair-workorder-m02:inspect-templates`
- `repair-workorder-m02:labor-standards`

清空以上键值，或直接点击页面内“恢复演示数据”，都可以回到默认演示状态。
