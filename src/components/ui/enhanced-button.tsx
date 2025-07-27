"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useButtonState } from "@/store/ui-store";
import { useCallback, useRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface EnhancedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  buttonId?: string;
  loading?: boolean;
  loadingText?: string;
  debounceMs?: number;
  showLoadingSpinner?: boolean;
  onAsyncClick?: () => Promise<void>;
}

function EnhancedButton({
  className,
  variant,
  size,
  asChild = false,
  buttonId,
  loading: externalLoading,
  loadingText,
  debounceMs = 300,
  showLoadingSpinner = true,
  onAsyncClick,
  onClick,
  disabled,
  children,
  ...props
}: EnhancedButtonProps) {
  const Comp = asChild ? Slot : "button";

  // 使用状态管理（如果提供了buttonId）
  const buttonState = useButtonState(buttonId ?? "default");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 确定最终的loading和disabled状态
  const isLoading =
    externalLoading ?? (buttonId ? buttonState.isLoading : false);
  const isDisabled =
    disabled ?? (buttonId ? buttonState.isDisabled : false) ?? isLoading;

  // 防抖点击处理
  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      // 如果已经在加载中或被禁用，直接返回
      if (isLoading || isDisabled) {
        event.preventDefault();
        return;
      }

      // 清除之前的防抖定时器
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // 设置防抖
      debounceRef.current = setTimeout(() => {
        void (async () => {
          try {
            // 如果有buttonId，设置加载状态
            if (buttonId) {
              buttonState.setLoading(true);
              buttonState.setError(null);
            }

            // 执行异步操作
            if (onAsyncClick) {
              await onAsyncClick();
            }

            // 执行原始点击事件
            if (onClick) {
              onClick(event);
            }
          } catch (error: unknown) {
            // 处理错误
            const errorMessage =
              error instanceof Error ? error.message : "操作失败";
            if (buttonId) {
              buttonState.setError(errorMessage);
            }
            console.error("Button click error:", error);
          } finally {
            // 重置加载状态
            if (buttonId) {
              buttonState.setLoading(false);
            }
          }
        })();
      }, debounceMs);
    },
    [
      isLoading,
      isDisabled,
      buttonId,
      buttonState,
      debounceMs,
      onAsyncClick,
      onClick,
    ],
  );

  // 清理防抖定时器
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 渲染加载状态的子元素
  const renderChildren = () => {
    if (isLoading) {
      return (
        <>
          {showLoadingSpinner && <Loader2 className="h-4 w-4 animate-spin" />}
          {loadingText ?? children}
        </>
      );
    }
    return children;
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {renderChildren()}
    </Comp>
  );
}

export { EnhancedButton, buttonVariants };
export type { EnhancedButtonProps };
