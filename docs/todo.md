
### **技术规格文档：前后端路由结构**

  * **项目:** "智学奇点" (Singularity Scholar)
  * **版本:** `1.0`
  * **状态:** `定稿 (Final)`
  * **日期:** `2025年7月21日`

### **1. 概述 (Overview)**

本文档定义了"智学奇点"项目v1.0版本的前后端路由和API结构。项目技术栈核心为 **Next.js (App Router)**、**tRPC**、**Vercel AI SDK**、shadcn/ui、**@tanstack/react-query** 和 **zustand**。

为了兼顾开发效率、类型安全与核心功能的稳定性，我们采用一种**混合API架构模式**：

  * **tRPC:** 用于处理所有常规的、结构化的数据交换（如获取用户信息、提交表单等），以实现端到端的类型安全。
  * **Vercel AI SDK:** 用于处理AI内容的**流式（Streaming）响应**，提供更好的用户体验和性能优化。
  * **@tanstack/react-query:** 通过tRPC集成，提供强大的数据获取、缓存和同步功能。
  * **zustand:** 用于管理客户端状态，如用户界面状态、临时数据等。

### **2. 技术栈详细说明**

#### **2.1 状态管理架构**

  * **@tanstack/react-query (TanStack Query):** 通过tRPC集成，处理所有服务器状态管理
    - 自动缓存API响应
    - 后台数据同步
    - 乐观更新
    - 错误处理和重试机制
  
  * **zustand:** 处理客户端状态管理
    - UI状态（如模态框开关、表单状态）
    - 用户偏好设置
    - 临时数据存储
    - 跨组件状态共享

#### **2.2 AI集成架构**

  * **Vercel AI SDK:** 替代原有的专用流式API方案
    - 使用 `ai/rsc` 进行React Server Components集成
    - 使用 `ai/react` 的 `useChat` hook处理流式对话
    - 内置的流式响应优化和错误处理
    - 更好的TypeScript支持

### **3. 前端路由结构 (Frontend Route Structure)**

前端路由遵循Next.js App Router的文件即路由约定，目录结构直接映射为用户可访问的URL。

#### **3.1 目录结构 (`app/`)**

```
app/
├── (auth)
│   ├── login/page.tsx              # 登录页面
│   └── layout.tsx                  # 认证页面的独立布局
│
├── (main)
│   ├── course/[courseId]/
│   │   ├── chapter/[chapterId]/
│   │   │   ├── page.tsx            # 章节学习与评估页面 (使用Vercel AI SDK)
│   │   │   └── loading.tsx         # 学习页面的加载UI
│   │   └── page.tsx                # 课程详情/大纲页
│   │
│   ├── resume/
│   │   ├── page.tsx                # 个人学习履历页面
│   │   └── loading.tsx         # 履历页面的加载UI
│   │
│   ├── square/
│   │   ├── page.tsx                # 社区内容广场页面
│   │   └── loading.tsx         # 广场页面的加载UI
│   │
│   └── layout.tsx                  # 主应用布局（包含导航栏等）
│
├── api/
│   ├── ai/
│   │   ├── generate-chapter/
│   │   │   └── route.ts            # [Vercel AI SDK] AI流式内容生成API
│   │   └── chat/
│   │       └── route.ts            # [Vercel AI SDK] AI对话API
│   │
│   ├── auth/[...nextauth]/
│   │   └── route.ts                # NextAuth.js 认证API
│   └── trpc/[trpc]/
│       └── route.ts                # tRPC 单一入口API
│
├── layout.tsx                      # 全局根布局 (注入Providers)
└── page.tsx                        # 应用首页 / 落地页
```



### **4. 后端API结构 (Backend API Structure)**

后端API分为两部分：Vercel AI SDK驱动的AI API和tRPC路由。

#### **4.1 Vercel AI SDK集成**

**章节内容生成API:**
  * **端点路径:** `POST /api/ai/generate-chapter`
  * **文件位置:** `app/api/ai/generate-chapter/route.ts`
  * **技术栈:** Vercel AI SDK + OpenAI
  * **示例实现:**
    ```tsx
    import { openai } from '@ai-sdk/openai'
    import { streamText } from 'ai'
    
    export async function POST(req: Request) {
      const { chapterId, prompt } = await req.json()
      
      const result = await streamText({
        model: openai('gpt-4o'),
        prompt: `Generate chapter content for: ${prompt}`,
      })
      
      return result.toAIStreamResponse()
    }
    ```

**AI对话API:**
  * **端点路径:** `POST /api/ai/chat`
  * **文件位置:** `app/api/ai/chat/route.ts`
  * **功能:** 处理评估问答、提示请求等交互

#### **4.2 tRPC 路由 (tRPC Routes)**

所有非AI的、结构化的数据交换均通过tRPC进行，集成@tanstack/react-query。

##### **`courseRouter` - 课程相关API**

