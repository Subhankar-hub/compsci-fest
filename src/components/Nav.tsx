import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-sky-300">
          Computational Science
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-100">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="hover:text-slate-100">
            Leaderboard
          </Link>
          <Link href="/admin" className="hover:text-slate-300">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
