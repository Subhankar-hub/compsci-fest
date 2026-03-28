import { NextResponse } from "next/server";
import { z } from "zod";
import { QuizKind } from "@prisma/client";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { round1Mcq, round2Short } from "@/data/quiz-round-seed";
import { codingRoundProblems } from "@/data/coding-round-seed";

const bodySchema = z.object({
  quiz: z.boolean().optional(),
  coding: z.boolean().optional(),
});

/** Replace quiz (R1+R2) and/or coding problems from repo seed files. Destructive for participant submissions in those scopes. */
export async function POST(req: Request) {
  const authed = await getAdminSession();
  if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const { quiz, coding } = parsed.data;
  if (!quiz && !coding) {
    return NextResponse.json({ error: "Set quiz and/or coding to true" }, { status: 400 });
  }

  const result: Record<string, number> = {};

  if (quiz) {
    await prisma.quizSubmission.deleteMany({
      where: { question: { round: { in: [1, 2] } } },
    });
    await prisma.quizQuestion.deleteMany({ where: { round: { in: [1, 2] } } });

    let order = 0;
    for (const q of round1Mcq) {
      await prisma.quizQuestion.create({
        data: {
          round: 1,
          order: order++,
          kind: QuizKind.MCQ,
          prompt: q.prompt,
          choices: q.choices,
          correctIndex: q.correctIndex,
          points: q.points ?? 1,
        },
      });
    }
    order = 0;
    for (const q of round2Short) {
      await prisma.quizQuestion.create({
        data: {
          round: 2,
          order: order++,
          kind: QuizKind.SHORT,
          prompt: q.prompt,
          acceptable: q.acceptable,
          points: q.points ?? 2,
        },
      });
    }
    result.quizRound1Questions = round1Mcq.length;
    result.quizRound2Questions = round2Short.length;
  }

  if (coding) {
    await prisma.codingSubmission.deleteMany();
    await prisma.codingProblem.deleteMany();
    for (const p of codingRoundProblems) {
      await prisma.codingProblem.create({
        data: {
          order: p.order,
          title: p.title,
          description: p.description,
          judge0LangId: p.judge0LangId,
          starterCode: p.starterCode,
          publicIn: p.publicIn,
          publicOut: p.publicOut,
          points: p.points,
          tests: p.tests as object,
        },
      });
    }
    result.codingProblems = codingRoundProblems.length;
  }

  return NextResponse.json({ ok: true, ...result });
}
