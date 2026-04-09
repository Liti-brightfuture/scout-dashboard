import { describe, expect, it } from "vitest";

import { runHolderConcentrationCheck } from "@/lib/scoring/checks/holderConcentration";

describe("Holder Concentration Check", () => {
  it("passes for healthy distribution", () => {
    const result = runHolderConcentrationCheck({
      top1: 4,
      top5: 18,
      top10: 29,
      distribution: [],
    });

    expect(result.passed).toBe(true);
    expect(result.score).toBe(0);
  });

  it("warns for moderate concentration", () => {
    const result = runHolderConcentrationCheck({
      top1: 24,
      top5: 40,
      top10: 55,
      distribution: [],
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBe(10);
  });

  it("fails for dangerous concentration", () => {
    const result = runHolderConcentrationCheck({
      top1: 38,
      top5: 62,
      top10: 88,
      distribution: [],
    });

    expect(result.passed).toBe(false);
    expect(result.score).toBe(20);
  });
});
