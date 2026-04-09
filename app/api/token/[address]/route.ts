import { NextResponse } from "next/server";

import { analyzeToken } from "@/lib/scoring/engine";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const analysis = await analyzeToken(address);
    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to analyze token.",
      },
      { status: 500 },
    );
  }
}
