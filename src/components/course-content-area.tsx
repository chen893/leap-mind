"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChapterContent } from "@/components/chapter-content";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { MessageCircle } from "lucide-react";
import { useButtonState } from "@/store/ui-store";

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
  const chatToggleButtonState = useButtonState('toggle-chat');

  return (
    <Tabs defaultValue="content" className="w-full">
      <div className="flex justify-between items-center mb-4">
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
           <MessageCircle className="h-4 w-4 mr-2" />
           AI助手
         </EnhancedButton>
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