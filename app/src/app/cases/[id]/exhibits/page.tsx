"use client";

import { use, useCallback, useEffect, useState } from "react";
import type { CaseWithDetails, Evidence } from "@/lib/types";
import { StepNav } from "../StepNav";

export default function ExhibitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<CaseWithDetails | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`, { cache: "no-store" });
    if (res.ok) setDetails(await res.json());
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, [refresh]);

  async function patchEvidence(evidenceId: string, patch: Partial<Evidence>) {
    setSavingId(evidenceId);
    await fetch(`/api/cases/${id}/evidence/${evidenceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    await refresh();
  }

  async function move(index: number, direction: -1 | 1) {
    if (!details) return;
    const items = [...details.evidence];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setDetails({ ...details, evidence: items });
    await fetch(`/api/cases/${id}/evidence/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: items.map((i) => i.id) }),
    });
    await refresh();
  }

  if (!details) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-brand-950">Review exhibits</h2>
      <p className="mt-1 text-sm text-slate-600">
        Label each piece of evidence, add a short caption, reorder exhibits, and exclude anything that shouldn&apos;t
        be in the final pack.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        We&apos;ve pre-filled a label and caption from each filename where it was descriptive. Files named by your
        camera, scanner or chat app (like IMG_2049.jpg or a WhatsApp export) are left blank and marked{" "}
        <span className="font-medium text-amber-700">Needs caption</span> below — just write one short line saying
        what the file shows.
      </p>

      {details.evidence.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No evidence uploaded yet. Go to the Upload tab first.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {details.evidence.map((ev, index) => (
            <li key={ev.id} className="flex gap-4 rounded-lg border border-slate-200 p-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100">
                {ev.fileType.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/cases/${id}/evidence/${ev.id}/file`}
                    alt={ev.originalName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-500">
                    {ev.fileType === "application/pdf" ? "PDF" : "DOC"}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-medium text-slate-500" title="Short reference used in your PDF, e.g. A, B, 1, 2">
                    Exhibit
                  </label>
                  <input
                    defaultValue={ev.exhibitLabel}
                    onBlur={(e) => {
                      if (e.target.value !== ev.exhibitLabel) patchEvidence(ev.id, { exhibitLabel: e.target.value });
                    }}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-sm font-semibold focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="truncate text-sm text-slate-700">{ev.originalName}</span>
                  {!ev.caption.trim() && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Needs caption
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1 text-xs">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === details.evidence.length - 1}
                      className="rounded border border-slate-300 px-1.5 py-0.5 text-slate-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </span>
                </div>

                <textarea
                  defaultValue={ev.caption}
                  placeholder="Caption, e.g. Screenshot of order confirmation showing delivery date"
                  onBlur={(e) => {
                    if (e.target.value !== ev.caption) patchEvidence(ev.id, { caption: e.target.value });
                  }}
                  rows={2}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />

                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={ev.include}
                    onChange={(e) => patchEvidence(ev.id, { include: e.target.checked })}
                    className="accent-brand-600"
                  />
                  Include in exported PDF
                  <span className="text-slate-400">— uncheck to keep this file in the case without adding it to the final PDF</span>
                  {savingId === ev.id && <span className="text-slate-400">· Saving...</span>}
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <StepNav caseId={id} />
    </div>
  );
}
