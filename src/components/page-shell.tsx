import * as React from "react";
import { cn } from "@/lib/utils";
import { PageBackground } from "@/components/page-background";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn("relative min-h-dvh bg-background", className)}>
      <PageBackground />

      {children}
    </div>
  );
}
