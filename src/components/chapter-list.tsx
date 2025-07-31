"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            const chapterProgress = chapterProgresses.find(p => p.chapterId === chapter.id);
            const isUnlocked = chapterProgress?.status === "UNLOCKED" || chapterProgress?.status === "COMPLETED" || chapter.chapterNumber === 1;
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
                        {chapter.description && (
                          <div className="group/tooltip relative">
                            <svg
                              className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {/* 悬浮提示框 */}
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 max-w-md min-w-80 -translate-x-1/2 transform rounded-lg bg-gray-900 px-4 py-3 text-sm whitespace-normal text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover/tooltip:opacity-100">
                              <div className="mb-2 font-medium">章节描述</div>
                              <div className="leading-relaxed text-gray-200">
                                {chapter.description}
                              </div>
                              {/* 箭头 */}
                              <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mb-1 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                        {chapter.title}
                      </div>
                      {chapter.description && (
                        <div className="line-clamp-1 text-xs leading-relaxed text-gray-500">
                          {chapter.description}
                        </div>
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
