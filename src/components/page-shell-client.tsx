"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageBackground } from "@/components/page-background";

type PageShellClientProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShellClient({ children, className }: PageShellClientProps) {
  return (
    <div className={cn("relative min-h-dvh bg-background", className)}>
      <PageBackground />
      {children}
    </div>
  );
}

