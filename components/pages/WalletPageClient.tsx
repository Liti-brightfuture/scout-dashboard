"use client";

import { useEffect, useState } from "react";

import { WalletGraph } from "@/components/graph/WalletGraph";
import { Panel } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/Skeleton";
import type { GraphData } from "@/types/graph";
import type { WalletData } from "@/types/wallet";

export function WalletPageClient({ address }: { address: string }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);

  useEffect(() => {
    async function run() {
      const [walletResponse, graphResponse] = await Promise.all([
        fetch(`/api/wallet/${address}`),
        fetch(`/api/graph/${address}`),
      ]);

      setWallet((await walletResponse.json()) as WalletData);
      setGraph((await graphResponse.json()) as GraphData);
    }

    void run();
  }, [address]);

  if (!wallet || !graph) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[480px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <h1 className="font-mono text-3xl text-white">Wallet intelligence</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          Recent wallet balances and transaction context for {wallet.address}.
        </p>
      </Panel>
      <WalletGraph graph={graph} />
    </div>
  );
}
