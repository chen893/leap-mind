"use client";

import { Navbar } from "@/components/navbar";
import { PageShellClient } from "@/components/page-shell-client";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import {
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Target,
  Zap,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCoursePage() {
  const [userInput, setUserInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate">("beginner");
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const createOutline = api.course.createOutline.useMutation({
    onSuccess: (data) => {
      toast({
        title: "课程创建成功！",
        description: "正在跳转到课程页面...",
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
    onSettled: () => {
      setIsCreating(false);
    },
  });

  const generateTitleAndDescriptionMutation =
    api.course.generateTitleAndDescription.useMutation({
      onSuccess: (data) => {
        setTitle(data.title);
        setDescription(data.description);
        toast({
          title: "生成成功！",
          description: "AI已为你生成课程标题和描述，你可以进一步编辑",
        });
      },
      onError: (error) => {
        toast({
          title: "生成失败",
          description: error.message,
          variant: "destructive",
        });
      },
      onSettled: () => {
        setIsGenerating(false);
      },
    });

  // AI生成标题和描述的函数
  const generateTitleAndDescription = async () => {
    if (!userInput.trim()) {
      toast({
        title: "请输入课程描述",
        description: "请先描述你想要创建的课程内容",
        variant: "destructive",
      });
      throw new Error("请输入课程描述");
    }
    try {
      const result = await generateTitleAndDescriptionMutation.mutateAsync({
        userInput: userInput.trim(),
      });
      setTitle(result.title);
      setDescription(result.description);
      toast({
        title: "生成成功",
        description: "AI已为你生成课程标题和描述",
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "请填写完整信息",
        description: "请确保标题和描述都已填写",
        variant: "destructive",
      });
      throw new Error("请填写完整信息");
    }

    try {
      await createOutline.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        level: level,
      });
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      throw error;
    }
  };

  return (
    <PageShellClient>
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* 特性展示卡片 */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="group rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-accent text-brand-foreground shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                智能生成
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI自动分析你的需求，生成结构化的课程大纲和详细内容
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-accent text-brand-foreground shadow-sm">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                个性定制
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                根据难度级别和学习目标，为你量身定制最适合的学习路径
              </p>
            </div>

            <div className="group rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-accent text-brand-foreground shadow-sm">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                即时创建
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                几分钟内完成课程创建，立即开始你的学习或教学之旅
              </p>
            </div>
          </div>

          {/* 主要表单卡片 */}
          <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-xl backdrop-blur">
            {/* 顶部装饰条 */}
            <div className="h-1 w-full bg-gradient-to-r from-brand to-brand-accent"></div>

            <CardHeader className="bg-gradient-to-r from-background/40 to-brand/5 pb-8">
              <div className="text-center">
                <CardTitle className="mb-3 text-2xl font-bold text-foreground">
                  创建你的专属课程
                </CardTitle>
                <CardDescription className="text-lg leading-relaxed text-muted-foreground">
                  只需描述你想学习的内容，AI将为你生成完整的课程
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 用户输入区域 */}
                <div className="group space-y-3">
                  <label
                    htmlFor="userInput"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-brand"></div>
                    告诉我你想学什么
                  </label>
                  <div className="relative">
                    <Textarea
                      id="userInput"
                      placeholder="例如：我想学习Python编程，希望能够开发网站和数据分析..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGenerating || isCreating}
                      rows={4}
                      className="resize-none rounded-xl border-2 border-border bg-background/70 p-4 text-base shadow-sm backdrop-blur transition-all duration-300 group-hover:border-border/80 focus:border-brand focus:ring-4 focus:ring-brand/20"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      💡 描述越具体，AI生成的课程越符合你的需求
                    </p>
                    <EnhancedButton
                      type="button"
                      buttonId="generate-title-desc"
                      onAsyncClick={generateTitleAndDescription}
                      disabled={!userInput.trim()}
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border-brand/30 px-4 text-brand hover:border-brand/40 hover:bg-brand/10"
                      loadingText="生成中..."
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI生成
                    </EnhancedButton>
                  </div>
                </div>

                {/* 生成结果预览区域 */}
                {(title || description) && (
                  <div className="space-y-4 rounded-xl border border-brand/25 bg-gradient-to-r from-brand/10 to-brand-accent/10 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-brand" />
                      <h3 className="font-semibold text-foreground">AI生成预览</h3>
                      <div className="ml-auto">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          已生成
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Edit3 className="h-4 w-4" />
                          课程标题
                        </label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={isCreating}
                          className="h-11 rounded-lg border-border bg-background/70 shadow-sm backdrop-blur focus:border-brand focus:ring-2 focus:ring-brand/20"
                          placeholder="AI生成的课程标题"
                        />
                      </div>

                      <div className="group">
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Edit3 className="h-4 w-4" />
                          课程描述
                        </label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isCreating}
                          rows={4}
                          className="resize-none rounded-lg border-border bg-background/70 shadow-sm backdrop-blur focus:border-brand focus:ring-2 focus:ring-brand/20"
                          placeholder="AI生成的课程描述"
                        />
                      </div>
                    </div>

                    <p className="rounded-lg bg-background/60 p-3 text-xs text-muted-foreground">
                      💡 你可以直接使用AI生成的内容，或根据需要进行调整
                    </p>
                  </div>
                )}

                {/* 难度级别 */}
                <div className="group space-y-3">
                  <label
                    htmlFor="level"
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-brand-accent"></div>
                    难度级别
                  </label>
                  <Select
                    value={level}
                    onValueChange={(value: "beginner" | "intermediate") =>
                      setLevel(value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-border bg-background/70 text-base shadow-sm backdrop-blur transition-all duration-300 hover:border-border/80 focus:border-brand focus:ring-4 focus:ring-brand/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60 bg-popover shadow-2xl">
                      <SelectItem
                        value="beginner"
                        className="rounded-lg py-3 text-base"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div>
                            <div className="font-medium">初级</div>
                            <div className="text-sm text-gray-500">
                              适合零基础学习者
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem
                        value="intermediate"
                        className="rounded-lg py-3 text-base"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                          <div>
                            <div className="font-medium">中级</div>
                            <div className="text-sm text-muted-foreground">
                              需要一定基础知识
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 提交按钮 */}
                <div className="pt-4">
                  <EnhancedButton
                    type="button"
                    buttonId="create-course"
                    onAsyncClick={handleSubmit}
                    className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand to-brand-accent text-lg font-semibold text-brand-foreground shadow-lg transition-all duration-300 hover:from-brand/90 hover:to-brand-accent/90 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                    disabled={!title.trim() || !description.trim()}
                    loadingText="AI正在生成课程大纲..."
                  >
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                    <div className="relative flex items-center justify-center gap-3">
                      <Sparkles className="h-5 w-5" />
                      <span>创建课程</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </EnhancedButton>
                </div>
              </form>

              {/* 底部提示 */}
              <div className="mt-8 rounded-xl bg-gradient-to-r from-brand/10 to-brand-accent/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand/10">
                    <CheckCircle className="h-4 w-4 text-brand" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">
                      创建后你将获得：
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 完整的课程大纲和章节结构</li>
                      <li>• AI生成的详细学习内容</li>
                      <li>• 个性化的学习路径规划</li>
                      <li>• 可随时编辑和完善的课程材料</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShellClient>
  );
}
