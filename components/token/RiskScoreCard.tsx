import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { ScoreResult } from "@/types/token";

export function RiskScoreCard({ score }: { score: ScoreResult }) {
  return (
    <Panel className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
            Scout Risk Engine
          </p>
          <h2 className="mt-2 font-mono text-2xl text-white">Signal summary</h2>
        </div>
        <Badge level={score.riskLevel} />
      </div>
      <ScoreBar score={score.total} />
      <p className="max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">{score.summary}</p>
    </Panel>
  );
}
