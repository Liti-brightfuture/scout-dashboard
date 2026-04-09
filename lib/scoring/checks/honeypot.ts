import { WEIGHTS } from "@/lib/scoring/weights";
import { simulateJupiterSellQuote } from "@/lib/api/jupiter";
import type { CheckResult, TokenInfo } from "@/types/token";

const UNKNOWN_SCORE = 10;

function estimateSimulationAmount(token: TokenInfo): number {
  const decimalsFactor = 10 ** token.decimals;
  const priceUsd = token.priceUsd ?? null;

  if (priceUsd && priceUsd > 0) {
    const targetNotionalUsd = Math.min(1_000, Math.max(100, (token.liquidityUsd ?? 0) * 0.005));
    const tokenAmount = targetNotionalUsd / priceUsd;
    return Math.max(1, Math.floor(tokenAmount * decimalsFactor));
  }

  const boundedFraction = token.supply * 0.0001;
  return Math.max(1, Math.floor(boundedFraction * decimalsFactor));
}

/**
 * Uses a Jupiter quote as a honeypot sellability proxy.
 *
 * @param token - Token metadata.
 * @returns Honeypot check result.
 */
export async function runHoneypotCheck(token: TokenInfo): Promise<CheckResult> {
  const rawAmount = estimateSimulationAmount(token);
  const simulation = await simulateJupiterSellQuote(token.address, rawAmount);

  if (!simulation.available) {
    return {
      id: "honeypotSimulation",
      name: "Honeypot simulation",
      passed: true,
      severity: "INFO",
      score: UNKNOWN_SCORE,
      maxScore: WEIGHTS.honeypotSimulation,
      details:
        simulation.reason !== undefined
          ? `Quote unavailable, so Scout marks this as unknown instead of flagging. ${simulation.reason}`
          : "Quote unavailable, so Scout marks this as unknown instead of flagging.",
      dataSource: "Jupiter Quote API",
      metadata: {
        priceImpactPct: null,
        state: "UNKNOWN",
      },
    };
  }

  const impact = simulation.priceImpactPct ?? 0;
  const warning = impact >= 10 && impact <= 30;
  const failed = impact > 50;

  return {
    id: "honeypotSimulation",
    name: "Honeypot simulation",
    passed: !warning && !failed,
    severity: failed ? "HIGH" : warning ? "MEDIUM" : "INFO",
    score: failed ? WEIGHTS.honeypotSimulation : warning ? 10 : 0,
    maxScore: WEIGHTS.honeypotSimulation,
    details: failed
      ? `Sell quote returned extreme price impact (${impact.toFixed(2)}%).`
      : warning
        ? `Sell quote returned elevated price impact (${impact.toFixed(2)}%).`
      : `Sell route available with price impact ${impact.toFixed(2)}%.`,
    dataSource: "Jupiter Quote API",
    metadata: {
      priceImpactPct: impact,
      state: "EVALUATED",
    },
  };
}
