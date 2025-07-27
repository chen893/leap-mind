"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useButtonState } from "@/store/ui-store";
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
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            LeapMind
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/explore">
              <Button variant="ghost">内容广场</Button>
            </Link>

            {session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">我的课程</Button>
                </Link>
                <Link href="/create">
                  <Button>创建课程</Button>
                </Link>
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
                    {/* <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        我的课程
                      </Link>
                    </DropdownMenuItem> */}
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
