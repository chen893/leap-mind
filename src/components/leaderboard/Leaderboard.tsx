"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Medal,
  Award,
  Star,
  TrendingUp,
  Crown,
  Users,
  RefreshCw,
} from "lucide-react";
import { usePointsStore } from "@/store/pointsStore";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LeaderboardProps } from "@/types/components";

interface LeaderboardEntry {
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  totalPoints: number;
  level: number;
}

export function Leaderboard({
  variant = "detailed",
  showUserRank = true,
  limit = 20,
  className,
}: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"points" | "level">("points");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { leaderboard, userRank, setLeaderboard } = usePointsStore();

  // API hooks
  const getLeaderboardQuery = api.points.getLeaderboard.useQuery(
    { type: activeTab, limit },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分钟
    },
  );

  useEffect(() => {
    if (getLeaderboardQuery.data) {
      setLeaderboard(
        getLeaderboardQuery.data.leaderboard,
        getLeaderboardQuery.data.userRank,
      );
    }
  }, [getLeaderboardQuery.data, setLeaderboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getLeaderboardQuery.refetch();
      toast.success("排行榜已更新");
    } catch (error) {
      toast.error("更新失败，请重试");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="items-center h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <div className="bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank <= 3) return "default";
    if (rank <= 10) return "secondary";
    return "outline";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getUserInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const LeaderboardItem = ({
    entry,
    rank,
  }: {
    entry: LeaderboardEntry;
    rank: number;
  }) => {
    const isTopThree = rank <= 3;

    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg p-3 transition-colors",
          isTopThree
            ? "border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50"
            : "hover:bg-muted/50",
          variant === "compact" && "p-2",
        )}
      >
        {/* 排名 */}
        <div className="flex w-8 items-center justify-center">
          {getRankIcon(rank)}
        </div>

        {/* 用户信息 */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            className={cn(
              variant === "compact" ? "h-8 w-8" : "h-10 w-10",
              isTopThree && "ring-2 ring-yellow-300",
            )}
          >
            <AvatarImage src={entry.user.image ?? undefined} />
            <AvatarFallback
              className={cn(
                "text-xs font-medium",
                isTopThree
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {getUserInitials(entry.user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">
              {entry.user.name ?? "匿名用户"}
            </div>
            {variant === "detailed" && (
              <div className="text-muted-foreground text-xs">
                等级 {entry.level}
              </div>
            )}
          </div>
        </div>

        {/* 积分/等级 */}
        <div className="text-right">
          <div className="text-sm font-bold">
            {activeTab === "points"
              ? formatNumber(entry.totalPoints)
              : `Lv.${entry.level}`}
          </div>
          {variant === "detailed" && activeTab === "points" && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Star className="h-3 w-3" />
              积分
            </div>
          )}
        </div>

        {/* 排名徽章 */}
        {isTopThree && (
          <Badge variant={getRankBadgeVariant(rank)} className="ml-2">
            #{rank}
          </Badge>
        )}
      </div>
    );
  };

  if (getLeaderboardQuery.isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="bg-muted h-8 w-8 rounded-full" />
                <div className="bg-muted h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-4 w-3/4 rounded" />
                  <div className="bg-muted h-3 w-1/2 rounded" />
                </div>
                <div className="bg-muted h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (getLeaderboardQuery.isError) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="space-y-4 text-center">
            <Users className="text-muted-foreground mx-auto h-12 w-12" />
            <div className="space-y-2">
              <h3 className="text-muted-foreground font-medium">加载失败</h3>
              <p className="text-muted-foreground text-sm">
                无法获取排行榜数据
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            排行榜
          </CardTitle>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("mr-1 h-4 w-4", isRefreshing && "animate-spin")}
            />
            刷新
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "points" | "level")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="points" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              积分榜
            </TabsTrigger>
            <TabsTrigger value="level" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              等级榜
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 用户排名 */}
        {showUserRank && userRank > 0 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-300 text-blue-800"
                >
                  我的排名
                </Badge>
                <span className="font-medium text-blue-900">#{userRank}</span>
              </div>
              <div className="text-sm text-blue-700">
                {activeTab === "points" ? "积分排名" : "等级排名"}
              </div>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="space-y-2">
          {leaderboard.length > 0 ? (
            leaderboard.map((entry, index) => (
              <LeaderboardItem
                key={entry.user.id}
                entry={entry}
                rank={index + 1}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-muted-foreground mb-2 font-medium">
                暂无排行数据
              </h3>
              <p className="text-muted-foreground text-sm">
                开始学习来登上排行榜吧！
              </p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {leaderboard.length > 0 && (
          <div className="border-border border-t pt-4 text-center">
            <p className="text-muted-foreground text-xs">
              排行榜每5分钟更新一次
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
