"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";

import { Panel } from "@/components/ui/Panel";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWalletData } from "@/hooks/useWalletTokens";
import { truncateAddress } from "@/lib/utils";

export function HomePageClient() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const [tokenAddress, setTokenAddress] = useState("");
  const walletAddress = publicKey?.toBase58() ?? null;
  const { data, loading } = useWalletData(walletAddress);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (tokenAddress.trim().length < 32) {
      return;
    }

    router.push(`/token/${tokenAddress.trim()}`);
  }

  return (
    <div className="space-y-8">
      <Panel className="overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Sparkles className="h-4 w-4 text-[var(--solana-green)]" aria-hidden="true" />
              Recruiter-grade Solana intelligence
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-mono text-4xl font-bold leading-tight text-white md:text-6xl">
                Catch token risk before the chart tells the story.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
                Scout scores Solana tokens with six automated checks, shows why the score moved, and maps suspicious early-wallet relationships in one live dashboard.
              </p>
            </div>
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">
                <Search className="h-4 w-4 text-[var(--solana-green)]" aria-hidden="true" />
                <input
                  value={tokenAddress}
                  onChange={(event) => setTokenAddress(event.target.value)}
                  placeholder="Paste any Solana token mint"
                  aria-label="Token address"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--text-muted)]"
                />
              </label>
              <button
                type="submit"
                className="rounded-3xl bg-[linear-gradient(135deg,var(--solana-purple),var(--solana-green))] px-6 py-3 font-semibold text-black"
              >
                Analyze token
              </button>
            </form>
          </div>
          <div className="grid gap-4">
            {[
              ["Authority risk", "Hard-capped score when mint or freeze authority remains active."],
              ["Holder structure", "Surface top-holder concentration before it becomes exit liquidity."],
              ["Live graph", "Trace wallet clusters, fee-payer reuse, and early suspicious flows."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-3xl border border-white/5 bg-black/15 p-5">
                <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--solana-green)]">
                  {title}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-2xl text-white">Connected wallet holdings</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {connected && walletAddress
                  ? `Live balances for ${truncateAddress(walletAddress, 6)}`
                  : "Connect Phantom or Solflare to see your current wallet surface."}
              </p>
            </div>
          </div>
          {!connected && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/15 p-8 text-sm leading-7 text-[var(--text-secondary)]">
              Wallet-linked mode powers portfolio scanning and alerts. Connect a wallet from the top right to load holdings.
            </div>
          )}
          {connected && loading && (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {connected && data && (
            <div className="space-y-3">
              {data.tokens.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-black/15 p-6 text-sm text-[var(--text-secondary)]">
                  No SPL token balances were returned for this wallet snapshot.
                </div>
              )}
              {data.tokens.map((token) => (
                <Link
                  key={token.address}
                  href={`/token/${token.address}`}
                  className="flex items-center justify-between rounded-3xl border border-white/5 bg-black/15 p-4 transition hover:border-[var(--border-active)]"
                >
                  <div>
                    <p className="font-mono text-sm text-white">{token.symbol}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{token.amount.toLocaleString()} units</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-white">
                      {token.valueUsd ? `$${token.valueUsd.toFixed(2)}` : "No price"}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      {token.riskLevel}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel>
          <h2 className="font-mono text-2xl text-white">Build order status</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Module 1", "Wallet connect and lookup", "Live"],
              ["Module 2", "Token analyzer", "Live"],
              ["Module 3", "Wallet graph", "Live"],
              ["Module 4", "Wallet-linked alerts", "Live"],
            ].map(([step, label, status]) => (
              <div key={step} className="rounded-3xl border border-white/5 bg-black/15 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-sm text-white">{step}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-[var(--solana-green)]">
                    {status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{label}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