| tRPC路径 | 类型 | 描述 | React Query集成 |
| :--- | :--- | :--- | :--- |
| `course.createOutline` | `mutation` | 创建课程大纲 | 自动失效相关查询缓存 |
| `course.clone` | `mutation` | 克隆社区课程 | 乐观更新用户课程列表 |
| `course.publish` | `mutation` | 发布课程到广场 | 更新课程状态缓存 |
| `course.getById` | `query` | 获取单个课程详情 | 自动缓存和后台刷新 |
| `course.getPublicCourses`| `query` | 获取内容广场课程列表 | 分页和无限滚动支持 |
| `course.getUserCourses` | `query` | 获取用户学习履历 | 实时同步用户数据 |

##### **`chapterRouter` - 章节相关API**

| tRPC路径 | 类型 | 描述 | 状态管理集成 |
| :--- | :--- | :--- | :--- |
| `chapter.saveContent` | `mutation` | 保存AI生成的内容 | 配合zustand管理生成状态 |
| `chapter.getById` | `query` | 获取章节内容 | 缓存优化，减少重复请求 |
| `chapter.rateQuality` | `mutation` | 内容质量评分 | 乐观更新UI反馈 |

##### **`assessmentRouter` - 评估相关API**

| tRPC路径 | 类型 | 描述 |
| :--- | :--- | :--- |
| `assessment.submit`| `mutation` | 提交评估答案 |
| `assessment.getHistory` | `query` | 获取评估历史 |

### **5. 开发任务清单更新**

#### **前置准备 (Prerequisites)**

* [ ] **[CONFIG]** - **安装新依赖包:**
    ```bash
    pnpm add ai @ai-sdk/openai @tanstack/react-query zustand
    pnpm add -D @types/node
    ```

* [ ] **[CONFIG]** - **配置环境变量:**
    * 在 `.env` 文件中添加 `OPENAI_API_KEY`
    * 在 `src/env.js` 中添加对应的Zod schema验证

#### **阶段零：项目初始化与基础建设**

* [ ] **[FE][P0]** - **配置状态管理:**
    * **文件:** `src/trpc/react.tsx`
    * **任务:** 确保tRPC正确集成@tanstack/react-query
    * **文件:** `src/stores/`
    * **任务:** 创建zustand stores用于UI状态管理

* [ ] **[BE][P0]** - **集成Vercel AI SDK:**
    * **文件:** `src/app/api/ai/generate-chapter/route.ts`
    * **任务:** 使用Vercel AI SDK替代原有的流式API实现
    * **文件:** `src/app/api/ai/chat/route.ts`
    * **任务:** 创建AI对话端点用于评估和问答

#### **阶段一：核心学习闭环端到端实现**

* [ ] **[FE][P0]** - **实现AI流式内容显示:**
    * **文件:** `src/app/(main)/course/[courseId]/chapter/[chapterId]/page.tsx`
    * **任务:** 使用Vercel AI SDK的 `useChat` 或 `useCompletion` hook
    * **集成:** 配合zustand管理生成状态，使用tRPC保存最终内容

* [ ] **[FE][P0]** - **优化数据获取和缓存:**
    * **任务:** 利用@tanstack/react-query的缓存机制优化用户体验
    * **实现:** 预取相关章节内容，智能缓存策略

#### **阶段二：社区与分享功能**

* [ ] **[FE][P0]** - **实现响应式状态管理:**
    * **任务:** 使用zustand管理复杂的UI状态（如课程发布流程、克隆状态等）
    * **集成:** 与tRPC mutations配合，提供流畅的用户体验

#### **阶段三：性能优化**

* [ ] **[OPT][P1]** - **React Query优化:**
    * 实现智能预取策略
    * 配置适当的缓存时间和失效策略
    * 实现乐观更新减少感知延迟

* [ ] **[OPT][P1]** - **AI响应优化:**
    * 使用Vercel AI SDK的流式响应优化
    * 实现响应缓存和智能重试机制

### **6. 技术决策说明**

#### **6.1 为什么选择Vercel AI SDK**

1. **更好的流式体验:** 内置的流式响应优化和错误处理
2. **TypeScript支持:** 完整的类型安全保障
3. **React集成:** 专为React应用设计的hooks和组件
4. **性能优化:** 自动的响应压缩和缓存机制

#### **6.2 状态管理架构选择**

1. **@tanstack/react-query + tRPC:** 处理所有服务器状态，提供缓存、同步、错误处理
2. **zustand:** 轻量级客户端状态管理，避免Redux的复杂性
3. **清晰的职责分离:** 服务器状态vs客户端状态，避免状态管理混乱

#### **6.3 开发效率考虑**

1. **端到端类型安全:** tRPC + TypeScript确保API契约的一致性
2. **开发体验优化:** React Query DevTools + Zustand DevTools提供强大的调试能力
3. **代码复用:** 通过合理的抽象减少重复代码
```


        