import { courseRouter } from "@/server/api/routers/course";
import { chapterRouter } from "@/server/api/routers/chapter";
import { assessmentRouter } from "@/server/api/routers/assessment";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  course: courseRouter,
  chapter: chapterRouter,
  assessment: assessmentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.course.getUserCourses();
 */
export const createCaller = createCallerFactory(appRouter);
