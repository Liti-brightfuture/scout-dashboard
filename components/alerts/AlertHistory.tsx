"use client";

import type { Alert } from "@/types/alerts";

export function AlertHistory({
  alerts,
  walletAddress,
  onRefresh,
}: {
  alerts: Alert[];
  walletAddress: string;
  onRefresh: () => Promise<void>;
}) {
  async function toggleAlert(alert: Alert) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: alert.id,
        walletAddress,
        enabled: !alert.enabled,
      }),
    });

    await onRefresh();
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-2xl border border-white/5 bg-black/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-white">{alert.tokenAddress}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {alert.condition} {alert.threshold}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {alert.status}
              </span>
              <button
                type="button"
                onClick={() => toggleAlert(alert)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white"
              >
                {alert.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
