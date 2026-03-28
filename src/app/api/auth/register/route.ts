import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { participantDisplayName } from "@/lib/participant-display";
import { signTeamToken, TEAM } from "@/lib/session";

const bodySchema = z.object({
  password: z.string().min(6).max(128),
  firstName: z.string().min(1).max(64).trim(),
  lastName: z.string().min(1).max(64).trim(),
  rollNo: z.string().min(1).max(32).trim(),
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
    return NextResponse.json({ error: "Invalid registration details" }, { status: 400 });
  }
  const { password, firstName, lastName, rollNo } = parsed.data;
  const rollTaken = await prisma.team.findUnique({ where: { rollNo } });
  if (rollTaken) {
    return NextResponse.json({ error: "Roll number already registered" }, { status: 409 });
  }
  const displayName = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
  const passwordHash = await bcrypt.hash(password, 10);
  const team = await prisma.team.create({
    data: {
      name: `${displayName} (${rollNo})`,
      passwordHash,
      firstName,
      lastName,
      rollNo,
      verified: false,
    },
  });
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
