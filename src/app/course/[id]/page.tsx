"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { api } from "@/trpc/react";
import { CourseHeader } from "@/components/course-header";
import { ChapterList } from "@/components/chapter-list";
import { CourseContentArea } from "@/components/course-content-area";
import { CourseLoadingState } from "@/components/course-loading-state";
import { CourseNotFound } from "@/components/course-not-found";
import { useCourseStore } from "@/store/course-store";
export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const { data: session } = useSession();

  // Zustand store
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

  // 初始化选中第一章
  useEffect(() => {
    if (
      course &&
      course.chapters.length > 0 &&
      selectedChapterNumber === null
    ) {
      setSelectedChapterByNumber(1, course.chapters);
    }
  }, [course, selectedChapterNumber, setSelectedChapterByNumber]);

  // 组件卸载时重置状态
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
  if (isLoading) {
    return <CourseLoadingState />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto flex flex-1 flex-col px-4 py-6">
        <CourseHeader
          course={course}
          chapterProgresses={chapterProgresses ?? []}
          isCreator={isCreator}
          onCourseUpdate={refetch}
        />

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
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

          <div className="lg:col-span-3">
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
