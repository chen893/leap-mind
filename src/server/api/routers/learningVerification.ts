import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  type TRPCContext,
} from "@/server/api/trpc";
import {
  generateChapterQuestions,
  evaluateAnswersBatch,
} from "@/lib/course-ai";
import { type PointsReason } from "@prisma/client";

// 积分更新结果类型
interface PointsUpdateResult {
  newLevel: number;
  levelUp: boolean;
}

export const learningVerificationRouter = createTRPCRouter({
  // 获取或生成章节问题
  getOrGenerateQuestions: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 验证章节存在且用户有权限
      const chapter = await ctx.db.chapter.findUnique({
        where: { id: input.chapterId },
        include: {
          course: {
            include: {
              userProgresses: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      // 检查用户权限（创建者或学习者）
      const hasAccess =
        chapter.course.creatorId === ctx.session.user.id ||
        chapter.course.userProgresses.length > 0;

      if (!hasAccess) {
        throw new Error("Unauthorized");
      }

      // 检查用户是否有权限访问此章节（是否已解锁）
      if (chapter.course.creatorId !== ctx.session.user.id) {
        const chapterProgress = await ctx.db.userChapterProgress.findUnique({
          where: {
            userId_chapterId: {
              userId: ctx.session.user.id,
              chapterId: input.chapterId,
            },
          },
        });

        if (!chapterProgress || chapterProgress.status === "LOCKED") {
          throw new Error("Chapter is locked");
        }
      }

      // 首先尝试获取已存在的问题（包含用户答案）
      const existingQuestions = await ctx.db.chapterQuestion.findMany({
        where: { chapterId: input.chapterId },
        orderBy: { questionNumber: "asc" },
        include: {
          userAnswers: {
            where: { userId: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      // 如果已有问题，计算评估结果并返回
      if (existingQuestions.length > 0) {
        let totalScore = 0;
        let passedQuestions = 0;
        let answeredQuestions = 0;

        // 处理每个问题的评估结果
        for (const question of existingQuestions) {
          const userAnswer = question.userAnswers[0];

          if (userAnswer) {
            answeredQuestions++;
            const score = userAnswer.aiScore ?? 0;
            const isCorrect = userAnswer.isCorrect ?? false;

            totalScore += score;
            if (isCorrect) {
              passedQuestions++;
            }
          }
        }

        const averageScore =
          answeredQuestions > 0
            ? Math.round(totalScore / answeredQuestions)
            : 0;
        const passRate =
          answeredQuestions > 0 ? passedQuestions / answeredQuestions : 0;
        const canProgress =
          passRate >= 0.6 && answeredQuestions === existingQuestions.length;

        // 计算积分奖励
        let pointsEarned = 0;
        if (canProgress) {
          pointsEarned = Math.max(10, Math.round(averageScore / 2));
          if (averageScore >= 90) pointsEarned += 20;
          if (passRate === 1) pointsEarned += 10;
        }

        const feedback =
          answeredQuestions === existingQuestions.length
            ? `您的平均分数为 ${averageScore}，通过率为 ${Math.round(passRate * 100)}%`
            : `还有 ${existingQuestions.length - answeredQuestions} 个问题未完成`;

        return {
          canProgress,
          totalScore: averageScore,
          pointsEarned,
          feedback,
          chapterQuestions: existingQuestions,
        };
      }

      // 如果没有问题，则生成新问题
      try {
        // 调用AI生成问题
        const aiQuestions = await generateChapterQuestions({
          courseTitle: chapter.course.title,
          chapterTitle: chapter.title,
          chapterContent: chapter.contentMd ?? "",
          level: "intermediate" as const,
        });

        console.log("aiQuestions", aiQuestions);
        // 保存问题到数据库
        const savedQuestions = await Promise.all(
          aiQuestions.questions.map((question) =>
            ctx.db.chapterQuestion.create({
              data: {
                chapterId: input.chapterId,
                questionNumber: question.questionNumber,
                questionText: question.questionText,
                questionType: question.questionType,
                questionCategory: question.questionCategory,
                difficulty: question.difficulty,
                hints: question.hints ?? [],
                options: question.options ?? undefined,
              },
              include: {
                userAnswers: {
                  where: { userId: ctx.session.user.id },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            }),
          ),
        );

        return {
          canProgress: false,
          totalScore: 0,
          pointsEarned: 0,
          feedback: "请完成所有问题的回答",
          chapterQuestions: savedQuestions,
        };
      } catch (error) {
        console.error("Failed to generate questions:", error);
        throw new Error("生成问题失败，请稍后重试");
      }
    }),

  // 获取章节问题
  getQuestions: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.db.chapterQuestion.findMany({
        where: { chapterId: input.chapterId },
        orderBy: { questionNumber: "asc" },
        include: {
          userAnswers: {
            where: { userId: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
      return questions;
    }),

  // 提交答案
  submitAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        answer: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 获取问题信息
      const question = await ctx.db.chapterQuestion.findUnique({
        where: { id: input.questionId },
        include: {
          chapter: {
            include: {
              course: {
                include: {
                  userProgresses: {
                    where: { userId: ctx.session.user.id },
                  },
                },
              },
            },
          },
        },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // 检查用户权限
      const hasAccess =
        question.chapter.course.creatorId === ctx.session.user.id ||
        question.chapter.course.userProgresses.length > 0;

      if (!hasAccess) {
        throw new Error("Unauthorized");
      }

      // 检查是否已经回答过
      const existingAnswer = await ctx.db.userQuestionAnswer.findUnique({
        where: {
          userId_questionId: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
          },
        },
      });

      if (existingAnswer) {
        // 更新现有答案
        const updatedAnswer = await ctx.db.userQuestionAnswer.update({
          where: { id: existingAnswer.id },
          data: {
            answer: input.answer,
            aiScore: null,
            aiFeedback: null,
            isCorrect: null,
          },
        });

        return {
          questionId: updatedAnswer.questionId,
          answer: updatedAnswer.answer,
          isCorrect: updatedAnswer.isCorrect ?? undefined,
          score: updatedAnswer.aiScore ?? undefined,
          feedback: updatedAnswer.aiFeedback ?? undefined,
          submittedAt: updatedAnswer.updatedAt,
        };
      } else {
        // 创建新答案
        const newAnswer = await ctx.db.userQuestionAnswer.create({
          data: {
            userId: ctx.session.user.id,
            questionId: input.questionId,
            answer: input.answer,
          },
        });

        return {
          questionId: newAnswer.questionId,
          answer: newAnswer.answer,
          isCorrect: undefined,
          score: undefined,
          feedback: undefined,
          submittedAt: newAnswer.createdAt,
        };
      }
    }),

  // 评估所有答案
  evaluateAnswers: protectedProcedure
    .input(
      z.object({
        chapterId: z.string(),
        answers: z.record(z.string(), z.string()), // questionId -> answer
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 获取章节的所有问题
      const questions = await ctx.db.chapterQuestion.findMany({
        where: { chapterId: input.chapterId },
        include: {
          chapter: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { questionNumber: "asc" },
      });

      if (questions.length === 0) {
        throw new Error("No questions found for this chapter");
      }

      // 检查是否所有问题都有答案
      const questionIds = questions.map((q) => q.id);
      const missingAnswers = questionIds.filter(
        (id) => !input.answers[id] || input.answers[id].trim().length < 10,
      );

      if (missingAnswers.length > 0) {
        throw new Error(
          `请先完成所有问题的回答。还有 ${missingAnswers.length} 个问题未完成或答案过短（至少10个字符）。`,
        );
      }

      // 先保存所有答案到数据库
      for (const question of questions) {
        const answer = input.answers[question.id];
        if (!answer) continue;

        // 检查是否已经存在答案记录
        const existingAnswer = await ctx.db.userQuestionAnswer.findUnique({
          where: {
            userId_questionId: {
              userId: ctx.session.user.id,
              questionId: question.id,
            },
          },
        });

        if (existingAnswer) {
          // 更新现有答案
          await ctx.db.userQuestionAnswer.update({
            where: { id: existingAnswer.id },
            data: {
              answer: answer,
              aiScore: null,
              aiFeedback: null,
              isCorrect: null,
            },
          });
        } else {
          // 创建新答案
          await ctx.db.userQuestionAnswer.create({
            data: {
              userId: ctx.session.user.id,
              questionId: question.id,
              answer: answer,
            },
          });
        }
      }

      const chapterQuestions = [];
      let totalScore = 0;
      let passedQuestions = 0;

      // 准备批量评估数据
      const questionsAndAnswers = questions
        .filter((question) => input.answers[question.id])
        .map((question) => ({
          questionId: question.id,
          question: question.questionText,
          userAnswer: input.answers[question.id]!,
          expectedAnswer: undefined, // 从数据库获取或生成时存储
          evaluationCriteria: "根据问题类型和内容进行综合评估",
        }));

      try {
        // 批量调用AI评估
        const batchEvaluation = await evaluateAnswersBatch({
          questionsAndAnswers,
          level: "intermediate" as const,
        });
        console.log("batch evaluation", batchEvaluation);

        // 处理评估结果
        for (const evaluation of batchEvaluation.evaluations) {
          const question = questions.find(
            (q) => q.id === evaluation.questionId,
          );
          if (!question) continue;

          const answerText = input.answers[question.id]!;

          // 更新答案记录
          const userAnswer = await ctx.db.userQuestionAnswer.findUnique({
            where: {
              userId_questionId: {
                userId: ctx.session.user.id,
                questionId: question.id,
              },
            },
          });

          if (userAnswer) {
            await ctx.db.userQuestionAnswer.update({
              where: { id: userAnswer.id },
              data: {
                aiScore: evaluation.score,
                aiFeedback: evaluation.feedback,
                isCorrect: evaluation.isCorrect,
                aiSuggestions: evaluation.suggestions,
              },
            });
          }

          totalScore += evaluation.score;
          if (evaluation.isCorrect) {
            passedQuestions++;
          }
        }
      } catch (error) {
        console.error("Failed to evaluate answers:", error);
        // 如果AI批量评估失败，给予默认分数
        for (const question of questions) {
          const answerText = input.answers[question.id];
          if (!answerText) continue;
        }
      }

      const averageScore = Math.round(totalScore / questions.length);
      const passRate = passedQuestions / questions.length;
      const canProgress = passRate >= 0.6; // 60%的问题需要通过

      // 计算积分奖励
      let pointsEarned = 0;
      if (canProgress) {
        pointsEarned = Math.max(10, Math.round(averageScore / 2)); // 基础积分10-50
        if (averageScore >= 90) pointsEarned += 20; // 优秀奖励
        if (passRate === 1) pointsEarned += 10; // 全部通过奖励
      }

      // 不再创建Assessment记录，直接返回评估结果

      // 如果通过验证，更新章节进度
      if (canProgress) {
        const chapter = questions[0]?.chapter;
        if (chapter) {
          // 更新当前章节状态为完成
          await ctx.db.userChapterProgress.upsert({
            where: {
              userId_chapterId: {
                userId: ctx.session.user.id,
                chapterId: input.chapterId,
              },
            },
            update: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
            create: {
              userId: ctx.session.user.id,
              courseId: chapter.courseId,
              chapterId: input.chapterId,
              status: "COMPLETED",
              unlockedAt: new Date(),
              completedAt: new Date(),
            },
          });

          // 解锁下一章节
          const nextChapter = await ctx.db.chapter.findFirst({
            where: {
              courseId: chapter.courseId,
              chapterNumber: chapter.chapterNumber + 1,
            },
          });

          if (nextChapter) {
            await ctx.db.userChapterProgress.upsert({
              where: {
                userId_chapterId: {
                  userId: ctx.session.user.id,
                  chapterId: nextChapter.id,
                },
              },
              update: {
                status: "UNLOCKED",
                unlockedAt: new Date(),
              },
              create: {
                userId: ctx.session.user.id,
                courseId: chapter.courseId,
                chapterId: nextChapter.id,
                status: "UNLOCKED",
                unlockedAt: new Date(),
              },
            });
          }
        }

        // 更新用户积分
        await updateUserPoints(ctx, pointsEarned, "CHAPTER_COMPLETION");
      }

      // 首先尝试获取已存在的问题（包含用户答案）
      const existingQuestions = await ctx.db.chapterQuestion.findMany({
        where: { chapterId: input.chapterId },
        orderBy: { questionNumber: "asc" },
        include: {
          userAnswers: {
            where: { userId: ctx.session.user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return {
        canProgress,
        totalScore: averageScore,
        pointsEarned,
        feedback: `您的平均分数为 ${averageScore}，通过率为 ${Math.round(passRate * 100)}%`,
        chapterQuestions: existingQuestions,
      };
    }),

  // 获取章节进度
  getChapterProgress: protectedProcedure
    .input(z.object({ chapterId: z.string() }))
    .query(async ({ ctx, input }) => {
      const progress = await ctx.db.userChapterProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: ctx.session.user.id,
            chapterId: input.chapterId,
          },
        },
        include: {
          chapter: {
            include: {
              course: true,
            },
          },
        },
      });

      return progress;
    }),

  // 获取用户在课程中的所有章节进度
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const progresses = await ctx.db.userChapterProgress.findMany({
        where: {
          userId: ctx.session.user.id,
          courseId: input.courseId,
        },
        include: {
          chapter: true,
        },
        orderBy: {
          chapter: {
            chapterNumber: "asc",
          },
        },
      });

      return progresses;
    }),

  // 初始化用户课程进度（加入课程时调用）
  initializeCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 创建用户课程进度记录
      const courseProgress = await ctx.db.userCourseProgress.upsert({
        where: {
          userId_courseId: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
          },
        },
        update: {},
        create: {
          userId: ctx.session.user.id,
          courseId: input.courseId,
          status: "IN_PROGRESS",
        },
      });

      // 解锁第一章
      const firstChapter = await ctx.db.chapter.findFirst({
        where: {
          courseId: input.courseId,
          chapterNumber: 1,
        },
      });

      if (firstChapter) {
        await ctx.db.userChapterProgress.upsert({
          where: {
            userId_chapterId: {
              userId: ctx.session.user.id,
              chapterId: firstChapter.id,
            },
          },
          update: {
            status: "UNLOCKED",
            unlockedAt: new Date(),
          },
          create: {
            userId: ctx.session.user.id,
            courseId: input.courseId,
            chapterId: firstChapter.id,
            status: "UNLOCKED",
            unlockedAt: new Date(),
          },
        });
      }

      return courseProgress;
    }),
});

// 更新用户积分的辅助函数
export async function updateUserPoints(
  ctx: TRPCContext,
  points: number,
  reason: PointsReason,
  relatedId?: string,
): Promise<PointsUpdateResult> {
  // 获取或创建用户积分记录
  if (!ctx.session?.user?.id) {
    throw new Error("用户未登录");
  }
  let userPoints = await ctx.db.userPoints.findUnique({
    where: { userId: ctx.session.user.id },
  });

  if (!userPoints) {
    userPoints = await ctx.db.userPoints.create({
      data: {
        userId: ctx.session.user.id,
        totalPoints: 0,
        level: 1,
        currentExp: 0,
        expToNextLevel: 100,
      },
    });
  }

  // 计算新的积分和等级
  const newTotalPoints = userPoints.totalPoints + points;
  const newCurrentExp = userPoints.currentExp + points;
  let newLevel = userPoints.level;
  let newExpToNextLevel = userPoints.expToNextLevel;

  // 检查是否升级
  if (newCurrentExp >= userPoints.expToNextLevel) {
    newLevel += 1;
    const remainingExp = newCurrentExp - userPoints.expToNextLevel;
    newExpToNextLevel = newLevel * 100; // 每级需要的经验值递增

    // 更新用户积分
    await ctx.db.userPoints.update({
      where: { userId: ctx.session.user.id },
      data: {
        totalPoints: newTotalPoints,
        level: newLevel,
        currentExp: remainingExp,
        expToNextLevel: newExpToNextLevel,
        lastActiveDate: new Date(),
      },
    });
  } else {
    // 更新用户积分
    await ctx.db.userPoints.update({
      where: { userId: ctx.session.user.id },
      data: {
        totalPoints: newTotalPoints,
        currentExp: newCurrentExp,
        lastActiveDate: new Date(),
      },
    });
  }

  // 记录积分历史
  await ctx.db.pointsHistory.create({
    data: {
      userId: ctx.session.user.id,
      pointsChange: points,
      reason,
      relatedId,
    },
  });

  return { newLevel, levelUp: newLevel > userPoints.level };
}
