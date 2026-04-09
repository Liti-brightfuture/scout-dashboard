"use client";

import { useEffect } from "react";

import { Panel } from "@/components/ui/Panel";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Panel>
      <h1 className="font-mono text-3xl text-white">Module error</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[var(--solana-purple)] px-4 py-2 text-sm text-white"
      >
        Retry
      </button>
    </Panel>
  );
}
