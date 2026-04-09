import { analyzeToken } from "@/lib/scoring/engine";

const TOKENS = [
  { label: "GENZ", mint: "6EGYXQAVXkaQJurhhq1M5MJzjXpguhEG6CN35sA3qJg" },
  { label: "LOL", mint: "34q2KmCvapecJgR6ZrtbCTrzZVtkt3a5mHEA3TuEsWYb" },
  { label: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

async function main() {
  for (const token of TOKENS) {
    const result = await analyzeToken(token.mint);
    const honeypot = result.score.breakdown.find(
      (check) => check.id === "honeypotSimulation",
    );
    const bundle = result.score.breakdown.find((check) => check.id === "bundleDetection");

    console.log(
      JSON.stringify(
        {
          token: token.label,
          mint: token.mint,
          score: result.score.total,
          riskLevel: result.score.riskLevel,
          summary: result.score.summary,
          pairCreatedAt: result.token.pairCreatedAt,
          mintAuthority: result.token.mintAuthority,
          freezeAuthority: result.token.freezeAuthority,
          top1: result.holderSnapshot.top1,
          top10: result.holderSnapshot.top10,
          liquidityUsd: result.token.liquidityUsd,
          marketCapUsd: result.token.marketCapUsd,
          honeypot,
          bundle,
        },
        null,
        2,
      ),
    );
  }
}

void main();
