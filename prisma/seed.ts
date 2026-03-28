import { PrismaClient, QuizKind } from "@prisma/client";
import bcrypt from "bcryptjs";

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
      round1Mins: 45,
      round2Mins: 60,
      round3Mins: 75,
      roundsUnlocked: 3,
    },
  });

  const demoHash = await bcrypt.hash("demo123", 10);
  await prisma.team.create({
    data: { name: "Demo Team", passwordHash: demoHash },
  });

  const r1: { prompt: string; choices: string[]; correctIndex: number; points?: number }[] = [
    {
      prompt: "Time complexity of binary search on a sorted array of n elements?",
      choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctIndex: 1,
    },
    {
      prompt: "Which data structure is best for LRU cache with O(1) expected get/put?",
      choices: ["Array", "Queue only", "Hash map + doubly linked list", "Stack only"],
      correctIndex: 2,
    },
    {
      prompt: "TCP is primarily associated with:",
      choices: ["Connectionless delivery", "Reliable ordered byte stream", "Broadcast", "Datagrams only"],
      correctIndex: 1,
    },
    {
      prompt: "A deadlock requires (Coffman conditions) — which is NOT one of them?",
      choices: [
        "Mutual exclusion",
        "Hold and wait",
        "Preemption of resources",
        "Circular wait",
      ],
      correctIndex: 2,
    },
    {
      prompt: "Third normal form (3NF) removes which kind of dependency?",
      choices: [
        "Partial dependency on composite key",
        "Transitive dependency on non-key attributes",
        "Multi-valued dependency only",
        "Join dependency only",
      ],
      correctIndex: 1,
    },
    {
      prompt: "BFS on an unweighted graph finds:",
      choices: [
        "Shortest path by edge count from source",
        "Minimum spanning tree",
        "Strongly connected components",
        "Topological order",
      ],
      correctIndex: 0,
    },
    {
      prompt: "Virtual memory + paging mainly helps with:",
      choices: [
        "Faster CPU clocks",
        "Using more address space than physical RAM",
        "Eliminating syscalls",
        "Guaranteed real-time latency",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Which HTTP method should be idempotent for a REST API?",
      choices: ["POST", "PATCH", "GET", "All of the above"],
      correctIndex: 2,
    },
  ];

  let order = 0;
  for (const q of r1) {
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

  const r2Short: { prompt: string; acceptable: string[]; points?: number }[] = [
    {
      prompt: "What is the worst-case time complexity of quicksort (standard pivot choices)?",
      acceptable: ["o(n^2)", "O(n^2)", "n squared", "n^2", "quadratic"],
    },
    {
      prompt: "Name the ACID property that guarantees completed transactions survive crashes.",
      acceptable: ["durability", "durable"],
    },
    {
      prompt: "What traversal visits: root, then left subtree, then right subtree?",
      acceptable: ["preorder", "pre-order", "pre order", "dlr"],
    },
    {
      prompt: "IPv4 address size in bits?",
      acceptable: ["32", "thirty two", "thirty-two"],
    },
    {
      prompt: "Which scheduling algorithm can starve long jobs? (one word, common name)",
      acceptable: ["sjf", "shortest job first", "srtf", "shortest remaining time first"],
    },
  ];

  order = 0;
  for (const q of r2Short) {
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

  const r2Mcq: { prompt: string; choices: string[]; correctIndex: number }[] = [
    {
      prompt: "A binary tree with n nodes has null pointers equal to:",
      choices: ["n", "n+1", "2n", "n-1"],
      correctIndex: 1,
    },
    {
      prompt: "Semaphore vs mutex: a mutex is typically:",
      choices: [
        "Countable",
        "Owned by one thread at a time",
        "Only for processes",
        "Always busy-wait",
      ],
      correctIndex: 1,
    },
    {
      prompt: "Dijkstra's algorithm requires:",
      choices: [
        "Non-negative edge weights",
        "Negative edges allowed",
        "Unweighted graph only",
        "DAG only",
      ],
      correctIndex: 0,
    },
  ];

  for (const q of r2Mcq) {
    await prisma.quizQuestion.create({
      data: {
        round: 2,
        order: order++,
        kind: QuizKind.MCQ,
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
        points: 1,
      },
    });
  }

  await prisma.codingProblem.create({
    data: {
      order: 0,
      title: "Sum of Array",
      description:
        "Read n, then n integers. Print their sum.\n\nInput: first line integer n, second line n space-separated integers.\nOutput: single integer sum.",
      judge0LangId: 71,
      starterCode: `n = int(input())
a = list(map(int, input().split()))
# print the sum
`,
      publicIn: "3\n1 2 3\n",
      publicOut: "6\n",
      points: 5,
      tests: [
        { input: "3\n1 2 3\n", output: "6\n" },
        { input: "1\n42\n", output: "42\n" },
        { input: "4\n0 0 0 0\n", output: "0\n" },
        { input: "5\n-1 1 -2 2 0\n", output: "0\n" },
      ],
    },
  });

  await prisma.codingProblem.create({
    data: {
      order: 1,
      title: "Reverse Words",
      description:
        "Read a line of text. Print words in reverse order (word = non-space sequence). Words separated by single spaces in output.\n\nExample: \"hello world\" -> \"world hello\"",
      judge0LangId: 71,
      starterCode: `s = input().strip()
# print reversed words separated by spaces
`,
      publicIn: "hello world\n",
      publicOut: "world hello\n",
      points: 8,
      tests: [
        { input: "hello world\n", output: "world hello\n" },
        { input: "a b c\n", output: "c b a\n" },
        { input: "one\n", output: "one\n" },
        { input: "  spaced   out  \n", output: "out spaced\n" },
      ],
    },
  });

  await prisma.codingProblem.create({
    data: {
      order: 2,
      title: "First Duplicate Frequency",
      description:
        "Read n, then n integers (possibly repeated). Print the first value that appears more than once in the order they are read (second occurrence triggers print). If none, print \"none\".\n\nExample: 1 2 3 2 -> 2",
      judge0LangId: 71,
      starterCode: `n = int(input())
nums = list(map(int, input().split()))
# print first duplicate or none
`,
      publicIn: "5\n1 2 3 2 4\n",
      publicOut: "2\n",
      points: 12,
      tests: [
        { input: "5\n1 2 3 2 4\n", output: "2\n" },
        { input: "4\n1 1 2 3\n", output: "1\n" },
        { input: "3\n1 2 3\n", output: "none\n" },
        { input: "6\n7 8 9 8 7 7\n", output: "8\n" },
      ],
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
