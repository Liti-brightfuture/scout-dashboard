"use client";

import { useEffect, useState } from "react";

import type { WalletData } from "@/types/wallet";

export function useWalletData(address: string | null) {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      return;
    }

    let active = true;

    async function run() {
      setLoading(true);
      const response = await fetch(`/api/wallet/${address}`);
      const payload = (await response.json()) as WalletData;

      if (active) {
        setData(payload);
        setLoading(false);
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [address]);

  return { data: address ? data : null, loading: address ? loading : false };
}
