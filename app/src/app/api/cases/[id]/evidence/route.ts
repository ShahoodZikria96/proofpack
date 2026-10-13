import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { addEvidence } from "@/lib/store";

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-120);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const created = [];
  const skipped: string[] = [];

  for (const file of files) {
    if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_BYTES) {
      skipped.push(file.name);
      continue;
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = `${randomUUID()}-${sanitizeName(file.name)}`;
    const evidence = await addEvidence(id, {
      fileName,
      originalName: file.name,
      fileType: file.type,
      buffer,
    });
    if (!evidence) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }
    created.push(evidence);
  }

  return NextResponse.json({ evidence: created, skipped }, { status: 201 });
}
