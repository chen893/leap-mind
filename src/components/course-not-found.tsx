"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { BookX, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CourseNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/40">
      <Navbar />

      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 mb-4">
            <BookX className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-amber-950 mb-2">
            课程未找到
          </h1>
          <p className="text-amber-700/70 mb-6 max-w-sm">
            请检查课程链接是否正确，或浏览其他课程。
          </p>

          <div className="flex items-center gap-3">
            <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                我的课程
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
