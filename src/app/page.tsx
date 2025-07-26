import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Target, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 font-bold text-5xl text-gray-900">
          AI驱动的个性化学习平台
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-gray-600 text-xl">
          智学奇点利用先进的AI技术，为每个学习者量身定制学习内容，
          让知识获取变得更加高效、有趣和个性化。
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/create">
            <Button size="lg" className="px-8 py-3">
              开始创建课程
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline" size="lg" className="px-8 py-3">
              探索课程
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center font-bold text-3xl">核心功能</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Zap className="mb-2 h-8 w-8 text-blue-600" />
              <CardTitle>AI内容生成</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                基于主题自动生成高质量的学习内容，包括理论讲解、实例分析和练习题目。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Target className="mb-2 h-8 w-8 text-green-600" />
              <CardTitle>个性化学习</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                根据学习者的进度和理解程度，动态调整内容难度和学习路径。
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="mb-2 h-8 w-8 text-purple-600" />
              <CardTitle>内容分享</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                在内容广场分享优质课程，与其他学习者交流经验和心得。
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="mb-2 h-8 w-8 text-orange-600" />
              <CardTitle>智能评估</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI驱动的学习评估系统，实时跟踪学习进度并提供个性化建议。
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
