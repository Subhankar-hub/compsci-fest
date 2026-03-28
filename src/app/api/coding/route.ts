import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/session";
import { ensureVerifiedParticipant } from "@/lib/team-verification";
import { getSettings } from "@/lib/settings";
import { ensureRoundStarted } from "@/lib/round-window";
import { prisma } from "@/lib/prisma";
import { extractStarters, isFunctionalPack } from "@/lib/coding-bundle";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const v = await ensureVerifiedParticipant(session.teamId);
  if (v) return v;

  const settings = await getSettings();
  if (settings.roundsUnlocked < 3) {
    return NextResponse.json({ error: "Round locked" }, { status: 403 });
  }

  const window = await ensureRoundStarted(session.teamId, 3);
  const problems = await prisma.codingProblem.findMany({ orderBy: { order: "asc" } });
  const subs = await prisma.codingSubmission.findMany({
    where: { teamId: session.teamId },
  });
  const smap = new Map(subs.map((s) => [s.problemId, s]));

  return NextResponse.json({
    endsAt: window.endsAt.toISOString(),
    startedAt: window.startedAt.toISOString(),
    minutes: window.minutes,
    judgeConfigured: Boolean(process.env.RAPIDAPI_KEY),
    problems: problems.map((p) => {
      const testsUnknown = p.tests as unknown;
      const functional = isFunctionalPack(testsUnknown);
      const starters = extractStarters(testsUnknown, p.starterCode);
      return {
      id: p.id,
      order: p.order,
      title: p.title,
      description: p.description,
      points: p.points,
      starterCode: p.starterCode,
      functional,
      starters,
      publicIn: p.publicIn,
      publicOut: p.publicOut,
      submission: smap.get(p.id)
        ? {
            status: smap.get(p.id)!.status,
            passed: smap.get(p.id)!.passed,
            total: smap.get(p.id)!.total,
            score: smap.get(p.id)!.score,
            detail: smap.get(p.id)!.detail,
          }
        : null,
    };
    }),
  });
}
