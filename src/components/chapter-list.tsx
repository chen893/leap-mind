"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookOpen, CheckCircle, Lock, PlayCircle } from "lucide-react";
import type { Chapter } from "@prisma/client";
import type { ChapterListProps } from "@/types/components";

export function ChapterList({
  chapters,
  selectedChapterNumber,
  chapterProgresses,
  onChapterSelect,
}: ChapterListProps) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>课程章节</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[70vh] space-y-1 overflow-auto">
          {chapters.map((chapter) => {
            const chapterProgress = chapterProgresses.find(
              (p) => p.chapterId === chapter.id,
            );
            const isUnlocked =
              chapterProgress?.status === "UNLOCKED" ||
              chapterProgress?.status === "COMPLETED" ||
              chapter.chapterNumber === 1;
            const isCompleted = chapterProgress?.status === "COMPLETED";
            const isSelected = selectedChapterNumber === chapter.chapterNumber;

            return (
              <div key={chapter.id} className="group relative">
                <button
                  onClick={() =>
                    isUnlocked && onChapterSelect(chapter.chapterNumber)
                  }
                  disabled={!isUnlocked}
                  className={`w-full rounded-lg p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
                      : isUnlocked
                        ? "hover:bg-gray-50 hover:shadow-sm"
                        : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isUnlocked ? (
                        <PlayCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          第{chapter.chapterNumber}章
                        </span>
                      </div>
                      <div className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                        {chapter.title}
                      </div>
                      {chapter.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="line-clamp-1 cursor-help text-xs leading-relaxed text-gray-500">
                                {chapter.description}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              style={{ maxWidth: 400 }}
                            >
                              <p className="text-sm leading-relaxed">
                                {chapter.description}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
