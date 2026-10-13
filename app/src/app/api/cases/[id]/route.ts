import { NextRequest, NextResponse } from "next/server";
import { getCaseWithDetails, updateCase } from "@/lib/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getCaseWithDetails(id);
  if (!details) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json(details);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.type === "string") patch.type = body.type;
  if (typeof body.merchantName === "string") patch.merchantName = body.merchantName.trim();
  if (typeof body.country === "string") patch.country = body.country.trim();
  if (typeof body.currency === "string") patch.currency = body.currency.toUpperCase();
  if (body.transactionAmount === null || typeof body.transactionAmount === "number") {
    patch.transactionAmount = body.transactionAmount;
  }
  if (typeof body.status === "string") patch.status = body.status;

  const updated = await updateCase(id, patch);
  if (!updated) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ case: updated });
}
