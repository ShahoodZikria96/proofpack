import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { listCases } from "@/lib/store";
import { DISPUTE_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

function disputeLabel(type: string) {
  return DISPUTE_TYPES.find((d) => d.value === type)?.label ?? type;
}

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-950">My Cases</h1>
          <Link
            href="/cases/new"
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            New case
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            You don&apos;t have any cases yet. Create your first evidence pack to get started.
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {cases.map((c) => (
              <li key={c.id}>
                <Link href={`/cases/${c.id}/upload`} className="flex items-center justify-between px-5 py-4 hover:bg-brand-50">
                  <div>
                    <p className="font-medium text-brand-950">{c.title}</p>
                    <p className="text-sm text-slate-500">{disputeLabel(c.type)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === "exported" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.status === "exported" ? "Exported" : "Draft"}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
