import { NextRequest, NextResponse } from "next/server";
import { deleteEvidence, updateEvidence } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  const { id, evidenceId } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.exhibitLabel === "string") patch.exhibitLabel = body.exhibitLabel;
  if (typeof body.caption === "string") patch.caption = body.caption;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;
  if (typeof body.include === "boolean") patch.include = body.include;

  const updated = await updateEvidence(id, evidenceId, patch);
  if (!updated) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  return NextResponse.json({ evidence: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  const { id, evidenceId } = await params;
  const ok = await deleteEvidence(id, evidenceId);
  if (!ok) return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
