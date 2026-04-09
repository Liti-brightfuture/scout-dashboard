import { WEIGHTS } from "@/lib/scoring/weights";
import { simulateJupiterSellQuote } from "@/lib/api/jupiter";
import type { CheckResult, TokenInfo } from "@/types/token";

/**
 * Uses a Jupiter quote as a honeypot sellability proxy.
 *
 * @param token - Token metadata.
 * @returns Honeypot check result.
 */
export async function runHoneypotCheck(token: TokenInfo): Promise<CheckResult> {
  const rawAmount = Math.max(1, Math.floor(token.supply * 0.01 * 10 ** token.decimals));
  const simulation = await simulateJupiterSellQuote(token.address, rawAmount);

  if (!simulation.available) {
    return {
      id: "honeypotSimulation",
      name: "Honeypot simulation",
      passed: false,
      severity: "HIGH",
      score: WEIGHTS.honeypotSimulation,
      maxScore: WEIGHTS.honeypotSimulation,
      details: "Jupiter could not produce a sell route for the simulated trade.",
      dataSource: "Jupiter Quote API",
      metadata: {
        priceImpactPct: null,
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
    },
  };
}
