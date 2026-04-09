import { NextResponse } from "next/server";

import { getWalletData } from "@/lib/solana/wallet";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const { address } = await params;
    const wallet = await getWalletData(address);
    return NextResponse.json(wallet);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch wallet.",
      },
      { status: 500 },
    );
  }
}
