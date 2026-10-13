"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import type { CaseWithDetails, TimelineEvent } from "@/lib/types";
import { buildAutoDescription } from "@/lib/autoDescription";
import { StepNav } from "../StepNav";

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [details, setDetails] = useState<CaseWithDetails | null>(null);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const descriptionRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/cases/${id}`, { cache: "no-store" });
    if (res.ok) setDetails(await res.json());
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, [refresh]);

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !title) return;
    setSubmitting(true);
    await fetch(`/api/cases/${id}/timeline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, title, description, evidenceIds }),
    });
    setDate("");
    setTitle("");
    setDescription("");
    setEvidenceIds([]);
    setSubmitting(false);
    await refresh();
  }

  async function patchEvent(eventId: string, patch: Partial<TimelineEvent>) {
    await fetch(`/api/cases/${id}/timeline/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await refresh();
  }

  async function removeEvent(eventId: string) {
    await fetch(`/api/cases/${id}/timeline/${eventId}`, { method: "DELETE" });
    await refresh();
  }

  function autoWriteNewDescription() {
    if (!details) return;
    const linked = details.evidence.filter((ev) => evidenceIds.includes(ev.id));
    const generated = buildAutoDescription(title, date, linked);
    if (generated) setDescription(generated);
  }

  function autoWriteEventDescription(event: TimelineEvent) {
    if (!details) return;
    const linked = details.evidence.filter((ev) => event.evidenceIds.includes(ev.id));
    const generated = buildAutoDescription(event.title, event.date, linked);
    if (!generated) return;
    const el = descriptionRefs.current[event.id];
    if (el) el.value = generated;
    patchEvent(event.id, { description: generated });
  }

  if (!details) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Build your timeline</h2>
      <p className="mt-1 text-sm text-slate-600">
        Add each key event in order — when you ordered, when you reached out, when things went wrong — and link the
        exhibits that prove it.
      </p>
      <p className="mt-1 text-xs text-slate-500">
        We added one entry below per file you uploaded, dated today — click into the date and title to correct them
        to when things actually happened, and add any events that have no file, like a phone call. No time to write
        a description? Link the exhibits first and click{" "}
        <span className="font-medium text-slate-700">Auto-write from exhibits</span> to draft one from your title,
        date and linked files — then edit it to add anything the files don&apos;t show.
      </p>

      <form onSubmit={addEvent} className="mt-6 space-y-3 rounded-lg border border-slate-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Event title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Placed order"
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              required
            />
          </div>
        </div>

        {details.evidence.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-500">Linked exhibits</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {details.evidence.map((ev) => {
                const selected = evidenceIds.includes(ev.id);
                return (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() =>
                      setEvidenceIds((prev) =>
                        selected ? prev.filter((x) => x !== ev.id) : [...prev, ev.id]
                      )
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      selected
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    Exhibit {ev.exhibitLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">Description</label>
            <button
              type="button"
              onClick={autoWriteNewDescription}
              disabled={!title.trim() && evidenceIds.length === 0}
              className="text-xs font-medium text-slate-600 underline decoration-dotted hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
            >
              Auto-write from exhibits
            </button>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="What happened, in your own words — or use Auto-write above"
            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Add event
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {details.timeline.length === 0 ? (
          <p className="text-sm text-slate-400">No events yet.</p>
        ) : (
          details.timeline.map((event) => (
            <li key={event.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <input
                  type="date"
                  defaultValue={event.date}
                  onBlur={(e) => {
                    if (e.target.value && e.target.value !== event.date) patchEvent(event.id, { date: e.target.value });
                  }}
                  className="w-36 shrink-0 rounded border border-slate-300 px-2 py-1 text-xs text-slate-600"
                />
                <input
                  defaultValue={event.title}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value !== event.title)
                      patchEvent(event.id, { title: e.target.value });
                  }}
                  className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm font-medium text-slate-900"
                />
                <button
                  onClick={() => removeEvent(event.id)}
                  className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              {details.evidence.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.evidence.map((ev) => {
                    const selected = event.evidenceIds.includes(ev.id);
                    return (
                      <button
                        type="button"
                        key={ev.id}
                        onClick={() =>
                          patchEvent(event.id, {
                            evidenceIds: selected
                              ? event.evidenceIds.filter((x) => x !== ev.id)
                              : [...event.evidenceIds, ev.id],
                          })
                        }
                        className={`rounded-full border px-2.5 py-1 text-xs ${
                          selected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        Exhibit {ev.exhibitLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-2 flex items-center justify-between">
                <label className="text-xs font-medium text-slate-500">Description</label>
                <button
                  type="button"
                  onClick={() => autoWriteEventDescription(event)}
                  disabled={!event.title.trim() && event.evidenceIds.length === 0}
                  className="text-xs font-medium text-slate-600 underline decoration-dotted hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
                >
                  Auto-write from exhibits
                </button>
              </div>
              <textarea
                ref={(el) => {
                  descriptionRefs.current[event.id] = el;
                }}
                defaultValue={event.description}
                placeholder="What happened, in your own words — or use Auto-write above"
                onBlur={(e) => {
                  if (e.target.value !== event.description) patchEvent(event.id, { description: e.target.value });
                }}
                rows={2}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
            </li>
          ))
        )}
      </ul>

      <StepNav caseId={id} />
    </div>
  );
}
