import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const chapterRouter = createTRPCRouter({
  // 获取章节内容
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              creatorId: true,
              isPublic: true,
            },
          },
        },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const userId = ctx.session?.user?.id;
      const isCreator = !!userId && chapter.course.creatorId === userId;
      const isPublicCourse = chapter.course.isPublic;

      let isEnrolled = false;
      if (userId) {
        const enrollment = await ctx.db.userCourseProgress.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId: chapter.courseId,
            },
          },
          select: { id: true },
        });
        isEnrolled = !!enrollment;
      }

      // 私有课程：必须是创建者或已加入用户
      if (!isPublicCourse && !isCreator && !isEnrolled) {
        // 避免泄露私有资源是否存在
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 非创建者：需要章节已解锁（允许第 1 章作为预览）
      if (!isCreator) {
        if (!isEnrolled) {
          const canPreview = isPublicCourse && chapter.chapterNumber === 1;
          if (!canPreview) {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          return chapter;
        }

        if (!userId) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        const progress = await ctx.db.userChapterProgress.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId: chapter.id,
            },
          },
          select: { status: true },
        });

        const isUnlocked =
          progress?.status === "UNLOCKED" ||
          progress?.status === "COMPLETED" ||
          chapter.chapterNumber === 1;

        if (!isUnlocked) {
          // 返回章节元信息，但不泄露内容
          return {
            ...chapter,
            contentMd: null,
          };
        }
      }

      return chapter;
    }),

  // 保存AI生成的章节内容
  saveContent: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        content: z.string(),
        generationCost: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          course: true,
        },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // 仅允许课程创建者更新章节内容（避免学习者修改共享内容）
      if (chapter.course.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updatedChapter = await ctx.db.chapter.update({
        where: { id: input.chapterId },
        data: {
          contentMd: input.content,
          generationCost: input.generationCost,
          lastUpdated: new Date(),
        },
      });

      return updatedChapter;
    }),

  // 评分章节内容质量
  rateQuality: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        score: z.number().min(0).max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
        include: { course: { select: { creatorId: true } } },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const hasAccess =
        chapter.course.creatorId === ctx.session.user.id ||
        (await ctx.db.userCourseProgress.findFirst({
          where: {
            userId: ctx.session.user.id,
            courseId: chapter.courseId,
          },
          select: { id: true },
        }));

      if (!hasAccess) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const updatedChapter = await ctx.db.chapter.update({
        where: { id: input.chapterId },
        data: {
          contentQualityScore: input.score,
        },
      });

      return updatedChapter;
    }),
});
