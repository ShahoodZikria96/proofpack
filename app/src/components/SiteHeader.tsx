import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-brand-700 text-sm font-bold text-white">
            P
          </span>
          <span className="text-lg font-semibold tracking-tight text-brand-950">ProofPack</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-600">
          <Link href="/cases" className="hover:text-brand-800">
            My Cases
          </Link>
          <Link
            href="/cases/new"
            className="rounded-md bg-brand-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-800"
          >
            Create My Evidence Pack
          </Link>
        </nav>
      </div>
    </header>
  );
}
