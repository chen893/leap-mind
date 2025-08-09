"use client";

import { useEffect, useRef, useReducer } from "react";

/**
 * 改进的SSE Hook - 基于事件而非轮询
 * 监听章节题目生成完成事件
 */

// 配置常量
const SSE_TIMEOUT_MS = 300000; // 5分钟超时
const RETRY_DELAY_MS = 100;

interface ChapterQuestionsSSEState {
  isReady: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  questionCount: number;
  source?: "existing" | "generated";
  retryToken: number;
}

interface SSEEventData {
  chapterId: string;
  questionCount?: number;
  source?: "existing" | "generated";
  message?: string;
  timestamp?: number;
}

type SSEAction =
  | { type: "RESET" }
  | { type: "START_LOADING" }
  | { type: "CONNECTED" }
  | {
      type: "READY";
      payload: { questionCount: number; source?: "existing" | "generated" };
    }
  | { type: "ERROR"; payload: { error: string } }
  | { type: "RETRY" };

function sseReducer(
  state: ChapterQuestionsSSEState,
  action: SSEAction,
): ChapterQuestionsSSEState {
  switch (action.type) {
    case "RESET":
      return {
        isReady: false,
        isConnected: false,
        isLoading: false,
        error: null,
        questionCount: 0,
        source: undefined,
        retryToken: state.retryToken,
      };
    case "START_LOADING":
      return {
        ...state,
        isLoading: true,
        error: null,
        isReady: false,
        isConnected: false,
      };
    case "CONNECTED":
      return {
        ...state,
        isConnected: true,
        isLoading: true,
        error: null,
      };
    case "READY":
      return {
        ...state,
        isReady: true,
        isLoading: false,
        isConnected: false,
        questionCount: action.payload.questionCount,
        source: action.payload.source,
        error: null,
      };
    case "ERROR":
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
        isConnected: false,
      };
    case "RETRY":
      return {
        ...state,
        retryToken: state.retryToken + 1,
        error: null,
        isLoading: true,
        isReady: false,
      };
    default:
      return state;
  }
}

// 日志工具函数
const isDev = process.env.NODE_ENV === "development";
const logger = {
  log: (...args: any[]) => isDev && console.log("[SSE]", ...args),
  warn: (...args: any[]) => isDev && console.warn("[SSE]", ...args),
  error: (...args: any[]) => console.error("[SSE]", ...args),
};

// 安全的JSON解析
function safeJsonParse<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

// 安全关闭EventSource
function safeCloseEventSource(eventSource: EventSource | null) {
  if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
    eventSource.close();
  }
}

export function useChapterQuestionsSSE(chapterId: string | null) {
  const [state, dispatch] = useReducer(sseReducer, {
    isReady: false,
    isConnected: false,
    isLoading: false,
    error: null,
    questionCount: 0,
    source: undefined,
    retryToken: 0,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 事件处理函数
  const handleConnected = (event: MessageEvent) => {
    const data = safeJsonParse<SSEEventData>(event.data);
    if (data) {
      dispatch({ type: "CONNECTED" });
      logger.log("Connected:", data.message ?? "Connected");
    } else {
      logger.error("Error parsing connected event");
    }
  };

  const handleReady = (event: MessageEvent) => {
    const data = safeJsonParse<SSEEventData>(event.data);
    if (data) {
      const questionCount = data.questionCount ?? 0;
      dispatch({
        type: "READY",
        payload: {
          questionCount,
          source: data.source,
        },
      });
      logger.log(`Questions ready for ${chapterId}:`, {
        count: questionCount,
        source: data.source,
        timestamp: data.timestamp,
      });
      safeCloseEventSource(eventSourceRef.current);
    } else {
      logger.error("Error parsing ready event");
      dispatch({ type: "ERROR", payload: { error: "解析响应数据失败" } });
    }
  };

  const handleTimeout = (event: MessageEvent) => {
    const data = safeJsonParse<SSEEventData>(event.data);
    const errorMessage = data?.message ?? "题目生成超时，请稍后重试";
    dispatch({ type: "ERROR", payload: { error: errorMessage } });
    logger.warn("Timeout:", errorMessage);
    safeCloseEventSource(eventSourceRef.current);
  };

  const handleServerError = (event: MessageEvent) => {
    const data = safeJsonParse<SSEEventData>(event.data ?? "{}");
    const errorMessage = data?.message ?? "连接出现错误";
    dispatch({ type: "ERROR", payload: { error: errorMessage } });
    logger.error("Server error:", errorMessage);
    safeCloseEventSource(eventSourceRef.current);
  };

  const handleConnectionError = () => {
    logger.error("EventSource connection error");
    dispatch({ type: "ERROR", payload: { error: "网络连接错误" } });
    safeCloseEventSource(eventSourceRef.current);
  };

  useEffect(() => {
    if (!chapterId) {
      dispatch({ type: "RESET" });
      return;
    }

    // 清理之前的连接
    safeCloseEventSource(eventSourceRef.current);
    eventSourceRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    dispatch({ type: "START_LOADING" });

    const url = `/api/learning-verification/sse?chapterId=${chapterId}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    // 注册事件监听器
    eventSource.addEventListener("connected", handleConnected);
    eventSource.addEventListener("ready", handleReady);
    eventSource.addEventListener("timeout", handleTimeout);
    eventSource.addEventListener("error", handleServerError);
    eventSource.onerror = handleConnectionError;

    // 设置客户端超时保护
    timeoutRef.current = setTimeout(() => {
      if (eventSource.readyState === EventSource.OPEN) {
        dispatch({
          type: "ERROR",
          payload: { error: "连接超时，请刷新页面重试" },
        });
        safeCloseEventSource(eventSource);
      }
    }, SSE_TIMEOUT_MS);

    // 清理函数
    return () => {
      safeCloseEventSource(eventSourceRef.current);
      eventSourceRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      dispatch({ type: "RESET" });
    };
  }, [chapterId, state.retryToken]);

  // 手动重试函数
  const retry = () => {
    if (chapterId) {
      dispatch({ type: "RETRY" });
    }
  };

  return {
    ...state,
    retry,
  };
}
