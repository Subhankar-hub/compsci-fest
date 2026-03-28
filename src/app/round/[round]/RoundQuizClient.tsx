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
  error?: string;
};

export function RoundQuizClient({ round }: { round: number }) {
  const router = useRouter();
  const [data, setData] = useState<Payload | null>(null);
  const [answers, setAnswers] = useState<Record<string, { choice?: number; text?: string }>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/round/${round}`);
    const j = await res.json();
    if (!res.ok) {
      setData({ round, endsAt: "", questions: [], error: j.error ?? "Failed to load" });
      return;
    }
    setData(j);
    const init: Record<string, { choice?: number; text?: string }> = {};
    for (const q of j.questions as Q[]) {
      init[q.id] = {};
    }
    setAnswers((prev) => ({ ...init, ...prev }));
  }, [round]);

  useEffect(() => {
    load();
  }, [load]);

  const expired = data?.endsAt && new Date(data.endsAt).getTime() < Date.now();

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
        body: JSON.stringify({ answers: filtered }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j.error ?? "Submit failed");
        return;
      }
      setMsg(`Saved. Points from this batch: ${j.gained ?? 0}`);
      router.refresh();
      load();
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Round {data.round}</h1>
          <p className="text-sm text-slate-500">Submit answers before the timer ends.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase text-slate-500">Time left</p>
          <RoundTimer endsAt={data.endsAt} />
        </div>
      </div>

      {expired && (
        <p className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3 text-amber-200">
          Time expired — you can still review, but submissions may be rejected.
        </p>
      )}

      <div className="space-y-8">
        {data.questions.map((q, idx) => (
          <div
            key={q.id}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-5"
          >
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-sky-500">Q{idx + 1}</span>
              <span className="text-xs text-slate-500">{q.points} pts · {q.kind}</span>
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
        <Link href="/dashboard" className="rounded-lg border border-slate-700 px-5 py-2.5 text-slate-300">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
