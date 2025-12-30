"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  MoreVertical,
  Trash2,
  Sparkles,
  ArrowRight,
  Layers,
  Code,
  Palette,
  Brain,
  Globe,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { type CourseCardProps } from "@/types/course";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

// 课程封面配色方案 - 基于标题生成一致的颜色
const COVER_THEMES = [
  {
    bg: "from-emerald-500/90 via-teal-500/80 to-cyan-500/70",
    icon: Code,
    pattern: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    bg: "from-violet-500/90 via-purple-500/80 to-fuchsia-500/70",
    icon: Brain,
    pattern: "radial-gradient(circle at 70% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    bg: "from-amber-500/90 via-orange-500/80 to-red-500/70",
    icon: Palette,
    pattern: "radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    bg: "from-blue-500/90 via-indigo-500/80 to-violet-500/70",
    icon: Globe,
    pattern: "radial-gradient(circle at 20% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  {
    bg: "from-rose-500/90 via-pink-500/80 to-fuchsia-500/70",
    icon: Briefcase,
    pattern: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
];

// 基于标题生成稳定的主题索引
function getThemeIndex(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % COVER_THEMES.length;
}

export function CourseCard({
  course,
  progress,
  stats,
  showProgress = false,
  viewMode = "grid",
  onDeleteClick,
}: CourseCardProps) {
  const { data: session } = useSession();

  // 判断当前用户是否为课程创建者
  const isCreator = session?.user?.id === course.creator.id;

  const progressPercentage =
    stats?.progressPercentage ??
    (progress?.chapterProgresses?.length && course.chapters?.length
      ? (progress.chapterProgresses.filter((p) => p.status === "COMPLETED")
          .length /
          course.chapters.length) *
        100
      : 0);

  const isCompleted = progressPercentage === 100;
  const hasProgress = progressPercentage > 0;

  // 获取课程封面主题
  const theme = useMemo(() => {
    const index = getThemeIndex(course.title);
    return COVER_THEMES[index]!;
  }, [course.title]);

  const IconComponent = theme.icon;
  const chapterCount = stats?.totalChapters ?? course.chapters?.length ?? 0;

  // 列表视图
  if (viewMode === "list") {
    return (
      <article
        className={cn(
          "group relative flex overflow-hidden rounded-2xl border transition-all duration-300",
          "border-border/60 bg-card/80 shadow-sm backdrop-blur-sm",
          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        )}
      >
        {/* 封面缩略图 */}
        <div className={cn(
          "relative h-32 w-40 flex-shrink-0 overflow-hidden",
          "bg-gradient-to-br",
          theme.bg,
        )}>
          <div
            className="absolute inset-0"
            style={{ backgroundImage: theme.pattern }}
          />
          <IconComponent className="absolute bottom-3 right-3 h-12 w-12 text-white/20" />

          {/* 章节数角标 */}
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-black/30 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Layers className="h-3 w-3" />
            {chapterCount}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="line-clamp-1 text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {course.title}
              </h3>

              {/* 操作菜单 */}
              {isCreator && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem
                      onClick={() => {
                        if (onDeleteClick) {
                          const chapters = (course.chapters ?? []).map((c) => ({
                            id: c.id,
                            title: c.title,
                          }));
                          onDeleteClick({
                            id: course.id,
                            title: course.title,
                            chapters,
                          });
                        }
                      }}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除课程
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          </div>

          {/* 底部信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* 创作者 */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-1 ring-border">
                  <AvatarImage src={course.creator.image ?? ""} />
                  <AvatarFallback className="bg-muted text-xs">
                    {course.creator.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {course.creator.name}
                </span>
              </div>

              {/* 学习人数 */}
              {course.joinedByCount !== undefined && course.joinedByCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{course.joinedByCount}</span>
                </div>
              )}
            </div>

            <Button
              asChild
              size="sm"
              className="gap-1.5 rounded-lg bg-primary px-4 text-primary-foreground shadow-sm transition-all hover:shadow-md"
            >
              <Link href={`/course/${course.id}`}>
                <span>{showProgress ? "继续" : "开始"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 进度条 */}
        {showProgress && progress && hasProgress && (
          <div className="absolute bottom-0 left-40 right-0 h-1 bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-500",
                isCompleted
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : "bg-gradient-to-r from-primary to-primary/70",
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
      </article>
    );
  }

  // 网格视图（默认）
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        "border-border/60 bg-card/80 shadow-sm backdrop-blur-sm",
        "hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
      )}
    >
      {/* ═══════════════════════════════════════════════════
          封面区域 — 动态生成的渐变封面
          ═══════════════════════════════════════════════════ */}
      <div
        className={cn(
          "relative h-32 w-full overflow-hidden",
          "bg-gradient-to-br",
          theme.bg,
        )}
      >
        {/* 装饰图案 */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: theme.pattern }}
        />

        {/* 大图标装饰 */}
        <IconComponent className="absolute -bottom-4 -right-4 h-24 w-24 text-white/15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />

        {/* 顶部标签区 */}
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between">
          {/* 章节数 */}
          <div className="flex items-center gap-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <Layers className="h-3.5 w-3.5" />
            <span>{chapterCount} 章节</span>
          </div>

          {/* 学习人数 */}
          {course.joinedByCount !== undefined && course.joinedByCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-black/30 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              <span>{course.joinedByCount}</span>
            </div>
          )}
        </div>

        {/* 完成标记 */}
        {isCompleted && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-green-500/90 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            <span>已完成</span>
          </div>
        )}

        {/* 操作菜单 - 仅创建者可见 */}
        {isCreator && (
          <div className="absolute right-3 bottom-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-black/30 text-white backdrop-blur-sm opacity-0 transition-all hover:bg-black/50 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem
                  onClick={() => {
                    if (onDeleteClick) {
                      const chapters = (course.chapters ?? []).map((c) => ({
                        id: c.id,
                        title: c.title,
                      }));
                      onDeleteClick({
                        id: course.id,
                        title: course.title,
                        chapters,
                      });
                    }
                  }}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除课程
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          内容区域 — 优化的排版和呼吸感
          ═══════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col p-5">
        {/* 标题与描述 */}
        <div className="mb-4 flex-1">
          <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        </div>

        {/* 进度显示 */}
        {showProgress && progress && hasProgress && (
          <div className="mb-4 rounded-lg bg-muted/50 p-3 ring-1 ring-border/50">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">学习进度</span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  isCompleted ? "text-green-600" : "text-primary",
                )}
              >
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isCompleted
                    ? "bg-gradient-to-r from-green-500 to-emerald-400"
                    : "bg-gradient-to-r from-primary to-primary/70",
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 底部区域 — 创作者与操作按钮 */}
        <div className="flex items-center justify-between pt-1">
          {/* 创作者信息 */}
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 ring-2 ring-background transition-transform duration-300 group-hover:scale-105">
              <AvatarImage src={course.creator.image ?? ""} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-brand-accent/20 text-xs font-semibold text-primary">
                {course.creator.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground transition-colors group-hover:text-foreground">
              {course.creator.name}
            </span>
          </div>

          {/* 操作按钮 */}
          <Button
            asChild
            size="sm"
            className={cn(
              "gap-1.5 rounded-lg px-4",
              "bg-primary text-primary-foreground",
              "shadow-sm shadow-primary/20",
              "transition-all duration-300",
              "hover:shadow-md hover:shadow-primary/30",
              "active:scale-[0.98]",
            )}
          >
            <Link href={`/course/${course.id}`}>
              <span>{showProgress && hasProgress ? "继续学习" : "开始学习"}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
