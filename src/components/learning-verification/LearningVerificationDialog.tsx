"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {} from "@/components/ui/scroll-area";
import {
  BookOpen,
  CheckCircle,
  Home,
  Loader2,
  RotateCcw,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { SocraticQuestion } from "./SocraticQuestion";
import { AssessmentResultDialog } from "./AssessmentResultDialog";
import {
  useLearningVerificationStore,
  useLearningVerificationSelectors,
} from "@/store/learningVerificationStore";
import { usePointsStore } from "@/store/pointsStore";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LearningVerificationDialogProps } from "@/types/components";
import type { AssessmentResult } from "@/types/store";

export function LearningVerificationDialog({
  open,
  onOpenChange,
  chapterId,
  chapterTitle,
  onComplete,
}: LearningVerificationDialogProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);

  // Store hooks
  const {
    currentQuestions,
    userAnswers,
    currentQuestionIndex,
    isLoading,
    isEvaluating,
    assessmentResult,
    error,
    showHints,
    retryCount,
    setCurrentQuestions,
    updateUserAnswer,
    setQuestionResult,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    setLoading,
    setEvaluating,
    setAssessmentResult,
    setError,
    toggleHints,
    resetChapter,
  } = useLearningVerificationStore();

  const selectors = useLearningVerificationSelectors();

  // API hooks
  const getOrGenerateQuestions =
    api.learningVerification.getOrGenerateQuestions.useQuery(
      { chapterId },
      { enabled: false },
    );
  const getAssessment = api.learningVerification.getAssessment.useQuery(
    { chapterId },
    { enabled: false },
  );
  const evaluateAnswers =
    api.learningVerification.evaluateAnswers.useMutation();

  // 初始化问题
  useEffect(() => {
    const initializeQuestions = async () => {
      if (!chapterId && !open) return;

      // 切换章节时先清理之前的状态
      resetChapter();
      setLoading(true);

      try {
        // 获取或生成问题（后端会自动判断是否需要生成）
        const questionsResult = await getOrGenerateQuestions.refetch();
        console.log("questionsResult", questionsResult);
        if (questionsResult.data && questionsResult.data.length > 0) {
          setCurrentQuestions(questionsResult.data);

          // 回显已有的答案和评估结果
          questionsResult.data.forEach((question) => {
            if (question?.userAnswers && question?.userAnswers?.length > 0) {
              const userAnswer = question.userAnswers[0]; // 取最新的答案
              if (userAnswer) {
                // 更新用户答案到store
                updateUserAnswer(question.id, userAnswer.answer);

                // 如果有评估结果，也设置到store
                if (
                  userAnswer.aiScore !== null &&
                  userAnswer.aiFeedback !== null &&
                  userAnswer.isCorrect !== null
                ) {
                  setQuestionResult(question.id, {
                    answer: userAnswer.answer,
                    isCorrect: userAnswer.isCorrect,
                    score: userAnswer.aiScore,
                    feedback: userAnswer.aiFeedback,
                    submittedAt: userAnswer.updatedAt,
                  });
                }
              }
            }
          });

          // // 获取已有的评估结果
          try {
            const assessmentResult = await getAssessment.refetch();
            if (assessmentResult.data) {
              // 如果有完整的评估结果，设置到store
              const assessment = assessmentResult.data;
              setAssessmentResult(assessment as unknown as AssessmentResult);
            }
          } catch (assessmentError) {
            console.log("No existing assessment found:", assessmentError);
            // 没有评估结果是正常的，不需要报错
          }
        } else {
          setError("无法获取学习验证问题");
          toast.error("无法获取学习验证问题");
        }
      } catch (error) {
        console.error("Failed to initialize questions:", error);
        setError("加载问题失败，请重试");
        toast.error("加载问题失败");
      } finally {
        setLoading(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    initializeQuestions();
  }, [chapterId, open]); // 只依赖 chapterId

  // 评估所有答案
  const handleEvaluateAll = useCallback(async () => {
    // 检查是否所有问题都已回答
    if (!selectors.allAnswered) {
      const unansweredQuestions = currentQuestions.filter((question) => {
        const answer = userAnswers[question.id];
        return !answer?.answer || answer.answer.trim().length < 10;
      });

      toast.error(
        `请先完成所有问题的回答。还有 ${unansweredQuestions.length} 个问题未完成或答案过短（至少10个字符）`,
      );
      return;
    }

    setEvaluating(true);

    try {
      // 构建答案数据：questionId -> answer
      const answers: Record<string, string> = {};
      currentQuestions.forEach((question) => {
        const userAnswer = userAnswers[question.id];
        if (userAnswer?.answer) {
          answers[question.id] = userAnswer.answer;
        }
      });

      const result = await evaluateAnswers.mutateAsync({
        chapterId,
        answers,
      });
      setAssessmentResult(result);
      setShowAssessmentResult(true);

      // 显示评估完成提示
      if (result.canProgress) {
        toast.success(
          `🎉 评估完成！平均分数：${result.totalScore}分，获得${result.pointsEarned}积分，下一章节已解锁！`,
        );
      } else {
        toast.warning(
          `评估完成！平均分数：${result.totalScore}分，需要重新学习`,
        );
      }
    } catch (error) {
      console.error("Failed to evaluate answers:", error);
      toast.error("评估失败，请重试");
    } finally {
      setEvaluating(false);
    }
  }, [
    selectors.allAnswered,
    evaluateAnswers,
    chapterId,
    setAssessmentResult,
    currentQuestions,
    userAnswers,
  ]);

  const handleComplete = useCallback(() => {
    onOpenChange(false);
    onComplete?.();
  }, [onComplete, onOpenChange]);

  // 处理退出
  const handleExit = () => {
    if (Object.keys(userAnswers).length > 0) {
      setShowExitDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const confirmExit = useCallback(() => {
    resetChapter();
    setShowExitDialog(false);
    onOpenChange(false);
  }, [resetChapter, onOpenChange]);

  // 处理评估结果弹窗的完成操作
  const handleAssessmentComplete = useCallback(() => {
    setShowAssessmentResult(false);
    handleComplete();
  }, [handleComplete]);

  // 处理重新答题
  const handleRetry = useCallback(() => {
    setShowAssessmentResult(false);
  }, [setShowAssessmentResult]);

  const currentQuestion = selectors.currentQuestion;
  const currentAnswer = selectors.currentAnswer;

  // 获取当前问题的评估结果
  const getCurrentQuestionEvaluation = () => {
    if (!currentQuestion || !assessmentResult?.evaluationResults) {
      return undefined;
    }
    return assessmentResult.evaluationResults.find(
      (result) => result.questionId === currentQuestion.id,
    );
  };

  const currentResult = userAnswers[currentQuestion?.id ?? ""];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex h-[90vh] w-[80vw] flex-col gap-0 overflow-scroll p-0">
          {/* 固定顶部标题栏 */}
          <div className="flex shrink-0 items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  学习验证
                </h2>
                <p className="text-sm text-gray-500">{chapterTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex max-w-[70vw] flex-1 flex-col">
            <>
              <div className="space-y-6 p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-base font-medium text-gray-900">
                        正在加载问题...
                      </h3>
                      <p className="text-sm text-gray-500">
                        请稍候，我们正在为您准备学习内容
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="space-y-3 text-center">
                      <h3 className="text-base font-medium text-gray-900">
                        加载失败
                      </h3>
                      <p className="max-w-md text-sm text-red-600">{error}</p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="mt-3"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        重新加载
                      </Button>
                    </div>
                  </div>
                ) : currentQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                      <BookOpen className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-base font-medium text-gray-900">
                        暂无问题
                      </h3>
                      <p className="text-sm text-gray-500">
                        当前章节还没有配置学习验证问题
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentQuestion && (
                      <div className="space-y-4">
                        {/* 问题导航栏 - 固定在顶部 */}
                        <div className="sticky top-0 z-10 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-600">
                                问题进度:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {currentQuestions.map((question, index) => {
                                  const answer = userAnswers[question.id];
                                  const hasValidAnswer =
                                    answer?.answer &&
                                    answer.answer.trim().length >= 10;
                                  const isCorrect = answer?.isCorrect;
                                  const isCurrent =
                                    index === currentQuestionIndex;

                                  return (
                                    <Button
                                      key={question.id}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => goToQuestion(index)}
                                      className={cn(
                                        "relative h-8 w-8 rounded-lg border p-0 transition-all duration-200 hover:scale-105",
                                        isCurrent &&
                                          "border-blue-600 bg-blue-600 text-white shadow-sm",
                                        hasValidAnswer &&
                                          isCorrect &&
                                          !isCurrent &&
                                          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
                                        hasValidAnswer &&
                                          isCorrect === false &&
                                          !isCurrent &&
                                          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
                                        hasValidAnswer &&
                                          isCorrect === null &&
                                          !isCurrent &&
                                          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                                        !hasValidAnswer &&
                                          !isCurrent &&
                                          "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                                      )}
                                    >
                                      <span className="text-xs font-medium">
                                        {index + 1}
                                      </span>
                                      {hasValidAnswer && (
                                        <div className="absolute -top-1 -right-1">
                                          {isCorrect ? (
                                            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-green-500">
                                              <CheckCircle className="h-1.5 w-1.5 text-white" />
                                            </div>
                                          ) : isCorrect === false ? (
                                            <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500">
                                              <X className="h-1.5 w-1.5 text-white" />
                                            </div>
                                          ) : (
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                                          )}
                                        </div>
                                      )}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* AI评估按钮 */}
                            <Button
                              onClick={handleEvaluateAll}
                              disabled={!selectors.allAnswered || isEvaluating}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                              size="sm"
                            >
                              {isEvaluating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  AI评估中...
                                </>
                              ) : (
                                <>
                                  <Target className="mr-2 h-4 w-4" />
                                  获取AI评估
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* 问题内容区域 */}
                        <div
                          style={{ minWidth: "30vw" }}
                          className="min-w-[50vw] rounded-xl border border-gray-200 bg-white"
                        >
                          <SocraticQuestion
                            question={currentQuestion}
                            answer={currentAnswer}
                            result={currentResult}
                            evaluation={getCurrentQuestionEvaluation()}
                            questionIndex={currentQuestionIndex}
                            totalQuestions={currentQuestions.length}
                            isEvaluating={isEvaluating}
                            showHints={showHints[currentQuestion.id] ?? false}
                            retryCount={retryCount[currentQuestion.id] ?? 0}
                            onAnswerChange={(answer: string) =>
                              updateUserAnswer(currentQuestion.id, answer)
                            }
                            onPrevious={
                              selectors.isFirstQuestion
                                ? undefined
                                : previousQuestion
                            }
                            onNext={
                              selectors.isLastQuestion
                                ? undefined
                                : nextQuestion
                            }
                            onToggleHints={() =>
                              toggleHints(currentQuestion.id)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          </div>
        </DialogContent>
      </Dialog>

      {/* 退出确认对话框 */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Home className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              确认退出学习验证
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed text-gray-600">
              您的答题进度将会自动保存，下次打开时可以继续作答。确定要退出吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-3 pt-6 sm:flex-row">
            <AlertDialogCancel className="flex-1 border-2 transition-all duration-200 hover:bg-gray-50">
              继续学习
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="flex-1 bg-orange-600 text-white transition-all duration-200 hover:bg-orange-700"
            >
              <Home className="mr-2 h-4 w-4" />
              确定退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 评估结果弹窗 */}
      <AssessmentResultDialog
        open={showAssessmentResult}
        onOpenChange={setShowAssessmentResult}
        assessmentResult={assessmentResult}
        onComplete={handleAssessmentComplete}
        onRetry={handleRetry}
      />
    </>
  );
}
