"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Panel } from "@/components/ui/Panel";
import { truncateAddress } from "@/lib/utils";
import type { GraphData, GraphNode } from "@/types/graph";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

export function WalletGraph({ graph }: { graph: GraphData }) {
  const [highlightClusters, setHighlightClusters] = useState(false);

  const filteredGraph = useMemo(
    () => ({
      nodes: graph.nodes.map((node) => ({
        ...node,
        color:
          highlightClusters && node.isClustered
            ? "#EF4444"
            : node.isClustered
              ? "#F59E0B"
              : node.color,
      })),
      links: graph.links,
    }),
    [graph, highlightClusters],
  );

  return (
    <Panel className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-mono text-xl text-white">Wallet relationship graph</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Early transfer adjacency and shared fee-payer clustering.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHighlightClusters((value) => !value)}
          className="rounded-full border border-[var(--border-active)] px-4 py-2 text-sm text-white transition hover:bg-[var(--border-active)]/10"
        >
          Detect clusters
        </button>
      </div>
      <div className="h-[420px] overflow-hidden rounded-3xl border border-white/5 bg-black/20">
        <ForceGraph2D
          graphData={filteredGraph}
          nodeLabel={(node) => {
            const typedNode = node as GraphNode;
            return `${truncateAddress(typedNode.id, 6)} | volume ${typedNode.volume.toFixed(2)}`;
          }}
          nodeAutoColorBy="id"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const typedNode = node as GraphNode & { x?: number; y?: number };
            const label = truncateAddress(typedNode.id, 4);
            const fontSize = 12 / globalScale;
            ctx.beginPath();
            ctx.arc(typedNode.x ?? 0, typedNode.y ?? 0, Math.max(4, typedNode.volume / 10 + 3), 0, 2 * Math.PI);
            ctx.fillStyle = typedNode.color;
            ctx.fill();
            ctx.font = `${fontSize}px monospace`;
            ctx.fillStyle = "#E2E8F0";
            ctx.fillText(label, (typedNode.x ?? 0) + 8, typedNode.y ?? 0);
          }}
          linkWidth={(link) => Math.max(1, Number(link.value) / 10)}
          cooldownTicks={80}
        />
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {graph.clusters.slice(0, 3).map((cluster) => (
          <div key={cluster.feePayer} className="rounded-2xl border border-white/5 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Cluster</p>
            <p className="mt-2 font-mono text-sm text-white">{truncateAddress(cluster.feePayer, 6)}</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {cluster.walletCount} related wallets
            </p>
            <Link
              href={`/wallet/${cluster.wallets[0]}`}
              className="mt-4 inline-flex text-sm text-[var(--solana-green)]"
            >
              Inspect wallet
            </Link>
          </div>
        ))}
      </div>
    </Panel>
  );
}
