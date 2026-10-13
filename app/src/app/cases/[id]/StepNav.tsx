"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CASE_STEPS } from "./tabs";

export function StepNav({ caseId }: { caseId: string }) {
  const pathname = usePathname();
  const currentIndex = CASE_STEPS.findIndex((step) => pathname === `/cases/${caseId}/${step.slug}`);
  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? CASE_STEPS[currentIndex - 1] : null;
  const next = currentIndex < CASE_STEPS.length - 1 ? CASE_STEPS[currentIndex + 1] : null;

  return (
    <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
      {prev ? (
        <Link href={`/cases/${caseId}/${prev.slug}`} className="text-sm font-medium text-slate-600 hover:text-brand-800">
          ← Back to {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/cases/${caseId}/${next.slug}`}
          className="rounded-md bg-brand-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-800"
        >
          Next: {next.label} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
