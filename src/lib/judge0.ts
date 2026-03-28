type TestCase = { input: string; output: string };

function norm(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
}

function readStdout(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "";
  const compact = raw.replace(/\s/g, "");
  if (/^[A-Za-z0-9+/]+=*$/.test(compact) && compact.length > 3) {
    try {
      return Buffer.from(raw, "base64").toString("utf8");
    } catch {
      return raw;
    }
  }
  return raw;
}

function b64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

export type JudgeResult =
  | { ok: true; passed: number; total: number; detail?: string }
  | { ok: false; error: string; passed: number; total: number };

export async function runJudge0(
  code: string,
  languageId: number,
  tests: TestCase[],
): Promise<JudgeResult> {
  const key = process.env.RAPIDAPI_KEY;
  const host = process.env.JUDGE0_HOST ?? "judge0-ce.p.rapidapi.com";

  if (!key || tests.length === 0) {
    return {
      ok: false,
      error: "Auto-judge not configured (set RAPIDAPI_KEY) or no tests.",
      passed: 0,
      total: tests.length,
    };
  }

  let passed = 0;
  const snippets: string[] = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const res = await fetch(
      `https://${host}/submissions?base64_encoded=true&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": key,
          "X-RapidAPI-Host": host,
        },
        body: JSON.stringify({
          language_id: languageId,
          source_code: b64(code),
          stdin: b64(t.input),
        }),
      },
    );

    if (!res.ok) {
      return {
        ok: false,
        error: `Judge0 HTTP ${res.status}`,
        passed,
        total: tests.length,
      };
    }

    const data = (await res.json()) as {
      status?: { id?: number; description?: string };
      stdout?: string | null;
      stderr?: string | null;
      compile_output?: string | null;
    };

    const desc = data.status?.description ?? "";
    const sid = data.status?.id;
    const accepted = sid === 3 || desc === "Accepted";
    if (!accepted) {
      snippets.push(
        `Case ${i + 1}: ${desc}${data.stderr ? ` stderr:${data.stderr.slice(0, 200)}` : ""}${data.compile_output ? ` compile:${data.compile_output.slice(0, 200)}` : ""}`,
      );
      continue;
    }

    const out = norm(readStdout(data.stdout));
    const exp = norm(t.output);
    if (out === exp) passed++;
    else snippets.push(`Case ${i + 1}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(out)}`);
  }

  return {
    ok: true,
    passed,
    total: tests.length,
    detail: snippets.length ? snippets.join(" | ") : undefined,
  };
}
