"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterContent } from "@/components/chapter-content";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { MessageCircle } from "lucide-react";

interface CourseContentAreaProps {
  courseId: string;
  selectedChapter: number;
  unlockedChapters: number[];
  onRefetchUserCourses: () => void;
}

export function CourseContentArea({ 
  courseId, 
  selectedChapter, 
  unlockedChapters, 
  onRefetchUserCourses 
}: CourseContentAreaProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <Tabs defaultValue="content" className="w-full">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="content">学习内容</TabsTrigger>
          <TabsTrigger value="chat">AI助手</TabsTrigger>
        </TabsList>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowChat(!showChat)}
          className="lg:hidden"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI助手
        </Button>
      </div>

      <TabsContent value="content">
        <ChapterContent
          courseId={courseId}
          chapterNumber={selectedChapter}
          isUnlocked={unlockedChapters.includes(selectedChapter)}
          refetchSideChapters={onRefetchUserCourses}
        />
      </TabsContent>

      <TabsContent value="chat">
        <AIChatPanel
          courseId={courseId}
          chapterNumber={selectedChapter}
        />
      </TabsContent>
    </Tabs>
  );
}