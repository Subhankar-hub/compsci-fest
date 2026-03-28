export type IoCase = { input: string; output: string };

export type FunctionalTestPack = {
  functional: true;
  drivers: Record<string, string>;
  cases: IoCase[];
  starters?: Record<string, string>;
};

export function isFunctionalPack(tests: unknown): tests is FunctionalTestPack {
  if (tests === null || typeof tests !== "object") return false;
  const o = tests as Record<string, unknown>;
  return (
    o.functional === true &&
    typeof o.drivers === "object" &&
    o.drivers !== null &&
    Array.isArray(o.cases)
  );
}

/** Must match harness templates in `src/data/coding-round-seed.ts`. */
export const JUDGE_USER_CODE_SLOT = "__JUDGE_USER_SLOT__";

export function buildBundledSource(
  userCode: string,
  langId: number,
  tests: unknown,
): { ok: true; source: string; cases: IoCase[] } | { ok: false; error: string } {
  if (Array.isArray(tests)) {
    return { ok: true, source: userCode, cases: tests as IoCase[] };
  }
  if (isFunctionalPack(tests)) {
    const key = String(langId);
    const driver = tests.drivers[key] ?? tests.drivers["71"];
    if (!driver || typeof driver !== "string") {
      return { ok: false, error: "This language is not supported for this problem." };
    }
    if (!driver.includes(JUDGE_USER_CODE_SLOT)) {
      return { ok: false, error: "Invalid problem configuration (missing harness)." };
    }
    const source = driver.split(JUDGE_USER_CODE_SLOT).join(userCode);
    return { ok: true, source, cases: tests.cases };
  }
  return { ok: false, error: "Invalid problem tests." };
}

export function extractStarters(tests: unknown, fallbackStarter: string | null): Record<string, string> {
  if (isFunctionalPack(tests) && tests.starters && typeof tests.starters === "object") {
    return { ...tests.starters } as Record<string, string>;
  }
  const fb = fallbackStarter ?? "";
  return { "71": fb, "54": fb, "62": fb };
}
