"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useChapterQuestionsSSE } from "@/hooks/use-chapter-questions-sse";
import { AlertCircle, CheckCircle, Clock, Wifi, WifiOff } from "lucide-react";

/**
 * SSE 测试页面
 * 用于验证新的事件驱动通知机制
 */
export default function TestSSEPage() {
  const [chapterId, setChapterId] = useState("");
  const [testChapterId, setTestChapterId] = useState<string | null>(null);

  const {
    isReady,
    isConnected,
    isLoading,
    error,
    questionCount,
    source,
    retry,
  } = useChapterQuestionsSSE(testChapterId);

  const handleStartTest = () => {
    if (chapterId.trim()) {
      setTestChapterId(chapterId.trim());
    }
  };

  const handleStopTest = () => {
    setTestChapterId(null);
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (isReady) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isLoading) return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    return null;
  };

  const getConnectionIcon = () => {
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-500" />
    ) : (
      <WifiOff className="h-4 w-4 text-gray-400" />
    );
  };

  const getStatusText = () => {
    if (error) return "错误";
    if (isReady) return "就绪";
    if (isLoading) return "加载中";
    return "未连接";
  };

  const getStatusColor = () => {
    if (error) return "destructive";
    if (isReady) return "default";
    if (isLoading) return "secondary";
    return "outline";
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SSE 通知机制测试</h1>
        <p className="text-muted-foreground">
          测试改进的事件驱动通知系统，验证章节题目生成完成通知功能
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 测试控制面板 */}
        <Card>
          <CardHeader>
            <CardTitle>测试控制</CardTitle>
            <CardDescription>
              输入章节ID来测试SSE连接和事件通知
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapterId">章节ID</Label>
              <Input
                id="chapterId"
                placeholder="输入章节ID (例如: clxxxxx)"
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleStartTest}
                disabled={!chapterId.trim() || isLoading}
                className="flex-1"
              >
                开始测试
              </Button>
              
              {testChapterId && (
                <Button 
                  variant="outline" 
                  onClick={handleStopTest}
                  disabled={isLoading}
                >
                  停止
                </Button>
              )}
            </div>

            {error && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={retry}
                >
                  重试
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 状态显示面板 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              连接状态
              {getConnectionIcon()}
            </CardTitle>
            <CardDescription>
              实时显示SSE连接和事件接收状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">当前状态</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon()}
                  <Badge variant={getStatusColor()}>
                    {getStatusText()}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">测试章节</Label>
                <div className="mt-1">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {testChapterId ?? "未设置"}
                  </code>
                </div>
              </div>
            </div>

            {isReady && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">题目信息</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">数量:</span>
                    <span className="ml-2 font-medium">{questionCount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">来源:</span>
                    <span className="ml-2 font-medium">
                      {source === 'existing' ? '已存在' : 
                       source === 'generated' ? '新生成' : '未知'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">错误信息</Label>
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                  {error ?? "未知错误"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. 测试现有题目:</strong>
            <p className="text-muted-foreground ml-4">
              输入一个已经有题目的章节ID，应该立即显示&quot;就绪&quot;状态
            </p>
          </div>
          
          <div>
            <strong>2. 测试题目生成:</strong>
            <p className="text-muted-foreground ml-4">
              输入一个没有题目的章节ID，然后在另一个页面触发该章节的内容生成，
              观察是否能实时收到题目生成完成的通知
            </p>
          </div>
          
          <div>
            <strong>3. 测试错误处理:</strong>
            <p className="text-muted-foreground ml-4">
              输入一个不存在的章节ID，观察错误处理机制
            </p>
          </div>
          
          <div>
            <strong>4. 对比原方案:</strong>
            <p className="text-muted-foreground ml-4">
              新方案基于事件通知，无需轮询，响应更快，资源消耗更低
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}