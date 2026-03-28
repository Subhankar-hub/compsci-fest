import { notFound } from "next/navigation";
import { RoundQuizClient } from "./RoundQuizClient";

type Props = { params: Promise<{ round: string }> };

export default async function RoundPage({ params }: Props) {
  const { round: r } = await params;
  const round = Number(r);
  if (round !== 1 && round !== 2) notFound();
  return <RoundQuizClient round={round} />;
}
