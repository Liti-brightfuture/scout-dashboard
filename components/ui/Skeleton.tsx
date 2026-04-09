import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.08),rgba(255,255,255,0.05))]",
        className,
      )}
    />
  );
}
