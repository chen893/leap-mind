import { z } from "zod";
import { generateObject, generateText } from "ai";
import {
  defaultModel,
  DEFAULT_GENERATION_CONFIG,
  TITLE_DESCRIPTION_CONFIG,
} from "@/lib/openai";
import {
  QuestionType,
  QuestionCategory,
  Difficulty,
  PointsReason,
  AchievementCategory,
} from "@prisma/client";

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

export const chapterQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      questionNumber: z.number(),
      questionText: z.string(),
      questionType: z.enum([
        QuestionType.FILL_BLANK,
        QuestionType.OPEN_ENDED,
        QuestionType.MULTIPLE_CHOICE,
        QuestionType.TRUE_FALSE,
      ]),
      questionCategory: z.enum([
        QuestionCategory.SOCRATIC,
        QuestionCategory.REFLECTIVE,
        QuestionCategory.ANALYTICAL,
        QuestionCategory.CREATIVE,
        QuestionCategory.PRACTICAL,
      ]),
      difficulty: z.enum([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD]),
      hints: z.array(z.string()).optional(),
      options: z.array(z.string()).optional(),
      expectedAnswer: z.string().optional(),
      evaluationCriteria: z.string(),
    }),
  ),
});

export const answerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
  isCorrect: z.boolean(),
  suggestions: z.array(z.string()).optional(),
});

export const batchAnswerEvaluationSchema = z.object({
  evaluations: z.array(
    z.object({
      questionId: z.string(),
      score: z.number().min(0).max(100),
      feedback: z.string(),
      isCorrect: z.boolean(),
      suggestions: z.array(z.string()).optional(),
    }),
  ),
});

// 类型定义
export type TitleDescriptionResult = z.infer<typeof titleDescriptionSchema>;
export type OutlineResult = z.infer<typeof outlineSchema>;
export type ChapterQuestionsResult = z.infer<typeof chapterQuestionsSchema>;
export type AnswerEvaluationResult = z.infer<typeof answerEvaluationSchema>;
export type BatchAnswerEvaluationResult = z.infer<
  typeof batchAnswerEvaluationSchema
>;

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
    console.log("result", result);
    return result.object;

    // const result = await generateText({
    //   model: defaultModel,
    //   prompt,
    //   ...TITLE_DESCRIPTION_CONFIG,
    // });
    // console.log("result", result);
    // return result.text;
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

/**
 * 生成章节的苏格拉底式问题
 */
export async function generateChapterQuestions({
  courseTitle,
  chapterTitle,
  chapterContent,
  level,
}: {
  courseTitle: string;
  chapterTitle: string;
  chapterContent: string;
  level: "beginner" | "intermediate";
}): Promise<ChapterQuestionsResult> {
  const levelText = level === "beginner" ? "初学者" : "有基础";
  // - questionType: 问题类型（${QuestionType.FILL_BLANK} 填空题, ${QuestionType.OPEN_ENDED} 开放式问题, ${QuestionType.MULTIPLE_CHOICE} 选择题, ${QuestionType.TRUE_FALSE} 判断题）
  const prompt = `
角色设定：
你是一位经验丰富的苏格拉底式教学专家和教育心理学家。你擅长通过精心设计的问题来引导学生深度思考，帮助他们真正理解和掌握知识，而不是简单的记忆。

任务描述：
根据提供的章节内容，设计3-5个渐进式的苏格拉底式问题，用于验证学生对本章核心概念的理解程度。这些问题应该能够：
1. 引导学生从表面理解深入到本质认知
2. 检验学生是否真正掌握了关键概念
3. 促进批判性思维和知识应用能力
4. 适合${levelText}的认知水平

背景信息：
* 课程标题：${courseTitle}
* 章节标题：${chapterTitle}
* 学习者水平：${levelText}
* 章节内容：
\`\`\`
${chapterContent}
\`\`\`

问题设计原则：
1. **渐进性**：从基础理解到深度应用，难度递增
2. **开放性**：避免简单的是非题，鼓励深度思考
3. **实用性**：联系实际应用场景，检验知识转化能力
4. **针对性**：紧扣章节核心概念，避免偏离主题
5. **适应性**：符合目标学习者的认知水平

输出要求：
请生成一个严格的JSON对象，包含3-5个问题。每个问题必须包含：
- questionNumber: 问题序号（1-5）
- questionText: 问题内容（清晰、具体、引导性强）
- questionType: 问题类型（${QuestionType.OPEN_ENDED} 开放式问题）
- questionCategory: 问题分类（${QuestionCategory.SOCRATIC} 苏格拉底式, ${QuestionCategory.REFLECTIVE} 反思性, ${QuestionCategory.ANALYTICAL} 分析性, ${QuestionCategory.CREATIVE} 创造性, ${QuestionCategory.PRACTICAL} 实践性）
- difficulty: 问题难度（${Difficulty.EASY} 简单, ${Difficulty.MEDIUM} 中等, ${Difficulty.HARD} 困难）
- hints: 思考提示数组（可选，2-3个引导性提示）
- options: 选择题选项（仅当questionType为MULTIPLE_CHOICE时）
- expectedAnswer: 期望答案要点（用于AI评估参考）
- evaluationCriteria: 评估标准（描述如何判断答案质量）

请现在生成符合要求的JSON输出。
`;

  try {
    const result = await generateObject({
      model: defaultModel,
      prompt,
      schema: chapterQuestionsSchema,
      ...DEFAULT_GENERATION_CONFIG,
    });

    return result.object;
  } catch (error) {
    console.error("AI questions generation error:", error);
    throw new Error("生成章节问题失败，请稍后重试");
  }
}

