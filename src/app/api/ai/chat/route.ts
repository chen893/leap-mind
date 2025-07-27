import { streamText } from "ai";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import {
  openaiChatModel,
  defaultModel,
  CHAT_GENERATION_CONFIG,
} from "@/lib/openai";
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const {
      courseId,
      chapterNumber,
      /* type, content, userAnswer, */ messages,
    } = (await req.json()) as {
      courseId: string;
      chapterNumber: number;
      messages: Array<{ role: string; content: string }>;
    };
    // 验证章节存在
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: {
            chapterNumber: "asc",
          },
          select: {
            contentMd: true,
            chapterNumber: true,
          },
        },
      },
    });
    if (!course) {
      return new Response("Course not found", { status: 404 });
    }
    const chapter = course.chapters.find(
      (chapter) => chapter.chapterNumber === chapterNumber,
    ) as { contentMd: string; chapterNumber: number } | undefined;

    //     let prompt = '';

    //     switch (type) {
    //       case 'generate_question':
    //         prompt = `基于以下学习内容，生成一个苏格拉底式的思考问题，帮助学习者深入理解核心概念：

    // 学习内容：
    // ${content}

    // 请生成一个开放性的问题，要求：
    // 1. 能够引导学习者思考核心概念
    // 2. 不是简单的记忆性问题
    // 3. 鼓励学习者用自己的话解释
    // 4. 可以有多种合理的答案

    // 只返回问题本身，不需要其他说明。`;
    //         break;

    //       case 'evaluate_answer':
    //         prompt = `作为一位耐心的老师，请评估学习者的回答：

    // 学习内容：
    // ${content}

    // 学习者的回答：
    // ${userAnswer}

    // 请提供：
    // 1. 评分（0-100分）
    // 2. 具体的反馈意见
    // 3. 如果回答不够完整，给出提示帮助改进
    // 4. 是否可以继续下一章节的学习

    // 请以JSON格式返回：
    // {
    //   "score": 分数,
    //   "feedback": "详细反馈",
    //   "canProgress": true/false,
    //   "suggestions": "改进建议（如果需要）"
    // }`;
    //         break;

    //       case 'hint':
    //         prompt = `学习者在回答问题时遇到困难，请提供一个有用的提示：

    // 学习内容：
    // ${content}

    // 请提供一个引导性的提示，帮助学习者思考，但不要直接给出答案。提示应该：
    // 1. 指向关键概念
    // 2. 提供思考的方向
    // 3. 鼓励学习者继续尝试

    // 只返回提示内容。`;
    //         break;

    //       case 'explain_differently':
    //         prompt = `学习者对当前的解释理解有困难，请用不同的方式重新解释这个概念：

    // 原始内容：
    // ${content}

    // 请：
    // 1. 使用更简单的语言
    // 2. 提供不同的类比或例子
    // 3. 从另一个角度解释
    // 4. 保持内容的准确性

    // `;
    //         break;

    //       default:
    //         return new Response('Invalid request type', { status: 400 });
    //     }

    const result = streamText({
      model: defaultModel,
      messages: [
        {
          role: "system" as const,
          content: chapter?.contentMd ?? "",
        },
        ...(messages as Array<{ role: "user" | "assistant"; content: string }>),
      ],
      ...CHAT_GENERATION_CONFIG,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
