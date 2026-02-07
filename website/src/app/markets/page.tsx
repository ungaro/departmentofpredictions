"use client";

import { useState } from "react";
import Link from "next/link";
import { useMarketCount, useActiveJudgesCount } from "@/lib/hooks";

const mockMarkets = [
  {
    id: 1,
    question: "Will BTC exceed $100,000 by June 2026?",
    court: "Crypto",
    status: "Open" as const,
    outcome: null,
    judges: 5,
    createdAt: "2026-01-15",
  },
  {
    id: 2,
    question: "Will the Fed cut interest rates in Q1 2026?",
    court: "Finance",
    status: "Resolving" as const,
    outcome: null,
    judges: 7,
    createdAt: "2026-01-10",
  },
  {
    id: 3,
    question: "Will Real Madrid win the 2026 Champions League?",
    court: "Sports",
    status: "Resolved" as const,
    outcome: "Yes",
    judges: 5,
    createdAt: "2025-12-20",
  },
  {
    id: 4,
    question: "Will OpenAI release GPT-5 before April 2026?",
    court: "Technology",
    status: "Challenged" as const,
    outcome: "No",
    judges: 9,
    createdAt: "2026-01-05",
  },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  Open: { color: "hsl(43 100% 50%)", bg: "hsl(43 100% 50% / 0.1)" },
  Resolving: { color: "hsl(50 90% 60%)", bg: "hsl(50 90% 60% / 0.1)" },
  Resolved: { color: "hsl(140 60% 50%)", bg: "hsl(140 60% 50% / 0.1)" },
  Challenged: { color: "hsl(0 70% 55%)", bg: "hsl(0 70% 55% / 0.1)" },
};

const courtIcons: Record<string, string> = {
  General: "\u2696",
  Finance: "\u2191",
  Sports: "\u26BD",
  Politics: "\u2605",
  Technology: "\u2699",
  Entertainment: "\u266A",
  Crypto: "\u26D3",
  Science: "\u269B",
};

export default function MarketsPage() {
  const [filter, setFilter] = useState<string>("All");
  const { data: marketCount } = useMarketCount();
  const { data: activeJudgesCount } = useActiveJudgesCount();

  const statuses = ["All", "Open", "Resolving", "Resolved", "Challenged"];
  const filtered =
    filter === "All"
      ? mockMarkets
      : mockMarkets.filter((m) => m.status === filter);

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
            Markets
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Browse Prediction Markets
          </h1>
          <p className="text-sm text-[hsl(0_0%_45%)] leading-relaxed max-w-lg">
            Explore active and resolved prediction markets settled by
            decentralized AI oracle judges.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
              Total Markets
            </p>
            <p className="text-2xl font-bold text-[hsl(43_100%_50%)] tabular-nums">
              {marketCount !== undefined ? Number(marketCount).toString() : "\u2014"}
            </p>
          </div>
          <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
              Active Judges
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {activeJudgesCount !== undefined
                ? Number(activeJudgesCount).toString()
                : "\u2014"}
            </p>
          </div>
          <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
              Sub-Courts
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">8</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-[hsl(0_0%_8%)] pb-px">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                filter === s
                  ? "border-[hsl(43_100%_50%)] text-white"
                  : "border-transparent text-[hsl(0_0%_40%)] hover:text-[hsl(0_0%_60%)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Markets List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[hsl(0_0%_40%)] mb-4">
              No markets match this filter.
            </p>
            <Link
              href="/create"
              className="text-sm font-medium text-[hsl(43_100%_50%)] hover:underline underline-offset-4"
            >
              Create the first market
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((market) => {
              const cfg = statusConfig[market.status];
              return (
                <div
                  key={market.id}
                  className="card-glow rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium leading-snug mb-3">
                        {market.question}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-[hsl(0_0%_5%)] border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)]">
                          <span>{courtIcons[market.court] || "\u2696"}</span>
                          {market.court}
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded"
                          style={{ color: cfg.color, backgroundColor: cfg.bg }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: cfg.color }}
                          />
                          {market.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/markets/${market.id}`}
                      className="text-xs font-medium text-[hsl(0_0%_30%)] hover:text-[hsl(43_100%_50%)] transition-colors shrink-0 mt-1"
                    >
                      View &rarr;
                    </Link>
                  </div>
                  <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[hsl(0_0%_6%)] text-[11px] text-[hsl(0_0%_35%)] font-mono">
                    <span>{market.judges} judges</span>
                    <span>Created {market.createdAt}</span>
                    {market.outcome && (
                      <span>
                        Outcome:{" "}
                        <span className="text-white font-medium">
                          {market.outcome}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="hr-gold mb-10" />
          <p className="text-sm text-[hsl(0_0%_35%)] mb-4">
            Have a prediction that needs settlement?
          </p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-[hsl(43_100%_50%)] text-black text-sm font-semibold rounded hover:bg-[hsl(43_100%_55%)] transition-colors"
          >
            Create a Market
          </Link>
        </div>
      </div>
    </main>
  );
}
