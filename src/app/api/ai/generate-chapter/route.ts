import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
const openai = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
	try {
		console.log("开始调用");
		const session = await auth();
		if (!session?.user) {
			return new Response("Unauthorized", { status: 401 });
		}

		const { chapterId, courseTitle, chapterTitle, level } = await req.json();
		
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
								description: true
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
		// const course = 
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
		const prompt = `
角色设定：你是一位经验丰富的教学设计师和特定领域的专家。你的任务是为一门在线课程撰写其中一章的教学内容。你的讲解风格应该既专业权威，又通俗易懂，能够激发学生的学习兴趣。

背景信息：

* 课程标题：${courseTitle}
* 学习者水平：${level === "beginner" ? "初学者" : "有基础"}
* 课程完整大纲：
    \`\`\`
    ${chapters.map(c => `第${c.chapterNumber}章：${c.title} - ${c.description}`).join('\n')}
    \`\`\`
* 当前需要生成的章节：${chapterTitle}

任务要求：

请根据以上提供的背景信息，为 **“${chapterTitle}”** 这一章生成详细的教学内容。请务必考虑整个课程的上下文，确保本章内容能与前后章节顺畅衔接。

内容结构要求：

请严格按照以下结构组织内容：

1.  **引言 (Introduction)**
    * 承上启下：简要回顾上一章的核心要点，并说明它与本章的联系。
    * 学习目标：清晰地列出学习完本章后，学生将能够做什么（e.g., "你将能够解释...", "你将能够使用...", "你将能够分析..."）。
    * 本章概览：简要介绍本章将要涵盖的主要知识点，引起学生的兴趣。

2.  **核心知识点讲解 (Core Concepts)**
    * 分点阐述：将本章的核心概念分解为2-4个关键知识点，并使用二级标题 (##) 分隔。
    * 深入浅出：
        * 对于 \`初学者\`：使用简单明了的语言，避免专业术语或对其进行详细解释。多使用生动的比喻、类比和现实生活中的例子来帮助理解。
        * 对于 \`有基础\` 的学习者：可以在已有知识的基础上进行深化，适当引入更专业和复杂的概念，并探讨其背后的原理或更高级的应用场景。
    * 实例与代码演示：如果适用，请提供清晰的实例、案例分析或代码片段来演示概念的应用。代码需附有详细的注释。

3.  **实践与应用 (Practical Application)**
    * 提供一个或多个贴近实际的应用场景或小练习，指导学生如何将本章学到的知识付诸实践。
    * 对于 \`初学者\`，这应该是一个引导性强、步骤清晰的简单任务。
    * 对于 \`有基础\` 的学习者，可以是一个更具挑战性、需要综合运用知识解决的问题。

4.  **本章总结 (Summary)**
    * 用要点列表的形式，回顾本章最重要的2-3个核心概念。
    * 再次强调本章的关键价值和学习成果。

5.  **展望 (Looking Ahead)**
    * 简要预告下一章将要学习的内容，说明它将如何建立在本章知识的基础之上，为学生建立学习期待。

请现在开始生成内容。
`;

		const result = await streamText({
			model: openai(process.env.OPENAI_MODEL || "gpt-4o"),
			prompt,
			temperature: 0.7,
      maxTokens: 16000,
			onFinish: async (event) => {
				try {
					await db.chapter.update({
						where: { id: chapterId },
						data: {
							contentMd: event.text,
							generationCost: 0,
							lastUpdated: new Date(),
						}
					});
          const progress = await db.userCourseProgress.findUnique({
            where: {
              userId_courseId: {
                userId: session.user.id,
                courseId: chapter.courseId,
              },
            },
          });
					if (progress) {
						const unlockedChapters = progress.unlockedChapters as number[];
						const nextChapter = chapter.chapterNumber + 1;
						if (!unlockedChapters.includes(nextChapter)) {
							await db.userCourseProgress.update({
								where: {
									userId_courseId: {
										userId: session.user.id,
										courseId: chapter.courseId,
									},
								},
								data: {
									unlockedChapters: [...unlockedChapters, nextChapter],
								},
							});
						}

					}

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
