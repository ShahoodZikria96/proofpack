"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CASE_STEPS } from "./tabs";

export function CaseTabs({ caseId }: { caseId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1">
      {CASE_STEPS.map((tab) => {
        const href = `/cases/${caseId}/${tab.slug}`;
        const active = pathname === href;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "border-brand-700 text-brand-800"
                : "border-transparent text-slate-500 hover:text-brand-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
