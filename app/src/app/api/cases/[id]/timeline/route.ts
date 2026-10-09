import { NextRequest, NextResponse } from "next/server";
import { addTimelineEvent } from "@/lib/store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const date = typeof body.date === "string" ? body.date : "";
  const title = typeof body.title === "string" ? body.title : "";
  if (!date || !title) {
    return NextResponse.json({ error: "date and title are required" }, { status: 400 });
  }
  const description = typeof body.description === "string" ? body.description : "";
  const evidenceIds = Array.isArray(body.evidenceIds) ? (body.evidenceIds as string[]) : [];

  const event = await addTimelineEvent(id, { date, title, description, evidenceIds });
  if (!event) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json({ event }, { status: 201 });
}
