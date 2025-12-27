"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, Plus, Sparkles, User } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export function Navbar() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signIn("github");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "登录失败";
      toast({
        title: "登录失败",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "已退出登录",
        description: "您已成功退出登录",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "退出登录失败";
      toast({
        title: "退出登录失败",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-accent text-brand-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">LeapMind</div>
              <div className="text-xs text-muted-foreground">智学奇点</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/explore">内容广场</Link>
            </Button>

            {session ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard">我的课程</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/create">创建课程</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user?.image ?? ""}
                          alt={session.user?.name ?? ""}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        我的课程
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="sm:hidden">
                      <Link href="/create" className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        创建课程
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                    <DropdownMenuItem className="p-0">
                      <EnhancedButton
                        buttonId="navbar-signout"
                        variant="ghost"
                        className="h-auto w-full justify-start p-2 font-normal"
                          onAsyncClick={handleSignOut}
                        loadingText="退出中..."
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        退出登录
                      </EnhancedButton>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <EnhancedButton
                buttonId="navbar-signin"
                onAsyncClick={handleSignIn}
                loadingText="登录中..."
                size="sm"
              >
                GitHub 登录
              </EnhancedButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
