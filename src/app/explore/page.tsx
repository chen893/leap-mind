"use client";

import { CourseCard } from "@/components/course-card";
import { Navbar } from "@/components/navbar";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
  BookOpen,
  Filter,
  Grid,
  List,
  Search,
  Sparkles,
  // TrendingUp,
  // Users,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const {
    data: coursesData,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
  } = api.course.getPublicCourses.useInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const courses = coursesData?.pages.flatMap((page) => page.courses) ?? [];

  const handleLoadMore = async () => {
    try {
      await fetchNextPage();
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载更多课程，请稍后重试",
        variant: "destructive",
      });
      throw error;
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />

      {/* 重新设计的Hero区域 */}
      <div className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-600/95" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 h-72 w-72 animate-pulse rounded-full bg-white/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-purple-300/20 blur-3xl delay-1000" />
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            {/* 增强的标题设计 */}
            <div className="mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white/90 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  AI驱动的智能学习平台
                </span>
              </div>

              <h1 className="text-5xl leading-tight font-bold text-white md:text-7xl">
                内容广场
                <span className="mt-3 block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-3xl font-medium text-transparent md:text-5xl">
                  探索无限可能
                </span>
              </h1>
            </div>

            <p className="mb-12 text-xl leading-relaxed text-blue-100/90 md:text-2xl">
              发现由AI生成的优质学习内容，开启你的智能学习之旅
            </p>

            {/* 重新设计的搜索区域 */}
            <div className="relative mx-auto max-w-2xl">
              <div className="group relative">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-white/20 to-white/10 opacity-75 blur transition duration-1000 group-hover:opacity-100"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-6 z-10 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="搜索你感兴趣的课程..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 rounded-2xl border-0 bg-white/95 py-4 pr-6 pl-14 text-lg shadow-2xl backdrop-blur-sm transition-all duration-300 focus:bg-white focus:shadow-2xl focus:ring-4 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* 优化的快速筛选标签 */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {["编程", "AI", "设计", "商业", "语言"].map((tag) => (
                  <button
                    key={tag}
                    className="group relative overflow-hidden rounded-full border border-white/30 bg-white/10 px-6 py-2.5 text-sm text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
                  >
                    <span className="relative z-10">{tag}</span>
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* 重新设计的统计卡片 */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold tracking-wide text-blue-800">
                总课程数
              </CardTitle>
              <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-4xl font-bold tracking-tight text-blue-900">
                {courses.length}
              </div>
              <p className="mt-2 text-sm font-medium text-blue-600/80">
                AI生成的优质内容
              </p>
            </CardContent>
          </Card>

          {/* 类似地优化其他统计卡片... */}
        </div>

        {/* Filter and View Controls */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">探索课程</h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {filteredCourses.length} 门课程
            </span>
          </div>

          <div className="flex items-center gap-3">
            <EnhancedButton variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              筛选
            </EnhancedButton>

            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Course Grid with Enhanced Loading */}
        {isLoading ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "mx-auto max-w-4xl grid-cols-1"
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-2xl bg-white p-6 shadow-lg">
                  <div className="mb-3 h-4 w-3/4 rounded-lg bg-gray-200"></div>
                  <div className="mb-4 h-3 w-full rounded bg-gray-200"></div>
                  <div className="mb-4 h-3 w-2/3 rounded bg-gray-200"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                    <div className="h-8 w-20 rounded-lg bg-gray-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "mx-auto max-w-4xl grid-cols-1"
              }`}
            >
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="transform transition-all duration-300 hover:scale-105"
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-12 text-center">
                <EnhancedButton
                  buttonId="load-more-courses"
                  onAsyncClick={handleLoadMore}
                  size="lg"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                  loadingText="加载中..."
                >
                  加载更多课程
                </EnhancedButton>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              {searchQuery ? "未找到相关课程" : "暂无课程"}
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              {searchQuery
                ? "尝试使用其他关键词搜索，或者浏览推荐内容"
                : "成为第一个创建课程的用户，分享你的知识！"}
            </p>
            {!searchQuery && (
              <EnhancedButton className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                创建第一门课程
              </EnhancedButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
