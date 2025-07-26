import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
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
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
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
        throw new Error("Chapter not found");
      }

      // 检查权限（课程创建者或学习者）
      const hasAccess =
        chapter.course.creatorId === ctx.session.user.id ||
        (await ctx.db.userCourseProgress.findFirst({
          where: {
            userId: ctx.session.user.id,
            courseId: chapter.courseId,
          },
        }));

      if (!hasAccess) {
        throw new Error("Unauthorized");
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
      const updatedChapter = await ctx.db.chapter.update({
        where: { id: input.chapterId },
        data: {
          contentQualityScore: input.score,
        },
      });

      return updatedChapter;
    }),

  // 生成章节内容
  generateContent: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        regenerate: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          course: {
            include: {
              chapters: {
                orderBy: {
                  chapterNumber: "asc",
                },
              },
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      // 检查权限
      const hasAccess =
        chapter.course.creatorId === ctx.session.user.id ||
        (await ctx.db.userCourseProgress.findFirst({
          where: {
            userId: ctx.session.user.id,
            courseId: chapter.courseId,
          },
        }));

      if (!hasAccess) {
        throw new Error("Unauthorized");
      }

      // 如果已有内容且不是重新生成，直接返回
      if (chapter.contentMd && !input.regenerate) {
        return chapter;
      }

      try {
        // 调用AI生成章节内容
        console.log("调用ai");
        const response = await fetch(
          `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/ai/generate-chapter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              courseTitle: chapter.course.title,
              courseDescription: chapter.course.description,
              chapterTitle: chapter.title,
              chapterNumber: chapter.chapterNumber,
              totalChapters: chapter.course.chapters.length,
              previousChapters: chapter.course.chapters
                .filter((c) => c.chapterNumber < chapter.chapterNumber)
                .map((c) => ({ title: c.title, content: c.contentMd }))
                .filter((c) => c.content), // 只包含已生成内容的章节
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to generate chapter content");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        let generatedContent = "";
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          generatedContent += chunk;
        }

        // 保存生成的内容
        const updatedChapter = await ctx.db.chapter.update({
          where: { id: input.chapterId },
          data: {
            contentMd: generatedContent,
            lastUpdated: new Date(),
          },
        });

        return updatedChapter;
      } catch (error) {
        console.error("Chapter content generation failed:", error);
        throw new Error("Failed to generate chapter content");
      }
    }),
});
