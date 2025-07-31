// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   Trophy,
//   Star,
//   Lock,
//   Calendar,
//   Award,
//   Target,
//   BookOpen,
//   TrendingUp,
//   Flame,
//   Zap,
// } from "lucide-react";
// import { usePointsStore, usePointsSelectors } from "@/store/pointsStore";
// import { cn } from "@/lib/utils";
// import type { AchievementWithUnlocked as Achievement } from "@/types/api";
// import type {
//   AchievementsDisplayProps,
//   ACHIEVEMENT_CATEGORIES,
//   ACHIEVEMENT_ICONS,
//   ACHIEVEMENT_LABELS,
//   ACHIEVEMENT_COLORS,
// } from "@/types/components";

// // 使用从 types/components.ts 导入的常量
// const categoryIcons = ACHIEVEMENT_ICONS;
// const categoryLabels = ACHIEVEMENT_LABELS;
// const categoryColors = ACHIEVEMENT_COLORS;

// export function AchievementsDisplay({
//   variant = "grid",
//   showProgress = true,
//   filterCategory,
//   className,
// }: AchievementsDisplayProps) {
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [selectedAchievement, setSelectedAchievement] =
//     useState<Achievement | null>(null);

//   const { achievements, userAchievements, isLoading } = usePointsStore();
//   const {
//     achievementsByCategory,
//     unlockedAchievementsCount,
//     totalAchievementsCount,
//     achievementProgress,
//   } = usePointsSelectors();

//   if (isLoading) {
//     return (
//       <div className={cn("space-y-4", className)}>
//         {Array.from({ length: 6 }).map((_, i) => (
//           <Card key={i} className="animate-pulse">
//             <CardContent className="p-4">
//               <div className="space-y-3">
//                 <div className="bg-muted h-4 w-3/4 rounded" />
//                 <div className="bg-muted h-3 w-1/2 rounded" />
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   const filteredAchievements = filterCategory
//     ? achievements.filter((a) => a.category === filterCategory)
//     : selectedCategory === "all"
//       ? achievements
//       : (achievementsByCategory[selectedCategory] ?? []);

//   const categories = Object.keys(achievementsByCategory);

//   const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
//     const IconComponent =
//       categoryIcons[achievement.category as keyof typeof categoryIcons] ||
//       Trophy;
//     const isUnlocked = achievement.isUnlocked;
//     const unlockedDate = achievement.unlockedAt;

//     return (
//       <Dialog>
//         <DialogTrigger asChild>
//           <Card
//             className={cn(
//               "cursor-pointer transition-all duration-200 hover:shadow-md",
//               isUnlocked
//                 ? "border-2 border-green-200 bg-green-50"
//                 : "border-2 border-gray-200 bg-gray-50 opacity-75",
//             )}
//           >
//             <CardContent className="p-4">
//               <div className="flex items-start gap-3">
//                 <div
//                   className={cn(
//                     "flex h-12 w-12 items-center justify-center rounded-full text-2xl",
//                     isUnlocked ? "bg-white shadow-sm" : "bg-gray-200",
//                   )}
//                 >
//                   {isUnlocked ? (
//                     <span>{achievement.icon}</span>
//                   ) : (
//                     <Lock className="h-6 w-6 text-gray-400" />
//                   )}
//                 </div>

//                 <div className="min-w-0 flex-1">
//                   <div className="mb-1 flex items-center gap-2">
//                     <h3
//                       className={cn(
//                         "truncate text-sm font-semibold",
//                         isUnlocked ? "text-green-900" : "text-gray-600",
//                       )}
//                     >
//                       {achievement.title}
//                     </h3>
//                     {isUnlocked && (
//                       <Trophy className="h-4 w-4 flex-shrink-0 text-yellow-500" />
//                     )}
//                   </div>

//                   <p
//                     className={cn(
//                       "mb-2 text-xs leading-relaxed",
//                       isUnlocked ? "text-green-700" : "text-gray-500",
//                     )}
//                   >
//                     {achievement.description}
//                   </p>

//                   <div className="flex items-center justify-between">
//                     <Badge
//                       variant="outline"
//                       className={cn(
//                         "text-xs",
//                         categoryColors[
//                           achievement.category as keyof typeof categoryColors
//                         ],
//                       )}
//                     >
//                       <IconComponent className="mr-1 h-3 w-3" />
//                       {
//                         categoryLabels[
//                           achievement.category as keyof typeof categoryLabels
//                         ]
//                       }
//                     </Badge>

//                     {(achievement.pointsReward ?? 0) > 0 && (
//                       <div className="flex items-center gap-1 text-xs text-yellow-600">
//                         <Star className="h-3 w-3" />
//                         <span>{achievement.pointsReward}</span>
//                       </div>
//                     )}
//                   </div>

//                   {isUnlocked && unlockedDate && (
//                     <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
//                       <Calendar className="h-3 w-3" />
//                       <span>
//                         {new Date(unlockedDate).toLocaleDateString("zh-CN", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                         })}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </DialogTrigger>

