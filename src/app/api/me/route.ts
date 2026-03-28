import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { participantDisplayName } from "@/lib/participant-display";

export async function GET() {
  const s = await getTeamSession();
  if (!s) return NextResponse.json({ team: null });

  const [teamRow, quizSubs, codeSum] = await Promise.all([
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
    prisma.quizSubmission.findMany({
      where: { teamId: s.teamId },
      select: { score: true, question: { select: { round: true } } },
    }),
    prisma.codingSubmission.aggregate({
      where: { teamId: s.teamId },
      _sum: { score: true },
    }),
  ]);

  if (!teamRow) {
    return NextResponse.json({ team: null });
  }

  let quizRound1 = 0;
  let quizRound2 = 0;
  for (const sub of quizSubs) {
    if (sub.question.round === 1) quizRound1 += sub.score;
    if (sub.question.round === 2) quizRound2 += sub.score;
  }
  const quizScore = quizRound1 + quizRound2;
  const codingScore = codeSum._sum.score ?? 0;

  return NextResponse.json({
    team: {
      displayName: participantDisplayName(teamRow),
      firstName: teamRow.firstName,
      lastName: teamRow.lastName,
      rollNo: teamRow.rollNo,
      verified: teamRow.verified,
    },
    score: quizScore + codingScore,
    quizScore,
    quizRound1Score: quizRound1,
    quizRound2Score: quizRound2,
    codingScore,
  });
}
