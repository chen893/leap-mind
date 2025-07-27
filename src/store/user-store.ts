import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  currentCourse: string | null;
  currentChapter: number;
  setCurrentCourse: (courseId: string | null) => void;
  setCurrentChapter: (chapter: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentCourse: null,
      currentChapter: 1,
      setCurrentCourse: (courseId) => set({ currentCourse: courseId }),
      setCurrentChapter: (chapter) => set({ currentChapter: chapter }),
    }),
    {
      name: "user-storage",
    },
  ),
);
