import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Prediction Market | Department of Predictions",
  description: "Create a new prediction market with AI judge settlement on Base.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
