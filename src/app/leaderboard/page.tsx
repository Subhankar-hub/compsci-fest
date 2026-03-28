"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  name: string;
  quizScore: number;
  codingScore: number;
  total: number;
  lastActive?: string | null;
};

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []));
  }, []);

  if (!rows) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Participant</th>
              <th className="px-4 py-3">Quiz</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Latest Submission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No participants yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.name}</td>
                  <td className="px-4 py-3 text-slate-400">{r.quizScore}</td>
                  <td className="px-4 py-3 text-slate-400">{r.codingScore}</td>
                  <td className="px-4 py-3 font-semibold text-sky-300">{r.total}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.lastActive ? new Date(r.lastActive).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
