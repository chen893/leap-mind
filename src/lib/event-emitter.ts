/**
 * 简单的事件发射器，用于在服务端和客户端之间进行事件通信
 * 替代轮询机制，实现更高效的实时通知
 */

type EventCallback = (data: any) => void;

class EventEmitter {
  private events = new Map<string, Set<EventCallback>>();

  // 订阅事件
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.events.get(event)?.delete(callback);
      if (this.events.get(event)?.size === 0) {
        this.events.delete(event);
      }
    };
  }

  // 发射事件
  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // 一次性订阅
  once(event: string, callback: EventCallback): () => void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }

  // 清除所有事件监听器
  clear(): void {
    this.events.clear();
  }

  // 获取事件监听器数量
  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}

// 全局事件发射器实例
export const globalEventEmitter = new EventEmitter();

// 预定义的事件类型
export const EVENTS = {
  CHAPTER_QUESTIONS_READY: "chapter:questions:ready",
  CHAPTER_CONTENT_GENERATED: "chapter:content:generated",
  LEARNING_VERIFICATION_COMPLETE: "learning:verification:complete",
  ACHIEVEMENT_UNLOCKED: "achievement:unlocked",
  POINTS_UPDATED: "points:updated",
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];

// 事件数据类型
export interface ChapterQuestionsReadyEvent {
  chapterId: string;
  questionCount: number;
  timestamp: number;
}

export interface ChapterContentGeneratedEvent {
  chapterId: string;
  contentLength: number;
  timestamp: number;
}

export interface LearningVerificationCompleteEvent {
  chapterId: string;
  userId: string;
  score: number;
  passed: boolean;
  timestamp: number;
}

export interface AchievementUnlockedEvent {
  userId: string;
  achievementId: string;
  achievementTitle: string;
  points: number;
  timestamp: number;
}

export interface PointsUpdatedEvent {
  userId: string;
  oldPoints: number;
  newPoints: number;
  reason: string;
  timestamp: number;
}

// 类型安全的事件发射器
export class TypedEventEmitter {
  private emitter = new EventEmitter();
  public timer = new Date();
  onChapterQuestionsReady(
    callback: (data: ChapterQuestionsReadyEvent) => void,
  ) {
    console.log("注册onChapterQuestionsReady监听");
    return this.emitter.on(EVENTS.CHAPTER_QUESTIONS_READY, callback);
  }

  onChapterContentGenerated(
    callback: (data: ChapterContentGeneratedEvent) => void,
  ) {
    return this.emitter.on(EVENTS.CHAPTER_CONTENT_GENERATED, callback);
  }

  onLearningVerificationComplete(
    callback: (data: LearningVerificationCompleteEvent) => void,
  ) {
    return this.emitter.on(EVENTS.LEARNING_VERIFICATION_COMPLETE, callback);
  }

  onAchievementUnlocked(callback: (data: AchievementUnlockedEvent) => void) {
    return this.emitter.on(EVENTS.ACHIEVEMENT_UNLOCKED, callback);
  }

  onPointsUpdated(callback: (data: PointsUpdatedEvent) => void) {
    return this.emitter.on(EVENTS.POINTS_UPDATED, callback);
  }

  emitChapterQuestionsReady(data: ChapterQuestionsReadyEvent) {
    console.log("触发监听");
    this.emitter.emit(EVENTS.CHAPTER_QUESTIONS_READY, data);
  }

  emitChapterContentGenerated(data: ChapterContentGeneratedEvent) {
    this.emitter.emit(EVENTS.CHAPTER_CONTENT_GENERATED, data);
  }

  emitLearningVerificationComplete(data: LearningVerificationCompleteEvent) {
    this.emitter.emit(EVENTS.LEARNING_VERIFICATION_COMPLETE, data);
  }

  emitAchievementUnlocked(data: AchievementUnlockedEvent) {
    this.emitter.emit(EVENTS.ACHIEVEMENT_UNLOCKED, data);
  }

  emitPointsUpdated(data: PointsUpdatedEvent) {
    this.emitter.emit(EVENTS.POINTS_UPDATED, data);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __typedEventEmitter: TypedEventEmitter | undefined;
}

// 确保在同一 Node 进程（含 Next.js 开发 HMR）只会有一个实例
export const typedEventEmitter =
  globalThis.__typedEventEmitter ??
  (globalThis.__typedEventEmitter = new TypedEventEmitter());
