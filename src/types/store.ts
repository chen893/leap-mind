import type {
  UserPoints,
  PointsHistory,
  UserAchievement,
  PointsReason,
  Chapter,
} from "@prisma/client";
import type {
  LeaderboardEntry,
  AchievementWithUnlocked as Achievement,
  UserStats,
  ChapterQuestion,
  UserAnswer,
  Questions,
} from "@/types/api";

// ===== Points Store Types =====
export interface PointsUpdateResult {
  newLevel: number;
  levelUp: boolean;
}

export interface PointsState {
  userPoints: UserPoints | null;
  pointsHistory: PointsHistory[];
  leaderboard: LeaderboardEntry[];
  userRank: number;
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  userStats: UserStats | null;
  newAchievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

export interface PointsActions {
  setUserPoints: (userPoints: UserPoints) => void;
  updatePoints: (
    pointsChange: number,
    reason: PointsReason,
    description: string,
  ) => void;
  setPointsHistory: (history: PointsHistory[]) => void;
  addPointsHistory: (record: PointsHistory) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[], userRank: number) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setUserAchievements: (userAchievements: UserAchievement[]) => void;
  unlockAchievements: (newAchievements: Achievement[]) => void;
  clearNewAchievements: () => void;
  setUserStats: (stats: UserStats) => void;
  updateStreak: (streak: number, bonusPoints: number) => void;
  handleLevelUp: (newLevel: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type PointsStore = PointsState & PointsActions;

// ===== Learning Verification Store Types =====
export interface AssessmentResult {
  canProgress: boolean;
  totalScore: number;
  pointsEarned: number;
  feedback: string;
  evaluationResults: Array<{
    questionId: string;
    questionText: string;
    userAnswer: string;
    score: number;
    feedback: string;
    isCorrect: boolean;
    suggestions?: string[];
  }>;
}

export interface LearningVerificationState {
  currentQuestions: Questions;
  userAnswers: Record<string, UserAnswer>;
  currentQuestionIndex: number;
  isLoading: boolean;
  isEvaluating: boolean;
  assessmentResult: AssessmentResult | null;
  error: string | null;
  showHints: Record<string, boolean>;
  retryCount: Record<string, number>;
}

export interface LearningVerificationActions {
  setCurrentQuestions: (questions: Questions) => void;
  updateUserAnswer: (questionId: string, answer: string) => void;
  setQuestionResult: (questionId: string, result: Partial<UserAnswer>) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setEvaluating: (evaluating: boolean) => void;
  setAssessmentResult: (result: AssessmentResult | null) => void;
  setError: (error: string | null) => void;
  toggleHints: (questionId: string) => void;
  incrementRetry: (questionId: string) => void;
  reset: () => void;
  resetChapter: () => void;
}

export type LearningVerificationStore = LearningVerificationState &
  LearningVerificationActions;

// ===== Course Store Types =====
export interface CourseState {
  selectedChapter: Chapter | null;
  selectedChapterNumber: number | null;
  setSelectedChapter: (chapter: Chapter) => void;
  setSelectedChapterByNumber: (
    chapterNumber: number,
    chapters: Chapter[],
  ) => void;
  reset: () => void;
}

// ===== UI Store Types =====
export interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  error: string | null;
}

export interface UIState {
  buttons: Record<string, ButtonState>;
  modals: {
    isLoginModalOpen: boolean;
    isCreateCourseModalOpen: boolean;
    isDeleteConfirmModalOpen: boolean;
  };
  loading: {
    isPageLoading: boolean;
    isDataLoading: boolean;
  };
  errors: {
    global: string | null;
    form: Record<string, string>;
  };
  setButtonState: (buttonId: string, state: Partial<ButtonState>) => void;
  resetButtonState: (buttonId: string) => void;
  setButtonLoading: (buttonId: string, isLoading: boolean) => void;
  setButtonDisabled: (buttonId: string, isDisabled: boolean) => void;
  setButtonError: (buttonId: string, error: string | null) => void;
  openModal: (modalName: keyof UIState["modals"]) => void;
  closeModal: (modalName: keyof UIState["modals"]) => void;
  closeAllModals: () => void;
  setPageLoading: (isLoading: boolean) => void;
  setDataLoading: (isLoading: boolean) => void;
  setGlobalError: (error: string | null) => void;
  setFormError: (field: string, error: string) => void;
  clearFormErrors: () => void;
  clearAllErrors: () => void;
  resetUIState: () => void;
}

// ===== User Store Types =====
export interface UserState {
  currentCourse: string | null;
  currentChapter: number;
  setCurrentCourse: (courseId: string | null) => void;
  setCurrentChapter: (chapter: number) => void;
}
