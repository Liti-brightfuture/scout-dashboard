import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult, TokenInfo } from "@/types/token";

const KNOWN_LOCK_ADDRESS_FRAGMENTS = ["burn", "lock", "raydium", "meteora"];

/**
 * Scores liquidity lock heuristics using pair metadata.
 *
 * @param token - Token metadata.
 * @returns Liquidity lock result.
 */
export function runLiquidityLockCheck(token: TokenInfo): CheckResult {
  const pair = token.pairAddress?.toLowerCase() ?? "";
  const matchedKnownLocker = KNOWN_LOCK_ADDRESS_FRAGMENTS.some((fragment) =>
    pair.includes(fragment),
  );

  let score = 5;
  let passed = true;
  let severity: CheckResult["severity"] = "INFO";
  let details = "Liquidity lock status is unknown with current heuristics.";

  if (matchedKnownLocker) {
    score = 0;
    details = "Pair metadata matches a known lock or burn heuristic.";
  } else if ((token.liquidityUsd ?? 0) < 1_000) {
    score = WEIGHTS.liquidityLock;
    passed = false;
    severity = "MEDIUM";
    details = "Liquidity is extremely low and no lock heuristic was detected.";
  }

  return {
    id: "liquidityLock",
    name: "Liquidity lock status",
    passed,
    severity,
    score,
    maxScore: WEIGHTS.liquidityLock,
    details,
    dataSource: "DexScreener",
    metadata: {
      liquidityUsd: token.liquidityUsd ?? null,
    },
  };
}
