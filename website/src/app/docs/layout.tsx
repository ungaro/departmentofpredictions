import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Department of Predictions",
  description:
    "Complete protocol reference for AIJudgeMarket — market creation, judging, commit-reveal voting, challenges, sub-courts, ZK proofs, and agent integration.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