//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl">
//                 {isUnlocked ? (
//                   achievement.icon
//                 ) : (
//                   <Lock className="h-6 w-6 text-white" />
//                 )}
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   {achievement.title}
//                   {isUnlocked && <Trophy className="h-5 w-5 text-yellow-500" />}
//                 </div>
//                 <Badge
//                   variant="outline"
//                   className={cn(
//                     "mt-1 text-xs",
//                     categoryColors[
//                       achievement.category as keyof typeof categoryColors
//                     ],
//                   )}
//                 >
//                   {
//                     categoryLabels[
//                       achievement.category as keyof typeof categoryLabels
//                     ]
//                   }
//                 </Badge>
//               </div>
//             </DialogTitle>
//             <DialogDescription asChild>
//               <div className="space-y-4">
//                 <p className="text-sm leading-relaxed">
//                   {achievement.description}
//                 </p>

//                 {(achievement.pointsReward ?? 0) > 0 && (
//                   <div className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-3">
//                     <Star className="h-5 w-5 text-yellow-600" />
//                     <span className="font-medium text-yellow-800">
//                       奖励 {achievement.pointsReward} 积分
//                     </span>
//                   </div>
//                 )}

//                 {isUnlocked && unlockedDate ? (
//                   <div className="rounded-lg bg-green-50 p-3 text-center">
//                     <div className="mb-1 text-sm font-medium text-green-800">
//                       🎉 已解锁
//                     </div>
//                     <div className="text-xs text-green-600">
//                       {new Date(unlockedDate).toLocaleDateString("zh-CN", {
//                         year: "numeric",
//                         month: "long",
//                         day: "numeric",
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="rounded-lg bg-gray-50 p-3 text-center">
//                     <div className="mb-1 text-sm font-medium text-gray-600">
//                       🔒 未解锁
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       继续努力学习来解锁这个成就！
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   return (
//     <div className={cn("space-y-6", className)}>
//       {/* 进度概览 */}
//       {showProgress && (
//         <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Trophy className="h-6 w-6 text-yellow-600" />
//               成就进度
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="text-2xl font-bold text-yellow-900">
//                 {unlockedAchievementsCount} / {totalAchievementsCount}
//               </div>
//               <Badge
//                 variant="outline"
//                 className="border-yellow-300 text-yellow-800"
//               >
//                 {Math.round(achievementProgress)}% 完成
//               </Badge>
//             </div>

//             <Progress value={achievementProgress} className="h-3" />

//             <div className="text-sm text-yellow-700">
//               还有 {totalAchievementsCount - unlockedAchievementsCount}{" "}
//               个成就等待解锁
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* 成就列表 */}
//       {!filterCategory ? (
//         <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
//           <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
//             <TabsTrigger value="all" className="text-xs">
//               全部
//             </TabsTrigger>
//             {categories.map((category) => {
//               const IconComponent =
//                 categoryIcons[category as keyof typeof categoryIcons];
//               return (
//                 <TabsTrigger
//                   key={category}
//                   value={category}
//                   className="text-xs"
//                 >
//                   <TooltipProvider>
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <div className="flex items-center gap-1">
//                           <IconComponent className="h-3 w-3" />
//                           <span className="hidden sm:inline">
//                             {
//                               categoryLabels[
//                                 category as keyof typeof categoryLabels
//                               ]
//                             }
//                           </span>
//                         </div>
//                       </TooltipTrigger>
//                       <TooltipContent>
//                         <p>
//                           {
//                             categoryLabels[
//                               category as keyof typeof categoryLabels
//                             ]
//                           }
//                         </p>
//                       </TooltipContent>
//                     </Tooltip>
//                   </TooltipProvider>
//                 </TabsTrigger>
//               );
//             })}
//           </TabsList>

//           <TabsContent value={selectedCategory} className="mt-6">
//             <div
//               className={cn(
//                 variant === "grid"
//                   ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
//                   : "space-y-3",
//               )}
//             >
//               {filteredAchievements.map((achievement) => (
//                 <AchievementCard
//                   key={achievement.id}
//                   achievement={achievement}
//                 />
//               ))}
//             </div>
//           </TabsContent>
//         </Tabs>
//       ) : (
//         <div
//           className={cn(
//             variant === "grid"
//               ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
//               : "space-y-3",
//           )}
//         >
//           {filteredAchievements.map((achievement) => (
//             <AchievementCard key={achievement.id} achievement={achievement} />
//           ))}
//         </div>
//       )}

//       {filteredAchievements.length === 0 && (
//         <Card>
//           <CardContent className="flex items-center justify-center py-12">
//             <div className="space-y-2 text-center">
//               <Trophy className="text-muted-foreground mx-auto h-12 w-12" />
//               <h3 className="text-muted-foreground font-medium">暂无成就</h3>
//               <p className="text-muted-foreground text-sm">
//                 继续学习来解锁更多成就！
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
