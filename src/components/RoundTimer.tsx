"use client";

import { useEffect, useState } from "react";

export function RoundTimer({ endsAt }: { endsAt: string }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    function tick() {
      const s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setLeft(s);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (left === null) return <span className="text-slate-500">…</span>;
  const m = Math.floor(left / 60);
  const s = left % 60;
  const urgent = left < 300;
  return (
    <span
      className={`font-mono text-lg font-semibold ${urgent ? "text-amber-400" : "text-slate-200"}`}
    >
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}
