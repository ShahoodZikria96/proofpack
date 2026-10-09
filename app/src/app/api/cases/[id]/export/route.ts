import { NextRequest, NextResponse } from "next/server";
import { buildExportPdf } from "@/lib/pdf/buildExport";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pdfBuffer = await buildExportPdf(id);
  if (!pdfBuffer) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proofpack-evidence-pack.pdf"`,
    },
  });
}
