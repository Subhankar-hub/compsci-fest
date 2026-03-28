import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-sky-400/90">
          Tech fest event
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Computational Science
        </h1>
        <p className="max-w-2xl text-lg text-slate-400">
          Three rounds: 30 core-CS MCQs, 20 short-answer problems, then three LeetCode-style coding tasks in
          Python, C++, or Java. Register, compete on a timer, and climb the leaderboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { n: "1", t: "Core CS", d: "30 MCQs — DS, algos, OS, DB, networks" },
          { n: "2", t: "Short answer", d: "20 text answers — core CS & basic problem solving" },
          { n: "3", t: "Coding", d: "2 easy + 1 medium — function/class only, hand-graded" },
        ].map((x) => (
          <div
            key={x.n}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-slate-950/40"
          >
            <p className="text-xs font-semibold text-sky-400">Round {x.n}</p>
            <h2 className="mt-1 font-semibold text-white">{x.t}</h2>
            <p className="mt-2 text-sm text-slate-500">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/register"
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-500"
        >
          Log in
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg px-5 py-2.5 text-sm text-slate-400 hover:text-slate-200"
        >
          Go to dashboard →
        </Link>
      </div>
    </div>
  );
}
