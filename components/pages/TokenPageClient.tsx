"use client";

import { HolderDistribution } from "@/components/token/HolderDistribution";
import { PriceChart } from "@/components/token/PriceChart";
import { RiskChecklist } from "@/components/token/RiskChecklist";
import { RiskScoreCard } from "@/components/token/RiskScoreCard";
import { TokenMetadata } from "@/components/token/TokenMetadata";
import { Panel } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTokenAnalysis } from "@/hooks/useTokenAnalysis";

export function TokenPageClient({ address }: { address: string }) {
  const { data, error, loading } = useTokenAnalysis(address);

  if (loading) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Panel>
        <h1 className="font-mono text-2xl text-white">Token analysis unavailable</h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          {error ?? "No analysis data returned."}
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <RiskScoreCard score={data.score} />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RiskChecklist checks={data.score.breakdown} />
        <TokenMetadata token={data.token} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <HolderDistribution distribution={data.holderSnapshot.distribution} />
        <PriceChart candles={data.priceCandles} />
      </div>
    </div>
  );
}
