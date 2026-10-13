"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DISPUTE_TYPES, type DisputeType } from "@/lib/types";
import { COUNTRIES } from "@/lib/countries";
import { CURRENCIES } from "@/lib/currencies";

export default function NewCasePage() {
  const router = useRouter();
  const [type, setType] = useState<DisputeType>("non-delivery");
  const [merchantName, setMerchantName] = useState("");
  const [country, setCountry] = useState("");
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!merchantName.trim()) {
      setError("Please enter the company or merchant you're disputing with — this is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          merchantName,
          country,
          title: title.trim() || `Dispute with ${merchantName.trim()}`,
          currency,
          transactionAmount: amount.trim() ? Number(amount) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Could not create case");
      }
      const data = await res.json();
      router.push(`/cases/${data.case.id}/upload`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating your case. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-xl flex-1 px-6 py-14">
        <h1 className="text-2xl font-bold text-brand-950">Create your evidence pack</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start with the basics. You&apos;ll upload evidence and build the timeline next.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Dispute type</label>
            <p className="mt-0.5 text-xs text-slate-500">Choose whichever option is closest to what happened.</p>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DisputeType)}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {DISPUTE_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Company / merchant <span className="text-red-500">*</span>
            </label>
            <p className="mt-0.5 text-xs text-slate-500">
              Who is this dispute with? e.g. Amazon, a local store, an airline, a freelancer.
            </p>
            <input
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="e.g. AudioGearDirect"
              required
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Country / region</label>
            <p className="mt-0.5 text-xs text-slate-500">
              Where you or the merchant are based — helps if you submit this abroad. Optional.
            </p>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select a country (optional)</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Case title</label>
            <p className="mt-0.5 text-xs text-slate-500">
              A short name for your own reference. Leave blank and we&apos;ll generate one.
            </p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Order #4471 never delivered"
              className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Currency</label>
              <p className="mt-0.5 text-xs text-slate-500">The currency you were charged in.</p>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Transaction amount</label>
              <p className="mt-0.5 text-xs text-slate-500">Leave blank if you&apos;re not sure yet.</p>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Continue to upload evidence"}
          </button>
        </form>
      </main>
    </div>
  );
}
