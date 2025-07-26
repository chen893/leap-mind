"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { api } from "@/trpc/react";
import { CourseHeader } from "@/components/course-header";
import { ChapterList } from "@/components/chapter-list";
import { CourseContentArea } from "@/components/course-content-area";
import { CourseLoadingState } from "@/components/course-loading-state";
import { CourseNotFound } from "@/components/course-not-found";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [selectedChapter, setSelectedChapter] = useState(1);
  const { data: session } = useSession();

  const {
    data: course,
    refetch,
    isLoading,
  } = api.course.getById.useQuery({ id: courseId });
  const { data: userCourses, refetch: refetchUserCourses } =
    api.course.getUserCourses.useQuery();

  const userProgress = userCourses?.find((p) => p.course.id === courseId);
  const unlockedChapters = userProgress?.unlockedChapters ?? [1];
  const isCreator = session?.user?.id === course?.creatorId;

  if (isLoading) {
    return <CourseLoadingState />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-6">
        <CourseHeader
          course={course}
          userProgress={userProgress}
          isCreator={isCreator}
          onCourseUpdate={refetch}
        />

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ChapterList
              chapters={course.chapters}
              selectedChapter={selectedChapter}
              unlockedChapters={unlockedChapters}
              onChapterSelect={setSelectedChapter}
            />
          </div>

          <div className="lg:col-span-3">
            <CourseContentArea
              courseId={courseId}
              selectedChapter={selectedChapter}
              unlockedChapters={unlockedChapters}
              onRefetchUserCourses={refetchUserCourses}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
