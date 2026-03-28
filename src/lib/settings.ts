import { prisma } from "./prisma";

export async function getSettings() {
  let s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) {
    s = await prisma.settings.create({
      data: {
        id: 1,
        eventTitle: "Computational Science",
        round1Mins: 45,
        round2Mins: 60,
        round3Mins: 75,
        roundsUnlocked: 0,
      },
    });
  }
  return s;
}
