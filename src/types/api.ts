// API types inferred from TRPC routers and Prisma models
import { type RouterInputs, type RouterOutputs } from "@/trpc/react";
import type {
  User,
  Account,
  Session,
  Course,
  Chapter,
  UserCourseProgress,
  ChapterQuestion as PrismaChapterQuestion,
  UserQuestionAnswer,
  UserPoints,
  PointsHistory,
  Achievement,
  UserAchievement,
  CourseStatus,
  QuestionType,
  QuestionCategory,
  Difficulty,
  PointsReason,
  AchievementCategory,
} from "@prisma/client";

// ============================================================================
// TRPC Router Output Types
// ============================================================================

export type ChapterQuestions =
  RouterOutputs["learningVerification"]["getQuestions"];
export type SubmittedAnswer =
  RouterOutputs["learningVerification"]["submitAnswer"];
export type EvaluationResult =
  RouterOutputs["learningVerification"]["evaluateAnswers"];

export type Questions =
  RouterOutputs["learningVerification"]["getOrGenerateQuestions"]["chapterQuestions"];

// Points Router
export type UserPointsData = RouterOutputs["points"]["getUserPoints"];
export type PointsHistoryData = RouterOutputs["points"]["getPointsHistory"];
export type LeaderboardData = RouterOutputs["points"]["getLeaderboard"];
export type UserStatsData = RouterOutputs["points"]["getUserStats"];
export type StreakUpdateResult = RouterOutputs["points"]["updateStreak"];

// Achievements Router
export type AllAchievements =
  RouterOutputs["achievements"]["getAllAchievements"];
export type UserAchievements =
  RouterOutputs["achievements"]["getUserAchievements"];
export type UnlockedAchievements =
  RouterOutputs["achievements"]["checkAndUnlockAchievements"];

// ============================================================================
// TRPC Router Input Types
// ============================================================================

// Learning Verification Router Inputs

export type GetQuestionsInput =
  RouterInputs["learningVerification"]["getQuestions"];
export type SubmitAnswerInput =
  RouterInputs["learningVerification"]["submitAnswer"];
export type EvaluateAnswersInput =
  RouterInputs["learningVerification"]["evaluateAnswers"];

// Points Router Inputs
export type GetPointsHistoryInput = RouterInputs["points"]["getPointsHistory"];
export type GetLeaderboardInput = RouterInputs["points"]["getLeaderboard"];

// ============================================================================
// Extended Prisma Types with Relations
// ============================================================================

// User with all relations
export type UserWithRelations = User & {
  accounts?: Account[];
  sessions?: Session[];
  createdCourses?: Course[];
  courseProgresses?: UserCourseProgress[];

  questionAnswers?: UserQuestionAnswer[];
  userPoints?: UserPoints;
  achievements?: UserAchievement[];
};

// Course with relations
export type CourseWithRelations = Course & {
  creator: User;
  chapters: Chapter[];
  userProgresses?: UserCourseProgress[];
};

// Chapter with relations
export type ChapterWithRelations = Chapter & {
  course: Course;

  questions?: ChapterQuestion[];
};

// 数据库中的ChapterQuestion类型（来自Prisma）
export type DbChapterQuestion = PrismaChapterQuestion;

// 扩展的ChapterQuestion类型，用于组件
export type ChapterQuestion = Questions;
// 辅助函数：将数据库ChapterQuestion转换为组件使用的格式

// ChapterQuestion with relations
export type ChapterQuestionWithRelations = ChapterQuestion & {
  chapter: Chapter;
  userAnswers?: UserQuestionAnswer[];
};

// UserQuestionAnswer with relations
export type UserQuestionAnswerWithRelations = UserQuestionAnswer & {
  user: User;
  question: PrismaChapterQuestion;
};

// 移除Assessment相关类型，因为Assessment模型已被删除

// UserPoints with relations
export type UserPointsWithRelations = UserPoints & {
  user: User;
  pointsHistory: PointsHistory[];
};

// Achievement with relations
export type AchievementWithRelations = Achievement & {
  userAchievements: UserAchievement[];
};

// UserAchievement with relations
export type UserAchievementWithRelations = UserAchievement & {
  user: User;
  achievement: Achievement;
};

// ============================================================================
// Custom Business Logic Types
// ============================================================================

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  totalPoints: number;
  level: number;
  rank?: number;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  submittedAt?: Date;
}

// Points update context
export interface PointsUpdateContext {
  userId: string;
  pointsChange: number;
  reason: PointsReason;
  description?: string;
  relatedId?: string;
}

// Points update result
export interface PointsUpdateResult {
  newLevel: number;
  levelUp: boolean;
}

// Achievement condition types
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

// Achievement creation data
export interface AchievementCreateData {
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  points: number;
}

// Achievement with unlock status
export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean;
  unlockedAt: Date | null;
}

export interface AchievementWithUnlocked extends Achievement {
  isUnlocked?: boolean;
  progress?: number;
  unlockedAt?: Date;
  title?: string; // 兼容性属性
  pointsReward?: number; // 兼容性属性
}

// 为了兼容性，添加一个映射函数
export function mapAchievementToDisplay(
  achievement: Achievement,
): AchievementWithUnlocked {
  return {
    ...achievement,
    title: achievement.name,
    pointsReward: achievement.points,
    isUnlocked: false,
  };
}

// User statistics
export interface UserStats {
  userPoints: UserPoints | null;
  completedCourses: number;
  completedChapters: number;
  averageScore: number;
  achievementsCount: number;
}

// Question evaluation result
export interface QuestionEvaluationResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  score: number;
  feedback: string;
  isCorrect: boolean;
  suggestions?: string[];
}

// Assessment feedback
export interface AssessmentFeedback {
  totalQuestions: number;
  passedQuestions: number;
  passRate: number;
  canProgress: boolean;
  evaluationResults: QuestionEvaluationResult[];
}

// Learning verification state
export interface LearningVerificationState {
  currentQuestions: ChapterQuestion[];
  userAnswers: Record<string, UserQuestionAnswer>;
  currentQuestionIndex: number;
  isLoading: boolean;
  isEvaluating: boolean;
  assessmentResult: {
    canProgress: boolean;
    totalScore: number;
    pointsEarned: number;
    feedback: string;
  } | null;
  error: string | null;
  showHints: Record<string, boolean>;
  retryCount: Record<string, number>;
}

// ============================================================================
// Utility Types
// ============================================================================

// Pagination types
export interface PaginationInput {
  limit: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  nextCursor?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  success: boolean;
}

// ============================================================================
// Re-export Prisma Enums
// ============================================================================

export {
  CourseStatus,
  QuestionType,
  QuestionCategory,
  Difficulty,
  PointsReason,
  AchievementCategory,
} from "@prisma/client";
