import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      verified: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ participants: teams });
}

const patchSchema = z.object({
  teamId: z.string().min(1),
  verified: z.boolean(),
});

export async function PATCH(req: Request) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { teamId, verified } = parsed.data;
  try {
    const row = await prisma.team.update({
      where: { id: teamId },
      data: { verified },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        verified: true,
        createdAt: true,
      },
    });
    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }
}

export async function DELETE(req: Request) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId")?.trim();
  if (!teamId) {
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
  }

  try {
    await prisma.team.delete({ where: { id: teamId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }
}
