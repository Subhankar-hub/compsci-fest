import { NextResponse } from "next/server";
import { z } from "zod";
import { getTeamSession } from "@/lib/session";
import { ensureVerifiedParticipant } from "@/lib/team-verification";
import { assertRoundOpen } from "@/lib/round-window";
import { prisma } from "@/lib/prisma";
import { buildBundledSource } from "@/lib/coding-bundle";
import { runJudgeCE } from "@/lib/judge0-ce";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(100_000),
  langId: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const v = await ensureVerifiedParticipant(session.teamId);
  if (v) return v;

  const gate = await assertRoundOpen(session.teamId, 3);
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

  const problem = await prisma.codingProblem.findUnique({
    where: { id: parsed.data.problemId },
  });
  if (!problem) {
    return NextResponse.json({ error: "Unknown problem" }, { status: 404 });
  }

  const testsRaw = problem.tests;
  const bundled = buildBundledSource(parsed.data.code, parsed.data.langId ?? problem.judge0LangId, testsRaw);
  if (!bundled.ok) {
    return NextResponse.json({ error: bundled.error }, { status: 400 });
  }
  const { source: fullSource, cases: tests } = bundled;

  const judgeLang = parsed.data.langId ?? problem.judge0LangId;
  const result = await runJudgeCE(fullSource, judgeLang, tests);

  if (!result.ok) {
    const row = await prisma.codingSubmission.upsert({
      where: {
        teamId_problemId: { teamId: session.teamId, problemId: problem.id },
      },
      create: {
        teamId: session.teamId,
        problemId: problem.id,
        code: parsed.data.code,
        status: "ERROR",
        passed: result.passed,
        total: tests.length,
        score: 0,
        detail: result.error,
      },
      update: {
        code: parsed.data.code,
        status: "ERROR",
        passed: result.passed,
        total: tests.length,
        score: 0,
        detail: result.error,
      },
    });
    return NextResponse.json({
      ok: true,
      status: row.status,
      passed: row.passed,
      total: row.total,
      score: 0,
      detail: row.detail,
    });
  }

  const ratio = tests.length ? result.passed / tests.length : 0;
  const score = Math.round(ratio * problem.points);

  const status =
    result.passed === tests.length ? "AC" : result.passed > 0 ? "PARTIAL" : "WA";

  const detail = result.detail;

  const row = await prisma.codingSubmission.upsert({
    where: {
      teamId_problemId: { teamId: session.teamId, problemId: problem.id },
    },
    create: {
      teamId: session.teamId,
      problemId: problem.id,
      code: parsed.data.code,
      status,
      passed: result.passed,
      total: tests.length,
      score,
      detail,
    },
    update: {
      code: parsed.data.code,
      status,
      passed: result.passed,
      total: tests.length,
      score,
      detail,
    },
  });

  return NextResponse.json({
    ok: true,
    status: row.status,
    passed: row.passed,
    total: row.total,
    score: row.score,
    detail: row.detail,
  });
}
