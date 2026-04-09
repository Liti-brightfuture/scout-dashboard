import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RiskScoreCard } from "@/components/token/RiskScoreCard";

describe("RiskScoreCard", () => {
  it("renders score summary content", () => {
    render(
      <RiskScoreCard
        score={{
          total: 72,
          breakdown: [],
          riskLevel: "WARNING",
          summary: "Holder concentration and liquidity lock require closer review before trading.",
          analyzedAt: Date.now(),
          dataVersion: "hash",
        }}
      />,
    );

    expect(screen.getByText("Signal summary")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText(/Holder concentration/)).toBeInTheDocument();
  });
});
