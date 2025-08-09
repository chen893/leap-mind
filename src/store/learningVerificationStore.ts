import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  LearningVerificationStore,
  LearningVerificationState,
  LearningVerificationActions,
  ChapterAssessmentResult,
  ChapterProgressData,
} from "@/types/store";
import type { UserAnswer } from "@/types/api";

const initialState: LearningVerificationState = {
  currentQuestions: [],
  userAnswers: {},
  currentQuestionIndex: 0,
  isLoading: false,
  isEvaluating: false,
  assessmentResult: null,
  chapterProgress: null,
  courseProgress: [],
  error: null,
  showHints: {},
  retryCount: {},
};

export const useLearningVerificationStore = create<LearningVerificationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCurrentQuestions: (questions) => {
        set({
          currentQuestions: questions,
          userAnswers: {},
          currentQuestionIndex: 0,
          showHints: {},
          retryCount: {},
          error: null,
        });
      },

      updateUserAnswer: (questionId, answer) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: {
              questionId,
              answer,
              // 清除之前的评估结果，只保留答案
            },
          },
        }));
      },

      setQuestionResult: (questionId, result) => {
        set((state) => ({
          userAnswers: {
            ...state.userAnswers,
            [questionId]: {
              ...state.userAnswers[questionId],
              questionId,
              answer:
                result.answer ?? state?.userAnswers?.[questionId]?.answer ?? "",
              ...result,
            },
          },
        }));
      },

      nextQuestion: () => {
        const { currentQuestionIndex, currentQuestions } = get();
        if (currentQuestionIndex < currentQuestions.length - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      goToQuestion: (index) => {
        const { currentQuestions } = get();
        if (index >= 0 && index < currentQuestions.length) {
          set({ currentQuestionIndex: index });
        }
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setEvaluating: (evaluating) => {
        set({ isEvaluating: evaluating });
      },

      setAssessmentResult: (result) => {
        set({ assessmentResult: result });
      },

      setChapterProgress: (progress) => {
        set({ chapterProgress: progress });
      },

      setCourseProgress: (progresses) => {
        set({ courseProgress: progresses });
      },

      setError: (error) => {
        set({ error });
      },

      toggleHints: (questionId) => {
        set((state) => ({
          showHints: {
            ...state.showHints,
            [questionId]: !state.showHints[questionId],
          },
        }));
      },

      incrementRetry: (questionId) => {
        set((state) => ({
          retryCount: {
            ...state.retryCount,
            [questionId]: (state.retryCount[questionId] ?? 0) + 1,
          },
        }));
      },

      reset: () => {
        set(initialState);
      },

      resetChapter: () => {
        set({
          userAnswers: {},
          currentQuestionIndex: 0,
          showHints: {},
          retryCount: {},
          assessmentResult: null,
          chapterProgress: null,
          error: null,
          isEvaluating: false,
        });
      },
    }),
    {
      name: "learning-verification-store",
    },
  ),
);

// Selectors
export const useLearningVerificationSelectors = () => {
  const store = useLearningVerificationStore();

  return {
    // 当前问题
    currentQuestion: store.currentQuestions[store.currentQuestionIndex] ?? null,
    // 是否是第一个问题
    isFirstQuestion: store.currentQuestionIndex === 0,
    // 是否是最后一个问题
    isLastQuestion:
      store.currentQuestionIndex === store.currentQuestions.length - 1,
    // 已回答问题数量
    answeredCount: store.currentQuestions.filter((question) => {
      const answer = store.userAnswers[question.id];
      return answer?.answer && answer.answer.trim() !== "";
    }).length,
    // 总问题数量
    totalQuestions: store.currentQuestions.length,
    // 进度百分比
    progress:
      store.currentQuestions.length > 0
        ? (store.currentQuestions.filter((question) => {
            const answer = store.userAnswers[question.id];
            return answer?.answer && answer.answer.trim() !== "";
          }).length /
            store.currentQuestions.length) *
          100
        : 0,
    // 是否全部回答
    allAnswered:
      store.currentQuestions.length > 0 &&
      store.currentQuestions.every((question) => {
        const answer = store.userAnswers[question.id];
        return answer?.answer && answer.answer.trim() !== "";
      }),
    // 当前答案
    currentAnswer: store.currentQuestions[store.currentQuestionIndex]
      ? (store.userAnswers[
          store.currentQuestions[store.currentQuestionIndex]!.id
        ]?.answer ?? "")
      : "",
  };
};
