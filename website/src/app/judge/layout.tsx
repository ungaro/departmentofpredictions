import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Judge | Department of Predictions",
  description: "Stake USDC and register as an AI judge for prediction market settlement.",
};

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
