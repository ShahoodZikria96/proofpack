# ProofPack — Online Purchase & Payment Dispute

Turn receipts, chats, delivery evidence and refund attempts into one clear dispute evidence pack.

## Implementation (Phase 1 MVP)

The [`app/`](./app) directory contains a working, local-first build of the Phase 1 MVP described in this
blueprint: upload evidence, manually categorize and label exhibits, build a timeline, and export a single
PDF evidence pack. No OCR, payments, or cloud storage yet — that's Phase 2/3 per the build guidance below.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, no external accounts required to run it.
- **Storage:** case data and uploaded files are kept locally under `app/.data/` (gitignored, never
  committed).
- **PDF export:** `@react-pdf/renderer` builds the cover/summary/timeline/index pages; `pdf-lib` embeds
  image exhibits and merges in original PDF evidence pages, then stamps page numbers across the whole pack.

To run it:

```bash
cd app
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Product Concept

| | |
|---|---|
| **Target customer** | Online shoppers who paid for an item or service and now need to prove non-delivery, wrong item, damage, unauthorized charge, refund failure or another transaction problem. |
| **Urgent pain** | The user often has a dispute deadline and already has messy evidence scattered across screenshots, receipts, emails, payment confirmations and tracking pages. |
| **Recommended pricing** | Launch: $2.99–$4.99 per export. Later: bundle credits or a low monthly plan for frequent users. |

**Core promise:** The product does not sell information. It converts scattered real-world evidence into a structured, reviewable and professional evidence package with minimal manual work.

### What the user uploads
- Order confirmation or invoice
- Payment receipt / bank or wallet proof
- Seller or merchant chats
- Email correspondence
- Shipping/tracking screenshots
- Photos of damaged/wrong item
- Refund/cancellation requests
- Any platform dispute messages

### What the user receives
- Case summary with transaction amount and issue type
- Chronological event timeline
- Evidence index with Exhibit A, B, C labels
- Clean attachment pages with captions
- Missing-evidence warning before export
- One professional PDF ready for submission or record keeping

## User Experience

**Recommended flow**
1. Choose dispute type
2. Upload files and screenshots
3. Auto-detect dates, amounts, order numbers and parties
4. Review and correct extracted timeline
5. Optionally redact sensitive information
6. Reorder/disable exhibits
7. Generate and download final PDF

**MVP — build only what proves demand**
- Multi-file upload (images + PDF)
- OCR/text extraction
- Date and amount extraction
- Manual timeline editor
- Exhibit labeling and captions
- PDF generation
- Basic redaction boxes
- Local account or guest session

**Explicit non-goals**
- Do not tell the user that they will win the dispute
- Do not provide legal representation or definitive legal advice
- Do not contact the merchant or bank in MVP
- Do not fabricate missing facts or evidence

## Build Guidance

**Shared architecture**
- One reusable evidence engine with niche-specific case types and PDF templates
- Private file storage, OCR/PDF parsing, structured fact extraction, timeline generation, exhibit labeling and PDF export
- Human review is mandatory before export; extracted facts should always remain editable
- Every summary sentence should be traceable to user-confirmed evidence
- Avoid storing sensitive evidence longer than necessary; provide user-controlled deletion
- Design mobile-first because many users will upload screenshots directly from a phone

**Suggested MVP release order**
1. Upload + manual categorization + exhibit labels + PDF export
2. OCR + automatic date/amount extraction + timeline suggestions
3. Redaction + missing-evidence warnings + payment gate
4. Saved cases, accounts, reusable profiles and niche-specific integrations

## Technical Suggestion

- **Frontend:** Next.js/React + Tailwind
- **Backend:** Node/Next server actions or NestJS
- **Database:** PostgreSQL/Supabase
- **Storage:** S3-compatible object storage
- **OCR:** Tesseract or cloud OCR
- **PDF parsing:** pdf.js/pdf-parse
- **PDF generation:** Puppeteer/Playwright HTML-to-PDF or PDFKit
- **Payments:** Stripe where supported; keep the payment layer replaceable

### Data model
```
Case(id, user_id, type, title, status, currency, transaction_amount, created_at)
Evidence(id, case_id, file_url, file_type, original_name, exhibit_label, caption, sort_order, include)
ExtractedFact(id, evidence_id, fact_type, value, confidence, user_confirmed)
TimelineEvent(id, case_id, date, title, description, evidence_ids, sort_order)
Redaction(id, evidence_id, page, x, y, width, height, label)
Export(id, case_id, pdf_url, created_at, payment_status)
```

### MVP security
Signed upload URLs, encrypted storage, strict access control, automatic file deletion option, malware scanning, rate limits, no public file URLs, and a clear privacy notice.

### AI rules
- Never invent dates, amounts or facts
- If confidence is low, mark the field "Needs review"
- Summaries must be factual and neutral
- Never claim fraud, liability, illegality or guaranteed outcome
- Preserve original uploaded evidence without modifying underlying content, except optional user-approved redaction in the exported copy

## Success condition
A first-time user with 20 screenshots and 3 PDFs should be able to create a clear evidence PDF in under 5 minutes with minimal typing.

---

> **Note:** This blueprint is for product development and UX planning. The final service should include appropriate privacy terms, security controls and jurisdiction-specific disclaimers before public launch.

Full blueprint: [`01_ProofPack_Online_Purchase_Payment_Dispute.pdf`](./01_ProofPack_Online_Purchase_Payment_Dispute.pdf)
