"use client";

import { Navbar } from "@/components/navbar";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { BookOpen, Plus, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: userCourses, isLoading } = api.course.getUserCourses.useQuery();

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">请先登录</h1>
          <p className="text-gray-600">登录后即可查看你的学习进度</p>
        </div>
      </div>
    );
  }

  const inProgressCourses =
    userCourses?.filter((p) => p.status === "IN_PROGRESS") ?? [];
  const completedCourses =
    userCourses?.filter((p) => p.status === "COMPLETED") ?? [];
  const createdCourses =
    userCourses?.filter((p) => p.course.creatorId === session.user.id) ?? [];

  const totalChapters =
    userCourses?.reduce((sum, p) => sum + p.course.chapters.length, 0) ?? 0;
  const completedChapters =
    userCourses?.reduce((sum, p) => sum + p.unlockedChapters.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              欢迎回来，{session.user.name}！
            </h1>
            <p className="text-gray-600">继续你的学习之旅</p>
          </div>
          <Link href="/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>创建新课程</span>
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习中课程</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inProgressCourses.length}
              </div>
              <p className="text-muted-foreground text-xs">正在进行的课程</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成课程</CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedCourses.length}
              </div>
              <p className="text-muted-foreground text-xs">学习完成的课程</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">创建的课程</CardTitle>
              <Plus className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{createdCourses.length}</div>
              <p className="text-muted-foreground text-xs">你创建的课程</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">学习进度</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalChapters > 0
                  ? Math.round((completedChapters / totalChapters) * 100)
                  : 0}
                %
              </div>
              <p className="text-muted-foreground text-xs">
                {completedChapters}/{totalChapters} 章节
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Tabs */}
        <Tabs defaultValue="learning" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="learning">
              学习中 ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              已完成 ({completedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="created">
              我创建的 ({createdCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="rounded-lg bg-white p-6">
                      <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="mb-4 h-3 w-full rounded bg-gray-200"></div>
                      <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : inProgressCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressCourses.map((progress) => (
                  <CourseCard
                    key={progress.course.id}
                    course={progress.course}
                    progress={progress}
                    showProgress={true}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  还没有学习中的课程
                </h3>
                <p className="mb-4 text-gray-600">创建或探索课程开始学习吧！</p>
                <div className="flex justify-center space-x-4">
                  <Link href="/create">
                    <Button>创建课程</Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="outline">探索课程</Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedCourses.map((progress) => (
                  <CourseCard
                    key={progress.course.id}
                    course={progress.course}
                    progress={progress}
                    showProgress={true}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  还没有完成的课程
                </h3>
                <p className="text-gray-600">完成学习中的课程后会显示在这里</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="created" className="mt-6">
            {createdCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {createdCourses.map((progress) => (
                  <CourseCard
                    key={progress.course.id}
                    course={progress.course}
                    progress={progress}
                    showProgress={true}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Plus className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  还没有创建课程
                </h3>
                <p className="mb-4 text-gray-600">
                  创建你的第一个AI生成课程吧！
                </p>
                <Link href="/create">
                  <Button>创建课程</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
