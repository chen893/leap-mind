# "智学奇点"游戏化系统技术文档

## 1. 概述

本文档旨在为"智学奇点"项目的游戏化系统提供全面的技术规范和实现指南。游戏化系统旨在通过引入积分、等级、成就和排行榜等机制，增强用户参与度和学习动机。

本文档基于产品需求文档（PRD）进行设计，并结合了现有的代码实现，为前端和后端开发人员提供清晰的指引。

## 2. 系统架构

游戏化系统是"智学奇点"核心学习体验的一部分，其架构与主应用紧密集成。系统主要由以下几个部分组成：

- **前端 (Next.js/React)**: 负责展示用户的积分、等级、成就等信息，并提供与游戏化功能交互的界面。
- **后端 (tRPC)**: 提供了一组类型安全的 API，用于处理所有与游戏化相关的业务逻辑，如积分计算、成就解锁等。
- **数据库 (PostgreSQL + Prisma)**: 持久化存储所有游戏化相关的数据，包括用户积分、历史记录、成就定义和用户成就。

数据流如下：
1.  用户在前端完成特定操作（如完成一个章节评估）。
2.  前端调用后端相应的 tRPC `mutation`。
3.  后端服务处理业务逻辑（如计算得分、判断是否升级、检查是否有成就解锁）。
4.  后端更新数据库中的相关记录。
5.  前端通过 tRPC `query` 获取最新的游戏化状态并更新UI。

## 3. 数据模型

以下是游戏化系统的核心数据模型，详细定义请参考 `prisma/schema.prisma` 文件。

- **UserPoints**: 存储用户的核心游戏化数据，如总积分、等级、经验值和连续学习天数。
- **PointsHistory**: 记录每一次积分变化的详细历史，包括原因、分值和时间戳。
- **Achievement**: 定义了所有可用的成就，包括名称、描述、解锁条件和奖励积分。
- **UserAchievement**: 记录用户已解锁的成就。
- **Assessment**: 存储用户完成章节评估的记录，这是获取积分的主要来源之一。

## 4. 后端 API (tRPC Routers)

游戏化系统的后端逻辑主要通过以下 tRPC 路由实现。

### 4.1 `points.ts`

此路由负责管理用户的积分、等级和排行榜。

- **`getUserPoints` (query)**: 获取当前登录用户的积分、等级、经验值和最近的积分历史。如果用户是首次交互，会自动为其创建初始积分记录。
- **`getPointsHistory` (query)**: 分页获取当前用户的积分历史记录。
- **`getLeaderboard` (query)**: 获取积分或等级排行榜，并返回当前用户的排名。
- **`updateStreak` (mutation)**: 更新用户的连续学习天数，并根据连续天数给予奖励积分。
- **`getUserStats` (query)**: 获取用户的综合统计数据，包括完成的课程/章节数、平均分和成就数。

### 4.2 `achievements.ts`

此路由负责管理成就的定义和解锁逻辑。

- **`getAllAchievements` (query)**: 获取所有成就的定义列表，并附带当前用户是否已解锁的状态。
- **`getUserAchievements` (query)**: 获取当前用户已解锁的所有成就列表。
- **`checkAndUnlockAchievements` (mutation)**: 检查并解锁用户可能已达成的成就。这是一个核心的 `mutation`，应在可能触发成就的多个关键节点（如课程完成、等级提升）后调用。
- **`initializeDefaultAchievements` (mutation)**: 用于在系统初始化时创建一组默认的成就。这是一个管理性质的接口。

### 4.3 `assessment.ts` & `learningVerification.ts`

这两个文件共同处理学习评估和大部分积分的授予逻辑。

- **`assessmentRouter.submit` (mutation)**: 提交用户的评估结果。在评估通过（`canProgress: true`）且有积分奖励时，会调用 `updateUserPoints` 函数来更新用户积分。
- **`learningVerificationRouter.evaluateAnswers` (mutation)**: 批量评估用户对一个章节所有问题的回答。这是积分计算的核心触发点之一。它会根据用户的回答准确率和平均分计算 `pointsEarned`，并在用户通过验证后调用 `updateUserPoints`。

## 5. 核心业务流程

### 5.1 积分获取流程

1.  **主要来源**: 用户完成一个章节的学习并通过评估 (`learningVerification.evaluateAnswers`)。
2.  **计算逻辑**:
    - 基础分：基于评估的平均分计算。
    - 奖励分：如果平均分高于某一阈值（如90分），则给予额外奖励。
    - 全通奖励：如果所有问题都回答正确，则给予额外奖励。
3.  **其他来源**:
    - **连续学习**: 调用 `points.updateStreak`，根据连续学习天数给予每日奖励。
    - **解锁成就**: 调用 `achievements.checkAndUnlockAchievements`，解锁成就时会附带积分奖励。

### 5.2 等级提升流程

等级提升逻辑被封装在 `learningVerification.ts` 的 `updateUserPoints` 辅助函数中。

1.  **触发**: 每当用户获得积分时，`updateUserPoints` 就会被调用。
2.  **逻辑**:
    - 用户的 `currentExp` 增加获得的积分数。
    - 判断 `currentExp` 是否大于或等于 `expToNextLevel`。
    - 如果是，则用户等级 `level` +1。
    - `currentExp` 减去上一等级的 `expToNextLevel`，作为新等级的初始经验值。
    - `expToNextLevel` 根据新的等级重新计算（例如：`newLevel * 100`）。

### 5.3 成就解锁流程

1.  **触发**: 在关键业务节点完成后，应调用 `achievements.checkAndUnlockAchievements`。
    - **建议触发点**: 课程完成时、章节评估通过时、用户升级时、每日登录时。
2.  **逻辑**:
    - `checkAndUnlockAchievements` 获取用户的各项统计数据（如完成的课程数、总积分、连续学习天数等）。
    - 遍历所有未解锁的成就，检查其 `condition` 是否满足。
    - 如果满足，则在 `UserAchievement` 表中创建一条新记录。
    - 调用 `updateUserPoints` 给予该成就附带的积分奖励。

## 6. 前端集成建议

- **状态管理**: 使用 `@tanstack/react-query` 来管理从后端获取的游戏化数据，以实现自动缓存、重新获取和状态同步。
- **实时通知**: 当用户解锁成就或升级时，使用 `sonner` 或类似的 toast 库，在界面上显示即时的、非阻塞式的祝贺通知。
- **数据展示**: 创建专门的组件来展示用户的个人资料中的游戏化元素，例如：
    - `PointsSummary.tsx`: 显示总积分、等级和经验条。
    - `AchievementsList.tsx`: 展示用户已解锁和未解锁的成就。
    - `Leaderboard.tsx`: 渲染排行榜。
- **触发成就检查**: 在前端完成一个可能触发成就的操作后（例如，在课程完成页面的 `useEffect` 中），应调用 `checkAndUnlockAchievements` mutation。为避免不必要的调用，可以设置一些简单的客户端检查逻辑。