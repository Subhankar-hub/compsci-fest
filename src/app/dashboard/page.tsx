"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Me = {
  team: {
    name: string;
    firstName: string;
    lastName: string;
    rollNo: string | null;
    verified: boolean;
  } | null;
  score: number;
  quizScore: number;
  codingScore: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/me");
    const data = await res.json();
    setMe(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!me) {
    return <p className="text-slate-400">Loading…</p>;
  }

  if (!me.team) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-slate-400">You are not logged in.</p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const { team } = me;
  const displayName = [team.firstName, team.lastName].filter(Boolean).join(" ") || team.name;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">
            <span className="font-medium text-sky-300">{displayName}</span>
            {team.rollNo ? (
              <>
                {" "}
                · Roll <span className="text-slate-300">{team.rollNo}</span>
              </>
            ) : null}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">Login: {team.name}</p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="text-sm text-slate-500 hover:text-slate-300"
        >
          Log out
        </button>
      </div>

      {!team.verified && (
        <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-100/90">
          Your registration is waiting for admin approval. You can review scores here, but rounds stay locked
          until an organiser verifies your account.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-white">{me.score}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase text-slate-500">Quiz rounds</p>
          <p className="mt-1 text-2xl font-bold text-slate-200">{me.quizScore}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase text-slate-500">Coding</p>
          <p className="mt-1 text-2xl font-bold text-slate-200">{me.codingScore}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Rounds</h2>
        <div className="flex flex-col gap-2">
          {team.verified ? (
            <>
              <Link
                href="/round/1"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 hover:border-slate-700"
              >
                <span className="font-medium text-white">Round 1 — Core CS (MCQ)</span>
                <span className="text-sky-400">Open →</span>
              </Link>
              <Link
                href="/round/2"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 hover:border-slate-700"
              >
                <span className="font-medium text-white">Round 2 — Mixed (short + MCQ)</span>
                <span className="text-sky-400">Open →</span>
              </Link>
              <Link
                href="/coding"
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 hover:border-slate-700"
              >
                <span className="font-medium text-white">Round 3 — Coding</span>
                <span className="text-sky-400">Open →</span>
              </Link>
            </>
          ) : (
            <p className="rounded-xl border border-slate-800 bg-slate-900/20 px-4 py-3 text-sm text-slate-500">
              Rounds appear here after your account is approved.
            </p>
          )}
        </div>
        {team.verified && (
          <p className="text-xs text-slate-600">
            Rounds unlock from the admin panel. Each round uses a per-participant timer from your first
            visit.
          </p>
        )}
      </div>

      <Link href="/leaderboard" className="inline-block text-sm text-sky-400 hover:underline">
        View leaderboard →
      </Link>
    </div>
  );
}
