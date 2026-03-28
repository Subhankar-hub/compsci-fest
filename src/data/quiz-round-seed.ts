import { QuizKind } from "@prisma/client";

export type McqSeed = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  points?: number;
};

export type ShortSeed = {
  prompt: string;
  acceptable: string[];
  points?: number;
};

/** 30 core CS MCQs — Round 1 */
export const round1Mcq: McqSeed[] = [
  { prompt: "Time complexity of binary search on a sorted array of n elements?", choices: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctIndex: 1 },
  { prompt: "Which structure is commonly used for an LRU cache with O(1) expected get/put?", choices: ["Array only", "Hash map + doubly linked list", "Stack only", "Queue only"], correctIndex: 1 },
  { prompt: "A binary tree with n nodes has how many null child pointers?", choices: ["n", "n+1", "2n", "n-1"], correctIndex: 1 },
  { prompt: "Worst-case time complexity of quicksort (typical pivot schemes)?", choices: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"], correctIndex: 1 },
  { prompt: "In a min-heap, finding the minimum element takes:", choices: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctIndex: 0 },
  { prompt: "BFS on an unweighted graph finds:", choices: ["Shortest path by edge count", "Minimum spanning tree", "Topological order", "Max flow"], correctIndex: 0 },
  { prompt: "Dijkstra's shortest path algorithm requires:", choices: ["Non-negative edge weights", "Negative edges allowed", "Unweighted only", "DAG only"], correctIndex: 0 },
  { prompt: "Kruskal's MST algorithm relies heavily on:", choices: ["BFS only", "Disjoint sets (union-find)", "DFS only", "Topological sort"], correctIndex: 1 },
  { prompt: "A classic application of topological sorting is:", choices: ["Shortest paths", "Dependency / task ordering", "MST", "Cycle detection in undirected graphs"], correctIndex: 1 },
  { prompt: "A connected graph with V vertices is a tree if and only if E equals:", choices: ["V", "V-1", "V+1", "2V"], correctIndex: 1 },
  { prompt: "Virtual memory with paging mainly enables:", choices: ["Faster CPU clocks", "Using more logical address space than physical RAM", "Removing syscalls", "Zero disk I/O"], correctIndex: 1 },
  { prompt: "Which is NOT one of the four necessary conditions for deadlock (Coffman)?", choices: ["Mutual exclusion", "Hold and wait", "Preemption of resources", "Circular wait"], correctIndex: 2 },
  { prompt: "A mutex is typically:", choices: ["Countable like a semaphore", "Owned by at most one thread at a time", "Only for kernel code", "Always busy-wait only"], correctIndex: 1 },
  { prompt: "Which scheduler may starve long jobs?", choices: ["FCFS", "Round Robin", "Shortest Job First (SJF)", "None"], correctIndex: 2 },
  { prompt: "Thrashing usually means the system spends excessive time:", choices: ["Executing ALU ops", "Paging / swapping", "DNS lookups", "Compiling"], correctIndex: 1 },
  { prompt: "Third normal form (3NF) mainly eliminates:", choices: ["Partial dependency on a composite key", "Transitive dependency through non-key attributes", "Multi-valued attributes only", "Only index columns"], correctIndex: 1 },
  { prompt: "Which ACID property ensures committed transactions survive crashes?", choices: ["Atomicity", "Consistency", "Isolation", "Durability"], correctIndex: 3 },
  { prompt: "SQL clause used to filter grouped rows after GROUP BY:", choices: ["WHERE", "HAVING", "ORDER BY", "LIMIT"], correctIndex: 1 },
  { prompt: "Reading another transaction's uncommitted data is called:", choices: ["Dirty read", "Phantom read", "Deadlock", "Normalization"], correctIndex: 0 },
  { prompt: "A primary key's main role is to:", choices: ["Speed up every query", "Uniquely identify rows in a table", "Encrypt data", "Define file layout"], correctIndex: 1 },
  { prompt: "TCP is best described as:", choices: ["Unreliable datagrams", "Connection-oriented reliable byte stream", "Layer-2 framing", "Broadcast only"], correctIndex: 1 },
  { prompt: "IPv4 addresses are how many bits long?", choices: ["16", "32", "64", "128"], correctIndex: 1 },
  { prompt: "Which HTTP method should be safe and idempotent in typical REST design?", choices: ["POST", "PATCH", "GET", "CONNECT"], correctIndex: 2 },
  { prompt: "The OSI reference model has how many layers?", choices: ["4", "5", "7", "9"], correctIndex: 2 },
  { prompt: "DNS primarily maps:", choices: ["MAC to IP", "Domain names to IP addresses", "Ports to PIDs", "HTTP to FTP"], correctIndex: 1 },
  { prompt: "A stack is:", choices: ["FIFO", "LIFO", "Random access only", "Always balanced BST"], correctIndex: 1 },
  { prompt: "Average-case lookup in a well-implemented hash table is typically:", choices: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], correctIndex: 2 },
  { prompt: "DFS on a graph is naturally implemented using:", choices: ["Only queues", "Recursion or an explicit stack", "Only priority queues", "Only heaps"], correctIndex: 1 },
  { prompt: "In-order traversal of a BST visits nodes in:", choices: ["Random order", "Sorted key order (if tree is valid BST)", "Reverse sorted only", "Level order"], correctIndex: 1 },
  { prompt: "Amortized time to append at the end of a dynamic array (vector) when it may resize is:", choices: ["Always O(n)", "O(1) amortized", "O(log n)", "O(n^2)"], correctIndex: 1 },
];

