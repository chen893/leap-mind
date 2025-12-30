"use client";

import { CourseCard } from "@/components/course-card";
import { Navbar } from "@/components/navbar";
import { PageShellClient } from "@/components/page-shell-client";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import {
  ArrowRight,
  BookOpen,
  Filter,
  Grid,
  LayoutList,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

// 分类标签配置
const CATEGORY_TAGS = [
  { label: "全部", value: "" },
  { label: "编程开发", value: "编程" },
  { label: "人工智能", value: "AI" },
  { label: "设计创意", value: "设计" },
  { label: "商业管理", value: "商业" },
  { label: "语言学习", value: "语言" },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const {
    data: coursesData,
    fetchNextPage,
    hasNextPage,
    isLoading,
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
    } catch (error: unknown) {
      toast({
        title: "加载失败",
        description: "无法加载更多课程，请稍后重试",
        variant: "destructive",
      });
      console.error("Failed to load more courses:", error);
    }
  };

  // 优化的筛选逻辑
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        !activeCategory ||
        course.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
        course.description.toLowerCase().includes(activeCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, activeCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("");
  };

  const hasActiveFilters = searchQuery || activeCategory;

  return (
    <PageShellClient>
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — 编辑风格的大气开场
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden">
        {/* 多层背景：深度感 */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-brand via-brand/95 to-brand/85" />

        {/* 装饰性几何图案 */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* 左上光晕 */}
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-brand-accent/20 blur-[120px]" />
          {/* 右下光晕 */}
          <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-white/10 blur-[150px]" />
          {/* 网格纹理 */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 pb-16 pt-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* 标签线 */}
            <div className="mb-8 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-brand-accent" />
                <span className="text-sm font-medium tracking-wide text-white/90">
                  AI 驱动的智能学习平台
                </span>
              </div>
            </div>

            {/* 主标题区 — 强化排版 */}
            <div className="mb-10 text-center">
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                探索知识的
                <span className="relative mx-2 inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-brand-accent via-amber-300 to-brand-accent bg-clip-text text-transparent">
                    无限可能
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-brand-accent/20 blur-sm" />
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
                发现由 AI 精心生成的优质课程，开启个性化的智能学习之旅
              </p>
            </div>

            {/* 搜索区域 — 突出设计 */}
            <div className="relative mx-auto max-w-2xl">
              {/* 搜索框发光效果 */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-accent/50 via-white/20 to-brand-accent/50 opacity-60 blur-md" />

              <div className="relative flex items-center overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/20">
                <div className="flex h-14 flex-1 items-center">
                  <Search className="ml-5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                  <Input
                    placeholder="搜索你感兴趣的课程..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-full flex-1 border-0 bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-0"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mr-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="hidden h-8 w-px bg-border sm:block" />
                <EnhancedButton
                  size="lg"
                  className="m-1.5 hidden gap-2 rounded-xl bg-brand px-6 text-brand-foreground shadow-md transition-all duration-300 hover:bg-brand/90 hover:shadow-lg sm:flex"
                >
                  <Search className="h-4 w-4" />
                  搜索
                </EnhancedButton>
              </div>
            </div>

            {/* 分类标签 — 提升点击欲望 */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {CATEGORY_TAGS.map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => setActiveCategory(tag.value)}
                  className={cn(
                    "group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300",
                    activeCategory === tag.value
                      ? "bg-white text-brand shadow-lg shadow-white/20"
                      : "border border-white/25 bg-white/10 text-white/90 backdrop-blur-sm hover:border-white/40 hover:bg-white/20",
                  )}
                >
                  <span className="relative z-10">{tag.label}</span>
                  {/* 悬停时的光效扫描 */}
                  {activeCategory !== tag.value && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 底部过渡波浪 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          COURSE LIST SECTION — 紧凑的列表区域
          ═══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* 标题栏与控件 */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              探索课程
            </h2>
            <div className="flex h-7 items-center rounded-full bg-brand/10 px-3 text-sm font-medium text-brand">
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              {filteredCourses.length} 门课程
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
                清除筛选
              </button>
            )}
          </div>

          {/* 视图控制与筛选 */}
          <div className="flex items-center gap-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 bg-card/50 shadow-sm backdrop-blur-sm"
            >
              <Filter className="h-4 w-4" />
              高级筛选
            </EnhancedButton>

            {/* 视图切换 */}
            <div className="flex items-center rounded-lg border border-border/60 bg-card/50 p-1 shadow-sm backdrop-blur-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-md p-2 transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="网格视图"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-md p-2 transition-all duration-200",
                  viewMode === "list"
                    ? "bg-brand text-brand-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title="列表视图"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 课程网格/列表 */}
        {isLoading ? (
          <div
            className={cn(
              "grid gap-6",
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "mx-auto max-w-3xl grid-cols-1",
            )}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <>
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "mx-auto max-w-3xl grid-cols-1",
              )}
            >
              {filteredCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CourseCard course={course} viewMode={viewMode} />
                </div>
              ))}
            </div>

            {/* 加载更多 */}
            {hasNextPage && (
              <div className="mt-12 flex justify-center">
                <EnhancedButton
                  buttonId="load-more-courses"
                  onAsyncClick={handleLoadMore}
                  size="lg"
                  className="group gap-2 rounded-xl bg-gradient-to-r from-brand to-brand/90 px-8 text-brand-foreground shadow-lg shadow-brand/20 transition-all duration-300 hover:shadow-xl hover:shadow-brand/30"
                  loadingText="加载中..."
                >
                  加载更多
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </EnhancedButton>
              </div>
            )}
          </>
        ) : (
          <EmptyState hasSearch={!!searchQuery} />
        )}
      </section>
    </PageShellClient>
  );
}

// ═══════════════════════════════════════════════════════════
// 子组件
// ═══════════════════════════════════════════════════════════

function CourseCardSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-sm backdrop-blur-sm",
        viewMode === "list" && "flex gap-4",
      )}
    >
      {/* 封面占位 */}
      <div
        className={cn(
          "animate-pulse bg-gradient-to-br from-muted to-muted/50",
          viewMode === "grid" ? "h-32 w-full" : "h-28 w-40 flex-shrink-0",
        )}
      />
      <div className={cn("flex-1 p-5", viewMode === "list" && "py-4")}>
        <div className="mb-3 h-5 w-3/4 animate-pulse rounded-md bg-muted" />
        <div className="mb-2 h-4 w-full animate-pulse rounded bg-muted/70" />
        <div className="mb-4 h-4 w-2/3 animate-pulse rounded bg-muted/70" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
        <BookOpen className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {hasSearch ? "未找到相关课程" : "暂无课程"}
      </h3>
      <p className="mx-auto mb-8 max-w-sm text-muted-foreground">
        {hasSearch
          ? "尝试使用其他关键词搜索，或者浏览全部课程"
          : "成为第一个创建课程的用户，分享你的知识！"}
      </p>
      <EnhancedButton
        asChild
        size="lg"
        className="gap-2 rounded-xl bg-gradient-to-r from-brand to-brand/90 px-6 text-brand-foreground shadow-lg"
      >
        <Link href="/create">
          <Sparkles className="h-4 w-4" />
          {hasSearch ? "浏览全部课程" : "创建第一门课程"}
        </Link>
      </EnhancedButton>
    </div>
  );
}
