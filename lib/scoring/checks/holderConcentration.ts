import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult, HolderDistributionSnapshot } from "@/types/token";

/**
 * Scores holder concentration based on top-holder thresholds.
 *
 * @param holders - Holder distribution snapshot.
 * @returns Holder concentration result.
 */
export function runHolderConcentrationCheck(
  holders: HolderDistributionSnapshot,
): CheckResult {
  let penalty = 0;
  let passed = true;
  let severity: CheckResult["severity"] = "INFO";
  let details = "Holder distribution looks relatively healthy.";

  if (holders.top1 > 35 || holders.top10 > 80) {
    penalty = WEIGHTS.holderConcentration;
    passed = false;
    severity = "HIGH";
    details = `Dangerous concentration detected. Top 1 holds ${holders.top1.toFixed(
      1,
    )}% and top 10 hold ${holders.top10.toFixed(1)}%.`;
  } else if (holders.top1 > 20 || holders.top10 > 60) {
    penalty = 10;
    passed = false;
    severity = "MEDIUM";
    details = `Moderate concentration detected. Top 1 holds ${holders.top1.toFixed(
      1,
    )}% and top 10 hold ${holders.top10.toFixed(1)}%.`;
  }

  return {
    id: "holderConcentration",
    name: "Holder concentration",
    passed,
    severity,
    score: penalty,
    maxScore: WEIGHTS.holderConcentration,
    details,
    dataSource: "Helius RPC",
    metadata: {
      top1: Number(holders.top1.toFixed(2)),
      top5: Number(holders.top5.toFixed(2)),
      top10: Number(holders.top10.toFixed(2)),
    },
  };
}
