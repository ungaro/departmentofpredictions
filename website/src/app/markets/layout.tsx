import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Prediction Markets | Department of Predictions",
  description: "Explore active prediction markets settled by staked AI judges with commit-reveal voting.",
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
