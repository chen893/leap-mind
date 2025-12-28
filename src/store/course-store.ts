import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { CourseChapter, CourseState } from "@/types/store";

export const useCourseStore = create<CourseState>()(
  devtools(
    (set, get) => ({
      selectedChapter: null,
      selectedChapterNumber: null,

      setSelectedChapter: (chapter: CourseChapter) => {
        set({
          selectedChapter: chapter,
          selectedChapterNumber: chapter.chapterNumber,
        });
      },

      setSelectedChapterByNumber: (
        chapterNumber: number,
        chapters: CourseChapter[],
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
