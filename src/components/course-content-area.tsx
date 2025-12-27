"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterContent } from "@/components/chapter-content";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { LearningVerificationDialog } from "@/components/learning-verification/LearningVerificationDialog";
import {
  BookOpen,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Trophy,
  Zap,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useChapterQuestionsSSE } from "@/hooks/use-chapter-questions-sse";
import type { CourseContentAreaProps } from "@/types/components";

export function CourseContentArea({
  courseId,
  selectedChapterNumber,
  chapterProgresses,
  isCreator,
  selectNextChapter,
}: CourseContentAreaProps) {
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const { data: course } = api.course.getById.useQuery({ id: courseId });

  const selectedChapter = course?.chapters.find(
    (c) => c.chapterNumber === selectedChapterNumber,
  );

  const chapterProgress = chapterProgresses.find(
    (p) => p.chapterId === selectedChapter?.id,
  );
  const isUnlocked =
    isCreator ||
    chapterProgress?.status === "UNLOCKED" ||
    chapterProgress?.status === "COMPLETED" ||
    selectedChapterNumber === 1;
  const isCompleted = chapterProgress?.status === "COMPLETED";

  const [lvReady, setLvReady] = useState(false);

  const {
    isReady: questionsReady,
    questionCount,
    source: questionsSource,
  } = useChapterQuestionsSSE(selectedChapter?.id ?? null);

  useEffect(() => {
    if (questionsReady) {
      setLvReady(true);
    }
    return () => {
      setLvReady(false);
    };
  }, [questionsReady, selectedChapter?.id, questionCount, questionsSource]);

  if (!selectedChapter) {
    return (
      <div className="rounded-xl bg-white/60 backdrop-blur-sm p-8 ring-1 ring-amber-100/80 text-center">
        <BookOpen className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <p className="text-amber-700">请选择章节</p>
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      {/* 紧凑的标签栏 */}
      <div className="flex items-center gap-3">
        <TabsList className="bg-white/60 backdrop-blur-sm p-1 rounded-lg ring-1 ring-amber-100/80">
          <TabsTrigger
            value="content"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-md px-3 py-1.5 text-sm font-medium transition-all"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            内容
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-md px-3 py-1.5 text-sm font-medium transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            AI 助手
          </TabsTrigger>
        </TabsList>

        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-xs font-medium text-emerald-700">
            <Trophy className="h-3 w-3" />
            已完成
          </span>
        )}
      </div>

      {/* 学习内容 */}
      <TabsContent value="content" className="mt-0 space-y-4">
        <div className="rounded-xl bg-white/60 backdrop-blur-sm ring-1 ring-amber-100/80">
          <div className="p-5">
            <ChapterContent
              key={selectedChapter.id}
              courseId={courseId}
              chapterNumber={selectedChapterNumber ?? 1}
              isUnlocked={isUnlocked}
              isCreator={isCreator}
            />
          </div>

          {/* 学习验证 - 紧凑版 */}
          {lvReady && !isCompleted && (
            <div className="border-t border-amber-100 bg-gradient-to-r from-amber-50/80 to-orange-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">验证学习成果</p>
                    <p className="text-xs text-amber-600">完成验证解锁下一章</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowVerificationDialog(true)}
                  disabled={!isUnlocked}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-lg shadow-sm"
                >
                  开始验证
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* 已完成 - 紧凑版 */}
          {isCompleted && (
            <div className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-900">已完成本章</p>
                  <p className="text-xs text-emerald-600">继续学习下一章节</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <LearningVerificationDialog
          open={showVerificationDialog}
          onOpenChange={setShowVerificationDialog}
          chapterId={selectedChapter.id}
          chapterTitle={selectedChapter.title}
          courseId={courseId}
          onComplete={selectNextChapter}
        />
      </TabsContent>

      {/* AI 助手 */}
      <TabsContent value="chat" className="mt-0">
        <div className="rounded-xl bg-white/60 backdrop-blur-sm ring-1 ring-amber-100/80">
          <AIChatPanel
            courseId={courseId}
            chapterNumber={selectedChapterNumber ?? 1}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
