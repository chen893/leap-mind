"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, Share2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { type CourseHeaderProps } from "@/types/course";

export function CourseHeader({
  course,
  chapterProgresses,
  isCreator,
  onCourseUpdate,
}: CourseHeaderProps) {
  const { toast } = useToast();

  const publishMutation = api.course.publish.useMutation({
    onSuccess: () => {
      toast({
        title: "课程发布成功！",
        description:
          "您的课程已发布到内容广场，其他用户现在可以发现并克隆您的课程。",
      });
      onCourseUpdate();
    },
    onError: (error) => {
      toast({
        title: "发布失败",
        description: error.message ?? "发布课程时出现错误，请稍后重试。",
        variant: "destructive",
      });
    },
  });

  // 暂时设置进度为0，实际应该通过UserChapterProgress计算

  const handlePublish = () => {
    publishMutation.mutate({ courseId: course.id });
  };

  const progressPercentage = chapterProgresses?.length
    ? (chapterProgresses.filter((p) => p.status === "COMPLETED").length /
        course.chapters.length) *
      100
    : 0;

  return (
    <div className="mb-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {course.title}
          </h1>
          <p className="mb-4 text-gray-600">{course.description}</p>
        </div>

        {/* 发布按钮 - 只有创建者且课程未公开时显示 */}
        {isCreator && !course.isPublic && (
          <div className="ml-4">
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {publishMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  发布中...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  发布到广场
                </>
              )}
            </Button>
          </div>
        )}

        {/* 已发布状态显示 */}
        {course.isPublic && (
          <div className="ml-4">
            <div className="flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700">
              <Share2 className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">已发布到广场</span>
            </div>
          </div>
        )}
      </div>

      {chapterProgresses && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span>学习进度</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
}
