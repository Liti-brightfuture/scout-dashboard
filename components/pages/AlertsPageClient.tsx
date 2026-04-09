"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AlertBuilder } from "@/components/alerts/AlertBuilder";
import { AlertHistory } from "@/components/alerts/AlertHistory";
import { Panel } from "@/components/ui/Panel";
import { useAlertsStore } from "@/store/alertsStore";
import type { Alert, AlertEvaluation } from "@/types/alerts";

export function AlertsPageClient() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58() ?? null;
  const { alerts, setAlerts } = useAlertsStore();
  const [evaluations, setEvaluations] = useState<AlertEvaluation[]>([]);

  const refresh = useCallback(
    async (evaluate = false) => {
      if (!walletAddress) return;

      const response = await fetch(`/api/alerts?wallet=${walletAddress}&evaluate=${evaluate}`);
      const payload = (await response.json()) as {
        alerts: Alert[];
        evaluations: AlertEvaluation[];
      };
      setAlerts(payload.alerts);
      setEvaluations(payload.evaluations);

      payload.evaluations
        .filter((entry) => entry.matched)
        .forEach((entry) => toast.warning(entry.reason));
    },
    [setAlerts, walletAddress],
  );

  useEffect(() => {
    async function loadInitial() {
      await refresh(false);
    }

    void loadInitial();
  }, [refresh, walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;

    const interval = window.setInterval(() => {
      void refresh(true);
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [refresh, walletAddress]);

  return (
    <div className="space-y-6">
      <Panel>
        <h1 className="font-mono text-3xl text-white">Wallet-linked alerts</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
          Alerts are scoped to the connected wallet and re-evaluated while this page is open. No fake background worker is implied in this MVP.
        </p>
      </Panel>

      <Panel className="space-y-6">
        {walletAddress ? (
          <>
            <AlertBuilder walletAddress={walletAddress} onCreated={() => refresh(false)} />
            <AlertHistory alerts={alerts} walletAddress={walletAddress} onRefresh={() => refresh(false)} />
          </>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Connect a wallet to create persisted alerts.
          </p>
        )}
      </Panel>

      {evaluations.length > 0 && (
        <Panel>
          <h2 className="font-mono text-xl text-white">Latest evaluation</h2>
          <div className="mt-4 space-y-3">
            {evaluations.slice(0, 5).map((evaluation) => (
              <div key={evaluation.alert.id} className="rounded-2xl border border-white/5 bg-black/15 p-4">
                <p className="font-mono text-sm text-white">{evaluation.alert.tokenAddress}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{evaluation.reason}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
