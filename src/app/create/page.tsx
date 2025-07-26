"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
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
  Loader2,
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
        title: "请输入学习内容",
        description: "请先描述你想学习的内容",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateTitleAndDescriptionMutation.mutate({ userInput });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({
        title: "请完成课程信息",
        description: "请先生成或填写课程标题和描述",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    createOutline.mutate({ title, description, level });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          {/* 特性展示卡片 */}
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="group hover:-translate-y-1 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 text-lg">智能生成</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI自动分析你的需求，生成结构化的课程大纲和详细内容
              </p>
            </div>

            <div className="group hover:-translate-y-1 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 text-lg">个性定制</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                根据难度级别和学习目标，为你量身定制最适合的学习路径
              </p>
            </div>

            <div className="group hover:-translate-y-1 rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 text-lg">即时创建</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                几分钟内完成课程创建，立即开始你的学习或教学之旅
              </p>
            </div>
          </div>

          {/* 主要表单卡片 */}
          <Card className="relative overflow-hidden border-0 bg-white shadow-2xl">
            {/* 顶部装饰条 */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

            <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30 pb-8">
              <div className="text-center">
                <CardTitle className="mb-3 font-bold text-2xl text-gray-900">
                  创建你的专属课程
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg leading-relaxed">
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
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    告诉我你想学什么
                  </label>
                  <div className="relative">
                    <Textarea
                      id="userInput"
                      placeholder="例如：我想学习Python编程，希望能够开发网站和数据分析...\n或者：想掌握UI设计，学会使用Figma制作原型...\n或者：学习机器学习，了解算法原理并能实际应用..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGenerating || isCreating}
                      rows={4}
                      className="resize-none rounded-xl border-2 border-gray-200 bg-white p-4 text-base transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-500 text-sm">
                      💡 描述越具体，AI生成的课程越符合你的需求
                    </p>
                    <Button
                      type="button"
                      onClick={generateTitleAndDescription}
                      disabled={!userInput.trim() || isGenerating || isCreating}
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI生成
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 生成结果预览区域 */}
                {(title || description) && (
                  <div className="space-y-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold text-gray-900">
                        AI生成预览
                      </h3>
                      <div className="ml-auto">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          已生成
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Edit3 className="h-4 w-4" />
                          课程标题
                        </label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          disabled={isCreating}
                          className="h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="AI生成的课程标题"
                        />
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Edit3 className="h-4 w-4" />
                          课程描述
                        </label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          disabled={isCreating}
                          rows={4}
                          className="resize-none rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="AI生成的课程描述"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 bg-white/60 rounded-lg p-3">
                      💡 你可以直接使用AI生成的内容，或根据需要进行调整
                    </p>
                  </div>
                )}

                {/* 难度级别 */}
                <div className="group space-y-3">
                  <label
                    htmlFor="level"
                    className="flex items-center gap-2 font-semibold text-gray-900 text-sm"
                  >
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                    难度级别
                  </label>
                  <Select
                    value={level}
                    onValueChange={(value: "beginner" | "intermediate") =>
                      setLevel(value)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 bg-white text-base transition-all duration-300 hover:border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 bg-white shadow-2xl">
                      <SelectItem
                        value="beginner"
                        className="rounded-lg py-3 text-base"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div>
                            <div className="font-medium">初级</div>
                            <div className="text-gray-500 text-sm">
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
                            <div className="text-gray-500 text-sm">
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
                  <Button
                    type="submit"
                    className="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
                    disabled={
                      isCreating || !title.trim() || !description.trim()
                    }
                  >
                    {isCreating ? (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>AI正在生成课程大纲...</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          <Sparkles className="h-5 w-5" />
                          <span>创建课程</span>
                          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* 底部提示 */}
              <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="mb-2 font-semibold text-gray-900">
                      创建后你将获得：
                    </h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
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
    </div>
  );
}
