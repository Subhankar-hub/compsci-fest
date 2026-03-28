import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getTeamSession();
  if (!s) return NextResponse.json({ team: null });

  const [quizSum, codeSum] = await Promise.all([
    prisma.quizSubmission.aggregate({
      where: { teamId: s.teamId },
      _sum: { score: true },
    }),
    prisma.codingSubmission.aggregate({
      where: { teamId: s.teamId },
      _sum: { score: true },
    }),
  ]);

  return NextResponse.json({
    team: { name: s.name },
    score: (quizSum._sum.score ?? 0) + (codeSum._sum.score ?? 0),
    quizScore: quizSum._sum.score ?? 0,
    codingScore: codeSum._sum.score ?? 0,
  });
}
