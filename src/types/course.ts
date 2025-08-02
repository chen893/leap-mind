import type { RouterOutputs } from "@/trpc/react";

// 基础类型
export type Course = RouterOutputs["course"]["getById"];
export type Chapter = Course["chapters"][0];

// 组件专用类型
export interface CourseHeaderProps {
  course: Course;
  chapterProgresses?: Array<{
    chapterId: string;
    status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  }>;
  isCreator: boolean;
  onCourseUpdate: () => void;
}

export interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: Chapter;
  chapterProgresses: Array<{
    chapterId: string;
    status: "LOCKED" | "UNLOCKED" | "COMPLETED";
  }>;
  onChapterSelect: (chapterNumber: number) => void;
}

// Add to existing course.ts
export interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    creator: {
      name: string | null;
      image: string | null;
    };
    chapters?: Pick<Chapter, "id" | "title">[];
    joinedByCount?: number;
  };
  progress?: {
    status: string;
    chapterProgresses: Array<{
      chapterId: string;
      status: "LOCKED" | "UNLOCKED" | "COMPLETED";
    }>;
  };
  stats?: {
    totalChapters: number;
    completedChapters: number;
    progressPercentage: number;
  };
  showProgress?: boolean;
}
