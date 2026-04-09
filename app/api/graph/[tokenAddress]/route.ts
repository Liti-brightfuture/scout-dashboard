import { NextResponse } from "next/server";

import { buildGraphData } from "@/lib/graph/buildGraph";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ tokenAddress: string }> },
) {
  try {
    const { tokenAddress } = await params;
    const graph = await buildGraphData(tokenAddress);
    return NextResponse.json(graph);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to build graph.",
      },
      { status: 500 },
    );
  }
}
