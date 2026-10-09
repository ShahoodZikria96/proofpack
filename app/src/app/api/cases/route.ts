import { NextRequest, NextResponse } from "next/server";
import { createCase, listCases } from "@/lib/store";
import { DISPUTE_TYPES, type DisputeType } from "@/lib/types";

export async function GET() {
  const cases = await listCases();
  return NextResponse.json({ cases });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const type = body.type as DisputeType;
  const validType = DISPUTE_TYPES.some((d) => d.value === type);
  if (!validType) {
    return NextResponse.json({ error: "Invalid dispute type" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title : "";
  const currency = typeof body.currency === "string" && body.currency.trim() ? body.currency.trim().toUpperCase() : "USD";
  const transactionAmount =
    typeof body.transactionAmount === "number" && Number.isFinite(body.transactionAmount)
      ? body.transactionAmount
      : null;

  const created = await createCase({ type, title, currency, transactionAmount });
  return NextResponse.json({ case: created }, { status: 201 });
}
