"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoundTimer } from "@/components/RoundTimer";

type Q = {
  id: string;
  order: number;
  kind: "MCQ" | "SHORT";
  prompt: string;
  points: number;
  choices: string[] | null;
  answered: boolean;
};

type Payload = {
  round: number;
  endsAt: string;
  questions: Q[];
  roundScore?: number;
  roundMax?: number;
  allAnswered?: boolean;
  error?: string;
};

export function RoundQuizClient({ round }: { round: number }) {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [answers, setAnswers] = useState<Record<string, { choice?: number; text?: string }>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/round/${round}`, { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) {
      setData({ round, endsAt: "", questions: [], error: j.error ?? "Failed to load" });
      return;
    }
    setData(j);
    const qs = j.questions as Q[];
    setAnswers((prev) => {
      const next: Record<string, { choice?: number; text?: string }> = {};
      for (const q of qs) {
        next[q.id] = prev[q.id] ?? {};
      }
      return next;
    });
  }, [round]);

  useEffect(() => {
    load();
  }, [load]);

  const expired = data?.endsAt && new Date(data.endsAt).getTime() < Date.now();

  const totalQ = data?.questions.length ?? 0;
  const answeredCount = data?.questions.filter((q) => q.answered).length ?? 0;
  const allAnswered = Boolean(data?.allAnswered);
  const roundScore = data?.roundScore ?? 0;
  const roundMax = data?.roundMax ?? 0;

  async function submit() {
    if (!data || expired) return;
    setMsg(null);
    setSaving(true);
    const list = data.questions.map((q) => {
      const a = answers[q.id] ?? {};
      if (q.kind === "MCQ") {
        return { questionId: q.id, choiceIndex: a.choice };
      }
      return { questionId: q.id, answerText: a.text ?? "" };
    });
    const filtered = list.filter((x) => {
      const q = data.questions.find((qq) => qq.id === x.questionId)!;
      if (q.kind === "MCQ") return typeof x.choiceIndex === "number";
      return Boolean((x as { answerText?: string }).answerText?.trim());
    });
    if (filtered.length === 0) {
      setMsg("Answer at least one question.");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`/api/round/${round}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ answers: filtered }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j.error ?? "Submit failed");
        return;
      }
      let nextMsg = `Saved. Points from this batch: ${j.gained ?? 0}.`;
      if (j.roundComplete) {
        nextMsg += ` Round score so far: ${j.roundScore ?? 0} / ${j.roundMax ?? 0}. You can move to the next round.`;
      }
      setMsg(nextMsg);
      router.refresh();
      await load();
    } finally {
      setSaving(false);
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

  const nextHref = round === 1 ? "/round/2" : "/coding";
  const nextLabel = round === 1 ? "Continue to Round 2" : "Continue to Round 3 (Coding)";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Round {data.round}</h1>
          <p className="text-sm text-slate-500">
            {data.round === 1 &&
              `${totalQ} multiple-choice questions (core CS). If you see fewer than 30, ask the organiser to sync question bank in admin. `}
            {data.round === 2 &&
              `${totalQ} short answers (core CS & problem-solving basics). Matching ignores case and extra spaces. If you see fewer than 20, ask the organiser to sync question bank in admin. `}
            Submit answers before the timer ends.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Progress:{" "}
            <span className="font-medium text-sky-300">
              {answeredCount} / {totalQ}
            </span>{" "}
            questions saved · Round score:{" "}
            <span className="font-medium text-sky-300">
              {roundScore} / {roundMax}
            </span>
          </p>
          {totalQ > 8 && (
            <div className="mt-3 max-h-32 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60 p-2">
              <p className="mb-1.5 text-xs text-slate-500">Jump to question (scroll the page for full list)</p>
              <div className="flex flex-wrap gap-1">
                {data.questions.map((q, i) => (
                  <a
                    key={q.id}
                    href={`#q-${i + 1}`}
                    className={`rounded px-2 py-0.5 text-xs no-underline ${q.answered ? "bg-emerald-900/50 text-emerald-200" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                  >
                    {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">Time left</p>
          <RoundTimer endsAt={data.endsAt} />
        </div>
      </div>

      {allAnswered && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/35 px-5 py-4 text-emerald-50">
          <h2 className="text-lg font-semibold text-white">Round {data.round} complete</h2>
          <p className="mt-1 text-sm text-emerald-100/90">
            You have submitted every question in this round. Score for this round:{" "}
            <span className="font-bold text-white">
              {roundScore} / {roundMax}
            </span>{" "}
            points.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={nextHref}
              className="inline-flex rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
            >
              {nextLabel}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg border border-slate-600 px-5 py-2.5 text-sm text-slate-200 hover:border-slate-500"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {expired && (
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-200">
          Time expired — you can still review, but submissions may be rejected.
        </p>
      )}

      <div className="space-y-8">
        {data.questions.map((q, idx) => (
          <div
            id={`q-${idx + 1}`}
            key={q.id}
            className="scroll-mt-24 rounded-xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-sky-500">Q{idx + 1}</span>
              <span className="text-xs text-slate-500">
                {q.points} pts · {q.kind}
              </span>
            </div>
            <p className="text-white">{q.prompt}</p>
            {q.kind === "MCQ" && q.choices && (
              <ul className="mt-4 space-y-2">
                {q.choices.map((c, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-2 text-slate-300">
                      <input
                        type="radio"
                        name={q.id}
                        className="mt-1"
                        checked={answers[q.id]?.choice === i}
                        onChange={() =>
                          setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], choice: i } }))
                        }
                        disabled={Boolean(expired)}
                      />
                      <span>{c}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {q.kind === "SHORT" && (
              <input
                className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500"
                placeholder="Your answer"
                value={answers[q.id]?.text ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: { ...a[q.id], text: e.target.value } }))
                }
                disabled={Boolean(expired)}
              />
            )}
            {q.answered && (
              <p className="mt-2 text-xs text-emerald-500/90">Submitted previously — resubmit to update.</p>
            )}
          </div>
        ))}
      </div>

      {msg && <p className="text-sm text-slate-400">{msg}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={saving || Boolean(expired)}
          className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Submit answers"}
        </button>
        {!allAnswered && (
          <p className="self-center text-xs text-slate-500">
            Submit each answer so it is saved; when all are saved, you can open the next round.
          </p>
        )}
        <Link href="/dashboard" className="rounded-lg border border-slate-700 px-5 py-2.5 text-slate-300">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
