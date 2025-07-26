"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, Share2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { type CourseHeaderProps } from "@/types/course";

export function CourseHeader({
  course,
  userProgress,
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

  const unlockedChapters = userProgress?.unlockedChapters ?? [1];
  const progressPercentage = course
    ? (unlockedChapters.length / course.chapters.length) * 100
    : 0;

  const handlePublish = () => {
    publishMutation.mutate({ courseId: course.id });
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
        </div>

        {/* 发布按钮 - 只有创建者且课程未公开时显示 */}
        {isCreator && !course.isPublic && (
          <div className="ml-4">
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {publishMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  发布中...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  发布到广场
                </>
              )}
            </Button>
          </div>
        )}

        {/* 已发布状态显示 */}
        {course.isPublic && (
          <div className="ml-4">
            <div className="flex items-center px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <Share2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">已发布到广场</span>
            </div>
          </div>
        )}
      </div>

      {userProgress && (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
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
