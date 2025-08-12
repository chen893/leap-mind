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
          },
        });

        // 解锁第一章
        const firstChapter = chapters[0];
        if (firstChapter) {
          await ctx.db.userChapterProgress.create({
            data: {
              userId: ctx.session.user.id,
              chapterId: firstChapter.id,
              courseId: course.id,
              status: "UNLOCKED",
              unlockedAt: new Date(),
            },
          });
        }

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
  getUserCourses: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          status: z.enum(["IN_PROGRESS", "COMPLETED"]).optional(),
          createdByMe: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, cursor, status, createdByMe } = input ?? {};

      // 构建查询条件
      const whereCondition: {
        userId: string;
        status?: "IN_PROGRESS" | "COMPLETED";
        course?: {
          creatorId: string;
        };
      } = {
        userId: ctx.session.user.id,
      };

      if (status) {
        whereCondition.status = status;
      }

      if (createdByMe) {
        whereCondition.course = {
          creatorId: ctx.session.user.id,
        };
      }

      const progresses = await ctx.db.userCourseProgress.findMany({
        where: whereCondition,
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
              _count: {
                select: {
                  chapters: true,
                },
              },
            },
          },
          chapterProgresses: {
            select: {
              chapterId: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (progresses.length > limit) {
        const nextItem = progresses.pop();
        nextCursor = nextItem!.id;
      }

      // 为每个课程计算统计信息
      const progressesWithStats = progresses.map((progress) => {
        const totalChapters = progress.course._count.chapters;
        const completedChapters = progress.chapterProgresses.filter(
          (cp) => cp.status === "COMPLETED",
        ).length;

        return {
          ...progress,
          stats: {
            totalChapters,
            completedChapters,
            progressPercentage:
              totalChapters > 0
                ? Math.round((completedChapters / totalChapters) * 100)
                : 0,
          },
        };
      });

      return {
        courses: progressesWithStats,
        nextCursor,
      };
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
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      return chapter;
    }),

  // 删除课程
  deleteCourse: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 验证课程存在且用户有权限删除
      const course = await ctx.db.course.findUnique({
        where: {
          id: input.courseId,
          creatorId: ctx.session.user.id, // 确保只有创建者可以删除
        },
        include: {
          _count: {
            select: {
              userProgresses: true,
              chapters: true,
            },
          },
        },
      });

      if (!course) {
        throw new Error("Course not found or unauthorized");
      }

      // 注意：由于 UserChapterProgress.chapter 的外键 onDelete 可能为 NoAction，
      // 直接删除 Course 会因 Chapter 的删除触发外键约束而失败。
      // 所以我们需要在事务中手动删除依赖数据，然后再删除课程。
      const result = await ctx.db.$transaction(async (tx) => {
        // 1) 删除所有用户章节进度（避免 Chapter 删除时触发外键约束）
        const deletedChapterProgresses = await tx.userChapterProgress.deleteMany({
          where: { courseId: input.courseId },
        });

        // 2) 删除用户课程进度（可选，若 schema 设为级联亦可省略，但手动删除更稳妥）
        const deletedCourseProgresses = await tx.userCourseProgress.deleteMany({
          where: { courseId: input.courseId },
        });

        // 3) 删除课程（Prisma/DB 将自动级联删除 Chapters 以及其下的问题与回答）
        await tx.course.delete({ where: { id: input.courseId } });

        return {
          deletedChapterProgresses: deletedChapterProgresses.count,
          deletedCourseProgresses: deletedCourseProgresses.count,
        };
      });

      return {
        success: true,
        message: "课程已成功删除",
        deletedData: {
          course: course.title,
          chapters: course._count.chapters,
          userProgresses: course._count.userProgresses,
          deletedChapterProgresses: result.deletedChapterProgresses,
          deletedCourseProgresses: result.deletedCourseProgresses,
        },
      };
    }),
});
