import { NextRequest, NextResponse } from "next/server";
import { deleteTimelineEvent, updateTimelineEvent } from "@/lib/store";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const { id, eventId } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (typeof body.date === "string") patch.date = body.date;
  if (typeof body.title === "string") patch.title = body.title;
  if (typeof body.description === "string") patch.description = body.description;
  if (Array.isArray(body.evidenceIds)) patch.evidenceIds = body.evidenceIds;
  if (typeof body.sortOrder === "number") patch.sortOrder = body.sortOrder;

  const updated = await updateTimelineEvent(id, eventId, patch);
  if (!updated) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ event: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const { id, eventId } = await params;
  const ok = await deleteTimelineEvent(id, eventId);
  if (!ok) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
