"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { StreamdownMarkdown } from "./streamdown-markdown";

interface AIChatPanelProps {
  courseId: string;
  chapterNumber: number;
}

export function AIChatPanel({ courseId, chapterNumber }: AIChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/ai/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "你好！我是你的 AI 学习助手。有任何学习问题都可以问我。",
        },
      ],
      body: {
        courseId,
        chapterNumber,
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col">
      {/* 消息列表 - 无固定高度，跟随内容 */}
      <div className="p-4 space-y-3 min-h-[300px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-2.5 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* 头像 */}
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                message.role === "user"
                  ? "bg-brand"
                  : "bg-gradient-to-br from-brand to-brand-accent"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-3.5 w-3.5 text-brand-foreground" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-brand-foreground" />
              )}
            </div>

            {/* 消息 */}
            <div className={`max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-brand text-brand-foreground rounded-tr-sm"
                    : "bg-background ring-1 ring-border/60 rounded-tl-sm"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none">
                    <StreamdownMarkdown content={message.content} />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-accent">
              <Bot className="h-3.5 w-3.5 text-brand-foreground" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl rounded-tl-sm bg-background px-3 py-2 ring-1 ring-border/60">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent animate-pulse" />
              <span className="text-sm text-muted-foreground">思考中</span>
              <div className="flex gap-0.5 ml-1">
                <div className="h-1 w-1 rounded-full bg-brand-accent animate-bounce" />
                <div className="h-1 w-1 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="h-1 w-1 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 - 固定在底部 */}
      <div className="sticky bottom-0 border-t border-border/60 bg-background/80 backdrop-blur-sm p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="输入问题..."
            disabled={isLoading}
            className="h-9 flex-1 rounded-lg border-border bg-background/70 text-sm shadow-sm backdrop-blur focus:border-brand focus:ring-brand/20"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="h-9 w-9 rounded-lg bg-gradient-to-br from-brand to-brand-accent p-0 text-brand-foreground hover:from-brand/90 hover:to-brand-accent/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
