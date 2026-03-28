import { JUDGE_USER_CODE_SLOT as U } from "@/lib/coding-bundle";

const PY_SUM = `import sys

${U}

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    nums = list(map(int, line.split()))
    print(array_sum(nums))
`;

const CPP_SUM = `#include <bits/stdc++.h>
using namespace std;

${U}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;
        stringstream ss(line);
        vector<int> v;
        int x;
        while (ss >> x) v.push_back(x);
        cout << arraySum(v) << "\\n";
    }
    return 0;
}
`;

const JAVA_SUM = `import java.io.*;
import java.util.*;

${U}

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String[] p = line.split("\\\\s+");
            int[] nums = new int[p.length];
            for (int i = 0; i < p.length; i++) nums[i] = Integer.parseInt(p[i]);
            System.out.println(new Solution().arraySum(nums));
        }
    }
}
`;

const PY_PAL = `import sys

${U}

for line in sys.stdin:
    s = line.strip()
    if not s:
        continue
    print(1 if is_palindrome(s) else 0)
`;

const CPP_PAL = `#include <bits/stdc++.h>
using namespace std;

${U}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string line;
    while (getline(cin, line)) {
        if (line.empty()) continue;
        cout << (isPalindrome(line) ? 1 : 0) << "\\n";
    }
    return 0;
}
`;

const JAVA_PAL = `import java.io.*;

${U}

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line;
        while ((line = br.readLine()) != null) {
            line = line.trim();
            if (line.isEmpty()) continue;
            System.out.println(new Solution().isPalindrome(line) ? 1 : 0);
        }
    }
}
`;

const PY_TWO = `import sys

${U}

raw = [x for x in sys.stdin.read().strip().split("\\n") if x.strip()]
target = int(raw[0])
nums = list(map(int, raw[1].split()))
i, j = two_sum(nums, target)
print(i, j)
`;

const CPP_TWO = `#include <bits/stdc++.h>
using namespace std;

${U}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int target;
    if (!(cin >> ws >> target)) return 0;
    vector<int> nums;
    int x;
    while (cin >> x) nums.push_back(x);
    Solution sol;
    vector<int> v = sol.twoSum(nums, target);
    cout << v[0] << " " << v[1] << "\\n";
    return 0;
}
`;

const JAVA_TWO = `import java.io.*;
import java.util.*;

${U}

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int target = Integer.parseInt(br.readLine().trim());
        String[] p = br.readLine().trim().split("\\\\s+");
        int[] nums = new int[p.length];
        for (int i = 0; i < p.length; i++) nums[i] = Integer.parseInt(p[i]);
        int[] r = new Solution().twoSum(nums, target);
        System.out.println(r[0] + " " + r[1]);
    }
}
`;

export const codingRoundProblems = [
  {
    order: 0,
    title: "Sum of integers (easy)",
    description: `Implement **array_sum** / **arraySum** so it returns the sum of all integers in the input list.

**Python:** define \`def array_sum(nums):\` — \`nums\` is a list of ints. Return the sum.

**C++:** define \`int arraySum(const vector<int>& nums)\` (or \`vector<int>&\`).

**Java:** define \`class Solution { public int arraySum(int[] nums) { ... } }\`

**Input (stdin):** one line of space-separated integers.  
**Output (stdout):** one integer — the sum.

Organisers grade by hand against the published spec; you only submit the function / class below (LeetCode / GFG style).`,
    judge0LangId: 71,
    starterCode: `def array_sum(nums):
    pass
`,
    publicIn: "1 2 3 4\n",
    publicOut: "10\n",
    points: 5,
    tests: {
      functional: true,
      starters: {
        "71": `def array_sum(nums):
    pass
`,
        "54": `int arraySum(vector<int>& nums) {
    return 0;
}
`,
        "62": `class Solution {
    public int arraySum(int[] nums) {
        return 0;
    }
}
`,
      },
      drivers: { "71": PY_SUM, "54": CPP_SUM, "62": JAVA_SUM },
      cases: [
        { input: "1 2 3 4\n", output: "10\n" },
        { input: "10\n", output: "10\n" },
        { input: "-2 5 -3 8\n", output: "8\n" },
        { input: "0 0 0\n", output: "0\n" },
      ],
    },
  },
  {
    order: 1,
    title: "Palindrome check (easy)",
    description: `Return whether the given string reads the same forwards and backwards (ignore case for letters is **not** required — strings are lowercase letters only in tests).

**Python:** \`def is_palindrome(s: str) -> bool\`

**C++:** \`bool isPalindrome(const string& s)\`

**Java:** \`class Solution { public boolean isPalindrome(String s) { ... } }\`

**Input:** one line — the string.  
**Output:** \`1\` if palindrome, else \`0\`.`,
    judge0LangId: 71,
    starterCode: `def is_palindrome(s):
    pass
`,
    publicIn: "racecar\n",
    publicOut: "1\n",
    points: 5,
    tests: {
      functional: true,
      starters: {
        "71": `def is_palindrome(s):
    pass
`,
        "54": `bool isPalindrome(const string& s) {
    return false;
}
`,
        "62": `class Solution {
    public boolean isPalindrome(String s) {
        return false;
    }
}
`,
      },
      drivers: { "71": PY_PAL, "54": CPP_PAL, "62": JAVA_PAL },
      cases: [
        { input: "racecar\n", output: "1\n" },
        { input: "hello\n", output: "0\n" },
        { input: "a\n", output: "1\n" },
        { input: "abba\n", output: "1\n" },
      ],
    },
  },
  {
    order: 2,
    title: "Two sum indices (medium)",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **0-based indices** \`i\` and \`j\` (\`i < j\`) such that \`nums[i] + nums[j] == target\`. Exactly one valid pair exists in tests.

**Python:** \`def two_sum(nums, target)\` — return a tuple \`(i, j)\`.

**C++:** \`class Solution { public: vector<int> twoSum(vector<int>& nums, int target); }\` — return \`{i, j}\`.

**Java:** \`class Solution { public int[] twoSum(int[] nums, int target); }\` — return \`new int[]{i, j}\`.

**Input:** line 1 = target, line 2 = space-separated nums.  
**Output:** two integers — indices separated by a space.`,
    judge0LangId: 71,
    starterCode: `def two_sum(nums, target):
    pass
`,
    publicIn: "9\n2 7 11 15\n",
    publicOut: "0 1\n",
    points: 10,
    tests: {
      functional: true,
      starters: {
        "71": `def two_sum(nums, target):
    pass
`,
        "54": `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 1};
    }
};
`,
        "62": `class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[] { 0, 1 };
    }
}
`,
      },
      drivers: { "71": PY_TWO, "54": CPP_TWO, "62": JAVA_TWO },
      cases: [
        { input: "9\n2 7 11 15\n", output: "0 1\n" },
        { input: "6\n3 3\n", output: "0 1\n" },
        { input: "6\n3 2 4\n", output: "1 2\n" },
        { input: "100\n5 25 75 30 70\n", output: "1 2\n" },
      ],
    },
  },
];
