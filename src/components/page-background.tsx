"use client";

export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -bottom-48 -right-48 h-[560px] w-[560px] rounded-full bg-brand-accent/18 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_-20%,rgba(0,0,0,0.08),transparent_60%)] opacity-20 dark:bg-[radial-gradient(1200px_circle_at_50%_-20%,rgba(255,255,255,0.12),transparent_60%)] dark:opacity-40" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_0%,transparent_70%)] opacity-35 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-25" />
    </div>
  );
}

