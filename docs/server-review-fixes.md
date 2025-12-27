# 服务端代码审计修复记录（2025-12-27）

本文记录一次针对服务端（tRPC Router + Next.js API Routes）的安全与逻辑问题修复，重点覆盖：越权访问/数据泄露、学习流程校验、积分/等级逻辑、分页游标与统计计数等。

## 1. 访问控制与数据泄露修复

### 1.1 课程详情 `course.getById`

- 访问控制：课程可见性规则调整为 `公开` / `创建者` / `已加入` 才可访问；私有课程对无权限用户返回 `NOT_FOUND`，避免泄露资源存在性。
- 返回字段收敛：章节仅返回必要元信息（不包含用户进度等敏感关联数据），并显式避免把 `userProgresses` 透出给前端。

### 1.2 章节内容 `chapter.getById`

- 私有课程：必须为创建者或已加入用户，否则返回 `NOT_FOUND`。
- 非创建者访问规则：
  - 未加入：仅允许公开课程的第 1 章预览，否则 `FORBIDDEN`。
  - 已加入：需要章节解锁（`UNLOCKED/COMPLETED`，或第 1 章），未解锁时返回章节元信息但 `contentMd: null`，避免内容泄露。

### 1.3 移除不安全的章节获取接口

- 删除 `course.getChapterById`（历史上容易被绕过课程权限直接读取章节内容）。
- 前端改为统一使用 `chapter.getById`，并适配“未解锁返回 `contentMd: null`”的行为。

### 1.4 学习验证与 SSE / AI 接口权限加固

- 学习验证（`learningVerification`）相关操作统一校验：必须已加入课程，且章节对非创建者必须已解锁后才能触发生成/提交/评分等关键动作。
- SSE（`/api/learning-verification/sse`）：
  - 强制鉴权（无登录返回 `401`）。
  - 校验章节访问权限（创建者/已加入；非创建者还需章节已解锁或为第 1 章）。
  - 移除宽松 CORS 逻辑，避免跨站读取学习状态。
- AI 对话（`/api/ai/chat`）：增加 `zod` 请求体校验，并按“创建者/已加入 + 章节解锁”规则限制访问。

## 2. 业务逻辑修复

### 2.1 积分与等级（多级升级 + 统一记账）

- `updateUserPoints` 支持一次性获得大量经验导致的“连续升级”，避免只升一级造成经验/等级不一致。
- 积分历史记录增加可选 `description`，便于审计与运营分析。
- 成就奖励积分改为复用 `updateUserPoints`，避免“加了积分但没写历史/没触发升级”的不一致问题。

### 2.2 分页游标错误修复

- 多处列表分页修复 `cursor` 场景下未 `skip: 1` 导致重复返回上一页最后一条的问题。

### 2.3 课程加入人数统计修复

- `joinedByCount` 仅在用户首次加入课程时递增，避免重复加入导致的计数膨胀。

### 2.4 AI 章节生成接口修复

- `/api/ai/generate-chapter` 入参统一为 `{ chapterId, level, regenerate }`。
- 限制为课程创建者可生成/重生成，避免学习者覆盖共享内容。

## 3. 兼容性说明（可能影响前端行为）

- 章节内容接口对未解锁章节会返回 `contentMd: null`；前端应把它视为“可见但不可读”，而不是“请求失败”。
- 私有课程/章节对无权限用户返回 `NOT_FOUND`（资源不可枚举）。
- SSE / AI 接口在无权限时返回 `401/403`，前端需做相应提示或回退。

## 4. 相关代码位置

- `src/server/api/routers/course.ts`
- `src/server/api/routers/chapter.ts`
- `src/server/api/routers/learningVerification.ts`
- `src/server/api/routers/achievements.ts`
- `src/app/api/learning-verification/sse/route.ts`
- `src/app/api/ai/chat/route.ts`
- `src/app/api/ai/generate-chapter/route.ts`
- `src/components/course-content-area.tsx`
- `src/components/chapter-content.tsx`

