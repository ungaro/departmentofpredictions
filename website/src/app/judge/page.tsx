"use client";

import { useState } from "react";
import { ConnectKitButton } from "connectkit";

const courts = [
  { name: "General", icon: "\u2696", desc: "Broad topics" },
  { name: "Finance", icon: "\u2191", desc: "Markets & economics" },
  { name: "Sports", icon: "\u26BD", desc: "Athletic competitions" },
  { name: "Politics", icon: "\u2605", desc: "Government & policy" },
  { name: "Technology", icon: "\u2699", desc: "Tech & AI" },
  { name: "Entertainment", icon: "\u266A", desc: "Media & culture" },
  { name: "Crypto", icon: "\u26D3", desc: "Blockchain & DeFi" },
  { name: "Science", icon: "\u269B", desc: "Research & discovery" },
] as const;

export default function JudgePage() {
  const isRegistered = false;
  const [selectedCourts, setSelectedCourts] = useState<string[]>([]);

  function toggleCourt(court: string) {
    setSelectedCourts((prev) =>
      prev.includes(court)
        ? prev.filter((c) => c !== court)
        : [...prev, court]
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
            Judge
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Become a Judge
          </h1>
          <p className="text-sm text-[hsl(0_0%_45%)] leading-relaxed max-w-lg">
            Stake USDC to join the court and settle prediction markets with
            on-chain verdicts. Accurate votes earn rewards. Wrong votes get
            slashed.
          </p>
        </div>

        {!isRegistered ? (
          <div className="space-y-8">
            {/* Earn / Risk panels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card-glow rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6">
                <div className="w-8 h-8 rounded-full bg-[hsl(140_60%_50%/0.1)] border border-[hsl(140_60%_50%/0.2)] flex items-center justify-center mb-4">
                  <span className="text-sm">+</span>
                </div>
                <h2 className="text-sm font-semibold text-white mb-2">Earn</h2>
                <p className="text-[11px] text-[hsl(0_0%_45%)] leading-relaxed">
                  Earn rewards for accurate judgments. Payouts are proportional
                  to your stake and reputation score.
                </p>
              </div>
              <div className="card-glow rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6">
                <div className="w-8 h-8 rounded-full bg-[hsl(0_70%_55%/0.1)] border border-[hsl(0_70%_55%/0.2)] flex items-center justify-center mb-4">
                  <span className="text-sm">&minus;</span>
                </div>
                <h2 className="text-sm font-semibold text-white mb-2">Risk</h2>
                <p className="text-[11px] text-[hsl(0_0%_45%)] leading-relaxed">
                  50% stake slashed for incorrect votes. Three or more failures
                  result in automatic suspension.
                </p>
              </div>
            </div>

            {/* Stake parameters */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-3">
                Protocol Parameters
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                    Min Stake
                  </p>
                  <p className="text-lg font-bold text-[hsl(43_100%_50%)] tabular-nums">
                    1,000
                  </p>
                  <p className="text-[10px] text-[hsl(0_0%_30%)]">USDC</p>
                </div>
                <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                    Slash Rate
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">50%</p>
                  <p className="text-[10px] text-[hsl(0_0%_30%)]">of stake</p>
                </div>
                <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                    Challenge Bond
                  </p>
                  <p className="text-lg font-bold text-white tabular-nums">500</p>
                  <p className="text-[10px] text-[hsl(0_0%_30%)]">USDC</p>
                </div>
              </div>
            </div>

            {/* Court selection */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-3">
                Select Courts
              </p>
              <div className="grid grid-cols-4 gap-2">
                {courts.map((c) => {
                  const isSelected = selectedCourts.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      onClick={() => toggleCourt(c.name)}
                      className={`rounded-lg p-3 text-left transition-all ${
                        isSelected
                          ? "border border-[hsl(43_100%_50%)] bg-[hsl(43_100%_50%/0.06)]"
                          : "border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] hover:border-[hsl(0_0%_15%)]"
                      }`}
                    >
                      <span className="text-base block mb-1">{c.icon}</span>
                      <span
                        className={`text-xs font-medium block ${
                          isSelected
                            ? "text-[hsl(43_100%_50%)]"
                            : "text-[hsl(0_0%_55%)]"
                        }`}
                      >
                        {c.name}
                      </span>
                      <span className="text-[10px] text-[hsl(0_0%_30%)]">
                        {c.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Register button */}
            <div>
              <ConnectKitButton.Custom>
                {({ isConnected, show }) =>
                  isConnected ? (
                    <button className="w-full rounded py-3 font-semibold text-sm text-black bg-[hsl(43_100%_50%)] hover:bg-[hsl(43_100%_55%)] transition-colors">
                      Register as Judge
                    </button>
                  ) : (
                    <button
                      onClick={show}
                      className="w-full rounded py-3 font-semibold text-sm text-black bg-[hsl(43_100%_50%)] hover:bg-[hsl(43_100%_55%)] transition-colors"
                    >
                      Connect Wallet to Register
                    </button>
                  )
                }
              </ConnectKitButton.Custom>
              <p className="text-[11px] text-[hsl(0_0%_30%)] text-center mt-3">
                Registration requires USDC approval and staking transaction
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                  Reputation
                </p>
                <p className="text-lg font-bold text-[hsl(43_100%_50%)] tabular-nums">
                  8,500
                  <span className="text-xs font-normal text-[hsl(0_0%_30%)]">
                    {" "}/ 10,000
                  </span>
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                  Total Staked
                </p>
                <p className="text-lg font-bold text-white tabular-nums">
                  5,000 USDC
                </p>
              </div>
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-1">
                  Record
                </p>
                <p className="text-lg font-bold text-white tabular-nums">
                  12W
                  <span className="text-xs font-normal text-[hsl(0_0%_30%)]">
                    {" "}/ 2L
                  </span>
                </p>
              </div>
            </div>

            {/* Active courts */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-3">
                Active Courts
              </p>
              <div className="flex flex-wrap gap-2">
                {courts.map((c) => {
                  const isActive = ["General", "Crypto", "Finance"].includes(
                    c.name
                  );
                  return (
                    <span
                      key={c.name}
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium ${
                        isActive
                          ? "bg-[hsl(43_100%_50%)] text-black"
                          : "bg-[hsl(0_0%_5%)] border border-[hsl(0_0%_10%)] text-[hsl(0_0%_30%)]"
                      }`}
                    >
                      <span>{c.icon}</span>
                      {c.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Active markets */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-3">
                Active Markets
              </p>
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-8 text-center">
                <p className="text-sm text-[hsl(0_0%_35%)]">
                  No active markets assigned. New markets will appear here when
                  you are selected as a judge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
