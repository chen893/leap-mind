"use client";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useCompletion } from "@ai-sdk/react";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Markdown } from "./markdown-renderer";
import type { ChapterContentProps } from "@/types/components";

export function ChapterContent({
  courseId,
  chapterNumber,
  isUnlocked,
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
    if (!chapter) return;
    count.current++;

    void complete("", {
      body: {
        chapterId: chapter.id,
        courseTitle: course?.title,
        chapterTitle: chapter.title,
        level: "初学者",
      },
    });
  };

  if (!isUnlocked) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">章节未解锁</h3>
          <p className="text-center text-gray-600">
            完成前面的章节学习后即可解锁此内容
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!chapter) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="mx-auto mb-2 h-4 w-32 rounded bg-gray-200"></div>
            <div className="mx-auto h-3 w-24 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              第{chapterNumber}章：{chapter.title}
            </CardTitle>
            <CardDescription>
              {chapter.contentMd ? "内容已生成" : "点击生成按钮开始学习"}
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            variant={chapter.contentMd ? "outline" : "default"}
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                {chapter.contentMd ? "重新生成" : "生成内容"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="max-h-[40vh] overflow-auto">
        {contentMd ? (
          <Markdown key={courseId + "-" + count.current} content={contentMd} />
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              准备开始学习
            </h3>
            <p className="mb-4 text-gray-600">
              点击&quot;生成内容&quot;按钮，AI将为你创建个性化的学习材料
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
