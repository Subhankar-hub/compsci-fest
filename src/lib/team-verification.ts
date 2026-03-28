import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Blocks quiz/coding APIs until an admin has approved the participant. */
export async function ensureVerifiedParticipant(teamId: string): Promise<NextResponse | null> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { verified: true },
  });
  if (!team) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!team.verified) {
    return NextResponse.json(
      {
        error:
          "Your account is pending admin approval before you can take part in the event.",
      },
      { status: 403 },
    );
  }
  return null;
}
