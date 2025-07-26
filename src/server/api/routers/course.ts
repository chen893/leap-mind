import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const titleDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const courseRouter = createTRPCRouter({
  // 生成课程标题和描述
  generateTitleAndDescription: protectedProcedure
    .input(
      z.object({
        userInput: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `
角色: 你是一位经验丰富的在线课程设计师和教育内容策划专家。你擅长将用户模糊的学习想法转化为一个结构清晰、引人注目的课程概念。

任务描述:
你的任务是接收一段由用户提供的学习需求描述。这段描述可能很简洁，甚至只有一个关键词。你需要基于这个需求，提炼并创作出一个专业的课程标题（title）和一个详细、有吸引力的课程描述（description）。

* 对于\`title\`: 标题应该精炼、专业，并能准确概括课程的核心内容，吸引目标学习者。例如，对于需求“学吉他”，一个好的标题是“零基础吉他弹唱快速入门”，而不是简单的“学习吉他”。
* 对于\`description\`: 描述应该更加详细，以激发用户的学习兴趣。它需要阐明课程的学习目标、主要内容、适合人群，以及学习后能够掌握的关键技能。

输出要求 (至关重要):
你的输出**必须**是一个格式严格的JSON对象，不包含任何额外的解释、介绍性文字或Markdown标记。JSON结构必须如下：

\`\`\`json
{
  "title": "课程标题",
  "description": "课程描述"
}
\`\`\`

---

请根据下面的用户需求，生成JSON输出。

用户需求: \`${input.userInput}\`
`;
        const result = await generateObject({
          model: openai(process.env.OPENAI_MODEL || 'gpt-4'),
          prompt,
          schema: titleDescriptionSchema,
          temperature: 0.7,
          maxTokens: 1000,
        });

        return result.object;
      } catch (error) {
        console.error('AI title and description generation error:', error);
        throw new Error('生成标题和描述失败，请稍后重试');
      }
    }),

  // 创建课程大纲
  createOutline: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(1000),
        level: z.enum(["beginner", "intermediate"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 创建课程记录
      const course = await ctx.db.course.create({
        data: {
          title: input.title,
          description: input.description,
          creatorId: ctx.session.user.id,
        },
      });

      // 调用AI生成课程大纲
      try {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/ai/generate-outline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            description: input.description,
            level: input.level,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate outline');
        }

        const aiOutline = await response.json();
        
        // 创建AI生成的章节结构
        const chapters = await Promise.all(
          aiOutline.chapters.map((chapterData: { title: string; description: string }, index: number) =>
            ctx.db.chapter.create({
              data: {
                courseId: course.id,
                chapterNumber: index + 1,
                description: chapterData.description,
                title: chapterData.title,
                // contentMd 保持为空，按需生成
              },
            })
          )
        );

        // 创建用户课程进度记录
        await ctx.db.userCourseProgress.create({
          data: {
            userId: ctx.session.user.id,
            courseId: course.id,
            status: "IN_PROGRESS",
            unlockedChapters: [1], // 默认解锁第一章
          },
        });

        return {
          course,
          chapters,
        };
      } catch (error) {
        // 如果AI生成失败，回退到基础章节结构
        console.error('AI outline generation failed:', error);
        
        const fallbackChapterTitles = [
          "基础概念介绍",
          "核心原理解析",
          "实践应用案例",
          "进阶技巧",
          "总结与展望",
        ];

        const chapters = await Promise.all(
          fallbackChapterTitles.map((title, index) =>
            ctx.db.chapter.create({
              data: {
                courseId: course.id,
                chapterNumber: index + 1,
                title,
                // contentMd 保持为空，按需生成
              },
            })
          )
        );

        // 创建用户课程进度记录
        await ctx.db.userCourseProgress.create({
          data: {
            userId: ctx.session.user.id,
            courseId: course.id,
            status: "IN_PROGRESS",
            unlockedChapters: [1], // 默认解锁第一章
          },
        });

        return {
          course,
          chapters,
        };
      }
    }),

  // 获取用户的课程列表
  getUserCourses: protectedProcedure.query(async ({ ctx }) => {
    const progresses = await ctx.db.userCourseProgress.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        course: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            chapters: {
              orderBy: {
                chapterNumber: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return progresses;
  }),

  // 获取单个课程详情
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          chapters: {
            orderBy: {
              chapterNumber: "asc",
            },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found");
      }

      return course;
    }),

  // 获取公开课程列表（内容广场）
  getPublicCourses: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const courses = await ctx.db.course.findMany({
        where: {
          isPublic: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
        orderBy: {
          clonedByCount: "desc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (courses.length > input.limit) {
        const nextItem = courses.pop();
        nextCursor = nextItem!.id;
      }

      return {
        courses,
        nextCursor,
      };
    }),

  // 克隆课程
  clone: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const originalCourse = await ctx.db.course.findUnique({
        where: { id: input.courseId },
        include: {
          chapters: {
            orderBy: {
              chapterNumber: "asc",
            },
          },
        },
      });

      if (!originalCourse) {
        throw new Error("Course not found");
      }

      // 创建新课程
      const newCourse = await ctx.db.course.create({
        data: {
          title: `${originalCourse.title} (克隆)`,
          description: originalCourse.description,
          creatorId: ctx.session.user.id,
        },
      });

      // 复制章节
      await Promise.all(
        originalCourse.chapters.map((chapter) =>
          ctx.db.chapter.create({
            data: {
              courseId: newCourse.id,
              chapterNumber: chapter.chapterNumber,
              title: chapter.title,
              contentMd: chapter.contentMd,
              contentQualityScore: chapter.contentQualityScore,
            },
          })
        )
      );

      // 创建用户进度记录
      await ctx.db.userCourseProgress.create({
        data: {
          userId: ctx.session.user.id,
          courseId: newCourse.id,
          status: "IN_PROGRESS",
          unlockedChapters: [1],
        },
      });

      // 增加原课程的克隆计数
      await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          clonedByCount: {
            increment: 1,
          },
        },
      });

      return newCourse;
    }),

  // 发布课程到广场
  publish: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db.course.findUnique({
        where: {
          id: input.courseId,
          creatorId: ctx.session.user.id, // 确保只有创建者可以发布
        },
      });

      if (!course) {
        throw new Error("Course not found or unauthorized");
      }

      const updatedCourse = await ctx.db.course.update({
        where: { id: input.courseId },
        data: {
          isPublic: true,
        },
      });

      return updatedCourse;
    }),
});