import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signTeamToken, TEAM } from "@/lib/session";

const bodySchema = z.object({
  name: z.string().min(2).max(64).trim(),
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
  const { name, password, firstName, lastName, rollNo } = parsed.data;
  const exists = await prisma.team.findUnique({ where: { name } });
  if (exists) {
    return NextResponse.json({ error: "Participant name already taken" }, { status: 409 });
  }
  const rollTaken = await prisma.team.findUnique({ where: { rollNo } });
  if (rollTaken) {
    return NextResponse.json({ error: "Roll number already registered" }, { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const team = await prisma.team.create({
    data: {
      name,
      passwordHash,
      firstName,
      lastName,
      rollNo,
      verified: false,
    },
  });
  const token = await signTeamToken(team.id, team.name);
  const res = NextResponse.json({ ok: true, name: team.name });
  res.cookies.set(TEAM, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
