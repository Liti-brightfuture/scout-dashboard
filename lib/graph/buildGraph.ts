import { getEnhancedTransactions } from "@/lib/api/helius";
import type { GraphCluster, GraphData, GraphLink, GraphNode } from "@/types/graph";

/**
 * Builds wallet relationship graph data for a token from enhanced transactions.
 *
 * @param tokenAddress - Target token mint.
 * @returns Graph payload for the wallet graph UI.
 */
export async function buildGraphData(tokenAddress: string): Promise<GraphData> {
  const transactions = await getEnhancedTransactions(tokenAddress, 100);
  const nodeMap = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const clustersByFeePayer = new Map<string, Set<string>>();

  for (const tx of transactions) {
    for (const transfer of tx.tokenTransfers ?? []) {
      const source = transfer.fromUserAccount;
      const target = transfer.toUserAccount;

      if (!source || !target || source === target) {
        continue;
      }

      const value = transfer.tokenAmount ?? 0;
      const sourceNode = nodeMap.get(source) ?? {
        id: source,
        label: source,
        volume: 0,
        transactionCount: 0,
        color: "#14F195",
        feePayer: tx.feePayer,
      };
      const targetNode = nodeMap.get(target) ?? {
        id: target,
        label: target,
        volume: 0,
        transactionCount: 0,
        color: "#14F195",
        feePayer: tx.feePayer,
      };

      sourceNode.volume += value;
      targetNode.volume += value;
      sourceNode.transactionCount += 1;
      targetNode.transactionCount += 1;

      nodeMap.set(source, sourceNode);
      nodeMap.set(target, targetNode);
      links.push({
        source,
        target,
        value,
        slot: tx.slot,
      });

      const cluster = clustersByFeePayer.get(tx.feePayer) ?? new Set<string>();
      cluster.add(source);
      cluster.add(target);
      clustersByFeePayer.set(tx.feePayer, cluster);
    }
  }

  const clusters: GraphCluster[] = Array.from(clustersByFeePayer.entries())
    .filter(([, wallets]) => wallets.size >= 3)
    .map(([feePayer, wallets]) => ({
      feePayer,
      walletCount: wallets.size,
      wallets: Array.from(wallets),
    }));

  for (const cluster of clusters) {
    for (const wallet of cluster.wallets) {
      const node = nodeMap.get(wallet);
      if (node) {
        node.isClustered = true;
        node.color = "#EF4444";
      }
    }
  }

  return {
    tokenAddress,
    nodes: Array.from(nodeMap.values()),
    links,
    clusters,
    generatedAt: Date.now(),
  };
}
