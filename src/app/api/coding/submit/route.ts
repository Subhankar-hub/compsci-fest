import { NextResponse } from "next/server";
import { z } from "zod";
import { getTeamSession } from "@/lib/session";
import { assertRoundOpen } from "@/lib/round-window";
import { prisma } from "@/lib/prisma";
import { runJudge0 } from "@/lib/judge0";

const bodySchema = z.object({
  problemId: z.string(),
  code: z.string().min(1).max(100_000),
});

export async function POST(req: Request) {
  const session = await getTeamSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const tests = problem.tests as { input: string; output: string }[];
  const hasKey = Boolean(process.env.RAPIDAPI_KEY);

  if (!hasKey) {
    const row = await prisma.codingSubmission.upsert({
      where: {
        teamId_problemId: { teamId: session.teamId, problemId: problem.id },
      },
      create: {
        teamId: session.teamId,
        problemId: problem.id,
        code: parsed.data.code,
        status: "PENDING_REVIEW",
        passed: 0,
        total: tests.length,
        score: 0,
        detail: "Set RAPIDAPI_KEY on the server for auto-judging, or grade manually.",
      },
      update: {
        code: parsed.data.code,
        status: "PENDING_REVIEW",
        passed: 0,
        total: tests.length,
        score: 0,
        detail: "Pending review",
      },
    });
    return NextResponse.json({
      ok: true,
      status: row.status,
      passed: 0,
      total: tests.length,
      score: 0,
      detail: row.detail,
    });
  }

  const result = await runJudge0(parsed.data.code, problem.judge0LangId, tests);
  const ratio = tests.length ? result.passed / tests.length : 0;
  const score = Math.round(ratio * problem.points);

  const status = result.ok
    ? result.passed === tests.length
      ? "AC"
      : "PARTIAL"
    : "ERROR";

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
      detail: "detail" in result ? result.detail : result.error,
    },
    update: {
      code: parsed.data.code,
      status,
      passed: result.passed,
      total: tests.length,
      score,
      detail: "detail" in result ? result.detail : result.error,
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
