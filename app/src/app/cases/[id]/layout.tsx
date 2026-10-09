import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getCaseWithDetails } from "@/lib/store";
import { CaseTabs } from "./CaseTabs";

export const dynamic = "force-dynamic";

export default async function CaseLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const details = await getCaseWithDetails(id);
  if (!details) notFound();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-5">
          <Link href="/cases" className="text-xs font-medium text-slate-500 hover:text-slate-700">
            ← My Cases
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900">{details.case.title}</h1>
        </div>
        <div className="mx-auto max-w-4xl px-6">
          <CaseTabs caseId={id} />
        </div>
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
