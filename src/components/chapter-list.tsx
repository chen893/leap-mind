"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CheckCircle, Lock, PlayCircle } from "lucide-react";
import { type ChapterListProps } from "@/types/course";
export function ChapterList({
  chapters,
  selectedChapter,
  unlockedChapters,
  onChapterSelect,
}: ChapterListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>课程章节</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {chapters.map((chapter) => {
            const isUnlocked = unlockedChapters.includes(chapter.chapterNumber);
            const isSelected = selectedChapter === chapter.chapterNumber;

            return (
              <div key={chapter.id} className="group relative">
                <button
                  onClick={() =>
                    isUnlocked && onChapterSelect(chapter.chapterNumber)
                  }
                  disabled={!isUnlocked}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm"
                      : isUnlocked
                      ? "hover:bg-gray-50 hover:shadow-sm"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {isUnlocked ? (
                        chapter.contentMd ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-blue-500" />
                        )
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          第{chapter.chapterNumber}章
                        </span>
                        {chapter.description && (
                          <div className="relative group/tooltip">
                            <svg
                              className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help"
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
                            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-80 max-w-md whitespace-normal">
                              <div className="font-medium mb-2">章节描述</div>
                              <div className="text-gray-200 leading-relaxed">
                                {chapter.description}
                              </div>
                              {/* 箭头 */}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {chapter.title}
                      </div>
                      {chapter.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                          {chapter.description}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
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
