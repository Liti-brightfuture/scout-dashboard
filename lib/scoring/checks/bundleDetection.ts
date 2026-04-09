import { getEnhancedTransactions } from "@/lib/api/helius";
import { WEIGHTS } from "@/lib/scoring/weights";
import type { CheckResult } from "@/types/token";

/**
 * Detects suspicious early transaction clusters using fee payer reuse.
 *
 * @param tokenAddress - Token mint address.
 * @returns Bundle detection result.
 */
export async function runBundleDetectionCheck(tokenAddress: string): Promise<CheckResult> {
  const transactions = await getEnhancedTransactions(tokenAddress, 50);
  const walletsByFeePayer = new Map<string, Set<string>>();

  for (const tx of transactions) {
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
      ? `Shared fee payer ${suspicious[0]} appears across ${suspicious[1].size} wallets in the early transaction set.`
      : "No suspicious fee-payer clusters detected in the sampled transactions.",
    dataSource: "Helius Enhanced Transactions",
    metadata: {
      suspiciousFeePayer: suspicious?.[0] ?? null,
      clusteredWalletCount: suspicious?.[1].size ?? 0,
    },
  };
}
