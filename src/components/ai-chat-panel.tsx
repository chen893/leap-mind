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
                  ? "bg-blue-500"
                  : "bg-gradient-to-br from-amber-500 to-orange-500"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-3.5 w-3.5 text-white" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-white" />
              )}
            </div>

            {/* 消息 */}
            <div className={`max-w-[85%] ${message.role === "user" ? "text-right" : ""}`}>
              <div
                className={`inline-block rounded-xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-sm"
                    : "bg-white ring-1 ring-amber-100 rounded-tl-sm"
                }`}
              >
                {message.role === "assistant" ? (
                  <div className="prose prose-sm prose-amber max-w-none">
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
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl rounded-tl-sm bg-white px-3 py-2 ring-1 ring-amber-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span className="text-sm text-amber-700">思考中</span>
              <div className="flex gap-0.5 ml-1">
                <div className="h-1 w-1 rounded-full bg-amber-400 animate-bounce" />
                <div className="h-1 w-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="h-1 w-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 - 固定在底部 */}
      <div className="sticky bottom-0 border-t border-amber-100 bg-white/90 backdrop-blur-sm p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="输入问题..."
            disabled={isLoading}
            className="flex-1 h-9 text-sm rounded-lg border-amber-200 focus:border-amber-400 focus:ring-amber-200"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="h-9 w-9 p-0 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
