import type { RouterOutputs } from "@/trpc/react";

// 基础类型
export type Course = RouterOutputs["course"]["getById"];
export type Chapter = Course["chapters"][0];
export type UserCourseProgress = RouterOutputs["course"]["getUserCourses"][0];

// 组件专用类型
export interface CourseHeaderProps {
  course: Course;
  userProgress?: UserCourseProgress;
  isCreator: boolean;
  onCourseUpdate: () => void;
}

export interface ChapterListProps {
  chapters: Chapter[];
  selectedChapter: number;
  unlockedChapters: number[];
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
    chapters: Pick<Chapter, "id" | "title">[];
    joinedByCount?: number;
  };
  progress?: {
    status: string;
    unlockedChapters: number[];
  };
  showProgress?: boolean;
}
