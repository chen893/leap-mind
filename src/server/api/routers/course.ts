import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  generateTitleAndDescription,
  generateCourseOutline,
} from "@/lib/course-ai";

export const courseRouter = createTRPCRouter({
  // 生成课程标题和描述
  generateTitleAndDescription: protectedProcedure
    .input(
      z.object({
        userInput: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input }) => {
      return await generateTitleAndDescription(input.userInput);
    }),

  // 创建课程大纲
  createOutline: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().min(1).max(1000),
        level: z.enum(["beginner", "intermediate"]),
      }),
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
        const aiOutline = await generateCourseOutline({
          title: input.title,
          description: input.description,
          level: input.level,
        });

        // 创建AI生成的章节结构
        const chapters = await Promise.all(
          aiOutline.chapters.map(
            (
              chapterData: { title: string; description: string },
              index: number,
            ) =>
              ctx.db.chapter.create({
                data: {
                  courseId: course.id,
                  chapterNumber: index + 1,
                  description: chapterData.description,
                  title: chapterData.title,
                  // contentMd 保持为空，按需生成
                },
              }),
          ),
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
        console.error("AI outline generation failed:", error);
        throw new Error("Failed to generate course outline");
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
      }),
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
          chapters: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              chapters: true,
            },
          },
        },
        orderBy: {
          joinedByCount: "desc",
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

  getChapterById: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("getChapterById", input.chapterId);
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      return chapter;
    }),
});