/**
 * 评估用户答案
 */
export async function evaluateAnswer({
  question,
  userAnswer,
  expectedAnswer,
  evaluationCriteria,
  level,
}: {
  question: string;
  userAnswer: string;
  expectedAnswer?: string;
  evaluationCriteria: string;
  level: "beginner" | "intermediate";
}): Promise<AnswerEvaluationResult> {
  const levelText = level === "beginner" ? "初学者" : "有基础";

  const prompt = `
角色设定：
你是一位专业的教育评估专家和苏格拉底式教学导师。你具备深厚的学科知识和丰富的教学经验，能够公正、准确地评估学生的学习成果，并提供建设性的反馈。

任务描述：
请评估学生对苏格拉底式问题的回答质量，给出客观的评分和详细的反馈建议。

评估信息：
* 问题：${question}
* 学生答案：${userAnswer}
* 期望答案要点：${expectedAnswer ?? "无具体标准答案，重点评估理解深度"}
* 评估标准：${evaluationCriteria}
* 学习者水平：${levelText}

评估维度：
1. **理解准确性**（30%）：是否正确理解了问题的核心概念
2. **思考深度**（25%）：是否展现了深层次的思考和分析
3. **逻辑性**（20%）：答案是否逻辑清晰、条理分明
4. **应用能力**（15%）：是否能将知识与实际情况联系
5. **表达清晰度**（10%）：是否能清楚地表达自己的观点

评分标准：
- 90-100分：优秀，完全掌握核心概念，思考深入，表达清晰
- 80-89分：良好，基本掌握概念，有一定思考深度
- 70-79分：及格，理解基本正确，但深度不够
- 60-69分：需要改进，理解有偏差或过于浅显
- 0-59分：不及格，理解错误或完全偏离主题

通过标准：
- ${levelText}学习者需要达到70分以上才能通过验证

输出要求：
请生成一个严格的JSON对象，包含：
- score: 评分（0-100的整数）
- feedback: 详细反馈（200-400字，包括优点、不足和改进建议）
- isCorrect: 是否通过验证（boolean）
- suggestions: 改进建议列表（可选，当分数较低时提供）

请现在进行评估并生成JSON输出。
`;

  try {
    const result = await generateObject({
      model: defaultModel,
      prompt,
      schema: answerEvaluationSchema,
      ...DEFAULT_GENERATION_CONFIG,
    });

    return result.object;
  } catch (error) {
    console.error("AI answer evaluation error:", error);
    throw new Error("评估答案失败，请稍后重试");
  }
}

/**
 * 批量评估用户答案
 */
export async function evaluateAnswersBatch({
  questionsAndAnswers,
  level,
}: {
  questionsAndAnswers: Array<{
    questionId: string;
    question: string;
    userAnswer: string;
    expectedAnswer?: string;
    evaluationCriteria: string;
  }>;
  level: "beginner" | "intermediate";
}): Promise<BatchAnswerEvaluationResult> {
  const levelText = level === "beginner" ? "初学者" : "有基础";

  const questionsText = questionsAndAnswers
    .map(
      (qa, index) => `
问题${index + 1}（ID: ${qa.questionId}）：
${qa.question}
学生答案：${qa.userAnswer}
期望答案要点：${qa.expectedAnswer ?? "无具体标准答案，重点评估理解深度"}
评估标准：${qa.evaluationCriteria}
`,
    )
    .join("\n---\n");

  const prompt = `
角色设定：
你是一位专业的教育评估专家和苏格拉底式教学导师。你具备深厚的学科知识和丰富的教学经验，能够公正、准确地评估学生的学习成果，并提供建设性的反馈。

任务描述：
请批量评估学生对多个苏格拉底式问题的回答质量，给出客观的评分和详细的反馈建议。

评估信息：
学习者水平：${levelText}

问题和答案：${questionsText}

评估维度：
1. **理解准确性**（30%）：是否正确理解了问题的核心概念
2. **思考深度**（25%）：是否展现了深层次的思考和分析
3. **逻辑性**（20%）：答案是否逻辑清晰、条理分明
4. **应用能力**（15%）：是否能将知识与实际情况联系
5. **表达清晰度**（10%）：是否能清楚地表达自己的观点

评分标准：
- 90-100分：优秀，完全掌握核心概念，思考深入，表达清晰
- 80-89分：良好，基本掌握概念，有一定思考深度
- 70-79分：及格，理解基本正确，但深度不够
- 60-69分：需要改进，理解有偏差或过于浅显
- 0-59分：不及格，理解错误或完全偏离主题

通过标准：
- ${levelText}学习者需要达到70分以上才能通过验证

输出要求：
请生成一个严格的JSON对象，包含evaluations数组，每个元素对应一个问题的评估结果：
- questionId: 问题ID
- score: 评分（0-100的整数）
- feedback: 详细反馈（200-400字，包括优点、不足和改进建议）
- isCorrect: 是否通过验证（boolean）
- suggestions: 改进建议列表（可选，当分数较低时提供）

请现在进行批量评估并生成JSON输出。
`;

  try {
    const result = await generateObject({
      model: defaultModel,
      prompt,
      schema: batchAnswerEvaluationSchema,
      ...DEFAULT_GENERATION_CONFIG,
    });

    return result.object;
  } catch (error) {
    console.error("AI batch answer evaluation error:", error);
    throw new Error("批量评估答案失败，请稍后重试");
  }
}
