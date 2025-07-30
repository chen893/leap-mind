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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssessmentResult } from "@/types/store";

interface AssessmentResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentResult: AssessmentResult | null;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                评估结果
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] flex-1 overflow-auto px-1">
          <div className="space-y-6 py-4">
            {/* 总体评估结果 */}
            <Card
              className={cn(
                "overflow-hidden border-0 shadow-xl",
                assessmentResult.canProgress
                  ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
                  : "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
              )}
            >
              <CardContent className="p-8">
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div
                      className={cn(
                        "flex h-24 w-24 items-center justify-center rounded-full shadow-lg ring-4 ring-white",
                        assessmentResult.canProgress
                          ? "bg-gradient-to-r from-green-100 to-emerald-100"
                          : "bg-gradient-to-r from-orange-100 to-amber-100",
                      )}
                    >
                      {assessmentResult.canProgress ? (
                        <Trophy className="h-12 w-12 text-green-600" />
                      ) : (
                        <Target className="h-12 w-12 text-orange-600" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-gray-900">
                      {assessmentResult.canProgress
                        ? "🎉 恭喜通过评估！"
                        : "💪 继续加油！"}
                    </h3>
                    <div
                      className={cn(
                        "mx-auto max-w-lg rounded-lg p-6 text-base leading-relaxed",
                        assessmentResult.canProgress
                          ? "border border-green-200 bg-green-100 text-green-800"
                          : "border border-orange-200 bg-orange-100 text-orange-800",
                      )}
                    >
                      {assessmentResult.canProgress
                        ? `${assessmentResult.feedback} 您现在可以继续学习下一章节了！`
                        : assessmentResult.feedback}
                    </div>
                  </div>

                  <div className="flex justify-center gap-12">
                    <div className="text-center">
                      <div className="mb-2 text-4xl font-bold text-gray-900">
                        {assessmentResult.totalScore}
                      </div>
                      <div className="text-base font-medium text-gray-600">
                        总分
                      </div>
                    </div>
                    {assessmentResult.pointsEarned > 0 && (
                      <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-4xl font-bold text-yellow-600">
                          <Star className="h-8 w-8" />+
                          {assessmentResult.pointsEarned}
                        </div>
                        <div className="text-base font-medium text-gray-600">
                          获得积分
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                    {assessmentResult.canProgress ? (
                      <Button onClick={onComplete} size="lg" className="flex-1">
                        <ArrowRight className="mr-2 h-5 w-5" />
                        前往下一章节
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={onRetry}
                          size="lg"
                          className="flex-1 border-2 transition-all duration-200 hover:bg-gray-50"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          重新答题
                        </Button>
                        <Button
                          onClick={onComplete}
                          size="lg"
                          className="flex-1 border-2 transition-all duration-200 hover:bg-gray-50"
                          variant="outline"
                        >
                          <Home className="mr-2 h-4 w-4" />
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
