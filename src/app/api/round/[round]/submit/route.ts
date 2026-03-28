import { NextResponse } from "next/server";
import { z } from "zod";
import { getTeamSession } from "@/lib/session";
import { ensureVerifiedParticipant } from "@/lib/team-verification";
import { assertRoundOpen } from "@/lib/round-window";
import { prisma } from "@/lib/prisma";
import { scoreAnswer } from "@/lib/score-quiz";
import { QuizKind } from "@prisma/client";

type Params = { params: Promise<{ round: string }> };

const item = z.object({
  questionId: z.string(),
  choiceIndex: z.number().int().min(0).optional(),
  answerText: z.string().max(2000).optional(),
});

const bodySchema = z.object({
  answers: z.array(item).min(1),
});

export async function POST(req: Request, { params }: Params) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const v = await ensureVerifiedParticipant(session.teamId);
  if (v) return v;

  const { round: rs } = await params;
  const round = Number(rs);
  if (round !== 1 && round !== 2) {
    return NextResponse.json({ error: "Invalid round" }, { status: 400 });
  }

  const gate = await assertRoundOpen(session.teamId, round as 1 | 2);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const questions = await prisma.quizQuestion.findMany({
    where: { round },
  });
  const qmap = new Map(questions.map((q) => [q.id, q]));

  let gained = 0;
  for (const a of parsed.data.answers) {
    const q = qmap.get(a.questionId);
    if (!q) continue;
    if (q.kind === QuizKind.MCQ && a.choiceIndex == null) continue;
    if (q.kind === QuizKind.SHORT && (a.answerText == null || !a.answerText.trim())) continue;

    const sc = scoreAnswer(q, a.choiceIndex ?? null, a.answerText ?? null);
    gained += sc;

    await prisma.quizSubmission.upsert({
      where: {
        teamId_questionId: { teamId: session.teamId, questionId: q.id },
      },
      create: {
        teamId: session.teamId,
        questionId: q.id,
        choiceIndex: q.kind === QuizKind.MCQ ? a.choiceIndex ?? null : null,
        answerText: q.kind === QuizKind.SHORT ? (a.answerText ?? "").trim() : null,
        score: sc,
      },
      update: {
        choiceIndex: q.kind === QuizKind.MCQ ? a.choiceIndex ?? null : null,
        answerText: q.kind === QuizKind.SHORT ? (a.answerText ?? "").trim() : null,
        score: sc,
      },
    });
  }

  const subs = await prisma.quizSubmission.findMany({
    where: { teamId: session.teamId, questionId: { in: questions.map((q) => q.id) } },
  });
  const subByQ = new Map(subs.map((s) => [s.questionId, s]));
  let roundScore = 0;
  const roundMax = questions.reduce((s, q) => s + q.points, 0);
  for (const q of questions) {
    const sub = subByQ.get(q.id);
    if (sub) roundScore += sub.score;
  }
  const allAnswered = questions.every((q) => {
    const sub = subByQ.get(q.id);
    if (!sub) return false;
    return q.kind === QuizKind.MCQ
      ? sub.choiceIndex != null
      : (sub.answerText?.trim().length ?? 0) > 0;
  });

  return NextResponse.json({
    ok: true,
    gained,
    roundScore,
    roundMax,
    roundComplete: allAnswered,
  });
}
