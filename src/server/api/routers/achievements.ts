import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { PointsReason, type AchievementCategory } from "@prisma/client";
import { updateUserPoints } from "@/server/api/routers/learningVerification";
import {
  type AchievementCreateData,
} from "@/types/learning-verification";

export const achievementsRouter = createTRPCRouter({
  // 获取所有成就定义
  getAllAchievements: protectedProcedure.query(async ({ ctx }) => {
    const achievements = await ctx.db.achievement.findMany({
      orderBy: { category: "asc" },
    });

    // 获取用户已解锁的成就
    const userAchievements = await ctx.db.userAchievement.findMany({
      where: { userId: ctx.session.user.id },
      select: { achievementId: true, unlockedAt: true },
    });

    const userAchievementMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]),
    );

    return achievements.map((achievement) => ({
      ...achievement,
      isUnlocked: userAchievementMap.has(achievement.id),
      unlockedAt: userAchievementMap.get(achievement.id) ?? null,
    }));
  }),

  // 获取用户已解锁的成就
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.userAchievement.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: "desc" },
    });
  }),

  // 检查并解锁成就
  checkAndUnlockAchievements: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const newAchievements: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      category: AchievementCategory;

      condition: unknown;
      points: number;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      unlockedAt: Date;
    }> = [];

    // 获取用户统计数据
    const userPoints = await ctx.db.userPoints.findUnique({
      where: { userId },
    });

    const completedCourses = await ctx.db.userCourseProgress.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    });

    const completedChapters = await ctx.db.userChapterProgress.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    });

    // 计算完美分数次数 - 通过UserQuestionAnswer表统计
    // 完美分数定义：章节中所有问题都正确回答
    const perfectScores = await ctx.db.$queryRaw<[{count: bigint}]>`
      SELECT COUNT(DISTINCT chapter_id) as count
      FROM (
        SELECT 
          cq."chapterId" as chapter_id,
          COUNT(*) as total_questions,
          COUNT(CASE WHEN uqa."isCorrect" = true THEN 1 END) as correct_answers
        FROM "ChapterQuestion" cq
        LEFT JOIN "UserQuestionAnswer" uqa ON cq.id = uqa."questionId" AND uqa."userId" = ${userId}
        GROUP BY cq."chapterId"
        HAVING COUNT(*) = COUNT(CASE WHEN uqa."isCorrect" = true THEN 1 END)
          AND COUNT(CASE WHEN uqa."isCorrect" = true THEN 1 END) > 0
      ) perfect_chapters
    `;
    const perfectScoreCount = Number(perfectScores[0]?.count ?? 0);

    // 获取所有成就定义
    const achievements = await ctx.db.achievement.findMany();

    // 获取用户已解锁的成就
    const existingAchievements = await ctx.db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });

    const unlockedAchievementIds = new Set(
      existingAchievements.map((ua) => ua.achievementId),
    );

    // 检查每个成就的解锁条件
    for (const achievement of achievements) {
      if (unlockedAchievementIds.has(achievement.id)) {
        continue; // 已解锁，跳过
      }

      let shouldUnlock = false;

      // 根据成就条件检查是否应该解锁
      const conditionType = achievement.condition as string;
      switch (conditionType) {
        case "COMPLETE_FIRST_COURSE":
          shouldUnlock = completedCourses >= 1;
          break;
        case "COMPLETE_5_COURSES":
          shouldUnlock = completedCourses >= 5;
          break;
        case "COMPLETE_10_COURSES":
          shouldUnlock = completedCourses >= 10;
          break;
        case "COMPLETE_50_CHAPTERS":
          shouldUnlock = completedChapters >= 50;
          break;
        case "COMPLETE_100_CHAPTERS":
          shouldUnlock = completedChapters >= 100;
          break;
        case "EARN_1000_POINTS":
          shouldUnlock = (userPoints?.totalPoints ?? 0) >= 1000;
          break;
        case "EARN_5000_POINTS":
          shouldUnlock = (userPoints?.totalPoints ?? 0) >= 5000;
          break;
        case "REACH_LEVEL_10":
          shouldUnlock = (userPoints?.level ?? 1) >= 10;
          break;
        case "REACH_LEVEL_25":
          shouldUnlock = (userPoints?.level ?? 1) >= 25;
          break;
        case "PERFECT_SCORE_10_TIMES":
          shouldUnlock = perfectScoreCount >= 10;
          break;
        case "STREAK_7_DAYS":
          shouldUnlock = (userPoints?.streak ?? 0) >= 7;
          break;
        case "STREAK_30_DAYS":
          shouldUnlock = (userPoints?.streak ?? 0) >= 30;
          break;
        default:
          break;
      }

      if (shouldUnlock) {
        // 解锁成就
        await ctx.db.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // 奖励积分
        if (achievement.points > 0) {
          await updateUserPoints(
            ctx,
            achievement.points,
            PointsReason.ACHIEVEMENT_UNLOCK,
            achievement.id,
            `解锁成就: ${achievement.name}`,
          );
        }

        newAchievements.push({
          ...achievement,
          unlockedAt: new Date(),
        });
      }
    }

    return newAchievements;
  }),

  // 初始化默认成就
  initializeDefaultAchievements: protectedProcedure.mutation(
    async ({ ctx }) => {
      const existingAchievements = await ctx.db.achievement.count();

      if (existingAchievements > 0) {
        return { message: "成就已存在" };
      }

      const defaultAchievements: AchievementCreateData[] = [
        {
          name: "初学者",
          description: "完成第一门课程",
          icon: "🎓",
          category: "LEARNING",
          condition: "COMPLETE_FIRST_COURSE",
          points: 100,
        },
        {
          name: "学习达人",
          description: "完成5门课程",
          icon: "📚",
          category: "LEARNING",
          condition: "COMPLETE_5_COURSES",
          points: 500,
        },
        {
          name: "学习专家",
          description: "完成10门课程",
          icon: "🏆",
          category: "LEARNING",
          condition: "COMPLETE_10_COURSES",
          points: 1000,
        },
        {
          name: "章节收集者",
          description: "完成50个章节",
          icon: "📖",
          category: "MASTERY",
          condition: "COMPLETE_50_CHAPTERS",
          points: 300,
        },
        {
          name: "章节大师",
          description: "完成100个章节",
          icon: "📚",
          category: "MASTERY",
          condition: "COMPLETE_100_CHAPTERS",
          points: 800,
        },
        {
          name: "积分新手",
          description: "获得1000积分",
          icon: "⭐",
          category: "MILESTONE",
          condition: "EARN_1000_POINTS",
          points: 200,
        },
        {
          name: "积分达人",
          description: "获得5000积分",
          icon: "🌟",
          category: "MILESTONE",
          condition: "EARN_5000_POINTS",
          points: 500,
        },
        {
          name: "等级提升",
          description: "达到10级",
          icon: "🔥",
          category: "MILESTONE",
          condition: "REACH_LEVEL_10",
          points: 300,
        },
        {
          name: "高级学者",
          description: "达到25级",
          icon: "💎",
          category: "MILESTONE",
          condition: "REACH_LEVEL_25",
          points: 1000,
        },
        {
          name: "完美主义者",
          description: "获得10次满分",
          icon: "💯",
          category: "MASTERY",
          condition: "PERFECT_SCORE_10_TIMES",
          points: 500,
        },
        {
          name: "坚持不懈",
          description: "连续学习7天",
          icon: "🔥",
          category: "STREAK",
          condition: "STREAK_7_DAYS",
          points: 200,
        },
        {
          name: "学习狂人",
          description: "连续学习30天",
          icon: "🚀",
          category: "STREAK",
          condition: "STREAK_30_DAYS",
          points: 1000,
        },
      ];

      await ctx.db.achievement.createMany({
        data: defaultAchievements.map((achievement) => ({
          ...achievement,
          condition: achievement.condition as string,
        })),
      });

      return { message: "默认成就已创建", count: defaultAchievements.length };
    },
  ),
});
