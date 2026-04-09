import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import type { CheckResult } from "@/types/token";

export function RiskChecklist({ checks }: { checks: CheckResult[] }) {
  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-xl text-white">Checks</h3>
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
          6 automated signals
        </span>
      </div>
      <div className="space-y-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className="rounded-2xl border border-white/5 bg-black/15 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{check.name}</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{check.details}</p>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    check.passed ? "text-emerald-300" : "text-rose-300",
                  )}
                >
                  {check.passed ? "PASS" : "FLAG"}
                </span>
                <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
                  +{check.score}/{check.maxScore}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
