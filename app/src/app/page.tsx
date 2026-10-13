import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

const UPLOADS = [
  "Order confirmation or invoice",
  "Payment receipt / bank or wallet proof",
  "Seller or merchant chats",
  "Email correspondence",
  "Shipping/tracking screenshots",
  "Photos of damaged/wrong item",
  "Refund/cancellation requests",
  "Any platform dispute messages",
];

const STEPS = [
  { title: "Choose dispute type", desc: "Non-delivery, wrong item, damage, refund failure or unauthorized charge." },
  { title: "Upload your evidence", desc: "Drop in screenshots, receipts, emails and photos — JPG, PNG, WEBP or PDF." },
  { title: "Review & organize", desc: "Label exhibits, write captions, and build a chronological timeline." },
  { title: "Export your pack", desc: "Download one clean, professional PDF ready to submit." },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-600">
            Online Purchase &amp; Payment Dispute
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-brand-950 sm:text-5xl">
            Turn scattered evidence into one clear dispute pack
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Receipts, chats, delivery evidence and refund attempts — organized into a structured, professional PDF
            you can submit or keep for your records.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/cases/new"
              className="rounded-md bg-brand-700 px-6 py-3 text-base font-medium text-white hover:bg-brand-800"
            >
              Create My Evidence Pack
            </Link>
            <Link
              href="/cases"
              className="rounded-md border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              View My Cases
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500">How it works</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <div key={step.title} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-brand-950">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-brand-950">What you upload</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {UPLOADS.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-brand-950">What you receive</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  Case summary with transaction amount and issue type
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  Chronological event timeline
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  Evidence index with Exhibit A, B, C labels
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  Clean attachment pages with captions
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  One professional PDF ready for submission or record keeping
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            ProofPack organizes the evidence you already have. It does not tell you whether you will win a dispute,
            provide legal advice, or contact a merchant or bank on your behalf.
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        ProofPack is an evidence organizer, not a law firm or dispute-decision engine.
      </footer>
    </div>
  );
}
