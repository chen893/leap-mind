"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterContent } from "@/components/chapter-content";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { LearningVerificationDialog } from "@/components/learning-verification/LearningVerificationDialog";
import { MessageCircle } from "lucide-react";
import { api } from "@/trpc/react";
import type { CourseContentAreaProps } from "@/types/components";

export function CourseContentArea({
  courseId,
  selectedChapterNumber,
  chapterProgresses,
  selectNextChapter,
}: CourseContentAreaProps) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  // 获取课程信息以找到对应的章节
  const { data: course } = api.course.getById.useQuery({ id: courseId });

  // 根据章节号找到对应的章节
  const selectedChapter = course?.chapters.find(
    (c) => c.chapterNumber === selectedChapterNumber,
  );

  const { data: chapter, isLoading } = api.course.getChapterById.useQuery(
    {
      chapterId: selectedChapter?.id ?? "",
    },
    {
      enabled: !!selectedChapter,
    },
  );
  const [showChat, setShowChat] = useState(false);

  // 检查章节是否解锁
  const chapterProgress = chapterProgresses.find(
    (p) => p.chapterId === selectedChapter?.id,
  );
  const isUnlocked =
    chapterProgress?.status === "UNLOCKED" ||
    chapterProgress?.status === "COMPLETED" ||
    selectedChapterNumber === 1;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!chapter) {
    return <div>Chapter not found.</div>;
  }

  return (
    <Tabs defaultValue="content" className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="content">学习内容</TabsTrigger>
          <TabsTrigger value="chat">AI助手</TabsTrigger>
        </TabsList>

        <EnhancedButton
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className="lg:hidden"
          buttonId="toggle-chat"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          AI助手
        </EnhancedButton>
      </div>

      <TabsContent value="content">
        <div className="rounded-lg bg-white shadow-md">
          <div className="p-6">
            {/* <h2 className="mb-4 text-2xl font-bold">{chapter.title}</h2> */}
            <ChapterContent
              key={chapter.id}
              courseId={courseId}
              chapterNumber={selectedChapterNumber ?? 1}
              isUnlocked={isUnlocked}
            />
          </div>

          {/* 学习验证区域 - 放在内容底部，作为明确的下一步行动 */}
          <div className="border-t bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">学习验证</h3>
                <p className="text-sm text-gray-600">
                  完成学习验证以解锁下一章节并获得积分奖励
                </p>
              </div>
              <Button
                onClick={() => setShowVerificationDialog(true)}
                disabled={!isUnlocked}
                size="lg"
              >
                开始验证
              </Button>
            </div>
          </div>

          {/* 学习验证弹窗 */}
          <LearningVerificationDialog
            open={showVerificationDialog}
            onOpenChange={setShowVerificationDialog}
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            courseId={courseId}
            onComplete={selectNextChapter}
          />
        </div>
      </TabsContent>

      <TabsContent value="chat">
        <AIChatPanel courseId={courseId} chapterNumber={Number(chapter.id)} />
      </TabsContent>
    </Tabs>
  );
}
