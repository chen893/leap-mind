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
export const googleModel = google(process.env.GOOGLE_MODEL ?? "gemini-2.5-pro");

export const defaultModel =
  process.env.DEFAULT_MODEL === "google" ? googleModel : openaiModel;
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
  maxTokens: 1000,
} as const;
