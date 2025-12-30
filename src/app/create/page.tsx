"use client";

import { Navbar } from "@/components/navbar";
import { PageShellClient } from "@/components/page-shell-client";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Sparkles, ArrowRight, Pen, MessageSquare, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const levels = [
  { value: "beginner", label: "入门", desc: "零基础友好" },
  { value: "intermediate", label: "进阶", desc: "需要一定基础" },
  { value: "advanced", label: "精通", desc: "深入理解与应用" },
] as const;

export default function CreateCoursePage() {
  const [userInput, setUserInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const createOutline = api.course.createOutline.useMutation({
    onSuccess: (data) => {
      toast({
        title: "课程创建成功",
        description: "正在跳转...",
      });
      router.push(`/course/${data.course.id}`);
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateMutation = api.course.generateTitleAndDescription.useMutation({
    onError: (error) => {
      toast({
        title: "生成失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const refineMutation = api.course.refineTitleAndDescription.useMutation({
    onError: (error) => {
      toast({
        title: "优化失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      toast({
        title: "请先描述你想学的内容",
        variant: "destructive",
      });
      throw new Error("请输入内容");
    }
    const result = await generateMutation.mutateAsync({
      userInput: userInput.trim(),
      level,
    });
    setTitle(result.title);
    setDescription(result.description);
    setShowFeedback(false);
    setFeedback("");
  };

  const handleRefine = async () => {
    if (!feedback.trim()) {
      toast({
        title: "请输入修改建议",
        variant: "destructive",
      });
      throw new Error("请输入反馈");
    }
    const result = await refineMutation.mutateAsync({
      currentTitle: title,
      currentDescription: description,
      userFeedback: feedback.trim(),
      level,
    });
    setTitle(result.title);
    setDescription(result.description);
    setFeedback("");
    setShowFeedback(false);
    toast({
      title: "已根据反馈优化",
    });
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "请先生成或填写课程信息",
        variant: "destructive",
      });
      throw new Error("信息不完整");
    }
    await createOutline.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      level,
    });
  };

  const hasGeneratedContent = title || description;

  return (
    <PageShellClient>
      <Navbar />

      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* 背景装饰 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-0 top-0 h-[600px] w-[600px] translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-brand/8 to-brand-accent/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] -translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-brand-accent/8 to-transparent blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-2xl px-6 py-16 md:py-24">
          {/* 标题区 */}
          <header className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-sm text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI 驱动的课程创建</span>
            </div>
            <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
              创建专属课程
            </h1>
            <p className="mt-3 text-muted-foreground">
              描述你想学什么，AI 将为你量身定制学习路径
            </p>
          </header>

          {/* 表单区 */}
          <div className="space-y-8">
            {/* Step 1: 输入 */}
            <section className="space-y-4">
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium text-foreground">
                  你想学什么？
                </label>
                <span className="text-xs text-muted-foreground">
                  {userInput.length}/500
                </span>
              </div>
              <Textarea
                placeholder="例如：我想系统学习 Python，从基础语法到实际项目开发..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.slice(0, 500))}
                rows={4}
                className="resize-none border-border/60 bg-card/50 text-base transition-colors placeholder:text-muted-foreground/50 focus:border-brand focus:bg-card"
              />
            </section>

            {/* Step 2: 级别选择 */}
            <section className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                选择难度
              </label>
              <div className="grid grid-cols-3 gap-3">
                {levels.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    className={cn(
                      "group relative rounded-xl border px-4 py-3 text-left transition-all duration-200",
                      level === l.value
                        ? "border-brand bg-brand/5 ring-1 ring-brand/20"
                        : "border-border/60 bg-card/30 hover:border-border hover:bg-card/50"
                    )}
                  >
                    <div
                      className={cn(
                        "text-sm font-medium transition-colors",
                        level === l.value ? "text-brand" : "text-foreground"
                      )}
                    >
                      {l.label}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {l.desc}
                    </div>
                    {level === l.value && (
                      <div className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-brand" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* AI 生成按钮 */}
            <div className="flex justify-center pt-2">
              <EnhancedButton
                type="button"
                buttonId="generate"
                onAsyncClick={handleGenerate}
                disabled={!userInput.trim()}
                variant="outline"
                className="gap-2 rounded-full border-brand/30 px-6 text-brand hover:border-brand hover:bg-brand/5"
                loadingText="AI 生成中..."
              >
                <Sparkles className="h-4 w-4" />
                生成课程信息
              </EnhancedButton>
            </div>

            {/* Step 3: 生成结果 */}
            {hasGeneratedContent && (
              <section
                className="animate-in fade-in slide-in-from-bottom-4 space-y-4 rounded-2xl border border-brand/15 bg-gradient-to-b from-brand/[0.03] to-transparent p-6 duration-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-brand">
                    <Pen className="h-3.5 w-3.5" />
                    <span>可编辑 · AI 生成内容</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFeedback(!showFeedback)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors",
                      showFeedback
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-3 w-3" />
                    反馈优化
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      课程标题
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-border/40 bg-background/50 text-lg font-medium focus:border-brand"
                      placeholder="课程标题"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      课程描述
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="resize-none border-border/40 bg-background/50 focus:border-brand"
                      placeholder="课程描述"
                    />
                  </div>
                </div>

                {/* 反馈优化区域 */}
                {showFeedback && (
                  <div className="animate-in fade-in slide-in-from-top-2 space-y-3 border-t border-border/30 pt-4 duration-300">
                    <div className="flex items-baseline justify-between">
                      <label className="text-xs font-medium text-muted-foreground">
                        告诉 AI 如何改进
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {feedback.length}/200
                      </span>
                    </div>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value.slice(0, 200))}
                      placeholder="例如：标题更简洁一些、描述中加入实战项目的内容、语气更专业..."
                      rows={2}
                      className="resize-none border-border/40 bg-background/80 text-sm focus:border-brand"
                    />
                    <div className="flex justify-end">
                      <EnhancedButton
                        type="button"
                        buttonId="refine"
                        onAsyncClick={handleRefine}
                        disabled={!feedback.trim()}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 rounded-full border-brand/30 text-brand hover:border-brand hover:bg-brand/5"
                        loadingText="优化中..."
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        AI 优化
                      </EnhancedButton>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 创建按钮 */}
            <div className="pt-4">
              <EnhancedButton
                type="button"
                buttonId="create"
                onAsyncClick={handleCreate}
                disabled={!title.trim() || !description.trim()}
                className={cn(
                  "group relative h-12 w-full overflow-hidden rounded-xl text-base font-medium transition-all duration-300",
                  hasGeneratedContent
                    ? "bg-brand text-brand-foreground shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/25"
                    : "bg-muted text-muted-foreground"
                )}
                loadingText="创建中..."
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  创建课程
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                {hasGeneratedContent && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}
              </EnhancedButton>
            </div>
          </div>
        </div>
      </main>
    </PageShellClient>
  );
}
