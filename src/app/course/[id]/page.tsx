"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { api } from "@/trpc/react";
import { ChapterList } from "@/components/chapter-list";
import { CourseContentArea } from "@/components/course-content-area";
import { CourseLoadingState } from "@/components/course-loading-state";
import { CourseNotFound } from "@/components/course-not-found";
import { useCourseStore } from "@/store/course-store";
import {
  BookOpen,
  Sparkles,
  ChevronRight,
  Target,
} from "lucide-react";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  const { selectedChapterNumber, setSelectedChapterByNumber, reset } =
    useCourseStore();

  const {
    data: course,
    refetch,
    isLoading,
  } = api.course.getById.useQuery({ id: courseId });
  const { data: userCourses, refetch: refetchUserCourses } =
    api.course.getUserCourses.useQuery();
  const { data: chapterProgresses, refetch: refetchChapterProgresses } =
    api.learningVerification.getCourseProgress.useQuery({ courseId });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      course &&
      course.chapters.length > 0 &&
      selectedChapterNumber === null
    ) {
      setSelectedChapterByNumber(1, course.chapters);
    }
  }, [course, selectedChapterNumber, setSelectedChapterByNumber]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const isCreator = session?.user?.id === course?.creatorId;
  const selectNextChapter = async (onlyRefresh = false) => {
    if (onlyRefresh) {
      await refetchUserCourses();
      await refetchChapterProgresses();
      return;
    }
    await refetchUserCourses();
    await refetchChapterProgresses();
    setSelectedChapterByNumber(
      (selectedChapterNumber ?? 1) + 1,
      course!.chapters,
    );
  };

  const completedChapters =
    chapterProgresses?.filter((p) => p.status === "COMPLETED").length ?? 0;
  const totalChapters = course?.chapters.length ?? 0;
  const progressPercentage =
    totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  if (isLoading) {
    return <CourseLoadingState />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/40">
      {/* 简约背景纹理 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-orange-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* 紧凑顶栏 - 课程信息 + 进度 */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-amber-100/50 transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            {/* 左侧：面包屑 + 标题 */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <a
                href="/dashboard"
                className="hidden sm:flex items-center gap-1 text-xs text-amber-600 hover:text-amber-800 transition-colors shrink-0"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>课程</span>
              </a>
              <ChevronRight className="hidden sm:block h-3.5 w-3.5 text-amber-300 shrink-0" />
              <h1 className="text-sm sm:text-base font-semibold text-amber-950 truncate">
                {course.title}
              </h1>
              {course.isPublic && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700 shrink-0">
                  <Sparkles className="h-2.5 w-2.5" />
                  已发布
                </span>
              )}
            </div>

            {/* 右侧：进度条 */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-xs text-amber-700">
                <Target className="h-3.5 w-3.5" />
                <span>{completedChapters}/{totalChapters}</span>
              </div>
              <div className="w-24 sm:w-32 h-2 rounded-full bg-amber-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-800 w-8">{progressPercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 - 无内部滚动 */}
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div
          className={`flex flex-col lg:flex-row gap-6 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* 左侧：章节列表 */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-20">
              {selectedChapterNumber !== null && (
                <ChapterList
                  chapters={course.chapters}
                  selectedChapterNumber={selectedChapterNumber}
                  chapterProgresses={chapterProgresses ?? []}
                  onChapterSelect={(chapterNumber) =>
                    setSelectedChapterByNumber(chapterNumber, course.chapters)
                  }
                />
              )}
            </div>
          </div>

          {/* 右侧：内容区 */}
          <div className="flex-1 min-w-0">
            {selectedChapterNumber !== null && (
              <CourseContentArea
                courseId={courseId}
                selectedChapterNumber={selectedChapterNumber}
                chapterProgresses={chapterProgresses ?? []}
                selectNextChapter={selectNextChapter}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
