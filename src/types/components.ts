import type { Chapter, UserChapterProgress } from "@prisma/client";
import type {
  LeaderboardEntry,
  UserStats,
  AchievementWithUnlocked as Achievement,
  Questions,
  UserAnswer,
} from "@/types/api";
import type { Course, UserCourseProgress } from "@prisma/client";

// ===== Chapter Components =====
export interface ChapterListProps {
  chapters: Chapter[];
  selectedChapterNumber: number | null;
  chapterProgresses: UserChapterProgress[];
  onChapterSelect: (chapterNumber: number) => void;
}

export interface CourseContentAreaProps {
  courseId: string;
  selectedChapterNumber: number | null;
  chapterProgresses: UserChapterProgress[];
  selectNextChapter: (onlyRefresh?: boolean) => void;
}

export interface ChapterContentProps {
  courseId: string;
  chapterNumber: number;
  isUnlocked: boolean;
}

// ===== Course Components =====
export interface CourseHeaderProps {
  course: Course;
  userProgress?: UserCourseProgress;
  isCreator: boolean;
  onCourseUpdate: () => void;
}

export interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    creator: {
      name: string | null;
      image: string | null;
    };
    chapters: Pick<Chapter, "id" | "title">[];
    joinedByCount?: number;
  };
  progress?: {
    status: string;
    chapterProgresses?: UserChapterProgress[];
  };
  showProgress?: boolean;
}

// ===== Learning Verification Components =====
export interface LearningVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  onComplete?: (onlyRefresh?: boolean) => void;
}

// ===== Points Components =====
export interface PointsDisplayProps {
  variant?: "compact" | "detailed";
  showHistory?: boolean;
  className?: string;
}

// ===== Achievements Components =====
export interface AchievementsDisplayProps {
  variant?: "grid" | "list";
  showProgress?: boolean;
  filterCategory?: string;
  className?: string;
}

export interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface SocraticQuestionProps {
  question: Questions[0];
  answer: string;
  result?: UserAnswer;

  questionIndex: number;
  totalQuestions: number;
  isEvaluating?: boolean;
  showHints?: boolean;
  retryCount?: number;
  onAnswerChange: (answer: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onToggleHints: () => void;
}

export interface LeaderboardProps {
  variant?: "compact" | "detailed";
  showUserRank?: boolean;
  limit?: number;
  className?: string;
}

// ===== Achievement Category Types =====
export type AchievementCategoryType =
  | "LEARNING"
  | "PROGRESS"
  | "POINTS"
  | "LEVEL"
  | "PERFORMANCE"
  | "STREAK"
  | "SPECIAL";

export const categoryIcons = {
  LEARNING: "BookOpen",
  PROGRESS: "TrendingUp",
  POINTS: "Star",
  LEVEL: "Award",
  PERFORMANCE: "Target",
  STREAK: "Flame",
  SPECIAL: "Zap",
} as const;

export const categoryLabels = {
  LEARNING: "学习成就",
  PROGRESS: "进度成就",
  POINTS: "积分成就",
  LEVEL: "等级成就",
  PERFORMANCE: "表现成就",
  STREAK: "连续成就",
  SPECIAL: "特殊成就",
} as const;

export const categoryColors = {
  LEARNING: "bg-blue-100 text-blue-800 border-blue-200",
  PROGRESS: "bg-green-100 text-green-800 border-green-200",
  POINTS: "bg-yellow-100 text-yellow-800 border-yellow-200",
  LEVEL: "bg-purple-100 text-purple-800 border-purple-200",
  PERFORMANCE: "bg-red-100 text-red-800 border-red-200",
  STREAK: "bg-orange-100 text-orange-800 border-orange-200",
  SPECIAL: "bg-pink-100 text-pink-800 border-pink-200",
} as const;
