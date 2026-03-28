import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const ok = await getAdminSession();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teams = await prisma.team.findMany({
        include: {
            submissions: { orderBy: { submittedAt: "desc" }, take: 1 },
            codingSubs: { orderBy: { submittedAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "asc" }
    });

    const detailed = await Promise.all(teams.map(async (t: any) => {
        const allQuiz = await prisma.quizSubmission.findMany({ where: { teamId: t.id } });
        const allCode = await prisma.codingSubmission.findMany({ where: { teamId: t.id } });
        const quizScore = allQuiz.reduce((s: number, x: any) => s + x.score, 0);
        const codingScore = allCode.reduce((s: number, x: any) => s + x.score, 0);

        const allSubs = [...allQuiz, ...allCode].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        const lastSubTime = allSubs.length > 0 ? allSubs[0].submittedAt.toISOString() : null;

        return {
            name: t.name,
            quizScore,
            codingScore,
            total: quizScore + codingScore,
            lastActive: lastSubTime
        };
    }));

    detailed.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    return NextResponse.json({ teams: detailed });
}
