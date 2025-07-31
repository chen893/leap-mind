// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Trophy, Star, X, Sparkles, Award } from "lucide-react";
// import { usePointsStore } from "@/store/pointsStore";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import type { AchievementNotificationProps } from "@/types/components";

// export function AchievementNotification({
//   achievement,
//   onClose,
//   autoClose = true,
//   autoCloseDelay = 5000,
// }: AchievementNotificationProps) {
//   const [isVisible, setIsVisible] = useState(true);
//   const [showDetails, setShowDetails] = useState(false);
//   const handleClose = () => {
//     setIsVisible(false);
//     setTimeout(onClose, 300); // 等待动画完成
//   };
//   useEffect(() => {
//     if (autoClose) {
//       const timer = setTimeout(() => {
//         handleClose();
//       }, autoCloseDelay);

//       return () => clearTimeout(timer);
//     }
//   }, [autoClose, autoCloseDelay, handleClose]);

//   const handleShowDetails = () => {
//     setShowDetails(true);
//   };

//   return (
//     <>
//       {/* 浮动通知 */}
//       <div
//         className={cn(
//           "fixed top-4 right-4 z-50 transform transition-all duration-300",
//           isVisible
//             ? "translate-x-0 opacity-100"
//             : "translate-x-full opacity-0",
//         )}
//       >
//         <Card className="w-80 border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg">
//           <CardContent className="p-4">
//             <div className="flex items-start gap-3">
//               {/* 成就图标 */}
//               <div className="relative">
//                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl shadow-md">
//                   {achievement.icon}
//                 </div>
//                 <div className="absolute -top-1 -right-1">
//                   <Sparkles className="h-4 w-4 animate-pulse text-yellow-500" />
//                 </div>
//               </div>

//               {/* 成就信息 */}
//               <div className="min-w-0 flex-1">
//                 <div className="mb-1 flex items-center gap-2">
//                   <Trophy className="h-4 w-4 text-yellow-600" />
//                   <span className="text-sm font-bold text-yellow-900">
//                     成就解锁！
//                   </span>
//                 </div>

//                 <h3 className="mb-1 truncate font-semibold text-yellow-900">
//                   {achievement.title ?? achievement.name}
//                 </h3>

//                 <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-yellow-700">
//                   {achievement.description}
//                 </p>

//                 {(achievement.pointsReward ?? achievement.points) > 0 && (
//                   <div className="mb-2 flex items-center gap-1">
//                     <Star className="h-3 w-3 text-yellow-600" />
//                     <span className="text-xs font-medium text-yellow-800">
//                       +{achievement.pointsReward ?? achievement.points} 积分
//                     </span>
//                   </div>
//                 )}

//                 <div className="flex items-center gap-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={handleShowDetails}
//                     className="h-7 border-yellow-300 text-xs text-yellow-800 hover:bg-yellow-100"
//                   >
//                     查看详情
//                   </Button>
//                 </div>
//               </div>

//               {/* 关闭按钮 */}
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={handleClose}
//                 className="h-6 w-6 p-0 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-800"
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* 详情对话框 */}
//       <Dialog open={showDetails} onOpenChange={setShowDetails}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-3">
//               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl shadow-lg">
//                 {achievement.icon}
//               </div>
//               <div>
//                 <div className="mb-1 flex items-center gap-2">
//                   <Trophy className="h-5 w-5 text-yellow-600" />
//                   <span className="text-lg font-bold text-yellow-900">
//                     成就解锁！
//                   </span>
//                 </div>
//                 <h2 className="text-xl font-bold">
//                   {achievement.title ?? achievement.name}
//                 </h2>
//               </div>
//             </DialogTitle>
//             <DialogDescription asChild>
//               <div className="space-y-4">
//                 <p className="text-sm leading-relaxed">
//                   {achievement.description}
//                 </p>

//                 {(achievement.pointsReward ?? achievement.points) > 0 && (
//                   <div className="flex items-center justify-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
//                     <Star className="h-6 w-6 text-yellow-600" />
//                     <span className="text-lg font-bold text-yellow-800">
//                       +{achievement.pointsReward ?? achievement.points} 积分奖励
//                     </span>
//                   </div>
//                 )}

//                 <div className="rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 text-center">
//                   <div className="mb-2 flex items-center justify-center gap-2">
//                     <Award className="h-5 w-5 text-yellow-600" />
//                     <span className="font-medium text-yellow-800">
//                       恭喜您的成就！
//                     </span>
//                   </div>
//                   <p className="text-sm text-yellow-700">
//                     继续保持学习热情，解锁更多精彩成就！
//                   </p>
//                 </div>

//                 {achievement.unlockedAt && (
//                   <div className="text-muted-foreground text-center text-xs">
//                     解锁时间：
//                     {new Date(achievement.unlockedAt).toLocaleString("zh-CN")}
//                   </div>
//                 )}
//               </div>
//             </DialogDescription>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

// // 成就通知管理器组件
// export function AchievementNotificationManager() {
//   const { newAchievements, clearNewAchievements } = usePointsStore();
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // 确保 newAchievements 是正确的类型
//   const achievements: Achievement[] = newAchievements ?? [];

//   useEffect(() => {
//     if (achievements.length > 0 && currentIndex < achievements.length) {
//       // 显示成就解锁的toast通知
//       const achievement = achievements?.[currentIndex];
//       if (achievement) {
//         toast.success(
//           `🏆 解锁新成就: ${achievement.title ?? achievement.name}`,
//           {
//             description: `+${achievement.pointsReward ?? achievement.points} 积分`,
//             duration: 3000,
//           },
//         );
//       }
//     }
//   }, [achievements, currentIndex]);

//   const handleCloseNotification = () => {
//     if (currentIndex < achievements.length - 1) {
//       // 显示下一个成就
//       setCurrentIndex(currentIndex + 1);
//     } else {
//       // 清除所有新成就
//       clearNewAchievements();
//       setCurrentIndex(0);
//     }
//   };

//   if (achievements.length === 0 || currentIndex >= achievements.length) {
//     return null;
//   }

//   const currentAchievement = achievements[currentIndex];
//   if (!currentAchievement) {
//     return null;
//   }

//   return (
//     <AchievementNotification
//       achievement={currentAchievement}
//       onClose={handleCloseNotification}
//       autoClose={true}
//       autoCloseDelay={6000}
//     />
//   );
// }
