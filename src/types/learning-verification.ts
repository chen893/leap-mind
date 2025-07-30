import type { TRPCContext } from "@/server/api/trpc";
import {
  type Prisma,
  type PointsReason,
  type AchievementCategory,
} from "@prisma/client";

// 学习验证相关类型
export interface EvaluationResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number;
  feedback: string;
  isCorrect: boolean;
  suggestions: string[];
}

export interface AssessmentFeedback {
  totalQuestions: number;
  passedQuestions: number;
  passRate: number;
  canProgress: boolean;
  evaluationResults: EvaluationResult[];
}

// 积分更新上下文类型
export type PointsUpdateContext = TRPCContext;

export type PointsUpdateResult = {
  newLevel: number;
  levelUp: boolean;
};

// 成就条件类型
export type AchievementCondition =
  | "COMPLETE_FIRST_COURSE"
  | "COMPLETE_5_COURSES"
  | "COMPLETE_10_COURSES"
  | "COMPLETE_50_CHAPTERS"
  | "COMPLETE_100_CHAPTERS"
  | "EARN_1000_POINTS"
  | "EARN_5000_POINTS"
  | "REACH_LEVEL_10"
  | "REACH_LEVEL_25"
  | "PERFECT_SCORE_10_TIMES"
  | "STREAK_7_DAYS"
  | "STREAK_30_DAYS";

// 成就创建数据类型
export interface AchievementCreateData {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  points: number;
}

// 解锁的成就类型
export interface UnlockedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: Prisma.JsonValue;
  points: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  unlockedAt: Date;
}
