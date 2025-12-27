"use client";

import {
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react";
import type { ChapterListProps } from "@/types/components";

export function ChapterList({
  chapters,
  selectedChapterNumber,
  chapterProgresses,
  onChapterSelect,
}: ChapterListProps) {
  return (
    <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-2 shadow-lg shadow-amber-900/5 ring-1 ring-amber-100/80">
      <div className="space-y-1">
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
            <button
              key={chapter.id}
              onClick={() => isUnlocked && onChapterSelect(chapter.chapterNumber)}
              disabled={!isUnlocked}
              className={`
                group relative w-full rounded-xl p-3 text-left transition-all duration-200
                ${
                  isSelected
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/20"
                    : isUnlocked
                      ? "hover:bg-amber-50"
                      : "opacity-40 cursor-not-allowed"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {/* 状态图标 */}
                <div
                  className={`
                    flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors
                    ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : isCompleted
                          ? "bg-emerald-100 text-emerald-600"
                          : isUnlocked
                            ? "bg-amber-100 text-amber-600"
                            : "bg-gray-100 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isSelected ? (
                    <Play className="h-3.5 w-3.5 fill-current" />
                  ) : isUnlocked ? (
                    chapter.chapterNumber
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                </div>

                {/* 章节标题 */}
                <span
                  className={`
                    text-sm font-medium truncate transition-colors
                    ${
                      isSelected
                        ? "text-white"
                        : isUnlocked
                          ? "text-amber-900"
                          : "text-gray-500"
                    }
                  `}
                >
                  {chapter.title}
                </span>

                {/* 选中指示点 */}
                {isSelected && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
