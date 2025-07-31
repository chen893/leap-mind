# Leap Mind 游戏化系统架构设计

## 1. 前端路由结构

### 1.1 主要路由

```typescript
// src/app 目录结构
├── dashboard/           // 用户仪表板
│   ├── page.tsx        // 主页面：显示用户学习概览、成就、积分等
│   └── components/     // 仪表板组件
│       ├── UserStats.tsx          // 用户统计信息
│       ├── RecentActivities.tsx   // 最近活动
│       └── LearningStreak.tsx     // 学习连续打卡
├── profile/[userId]/   // 用户个人主页
│   ├── page.tsx        // 个人主页：展示详细的用户信息和成就
│   └── components/     // 个人主页组件
│       ├── UserInfo.tsx           // 用户基本信息
│       ├── AchievementWall.tsx    // 成就墙
│       └── LearningHistory.tsx    // 学习历史
├── leaderboard/        // 排行榜页面
│   ├── page.tsx        // 主页面：展示全局和好友排行
│   └── components/     // 排行榜组件
│       ├── GlobalRanking.tsx      // 全球排名
│       └── FriendsRanking.tsx     // 好友排名
└── achievements/       // 成就系统页面
    ├── page.tsx        // 主页面：展示所有可获得的成就
    └── components/     // 成就相关组件
        ├── AchievementList.tsx    // 成就列表
        └── AchievementCard.tsx    // 成就卡片
```

### 1.2 现有路由的组件补充

```typescript
// src/app/course/[id] 补充组件
├── components/
    ├── CourseProgress.tsx     // 课程进度组件，显示完成度和获得积分
    ├── ChapterRewards.tsx     // 章节奖励组件，显示可获得的积分和成就
    └── AssessmentResult.tsx   // 评估结果组件，显示得分和获得的积分
```

## 2. Zustand Store 设计

### 2.1 积分系统 Store

```typescript
// src/store/pointsStore.ts
interface PointsStore {
  // 状态
  points: number
  level: number
  experience: number
  streak: number
  lastLoginDate: Date
  pointsHistory: PointsHistory[]
  
  // 操作
  updatePoints: (newPoints: number) => void
  updateStreak: () => void
  addPointsHistory: (history: PointsHistory) => void
  resetDailyTasks: () => void
}
```

### 2.2 成就系统 Store

```typescript
// src/store/achievementsStore.ts
interface AchievementsStore {
  // 状态
  unlockedAchievements: Achievement[]
  availableAchievements: Achievement[]
  recentUnlocks: Achievement[]
  
  // 操作
  unlockAchievement: (achievementId: string) => void
  checkAchievements: () => void
  clearRecentUnlocks: () => void
}
```

### 2.3 学习验证 Store

```typescript
// src/store/learningVerificationStore.ts
interface LearningVerificationStore {
  // 状态
  currentAssessment: Assessment | null
  answers: Record<string, string>
  isSubmitting: boolean
  result: AssessmentResult | null
  
  // 操作
  startAssessment: (chapterId: string) => void
  submitAnswer: (questionId: string, answer: string) => void
  submitAssessment: () => Promise<void>
  resetAssessment: () => void
}
```

## 3. 类型定义

### 3.1 从 Prisma Schema 派生的类型

```typescript
// src/types/prisma.ts
import { Prisma } from '@prisma/client'

// 用户积分记录
export type UserPoints = Prisma.UserPointsGetPayload<{
  include: {
    user: true
    pointsHistory: true
  }
}>

// 积分历史
export type PointsHistory = Prisma.PointsHistoryGetPayload<{
  include: {
    userPoints: true
  }
}>

// 成就记录
export type Achievement = Prisma.AchievementGetPayload<{
  include: {
    unlockedBy: true
  }
}>

// 用户成就
export type UserAchievement = Prisma.UserAchievementGetPayload<{
  include: {
    achievement: true
    user: true
  }
}>
```

### 3.2 从 tRPC 路由派生的类型

```typescript
// src/types/api.ts
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/server/api/root'

// API 输入类型
export type RouterInput = inferRouterInputs<AppRouter>
export type PointsRouterInput = RouterInput['points']
export type AchievementsRouterInput = RouterInput['achievements']

// API 输出类型
export type RouterOutput = inferRouterOutputs<AppRouter>
export type PointsRouterOutput = RouterOutput['points']
export type AchievementsRouterOutput = RouterOutput['achievements']
```

### 3.3 组件 Props 类型

```typescript
// src/types/components.ts

// 积分显示组件 Props
export interface PointsDisplayProps {
  points: number
  level: number
  experience: number
  nextLevelExperience: number
  streak: number
  className?: string
}

// 成就展示组件 Props
export interface AchievementDisplayProps {
  achievement: Achievement
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  className?: string
}

// 排行榜组件 Props
export interface LeaderboardProps {
  type: 'global' | 'friends'
  timeRange: 'daily' | 'weekly' | 'monthly' | 'allTime'
  limit?: number
  className?: string
}

// 评估结果组件 Props
export interface AssessmentResultProps {
  score: number
  pointsEarned: number
  achievements?: Achievement[]
  onClose: () => void
  className?: string
}
```

## 4. 组件设计

### 4.1 积分相关组件

```typescript
// src/components/points/
├── PointsDisplay.tsx       // 积分显示组件
├── ExperienceBar.tsx       // 经验条组件
├── PointsHistory.tsx       // 积分历史组件
└── StreakCounter.tsx       // 连续打卡计数器
```

### 4.2 成就相关组件

```typescript
// src/components/achievements/
├── AchievementCard.tsx        // 成就卡片组件
├── AchievementProgress.tsx    // 成就进度组件
├── AchievementNotification.tsx // 成就解锁通知组件
└── AchievementWall.tsx        // 成就墙组件
```

### 4.3 排行榜相关组件

```typescript
// src/components/leaderboard/
├── LeaderboardTable.tsx    // 排行榜表格组件
├── RankingCard.tsx         // 排名卡片组件
└── TimeRangeSelector.tsx   // 时间范围选择器
```

### 4.4 学习验证相关组件

```typescript
// src/components/learning-verification/
├── AssessmentQuestion.tsx     // 评估问题组件
├── AssessmentProgress.tsx     // 评估进度组件
├── AssessmentResult.tsx       // 评估结果组件
└── PointsAnimation.tsx        // 积分动画组件
```

## 5. 状态管理最佳实践

1. Store 之间的通信
   - 使用 subscribe 监听其他 store 的状态变化
   - 在需要时使用 getState 获取其他 store 的状态
   - 避免循环依赖

2. 性能优化
   - 使用 shallow 比较避免不必要的重渲染
   - 将大型 store 拆分为多个小型 store
   - 使用 devtools 中间件进行调试

3. 持久化处理
   - 使用 persist middleware 持久化关键数据
   - 实现自动同步机制确保多标签页数据一致性

## 6. 组件通信模式

1. 父子组件通信
   - Props 传递数据和回调函数
   - 使用 React.Context 处理深层组件树

2. 跨组件通信
   - 使用 Zustand store 管理共享状态
   - 实现发布订阅模式处理事件

3. 动画和过渡效果
   - 使用 Framer Motion 实现流畅的动画
   - 实现积分增加和成就解锁的动画效果

## 7. 错误处理和加载状态

1. 错误边界
   - 实现全局错误边界捕获渲染错误
   - 为关键组件添加独立的错误边界

2. 加载状态
   - 使用 Suspense 和 React.lazy 优化加载体验
   - 实现骨架屏提升用户体验

3. 错误提示
   - 统一的错误提示组件
   - 友好的错误信息展示