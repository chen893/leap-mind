"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Star,
  TrendingUp,
  Flame,
  Trophy,
  Calendar,
  Target,
  Award,
  Info,
} from "lucide-react";
import { usePointsStore, usePointsSelectors } from "@/store/pointsStore";
import { cn } from "@/lib/utils";

import type { PointsDisplayProps } from "@/types/components";

export function PointsDisplay({ 
  variant = "compact", 
  showHistory = false,
  className 
}: PointsDisplayProps) {
  const { userPoints, pointsHistory, isLoading } = usePointsStore();
  const { levelProgress, recentPointsHistory } = usePointsSelectors();

  if (isLoading || !userPoints) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return "text-purple-600";
    if (level >= 25) return "text-blue-600";
    if (level >= 10) return "text-green-600";
    return "text-gray-600";
  };

  const getLevelBadgeVariant = (level: number) => {
    if (level >= 50) return "default";
    if (level >= 25) return "secondary";
    if (level >= 10) return "outline";
    return "outline";
  };

  if (variant === "compact") {
    return (
      <Card className={cn("border-2", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg">
                  {formatNumber(userPoints.totalPoints)}
                </span>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Badge variant={getLevelBadgeVariant(userPoints.level)} className={getLevelColor(userPoints.level)}>
                  Lv.{userPoints.level}
                </Badge>
              </div>
              
              {userPoints.streak > 0 && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">{userPoints.streak}</span>
                  </div>
                </>
              )}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Info className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>积分详情</DialogTitle>
                </DialogHeader>
                <PointsDisplay variant="detailed" showHistory={true} />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* 等级进度条 */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>等级进度</span>
              <span>{userPoints.currentExp} / {userPoints.expToNextLevel} EXP</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 主要统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">总积分</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {formatNumber(userPoints.totalPoints)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">等级</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              Lv.{userPoints.level}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">连续天数</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {userPoints.streak}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* 等级进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            等级进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={getLevelBadgeVariant(userPoints.level)} className={getLevelColor(userPoints.level)}>
              当前等级 {userPoints.level}
            </Badge>
            <Badge variant="outline">
              下一级 {userPoints.level + 1}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>经验值</span>
              <span>{userPoints.currentExp} / {userPoints.expToNextLevel}</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <div className="text-center text-xs text-muted-foreground">
              还需 {userPoints.expToNextLevel - userPoints.currentExp} 经验值升级
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 积分历史 */}
      {showHistory && recentPointsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              最近积分记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPointsHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{record.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString('zh-CN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold text-sm",
                    record.pointsChange > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {record.pointsChange > 0 ? "+" : ""}{record.pointsChange}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 提示信息 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">如何获得更多积分？</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 完成章节学习验证：20-50 积分</li>
                <li>• 连续学习奖励：5-50 积分</li>
                <li>• 解锁成就：50-1000 积分</li>
                <li>• 升级奖励：等级 × 10 积分</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}