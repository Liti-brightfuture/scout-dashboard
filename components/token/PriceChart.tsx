"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Panel } from "@/components/ui/Panel";
import type { PriceCandle } from "@/types/token";

export function PriceChart({ candles }: { candles: PriceCandle[] }) {
  return (
    <Panel className="h-[340px]">
      <div className="mb-4">
        <h3 className="font-mono text-xl text-white">24h price structure</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          DexPaprika OHLCV data rendered as a fast directional chart.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={candles}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14F195" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#14F195" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value: number) =>
              new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
            stroke="#64748B"
          />
          <YAxis stroke="#64748B" />
          <Tooltip
            labelFormatter={(value) => new Date(Number(value ?? Date.now())).toLocaleString()}
            formatter={(value) => Number(value ?? 0).toFixed(6)}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#111118",
            }}
          />
          <Area
            dataKey="close"
            stroke="#14F195"
            strokeWidth={2}
            fill="url(#priceFill)"
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
}
