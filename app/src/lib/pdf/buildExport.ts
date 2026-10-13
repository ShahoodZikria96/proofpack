import { PDFDocument, PageSizes, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCaseWithDetails, getEvidenceFile } from "@/lib/store";
import { updateCase } from "@/lib/store";
import type { Evidence } from "@/lib/types";
import { FrontMatter } from "./FrontMatter";

const NAVY = rgb(15 / 255, 23 / 255, 42 / 255);
const SLATE = rgb(71 / 255, 85 / 255, 105 / 255);
const LIGHT = rgb(148 / 255, 163 / 255, 177 / 255);

const [PAGE_W, PAGE_H] = PageSizes.A4;
const MARGIN = 48;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawHeader(page: PDFPage, font: PDFFont, boldFont: PDFFont, label: string, originalName: string, caption: string) {
  let y = PAGE_H - MARGIN;
  page.drawText(`Exhibit ${label}`, { x: MARGIN, y, size: 16, font: boldFont, color: NAVY });
  y -= 20;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1.5,
    color: NAVY,
  });
  y -= 18;
  page.drawText(originalName, { x: MARGIN, y, size: 10, font, color: SLATE });
  y -= 16;

  if (caption) {
    const lines = wrapText(caption, font, 10.5, PAGE_W - MARGIN * 2);
    for (const line of lines.slice(0, 4)) {
      page.drawText(line, { x: MARGIN, y, size: 10.5, font, color: rgb(30 / 255, 41 / 255, 59 / 255) });
      y -= 14;
    }
  }
  return y - 10;
}

async function addImageExhibitPage(
  pdfDoc: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  evidence: Evidence,
  buffer: Buffer
) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const contentTop = drawHeader(page, font, boldFont, evidence.exhibitLabel, evidence.originalName, evidence.caption);

  try {
    const image =
      evidence.fileType === "image/png" ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);
    const maxWidth = PAGE_W - MARGIN * 2;
    const maxHeight = contentTop - MARGIN;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const w = image.width * scale;
    const h = image.height * scale;
    page.drawImage(image, {
      x: MARGIN + (maxWidth - w) / 2,
      y: contentTop - maxHeight + (maxHeight - h) / 2,
      width: w,
      height: h,
    });
  } catch {
    page.drawText("Image preview could not be generated for this file.", {
      x: MARGIN,
      y: contentTop - 20,
      size: 10,
      font,
      color: LIGHT,
    });
  }
}

async function addUnsupportedPreviewPage(
  pdfDoc: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  evidence: Evidence,
  reason = "Preview not available for this file type in the exported PDF."
) {
  const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  const contentTop = drawHeader(page, font, boldFont, evidence.exhibitLabel, evidence.originalName, evidence.caption);
  page.drawText(reason, { x: MARGIN, y: contentTop - 20, size: 10, font, color: LIGHT });
  page.drawText("The original file is retained with the case record.", {
    x: MARGIN,
    y: contentTop - 36,
    size: 10,
    font,
    color: LIGHT,
  });
}

const BAND_BG = rgb(241 / 255, 245 / 255, 249 / 255);

/**
 * Labels a copied page from an original evidence PDF without spending a whole
 * extra page on it. A prior version inserted a full blank "divider" page
 * before every PDF exhibit's content - here, a compact band (first page) or
 * corner tag (following pages) is stamped directly onto the real content.
 */
function stampExhibitBand(page: PDFPage, font: PDFFont, boldFont: PDFFont, label: string, originalName: string) {
  const { width, height } = page.getSize();
  const bandHeight = 22;
  page.drawRectangle({ x: 0, y: height - bandHeight, width, height: bandHeight, color: BAND_BG, opacity: 0.94 });
  const text = `Exhibit ${label} — ${originalName}`;
  const size = Math.min(9.5, (width - 16) / (boldFont.widthOfTextAtSize(text, 9.5) / 9.5));
  page.drawText(text, { x: 8, y: height - bandHeight + 6, size, font: boldFont, color: NAVY });
}

