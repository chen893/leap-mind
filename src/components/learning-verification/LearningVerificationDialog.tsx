"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  BookOpen,
  ArrowRight,
  RotateCcw,
  X,
} from "lucide-react";
import { SocraticQuestion } from "./SocraticQuestion";
import {
  useLearningVerificationStore,
  useLearningVerificationSelectors,
} from "@/store/learningVerificationStore";
import { usePointsStore } from "@/store/pointsStore";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LearningVerificationDialogProps } from "@/types/components";

export function LearningVerificationDialog({
  open,
  onOpenChange,
  chapterId,
  chapterTitle,
  onComplete,
}: LearningVerificationDialogProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);

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
    incrementRetry,
    resetChapter,
  } = useLearningVerificationStore();

  const selectors = useLearningVerificationSelectors();
  const { updatePoints } = usePointsStore();

  // API hooks
  const getOrGenerateQuestions =
    api.learningVerification.getOrGenerateQuestions.useQuery(
      { chapterId },
      { enabled: false },
    );
  const evaluateAnswers =
    api.learningVerification.evaluateAnswers.useMutation();

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
        console.log("questionsResult", questionsResult);
        if (questionsResult.data && questionsResult.data.length > 0) {
          setCurrentQuestions(questionsResult.data);
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

  // 渲染加载状态
  const renderLoadingState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2" />
        <p className="text-muted-foreground">正在生成学习验证问题...</p>
      </div>
    </div>
  );

  // 渲染错误状态
  const renderErrorState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <div className="space-y-2">
          <h3 className="font-semibold text-red-900">加载失败</h3>
          <p className="text-red-700">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()}>重新加载</Button>
      </div>
    </div>
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="flex items-center justify-center py-12">
      <div className="space-y-4 text-center">
        <BookOpen className="text-muted-foreground mx-auto h-12 w-12" />
        <p className="text-muted-foreground">暂无学习验证问题</p>
      </div>
    </div>
  );

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
        <DialogContent className="max-w-8xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold">
                  学习验证
                </DialogTitle>
                <DialogDescription>{chapterTitle}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {isLoading && renderLoadingState()}
            {error && renderErrorState()}
            {!isLoading &&
              !error &&
              currentQuestions.length === 0 &&
              renderEmptyState()}

            {!isLoading && !error && currentQuestions.length > 0 && (
              <>
                {/* 问题导航 */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-medium">问题导航</h3>
                      <Badge variant="outline">
                        {selectors.answeredCount} / {selectors.totalQuestions}{" "}
                        已完成
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentQuestions.map((question, index) => {
                        const answer = userAnswers[question.id];
                        const hasValidAnswer =
                          answer?.answer && answer.answer.trim().length >= 10;
                        const isCorrect = answer?.isCorrect;
                        const isCurrent = index === currentQuestionIndex;

                        return (
                          <Button
                            key={question.id}
                            variant={isCurrent ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToQuestion(index)}
                            className={cn(
                              "relative h-10 w-10 p-0",
                              hasValidAnswer &&
                                isCorrect &&
                                "border-green-300 bg-green-100 text-green-800",
                              hasValidAnswer &&
                                isCorrect === false &&
                                "border-red-300 bg-red-100 text-red-800",
                              !hasValidAnswer &&
                                "border-gray-300 bg-gray-50 text-gray-600",
                            )}
                          >
                            {index + 1}
                            {hasValidAnswer && (
                              <div className="absolute -top-1 -right-1">
                                {isCorrect ? (
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                ) : isCorrect === false ? (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                ) : (
                                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                                )}
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 当前问题 */}
                {currentQuestion && (
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
                      selectors.isFirstQuestion ? undefined : previousQuestion
                    }
                    onNext={selectors.isLastQuestion ? undefined : nextQuestion}
                    onToggleHints={() => toggleHints(currentQuestion.id)}
                  />
                )}

                {/* 完成按钮 */}
                {selectors.allAnswered && !assessmentResult && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="font-medium text-green-900">
                              所有问题已完成！
                            </h3>
                            <p className="text-sm text-green-700">
                              点击提交所有答案，AI将进行统一评估
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleEvaluateAll}
                          disabled={isEvaluating}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isEvaluating ? "AI评估中..." : "提交所有答案"}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 评估结果摘要 */}
                {assessmentResult && (
                  <Card
                    className={cn(
                      "border-l-4",
                      assessmentResult.canProgress
                        ? "border-l-green-500 bg-green-50"
                        : "border-l-orange-500 bg-orange-50",
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {assessmentResult.canProgress ? (
                              <Trophy className="h-6 w-6 text-green-600" />
                            ) : (
                              <RotateCcw className="h-6 w-6 text-orange-600" />
                            )}
                            <div>
                              <h3
                                className={cn(
                                  "text-lg font-medium",
                                  assessmentResult.canProgress
                                    ? "text-green-900"
                                    : "text-orange-900",
                                )}
                              >
                                {assessmentResult.canProgress
                                  ? "🎉 验证通过！下一章节已解锁"
                                  : "需要重新学习"}
                              </h3>
                              <p
                                className={cn(
                                  "text-sm",
                                  assessmentResult.canProgress
                                    ? "text-green-700"
                                    : "text-orange-700",
                                )}
                              >
                                {assessmentResult.canProgress
                                  ? `${assessmentResult.feedback} 您现在可以继续学习下一章节了！`
                                  : assessmentResult.feedback}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-primary text-2xl font-bold">
                              {assessmentResult.totalScore} 分
                            </div>
                            {assessmentResult.pointsEarned > 0 && (
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Star className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  +{assessmentResult.pointsEarned} 积分
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {assessmentResult.canProgress ? (
                            <Button onClick={handleComplete} className="flex-1">
                              前往下一章节
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setAssessmentResult(null);
                                  // 重置所有答案的评估状态，允许重新作答
                                  Object.keys(userAnswers).forEach(
                                    (questionId) => {
                                      updateUserAnswer(
                                        questionId,
                                        userAnswers[questionId]?.answer ?? "",
                                      );
                                    },
                                  );
                                }}
                                className="flex-1"
                              >
                                重新答题
                              </Button>
                              <Button
                                onClick={handleComplete}
                                className="flex-1"
                              >
                                返回章节
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 退出确认对话框 */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出？</AlertDialogTitle>
            <AlertDialogDescription>
              您已经回答了部分问题，退出后进度将丢失。确定要退出学习验证吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>继续答题</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmExit}
              className="bg-red-600 hover:bg-red-700"
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
