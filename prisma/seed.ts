import { PrismaClient, QuizKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { codingRoundProblems } from "../src/data/coding-round-seed";
import { round1Mcq, round2Short } from "../src/data/quiz-round-seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.quizSubmission.deleteMany();
  await prisma.codingSubmission.deleteMany();
  await prisma.roundStart.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.codingProblem.deleteMany();
  await prisma.team.deleteMany();
  await prisma.settings.deleteMany();

  await prisma.settings.create({
    data: {
      id: 1,
      eventTitle: "Computational Science",
      round1Mins: 50,
      round2Mins: 55,
      round3Mins: 75,
      roundsUnlocked: 3,
    },
  });

  const demoHash = await bcrypt.hash("demo123", 10);
  await prisma.team.create({
    data: {
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      rollNo: "DEMO001",
      passwordHash: demoHash,
      verified: true,
    },
  });

  let order = 0;
  for (const q of round1Mcq) {
    await prisma.quizQuestion.create({
      data: {
        round: 1,
        order: order++,
        kind: QuizKind.MCQ,
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
        points: q.points ?? 1,
      },
    });
  }

  order = 0;
  for (const q of round2Short) {
    await prisma.quizQuestion.create({
      data: {
        round: 2,
        order: order++,
        kind: QuizKind.SHORT,
        prompt: q.prompt,
        acceptable: q.acceptable,
        points: q.points ?? 2,
      },
    });
  }

  for (const p of codingRoundProblems) {
    await prisma.codingProblem.create({
      data: {
        order: p.order,
        title: p.title,
        description: p.description,
        judge0LangId: p.judge0LangId,
        starterCode: p.starterCode,
        publicIn: p.publicIn,
        publicOut: p.publicOut,
        points: p.points,
        tests: p.tests as object,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
