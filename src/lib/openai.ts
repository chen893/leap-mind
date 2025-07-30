import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// 统一的 OpenAI 配置
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

// 直接导出配置好的模型实例
export const openaiModel = openai(process.env.OPENAI_MODEL ?? "gpt-4");
export const openaiChatModel = openai(process.env.OPENAI_MODEL ?? "gpt-4o");
export const googleModel = google(
  process.env.GOOGLE_MODEL ?? "gemini-2.5-pro",
  // { structuredOutputs: false },
);

const zhipu = createOpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: process.env.ZHIPU_BASE_URL,
  fetch: async (url, options) => {
    const newOption = { ...options } as unknown as { body: string };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = JSON.parse(newOption.body);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete body?.tool_choice;
    newOption.body = JSON.stringify(body);
    return await fetch(url, newOption);
  },
});
export const zhipuModel = zhipu(process.env.ZHIPU_MODEL ?? "gpt-4o");

let defaultModel = openaiModel;

switch (process.env.DEFAULT_MODEL) {
  case "google":
    defaultModel = googleModel;
    break;
  case "openai":
    defaultModel = openaiModel;
    break;
  case "zhipu":
    console.log("zhipu");
    defaultModel = zhipuModel;
    break;
  default:
    defaultModel = openaiModel;
}

export { defaultModel };
// 统一的生成参数配置
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  maxTokens: 16000,
} as const;

export const CHAT_GENERATION_CONFIG = {
  temperature: 0.7,
  maxTokens: 16000,
} as const;

export const TITLE_DESCRIPTION_CONFIG = {
  temperature: 0.7,
  maxTokens: 16000,
} as const;
