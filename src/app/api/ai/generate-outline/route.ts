import { createOpenAI } from "@ai-sdk/openai";
// import { google } from '@ai-sdk/google';

import { generateObject } from "ai";
// import { auth } from "@/server/auth";
import { z } from "zod";
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const outlineSchema = z.object({
  chapters: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedTime: z.string(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    // const session = await auth();
    // if (!session?.user) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    const { title, level, description } = await req.json() as {
      title: string;
      level: string;
      description: string;
    };
    const levelText = level === "beginner" ? "初学者" : "有基础";

    const prompt = `
角色与目标：
你是一个专业的教学设计师（Instructional Designer）和课程规划专家。你的任务是根据用户提供的课程主题、学习水平和简要描述，设计一个完整、有逻辑、循序渐进的学习大纲。

输入信息：
* 主题 (title): ${title}
* 学习水平 (level): ${levelText}
* 课程描述 (description): ${description}

核心指令：
1. 分析输入：仔细分析用户提供的\`主题\`、\`学习水平\`和\`课程描述\`。用户的描述可能很简短或不完整，你需要利用你的专业知识来填充细节，创建一个全面且结构合理的课程。
2. 课程设计：
    * 为\`初学者\`设计：课程大纲应从最基础的核心概念开始，每一步都为下一步打下坚实的基础，确保学习曲线平滑。
    * 为\`有基础\`者设计：课程可以跳过最基础的内容，从一个更高的起点开始，专注于更高级的主题、深度应用或特定领域的技能。
3. 生成章节：将整个课程分解为多个逻辑章节。每个章节都必须包含一个清晰的标题、一段描述以及一个预估的学习时间。
    * \`title\`: 章节标题，应简洁并准确概括章节内容。
    * \`description\`: 章节描述，应说明本章的学习目标和将涵盖的主要知识点。
    * \`estimatedTime\`: 预估学习时间，使用通俗易懂的格式，例如 “约30分钟”, “1小时”, “90分钟”。

输出格式要求（至关重要）：
你的回复**必须**是一个单独的、格式正确的JSON对象，**不能包含**任何JSON以外的文字、解释、或Markdown标记（如 \`\`\`json）。你的输出必须严格遵守以下结构：

\`\`\`json
{
  "chapters": [
    {
      "title": "string",
      "description": "string",
      "estimatedTime": "string"
    }
  ]
}
\`\`\`

请现在根据输入信息，生成符合要求的JSON输出。
`;

    const result = await generateObject({
      model: openai(process.env.OPENAI_MODEL ?? "gpt-4"),
      prompt,
      schema: outlineSchema,
      temperature: 0.7,
      maxTokens: 16000,
    });
    return Response.json(result.object);
  } catch (error) {
    console.error("AI outline generation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
