"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import type { CaseWithDetails } from "@/lib/types";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export default function UploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<CaseWithDetails | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`, { cache: "no-store" });
    if (res.ok) setDetails(await res.json());
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, [refresh]);

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    list.forEach((f) => formData.append("files", f));
    const res = await fetch(`/api/cases/${id}/evidence`, { method: "POST", body: formData });
    setUploading(false);
    if (res.ok) {
      const data = await res.json();
      if (data.skipped?.length) {
        setMessage(`Added ${data.evidence.length} file(s). Skipped unsupported or oversized: ${data.skipped.join(", ")}`);
      } else {
        setMessage(`Added ${data.evidence.length} file(s).`);
      }
      await refresh();
    } else {
      setMessage("Upload failed. Please try again.");
    }
  }

  async function removeEvidence(evidenceId: string) {
    await fetch(`/api/cases/${id}/evidence/${evidenceId}`, { method: "DELETE" });
    await refresh();
  }

  if (!details) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Upload evidence</h2>
      <p className="mt-1 text-sm text-slate-600">
        Order confirmations, receipts, chats, emails, tracking screenshots or photos. JPG, PNG, WEBP or PDF, up to
        20MB each.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragOver ? "border-slate-900 bg-slate-50" : "border-slate-300 hover:border-slate-400"
        }`}
      >
        <p className="text-sm font-medium text-slate-700">
          {uploading ? "Uploading..." : "Click to choose files or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-slate-400">JPG, PNG, WEBP, PDF</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {message && <p className="mt-3 text-sm text-slate-600">{message}</p>}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-900">
          Uploaded files ({details.evidence.length})
        </h3>
        {details.evidence.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">No files uploaded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {details.evidence.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-900 text-xs font-bold text-white">
                    {ev.exhibitLabel}
                  </span>
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-medium text-slate-800">{ev.originalName}</p>
                    <p className="text-xs text-slate-400">{ev.fileType}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeEvidence(ev.id)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
