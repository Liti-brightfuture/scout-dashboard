import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldX } from "lucide-react";

import type { RiskLevel } from "@/types/token";
import { cn } from "@/lib/utils";

const STYLES: Record<RiskLevel, string> = {
  SAFE: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  WARNING: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  DANGER: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  UNKNOWN: "bg-slate-500/15 text-slate-300 border-slate-500/20",
};

export function Badge({ level }: { level: RiskLevel }) {
  const Icon =
    level === "SAFE"
      ? CheckCircle2
      : level === "WARNING"
        ? AlertTriangle
        : level === "DANGER"
          ? ShieldX
          : LoaderCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em]",
        STYLES[level],
        level === "DANGER" && "animate-pulse",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", level === "UNKNOWN" && "animate-spin")} aria-hidden="true" />
      {level}
    </span>
  );
}
