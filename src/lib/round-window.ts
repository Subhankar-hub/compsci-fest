import { prisma } from "./prisma";
import { getSettings } from "./settings";

export async function ensureRoundStarted(teamId: string, round: 1 | 2 | 3) {
  const settings = await getSettings();
  const mins =
    round === 1 ? settings.round1Mins : round === 2 ? settings.round2Mins : settings.round3Mins;

  let rs = await prisma.roundStart.findUnique({
    where: { teamId_round: { teamId, round } },
  });
  if (!rs) {
    rs = await prisma.roundStart.create({
      data: { teamId, round },
    });
  }
  const endsAt = new Date(rs.startedAt.getTime() + mins * 60_000);
  return { startedAt: rs.startedAt, endsAt, minutes: mins };
}

export async function assertRoundOpen(teamId: string, round: 1 | 2 | 3) {
  const settings = await getSettings();
  if (settings.roundsUnlocked < round) {
    return { ok: false as const, error: "Round locked" };
  }
  const { endsAt } = await ensureRoundStarted(teamId, round);
  if (Date.now() > endsAt.getTime()) {
    return { ok: false as const, error: "Time expired for this round" };
  }
  return { ok: true as const, endsAt };
}
