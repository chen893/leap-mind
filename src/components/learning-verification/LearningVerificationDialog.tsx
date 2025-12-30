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
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
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
  Sparkles,
  Brain,
  Zap,
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
import type { ChapterAssessmentResult } from "@/types/store";
import type { ChapterQuestion } from "@prisma/client";
import type { Questions } from "@/types/api";

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
  // 移除getAssessment调用，因为Assessment模型已被删除
  const evaluateAnswers =
    api.learningVerification.evaluateAnswers.useMutation();

  // 回显已有的答案和评估结果
  const updateQuestions = (chapterQuestions: Questions) => {
    chapterQuestions.forEach((question) => {
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
  };
  // 初始化问题
  useEffect(() => {
    const initializeQuestions = async () => {
      if (!chapterId) return;

      // 切换章节时先清理之前的状态
      resetChapter();
      setLoading(true);

      try {
        // 获取或生成问题（后端会自动判断是否需要生成）
        const questionsResult = await getOrGenerateQuestions.refetch();
        const chapterQuestions = questionsResult.data?.chapterQuestions ?? [];

        if (questionsResult.data && chapterQuestions.length > 0) {
          setCurrentQuestions(chapterQuestions);
          updateQuestions(chapterQuestions);

          // // 获取已有的评估结果
          try {
            if (questionsResult.data) {
              setAssessmentResult(questionsResult.data);
            }
          } catch (assessmentError) {
            console.log("No existing assessment found:", assessmentError);
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
  }, [chapterId]); // 只依赖 chapterId

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
      setCurrentQuestions(result.chapterQuestions);
      updateQuestions(result.chapterQuestions);

      // 显示评估完成提示
      if (result.canProgress) {
        onComplete?.(true);
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

  const currentResult = userAnswers[currentQuestion?.id ?? ""];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "max-h-[90vh] overflow-y-auto",
            "border-0 bg-gradient-to-b from-background to-muted/30",
            "shadow-2xl shadow-primary/10",
          )}
          style={{ maxWidth: "80vw" }}
        >
          {/* 背景装饰 */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-brand-accent/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-tr from-brand-accent/15 to-primary/15 blur-3xl" />
          </div>

          <DialogHeader className="relative">
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/80 pb-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                {/* 图标容器 */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-primary to-primary/80",
                    "shadow-lg shadow-primary/30",
                    "ring-4 ring-primary/10",
                  )}
                >
                  <Brain className="h-6 w-6 text-primary-foreground" />
                  {/* 装饰光点 */}
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-accent animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    <span>学习验证</span>
                    <Sparkles className="h-4 w-4 text-brand-accent" />
                  </h2>
                  <p className="text-sm text-muted-foreground">{chapterTitle}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* 固定顶部标题栏 */}

          <div className="relative flex flex-1 flex-col">
            <>
              <div className="space-y-6 p-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-20">
                    {/* 加载动画 */}
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-brand-accent/20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      </div>
                      {/* 脉冲环 */}
                      <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/10" style={{ animationDuration: "1.5s" }} />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-semibold text-foreground">
                        正在加载问题...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        请稍候，我们正在为您准备学习内容
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10">
                      <XCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <div className="space-y-3 text-center">
                      <h3 className="text-lg font-semibold text-foreground">
                        加载失败
                      </h3>
                      <p className="max-w-md text-sm text-destructive">{error}</p>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        重新加载
                      </Button>
                    </div>
                  </div>
                ) : currentQuestions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center space-y-6 py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-lg font-semibold text-foreground">
                        暂无问题
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        当前章节还没有配置学习验证问题
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentQuestion && (
                      <div className="space-y-4">
                        {/* 问题导航栏 - 固定在顶部 */}
                        <div
                          className={cn(
                            "sticky top-0 z-10 rounded-xl p-4",
                            "bg-card/95 backdrop-blur-md",
                            "border border-border/50",
                            "shadow-sm",
                          )}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-muted-foreground">
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
                                        "relative h-9 w-9 rounded-lg p-0 transition-all duration-200",
                                        "hover:scale-105 active:scale-95",
                                        isCurrent &&
                                          "bg-primary text-primary-foreground shadow-md shadow-primary/30 ring-2 ring-primary/20",
                                        hasValidAnswer &&
                                          isCorrect &&
                                          !isCurrent &&
                                          "bg-green-500/10 text-green-700 ring-1 ring-green-500/30 hover:bg-green-500/20 dark:text-green-400",
                                        hasValidAnswer &&
                                          isCorrect === false &&
                                          !isCurrent &&
                                          "bg-destructive/10 text-destructive ring-1 ring-destructive/30 hover:bg-destructive/20",
                                        hasValidAnswer &&
                                          isCorrect === null &&
                                          !isCurrent &&
                                          "bg-primary/10 text-primary ring-1 ring-primary/30 hover:bg-primary/20",
                                        !hasValidAnswer &&
                                          !isCurrent &&
                                          "bg-muted text-muted-foreground ring-1 ring-border hover:bg-muted/80",
                                      )}
                                    >
                                      <span className="text-xs font-semibold">
                                        {index + 1}
                                      </span>
                                      {hasValidAnswer && (
                                        <div className="absolute -top-1 -right-1">
                                          {isCorrect ? (
                                            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                              <CheckCircle className="h-2 w-2 text-white" />
                                            </div>
                                          ) : isCorrect === false ? (
                                            <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive shadow-sm">
                                              <X className="h-2 w-2 text-white" />
                                            </div>
                                          ) : (
                                            <div className="h-3 w-3 rounded-full bg-primary shadow-sm ring-2 ring-background" />
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
                              className={cn(
                                "gap-2 px-5",
                                "bg-gradient-to-r from-primary to-primary/90",
                                "shadow-md shadow-primary/25",
                                "transition-all duration-300",
                                "hover:shadow-lg hover:shadow-primary/30",
                                "disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none",
                              )}
                              size="sm"
                            >
                              {isEvaluating ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>AI评估中...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4" />
                                  <span>获取AI评估</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* 问题内容区域 */}
                        <div
                          style={{ minWidth: "50vw" }}
                          className={cn(
                            "rounded-xl",
                            "bg-card",
                            "border border-border/50",
                            "shadow-sm",
                          )}
                        >
                          <SocraticQuestion
                            question={currentQuestion}
                            answer={currentAnswer}
                            result={currentResult}
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
        <AlertDialogContent
          className={cn(
            "sm:max-w-md",
            "border-0 bg-gradient-to-b from-background to-muted/30",
            "shadow-2xl",
          )}
        >
          <AlertDialogHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-2xl",
                  "bg-gradient-to-br from-brand-accent/20 to-brand-accent/10",
                  "ring-4 ring-brand-accent/10",
                )}
              >
                <Home className="h-10 w-10 text-brand-accent-foreground" />
              </div>
            </div>
            <AlertDialogTitle className="text-xl font-bold text-foreground">
              确认退出学习验证
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed text-muted-foreground">
              您的答题进度将会自动保存，下次打开时可以继续作答。确定要退出吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-3 pt-6 sm:flex-row">
            <AlertDialogCancel
              className={cn(
                "flex-1",
                "border-2 border-border",
                "transition-all duration-200",
                "hover:bg-muted",
              )}
            >
              继续学习
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className={cn(
                "flex-1 gap-2",
                "bg-brand-accent text-brand-accent-foreground",
                "shadow-md shadow-brand-accent/25",
                "transition-all duration-200",
                "hover:bg-brand-accent/90",
              )}
            >
              <Home className="h-4 w-4" />
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
