"use client";

import { useState } from "react";
import { ConnectKitButton } from "connectkit";

const courts = [
  { name: "General", icon: "\u2696" },
  { name: "Finance", icon: "\u2191" },
  { name: "Sports", icon: "\u26BD" },
  { name: "Politics", icon: "\u2605" },
  { name: "Technology", icon: "\u2699" },
  { name: "Entertainment", icon: "\u266A" },
  { name: "Crypto", icon: "\u26D3" },
  { name: "Science", icon: "\u269B" },
];

export default function CreatePage() {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [court, setCourt] = useState("General");
  const [numOutcomes, setNumOutcomes] = useState(2);
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call contract createMarket
  };

  const inputClasses =
    "w-full bg-[hsl(0_0%_3%)] border border-[hsl(0_0%_10%)] rounded px-4 py-3 text-white text-sm placeholder:text-[hsl(0_0%_25%)] focus:outline-none focus:ring-1 focus:ring-[hsl(43_100%_50%)] focus:border-[hsl(43_100%_50%/0.3)] transition-colors";
  const labelClasses =
    "block text-xs font-mono uppercase tracking-wider text-[hsl(0_0%_40%)] mb-2";

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
            Create
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Create Prediction Market
          </h1>
          <p className="text-sm text-[hsl(0_0%_45%)] leading-relaxed max-w-lg">
            Define a question and let decentralized AI oracle judges resolve the
            outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
              <label htmlFor="question" className={labelClasses}>
                Question
              </label>
              <textarea
                id="question"
                rows={3}
                className={inputClasses}
                placeholder="Will BTC reach $100k by..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClasses}>
                Resolution Criteria
              </label>
              <textarea
                id="description"
                rows={4}
                className={inputClasses}
                placeholder="Provide detailed resolution criteria, data sources, and any relevant context for judges."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Court */}
            <div>
              <label className={labelClasses}>Court</label>
              <div className="grid grid-cols-4 gap-2">
                {courts.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setCourt(c.name)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded text-xs font-medium transition-all ${
                      court === c.name
                        ? "border border-[hsl(43_100%_50%)] text-[hsl(43_100%_50%)] bg-[hsl(43_100%_50%/0.06)]"
                        : "border border-[hsl(0_0%_10%)] text-[hsl(0_0%_45%)] bg-[hsl(0_0%_3%)] hover:border-[hsl(0_0%_20%)] hover:text-[hsl(0_0%_60%)]"
                    }`}
                  >
                    <span>{c.icon}</span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Number of Outcomes */}
              <div>
                <label htmlFor="numOutcomes" className={labelClasses}>
                  Outcomes
                </label>
                <input
                  id="numOutcomes"
                  type="number"
                  min={2}
                  max={10}
                  className={inputClasses}
                  value={numOutcomes}
                  onChange={(e) => setNumOutcomes(Number(e.target.value))}
                />
              </div>

              {/* Resolution Deadline */}
              <div>
                <label htmlFor="deadline" className={labelClasses}>
                  Deadline
                </label>
                <input
                  id="deadline"
                  type="date"
                  className={inputClasses}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded font-semibold text-sm text-black bg-[hsl(43_100%_50%)] hover:bg-[hsl(43_100%_55%)] transition-colors"
            >
              Create Market
            </button>

            <p className="text-[11px] text-[hsl(0_0%_30%)] text-center">
              Market creation requires a connected wallet and transaction signing
            </p>
          </form>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet */}
            <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-3">
                Wallet
              </p>
              <ConnectKitButton />
            </div>

            {/* How it works */}
            <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_35%)] mb-4">
                After Creation
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full border border-[hsl(43_100%_50%/0.3)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-mono text-[hsl(43_100%_50%)]">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-0.5">Judge Selection</p>
                    <p className="text-[11px] text-[hsl(0_0%_40%)] leading-relaxed">
                      Qualified judges are randomly selected from the court, weighted by reputation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full border border-[hsl(43_100%_50%/0.3)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-mono text-[hsl(43_100%_50%)]">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-0.5">Commit-Reveal</p>
                    <p className="text-[11px] text-[hsl(0_0%_40%)] leading-relaxed">
                      Judges privately commit votes, then reveal after the commitment period.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full border border-[hsl(43_100%_50%/0.3)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[9px] font-mono text-[hsl(43_100%_50%)]">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white mb-0.5">Resolution</p>
                    <p className="text-[11px] text-[hsl(0_0%_40%)] leading-relaxed">
                      Majority wins. 24-hour challenge window before finalization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
