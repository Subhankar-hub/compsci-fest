/**
 * Code execution via public Judge0 CE (https://ce.judge0.com) — no API key or paid plan.
 * Fair-use public demo; for production traffic self-host Judge0 or Piston and set JUDGE0_CE_URL.
 */

export type TestCase = { input: string; output: string };

export type JudgeResult =
  | { ok: true; passed: number; total: number; detail?: string }
  | { ok: false; error: string; passed: number; total: number };

function norm(s: string) {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
}

function b64utf8(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

function decodeB64(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  try {
    return Buffer.from(s, "base64").toString("utf8");
  } catch {
    return s;
  }
}

function judgeBaseUrl() {
  return (process.env.JUDGE0_CE_URL ?? "https://ce.judge0.com").replace(/\/$/, "");
}

type Parsed = { accepted: boolean; stdout: string; summary: string };

function parseJudgePayload(data: {
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
}): Parsed {
  const sid = data.status?.id;
  const desc = data.status?.description ?? "";
  const accepted = sid === 3 || desc === "Accepted";
  const stdout = decodeB64(data.stdout);
  if (accepted) {
    return { accepted: true, stdout, summary: desc };
  }
  const parts = [
    desc,
    decodeB64(data.compile_output),
    decodeB64(data.stderr),
    data.message ?? "",
  ].filter(Boolean);
  const summary = parts.join(" ").slice(0, 400) || "Not accepted";
  return { accepted: false, stdout, summary };
}

async function pollUntilDone(base: string, token: string): Promise<Parsed> {
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const res = await fetch(
      `${base}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time`,
    );
    if (!res.ok) {
      return { accepted: false, stdout: "", summary: `Poll HTTP ${res.status}` };
    }
    const data = (await res.json()) as Parameters<typeof parseJudgePayload>[0];
    const sid = data.status?.id;
    if (sid === 1 || sid === 2) continue;
    return parseJudgePayload(data);
  }
  return { accepted: false, stdout: "", summary: "Judge timeout (queue slow or stuck)" };
}

async function runOneCase(
  base: string,
  sourceCode: string,
  languageId: number,
  stdin: string,
): Promise<Parsed> {
  const body = {
    source_code: b64utf8(sourceCode),
    language_id: languageId,
    stdin: b64utf8(stdin),
  };

  let res = await fetch(`${base}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 400) {
    const err = await res.json().catch(() => ({}));
    if (String((err as { error?: string }).error ?? "").toLowerCase().includes("wait")) {
      res = await fetch(`${base}/submissions?base64_encoded=true&wait=false`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { accepted: false, stdout: "", summary: `HTTP ${res.status}` };
      }
      const created = (await res.json()) as { token?: string };
      if (!created.token) {
        return { accepted: false, stdout: "", summary: "No submission token" };
      }
      return pollUntilDone(base, created.token);
    }
  }

  if (!res.ok) {
    return { accepted: false, stdout: "", summary: `HTTP ${res.status}` };
  }

  const data = (await res.json()) as Parameters<typeof parseJudgePayload>[0];
  return parseJudgePayload(data);
}

export async function runJudgeCE(
  code: string,
  languageId: number,
  tests: TestCase[],
): Promise<JudgeResult> {
  const base = judgeBaseUrl();
  if (tests.length === 0) {
    return { ok: false, error: "No test cases configured.", passed: 0, total: 0 };
  }

  let passed = 0;
  const snippets: string[] = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const r = await runOneCase(base, code, languageId, t.input);
    if (!r.accepted) {
      snippets.push(`Case ${i + 1}: ${r.summary}`);
      continue;
    }
    const out = norm(r.stdout);
    const exp = norm(t.output);
    if (out === exp) {
      passed++;
    } else {
      snippets.push(`Case ${i + 1}: expected ${JSON.stringify(exp)}, got ${JSON.stringify(out)}`);
    }
  }

  return {
    ok: true,
    passed,
    total: tests.length,
    detail: snippets.length ? snippets.join(" | ") : undefined,
  };
}
