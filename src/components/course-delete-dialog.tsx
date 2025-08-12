"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CourseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: {
    id: string;
    title: string;
    chapters: Array<{ id: string; title: string }>;
  };
  // 新增：删除成功回调（可选）
  onDeleted?: () => void;
}

export function CourseDeleteDialog({
  open,
  onOpenChange,
  course,
  onDeleted,
}: CourseDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const deleteMutation = api.course.deleteCourse.useMutation({
    onSuccess: (result) => {
      toast({
        title: "删除成功",
        description: `课程 "${result.deletedData.course}" 已成功删除，包含 ${result.deletedData.chapters} 个章节和 ${result.deletedData.userProgresses} 个学习进度记录。`,
      });
      onOpenChange(false);
      setConfirmText("");
      setIsDeleting(false);
      // 若外部传入回调，则交由外部处理（如本地移除列表），否则保持原有跳转行为
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: error.message ?? "删除课程时出现错误，请稍后重试。",
        variant: "destructive",
      });
      setIsDeleting(false);
    },
  });

  const handleDelete = async () => {
    if (confirmText !== course.title) {
      toast({
        title: "确认文本不匹配",
        description: "请输入正确的课程标题以确认删除。",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    deleteMutation.mutate({ courseId: course.id });
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
      setConfirmText("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <AlertDialogTitle>删除课程</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="text-sm text-gray-600">
              您即将删除课程 <span className="font-semibold">"{course.title}"</span>。
            </p>
            
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800 font-medium mb-2">
                此操作将永久删除：
              </p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• 课程及其所有内容</li>
                <li>• 全部 {course.chapters.length} 个章节</li>
                <li>• 所有学习进度和问答记录</li>
                <li>• 相关的积分历史记录</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600">
              <strong>警告：</strong>此操作无法撤销。删除后，您和所有学习者的相关数据都将永久丢失。
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="confirm-title" className="text-sm font-medium">
              请输入课程标题以确认删除：
            </Label>
            <Input
              id="confirm-title"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={course.title}
              disabled={isDeleting}
              className="mt-1"
            />
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1"
          >
            取消
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== course.title || isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                删除中...
              </>
            ) : (
              "确认删除"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}