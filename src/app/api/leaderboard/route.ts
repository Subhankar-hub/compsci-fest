import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teams = await prisma.team.findMany({
    include: {
      submissions: true,
      codingSubs: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const rows = teams
    .map((t) => {
      const quiz = t.submissions.reduce((s, x) => s + x.score, 0);
      const code = t.codingSubs.reduce((s, x) => s + x.score, 0);
      return {
        name: t.name,
        quizScore: quiz,
        codingScore: code,
        total: quiz + code,
      };
    })
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return NextResponse.json({ rows });
}
