import Link from "next/link";
import { Github, Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-accent text-brand-foreground shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">LeapMind</div>
                <div className="text-xs text-muted-foreground">智学奇点</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AI 驱动的个性化学习平台：生成课程、追踪进度、即时评估。
            </p>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">产品</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/explore">
                  内容广场
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/create">
                  创建课程
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/dashboard">
                  我的课程
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">能力</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>AI 内容生成</li>
              <li>学习验证与反馈</li>
              <li>课程发布与分享</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold">链接</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/test-sse">
                  SSE 测试页
                </Link>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:text-foreground"
                  href="https://github.com/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LeapMind. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link className="hover:text-foreground" href="/">
              首页
            </Link>
            <Link className="hover:text-foreground" href="/explore">
              探索
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

