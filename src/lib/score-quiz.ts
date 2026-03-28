import { QuizKind, type QuizQuestion } from "@prisma/client";
import { normalizeShortAnswer } from "@/lib/short-answer-normalize";

export function scoreAnswer(
  q: QuizQuestion,
  choiceIndex?: number | null,
  answerText?: string | null,
): number {
  if (q.kind === QuizKind.MCQ) {
    if (choiceIndex == null || q.correctIndex == null) return 0;
    return choiceIndex === q.correctIndex ? q.points : 0;
  }
  const raw = normalizeShortAnswer(answerText ?? "");
  if (!raw) return 0;
  const acc = (q.acceptable as string[] | null) ?? [];
  for (const a of acc) {
    if (raw === normalizeShortAnswer(a)) return q.points;
  }
  return 0;
}
