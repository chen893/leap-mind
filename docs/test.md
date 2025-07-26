# Monorepo 的常见方案概述

## 1. 章节概述

在现代前端开发中，随着项目规模的扩大和复杂度的增加，传统的多仓库（Multirepo）管理方式逐渐暴露出效率低下、依赖管理困难等问题。Monorepo（单一代码仓库）作为一种替代方案应运而生，它将多个相关项目放在同一个代码仓库中管理。本章将介绍 Monorepo 的核心概念、常见实现方案，并通过具体示例展示其优势，最后提供实践中的关键要点。

## 2. 核心概念解释

### 2.1 什么是 Monorepo？

Monorepo 是"monolithic repository"的缩写，指将多个项目的代码存储在同一个版本控制仓库中的开发策略。与传统的每个项目单独一个仓库（Multirepo）不同，Monorepo 允许：

- 共享代码和工具链
- 统一的构建和测试流程
- 跨项目的原子提交
- 简化的依赖管理

**类比**：想象一家大型超市（Monorepo）与多个小专卖店（Multirepo）的区别。在超市中，所有商品集中管理，共享库存系统和收银台，顾客可以一次性购买所有需要的商品；而专卖店则需要分别前往，各自独立运营。

### 2.2 为什么需要 Monorepo？

1. **依赖管理简化**：在 Multirepo 中，跨项目的依赖更新需要分别发布和安装，而 Monorepo 可以直接引用本地其他项目
2. **代码共享便捷**：公共工具和组件可以轻松被所有项目使用
3. **一致性保证**：统一的代码风格、构建工具和测试流程
4. **重构安全**：跨项目的变更可以原子提交，避免破坏性更新

### 2.3 常见 Monorepo 方案比较

| 方案        | 语言生态   | 特点                                                                 | 代表用户         |
|-------------|------------|----------------------------------------------------------------------|------------------|
| pnpm workspace | JavaScript | 基于软链接的依赖管理，磁盘空间高效                                   | Vue 3, Vite      |
| Yarn workspace | JavaScript | Yarn 内置支持，简单易用                                              | React Native     |
| Lerna       | JavaScript | 老牌方案，支持版本管理和发布                                         | Babel, Jest      |
| Rush        | JavaScript | 微软出品，适合超大型项目                                             | Office 365       |
| Bazel       | 多语言     | Google 出品，构建性能极高，学习曲线陡峭                              | Angular          |
| Nx          | 多语言     | 功能全面，支持任务编排和云缓存                                       | NestJS           |

## 3. 具体示例

### 3.1 pnpm workspace 基础结构

一个典型的 pnpm workspace 项目结构如下：

```
monorepo/
├── package.json
├── pnpm-workspace.yaml
├── packages/
│   ├── shared/          # 共享工具库
│   │   ├── package.json
│   │   └── src/
│   ├── web-app/         # 前端应用
│   │   ├── package.json
│   │   └── src/
│   └── server/          # 后端服务
│       ├── package.json
│       └── src/
└── pnpm-lock.yaml
```

`pnpm-workspace.yaml` 内容：

```yaml
packages:
  - 'packages/*'
```

### 3.2 跨包依赖示例

假设 `web-app` 需要依赖 `shared` 包：

1. 在 `web-app/package.json` 中添加：

```json
{
  "dependencies": {
    "shared": "workspace:*"
  }
}
```

2. 运行 `pnpm install` 后，pnpm 会创建符号链接，使 `web-app/node_modules/shared` 指向本地 `shared` 包

### 3.3 对比传统 Multirepo 流程

**Multirepo 流程**：
1. 修改 shared 库代码
2. 发布 shared 新版本到 npm
3. 在 web-app 中更新 shared 版本号
4. 安装更新

**Monorepo 流程**：
1. 修改 shared 库代码
2. web-app 自动获取最新变更（通过符号链接）
3. 测试通过后可以原子提交所有变更

## 4. 实践要点

### 4.1 何时选择 Monorepo？

适合场景：
- 多个紧密相关的项目
- 需要频繁共享代码
- 团队需要统一的工作流程
- 项目之间有复杂的依赖关系

不适合场景：
- 完全不相关的项目
- 需要不同权限控制的场景
- 超大规模代码库（除非使用 Bazel 等专业工具）

### 4.2 pnpm workspace 最佳实践

1. **目录结构规划**：
   - 按功能或团队划分子项目
   - 保持一致的命名规范（如 `packages/<name>`）

2. **依赖管理**：
   - 使用 `workspace:*` 协议声明内部依赖
   - 统一外部依赖版本（通过 `.pnpmfile.cjs` 或工作区根 `package.json`）

3. **脚本管理**：
   - 在根目录定义公共脚本
   - 使用 `pnpm -r` 在所有子项目中运行命令

```bash
# 在所有子项目中运行测试
pnpm -r run test
```

4. **性能优化**：
   - 利用 pnpm 的硬链接机制节省磁盘空间
   - 使用 `--filter` 只构建受影响的项目

```bash
# 只构建 web-app 及其依赖
pnpm --filter web-app... run build
```

5. **版本发布**：
   - 对于需要独立版本管理的场景，可结合 Changesets 或 Lerna
   - 对于统一版本管理的场景，直接使用根 `package.json` 版本

### 4.3 常见陷阱与解决方案

1. **循环依赖**：
   - 问题：A 依赖 B，B 又依赖 A
   - 解决：重构代码，提取公共部分到第三个包

2. **构建顺序问题**：
   - 问题：构建时依赖包尚未构建
   - 解决：使用 `pnpm -r --stream` 按拓扑顺序构建

3. **IDE 支持**：
   - 问题：IDE 无法正确解析工作区依赖
   - 解决：在 VSCode 中安装 `pnpm` 插件，或配置 TypeScript 路径映射

## 5. 小结

Monorepo 通过统一管理多个相关项目，显著提升了开发效率和一致性。在 JavaScript 生态中，pnpm workspace 凭借其高效的依赖管理和磁盘利用率，成为越来越受欢迎的选择。关键优势包括：

1. 通过符号链接实现高效的本地依赖管理
2. 节省大量磁盘空间（相比 npm/yarn）
3. 灵活的工作区过滤和任务执行
4. 与现有工具链良好集成

实施 Monorepo 时需要特别注意项目结构规划、依赖管理和构建优化。对于大多数中小型项目，pnpm workspace 提供了足够的功能且学习曲线平缓，是进入 Monorepo 世界的理想起点。

**下一步学习**：在掌握了 Monorepo 基本概念后，可以进一步学习 pnpm workspace 的高级特性，如过滤命令、自定义解析器，或者探索如何与 Changesets 结合实现自动化版本发布。