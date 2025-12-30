"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Sparkles,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types/api";
import { QuestionCategory } from "@prisma/client";
import type { SocraticQuestionProps } from "@/types/components";

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  EASY: {
    label: "简单",
    className: "bg-green-500/10 text-green-700 dark:text-green-400 ring-1 ring-green-500/30",
  },
  MEDIUM: {
    label: "中等",
    className: "bg-brand-accent/10 text-brand-accent-foreground ring-1 ring-brand-accent/30",
  },
  HARD: {
    label: "困难",
    className: "bg-destructive/10 text-destructive ring-1 ring-destructive/30",
  },
};

const typeLabels: Record<QuestionCategory, string> = {
  [QuestionCategory.SOCRATIC]: "苏格拉底式",
  [QuestionCategory.REFLECTIVE]: "反思性",
  [QuestionCategory.ANALYTICAL]: "分析性",
  [QuestionCategory.CREATIVE]: "创造性",
  [QuestionCategory.PRACTICAL]: "实践性",
};

export function SocraticQuestion({
  question,
  answer,
  questionIndex,
  totalQuestions,
  showHints = false,
  retryCount = 0,
  onAnswerChange,
  onPrevious,
  onNext,
  onToggleHints,
}: SocraticQuestionProps) {
  const hasAnswer = answer.trim().length >= 10;
  const evaluation = question.userAnswers[0];
  const difficulty = difficultyConfig[question?.difficulty ?? "EASY"];

  return (
    <div className="max-h-[70vh] min-w-[50vw] space-y-6 overflow-auto p-6">
      {/* 问题卡片 */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-5 px-0 pt-0">
          {/* 标题和标签 */}
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
              <MessageSquare className="h-5 w-5 text-primary" />
              深度思考问题
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("text-xs font-medium border-0", difficulty.className)}
              >
                {difficulty.label}
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs font-medium bg-primary/10 text-primary ring-1 ring-primary/20"
              >
                {typeLabels[question?.questionCategory || "SOCRATIC"]}
              </Badge>
            </div>
          </div>

          {/* 问题文本 */}
          <div
            className={cn(
              "rounded-xl p-5",
              "bg-gradient-to-br from-muted/50 to-muted/30",
              "border border-border/50",
            )}
          >
            <p className="text-lg leading-relaxed text-foreground">
              {question.questionText}
            </p>
          </div>

          {/* 提示按钮 */}
          {question.hints && question?.hints?.length > 0 && (
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleHints}
                      className={cn(
                        "gap-2 transition-all duration-200",
                        showHints
                          ? "bg-brand-accent/10 text-brand-accent-foreground border-brand-accent/30"
                          : "hover:bg-brand-accent/10 hover:text-brand-accent-foreground hover:border-brand-accent/30",
                      )}
                    >
                      <Lightbulb className={cn("h-4 w-4", showHints && "text-brand-accent")} />
                      {showHints ? "隐藏提示" : "显示提示"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>点击查看思考提示</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {retryCount > 0 && (
                <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                  第 {retryCount + 1} 次尝试
                </Badge>
              )}
            </div>
          )}

          {/* 提示内容 */}
          {showHints && question.hints && (
            <div
              className={cn(
                "rounded-xl p-5",
                "bg-gradient-to-br from-primary/5 to-brand-accent/5",
                "border border-primary/20",
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">思考提示</h4>
                  <ul className="space-y-2">
                    {question.hints.map((hint, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5 px-0">
          {/* 答案输入区域 */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <PenLine className="h-4 w-4 text-primary" />
              请详细阐述您的想法
            </label>
            <Textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="请深入思考并详细回答这个问题。建议至少写50字以上，展示您的思考过程..."
              className={cn(
                "min-h-[140px] w-full resize-none transition-all duration-200",
                "bg-background",
                "border-border/50 focus:border-primary/50",
                "placeholder:text-muted-foreground/60",
                evaluation &&
                  evaluation.isCorrect &&
                  "border-green-500/50 bg-green-500/5 focus:border-green-500/50",
                evaluation &&
                  evaluation.isCorrect === false &&
                  "border-destructive/50 bg-destructive/5 focus:border-destructive/50",
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>最少10个字符</span>
              <span
                className={cn(
                  "tabular-nums transition-colors",
                  hasAnswer && "text-primary font-medium",
                )}
              >
                {answer.length} 字符
              </span>
            </div>
          </div>

          {/* 评估结果显示区域 */}
          {evaluation && (
            <div
              className={cn(
                "rounded-xl overflow-hidden",
                "border-l-4 transition-all duration-300",
                "animate-in slide-in-from-top-2",
                evaluation.isCorrect
                  ? "border-l-green-500 bg-green-500/5"
                  : "border-l-destructive bg-destructive/5",
              )}
            >
              <div className="p-5 space-y-4">
                {/* 评估结果头部 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {evaluation.isCorrect ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                    )}
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        evaluation.isCorrect
                          ? "text-green-700 dark:text-green-400"
                          : "text-destructive",
                      )}
                    >
                      {evaluation.isCorrect ? "回答正确" : "需要改进"}
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "text-sm font-bold tabular-nums",
                      evaluation.isCorrect
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {evaluation.aiScore ?? 0} 分
                  </Badge>
                </div>

                {/* AI 反馈 */}
                {evaluation.aiFeedback && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span>AI 反馈</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80 pl-5">
                      {evaluation.aiFeedback}
                    </p>
                  </div>
                )}

                {/* 改进建议 */}
                {evaluation.aiSuggestions &&
                  evaluation.aiSuggestions?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Lightbulb className="h-3.5 w-3.5 text-brand-accent" />
                        <span>改进建议</span>
                      </div>
                      <ul className="space-y-1.5 pl-5">
                        {evaluation.aiSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-foreground/80"
                          >
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-accent" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 左侧：导航按钮 */}
            <div className="flex items-center gap-2">
              {onPrevious && questionIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={onPrevious}
                  size="sm"
                  className="gap-1.5 border-border/50 hover:bg-muted/50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  上一题
                </Button>
              )}
              {onNext && questionIndex < totalQuestions - 1 && (
                <Button
                  onClick={onNext}
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    "bg-primary text-primary-foreground",
                    "shadow-sm shadow-primary/25",
                    "hover:shadow-md hover:shadow-primary/30",
                  )}
                >
                  下一题
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 右侧：状态指示 */}
            <div className="flex items-center gap-3">
              {/* 答案状态指示 */}
              {hasAnswer && !evaluation && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5",
                    "bg-green-500/10 text-green-700 dark:text-green-400",
                    "text-sm font-medium",
                    "ring-1 ring-green-500/30",
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>已填写</span>
                </div>
              )}

              {/* 评估状态指示 */}
              {evaluation && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5",
                    "text-sm font-medium",
                    "ring-1",
                    evaluation.isCorrect
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 ring-green-500/30"
                      : "bg-brand-accent/10 text-brand-accent-foreground ring-brand-accent/30",
                  )}
                >
                  {evaluation.isCorrect ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span>{evaluation.isCorrect ? "已完成" : "可重新作答"}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
