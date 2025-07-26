import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";

export const assessmentRouter = createTRPCRouter({
  // 提交评估答案
  submit: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        answers: z.record(z.any()), // 用户答案的JSON对象
        score: z.number().min(0).max(100),
        feedback: z.record(z.any()), // AI反馈的JSON对象
        canProgress: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const assessment = await ctx.db.assessment.create({
        data: {
          chapterId: input.chapterId,
          userId: ctx.session.user.id,
          userAnswersJson: input.answers,
          score: input.score,
          feedbackJson: input.feedback,
          canProgress: input.canProgress,
        },
      });

      // 如果评估通过，解锁下一章
      if (input.canProgress) {
        const chapter = await ctx.db.chapter.findUnique({
          where: { id: input.chapterId },
          select: {
            courseId: true,
            chapterNumber: true,
          },
        });

        if (chapter) {
          const progress = await ctx.db.userCourseProgress.findUnique({
            where: {
              userId_courseId: {
                userId: ctx.session.user.id,
                courseId: chapter.courseId,
              },
            },
          });

          if (progress) {
            const unlockedChapters = progress.unlockedChapters as number[];
            const nextChapter = chapter.chapterNumber + 1;
            
            if (!unlockedChapters.includes(nextChapter)) {
              await ctx.db.userCourseProgress.update({
                where: {
                  userId_courseId: {
                    userId: ctx.session.user.id,
                    courseId: chapter.courseId,
                  },
                },
                data: {
                  unlockedChapters: [...unlockedChapters, nextChapter],
                },
              });
            }
          }
        }
      }

      return assessment;
    }),

  // 获取评估历史
  getHistory: protectedProcedure
    .input(
      z.object({
        chapterId: z.string().optional(),
        courseId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.session.user.id,
      };

      if (input.chapterId) {
        where.chapterId = input.chapterId;
      } else if (input.courseId) {
        where.chapter = {
          courseId: input.courseId,
        };
      }

      const assessments = await ctx.db.assessment.findMany({
        where,
        include: {
          chapter: {
            select: {
              id: true,
              title: true,
              chapterNumber: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return assessments;
    }),
});