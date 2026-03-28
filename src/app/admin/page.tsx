"use client";

import { useCallback, useEffect, useState } from "react";

type Settings = {
  eventTitle: string;
  round1Mins: number;
  round2Mins: number;
  round3Mins: number;
  roundsUnlocked: number;
};
type TeamScore = { name: string; quizScore: number; codingScore: number; total: number; lastActive: string | null };

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [scores, setScores] = useState<TeamScore[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/settings");
    if (res.status === 401) {
      setAuthed(false);
      setSettings(null);
      return;
    }
    const s = await res.json();
    setAuthed(true);
    setSettings(s);
    const res2 = await fetch("/api/admin/submissions");
    if (res2.ok) {
      const j2 = await res2.json();
      setScores(j2.teams || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error ?? "Login failed");
        return;
      }
      setPassword("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSettings(null);
  }

  async function save(partial: Partial<Settings>) {
    setErr(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error ?? "Save failed");
      return;
    }
    setSettings(j);
  }

  if (!authed || !settings) {
    return (
      <div className="mx-auto max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-sm text-slate-500">
          Uses <code className="text-slate-400">ADMIN_PASSWORD</code> from server env.
        </p>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-200 py-2 font-semibold text-slate-900"
          >
            {loading ? "…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Event control</h1>
        <button type="button" onClick={logout} className="text-sm text-slate-500 hover:text-slate-300">
          Log out
        </button>
      </div>

      {err && <p className="text-sm text-red-400">{err}</p>}

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <label className="block text-sm text-slate-400">Event title</label>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          value={settings.eventTitle}
          onChange={(e) => setSettings({ ...settings, eventTitle: e.target.value })}
          onBlur={() => save({ eventTitle: settings.eventTitle })}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <p className="text-sm font-semibold text-slate-300">Rounds unlocked</p>
        <p className="text-xs text-slate-500">
          0 = none, 1 = round 1 only, 2 = rounds 1–2, 3 = all including coding.
        </p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setSettings({ ...settings, roundsUnlocked: n });
                save({ roundsUnlocked: n });
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${settings.roundsUnlocked === n
                  ? "bg-sky-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            ["round1Mins", "Round 1 (min)"],
            ["round2Mins", "Round 2 (min)"],
            ["round3Mins", "Round 3 (min)"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <label className="text-xs text-slate-500">{label}</label>
            <input
              type="number"
              min={5}
              max={300}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={settings[key]}
              onChange={(e) =>
                setSettings({ ...settings, [key]: Number(e.target.value) || 0 })
              }
              onBlur={() => save({ [key]: settings[key] })}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Live Scoreboard & Activity</h2>
          <button onClick={load} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded">Refresh</button>
        </div>
        <div className="overflow-x-auto text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Quiz</th>
                <th className="px-4 py-2">Coding</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scores.map((s) => (
                <tr key={s.name} className="hover:bg-slate-900/40 text-slate-300">
                  <td className="px-4 py-2 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-2">{s.quizScore}</td>
                  <td className="px-4 py-2">{s.codingScore}</td>
                  <td className="px-4 py-2 text-sky-400 font-bold">{s.total}</td>
                  <td className="px-4 py-2 text-xs text-slate-500">
                    {s.lastActive ? new Date(s.lastActive).toLocaleTimeString() : "Never"}
                  </td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No teams/data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
