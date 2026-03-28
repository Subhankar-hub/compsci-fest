import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

const patchSchema = z.object({
  roundsUnlocked: z.number().int().min(0).max(3).optional(),
  round1Mins: z.number().int().min(5).max(300).optional(),
  round2Mins: z.number().int().min(5).max(300).optional(),
  round3Mins: z.number().int().min(5).max(300).optional(),
  eventTitle: z.string().min(2).max(120).optional(),
});

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const s = await getSettings();
  return NextResponse.json(s);
}

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

  const s = await prisma.settings.update({
    where: { id: 1 },
    data: parsed.data,
  });
  return NextResponse.json(s);
}
