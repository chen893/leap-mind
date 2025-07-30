// import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { streamText } from "ai";
import {
  // openaiChatModel,
  defaultModel,
  CHAT_GENERATION_CONFIG,
} from "@/lib/openai";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { chapterId, courseTitle, chapterTitle, level } =
      (await req.json()) as {
        chapterId: string;
        courseTitle: string;
        chapterTitle: string;
        level: string;
      };

    // 验证章节存在且用户有权限
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: {
          include: {
            chapters: {
              orderBy: {
                chapterNumber: "asc",
              },
              select: {
                chapterNumber: true,
                title: true,
                description: true,
              },
            },
            userProgresses: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!chapter) {
      return new Response("Chapter not found", { status: 404 });
    }
    // const course = chapter.course;
    // 检查用户权限（创建者或学习者）
    const hasAccess =
      chapter.course.creatorId === session.user.id ||
      chapter.course.userProgresses.length > 0;

    if (!hasAccess) {
      return new Response("Unauthorized", { status: 403 });
    }

    // 如果内容已存在，直接返回
    // if (chapter.contentMd) {
    // 	return new Response(chapter.contentMd, {
    // 		headers: {
    // 			"Content-Type": "text/plain; charset=utf-8",
    // 		},
    // 	});
    // }

    const chapters = chapter.course.chapters;
    // 构建AI提示词

    let teachingFocusInstruction = "";
    let practicalTaskInstruction = "";
    if (level === "beginner") {
      // 为初学者定制的指令
      teachingFocusInstruction = `
* **教学侧重点 (Teaching Focus for Beginners):**
    * **语言:** 必须使用最通俗易懂的语言。所有专业术语都要用生动的**比喻**或**现实生活中的例子**来解释。
    * **重点:** 聚焦于“是什么” (What) 和“为什么” (Why)，为学习者建立扎实的直观理解。`;

      practicalTaskInstruction = `* **任务要求:** 设计一个引导性极强、步骤明确的“迷你项目”或填空式练习，确保初学者能独立完成并获得成就感。`;
    } else {
      // 'advanced' 或其他
      // 为有基础的学习者定制的指令
      teachingFocusInstruction = `
* **教学侧重点 (Teaching Focus for Advanced Learners):**
    * **语言:** 可以使用行业标准术语，但需要清晰阐述其精确内涵和适用场景。
    * **重点:** 在“是什么”和“为什么”的基础上，深入探讨“如何做” (How)、“在何种情况下这样做” (When)，并分析其背后的原理和常见权衡 (Trade-offs)。`;

      practicalTaskInstruction = `* **任务要求:** 设计一个需要综合运用知识、甚至可能需要查阅外部资料的开放性小挑战，鼓励学习者探索和解决问题。`;
    }

    // 返回最终拼接好的、高度定制化的 Prompt
    const instructionalDesignPrompt = `
# 角色设定：顶尖教学设计师与领域专家

你将扮演一位经验丰富的教学设计师和特定领域的专家。你的核心目标是创作一章清晰、严谨且极具吸引力的在线课程内容。你不仅要传授知识，更要激发学习者的好奇心，并为他们构建一个稳固的知识框架。

# 核心任务

根据下方提供的课程背景信息，为指定的章节撰写完整、详细的教学内容。

# 课程背景信息

* **课程标题:** ${courseTitle}
* **学习者水平:** ${level === "beginner" ? "初学者" : "有基础"}
* **课程完整大纲:**
    \`\`\`
${chapters.map((c) => `    第${c.chapterNumber}章：${c.title} - ${c.description}`).join("\n")}
    \`\`\`
* **当前目标章节:** ${chapterTitle}

# 关键指令：内容创作要求

请严格遵循以下结构和教学设计原则，确保内容质量。

### 第一部分：引言 (Introduction)

* **教学挂钩 (Hook & Bridge):**
    * 若非第一章，请用1-2句话精炼回顾上一章的核心结论，并清晰说明它如何自然地引出本章主题，搭建起知识的桥梁。
    * 若为第一章，请直接描绘一个引人入胜的场景或提出一个直击痛点的问题，迅速抓住学习者的注意力。
* **学习目标 (Learning Objectives):** 以“完成本章后，你将能够…”开头，用清晰、可操作的动词（如：定义、应用、分析、评估、创建）列出2-4个核心学习目标。
* **本章路线图 (Chapter Overview):** 简要预告本章将探索的核心概念，让学习者对即将开始的知识之旅充满期待。

### 第二部分：核心知识点讲解 (Core Concepts)

这是内容的主体，请遵循以下原则：

* **结构化讲解:** 将核心知识分解为2-4个关键点，进行明确分割。
${teachingFocusInstruction}
* **启发深度思考 (To Inspire Deeper Thinking):**
    * **这是为后续“苏格拉底式提问”做铺垫的关键！**
    * 在讲解时，请**巧妙地融入**一些可以引发讨论的元素。例如：某个概念定义的**边界**、一个普遍存在的**常见误区**、不同方法间的**优劣势权衡**、或一个看似简单但背后有复杂原理的**决策点**。
* **实例与代码演示 (Examples & Code):** 若适用，提供注释详尽的实例或代码片段。注释不仅要解释“这行代码做什么”，更要解释“为什么这么写”。

### 第三部分：实践与应用 (Practical Application)

设计一个紧密结合本章知识点的实践任务。

* **任务格式:** 采用“**场景描述 -> 任务指令 -> 参考步骤**”的结构。
${practicalTaskInstruction}

### 第四部分：本章总结 (Summary)

* **核心要点回顾:** 使用项目符号列表（bullet points）总结本章最重要的2-3个知识点，帮助学习者巩固记忆。
* **价值重申:** 用一句话再次强调掌握本章内容的核心价值与意义。

### 第五部分：展望 (Looking Ahead)

* **知识串联:** 明确指出下一章的主题，并说明本章所学知识将如何成为学习下一章内容的关键基础或工具，为学习者建立清晰的“学习路径图”。
`;

    const result = streamText({
      model: defaultModel,
      prompt: instructionalDesignPrompt,
      ...CHAT_GENERATION_CONFIG,
      onFinish: async (event: { text: string }) => {
        try {
          await db.chapter.update({
            where: { id: chapterId },
            data: {
              contentMd: event.text,
              generationCost: (await result.usage).totalTokens,
              lastUpdated: new Date(),
            },
          });
        } catch (error) {
          console.error("Failed to save chapter content:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("AI generation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
