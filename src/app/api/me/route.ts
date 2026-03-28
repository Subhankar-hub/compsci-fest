import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await getTeamSession();
  if (!s) return NextResponse.json({ team: null });

  const [teamRow, quizSum, codeSum] = await Promise.all([
    prisma.team.findUnique({
      where: { id: s.teamId },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        verified: true,
      },
    }),
    prisma.quizSubmission.aggregate({
      where: { teamId: s.teamId },
      _sum: { score: true },
    }),
    prisma.codingSubmission.aggregate({
      where: { teamId: s.teamId },
      _sum: { score: true },
    }),
  ]);

  if (!teamRow) {
    return NextResponse.json({ team: null });
  }

  return NextResponse.json({
    team: {
      name: teamRow.name,
      firstName: teamRow.firstName,
      lastName: teamRow.lastName,
      rollNo: teamRow.rollNo,
      verified: teamRow.verified,
    },
    score: (quizSum._sum.score ?? 0) + (codeSum._sum.score ?? 0),
    quizScore: quizSum._sum.score ?? 0,
    codingScore: codeSum._sum.score ?? 0,
  });
}
