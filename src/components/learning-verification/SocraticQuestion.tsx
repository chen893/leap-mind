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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionCategory, Difficulty } from "@/types/api";
import type { SocraticQuestionProps } from "@/types/components";

const difficultyColors: Record<Difficulty, string> = {
  EASY: "bg-green-100 text-green-800 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
  HARD: "bg-red-100 text-red-800 border-red-200",
};

const typeLabels: Record<QuestionCategory, string> = {
  SOCRATIC: "苏格拉底式",
  REFLECTION: "反思性",
  APPLICATION: "应用性",
};

const difficultyLabels: Record<Difficulty, string> = {
  EASY: "简单",
  MEDIUM: "中等",
  HARD: "困难",
};

export function SocraticQuestion({
  question,
  answer,
  result,
  evaluation,
  questionIndex,
  totalQuestions,
  isEvaluating = false,
  showHints = false,
  retryCount = 0,
  onAnswerChange,
  onPrevious,
  onNext,
  onToggleHints,
}: SocraticQuestionProps) {
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  const hasAnswer = answer.trim().length >= 10;
  const isAnswered = evaluation !== undefined;

  return (
    <div className="max-h-[70vh] space-y-6 overflow-auto p-6">
      {/* 问题卡片 */}
      <Card className="border-0 shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">深度思考问题</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  difficultyColors[question?.difficulty ?? "EASY"],
                )}
              >
                {difficultyLabels[question?.difficulty || "EASY"]}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {typeLabels[question?.questionCategory || "SOCRATIC"]}
              </Badge>
            </div>
          </div>

          <div className="text-foreground text-lg leading-relaxed">
            {question.questionText}
          </div>

          {/* 提示按钮 */}
          {question.hints && question?.hints?.length > 0 && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggleHints}
                      className="text-xs"
                    >
                      <Lightbulb className="mr-1 h-4 w-4" />
                      {showHints ? "隐藏提示" : "显示提示"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>点击查看思考提示</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  第 {retryCount + 1} 次尝试
                </Badge>
              )}
            </div>
          )}

          {/* 提示内容 */}
          {showHints && question.hints && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900">思考提示：</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {question.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 答案输入区域 */}
          <div className="space-y-2">
            <label className="text-foreground text-sm font-medium">
              请详细阐述您的想法：
            </label>
            <Textarea
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="请深入思考并详细回答这个问题。建议至少写50字以上，展示您的思考过程..."
              className={cn(
                "min-h-[120px] resize-none transition-all duration-200",
                evaluation &&
                  evaluation.isCorrect &&
                  "border-green-300 bg-green-50",
                evaluation &&
                  evaluation.isCorrect === false &&
                  "border-red-300 bg-red-50",
              )}
            />
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <span>最少10个字符</span>
              <span>{answer.length} 字符</span>
            </div>
          </div>

          {/* 评估结果显示区域 */}
          {evaluation && (
            <Card
              className={cn(
                "animate-in slide-in-from-top-2 border-l-4 transition-all duration-300",
                evaluation.isCorrect
                  ? "border-l-green-500 bg-green-50"
                  : "border-l-red-500 bg-red-50",
              )}
            >
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {/* 评估结果头部 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {evaluation.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium",
                          evaluation.isCorrect
                            ? "text-green-800"
                            : "text-red-800",
                        )}
                      >
                        {evaluation.isCorrect ? "回答正确" : "需要改进"}
                      </span>
                    </div>
                    <Badge
                      variant={evaluation.isCorrect ? "default" : "destructive"}
                    >
                      {evaluation.score || 0} 分
                    </Badge>
                  </div>

                  {/* AI 反馈 */}
                  {evaluation.feedback && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-blue-500" />
                        <span className="text-xs font-medium text-gray-600">
                          AI 反馈
                        </span>
                      </div>
                      <p className="pl-3 text-sm leading-relaxed text-gray-700">
                        {evaluation.feedback}
                      </p>
                    </div>
                  )}

                  {/* 改进建议 */}
                  {evaluation.suggestions &&
                    evaluation.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-blue-500" />
                          <span className="text-xs font-medium text-gray-600">
                            改进建议
                          </span>
                        </div>
                        <ul className="space-y-1 pl-3">
                          {evaluation.suggestions.map((suggestion, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-700"
                            >
                              <span className="mt-1 text-xs text-blue-500">
                                •
                              </span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 - 优化布局 */}
          <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            {/* 左侧：导航按钮 */}
            <div className="flex items-center gap-2">
              {onPrevious && questionIndex > 0 && (
                <Button variant="outline" onClick={onPrevious} size="sm">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  上一题
                </Button>
              )}
              {onNext && questionIndex < totalQuestions - 1 && (
                <Button variant="default" onClick={onNext} size="sm">
                  下一题
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* 右侧：状态指示 */}
            <div className="flex items-center gap-3">
              {/* 答案状态指示 */}
              {hasAnswer && !evaluation && (
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span>已填写</span>
                </div>
              )}

              {/* 评估状态指示 */}
              {evaluation && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1 text-sm",
                    evaluation.isCorrect
                      ? "bg-green-50 text-green-700"
                      : "bg-orange-50 text-orange-700",
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
