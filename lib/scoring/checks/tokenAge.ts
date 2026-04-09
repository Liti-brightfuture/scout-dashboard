import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult, TokenInfo } from "@/types/token";

const DAY_MS = 24 * 60 * 60 * 1000;
const UNKNOWN_SCORE = 2;

function normalizeTimestamp(value: number): number {
  return value > 1_000_000_000_000 ? value : value * 1000;
}

/**
 * Scores token survival based on pair age and liquidity floor.
 *
 * @param token - Token metadata.
 * @returns Token age check result.
 */
export function runTokenAgeCheck(token: TokenInfo): CheckResult {
  if (token.pairCreatedAt == null) {
    return {
      id: "tokenAge",
      name: "Token age & survival",
      passed: true,
      severity: "MEDIUM",
      score: UNKNOWN_SCORE,
      maxScore: WEIGHTS.tokenAge,
      details: "Pair creation time is unavailable; token age is marked as unknown.",
      dataSource: "DexScreener",
      metadata: { state: "UNKNOWN" },
    };
  }

  const createdAtMs = normalizeTimestamp(token.pairCreatedAt);
  const ageMs = Date.now() - createdAtMs;

  if (ageMs > 30 * DAY_MS && (token.liquidityUsd ?? 0) > 50_000) {
    return {
      id: "tokenAge",
      name: "Token age & survival",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: WEIGHTS.tokenAge,
      details: `Token pair is ${Math.floor(ageMs / DAY_MS)} days old with liquidity above $50K.`,
      dataSource: "DexScreener",
      metadata: { ageDays: Math.floor(ageMs / DAY_MS), liquidityUsd: token.liquidityUsd ?? null },
    };
  }

  if (ageMs > 7 * DAY_MS) {
    return {
      id: "tokenAge",
      name: "Token age & survival",
      passed: false,
      severity: "MEDIUM",
      score: 4,
      maxScore: WEIGHTS.tokenAge,
      details: `Token pair is ${Math.floor(ageMs / DAY_MS)} days old. Survival past 30 days with $50K+ liquidity not yet confirmed.`,
      dataSource: "DexScreener",
      metadata: { ageDays: Math.floor(ageMs / DAY_MS), liquidityUsd: token.liquidityUsd ?? null },
    };
  }

  if (ageMs > DAY_MS) {
    return {
      id: "tokenAge",
      name: "Token age & survival",
      passed: false,
      severity: "MEDIUM",
      score: 7,
      maxScore: WEIGHTS.tokenAge,
      details: `Token pair is ${Math.floor(ageMs / DAY_MS)} days old. Very new tokens carry elevated exit-liquidity risk.`,
      dataSource: "DexScreener",
      metadata: { ageDays: Math.floor(ageMs / DAY_MS), liquidityUsd: token.liquidityUsd ?? null },
    };
  }

  return {
    id: "tokenAge",
    name: "Token age & survival",
    passed: false,
    severity: "HIGH",
    score: WEIGHTS.tokenAge,
    maxScore: WEIGHTS.tokenAge,
    details:
      "Token pair is less than 24 hours old. High probability of being an unproven or exploitative launch.",
    dataSource: "DexScreener",
    metadata: { ageDays: 0, liquidityUsd: token.liquidityUsd ?? null },
  };
}
