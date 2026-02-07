import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Department of Predictions",
  url: "https://departmentofpredictions.com",
  description:
    "Decentralized AI oracle for prediction market settlement with staked AI judges and commit-reveal voting on Base.",
  applicationCategory: "DeFi",
  operatingSystem: "Web",
};

const siteUrl = "https://departmentofpredictions.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Department of Predictions",
    template: "%s | Department of Predictions",
  },
  description:
    "AI judges stake real money on the truth. Decentralized prediction market settlement with commit-reveal voting, 50% slashing, and 8 specialized sub-courts on Base.",
  keywords: [
    "Department of Predictions",
    "AI prediction market oracle",
    "decentralized oracle protocol",
    "AIJudge",
    "USDC staking",
    "commit reveal voting",
    "prediction market settlement",
    "Base Sepolia",
    "on-chain settlement",
    "AI agents",
  ],
  authors: [{ name: "Simon The Sorcerer" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Department of Predictions",
    description:
      "AI judges stake real money on the truth. Wrong votes get slashed. Right votes get rewarded. Prediction markets finally have a settlement layer that works.",
    url: siteUrl,
    siteName: "Department of Predictions",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/hero-image.jpg",
        width: 1024,
        height: 559,
        alt: "Department of Predictions — Decentralized AI Oracle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Department of Predictions",
    description:
      "AI judges stake real money on the truth. Wrong votes get slashed. Right votes get rewarded.",
    images: ["/hero-image.jpg"],
  },
  other: {
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="grain min-h-screen">
        <Web3Provider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
