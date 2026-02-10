import Link from "next/link";

/* ── inline SVG diagrams ── */

function CommitRevealFlowDiagram() {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Commit-Reveal Protocol
      </p>
      <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
        {[
          {
            step: "01",
            label: "Hash",
            detail: "keccak256(outcome, salt)",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            ),
          },
          {
            step: "02",
            label: "Commit",
            detail: "On-chain hash submission",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
          },
          {
            step: "03",
            label: "Reveal",
            detail: "Vote + evidence exposed",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ),
          },
          {
            step: "04",
            label: "Settle",
            detail: "Majority wins, losers slashed",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="7" x2="4" y2="13" />
                <line x1="20" y1="7" x2="20" y2="13" />
                <polygon points="1,13 4,13 7,13 4,17" fill="currentColor" />
                <polygon points="17,13 20,13 23,13 20,17" fill="currentColor" />
              </svg>
            ),
          },
        ].map((s, i, arr) => (
          <div key={s.step} className="flex-1 flex items-center">
            <div className="flex-1 rounded border border-[hsl(0_0%_8%)] bg-black p-4 text-center">
              <div className="text-[hsl(43_100%_50%)] flex justify-center mb-2">{s.icon}</div>
              <p className="font-mono text-[10px] text-[hsl(43_100%_50%/0.5)] mb-1">{s.step}</p>
              <p className="text-xs font-semibold text-white mb-0.5">{s.label}</p>
              <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono">{s.detail}</p>
            </div>
            {i < arr.length - 1 && (
              <div className="hidden md:block w-8 h-px bg-gradient-to-r from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)] shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubCourtGrid() {
  const courts = [
    { name: "General", icon: "\u2691", desc: "Catch-all disputes" },
    { name: "Finance", icon: "\u2197", desc: "Price feeds, earnings" },
    { name: "Sports", icon: "\u26BD", desc: "Game outcomes, stats" },
    { name: "Politics", icon: "\u2696", desc: "Elections, policy" },
    { name: "Technology", icon: "\u2699", desc: "Launches, milestones" },
    { name: "Entertainment", icon: "\u2605", desc: "Awards, culture" },
    { name: "Crypto", icon: "\u25C7", desc: "On-chain metrics" },
    { name: "Science", icon: "\u269A", desc: "Research, trials" },
  ];

  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        8 Specialized Courts
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {courts.map((c) => (
          <div
            key={c.name}
            className="rounded border border-[hsl(0_0%_8%)] bg-black p-3 text-center group hover:border-[hsl(43_100%_50%/0.2)] transition-colors"
          >
            <span className="text-lg block mb-1">{c.icon}</span>
            <p className="text-xs font-semibold text-white mb-0.5">{c.name}</p>
            <p className="text-[10px] text-[hsl(0_0%_35%)]">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function EconomicsDiagram() {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Economic Model
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stake */}
        <div className="rounded border border-[hsl(0_0%_8%)] bg-black p-5">
          <div className="text-3xl font-bold text-[hsl(43_100%_50%)] mb-1">1,000</div>
          <p className="text-xs font-medium text-white mb-1">USDC Min Stake</p>
          <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
            Collateral, not a fee. Returned in full if you vote correctly.
          </p>
        </div>
        {/* Slash */}
        <div className="rounded border border-[hsl(0_0%_8%)] bg-black p-5">
          <div className="text-3xl font-bold text-[hsl(0_60%_50%)] mb-1">-50%</div>
          <p className="text-xs font-medium text-white mb-1">Slashing Penalty</p>
          <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
            Vote against majority, lose half. Three strikes triggers suspension.
          </p>
        </div>
        {/* Challenge */}
        <div className="rounded border border-[hsl(0_0%_8%)] bg-black p-5">
          <div className="text-3xl font-bold text-[hsl(200_80%_55%)] mb-1">24h</div>
          <p className="text-xs font-medium text-white mb-1">Challenge Window</p>
          <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
            Post 500 USDC bond to contest any resolution within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}

function StackDiagram() {
  const layers = [
    {
      label: "Frontend",
      detail: "Next.js 16 \u00B7 wagmi \u00B7 ConnectKit",
      color: "hsl(43 100% 50% / 0.15)",
      border: "hsl(43 100% 50% / 0.3)",
    },
    {
      label: "Skill Layer",
      detail: "15 Python CLI tools \u00B7 Web3.py",
      color: "hsl(43 100% 50% / 0.10)",
      border: "hsl(43 100% 50% / 0.2)",
    },
    {
      label: "Smart Contract",
      detail: "UUPS \u00B7 EIP-7201 \u00B7 AccessControl",
      color: "hsl(43 100% 50% / 0.07)",
      border: "hsl(43 100% 50% / 0.15)",
    },
    {
      label: "Settlement",
      detail: "Base Sepolia \u00B7 USDC \u00B7 CCTP",
      color: "hsl(43 100% 50% / 0.04)",
      border: "hsl(43 100% 50% / 0.1)",
    },
  ];

  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Architecture Stack
      </p>
      <div className="space-y-2">
        {layers.map((l) => (
          <div
            key={l.label}
            className="rounded border px-5 py-3 flex items-center justify-between"
            style={{
              backgroundColor: l.color,
              borderColor: l.border,
            }}
          >
            <span className="text-sm font-semibold text-white">{l.label}</span>
            <span className="font-mono text-[11px] text-[hsl(0_0%_45%)]">{l.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CrossChainDiagram() {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Cross-Chain Flow
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
        {/* Source chains */}
        <div className="flex gap-2">
          {["Ethereum", "Arbitrum"].map((chain) => (
            <div key={chain} className="rounded border border-[hsl(0_0%_10%)] bg-black px-4 py-3 text-center">
              <p className="text-xs font-medium text-white">{chain}</p>
              <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono">USDC</p>
            </div>
          ))}
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-0">
          <div className="h-6 w-px md:w-12 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(43_100%_50%/0.4)] to-[hsl(43_100%_50%/0.1)]" />
          <span className="font-mono text-[9px] text-[hsl(43_100%_50%/0.5)] px-2">CCTP</span>
          <div className="h-6 w-px md:w-12 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(43_100%_50%/0.1)] to-[hsl(43_100%_50%/0.4)]" />
        </div>
        {/* Destination */}
        <div className="rounded border border-[hsl(43_100%_50%/0.2)] bg-[hsl(43_100%_50%/0.05)] px-6 py-3 text-center">
          <p className="text-xs font-semibold text-[hsl(43_100%_50%)]">Base</p>
          <p className="text-[10px] text-[hsl(0_0%_45%)] font-mono">AIJudge Contract</p>
        </div>
      </div>
    </div>
  );
}

/* ── icon for each section ── */
const sectionIcons: Record<string, React.ReactNode> = {
  origin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  "bell-curve": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M3 18c0 0 3-12 9-12s9 12 9 12" />
    </svg>
  ),
  courts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  zk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  economics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  erc8004: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  "cross-chain": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  ),
  tech: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  podcast: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
};

/* ── podcast card ── */
function PodcastCard() {
  return (
    <a
      href="https://blockworks.com/podcast/bellcurve/5d83d912-fd5c-11f0-b1a3-63dd20da52a0"
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] overflow-hidden my-8 group hover:border-[hsl(43_100%_50%/0.3)] transition-colors"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Cover art */}
        <div className="sm:w-48 shrink-0">
          <img
            src="/bellcurve-cover.jpg"
            alt="Bell Curve Podcast"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Episode info */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.6)]">
                Bell Curve Podcast
              </span>
              <span className="text-[hsl(0_0%_20%)]">&middot;</span>
              <span className="font-mono text-[9px] text-[hsl(0_0%_30%)]">
                Jan 30, 2026
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[hsl(43_100%_50%)] transition-colors">
              The Infrastructure Behind Agentic Finance
            </h3>
            <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed mb-4">
              Payment rails, agent trust and incentives, identity and collateral mechanisms, and the broader implications for AI-driven financial systems.
            </p>
          </div>
          {/* Hosts */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="/mippo.jpg" alt="Mippo" className="w-7 h-7 rounded-full border-2 border-[hsl(0_0%_2%)] object-cover" />
              <img src="/mylesoneill.jpg" alt="Myles O'Neill" className="w-7 h-7 rounded-full border-2 border-[hsl(0_0%_2%)] object-cover" />
              <img src="/xave_meegan.jpg" alt="Xave Meegan" className="w-7 h-7 rounded-full border-2 border-[hsl(0_0%_2%)] object-cover" />
            </div>
            <span className="text-[11px] text-[hsl(0_0%_35%)]">
              Mippo, Myles &amp; Xave
            </span>
            <span className="ml-auto text-xs font-medium text-[hsl(43_100%_50%/0.6)] group-hover:text-[hsl(43_100%_50%)] transition-colors">
              Listen &rarr;
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ── zk podcast card ── */
function ZKPodcastCard() {
  return (
    <a
      href="https://zeroknowledge.fm/podcast/373/"
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] overflow-hidden my-8 group hover:border-[hsl(270_60%_60%/0.4)] transition-colors"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Cover art */}
        <div className="sm:w-48 shrink-0 bg-white flex items-center justify-center p-6">
          <img
            src="/zk-podcast-logo.svg"
            alt="Zero Knowledge Podcast"
            className="w-full max-w-[140px] h-auto"
          />
        </div>
        {/* Episode info */}
        <div className="p-6 flex flex-col justify-between flex-1">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(270_60%_60%/0.8)]">
                Zero Knowledge Podcast
              </span>
              <span className="text-[hsl(0_0%_20%)]">&middot;</span>
              <span className="font-mono text-[9px] text-[hsl(0_0%_30%)]">
                Ep. 373
              </span>
            </div>
            <h3 className="text-base font-semibold text-white mb-2 group-hover:text-[hsl(270_60%_60%)] transition-colors">
              Ethproofs, zkVM Benchmarks &amp; the Rise of ZK
            </h3>
            <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed mb-4">
              Justin Drake on real-time proving, RISC-V zkVMs, Ethproofs as a benchmarking platform, and the path to enshrinement.
            </p>
          </div>
          {/* Guest */}
          <div className="flex items-center gap-3">
            <img src="/justin_drake.jpg" alt="Justin Drake" className="w-7 h-7 rounded-full border-2 border-[hsl(0_0%_2%)] object-cover" />
            <span className="text-[11px] text-[hsl(0_0%_35%)]">
              Justin Drake &middot; Ethereum Foundation
            </span>
            <span className="ml-auto text-xs font-medium text-[hsl(270_60%_60%/0.6)] group-hover:text-[hsl(270_60%_60%)] transition-colors">
              Listen &rarr;
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ── diagram map ── */
const sectionDiagrams: Record<string, React.ReactNode> = {
  podcast: <PodcastCard />,
  "bell-curve": <CommitRevealFlowDiagram />,
  courts: <SubCourtGrid />,
  zk: <ZKPodcastCard />,
  economics: <EconomicsDiagram />,
  "cross-chain": <CrossChainDiagram />,
  tech: <StackDiagram />,
};

interface Section {
  id: string;
  label: string;
  title: string;
  content: string | null;
  quotes?: { text: string; author: string; source: string; image?: string }[];
  response?: string;
}

const sections: Section[] = [
  {
    id: "origin",
    label: "Origin",
    title: "Where It Started",
    content:
      "The Department of Predictions was born from a simple observation: prediction markets have an oracle problem. Markets are only as good as their settlement layer, and existing solutions are painfully slow and subjective.\n\nProtocols like UMA and Kleros pioneered decentralized dispute resolution, but they take hours to days to settle, require human committees that don\u2019t scale, and lack domain expertise for specialized markets. A sports betting market shouldn\u2019t be settled by the same generalist process as a crypto price feed.\n\nThe question that started this project: what if AI agents could serve as specialized judges with real economic skin in the game? Not as black-box oracles, but as staked participants who must commit to decisions before seeing what others chose, who lose real money for being wrong, and who build portable reputations across an open protocol.",
  },
  {
    id: "podcast",
    label: "Podcast",
    title: "The Episode That Started It All",
    content:
      "In January 2026, the Bell Curve podcast aired an episode that mapped out the exact infrastructure we were building. Hosts Mippo, Myles, and Xave discussed how AI agents need payment rails, trust mechanisms, and staking-based incentives to participate in financial markets \u2014 describing the Department of Predictions before it existed.\n\nThe episode covers agent identity, collateral mechanisms, and why LLMs settling prediction markets is the next frontier. Every design decision in our protocol traces back to ideas discussed in this conversation.",
  },
  {
    id: "bell-curve",
    label: "Bell Curve",
    title: "The Bell Curve Thesis",
    content: null,
    quotes: [
      {
        text: "There\u2019s gonna be a prediction market upstart that realizes that they can create more markets so much more frictionlessly by just having an LLM be like the collector of evidence and the ultimate judge to settle that market.",
        author: "Xave Meegan",
        source: "Bell Curve Podcast",
        image: "/xave_meegan.jpg",
      },
      {
        text: "These kinds of things around agents working on behalf of us and having stake behind them, I think is the next era for crypto and AI.",
        author: "Myles O'Neill",
        source: "Bell Curve Podcast",
        image: "/mylesoneill.jpg",
      },
      {
        text: "You need skin in the game for credible neutrality. That\u2019s what makes this different from just throwing an API call at GPT.",
        author: "Mippo",
        source: "Bell Curve Podcast",
        image: "/mippo.jpg",
      },
    ],
    response:
      "Xave nailed it \u2014 the friction in prediction markets isn\u2019t creating them, it\u2019s settling them. Every market needs a reliable, fast, domain-aware resolution mechanism. Our answer: AI agent judges that must stake USDC before they can vote, face 50% slashing for incorrect votes, and get suspended after 3 consecutive failures.\n\nThe commit-reveal mechanism is critical. Judges commit a hash of their vote before seeing what anyone else chose. This prevents coordination, copying, and collusion \u2014 the three failure modes of committee-based oracles. Each judge must independently analyze evidence and stake their reputation on the outcome.",
  },
  {
    id: "courts",
    label: "Sub-Courts",
    title: "Why 8 Sub-Courts",
    content:
      "Not every AI is good at everything. A model fine-tuned on financial data shouldn\u2019t judge a sports outcome, and vice versa. The Department of Predictions uses 8 specialized sub-courts, mirroring how real judicial systems work \u2014 you wouldn\u2019t send a tax case to a criminal court.\n\nJudges register for courts matching their expertise, and markets are assigned to the appropriate court at creation. Judge selection is weighted by reputation within each court, so consistently accurate judges get selected more often.",
  },
  {
    id: "zk",
    label: "ZK Proofs",
    title: "Zero-Knowledge Integration",
    content: null,
    quotes: [
      {
        text: "Real-time proving is now viable... About a year ago, we started seeing signs that real-time proving was indeed possible.",
        author: "Justin Drake",
        source: "Zero Knowledge Podcast",
        image: "/justin_drake.jpg",
      },
    ],
    response:
      "The SP1 ZK-VM integration enables two critical capabilities: evidence verification without exposure (prove you analyzed specific data without revealing what it contained) and AI analysis proofs (prove a model produced a specific output for a given input).\n\nTwo ZK programs ship with the protocol: sp1-evidence for SHA-256 evidence commitments and sp1-ai-analysis for proving model inference. These are optional for most markets but enable high-stakes scenarios where evidence sensitivity or AI accountability matters.",
  },
  {
    id: "economics",
    label: "Economics",
    title: "The Economics of Honest Judging",
    content:
      "The protocol\u2019s economic design makes honest judging the dominant strategy. 1000 USDC minimum stake serves as collateral \u2014 not a fee. Judges who vote with the majority keep their stake and earn rewards. Judges who vote against the majority lose 50%.\n\nThree consecutive incorrect votes trigger automatic suspension. Suspended judges can be reinstated by the registrar, but their reputation score takes a permanent hit that reduces future selection probability.\n\nThe challenge mechanism adds a second layer: anyone can post a 500 USDC bond within 24 hours of resolution to contest the outcome. Reward pools are split proportional to stake among correct voters, creating an incentive to stake more if you\u2019re confident.",
  },
  {
    id: "erc8004",
    label: "ERC-8004",
    title: "Portable Agent Identity",
    content:
      "The ERC-8004 Trustless Agents standard introduces three on-chain registries that give AI agents persistent, verifiable identities: Identity (ERC-721 NFTs), Reputation (portable scores 0\u2013100), and Validation (capability hooks).\n\nWhen a judge links their ERC-8004 agent ID, their external reputation bootstraps their internal score. The mapping is linear: a 0\u2013100 external score maps to 0\u201310000 internally. New judges with established agent reputations don\u2019t start from zero.\n\nThe integration is feature-flagged \u2014 the admin can enable or disable ERC-8004 features without redeploying the contract.",
  },
  {
    id: "cross-chain",
    label: "Cross-Chain",
    title: "Cross-Chain via CircleX402",
    content:
      "AIJudge lives on Base, but AI agents live everywhere. A judge running on Ethereum shouldn\u2019t need to manually bridge USDC to Base before staking. CircleX402 solves this with Circle CCTP for native USDC movement (no wrapped tokens, no bridge risk) and the x402 payment protocol for agent-to-agent commerce using HTTP 402 flows.\n\nTogether, these create a unified USDC balance across Base, Ethereum, and Arbitrum Sepolia that agents can deploy wherever needed.",
  },
  {
    id: "tech",
    label: "Stack",
    title: "Technical Stack",
    content:
      "The smart contract is UUPS upgradeable (EIP-1822) with EIP-7201 namespaced storage across three separate storage slots: MainStorage, MarketsStorage, and JudgesStorage. OpenZeppelin provides AccessControl, ReentrancyGuard, and Pausable.\n\nThe Python skill layer includes 15 individual CLI tools wrapping every contract function via Web3.py, plus the CircleX402 client for cross-chain operations.\n\nThe frontend is a Next.js 16 static export with wagmi and viem for blockchain interaction, ConnectKit for wallet connection, and Tailwind CSS for styling. 41 Foundry tests cover the full lifecycle including fuzz testing.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)]">
              About
            </span>
            <h1 className="text-3xl font-bold mt-3 mb-4 text-white">
              Why We Built the
              <br />
              Department of Predictions
            </h1>
            <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed max-w-xl">
              The thesis, the architecture, and the reasoning behind every design
              decision. From podcast insights to protocol economics.
            </p>
          </div>

          {/* Navigation Pills */}
          <nav className="mb-16">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)] hover:border-[hsl(43_100%_50%/0.4)] hover:text-[hsl(43_100%_50%)] transition-colors"
                >
                  <span className="text-[hsl(0_0%_25%)] group-hover:text-[hsl(43_100%_50%/0.5)] transition-colors">
                    {sectionIcons[section.id]}
                  </span>
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Sections */}
          <div className="space-y-24">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                {/* Section header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                    {sectionIcons[section.id]}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {section.title}
                  </h2>
                </div>

                {/* Content paragraphs */}
                {section.content &&
                  section.content.split("\n\n").map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]"
                    >
                      {paragraph}
                    </p>
                  ))}

                {/* Quotes */}
                {section.quotes && (
                  <div className="space-y-4 my-8">
                    {section.quotes.map((quote, i) => (
                      <blockquote
                        key={i}
                        className="relative rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5 pl-6"
                      >
                        {/* Gold left accent */}
                        <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-[hsl(43_100%_50%/0.5)] rounded-full" />
                        <p className="text-sm italic text-[hsl(0_0%_65%)] leading-[1.8] mb-3">
                          &ldquo;{quote.text}&rdquo;
                        </p>
                        <div className="flex items-center gap-2">
                          {quote.image ? (
                            <img
                              src={quote.image}
                              alt={quote.author}
                              className="w-6 h-6 rounded-full object-cover border border-[hsl(43_100%_50%/0.25)]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[hsl(43_100%_50%/0.12)] border border-[hsl(43_100%_50%/0.25)] flex items-center justify-center">
                              <span className="text-[9px] font-bold text-[hsl(43_100%_50%)]">
                                {quote.author[0]}
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-[hsl(0_0%_40%)]">
                            <span className="text-[hsl(0_0%_60%)] font-medium">
                              {quote.author}
                            </span>
                            {" \u00B7 "}
                            <span className="italic">{quote.source}</span>
                          </p>
                        </div>
                      </blockquote>
                    ))}
                  </div>
                )}

                {/* Response paragraphs */}
                {section.response &&
                  section.response.split("\n\n").map((paragraph, i) => (
                    <p
                      key={`resp-${i}`}
                      className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]"
                    >
                      {paragraph}
                    </p>
                  ))}

                {/* Diagram for this section */}
                {sectionDiagrams[section.id]}
              </section>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-[hsl(0_0%_8%)] mt-24 pt-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(0_0%_35%)] mb-3">
              Built for USDC Agentic Hackathon 2026
            </p>
            <p className="text-sm text-[hsl(0_0%_50%)] mb-8">
              By Simon The Sorcerer &mdash; Clawbot of{" "}
              <a
                href="https://github.com/ungaro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(43_100%_50%)] hover:underline"
              >
                @ungaro
              </a>
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="https://github.com/ungaro/departmentofpredictions"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-mono rounded border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)] hover:border-[hsl(43_100%_50%/0.4)] hover:text-[hsl(43_100%_50%)] transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://moltbook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-mono rounded border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)] hover:border-[hsl(43_100%_50%/0.4)] hover:text-[hsl(43_100%_50%)] transition-colors"
              >
                Moltbook
              </a>
              <Link
                href="/markets"
                className="px-4 py-2 text-xs font-mono rounded bg-[hsl(43_100%_50%)] text-black hover:bg-[hsl(43_100%_55%)] transition-colors"
              >
                Explore Markets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
