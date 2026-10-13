"use client";

import { use, useCallback, useEffect, useState } from "react";
import type { CaseWithDetails } from "@/lib/types";
import { DISPUTE_TYPES } from "@/lib/types";
import { StepNav } from "../StepNav";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<CaseWithDetails | null>(null);
  const [exporting, setExporting] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`, { cache: "no-store" });
    if (res.ok) setDetails(await res.json());
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, [refresh]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/cases/${id}/export`);
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proofpack-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await refresh();
    } finally {
      setExporting(false);
    }
  }

  if (!details) return <p className="text-sm text-slate-500">Loading...</p>;

  const included = details.evidence.filter((e) => e.include);
  const warnings: string[] = [];
  if (included.length === 0) warnings.push("No evidence is included — your export will have an empty evidence index.");
  if (details.timeline.length === 0) warnings.push("No timeline events recorded — consider adding at least a few key dates.");
  if (!details.case.merchantName.trim()) warnings.push("No company or merchant name was set for this case.");
  if (details.case.transactionAmount === null) warnings.push("No transaction amount was set for this case.");
  const uncaptioned = included.filter((e) => !e.caption.trim());
  if (uncaptioned.length > 0) warnings.push(`${uncaptioned.length} included exhibit(s) have no caption.`);

  const disputeLabel = DISPUTE_TYPES.find((d) => d.value === details.case.type)?.label ?? details.case.type;

  return (
    <div>
      <h2 className="text-lg font-semibold text-brand-950">Preview &amp; export</h2>
      <p className="mt-1 text-sm text-slate-600">
        Review your case before generating the final PDF. You can always come back and edit.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 p-5 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-400">Dispute type</p>
          <p className="mt-0.5 font-medium text-brand-950">{disputeLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Company / merchant</p>
          <p className="mt-0.5 font-medium text-brand-950">{details.case.merchantName || "Not set"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Transaction amount</p>
          <p className="mt-0.5 font-medium text-brand-950">
            {details.case.transactionAmount === null
              ? "Not set"
              : `${details.case.currency} ${details.case.transactionAmount.toFixed(2)}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Evidence included</p>
          <p className="mt-0.5 font-medium text-brand-950">
            {included.length} of {details.evidence.length}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Timeline events</p>
          <p className="mt-0.5 font-medium text-brand-950">{details.timeline.length}</p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Missing-evidence warnings</p>
          <ul className="mt-2 space-y-1 text-sm text-amber-700">
            {warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-brand-950">Exhibits in this export</h3>
        {included.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">None yet.</p>
        ) : (
          <ol className="mt-2 space-y-1 text-sm text-slate-700">
            {included.map((e) => (
              <li key={e.id}>
                <span className="font-semibold">Exhibit {e.exhibitLabel}</span> — {e.originalName}
                {e.caption ? ` — ${e.caption}` : ""}
              </li>
            ))}
          </ol>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={exporting}
        className="mt-8 w-full rounded-md bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
      >
        {exporting ? "Generating PDF..." : "Generate & download evidence pack"}
      </button>

      {details.case.status === "exported" && (
        <p className="mt-2 text-center text-xs text-slate-400">This case has been exported before.</p>
      )}

      <StepNav caseId={id} />
    </div>
  );
}
