"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RoundTimer } from "@/components/RoundTimer";

type Problem = {
  id: string;
  order: number;
  title: string;
  description: string;
  points: number;
  starterCode: string | null;
  publicIn: string | null;
  publicOut: string | null;
  submission: {
    status: string;
    passed: number;
    total: number;
    score: number;
    detail: string | null;
  } | null;
};

type Payload = {
  endsAt: string;
  problems: Problem[];
  judgeConfigured: boolean;
  error?: string;
};

export function CodingClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [code, setCode] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/coding");
    const j = await res.json();
    if (!res.ok) {
      setData({ endsAt: "", problems: [], judgeConfigured: false, error: j.error ?? "Failed" });
      return;
    }
    setData(j);
    setCode((prev) => {
      const next = { ...prev };
      for (const p of j.problems as Problem[]) {
        if (next[p.id] == null && p.starterCode) next[p.id] = p.starterCode;
      }
      return next;
    });
    setLang((prev) => {
      const next = { ...prev };
      for (const p of j.problems as Problem[]) {
        if (next[p.id] == null) next[p.id] = 71;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const expired = data?.endsAt && new Date(data.endsAt).getTime() < Date.now();

  async function submit(problemId: string) {
    if (!data || expired) return;
    const src = code[problemId] ?? "";
    const langId = lang[problemId] ?? 71;
    if (!src.trim()) {
      setMsg((m) => ({ ...m, [problemId]: "Write some code first." }));
      return;
    }
    setBusy(problemId);
    setMsg((m) => ({ ...m, [problemId]: "" }));
    try {
      const res = await fetch("/api/coding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, code: src, langId }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg((m) => ({ ...m, [problemId]: j.error ?? "Error" }));
        return;
      }
      setMsg((m) => ({
        ...m,
        [problemId]: `${j.status} — ${j.passed}/${j.total} tests, score ${j.score}. ${j.detail ?? ""}`,
      }));
      load();
    } finally {
      setBusy(null);
    }
  }

  if (!data) return <p className="text-slate-400">Loading…</p>;

  if (data.error) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">{data.error}</p>
        <Link href="/dashboard" className="text-sky-400 hover:underline">
          ← Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Round 3 — Coding</h1>
          <p className="text-sm text-slate-500">
            Internal Judge.{" "}
            {!data.judgeConfigured && (
              <span className="text-amber-400">
                Server has no RAPIDAPI_KEY — submissions stay pending for manual review.
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">Time left</p>
          <RoundTimer endsAt={data.endsAt} />
        </div>
      </div>

      {expired && (
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-200">
          Timer ended — new submissions may be blocked.
        </p>
      )}

      <div className="space-y-10">
        {data.problems.map((p) => (
          <section key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-semibold text-white">{p.title}</h2>
              <div className="flex items-center gap-3">
                <select
                  className="rounded bg-slate-800 px-2 py-1 text-sm text-slate-300 outline-none"
                  value={lang[p.id] ?? 71}
                  onChange={(e) => setLang((l) => ({ ...l, [p.id]: Number(e.target.value) }))}
                  disabled={Boolean(expired)}
                >
                  <option value={71}>Python</option>
                  <option value={62}>Java</option>
                  <option value={54}>C++</option>
                </select>
                <span className="text-sm text-slate-500">{p.points} pts</span>
              </div>
            </div>
            <pre className="mb-4 whitespace-pre-wrap font-sans text-sm text-slate-300">
              {p.description}
            </pre>
            {(p.publicIn || p.publicOut) && (
              <div className="mb-4 grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded-lg bg-slate-950/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Sample in</p>
                  <pre className="mt-1 font-mono text-slate-300">{p.publicIn ?? "—"}</pre>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Sample out</p>
                  <pre className="mt-1 font-mono text-slate-300">{p.publicOut ?? "—"}</pre>
                </div>
              </div>
            )}
            <textarea
              className="h-56 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-100 outline-none focus:border-sky-500"
              value={code[p.id] ?? ""}
              onChange={(e) => setCode((c) => ({ ...c, [p.id]: e.target.value }))}
              spellCheck={false}
              disabled={Boolean(expired)}
            />
            {p.submission && (
              <p className="mt-2 text-xs text-slate-500">
                Last: {p.submission.status} ({p.submission.passed}/{p.submission.total}) —{" "}
                {p.submission.score} pts
              </p>
            )}
            {msg[p.id] && <p className="mt-2 text-sm text-slate-400">{msg[p.id]}</p>}
            <button
              type="button"
              onClick={() => submit(p.id)}
              disabled={busy === p.id || Boolean(expired)}
              className="mt-3 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"
            >
              {busy === p.id ? "Judging…" : "Run & submit"}
            </button>
          </section>
        ))}
      </div>

      <Link href="/dashboard" className="inline-block text-sky-400 hover:underline">
        ← Dashboard
      </Link>
    </div>
  );
}
