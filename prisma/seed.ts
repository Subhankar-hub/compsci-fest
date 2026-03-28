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
    data: {
      name: "Demo User",
      firstName: "Demo",
      lastName: "User",
      rollNo: "DEMO001",
      passwordHash: demoHash,
      verified: true,
    },
  });

  const r1: { prompt: string; choices: string[]; correctIndex: number; points?: number }[] = [
    // Data Structures
    { prompt: "Time complexity of binary search on a sorted array of n elements?", choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctIndex: 1 },
    { prompt: "Which data structure is best for LRU cache with O(1) expected get/put?", choices: ["Array", "Queue only", "Hash map + doubly linked list", "Stack only"], correctIndex: 2 },
    { prompt: "A binary tree with n nodes has null pointers equal to:", choices: ["n", "n+1", "2n", "n-1"], correctIndex: 1 },
    { prompt: "What is the worst-case time complexity of quicksort (standard pivot choices)?", choices: ["O(n log n)", "O(n^2)", "O(log n)", "O(n)"], correctIndex: 1 },
    { prompt: "In a min-heap, finding the minimum element takes:", choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 0 },
    // Graph Theory / Algos
    { prompt: "BFS on an unweighted graph finds:", choices: ["Shortest path by edge count", "Minimum spanning tree", "Strongly connected components", "Topological order"], correctIndex: 0 },
    { prompt: "Dijkstra's algorithm requires:", choices: ["Non-negative edge weights", "Negative edges allowed", "Unweighted graph only", "DAG only"], correctIndex: 0 },
    { prompt: "Kruskal's algorithm finds the Minimum Spanning Tree using:", choices: ["BFS", "Disjoint Sets (Union-Find)", "Stacks", "Dynamic Programming"], correctIndex: 1 },
    { prompt: "Which of these is a typical application of Topological Sort?", choices: ["Shortest Path", "Dependency Resolution", "Cycle detection in undirected graph", "Maximum Flow"], correctIndex: 1 },
    { prompt: "A graph with V vertices and E edges is a tree if and only if it is connected and:", choices: ["E = V", "E = V - 1", "E = 2V", "E = V + 1"], correctIndex: 1 },
    // O/S
    { prompt: "Virtual memory + paging mainly helps with:", choices: ["Faster CPU clocks", "Using more address than physical RAM", "Eliminating syscalls", "Guaranteed latency"], correctIndex: 1 },
    { prompt: "A deadlock requires Coffman conditions. Which is NOT one of them?", choices: ["Mutual exclusion", "Hold and wait", "Preemption of resources", "Circular wait"], correctIndex: 2 },
    { prompt: "Semaphore vs mutex: a mutex is typically:", choices: ["Countable", "Owned by one thread at a time", "Only for processes", "Always busy-wait"], correctIndex: 1 },
    { prompt: "Which scheduling algorithm can starve long jobs?", choices: ["Round Robin", "Shortest Job First (SJF)", "First Come First Serve", "None"], correctIndex: 1 },
    { prompt: "Thrashing occurs when a system spends more time:", choices: ["Executing instructions", "Paging", "Interrupt handling", "I/O waiting"], correctIndex: 1 },
    // DBMS
    { prompt: "Third normal form (3NF) removes which kind of dependency?", choices: ["Partial dependency", "Transitive dependency on non-key attributes", "Multi-valued dependency", "Join dependency"], correctIndex: 1 },
    { prompt: "Name the ACID property that guarantees completed transactions survive crashes.", choices: ["Atomicity", "Consistency", "Isolation", "Durability"], correctIndex: 3 },
    { prompt: "Which SQL clause is used to filter groups created by GROUP BY?", choices: ["WHERE", "HAVING", "ORDER BY", "FILTER"], correctIndex: 1 },
    { prompt: "A transaction that reads uncommitted data from another transaction is called a:", choices: ["Dirty Read", "Non-repeatable read", "Phantom read", "Lost update"], correctIndex: 0 },
    { prompt: "What is a primary key's main function?", choices: ["Increase read speed", "Uniquely identify a record", "Link two tables", "Store binary data"], correctIndex: 1 },
    // Networks & System
    { prompt: "TCP is primarily associated with:", choices: ["Connectionless delivery", "Reliable ordered byte stream", "Broadcast", "Datagrams only"], correctIndex: 1 },
    { prompt: "IPv4 address size in bits?", choices: ["32", "64", "128", "16"], correctIndex: 0 },
    { prompt: "Which HTTP method should be idempotent for a REST API?", choices: ["POST", "PATCH", "GET", "OPTIONS"], correctIndex: 2 },
    { prompt: "The OSI model has how many layers?", choices: ["4", "5", "7", "9"], correctIndex: 2 },
    { prompt: "DNS primarily resolves:", choices: ["IP to MAC", "Domain Name to IP", "Port to Process", "HTTP to HTTPS"], correctIndex: 1 },
  ];

  let order = 0;
  for (const q of r1) {
    await prisma.quizQuestion.create({
      data: { round: 1, order: order++, kind: QuizKind.MCQ, prompt: q.prompt, choices: q.choices, correctIndex: q.correctIndex, points: q.points ?? 1 }
    });
  }

  const r2Mixed: { kind: QuizKind, prompt: string; choices?: string[]; correctIndex?: number; acceptable?: string[]; points?: number }[] = [
    { kind: QuizKind.SHORT, prompt: "What is the worst-case time complexity of quicksort?", acceptable: ["O(n^2)", "n^2", "quadratic", "n squared"] },
    { kind: QuizKind.SHORT, prompt: "Which architecture pattern isolates the user interface from business logic? (Hint: famous 3 letters)", acceptable: ["mvc", "model view controller"] },
    { kind: QuizKind.SHORT, prompt: "What traversal visits: root, then left subtree, then right subtree?", acceptable: ["preorder", "pre-order", "pre order"] },
    { kind: QuizKind.SHORT, prompt: "Which popular version control system was created by Linus Torvalds?", acceptable: ["git"] },
    { kind: QuizKind.SHORT, prompt: "In Big-O notation, what is slower: O(n log n) or O(n^2)?", acceptable: ["o(n^2)", "n^2"] },
    { kind: QuizKind.SHORT, prompt: "What command displays the current working directory in Linux?", acceptable: ["pwd"] },
    { kind: QuizKind.SHORT, prompt: "What does 'SQL' stand for?", acceptable: ["structured query language"] },
    { kind: QuizKind.SHORT, prompt: "What port does HTTPS typically operate on?", acceptable: ["443"] },
    { kind: QuizKind.MCQ, prompt: "In Git, what does `git rebase` essentially do?", choices: ["Deletes commits", "Rewrites commit history", "Creates a new branch", "Checks out code"], correctIndex: 1 },
    { kind: QuizKind.MCQ, prompt: "What is the primary language used for writing Android apps?", choices: ["Java/Kotlin", "Swift", "C#", "Ruby"], correctIndex: 0 },
    { kind: QuizKind.MCQ, prompt: "A Denial of Service (DoS) attack primarily targets:", choices: ["Data Confidentiality", "Data Integrity", "System Availability", "User Passwords"], correctIndex: 2 },
    { kind: QuizKind.MCQ, prompt: "What is Docker mainly used for?", choices: ["Database management", "Containerization", "Word processing", "Image editing"], correctIndex: 1 },
    { kind: QuizKind.MCQ, prompt: "In object-oriented programming, hiding the internal implementation is known as:", choices: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], correctIndex: 2 },
    { kind: QuizKind.MCQ, prompt: "Which algorithm is used for public-key cryptography?", choices: ["AES", "DES", "RSA", "RC4"], correctIndex: 2 },
    { kind: QuizKind.MCQ, prompt: "What does 'SOLID' stand for in software engineering?", choices: ["Single Responsibility, Open-Closed, Liskov, Interface, Dependency", "Safe, Open, Light, Isolated, Distributed", "Simple, Object-oriented, Logical, Integrated, Developed", "None of these"], correctIndex: 0 },
  ];

  order = 0;
  for (const q of r2Mixed) {
    await prisma.quizQuestion.create({
      data: { round: 2, order: order++, kind: q.kind, prompt: q.prompt, choices: q.choices, correctIndex: q.correctIndex, acceptable: q.acceptable, points: q.points ?? 2 }
    });
  }

  await prisma.codingProblem.create({
    data: {
      order: 0,
      title: "Sum of Array",
      description: "Read n, then n integers. Print their sum.\n\nInput: first line integer n, second line n space-separated integers.\nOutput: single integer sum.",
      judge0LangId: 71,
      starterCode: `n = int(input())\na = list(map(int, input().split()))\n# print the sum\n`,
      publicIn: "3\n1 2 3\n",
      publicOut: "6\n",
      points: 5,
      tests: [{ input: "3\n1 2 3\n", output: "6\n" }, { input: "1\n42\n", output: "42\n" }, { input: "4\n0 0 0 0\n", output: "0\n" }, { input: "5\n-1 1 -2 2 0\n", output: "0\n" }]
    }
  });

  await prisma.codingProblem.create({
    data: {
      order: 1,
      title: "Reverse Words",
      description: "Read a line of text. Print words in reverse order (word = non-space sequence). Words separated by single spaces in output.\n\nExample: \"hello world\" -> \"world hello\"",
      judge0LangId: 71,
      starterCode: `s = input().strip()\n# print reversed words separated by spaces\n`,
      publicIn: "hello world\n",
      publicOut: "world hello\n",
      points: 8,
      tests: [{ input: "hello world\n", output: "world hello\n" }, { input: "a b c\n", output: "c b a\n" }, { input: "one\n", output: "one\n" }, { input: "  spaced   out  \n", output: "out spaced\n" }]
    }
  });

  await prisma.codingProblem.create({
    data: {
      order: 2,
      title: "First Duplicate Frequency",
      description: "Read n, then n integers (possibly repeated). Print the first value that appears more than once in the order they are read (second occurrence triggers print). If none, print \"none\".\n\nExample: 1 2 3 2 -> 2",
      judge0LangId: 71,
      starterCode: `n = int(input())\nnums = list(map(int, input().split()))\n# print first duplicate or none\n`,
      publicIn: "5\n1 2 3 2 4\n",
      publicOut: "2\n",
      points: 12,
      tests: [{ input: "5\n1 2 3 2 4\n", output: "2\n" }, { input: "4\n1 1 2 3\n", output: "1\n" }, { input: "3\n1 2 3\n", output: "none\n" }, { input: "6\n7 8 9 8 7 7\n", output: "8\n" }]
    }
  });
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
