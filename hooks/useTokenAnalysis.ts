"use client";

import { useEffect, useState } from "react";

import type { TokenAnalysis } from "@/types/token";

export function useTokenAnalysis(address: string) {
  const [data, setData] = useState<TokenAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setLoading(true);
        const response = await fetch(`/api/token/${address}`);
        if (!response.ok) {
          throw new Error("Failed to analyze token.");
        }

        const payload = (await response.json()) as TokenAnalysis;
        if (active) {
          setData(payload);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void run();
    return () => {
      active = false;
    };
  }, [address]);

  return { data, error, loading };
}
