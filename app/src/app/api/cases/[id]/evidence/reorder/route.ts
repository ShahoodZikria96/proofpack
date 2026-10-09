import { NextRequest, NextResponse } from "next/server";
import { reorderEvidence } from "@/lib/store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const orderedIds = Array.isArray(body.orderedIds) ? (body.orderedIds as string[]) : null;
  if (!orderedIds) return NextResponse.json({ error: "orderedIds required" }, { status: 400 });

  const ok = await reorderEvidence(id, orderedIds);
  if (!ok) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
