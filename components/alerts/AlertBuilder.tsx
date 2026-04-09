"use client";

import { useState } from "react";

import type { AlertCondition } from "@/types/alerts";

export function AlertBuilder({
  walletAddress,
  onCreated,
}: {
  walletAddress: string;
  onCreated: () => Promise<void>;
}) {
  const [tokenAddress, setTokenAddress] = useState("");
  const [condition, setCondition] = useState<AlertCondition>("score_below");
  const [threshold, setThreshold] = useState("45");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await fetch("/api/alerts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        tokenAddress,
        condition,
        threshold: Number(threshold),
      }),
    });

    setTokenAddress("");
    await onCreated();
  }

  return (
    <form className="grid gap-4 lg:grid-cols-4" onSubmit={handleSubmit}>
      <input
        value={tokenAddress}
        onChange={(event) => setTokenAddress(event.target.value)}
        placeholder="Token mint address"
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--text-muted)] lg:col-span-2"
      />
      <select
        value={condition}
        onChange={(event) => setCondition(event.target.value as AlertCondition)}
        className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
      >
        <option value="score_below">Score below</option>
        <option value="liquidity_below">Liquidity below</option>
      </select>
      <div className="flex gap-3">
        <input
          value={threshold}
          onChange={(event) => setThreshold(event.target.value)}
          type="number"
          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        />
        <button
          type="submit"
          className="rounded-2xl bg-[var(--solana-purple)] px-4 py-3 text-sm font-semibold text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
}
