import { z } from "zod";
import { generateObject } from "ai";
import {
  defaultModel,
  DEFAULT_GENERATION_CONFIG,
  TITLE_DESCRIPTION_CONFIG,
} from "@/lib/openai";

// Schema 定义
export const titleDescriptionSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const outlineSchema = z.object({
  chapters: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimatedTime: z.string(),
    }),
  ),
});

// 类型定义
export type TitleDescriptionResult = z.infer<typeof titleDescriptionSchema>;
export type OutlineResult = z.infer<typeof outlineSchema>;

/**
 * 生成课程标题和描述
 */
export async function generateTitleAndDescription(
  userInput: string,
): Promise<TitleDescriptionResult> {
  const prompt = `
角色: 你是一位经验丰富的在线课程设计师和教育内容策划专家。你擅长将用户模糊的学习想法转化为一个结构清晰、引人注目的课程概念。

任务描述:
你的任务是接收一段由用户提供的学习需求描述。这段描述可能很简洁，甚至只有一个关键词。你需要基于这个需求，提炼并创作出一个专业的课程标题（title）和一个详细、有吸引力的课程描述（description）。

* 对于\`title\`: 标题应该精炼、专业，并能准确概括课程的核心内容，吸引目标学习者。例如，对于需求"学吉他"，一个好的标题是"零基础吉他弹唱快速入门"，而不是简单的"学习吉他"。
* 对于\`description\`: 描述应该更加详细，以激发用户的学习兴趣。它需要阐明课程的学习目标、主要内容、适合人群，以及学习后能够掌握的关键技能。

输出要求 (至关重要):
你的输出**必须**是一个格式严格的JSON对象，不包含任何额外的解释、介绍性文字或Markdown标记。JSON结构必须如下：

\`\`\`json
{
  "title": "课程标题",
  "description": "课程描述"
}
\`\`\`

---

请根据下面的用户需求，生成JSON输出。

用户需求: \`${userInput}\`
`;

  try {
    const result = await generateObject({
      model: defaultModel,
      prompt,
      schema: titleDescriptionSchema,
      ...TITLE_DESCRIPTION_CONFIG,
    });

    return result.object;
  } catch (error) {
    console.error("AI title and description generation error:", error);
    throw new Error("生成标题和描述失败，请稍后重试");
  }
}

/**
 * 生成课程大纲
 */
export async function generateCourseOutline({
  title,
  description,
  level,
}: {
  title: string;
  description: string;
  level: "beginner" | "intermediate";
}): Promise<OutlineResult> {
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
    * \`estimatedTime\`: 预估学习时间，使用通俗易懂的格式，例如 "约30分钟", "1小时", "90分钟"。

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

  try {
    const result = await generateObject({
      model: defaultModel,
      prompt,
      schema: outlineSchema,
      ...DEFAULT_GENERATION_CONFIG,
    });

    return result.object;
  } catch (error) {
    console.error("AI outline generation error:", error);
    throw new Error("生成课程大纲失败，请稍后重试");
  }
}
