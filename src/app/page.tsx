import { Navbar } from "@/components/navbar";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <PageShell>
      <Navbar />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
                生成课程 · 学习验证 · 进度追踪
              </div>

              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                让 AI 帮你把知识
                <span className="block bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">
                  变成可学的路径
                </span>
              </h1>

              <p className="max-w-xl text-pretty text-lg text-muted-foreground">
                智学奇点会把你的学习目标拆解成课程结构，并在学习过程中用问题与反馈验证理解，帮你真正学会。
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/create" className="gap-2">
                    开始创建课程
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/explore">探索内容广场</Link>
                </Button>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
                  结构化课程大纲
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
                  流式生成与追问
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-accent" />
                  即时评估与解锁
                </span>
              </div>
            </div>

            {/* Right preview */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-brand/20 to-brand-accent/20 blur-2xl" />
              <Card className="relative overflow-hidden border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">示例学习流</CardTitle>
                    <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                      3 分钟上手
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    输入目标 → 生成课程 → 学习验证 → 解锁下一章
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-muted-foreground">
                          课程
                        </div>
                        <div className="truncate font-semibold">
                          从零开始理解 Transformer
                        </div>
                      </div>
                      <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-xs font-medium text-brand-accent-foreground">
                        12 章
                      </span>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Zap className="h-4 w-4 text-brand" />
                        AI 内容生成
                      </div>
                      <p className="text-sm text-muted-foreground">
                        生成可读的解释、示例和练习。
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <MessageCircle className="h-4 w-4 text-brand" />
                        AI 学习助手
                      </div>
                      <p className="text-sm text-muted-foreground">
                        随时追问，保持上下文不丢。
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Target className="h-4 w-4 text-brand" />
                      学习验证
                    </div>
                    <p className="text-sm text-muted-foreground">
                      用苏格拉底式提问验证理解，达标自动解锁下一章。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  核心能力
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  从课程生成到学习验证，把“看懂”变成“学会”。
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/explore">去广场看看</Link>
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Zap className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">AI 内容生成</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  把目标拆成结构化章节，并生成解释、示例与练习。
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Target className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">个性化学习</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  随进度动态调整学习路线，让难度恰到好处。
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">AI 学习助手</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  保持章节上下文，随时追问、纠错与扩展。
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/70 backdrop-blur">
                <CardHeader className="space-y-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-accent/25 text-brand-accent-foreground">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">智能评估</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  用问题与反馈验证理解，解锁下一章并记录成长。
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </PageShell>
  );
}
