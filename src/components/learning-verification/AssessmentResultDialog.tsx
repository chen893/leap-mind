"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight,
  CheckCircle,
  Home,
  RotateCcw,
  Star,
  Target,
  Trophy,
  X,
  XCircle,
  Sparkles,
  Award,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChapterAssessmentResult } from "@/types/store";

interface AssessmentResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentResult: ChapterAssessmentResult | null;
  onComplete: () => void;
  onRetry: () => void;
}

export function AssessmentResultDialog({
  open,
  onOpenChange,
  assessmentResult,
  onComplete,
  onRetry,
}: AssessmentResultDialogProps) {
  if (!assessmentResult) return null;

  const isPassed = assessmentResult.canProgress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] max-w-4xl flex-col overflow-hidden",
          "border-0 bg-gradient-to-b from-background to-muted/30",
          "shadow-2xl",
        )}
      >
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          {isPassed ? (
            <>
              <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/15 to-brand-accent/10 blur-3xl" />
            </>
          ) : (
            <>
              <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/15 to-primary/10 blur-3xl" />
            </>
          )}
        </div>

        <DialogHeader className="relative shrink-0 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                评估结果
                <Sparkles className={cn("h-5 w-5", isPassed ? "text-green-500" : "text-brand-accent")} />
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] flex-1 overflow-auto px-1">
          <div className="space-y-6 py-6">
            {/* 总体评估结果 */}
            <Card
              className={cn(
                "overflow-hidden border-0",
                "shadow-xl",
                isPassed
                  ? "bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5"
                  : "bg-gradient-to-br from-brand-accent/5 via-brand-accent/5 to-primary/5",
              )}
            >
              <CardContent className="p-8">
                <div className="space-y-8 text-center">
                  {/* 图标展示 */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div
                        className={cn(
                          "flex h-28 w-28 items-center justify-center rounded-3xl",
                          "shadow-2xl ring-4 ring-background",
                          isPassed
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/30"
                            : "bg-gradient-to-br from-brand-accent to-brand-accent/80 shadow-brand-accent/30",
                        )}
                      >
                        {isPassed ? (
                          <Trophy className="h-14 w-14 text-white" />
                        ) : (
                          <Target className="h-14 w-14 text-brand-accent-foreground" />
                        )}
                      </div>
                      {/* 装饰光环 */}
                      <div
                        className={cn(
                          "absolute -inset-2 rounded-[2rem] opacity-40",
                          isPassed
                            ? "bg-gradient-to-br from-green-500/30 to-transparent"
                            : "bg-gradient-to-br from-brand-accent/30 to-transparent",
                        )}
                        style={{ filter: "blur(12px)" }}
                      />
                      {/* 成功徽章 */}
                      {isPassed && (
                        <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent shadow-lg ring-4 ring-background">
                          <CheckCircle className="h-5 w-5 text-brand-accent-foreground" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 结果文字 */}
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold tracking-tight text-foreground">
                      {isPassed ? "恭喜通过评估！" : "继续加油！"}
                    </h3>
                    <div
                      className={cn(
                        "mx-auto max-w-lg rounded-xl p-5 text-base leading-relaxed",
                        "border",
                        isPassed
                          ? "border-green-500/30 bg-green-500/5 text-green-800 dark:text-green-300"
                          : "border-brand-accent/30 bg-brand-accent/5 text-brand-accent-foreground",
                      )}
                    >
                      {isPassed
                        ? `${assessmentResult.feedback} 您现在可以继续学习下一章节了！`
                        : assessmentResult.feedback}
                    </div>
                  </div>

                  {/* 统计数据 */}
                  <div className="flex justify-center gap-8">
                    {/* 分数卡片 */}
                    <div
                      className={cn(
                        "rounded-2xl p-6",
                        "bg-card",
                        "border border-border/50",
                        "shadow-lg",
                        "min-w-[140px]",
                      )}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className={cn("h-6 w-6", isPassed ? "text-green-500" : "text-primary")} />
                      </div>
                      <div
                        className={cn(
                          "text-4xl font-bold tabular-nums",
                          isPassed ? "text-green-600 dark:text-green-400" : "text-primary",
                        )}
                      >
                        {assessmentResult.totalScore}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground mt-1">
                        分数
                      </div>
                    </div>

                    {/* 积分卡片 */}
                    {assessmentResult.pointsEarned > 0 && (
                      <div
                        className={cn(
                          "rounded-2xl p-6",
                          "bg-card",
                          "border border-border/50",
                          "shadow-lg",
                          "min-w-[140px]",
                        )}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="h-6 w-6 text-brand-accent" />
                        </div>
                        <div className="text-4xl font-bold tabular-nums text-brand-accent-foreground">
                          +{assessmentResult.pointsEarned}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground mt-1">
                          获得积分
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-center">
                    {isPassed ? (
                      <Button
                        onClick={onComplete}
                        size="lg"
                        className={cn(
                          "gap-2 px-8",
                          "bg-gradient-to-r from-green-500 to-emerald-500",
                          "text-white",
                          "shadow-lg shadow-green-500/30",
                          "transition-all duration-300",
                          "hover:shadow-xl hover:shadow-green-500/40",
                          "active:scale-[0.98]",
                        )}
                      >
                        <ArrowRight className="h-5 w-5" />
                        前往下一章节
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={onRetry}
                          size="lg"
                          className={cn(
                            "gap-2 px-6",
                            "border-2 border-primary/30",
                            "hover:bg-primary/5 hover:border-primary/50",
                            "transition-all duration-200",
                          )}
                        >
                          <RotateCcw className="h-4 w-4" />
                          重新答题
                        </Button>
                        <Button
                          onClick={onComplete}
                          size="lg"
                          variant="outline"
                          className={cn(
                            "gap-2 px-6",
                            "border-2 border-border",
                            "hover:bg-muted/50",
                            "transition-all duration-200",
                          )}
                        >
                          <Home className="h-4 w-4" />
                          返回章节
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
