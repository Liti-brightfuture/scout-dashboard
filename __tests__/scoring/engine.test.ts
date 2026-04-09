import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/solana/token", () => ({
  getTokenInfo: vi.fn(),
  getTokenHolders: vi.fn(),
}));

vi.mock("@/lib/api/dexpaprika", () => ({
  getDexPaprikaCandles: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/cache/upstash", () => ({
  readCache: vi.fn().mockResolvedValue(null),
  writeCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/scoring/checks/honeypot", () => ({
  runHoneypotCheck: vi.fn(),
}));

vi.mock("@/lib/scoring/checks/bundleDetection", () => ({
  runBundleDetectionCheck: vi.fn(),
}));

import { analyzeToken } from "@/lib/scoring/engine";
import { runBundleDetectionCheck } from "@/lib/scoring/checks/bundleDetection";
import { runHoneypotCheck } from "@/lib/scoring/checks/honeypot";
import { getTokenHolders, getTokenInfo } from "@/lib/solana/token";

describe("Scoring Engine", () => {
  it("returns max score 45 when mint authority is not revoked", async () => {
    vi.mocked(getTokenInfo).mockResolvedValue({
      address: "mint",
      symbol: "TEST",
      name: "Token",
      decimals: 6,
      supply: 1_000_000,
      mintAuthority: "creator",
      freezeAuthority: null,
      liquidityUsd: 100_000,
      marketCapUsd: 200_000,
      volume24hUsd: 50_000,
      priceUsd: 1,
      pairAddress: "pair",
      pairCreatedAt: Date.now(),
    });
    vi.mocked(getTokenHolders).mockResolvedValue({
      top1: 5,
      top5: 12,
      top10: 20,
      distribution: [],
    });
    vi.mocked(runHoneypotCheck).mockResolvedValue({
      id: "honeypotSimulation",
      name: "Honeypot simulation",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: 20,
      details: "OK",
      dataSource: "Jupiter",
    });
    vi.mocked(runBundleDetectionCheck).mockResolvedValue({
      id: "bundleDetection",
      name: "Bundle detection",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: 5,
      details: "OK",
      dataSource: "Helius",
    });

    const result = await analyzeToken("mint");
    expect(result.score.total).toBe(45);
  });

  it("correctly penalizes concentrated holders", async () => {
    vi.mocked(getTokenInfo).mockResolvedValue({
      address: "mint",
      symbol: "TEST",
      name: "Token",
      decimals: 6,
      supply: 1_000_000,
      mintAuthority: null,
      freezeAuthority: null,
      liquidityUsd: 100_000,
      marketCapUsd: 200_000,
      volume24hUsd: 50_000,
      priceUsd: 1,
      pairAddress: "pair",
      pairCreatedAt: Date.now(),
    });
    vi.mocked(getTokenHolders).mockResolvedValue({
      top1: 42,
      top5: 58,
      top10: 82,
      distribution: [],
    });
    vi.mocked(runHoneypotCheck).mockResolvedValue({
      id: "honeypotSimulation",
      name: "Honeypot simulation",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: 20,
      details: "OK",
      dataSource: "Jupiter",
    });
    vi.mocked(runBundleDetectionCheck).mockResolvedValue({
      id: "bundleDetection",
      name: "Bundle detection",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: 5,
      details: "OK",
      dataSource: "Helius",
    });

    const result = await analyzeToken("mint");
    const concentration = result.score.breakdown.find((entry) => entry.id === "holderConcentration");
    expect(concentration?.score).toBe(20);
    expect(result.score.total).toBe(75);
  });

  it("handles upstream quote failure without crashing", async () => {
    vi.mocked(getTokenInfo).mockResolvedValue({
      address: "mint",
      symbol: "TEST",
      name: "Token",
      decimals: 6,
      supply: 1_000_000,
      mintAuthority: null,
      freezeAuthority: null,
      liquidityUsd: 100_000,
      marketCapUsd: 200_000,
      volume24hUsd: 50_000,
      priceUsd: 1,
      pairAddress: "pair",
      pairCreatedAt: Date.now(),
    });
    vi.mocked(getTokenHolders).mockResolvedValue({
      top1: 5,
      top5: 15,
      top10: 25,
      distribution: [],
    });
    vi.mocked(runHoneypotCheck).mockResolvedValue({
      id: "honeypotSimulation",
      name: "Honeypot simulation",
      passed: false,
      severity: "HIGH",
      score: 20,
      maxScore: 20,
      details: "Jupiter failure",
      dataSource: "Jupiter",
    });
    vi.mocked(runBundleDetectionCheck).mockResolvedValue({
      id: "bundleDetection",
      name: "Bundle detection",
      passed: true,
      severity: "INFO",
      score: 0,
      maxScore: 5,
      details: "OK",
      dataSource: "Helius",
    });

    const result = await analyzeToken("mint");
    expect(result.score.total).toBe(75);
    expect(result.score.summary).toContain("Honeypot simulation");
  });
});
