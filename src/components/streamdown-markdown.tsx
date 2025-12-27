"use client";

import { Streamdown } from "streamdown";

interface StreamdownMarkdownProps {
  content: string;
  loading?: boolean;
  className?: string;
}

/**
 * Streamdown Markdown 渲染组件
 * 专为 AI 流式响应设计，能够优雅处理不完整的 Markdown 语法
 *
 * 特性：
 * - 自动补全未终止的语法（如 `**粗体` 或 `[链接`）
 * - 渐进式格式化，在流式传输时即时应用样式
 * - 支持 GFM（GitHub Flavored Markdown）
 * - 内置代码高亮（Shiki）
 * - 支持数学公式（KaTeX）和图表（Mermaid）
 */
export function StreamdownMarkdown({
  content,
  loading = false,
  className,
}: StreamdownMarkdownProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-brand"></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-brand"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-brand"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className={className}>
      <Streamdown>{content}</Streamdown>
    </div>
  );
}

export default StreamdownMarkdown;
