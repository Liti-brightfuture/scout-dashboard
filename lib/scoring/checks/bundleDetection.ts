import { getEnhancedTransactions } from "@/lib/api/helius";
import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult, TokenInfo } from "@/types/token";

const WINDOW_MS = 30 * 60 * 1000;
const UNKNOWN_SCORE = 2;

function normalizeTimestamp(value: number): number {
  return value > 1_000_000_000_000 ? value : value * 1000;
}

/**
 * Detects suspicious early transaction clusters using fee payer reuse.
 *
 * @param token - Token mint metadata.
 * @returns Bundle detection result.
 */
export async function runBundleDetectionCheck(token: TokenInfo): Promise<CheckResult> {
  if (!token.pairCreatedAt) {
    return {
      id: "bundleDetection",
      name: "Bundle detection",
      passed: true,
      severity: "INFO",
      score: UNKNOWN_SCORE,
      maxScore: WEIGHTS.bundleDetection,
      details: "Pool creation time unavailable, so bundle detection is marked as unknown.",
      dataSource: "Helius Enhanced Transactions + DexScreener",
      metadata: {
        state: "UNKNOWN",
      },
    };
  }

  const startMs = normalizeTimestamp(token.pairCreatedAt);
  const endMs = startMs + WINDOW_MS;
  const transactions = await getEnhancedTransactions(token.address, 100);
  const earlyTransactions = transactions.filter((tx) => {
    const timestamp = normalizeTimestamp(tx.timestamp);
    return timestamp >= startMs && timestamp <= endMs;
  });

  if (earlyTransactions.length === 0) {
    return {
      id: "bundleDetection",
      name: "Bundle detection",
      passed: true,
      severity: "INFO",
      score: UNKNOWN_SCORE,
      maxScore: WEIGHTS.bundleDetection,
      details:
        "No transaction sample was available inside the first 30 minutes after pool creation, so bundle detection is marked as unknown.",
      dataSource: "Helius Enhanced Transactions + DexScreener",
      metadata: {
        state: "UNKNOWN",
      },
    };
  }

  const walletsByFeePayer = new Map<string, Set<string>>();

  for (const tx of earlyTransactions) {
    const holders = tx.tokenTransfers?.flatMap((transfer) =>
      [transfer.fromUserAccount, transfer.toUserAccount].filter(Boolean) as string[],
    ) ?? [];

    const current = walletsByFeePayer.get(tx.feePayer) ?? new Set<string>();
    holders.forEach((holder) => current.add(holder));
    walletsByFeePayer.set(tx.feePayer, current);
  }

  const suspicious = Array.from(walletsByFeePayer.entries()).find(
    ([, wallets]) => wallets.size >= 3,
  );

  return {
    id: "bundleDetection",
    name: "Bundle detection",
    passed: !suspicious,
    severity: suspicious ? "MEDIUM" : "INFO",
    score: suspicious ? WEIGHTS.bundleDetection : 0,
    maxScore: WEIGHTS.bundleDetection,
    details: suspicious
      ? `Shared fee payer ${suspicious[0]} appears across ${suspicious[1].size} wallets during the first 30 minutes after pool creation.`
      : "No suspicious fee-payer clusters detected during the first 30 minutes after pool creation.",
    dataSource: "Helius Enhanced Transactions + DexScreener",
    metadata: {
      suspiciousFeePayer: suspicious?.[0] ?? null,
      clusteredWalletCount: suspicious?.[1].size ?? 0,
      sampledTransactions: earlyTransactions.length,
      state: "EVALUATED",
    },
  };
}
