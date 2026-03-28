import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/session";
import { ensureVerifiedParticipant } from "@/lib/team-verification";
import { getSettings } from "@/lib/settings";
import { ensureRoundStarted } from "@/lib/round-window";
import { prisma } from "@/lib/prisma";
import { QuizKind } from "@prisma/client";

type Params = { params: Promise<{ round: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const v = await ensureVerifiedParticipant(session.teamId);
  if (v) return v;

  const { round: rs } = await params;
  const round = Number(rs);
  if (round !== 1 && round !== 2) {
    return NextResponse.json({ error: "Use /api/coding for round 3" }, { status: 400 });
  }

  const settings = await getSettings();
  if (settings.roundsUnlocked < round) {
    return NextResponse.json({ error: "Round locked" }, { status: 403 });
  }

  const window = await ensureRoundStarted(session.teamId, round as 1 | 2);
  const questions = await prisma.quizQuestion.findMany({
    where: { round },
    orderBy: { order: "asc" },
  });

  const existing = await prisma.quizSubmission.findMany({
    where: { teamId: session.teamId, questionId: { in: questions.map((q) => q.id) } },
  });
  const submitted = new Map(existing.map((e) => [e.questionId, e]));

  let roundScore = 0;
  const roundMax = questions.reduce((s, q) => s + q.points, 0);

  const payload = questions.map((q) => {
    const sub = submitted.get(q.id);
    if (sub) roundScore += sub.score;
    return {
      id: q.id,
      order: q.order,
      kind: q.kind,
      prompt: q.prompt,
      points: q.points,
      choices: q.kind === QuizKind.MCQ ? (q.choices as string[]) : null,
      answered:
        sub != null &&
        (q.kind === QuizKind.MCQ ? sub.choiceIndex != null : (sub.answerText?.length ?? 0) > 0),
    };
  });

  const allAnswered = payload.length > 0 && payload.every((q) => q.answered);

  return NextResponse.json({
    round,
    endsAt: window.endsAt.toISOString(),
    startedAt: window.startedAt.toISOString(),
    minutes: window.minutes,
    roundScore,
    roundMax,
    allAnswered,
    questions: payload,
  });
}
