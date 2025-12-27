"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useCompletion } from "@ai-sdk/react";
import {
  BookOpen,
  Loader2,
  RefreshCw,
  Sparkles,
  Lock,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { StreamdownMarkdown } from "./streamdown-markdown";
import type { ChapterContentProps } from "@/types/components";

export function ChapterContent({
  courseId,
  chapterNumber,
  isUnlocked,
  isCreator,
}: ChapterContentProps) {
  const { toast } = useToast();

  const { data: course } = api.course.getById.useQuery({ id: courseId });
  const { data: chapter, refetch } = api.chapter.getById.useQuery(
    {
      id:
        course?.chapters.find((c) => c.chapterNumber === chapterNumber)?.id ??
        "",
    },
    { enabled: !!course && isUnlocked },
  );

  const {
    completion,
    complete,
    isLoading: isGenerating,
    setCompletion,
  } = useCompletion({
    api: "/api/ai/generate-chapter",
    onError: (error) => {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive",
      });
    },
    onFinish: () => {
      toast({
        title: "内容生成成功！",
        description: "章节内容已更新",
      });
      void setTimeout(() => {
        void refetch();
      }, 3000);
    },
  });

  useEffect(() => {
    setCompletion("");
  }, [chapter?.courseId, setCompletion]);

  const contentMd = useMemo(() => {
    if (completion) {
      return completion;
    } else {
      return chapter?.contentMd ?? "";
    }
  }, [chapter?.contentMd, completion]);

  const count = useRef(0);
  const handleGenerateContent = () => {
    if (!isCreator) return;
    if (!chapter) return;
    count.current++;

    void complete("", {
      body: {
        chapterId: chapter.id,
        courseTitle: course?.title,
        chapterTitle: chapter.title,
        level: "beginner",
        regenerate: !!chapter.contentMd,
      },
    });
  };

  // 未解锁状态
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 mb-4">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600">章节已锁定</p>
        <p className="text-xs text-gray-400 mt-1">完成前面章节后解锁</p>
      </div>
    );
  }

  // 加载状态
  if (!chapter) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-3 border-amber-200 border-t-amber-500 animate-spin" />
        <span className="ml-3 text-sm text-amber-700">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 紧凑的章节标题栏 */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-amber-100/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-amber-600">
              第 {chapterNumber} 章
            </span>
            {chapter.contentMd && (
              <Sparkles className="h-3 w-3 text-emerald-500" />
            )}
          </div>
          <h2 className="text-lg font-semibold text-amber-950 truncate">
            {chapter.title}
          </h2>
        </div>

        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || !isCreator}
          size="sm"
          className={`shrink-0 ${
            chapter.contentMd
              ? "bg-white text-amber-700 ring-1 ring-amber-200 hover:bg-amber-50"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              生成中
            </>
          ) : chapter.contentMd ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              重新生成
            </>
          ) : (
            <>
              <Wand2 className="h-3.5 w-3.5 mr-1.5" />
              生成内容
            </>
          )}
        </Button>
      </div>

      {/* 内容区域 */}
      {contentMd ? (
        <div className="prose prose-amber prose-sm sm:prose-base max-w-none">
          {isGenerating && (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-50 text-sm text-amber-700">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>AI 正在生成内容...</span>
            </div>
          )}
          <StreamdownMarkdown
            key={courseId + "-" + count.current}
            content={contentMd}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 mb-3">
            <BookOpen className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-sm font-medium text-amber-900">准备开始学习</p>
          <p className="text-xs text-amber-600 mt-1">点击「生成内容」开始</p>
        </div>
      )}
    </div>
  );
}
