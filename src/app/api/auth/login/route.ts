import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { participantDisplayName } from "@/lib/participant-display";
import { signTeamToken, TEAM } from "@/lib/session";

const bodySchema = z.object({
  rollNo: z.string().min(1).max(32).trim(),
  password: z.string().min(1).max(128),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const { rollNo, password } = parsed.data;
  const team = await prisma.team.findUnique({ where: { rollNo } });
  if (!team) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, team.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await signTeamToken(team.id, participantDisplayName(team));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TEAM, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