/** 20 short answers — core CS + basic problem solving; grading is case- and spacing-insensitive */
export const round2Short: ShortSeed[] = [
  { prompt: "What is the space complexity of the merge sort algorithm (extra memory, not counting input)?", acceptable: ["o(n)", "n", "linear", "linear space"] },
  { prompt: "Name the layer in the OSI model that provides end-to-end transport (e.g. TCP lives here).", acceptable: ["transport", "layer 4", "fourth layer", "transport layer"] },
  { prompt: "What does 'SQL' stand for?", acceptable: ["structured query language"] },
  { prompt: "In Big-O, which grows faster as n increases: O(n log n) or O(n^2)?", acceptable: ["o(n^2)", "n^2", "quadratic", "n squared", "on2"] },
  { prompt: "What command prints the current working directory in Unix/Linux shells?", acceptable: ["pwd"] },
  { prompt: "Which version control system was created by Linus Torvalds?", acceptable: ["git"] },
    { prompt: "What traversal order visits a binary tree as: root, then left subtree, then right subtree?", acceptable: ["preorder", "pre-order", "pre order", "dlr"] },
  { prompt: "What design pattern separates UI from business logic (three letters)?", acceptable: ["mvc", "model view controller", "model-view-controller"] },
  { prompt: "What is the maximum number of children any node can have in a binary tree?", acceptable: ["2", "two"] },
  { prompt: "What does CPU stand for?", acceptable: ["central processing unit"] },
  { prompt: "HTTPS typically uses which port (default)?", acceptable: ["443"] },
  { prompt: "In OOP, which principle hides internal implementation details behind an interface?", acceptable: ["encapsulation", "abstraction", "data hiding"] },
  { prompt: "What data structure is used for a function call stack in most languages?", acceptable: ["stack"] },
  { prompt: "Worst-case height of a binary search tree with n nodes (no balancing)?", acceptable: ["n", "o(n)", "linear", "n nodes"] },
  { prompt: "SQL keyword to remove duplicate rows from result set?", acceptable: ["distinct"] },
  { prompt: "What does a pointer (or reference) store?", acceptable: ["address", "memory address", "location", "reference to memory"] },
  { prompt: "IPv6 addresses are how many bits long?", acceptable: ["128"] },
  { prompt: "In a relational DB, a column that refers to another table's primary key is called a:", acceptable: ["foreign key", "fk", "foreign"] },
  { prompt: "Name one of the four Coffman conditions for deadlock (any one).", acceptable: ["mutual exclusion", "hold and wait", "no preemption", "non-preemption", "circular wait"] },
  { prompt: "What is the time complexity of inserting into a hash map on average (expected)?", acceptable: ["o(1)", "1", "constant", "order 1"] },
];
