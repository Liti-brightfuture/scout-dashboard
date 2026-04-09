import { Panel } from "@/components/ui/Panel";
import { truncateAddress } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";

export function TokenMetadata({ token }: { token: TokenInfo }) {
  const stats = [
    ["Token", token.name],
    ["Symbol", token.symbol],
    ["Address", truncateAddress(token.address, 6)],
    ["Supply", token.supply.toLocaleString()],
    ["Price", token.priceUsd ? `$${token.priceUsd.toFixed(6)}` : "Unavailable"],
    ["Liquidity", token.liquidityUsd ? `$${token.liquidityUsd.toLocaleString()}` : "Unavailable"],
    ["Market cap", token.marketCapUsd ? `$${token.marketCapUsd.toLocaleString()}` : "Unavailable"],
  ];

  return (
    <Panel>
      <h3 className="font-mono text-xl text-white">Token metadata</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/5 bg-black/15 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">{label}</p>
            <p className="mt-2 font-mono text-sm text-white">{value}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
