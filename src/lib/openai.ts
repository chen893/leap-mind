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

const OPENAI_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const OPENAI_API_KEY = "ce987760088e686a0ba9c04cfa145e84.QfeXctDIQwSINDuu";
const OPENAI_MODEL = "glm-4.5";
const zhipu = createOpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: OPENAI_BASE_URL,
  fetch: async (url, options) => {
    const newOption = { ...options } as unknown as { body: string };
    console.log("URL", url);
    console.log("Headers", JSON.stringify(options!.headers, null, 2));
    // console.log(
    //   `Body ${JSON.stringify(
    //     JSON.parse(options.body as unknown as string),
    //     null,
    //     2,
    //   )}`,
    // );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = JSON.parse(newOption.body, null, 2);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete body?.tool_choice;
    console.log(body);
    newOption.body = JSON.stringify(body);
    return await fetch(url, newOption);
  },
});
export const zhipuModel = zhipu(OPENAI_MODEL);
export const defaultModel = zhipuModel;
// process.env.DEFAULT_MODEL === "google" ? googleModel : openaiModel;
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
