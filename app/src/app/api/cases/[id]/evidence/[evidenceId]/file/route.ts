import { NextRequest, NextResponse } from "next/server";
import { getEvidenceFile } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  const { id, evidenceId } = await params;
  const result = await getEvidenceFile(id, evidenceId);
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": result.evidence.fileType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(result.evidence.originalName)}"`,
      "Cache-Control": "private, max-age=0, no-cache",
    },
  });
}
