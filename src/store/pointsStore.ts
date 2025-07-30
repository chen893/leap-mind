import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  PointsStore,
  PointsState,
  PointsActions,
  PointsUpdateResult,
} from "@/types/store";

import { type PointsReason, type Achievement } from "@prisma/client";

const initialState: PointsState = {
  userPoints: null,
  pointsHistory: [],
  leaderboard: [],
  userRank: 0,
  achievements: [],
  userAchievements: [],
  userStats: null,
  newAchievements: [],
  isLoading: false,
  error: null,
};

export const usePointsStore = create<PointsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setUserPoints: (userPoints) => {
        set({ userPoints });
      },

      updatePoints: (
        pointsChange: number,
        reason: PointsReason,
        description?: string,
      ) => {
        const { userPoints } = get();
        if (!userPoints) return;

        const newTotalPoints = userPoints.totalPoints + pointsChange;
        const newCurrentExp = userPoints.currentExp + pointsChange;

        // 计算是否升级
        let newLevel = userPoints.level;
        let newExpToNextLevel = userPoints.expToNextLevel;
        let remainingExp = newCurrentExp;

        while (remainingExp >= newExpToNextLevel && newLevel < 100) {
          remainingExp -= newExpToNextLevel;
          newLevel++;
          newExpToNextLevel = newLevel * 100; // 每级需要的经验值
        }

        const updatedUserPoints = {
          ...userPoints,
          totalPoints: newTotalPoints,
          level: newLevel,
          currentExp: remainingExp,
          expToNextLevel: newExpToNextLevel,
        };

        set({
          userPoints: updatedUserPoints,
          pointsHistory: [
            {
              id: Date.now().toString(),
              userId: userPoints.userId,
              pointsChange,
              reason,
              description: description ?? null,
              relatedId: null,
              createdAt: new Date(),
            },
            ...get().pointsHistory,
          ],
        });

        // 如果升级了，触发升级处理
        if (newLevel > userPoints.level) {
          get().handleLevelUp(newLevel);
        }
      },

      setPointsHistory: (history) => {
        set({ pointsHistory: history });
      },

      addPointsHistory: (record) => {
        set((state) => ({
          pointsHistory: [record, ...state.pointsHistory],
        }));
      },

      setLeaderboard: (leaderboard, userRank) => {
        set({ leaderboard, userRank });
      },

      setAchievements: (achievements) => {
        set({ achievements });
      },

      setUserAchievements: (userAchievements) => {
        set({ userAchievements });
      },

      unlockAchievements: (newAchievements) => {
        set((state) => ({
          newAchievements: [...state.newAchievements, ...newAchievements],
          achievements: state.achievements.map((achievement) => {
            const isNewlyUnlocked = newAchievements.some(
              (newAch) => newAch.id === achievement.id,
            );
            return isNewlyUnlocked
              ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
              : achievement;
          }),
        }));
      },

      clearNewAchievements: () => {
        set({ newAchievements: [] });
      },

      setUserStats: (stats) => {
        set({ userStats: stats });
      },

      updateStreak: (streak, bonusPoints) => {
        const { userPoints } = get();
        if (!userPoints) return;

        const updatedUserPoints = {
          ...userPoints,
          streak,
          lastActiveDate: new Date(),
        };

        set({ userPoints: updatedUserPoints });

        if (bonusPoints > 0) {
          get().updatePoints(
            bonusPoints,
            "STREAK_BONUS" as PointsReason,
            `连续学习 ${streak} 天奖励`,
          );
        }
      },

      handleLevelUp: (newLevel) => {
        // 可以在这里添加升级庆祝动画或通知
        console.log(`🎉 恭喜升级到 ${newLevel} 级！`);

        // 升级奖励
        const bonusPoints = newLevel * 10;
        get().updatePoints(
          bonusPoints,
          "ACHIEVEMENT_UNLOCK" as PointsReason,
          `升级到 ${newLevel} 级奖励`,
        );
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "points-store",
    },
  ),
);

// 选择器
export const usePointsSelectors = () => {
  const store = usePointsStore();

  return {
    // 当前等级进度百分比
    levelProgress: store.userPoints
      ? (store.userPoints.currentExp / store.userPoints.expToNextLevel) * 100
      : 0,
    // 是否有新成就
    hasNewAchievements: store.newAchievements.length > 0,
    // 已解锁成就数量
    unlockedAchievementsCount: store.achievements.filter((a) => a.isUnlocked)
      .length,
    // 总成就数量
    totalAchievementsCount: store.achievements.length,
    // 成就完成度百分比
    achievementProgress:
      store.achievements.length > 0
        ? (store.achievements.filter((a) => a.isUnlocked).length /
            store.achievements.length) *
          100
        : 0,
    // 按类别分组的成就
    achievementsByCategory: store.achievements.reduce(
      (acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
      },
      {} as Record<string, Achievement[]>,
    ),
    // 最近的积分历史
    recentPointsHistory: store.pointsHistory.slice(0, 5),
  };
};
