import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult, TokenInfo } from "@/types/token";

const UNKNOWN_SCORE = 2;

/**
 * Scores absolute liquidity depth as a standalone rug-vector signal.
 *
 * @param token - Token metadata.
 * @returns Liquidity depth check result.
 */
export function runLiquidityDepthCheck(token: TokenInfo): CheckResult {
  if (token.liquidityUsd == null) {
    return {
      id: "liquidityDepth",
      name: "Liquidity depth",
      passed: true,
      severity: "MEDIUM",
      score: UNKNOWN_SCORE,
      maxScore: WEIGHTS.liquidityDepth,
      details: "Liquidity data is unavailable; depth check marked as unknown.",
      dataSource: "DexScreener",
      metadata: { state: "UNKNOWN" },
    };
  }

  const liq = token.liquidityUsd;

  if (liq > 500_000) {
    return {
      id: "liquidityDepth",
      name: "Liquidity depth",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: WEIGHTS.liquidityDepth,
      details: `Liquidity is $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })}, well above the $500K safety threshold.`,
      dataSource: "DexScreener",
      metadata: { liquidityUsd: liq },
    };
  }

  if (liq >= 100_000) {
    return {
      id: "liquidityDepth",
      name: "Liquidity depth",
      passed: false,
      severity: "MEDIUM",
      score: 3,
      maxScore: WEIGHTS.liquidityDepth,
      details: `Liquidity is $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Adequate but below the $500K deep-liquidity threshold.`,
      dataSource: "DexScreener",
      metadata: { liquidityUsd: liq },
    };
  }

  if (liq >= 20_000) {
    return {
      id: "liquidityDepth",
      name: "Liquidity depth",
      passed: false,
      severity: "MEDIUM",
      score: 6,
      maxScore: WEIGHTS.liquidityDepth,
      details: `Liquidity is $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Low liquidity creates meaningful slippage and exit risk.`,
      dataSource: "DexScreener",
      metadata: { liquidityUsd: liq },
    };
  }

  return {
    id: "liquidityDepth",
    name: "Liquidity depth",
    passed: false,
    severity: "HIGH",
    score: WEIGHTS.liquidityDepth,
    maxScore: WEIGHTS.liquidityDepth,
    details: `Liquidity is $${liq.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Extremely thin liquidity; exit may be impossible without severe price impact.`,
    dataSource: "DexScreener",
    metadata: { liquidityUsd: liq },
  };
}
