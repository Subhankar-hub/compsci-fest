import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { participantDisplayName } from "@/lib/participant-display";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "asc" },
  });

  const detailed = await Promise.all(
    teams.map(async (t) => {
      const [allQuiz, allCode] = await Promise.all([
        prisma.quizSubmission.findMany({ where: { teamId: t.id } }),
        prisma.codingSubmission.findMany({ where: { teamId: t.id } }),
      ]);
      const quizScore = allQuiz.reduce((s, x) => s + x.score, 0);
      const codingScore = allCode.reduce((s, x) => s + x.score, 0);
      const allSubs = [...allQuiz, ...allCode].sort(
        (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
      );
      const lastSubTime = allSubs.length > 0 ? allSubs[0].submittedAt.toISOString() : null;

      return {
        id: t.id,
        name: participantDisplayName(t),
        quizScore,
        codingScore,
        total: quizScore + codingScore,
        lastActive: lastSubTime,
      };
    }),
  );

  detailed.sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
  return NextResponse.json({ teams: detailed });
}
