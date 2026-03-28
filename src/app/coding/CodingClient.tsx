"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RoundTimer } from "@/components/RoundTimer";

type MeScores = {
  score: number;
  quizScore: number;
  quizRound1Score: number;
  quizRound2Score: number;
  codingScore: number;
};

type Problem = {
  id: string;
  order: number;
  title: string;
  description: string;
  points: number;
  starterCode: string | null;
  functional?: boolean;
  starters?: Record<string, string>;
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

function starterFor(p: Problem, langId: number): string {
  const k = String(langId);
  return p.starters?.[k] ?? p.starters?.["71"] ?? p.starterCode ?? "";
}

export function CodingClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [code, setCode] = useState<Record<string, string>>({});
  const [lang, setLang] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [me, setMe] = useState<MeScores | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/coding");
    const j = await res.json();
    if (!res.ok) {
      setData({ endsAt: "", problems: [], judgeConfigured: false, error: j.error ?? "Failed" });
      return;
    }
    setData(j);
    setLang((prev) => {
      const next = { ...prev };
      for (const p of j.problems as Problem[]) {
        if (next[p.id] == null) next[p.id] = 71;
      }
      return next;
    });
    setCode((prev) => {
      const next = { ...prev };
      for (const p of j.problems as Problem[]) {
        if (next[p.id] == null) {
          next[p.id] = starterFor(p, 71);
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data?.problems?.length) {
      setMe(null);
      return;
    }
    const allSubmitted = data.problems.every((p) => p.submission != null);
    if (!allSubmitted) {
      setMe(null);
      return;
    }
    fetch("/api/me")
      .then((r) => r.json())
      .then((j) => {
        if (j.team == null) return;
        setMe({
          score: j.score ?? 0,
          quizScore: j.quizScore ?? 0,
          quizRound1Score: j.quizRound1Score ?? 0,
          quizRound2Score: j.quizRound2Score ?? 0,
          codingScore: j.codingScore ?? 0,
        });
      })
      .catch(() => setMe(null));
  }, [data]);

  const expired = data?.endsAt && new Date(data.endsAt).getTime() < Date.now();
  const probs = data?.problems ?? [];
  const allCodingSubmitted = probs.length > 0 && probs.every((p) => p.submission != null);
  const codingRoundMax = probs.reduce((s, p) => s + p.points, 0);
  const codingRoundScore = probs.reduce((s, p) => s + (p.submission?.score ?? 0), 0);

  async function submit(problemId: string) {
    if (!data || expired) return;
    const src = code[problemId] ?? "";
    const langId = lang[problemId] ?? 71;
    if (!src.trim()) {
      setMsg((m) => ({ ...m, [problemId]: "Write your solution first." }));
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
            Two easy and one medium problem. Submit only the function or <code className="text-slate-400">class Solution</code>{" "}
            block (LeetCode / GFG style). Python, C++, or Java — hidden tests run automatically.
            {!data.judgeConfigured && (
              <span className="ml-1 text-amber-400">
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

      {allCodingSubmitted && me && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/35 px-5 py-5 text-emerald-50">
          <h2 className="text-lg font-semibold text-white">All rounds submitted — your total marks</h2>
          <p className="mt-3 text-4xl font-bold tracking-tight text-white">{me.score}</p>
          <p className="text-sm text-emerald-200/90">Total score (quiz + coding)</p>
          <ul className="mt-4 space-y-1 text-sm text-slate-300">
            <li>
              Round 1 (MCQ): <span className="text-white">{me.quizRound1Score}</span>
            </li>
            <li>
              Round 2 (short): <span className="text-white">{me.quizRound2Score}</span>
            </li>
            <li>
              Round 3 (coding): <span className="text-white">{me.codingScore}</span> / {codingRoundMax}{" "}
              max on problems shown
            </li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">
            Quiz subtotal: {me.quizScore} · Coding this round: {codingRoundScore} / {codingRoundMax}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            >
              Back to dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-200 hover:border-slate-500"
            >
              Leaderboard
            </Link>
          </div>
        </div>
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
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLang((l) => ({ ...l, [p.id]: v }));
                    const s = starterFor(p, v);
                    setCode((c) => ({ ...c, [p.id]: s }));
                  }}
                  disabled={Boolean(expired)}
                >
                  <option value={71}>Python</option>
                  <option value={54}>C++</option>
                  <option value={62}>Java</option>
                </select>
                <span className="text-sm text-slate-500">{p.points} pts</span>
              </div>
            </div>
            <pre className="mb-4 whitespace-pre-wrap font-sans text-sm text-slate-300">{p.description}</pre>
            {p.functional && (
              <p className="mb-3 text-xs text-sky-400/90">
                Changing language reloads the starter template for that language.
              </p>
            )}
            {(p.publicIn || p.publicOut) && (
              <div className="mb-4 grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded-lg bg-slate-950/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Sample stdin</p>
                  <pre className="mt-1 font-mono text-slate-300">{p.publicIn ?? "—"}</pre>
                </div>
                <div className="rounded-lg bg-slate-950/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Sample stdout</p>
                  <pre className="mt-1 font-mono text-slate-300">{p.publicOut ?? "—"}</pre>
                </div>
              </div>
            )}
            <textarea
              className="min-h-[14rem] w-full rounded-lg border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-100 outline-none focus:border-sky-500"
              value={code[p.id] ?? ""}
              onChange={(e) => setCode((c) => ({ ...c, [p.id]: e.target.value }))}
              spellCheck={false}
              disabled={Boolean(expired)}
            />
            {p.submission && (
              <p className="mt-2 text-xs text-slate-500">
                Last: {p.submission.status} ({p.submission.passed}/{p.submission.total}) — {p.submission.score}{" "}
                pts
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
