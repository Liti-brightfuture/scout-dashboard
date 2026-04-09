import { createHash } from "node:crypto";

import { getDexPaprikaCandles } from "@/lib/api/dexpaprika";
import { readCache, writeCache } from "@/lib/cache/upstash";
import { runBundleDetectionCheck } from "@/lib/scoring/checks/bundleDetection";
import { runFreezeAuthorityCheck } from "@/lib/scoring/checks/freezeAuthority";
import { runHolderConcentrationCheck } from "@/lib/scoring/checks/holderConcentration";
import { runHoneypotCheck } from "@/lib/scoring/checks/honeypot";
import { runLiquidityLockCheck } from "@/lib/scoring/checks/liquidityLock";
import { runMintAuthorityCheck } from "@/lib/scoring/checks/mintAuthority";
import { getTokenHolders, getTokenInfo } from "@/lib/solana/token";
import { riskFromScore, timestampBucket } from "@/lib/utils";
import type { CheckResult, ScoreResult, TokenAnalysis } from "@/types/token";

const SCORE_TTL_SECONDS = 120;

function buildSummary(checks: CheckResult[]): string {
  const failing = checks.filter((check) => !check.passed);
  if (failing.length === 0) {
    return "No critical risk signals were detected in the current snapshot.";
  }

  return failing
    .slice(0, 2)
    .map((check) => check.name)
    .join(" and ")
    .concat(" require closer review before trading.");
}

/**
 * Runs the full token analysis pipeline and caches the result.
 *
 * @param tokenAddress - Solana mint address.
 * @returns Consolidated token analysis payload.
 */
export async function analyzeToken(tokenAddress: string): Promise<TokenAnalysis> {
  const cacheKey = `scout:analysis:${tokenAddress}:${timestampBucket(SCORE_TTL_SECONDS)}`;
  const cached = await readCache<TokenAnalysis>(cacheKey);
  if (cached) {
    return cached;
  }

  const token = await getTokenInfo(tokenAddress);
  const holderSnapshot = await getTokenHolders(tokenAddress);

  const [honeypotCheck, bundleCheck] = await Promise.all([
    runHoneypotCheck(token),
    runBundleDetectionCheck(tokenAddress),
  ]);

  const checks: CheckResult[] = [
    runMintAuthorityCheck(token),
    runFreezeAuthorityCheck(token),
    runHolderConcentrationCheck(holderSnapshot),
    honeypotCheck,
    runLiquidityLockCheck(token),
    bundleCheck,
  ];

  const penalties = checks.reduce((sum, check) => sum + check.score, 0);
  const hasAuthorityFailure = checks.some(
    (check) =>
      (check.id === "mintAuthority" || check.id === "freezeAuthority") && !check.passed,
  );
  const rawScore = Math.max(0, 100 - penalties);
  const total = hasAuthorityFailure ? Math.min(rawScore, 45) : rawScore;

  const score: ScoreResult = {
    total,
    breakdown: checks,
    riskLevel: riskFromScore(total),
    summary: buildSummary(checks),
    analyzedAt: Date.now(),
    dataVersion: createHash("sha1")
      .update(JSON.stringify({ token, holderSnapshot, checks }))
      .digest("hex"),
  };

  const priceCandles = token.pairAddress
    ? await getDexPaprikaCandles(token.pairAddress).catch(() => [])
    : [];

  const result: TokenAnalysis = {
    token,
    holderSnapshot,
    priceCandles,
    score,
  };

  await writeCache(cacheKey, result, SCORE_TTL_SECONDS);
  return result;
}
