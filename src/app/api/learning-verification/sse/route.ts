export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  typedEventEmitter,
  type ChapterQuestionsReadyEvent,
} from "@/lib/event-emitter";

/**
 * 改进的SSE实现 - 基于事件而非轮询
 * 当题目生成完成后，通过事件发射器主动通知客户端
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chapterId = searchParams.get("chapterId");
  if (!chapterId) {
    return new Response("chapterId is required", { status: 400 });
  }

  // 权限校验：必须已加入课程或为创建者
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: {
        include: {
          userProgresses: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!chapter) {
    return new Response("Chapter not found", { status: 404 });
  }

  const isCreator = chapter.course.creatorId === session.user.id;
  const isEnrolled = chapter.course.userProgresses.length > 0;

  if (!isCreator && !isEnrolled) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!isCreator && chapter.chapterNumber !== 1) {
    const chapterProgress = await db.userChapterProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId,
        },
      },
      select: { status: true },
    });

    if (!chapterProgress || chapterProgress.status === "LOCKED") {
      return new Response("Chapter is locked", { status: 403 });
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };

      let isClosed = false;
      let timeoutId: NodeJS.Timeout;
      let unsubscribe: (() => void) | null = null;

      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;
        if (timeoutId) clearTimeout(timeoutId);
        if (unsubscribe) unsubscribe();
        controller.close();
      };

      // 首先检查是否已经有题目存在
      const checkExisting = async () => {
        try {
          const count = await db.chapterQuestion.count({
            where: { chapterId },
          });
          if (count > 0 && !isClosed) {
            send("ready", { chapterId, count, source: "existing" });
            cleanup();
            return true;
          }
          return false;
        } catch (err) {
          if (!isClosed) {
            send("error", { message: (err as Error).message });
            cleanup();
          }
          return true; // 错误时也要停止
        }
      };

      // 立即检查一次
      void checkExisting()
        .then((shouldStop) => {
          if (shouldStop) return;

          // 如果没有现有题目，订阅事件等待题目生成完成
          unsubscribe = typedEventEmitter.onChapterQuestionsReady(
            (data: ChapterQuestionsReadyEvent) => {
              console.log("CHAPTER_QUESTIONS_READY", data.chapterId, isClosed);
              if (data.chapterId === chapterId && !isClosed) {
                send("ready", {
                  chapterId: data.chapterId,
                  count: data.questionCount,
                  source: "generated",
                  timestamp: data.timestamp,
                });
                cleanup();
              }
            },
          );

          // 设置超时（60秒）
          timeoutId = setTimeout(() => {
            if (!isClosed) {
              send("timeout", { chapterId, message: "题目生成超时" });
              cleanup();
            }
          }, 300000);

          // 发送连接确认
          send("connected", { chapterId, message: "等待题目生成完成..." });
        })
        .catch((err) => {
          if (!isClosed) {
            send("error", { message: (err as Error).message });
            cleanup();
          }
        });

      // 处理客户端断开连接
      req.signal?.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