function stampExhibitCorner(page: PDFPage, boldFont: PDFFont, label: string) {
  const { width, height } = page.getSize();
  const text = `Exhibit ${label}`;
  const size = 8;
  const textWidth = boldFont.widthOfTextAtSize(text, size);
  const padding = 5;
  const tagWidth = textWidth + padding * 2;
  const tagHeight = 14;
  const x = Math.max(2, width - tagWidth - 6);
  const y = Math.max(2, height - tagHeight - 6);
  page.drawRectangle({ x, y, width: tagWidth, height: tagHeight, color: BAND_BG, opacity: 0.9 });
  page.drawText(text, { x: x + padding, y: y + 3.5, size, font: boldFont, color: NAVY });
}

function stampFooters(pages: PDFPage[], font: PDFFont) {
  const total = pages.length;
  const brandLabel = "ProofPack Evidence Pack";
  pages.forEach((page, index) => {
    const { width } = page.getSize();
    const label = `Page ${index + 1} of ${total}`;
    const size = 8.5;
    const labelWidth = font.widthOfTextAtSize(label, size);
    const brandWidth = font.widthOfTextAtSize(brandLabel, size);

    // Copied pages from an original evidence PDF can be far narrower than A4
    // (e.g. a thermal receipt or mobile screenshot export). Skip the brand
    // label rather than let it collide with the page-number stamp.
    const fitsBoth = MARGIN + brandWidth + 16 + labelWidth + MARGIN <= width;

    const labelX = Math.max(MARGIN, width - MARGIN - labelWidth);
    page.drawText(label, { x: labelX, y: 28, size, font, color: LIGHT });
    if (fitsBoth) {
      page.drawText(brandLabel, { x: MARGIN, y: 28, size, font, color: LIGHT });
    }
  });
}

export async function buildExportPdf(caseId: string): Promise<Buffer | null> {
  const details = await getCaseWithDetails(caseId);
  if (!details) return null;

  const included = details.evidence.filter((e) => e.include);

  const frontMatterBytes = await renderToBuffer(
    FrontMatter({ caseData: details.case, evidence: details.evidence, timeline: details.timeline })
  );

  const pdfDoc = await PDFDocument.load(frontMatterBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (const evidence of included) {
    const file = await getEvidenceFile(caseId, evidence.id);
    if (!file) continue;

    if (evidence.fileType === "image/jpeg" || evidence.fileType === "image/png") {
      await addImageExhibitPage(pdfDoc, font, boldFont, evidence, file.buffer);
    } else if (evidence.fileType === "application/pdf") {
      try {
        const srcDoc = await PDFDocument.load(file.buffer, { ignoreEncryption: true });
        const indices = srcDoc.getPageIndices();
        if (indices.length === 0) {
          await addUnsupportedPreviewPage(pdfDoc, font, boldFont, evidence, "This PDF file had no pages to include.");
        } else {
          const copied = await pdfDoc.copyPages(srcDoc, indices);
          copied.forEach((p, i) => {
            pdfDoc.addPage(p);
            if (i === 0) stampExhibitBand(p, font, boldFont, evidence.exhibitLabel, evidence.originalName);
            else stampExhibitCorner(p, boldFont, evidence.exhibitLabel);
          });
        }
      } catch {
        await addUnsupportedPreviewPage(pdfDoc, font, boldFont, evidence, "The original PDF file could not be read.");
      }
    } else if (
      evidence.fileType === "application/msword" ||
      evidence.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      await addUnsupportedPreviewPage(
        pdfDoc,
        font,
        boldFont,
        evidence,
        "This Word document can't be shown inline here. Save it as a PDF and re-upload to include its content."
      );
    } else {
      await addUnsupportedPreviewPage(pdfDoc, font, boldFont, evidence);
    }
  }

  stampFooters(pdfDoc.getPages(), font);

  await updateCase(caseId, { status: "exported" });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
