# Leap Mind 技术文档

本文档详细说明了 Leap Mind 项目的技术实现，重点介绍其前端和后端路由设计。

## 1. 技术栈

- **框架**: Next.js (React)
- **语言**: TypeScript
- **API**: tRPC
- **数据库**: Prisma (PostgreSQL)
- **UI 组件**: shadcn/ui, Radix UI
- **状态管理**: Zustand
- **AI 集成**: OpenAI API

## 2. 前端路由 (Next.js App Router)

前端路由基于 `src/app` 目录结构进行组织，实现了清晰、直观的页面导航。

| 路由 (URL) | 文件路径 | 描述 |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | 应用的着陆页和主页。 |
| `/dashboard` | `src/app/dashboard/page.tsx` | 用户仪表盘，展示用户的课程、进度和成就。 |
| `/explore` | `src/app/explore/page.tsx` | 课程发现页面，用户可以在此浏览和搜索公开课程。 |
| `/create` | `src/app/create/page.tsx` | 课程创建页面，允许用户输入主题和描述来生成新的课程大纲。 |
| `/course/{id}` | `src/app/course/[id]/page.tsx` | 单个课程的详情页面，展示课程章节和内容。`{id}` 是课程的唯一标识符。 |
| `/course/{id}/{chapterId}` | `src/app/course/[id]/[chapterId]/page.tsx` | 特定章节的学习页面，用户在此进行学习和互动测验。 |
| `/bookmarks` | `src/app/bookmarks/page.tsx` | 用户的收藏页面，展示用户收藏的课程列表。 |
| `/manage` | `src/app/manage/page.tsx` | 课程管理页面，允许课程创建者编辑和管理他们的课程。 |
| `/profile` | `src/app/profile/page.tsx` | 用户个人资料页面，展示账户信息、积分和成就。 |
| `/api/auth/...` | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth.js 的认证路由，处理用户登录、登出等会话管理。 |

## 3. 后端路由 (tRPC API)

后端 API 使用 tRPC 构建，确保了类型安全和前后端之间的无缝集成。路由定义在 `src/server/api/routers/` 目录下。

### 3.1 `course.ts`

处理与课程相关的操作。

| 路由 | 输入参数 | 描述 |
| :--- | :--- | :--- |
| `generateTitleAndDescription` | `{ userInput: string }` | (Mutation) 使用 AI 根据用户输入生成课程标题和描述。 |
| `createOutline` | `{ title: string, description: string, level: string }` | (Mutation) 创建课程大纲，包括课程记录和AI生成的章节结构。 |
| `getUserCourses` | (无) | (Query) 获取当前登录用户的所有课程及其进度。 |
| `getById` | `{ id: string }` | (Query) 获取指定 ID 的课程详情。 |
| `getPublicCourses` | `{ limit: number, cursor: string }` | (Query) 获取公开课程列表，用于内容广场，支持分页。 |

### 3.2 `chapter.ts`

处理与章节相关的操作。

| 路由 | 输入参数 | 描述 |
| :--- | :--- | :--- |
| `getById` | `{ id: string }` | (Query) 获取指定 ID 的章节内容。 |
| `saveContent` | `{ chapterId: string, content: string }` | (Mutation) 保存AI生成的章节内容。 |
| `rateQuality` | `{ chapterId: string, score: number }` | (Mutation) 用户对章节内容质量进行评分。 |
| `generateContent` | `{ chapterId: string, regenerate: boolean }` | (Mutation) 为指定章节生成或重新生成学习内容。 |

### 3.3 `assessment.ts` & `learningVerification.ts`

处理学习验证、测验和评估。

| 路由 | 文件 | 输入参数 | 描述 |
| :--- | :--- | :--- | :--- |
| `submit` | `assessment.ts` | `{ chapterId, answers, score, feedback, canProgress, pointsEarned }` | (Mutation) 提交整个章节的评估答案，记录分数，并在通过时解锁下一章及更新积分。 |
| `getHistory` | `assessment.ts` | `{ chapterId?: string, courseId?: string }` | (Query) 获取用户在特定章节或课程的评估历史。 |
| `getOrGenerateQuestions` | `learningVerification.ts` | `{ chapterId: string }` | (Query) 获取或为章节生成苏格拉底式测验问题。 |
| `submitAnswer` | `learningVerification.ts` | `{ questionId: string, answer: string }` | (Mutation) 提交单个问题的答案。 |
| `evaluateAnswers` | `learningVerification.ts` | `{ chapterId: string, answers: object }` | (Mutation) 批量评估章节所有答案，计算总分，授予积分，并决定用户是否可以进入下一章。 |
| `getAssessment` | `learningVerification.ts` | `{ chapterId: string }` | (Query) 获取特定章节的最新评估结果。 |

### 3.4 `points.ts`

处理与用户积分和排行榜相关的操作。

| 路由 | 输入参数 | 描述 |
| :--- | :--- | :--- |
| `getUserPoints` | (无) | (Query) 获取当前用户的总积分、等级和经验值。 |
| `getHistory` | `{ limit: number, cursor: string }` | (Query) 获取用户的积分历史记录，支持分页。 |
| `getLeaderboard` | `{ sortBy: 'points' \| 'level', limit: number }` | (Query) 获取按积分或等级排序的用户排行榜。 |

### 3.5 `achievements.ts`

处理与成就相关的操作。

| 路由 | 输入参数 | 描述 |
| :--- | :--- | :--- |
| `getAll` | (无) | (Query) 获取所有可用的成就及其定义，并标识用户是否已解锁。 |
| `getUserAchievements` | (无) | (Query) 获取当前用户已解锁的所有成就。 |
| `checkAndUnlock` | (无) | (Mutation) 检查并解锁用户符合条件的新成就。 |

## 4. 数据库模型 (`schema.prisma`)

核心数据模型定义在 `prisma/schema.prisma` 文件中，包括 `User`, `Course`, `Chapter`, `Assessment`, `UserPoints`, `Achievement` 等，以及相关的枚举类型，共同支撑了整个应用的功能和数据存储。