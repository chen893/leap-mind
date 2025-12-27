"use client";

import { Navbar } from "@/components/navbar";

export function CourseLoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/40">
      <Navbar />

      {/* 顶栏骨架 */}
      <div className="sticky top-16 z-40 backdrop-blur-md bg-white/70 border-b border-amber-100/50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            <div className="h-4 w-48 bg-amber-100 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 rounded-full bg-amber-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧骨架 */}
          <div className="lg:w-72 xl:w-80 shrink-0">
            <div className="rounded-2xl bg-white/60 p-3 ring-1 ring-amber-100/80 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-amber-50 rounded-xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>

          {/* 右侧骨架 */}
          <div className="flex-1">
            <div className="rounded-xl bg-white/60 p-5 ring-1 ring-amber-100/80">
              <div className="flex items-center justify-between pb-4 border-b border-amber-100/50 mb-4">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-amber-100 rounded animate-pulse" />
                  <div className="h-5 w-48 bg-amber-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-amber-100 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-amber-50 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-amber-50 rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-amber-50 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
