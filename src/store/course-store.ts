import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CourseState } from "@/types/store";
import type { Chapter } from "@prisma/client";

export const useCourseStore = create<CourseState>()(
  devtools(
    (set, get) => ({
      selectedChapter: null,
      selectedChapterNumber: null,

      setSelectedChapter: (chapter: Chapter) => {
        set({
          selectedChapter: chapter,
          selectedChapterNumber: chapter.chapterNumber,
        });
      },

      setSelectedChapterByNumber: (
        chapterNumber: number,
        chapters: Chapter[],
      ) => {
        const chapter = chapters.find((c) => c.chapterNumber === chapterNumber);
        if (chapter) {
          set({
            selectedChapter: chapter,
            selectedChapterNumber: chapterNumber,
          });
        }
      },

      reset: () => {
        set({
          selectedChapter: null,
          selectedChapterNumber: null,
        });
      },
    }),
    {
      name: "course-store",
    },
  ),
);
