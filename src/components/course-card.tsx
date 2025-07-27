"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users } from "lucide-react";
// import { useSession } from "next-auth/react";
import Link from "next/link";
import { type CourseCardProps } from "@/types/course";
export function CourseCard({
  course,
  progress,
  showProgress = false,
}: CourseCardProps) {
  // const { data: session } = useSession();

  const progressPercentage = progress?.unlockedChapters?.length
    ? (progress.unlockedChapters.length / course.chapters.length) * 100
    : 0;

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
      {/* 悬浮效果背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-indigo-50/0 opacity-0 transition-all duration-500 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-indigo-50/50 group-hover:opacity-100"></div>

      {/* 顶部装饰条 */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      <CardHeader className="relative h-[180px]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-700">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-3 line-clamp-2 leading-relaxed text-gray-600">
              {course.description}
            </CardDescription>
          </div>
        </div>

        {/* 优化的元信息 */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 transition-colors duration-300 group-hover:bg-blue-100 group-hover:text-blue-700">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="font-medium">{course.chapters.length} 章节</span>
          </div>
          {course.joinedByCount !== undefined && (
            <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 transition-colors duration-300 group-hover:bg-green-100 group-hover:text-green-700">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">{course.joinedByCount} 人学习</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* 优化的进度显示 */}
        {showProgress && progress && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4 transition-colors duration-300 group-hover:bg-blue-50/50">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium text-gray-700">学习进度</span>
              <span className="font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2.5" />
          </div>
        )}

        {/* 底部操作区域 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 ring-2 ring-gray-100 transition-all duration-300 group-hover:ring-blue-200">
              <AvatarImage src={course.creator.image ?? ""} />

              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-xs font-semibold text-blue-700">
                {course.creator.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-gray-900">
              {course.creator.name}
            </span>
          </div>

          <Link href={`/course/${course.id}`}>
            <Button
              size="sm"
              className="shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              {showProgress ? "继续学习" : "开始学习"}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
