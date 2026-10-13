import type { Evidence } from "./types";

function formatEventDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Drafts a timeline event description from data the user already entered -
 * the event title, date, and captions of any exhibits they linked. Never
 * invents facts: with nothing to work from, it returns an empty string.
 */
export function buildAutoDescription(title: string, date: string, linkedEvidence: Evidence[]): string {
  const trimmedTitle = title.trim();
  if (!trimmedTitle && linkedEvidence.length === 0) return "";

  const formattedDate = formatEventDate(date);
  const sentences: string[] = [];

  if (trimmedTitle) {
    sentences.push(formattedDate ? `${trimmedTitle} on ${formattedDate}.` : `${trimmedTitle}.`);
  }

  if (linkedEvidence.length > 0) {
    const refs = linkedEvidence.map(
      (e) => `Exhibit ${e.exhibitLabel} (${e.caption.trim() || e.originalName})`
    );
    sentences.push(`Documented by ${refs.join(", ")}.`);
  }

  return sentences.join(" ");
}
