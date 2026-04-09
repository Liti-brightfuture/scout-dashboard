import { analyzeToken } from "@/lib/scoring/engine";
import { updateAlert } from "@/lib/alerts/repository";
import type { Alert, AlertEvaluation } from "@/types/alerts";

/**
 * Evaluates a stored alert against fresh token analysis.
 *
 * @param alert - Stored alert record.
 * @returns Evaluation outcome and updated state.
 */
export async function evaluateAlert(alert: Alert): Promise<AlertEvaluation> {
  const analysis = await analyzeToken(alert.tokenAddress);
  const now = Date.now();

  let currentValue: number | null = null;
  let matched = false;
  let reason = "Condition not met.";

  if (alert.condition === "score_below") {
    currentValue = analysis.score.total;
    matched = currentValue < alert.threshold;
    reason = matched
      ? `Score fell to ${currentValue}.`
      : `Score remains at ${currentValue}.`;
  }

  if (alert.condition === "liquidity_below") {
    currentValue = analysis.token.liquidityUsd ?? null;
    matched = currentValue !== null && currentValue < alert.threshold;
    reason =
      currentValue === null
        ? "Liquidity data unavailable."
        : matched
          ? `Liquidity fell to $${currentValue.toFixed(0)}.`
          : `Liquidity is $${currentValue.toFixed(0)}.`;
  }

  const nextStatus = !alert.enabled ? "DISABLED" : matched ? "TRIGGERED" : "ACTIVE";
  const updatedAlert = await updateAlert({
    id: alert.id,
    walletAddress: alert.walletAddress,
    status: nextStatus,
    lastEvaluatedAt: now,
    lastTriggeredAt: matched ? now : alert.lastTriggeredAt,
  });

  return {
    alert: updatedAlert,
    matched,
    currentValue,
    reason,
  };
}
