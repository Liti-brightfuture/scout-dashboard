import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluateAlert } from "@/lib/alerts/evaluate";
import { createAlert, listAlerts, updateAlert } from "@/lib/alerts/repository";

const createSchema = z.object({
  walletAddress: z.string().min(1),
  tokenAddress: z.string().min(1),
  condition: z.enum(["score_below", "liquidity_below"]),
  threshold: z.number().positive(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  walletAddress: z.string().min(1),
  enabled: z.boolean().optional(),
  evaluate: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const walletAddress = url.searchParams.get("wallet");
    const shouldEvaluate = url.searchParams.get("evaluate") === "true";

    if (!walletAddress) {
      return NextResponse.json({ message: "wallet query parameter is required." }, { status: 400 });
    }

    const alerts = await listAlerts(walletAddress);

    if (!shouldEvaluate) {
      return NextResponse.json({ alerts, evaluations: [] });
    }

    const evaluations = await Promise.all(alerts.map((alert) => evaluateAlert(alert)));
    return NextResponse.json({
      alerts: evaluations.map((evaluation) => evaluation.alert),
      evaluations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to fetch alerts.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = createSchema.parse(await request.json());
    const alert = await createAlert(payload);
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to create alert.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = patchSchema.parse(await request.json());
    let alert = await updateAlert({
      id: payload.id,
      walletAddress: payload.walletAddress,
      enabled: payload.enabled,
      status:
        payload.enabled === false
          ? "DISABLED"
          : payload.enabled === true
            ? "ACTIVE"
            : undefined,
    });

    if (payload.evaluate) {
      const evaluation = await evaluateAlert(alert);
      alert = evaluation.alert;
      return NextResponse.json({ alert, evaluation });
    }

    return NextResponse.json({ alert });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to update alert.",
      },
      { status: 400 },
    );
  }
}
