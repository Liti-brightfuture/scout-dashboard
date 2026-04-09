"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Panel } from "@/components/ui/Panel";
import type { HolderBucket } from "@/types/token";

const COLORS = ["#9945FF", "#14F195", "#F59E0B", "#EF4444", "#3B82F6", "#334155"];

export function HolderDistribution({ distribution }: { distribution: HolderBucket[] }) {
  return (
    <Panel className="h-[340px]">
      <div className="mb-4">
        <h3 className="font-mono text-xl text-white">Holder distribution</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Largest holder buckets versus the rest of supply.
        </p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={distribution} dataKey="percentage" innerRadius={70} outerRadius={110}>
            {distribution.map((entry, index) => (
              <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${Number(value ?? 0).toFixed(2)}%`}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "#111118",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}
