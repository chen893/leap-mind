import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const pointsRouter = createTRPCRouter({
  // 获取用户积分信息
  getUserPoints: protectedProcedure.query(async ({ ctx }) => {
    let userPoints = await ctx.db.userPoints.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        pointsHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    // 如果用户没有积分记录，创建一个
    if (!userPoints) {
      userPoints = await ctx.db.userPoints.create({
        data: {
          userId: ctx.session.user.id,
          totalPoints: 0,
          level: 1,
          currentExp: 0,
          expToNextLevel: 100,
        },
        include: {
          pointsHistory: true,
        },
      });
    }

    return userPoints;
  }),

  // 获取积分历史
  getPointsHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const history = await ctx.db.pointsHistory.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (history.length > input.limit) {
        const nextItem = history.pop();
        nextCursor = nextItem!.id;
      }

      return {
        history,
        nextCursor,
      };
    }),

  // 获取排行榜
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        type: z.enum(["points", "level"]).default("points"),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const orderBy =
        input.type === "points"
          ? { totalPoints: "desc" as const }
          : { level: "desc" as const };

      const leaderboard = await ctx.db.userPoints.findMany({
        orderBy: orderBy,
        take: input.limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // 获取当前用户的排名
      const userRank = await ctx.db.userPoints.count({
        where: {
          [input.type === "points" ? "totalPoints" : "level"]: {
            gt: await ctx.db.userPoints
              .findUnique({
                where: { userId: ctx.session.user.id },
                select: {
                  totalPoints: true,
                  level: true,
                },
              })
              .then(
                (user) =>
                  user?.[input.type === "points" ? "totalPoints" : "level"] ??
                  0,
              ),
          },
        },
      });

      return {
        leaderboard,
        userRank: userRank + 1,
      };
    }),

  // 更新连续学习天数
  updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
    const userPoints = await ctx.db.userPoints.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!userPoints) {
      return { streak: 0, bonusPoints: 0 };
    }

    const today = new Date();
    const lastActiveDate = userPoints.lastActiveDate;

    let newStreak = 1;
    let bonusPoints = 0;

    if (lastActiveDate) {
      const daysDiff = Math.floor(
        (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // 连续学习
        newStreak = userPoints.streak + 1;

        // 连续学习奖励
        if (newStreak >= 7) {
          bonusPoints = 50; // 连续7天奖励
        } else if (newStreak >= 3) {
          bonusPoints = 20; // 连续3天奖励
        } else {
          bonusPoints = 5; // 每日奖励
        }
      } else if (daysDiff === 0) {
        // 同一天，保持当前连续天数
        newStreak = userPoints.streak;
      } else {
        // 中断了连续学习
        newStreak = 1;
        bonusPoints = 5; // 重新开始奖励
      }
    }

    // 更新用户积分和连续天数
    await ctx.db.userPoints.update({
      where: { userId: ctx.session.user.id },
      data: {
        streak: newStreak,
        lastActiveDate: today,
        totalPoints: userPoints.totalPoints + bonusPoints,
        currentExp: userPoints.currentExp + bonusPoints,
      },
    });

    // 记录积分历史
    if (bonusPoints > 0) {
      await ctx.db.pointsHistory.create({
        data: {
          userId: ctx.session.user.id,
          pointsChange: bonusPoints,
          reason: "STREAK_BONUS",
          description: `连续学习 ${newStreak} 天奖励`,
        },
      });
    }

    return {
      streak: newStreak,
      bonusPoints,
    };
  }),

  // 获取用户统计信息
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const userPoints = await ctx.db.userPoints.findUnique({
      where: { userId: ctx.session.user.id },
    });

    // 获取完成的课程数量
    const completedCourses = await ctx.db.userCourseProgress.count({
      where: {
        userId: ctx.session.user.id,
        status: "COMPLETED",
      },
    });

    // 获取完成的章节数量
    const completedChapters = await ctx.db.assessment.count({
      where: {
        userId: ctx.session.user.id,
        canProgress: true,
      },
    });

    // 获取平均分数
    const averageScore = await ctx.db.assessment.aggregate({
      where: {
        userId: ctx.session.user.id,
      },
      _avg: {
        score: true,
      },
    });

    // 获取用户成就数量
    const achievementsCount = await ctx.db.userAchievement.count({
      where: {
        userId: ctx.session.user.id,
      },
    });

    return {
      userPoints,
      completedCourses,
      completedChapters,
      averageScore: Math.round(averageScore._avg.score ?? 0),
      achievementsCount,
    };
  }),
});
