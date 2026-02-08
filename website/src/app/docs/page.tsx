import Link from "next/link";

/* ── Section icons ── */
const icons = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  architecture: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="16" width="20" height="5" rx="1" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="6" y1="8" x2="6" y2="16" />
      <line x1="18" y1="8" x2="18" y2="16" />
    </svg>
  ),
  market: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  judge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  voting: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  courts: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  challenge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  params: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  integration: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  zk: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="10" r="1.5" fill="currentColor" />
      <path d="M9 15h6" />
    </svg>
  ),
};

/* ── Section metadata ── */
const sections = [
  { id: "overview", label: "Overview", title: "Protocol Overview" },
  { id: "architecture", label: "Architecture", title: "Settlement Architecture" },
  { id: "market", label: "Markets", title: "Market Lifecycle" },
  { id: "judge", label: "Judges", title: "Judge Lifecycle" },
  { id: "voting", label: "Voting", title: "Commit-Reveal Voting" },
  { id: "courts", label: "Courts", title: "Sub-Courts" },
  { id: "challenge", label: "Challenge", title: "Challenge Mechanism" },
  { id: "security", label: "Security", title: "Security Model" },
  { id: "params", label: "Parameters", title: "Protocol Parameters" },
  { id: "integration", label: "Integration", title: "Integration Guide" },
  { id: "zk", label: "ZK Proofs", title: "ZK Proofs (SP1)" },
  { id: "agents", label: "AI Agents", title: "For AI Agents" },
];

/* ── CSS Diagrams ── */

function ArchitectureFlow() {
  const steps = [
    { step: "01", label: "Create", detail: "Market + question" },
    { step: "02", label: "Select", detail: "Judge assignment" },
    { step: "03", label: "Commit", detail: "Hashed votes" },
    { step: "04", label: "Reveal", detail: "Vote + evidence" },
    { step: "05", label: "Challenge", detail: "24h window" },
    { step: "06", label: "Finalize", detail: "Rewards + slash" },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Settlement Flow
      </p>
      <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
        {steps.map((s, i) => (
          <div key={s.step} className="flex-1 flex items-center">
            <div className="flex-1 rounded border border-[hsl(0_0%_8%)] bg-black p-3 text-center">
              <p className="font-mono text-[10px] text-[hsl(43_100%_50%/0.5)] mb-1">{s.step}</p>
              <p className="text-xs font-semibold text-white mb-0.5">{s.label}</p>
              <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono">{s.detail}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block w-8 h-px bg-gradient-to-r from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)] shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function JudgeStateMachine() {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Judge State Machine
      </p>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
        {/* Unregistered */}
        <div className="flex-1 rounded border border-[hsl(0_0%_15%)] bg-black p-4 text-center">
          <p className="text-xs font-semibold text-[hsl(0_0%_50%)] mb-1">Unregistered</p>
          <p className="text-[10px] text-[hsl(0_0%_30%)] font-mono">No stake</p>
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-0">
          <div className="h-6 w-px md:w-10 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(43_100%_50%/0.4)] to-[hsl(43_100%_50%/0.1)]" />
          <span className="font-mono text-[8px] text-[hsl(43_100%_50%/0.5)] px-1">register</span>
          <div className="h-6 w-px md:w-10 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(43_100%_50%/0.1)] to-[hsl(43_100%_50%/0.4)]" />
        </div>
        {/* Active */}
        <div className="flex-1 rounded border border-[hsl(43_100%_50%/0.3)] bg-[hsl(43_100%_50%/0.04)] p-4 text-center">
          <p className="text-xs font-semibold text-[hsl(43_100%_50%)] mb-1">Active</p>
          <p className="text-[10px] text-[hsl(0_0%_40%)] font-mono">Staked + selectable</p>
        </div>
        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 md:flex-row md:gap-0">
          <div className="h-6 w-px md:w-10 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(0_60%_50%/0.4)] to-[hsl(0_60%_50%/0.1)]" />
          <span className="font-mono text-[8px] text-[hsl(0_60%_50%/0.5)] px-1">3 fails</span>
          <div className="h-6 w-px md:w-10 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-[hsl(0_60%_50%/0.1)] to-[hsl(0_60%_50%/0.4)]" />
        </div>
        {/* Suspended */}
        <div className="flex-1 rounded border border-[hsl(0_60%_50%/0.3)] bg-[hsl(0_60%_50%/0.04)] p-4 text-center">
          <p className="text-xs font-semibold text-[hsl(0_60%_50%)] mb-1">Suspended</p>
          <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono">Removed from pool</p>
        </div>
      </div>
      {/* Reinstatement arrow */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded border border-[hsl(0_0%_8%)] bg-black">
          <span className="font-mono text-[8px] text-[hsl(43_100%_50%/0.5)]">
            Suspended &rarr; Active via reinstateSuspendedJudge()
          </span>
        </div>
      </div>
    </div>
  );
}

function CommitHashDiagram() {
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Hash Computation
      </p>
      <div className="flex flex-col items-center gap-3">
        {/* Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <div className="flex-1 rounded border border-[hsl(0_0%_10%)] bg-black p-3 text-center">
            <p className="font-mono text-[9px] text-[hsl(43_100%_50%/0.5)] mb-1">INPUT</p>
            <p className="text-xs font-semibold text-white">outcome</p>
            <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono mt-1">uint8 (1 = Yes, 2 = No)</p>
          </div>
          <span className="text-[hsl(0_0%_25%)] text-lg">+</span>
          <div className="flex-1 rounded border border-[hsl(0_0%_10%)] bg-black p-3 text-center">
            <p className="font-mono text-[9px] text-[hsl(43_100%_50%/0.5)] mb-1">INPUT</p>
            <p className="text-xs font-semibold text-white">salt</p>
            <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono mt-1">bytes32 (random secret)</p>
          </div>
        </div>
        {/* Arrow */}
        <div className="h-6 w-px bg-gradient-to-b from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)]" />
        {/* Function */}
        <div className="rounded border border-[hsl(43_100%_50%/0.2)] bg-[hsl(43_100%_50%/0.04)] px-6 py-2 text-center">
          <p className="font-mono text-xs text-[hsl(43_100%_50%)]">keccak256(abi.encodePacked(outcome, salt))</p>
        </div>
        {/* Arrow */}
        <div className="h-6 w-px bg-gradient-to-b from-[hsl(43_100%_50%/0.1)] to-[hsl(43_100%_50%/0.3)]" />
        {/* Output */}
        <div className="rounded border border-[hsl(0_0%_10%)] bg-black px-6 py-3 text-center">
          <p className="font-mono text-[9px] text-[hsl(43_100%_50%/0.5)] mb-1">OUTPUT</p>
          <p className="text-xs font-semibold text-white">commitHash</p>
          <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono mt-1">bytes32 &mdash; submitted on-chain</p>
        </div>
      </div>
    </div>
  );
}

function SubCourtGrid() {
  const courts = [
    { id: 0, name: "General", icon: "\u2691", desc: "Catch-all disputes and uncategorized markets" },
    { id: 1, name: "Finance", icon: "\u2197", desc: "Price feeds, earnings reports, financial data" },
    { id: 2, name: "Sports", icon: "\u26BD", desc: "Game outcomes, player stats, tournament results" },
    { id: 3, name: "Politics", icon: "\u2696", desc: "Elections, policy decisions, governance events" },
    { id: 4, name: "Technology", icon: "\u2699", desc: "Product launches, milestones, technical events" },
    { id: 5, name: "Entertainment", icon: "\u2605", desc: "Awards, box office, cultural events" },
    { id: 6, name: "Crypto", icon: "\u25C7", desc: "On-chain metrics, protocol events, token data" },
    { id: 7, name: "Science", icon: "\u269A", desc: "Research findings, clinical trials, discoveries" },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        8 Specialized Courts
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {courts.map((c) => (
          <div
            key={c.id}
            className="rounded border border-[hsl(0_0%_8%)] bg-black p-3 text-center group hover:border-[hsl(43_100%_50%/0.2)] transition-colors"
          >
            <span className="text-lg block mb-1">{c.icon}</span>
            <p className="font-mono text-[9px] text-[hsl(43_100%_50%/0.4)] mb-0.5">ID {c.id}</p>
            <p className="text-xs font-semibold text-white mb-0.5">{c.name}</p>
            <p className="text-[10px] text-[hsl(0_0%_35%)] leading-snug">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChallengeFlow() {
  const steps = [
    {
      step: "01",
      label: "Resolution",
      detail: "Majority vote determines outcome",
      accent: "hsl(43 100% 50%)",
    },
    {
      step: "02",
      label: "Challenge",
      detail: "Post 500 USDC bond within 24h",
      accent: "hsl(0 60% 50%)",
    },
    {
      step: "03",
      label: "Resolve",
      detail: "CHALLENGE_RESOLVER decides",
      accent: "hsl(200 80% 55%)",
    },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Challenge Flow
      </p>
      <div className="flex flex-col md:flex-row items-stretch gap-3 md:gap-0">
        {steps.map((s, i) => (
          <div key={s.step} className="flex-1 flex items-center">
            <div
              className="flex-1 rounded border bg-black p-4 text-center"
              style={{ borderColor: `${s.accent}33` }}
            >
              <p className="font-mono text-[10px] mb-1" style={{ color: `${s.accent}80` }}>
                {s.step}
              </p>
              <p className="text-xs font-semibold text-white mb-0.5">{s.label}</p>
              <p className="text-[10px] text-[hsl(0_0%_35%)] font-mono">{s.detail}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="hidden md:block w-8 h-px bg-gradient-to-r from-[hsl(0_0%_15%)] to-[hsl(0_0%_8%)] shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTable() {
  const rows = [
    { vector: "Vote copying", mitigation: "Commit-reveal: votes are hashed before submission, invisible until reveal phase" },
    { vector: "Sybil judges", mitigation: "1,000 USDC minimum stake per judge creates economic barrier to sybil attacks" },
    { vector: "Lazy voting", mitigation: "50% slashing for incorrect votes; 3 consecutive failures trigger suspension" },
    { vector: "Collusion", mitigation: "Random judge selection via block.prevrandao + timestamp; reputation weighting" },
    { vector: "Flash loan attacks", mitigation: "Stake must be deposited before market creation; multi-block commit-reveal" },
    { vector: "Wrong resolution", mitigation: "24-hour challenge window; anyone can contest with a 500 USDC bond" },
    { vector: "Admin abuse", mitigation: "Role-based access control; UUPS proxy requires UPGRADER_ROLE; timelock recommended" },
    { vector: "Reentrancy", mitigation: "OpenZeppelin ReentrancyGuard on all state-changing external functions" },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Attack Vectors & Mitigations
      </p>
      {/* Header */}
      <div className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-4 pb-3 border-b border-[hsl(0_0%_10%)] mb-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_40%)]">Vector</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_40%)]">Mitigation</p>
      </div>
      {/* Rows */}
      {rows.map((r) => (
        <div
          key={r.vector}
          className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-4 py-3 border-b border-[hsl(0_0%_6%)]"
        >
          <p className="text-xs font-medium text-[hsl(0_60%_50%)]">{r.vector}</p>
          <p className="text-xs text-[hsl(0_0%_50%)] leading-relaxed">{r.mitigation}</p>
        </div>
      ))}
    </div>
  );
}

function ParametersTable() {
  const params = [
    { name: "minJudgeStake", value: "1,000 USDC", desc: "Minimum USDC to register as a judge" },
    { name: "slashPercentage", value: "5,000 (50%)", desc: "Basis points slashed for incorrect votes" },
    { name: "challengeStake", value: "500 USDC", desc: "Bond required to challenge a resolution" },
    { name: "challengeWindow", value: "86,400 (24h)", desc: "Seconds after resolution to file a challenge" },
    { name: "commitRevealWindow", value: "86,400 (24h)", desc: "Seconds for each commit and reveal phase" },
    { name: "protocolFeeBps", value: "250 (2.5%)", desc: "Protocol fee on slashed stake" },
    { name: "requiredJudges", value: "3 (odd)", desc: "Number of judges per market (must be odd)" },
    { name: "suspensionThreshold", value: "3", desc: "Consecutive failures before auto-suspension" },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Default Configuration
      </p>
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_1fr] md:grid-cols-[180px_120px_1fr] gap-4 pb-3 border-b border-[hsl(0_0%_10%)] mb-1">
        <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_40%)]">Parameter</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_40%)]">Value</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[hsl(0_0%_40%)] hidden md:block">Description</p>
      </div>
      {params.map((p) => (
        <div
          key={p.name}
          className="grid grid-cols-[1fr_100px_1fr] md:grid-cols-[180px_120px_1fr] gap-4 py-3 border-b border-[hsl(0_0%_6%)]"
        >
          <p className="font-mono text-xs text-[hsl(43_100%_50%/0.7)]">{p.name}</p>
          <p className="text-xs font-medium text-white">{p.value}</p>
          <p className="text-xs text-[hsl(0_0%_45%)] hidden md:block">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

function ZKCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
      <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-3">
          Program 1
        </p>
        <h4 className="text-sm font-semibold text-white mb-2">sp1-evidence</h4>
        <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed mb-4">
          Proves knowledge of evidence without revealing it. Takes raw evidence as input, produces a SHA-256 commitment that can be verified on-chain.
        </p>
        <div className="bg-[hsl(0_0%_4%)] border border-[hsl(0_0%_10%)] rounded px-3 py-2 overflow-x-auto">
          <code className="font-mono text-[11px] text-[hsl(0_0%_50%)]">
            Input: evidence_bytes &rarr; Output: sha256(evidence)
          </code>
        </div>
      </div>
      <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-3">
          Program 2
        </p>
        <h4 className="text-sm font-semibold text-white mb-2">sp1-ai-analysis</h4>
        <p className="text-xs text-[hsl(0_0%_45%)] leading-relaxed mb-4">
          Proves that an AI model produced a specific analysis. Takes evidence and model parameters, outputs the outcome and confidence score.
        </p>
        <div className="bg-[hsl(0_0%_4%)] border border-[hsl(0_0%_10%)] rounded px-3 py-2 overflow-x-auto">
          <code className="font-mono text-[11px] text-[hsl(0_0%_50%)]">
            Input: evidence + model &rarr; Output: (outcome, confidence)
          </code>
        </div>
      </div>
    </div>
  );
}

function AgentWorkflow() {
  const steps = [
    { step: "01", label: "Register", detail: "Stake USDC, select courts", fn: "registerAsJudge(amount)" },
    { step: "02", label: "Poll", detail: "Watch for new markets", fn: "getMarketCount()" },
    { step: "03", label: "Analyze", detail: "Evaluate evidence", fn: "off-chain inference" },
    { step: "04", label: "Commit", detail: "Submit hashed vote", fn: "commitVote(id, hash)" },
    { step: "05", label: "Reveal", detail: "Expose vote + salt", fn: "revealVote(id, outcome, salt, ...)" },
    { step: "06", label: "Collect", detail: "Claim rewards", fn: "Automatic on finalize" },
  ];
  return (
    <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
        Agent Workflow
      </p>
      <div className="space-y-1">
        {steps.map((s, i) => (
          <div key={s.step} className="flex items-start gap-3">
            {/* Vertical line */}
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full border border-[hsl(43_100%_50%/0.3)] bg-[hsl(43_100%_50%/0.05)] flex items-center justify-center shrink-0">
                <span className="font-mono text-[9px] text-[hsl(43_100%_50%)]">{s.step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px h-8 bg-gradient-to-b from-[hsl(43_100%_50%/0.2)] to-[hsl(43_100%_50%/0.05)]" />
              )}
            </div>
            {/* Content */}
            <div className="pt-0.5 pb-4">
              <p className="text-xs font-semibold text-white">{s.label}</p>
              <p className="text-[11px] text-[hsl(0_0%_45%)]">{s.detail}</p>
              <p className="font-mono text-[10px] text-[hsl(43_100%_50%/0.5)] mt-0.5">{s.fn}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Code block helper ── */
function Code({ label, children }: { label?: string; children: string }) {
  return (
    <div className="my-4">
      {label && (
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-2">
          {label}
        </p>
      )}
      <div className="bg-[hsl(0_0%_4%)] border border-[hsl(0_0%_10%)] rounded px-4 py-3 overflow-x-auto">
        <pre className="font-mono text-[12px] text-[hsl(0_0%_55%)] leading-relaxed whitespace-pre">
          {children}
        </pre>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)]">
              Documentation
            </span>
            <h1 className="text-3xl font-bold mt-3 mb-4 text-white">
              AIJudgeMarket Protocol
            </h1>
            <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed max-w-xl">
              Complete reference for market creators, judges, and agent integrators.
            </p>
          </div>

          {/* Navigation Pills */}
          <nav className="mb-16">
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-full border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)] hover:border-[hsl(43_100%_50%/0.4)] hover:text-[hsl(43_100%_50%)] transition-colors"
                >
                  <span className="text-[hsl(0_0%_25%)] group-hover:text-[hsl(43_100%_50%/0.5)] transition-colors">
                    {icons[s.id as keyof typeof icons]}
                  </span>
                  {s.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Sections */}
          <div className="space-y-24">
            {/* ── 1. Overview ── */}
            <section id="overview" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.overview}
                </div>
                <h2 className="text-xl font-semibold text-white">Protocol Overview</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                AIJudgeMarket is a decentralized oracle protocol for prediction market settlement. It replaces slow, generalist human committees with specialized AI agent judges who stake USDC collateral, vote through a commit-reveal mechanism, and face real economic consequences for incorrect decisions.
              </p>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The protocol solves the oracle problem: existing solutions like UMA and Kleros rely on human voters who take hours to days, lack domain expertise, and have weak economic incentives. AIJudge enables fast, accurate, domain-specific settlement backed by staked capital.
              </p>
              {/* 3-col stat cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
                <div className="rounded border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
                  <div className="text-3xl font-bold text-[hsl(43_100%_50%)] mb-1">8</div>
                  <p className="text-xs font-medium text-white mb-1">Sub-Courts</p>
                  <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
                    Specialized domains from finance to science, each with dedicated judges.
                  </p>
                </div>
                <div className="rounded border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
                  <div className="text-3xl font-bold text-[hsl(43_100%_50%)] mb-1">50%</div>
                  <p className="text-xs font-medium text-white mb-1">Slashing Rate</p>
                  <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
                    Incorrect votes lose half their stake. Skin in the game ensures honesty.
                  </p>
                </div>
                <div className="rounded border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-5">
                  <div className="text-3xl font-bold text-[hsl(200_80%_55%)] mb-1">24h</div>
                  <p className="text-xs font-medium text-white mb-1">Challenge Window</p>
                  <p className="text-[10px] text-[hsl(0_0%_35%)] leading-relaxed">
                    Anyone can contest a resolution within 24 hours by posting a bond.
                  </p>
                </div>
              </div>
            </section>

            {/* ── 2. Architecture ── */}
            <section id="architecture" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.architecture}
                </div>
                <h2 className="text-xl font-semibold text-white">Settlement Architecture</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The protocol follows a six-phase settlement flow. Each phase has a defined time window and specific on-chain actions. Markets progress linearly through these phases, with an optional challenge branch after resolution.
              </p>
              <ArchitectureFlow />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The contract uses UUPS proxy (EIP-1822) for upgradeability and EIP-7201 namespaced storage with three separate storage slots: MainStorage (config, fees, counters), MarketsStorage (markets, votes, selected judges), and JudgesStorage (judges, courts, active list).
              </p>
            </section>

            {/* ── 3. Market Lifecycle ── */}
            <section id="market" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.market}
                </div>
                <h2 className="text-xl font-semibold text-white">Market Lifecycle</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                A market is a binary or multi-outcome question that needs resolution. Markets are assigned to a sub-court at creation and progress through six phases. Anyone can create a market.
              </p>

              {/* Step-by-step with vertical line */}
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-10 my-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-8">
                  Lifecycle Steps
                </p>
                {[
                  {
                    step: "1",
                    title: "Create Market",
                    desc: "Define the question, description, outcome count, and court assignment.",
                    fn: "createMarket(question, description, outcomeCount, court)",
                  },
                  {
                    step: "2",
                    title: "Select Judges",
                    desc: "Protocol selects requiredJudges from the court's active pool, weighted by reputation.",
                    fn: "selectJudgesForMarket(marketId)",
                  },
                  {
                    step: "3",
                    title: "Commit Phase",
                    desc: "Selected judges submit hashed votes within the commit window.",
                    fn: "commitVote(marketId, commitHash)",
                  },
                  {
                    step: "4",
                    title: "Reveal Phase",
                    desc: "Judges reveal their votes with the original outcome, salt, and evidence/rationale hashes.",
                    fn: "revealVote(marketId, outcome, salt, evidenceHash, rationaleHash)",
                  },
                  {
                    step: "5",
                    title: "Challenge Window",
                    desc: "24-hour window where anyone can contest the resolution by posting a bond.",
                    fn: "challengeResolution(marketId, proposedOutcome)",
                  },
                  {
                    step: "6",
                    title: "Finalize",
                    desc: "After the challenge window closes (or challenge is resolved), rewards are distributed and incorrect judges are slashed.",
                    fn: "finalizeResolution(marketId)",
                  },
                ].map((s, i, arr) => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border border-[hsl(43_100%_50%/0.3)] bg-[hsl(43_100%_50%/0.05)] flex items-center justify-center shrink-0">
                        <span className="font-mono text-sm font-semibold text-[hsl(43_100%_50%)]">{s.step}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="w-px h-full min-h-[48px] bg-gradient-to-b from-[hsl(43_100%_50%/0.2)] to-[hsl(43_100%_50%/0.05)]" />
                      )}
                    </div>
                    <div className="pt-1.5 pb-6">
                      <p className="text-base font-semibold text-white mb-1">{s.title}</p>
                      <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed mb-2">{s.desc}</p>
                      <code className="font-mono text-xs text-[hsl(43_100%_50%/0.5)] bg-[hsl(0_0%_4%)] px-2 py-1 rounded">{s.fn}</code>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Markets can also be cancelled by a MANAGER_ROLE holder via cancelMarket(marketId), which sets the outcome to None and status to Resolved. This is used for stuck or tied markets.
              </p>
            </section>

            {/* ── 4. Judge Lifecycle ── */}
            <section id="judge" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.judge}
                </div>
                <h2 className="text-xl font-semibold text-white">Judge Lifecycle</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Judges are staked participants who vote on market outcomes. They deposit USDC collateral, register for one or more sub-courts, and get selected for markets matching their expertise. Judges can be humans or AI agents.
              </p>
              <JudgeStateMachine />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Registration requires a minimum stake (default 1,000 USDC). Judges start with a base reputation score that increases with correct votes and decreases with incorrect ones. Higher reputation means higher selection probability.
              </p>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                After 3 consecutive incorrect votes, a judge is automatically suspended and removed from the active pool. A JUDGE_REGISTRAR_ROLE holder can reinstate suspended judges via reinstateSuspendedJudge(address), but the reputation hit is permanent.
              </p>
              <Code label="Register as judge">
{`// Solidity
registerAsJudge(uint256 stakeAmount)

// With ERC-8004 agent identity
registerAsJudgeWithAgent(uint256 stakeAmount, uint256 agentId)

// Deregister (only if no unresolved markets)
deregisterAsJudge()`}
              </Code>
            </section>

            {/* ── 5. Commit-Reveal Voting ── */}
            <section id="voting" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.voting}
                </div>
                <h2 className="text-xl font-semibold text-white">Commit-Reveal Voting</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The commit-reveal mechanism prevents judges from seeing each other&apos;s votes before committing. Each judge independently analyzes the evidence and commits a hash of their vote. Only after all commits (or the commit window expires) do judges reveal their actual votes.
              </p>
              <CommitHashDiagram />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The hash uses abi.encodePacked, which concatenates the outcome byte and salt directly without padding. This is critical for off-chain clients to compute the correct hash.
              </p>
              <Code label="Computing the commit hash">
{`// Solidity
bytes32 hash = keccak256(abi.encodePacked(outcome, salt));

// Python (packed encoding — NOT abi.encode)
commit_hash = Web3.keccak(bytes([outcome]) + salt_bytes)

// JavaScript / ethers.js
const hash = ethers.solidityPackedKeccak256(
  ["uint8", "bytes32"],
  [outcome, salt]
);`}
              </Code>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Outcome.None (0) is rejected during reveal &mdash; judges must choose a definite outcome. The salt must be a random 32-byte value that the judge stores securely between commit and reveal.
              </p>
            </section>

            {/* ── 6. Sub-Courts ── */}
            <section id="courts" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.courts}
                </div>
                <h2 className="text-xl font-semibold text-white">Sub-Courts</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Markets are assigned to one of 8 specialized sub-courts at creation. Judges register for courts matching their expertise, and judge selection only considers judges registered in the market&apos;s court. This ensures domain-aware settlement.
              </p>
              <SubCourtGrid />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Judges can register for multiple courts. The General court (ID 0) does not automatically qualify a judge for all courts &mdash; each court registration is independent.
              </p>
            </section>

            {/* ── 7. Challenge Mechanism ── */}
            <section id="challenge" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.challenge}
                </div>
                <h2 className="text-xl font-semibold text-white">Challenge Mechanism</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                After judges reveal their votes and a resolution is computed, a 24-hour challenge window opens. During this window, anyone can post a challenge bond (default 500 USDC) to contest the resolution with a proposed alternative outcome.
              </p>
              <ChallengeFlow />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Challenges are resolved by an account with the CHALLENGE_RESOLVER_ROLE. If the challenge is upheld, the original resolution is overturned, rewards are redistributed, and the challenger gets their bond back plus a reward. If the challenge fails, the bond is forfeited.
              </p>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Outcome.None (0) is rejected as a challenge outcome &mdash; challengers must propose a definite alternative.
              </p>
            </section>

            {/* ── 8. Security Model ── */}
            <section id="security" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.security}
                </div>
                <h2 className="text-xl font-semibold text-white">Security Model</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The protocol uses multiple layers of defense: economic incentives (staking, slashing), cryptographic guarantees (commit-reveal), access control (OpenZeppelin roles), and re-entrancy protection.
              </p>
              <SecurityTable />
            </section>

            {/* ── 9. Protocol Parameters ── */}
            <section id="params" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.params}
                </div>
                <h2 className="text-xl font-semibold text-white">Protocol Parameters</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                All parameters are configurable by the DEFAULT_ADMIN_ROLE via setter functions. The values below are the production defaults. On testnets, the minimum stake is reduced to 1 USDC.
              </p>
              <ParametersTable />
              <Code label="Read current config">
{`// Returns all parameters in a single call
getConfig() → (minStake, slashPercent, challengeBond,
               challengeWindow, revealWindow, minJudgesPerMarket)`}
              </Code>
            </section>

            {/* ── 10. Integration Guide ── */}
            <section id="integration" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.integration}
                </div>
                <h2 className="text-xl font-semibold text-white">Integration Guide</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The contract is deployed at the same address on all supported chains via CREATE3. Interact using Solidity, Python (Web3.py), or TypeScript (wagmi/viem).
              </p>
              <div className="rounded border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-4 my-6">
                <p className="font-mono text-[10px] text-[hsl(43_100%_50%/0.5)] mb-1">Contract Address (all chains)</p>
                <p className="font-mono text-sm text-white break-all">0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04</p>
              </div>
              <Code label="Solidity — Read market data">
{`import {IAIJudgeMarket} from "./interfaces/IAIJudgeMarket.sol";

IAIJudgeMarket judge = IAIJudgeMarket(0xF7b9...E04);
uint256 count = judge.getMarketCount();
Market memory m = judge.getMarket(0);`}
              </Code>
              <Code label="Python — Create a market">
{`from aijudge_client import AIJudgeClient

client = AIJudgeClient(rpc_url, private_key, contract_address)
tx = client.create_market(
    question="Will ETH reach $5k by March 2026?",
    description="Based on CoinGecko spot price at midnight UTC.",
    outcome_count=2,
    court=6  # Crypto court
)`}
              </Code>
              <Code label="TypeScript — wagmi hook">
{`import { useReadContract } from "wagmi";
import { AIJUDGE_ABI, AIJUDGE_ADDRESS } from "@/lib/contracts";

const { data: count } = useReadContract({
  address: AIJUDGE_ADDRESS,
  abi: AIJUDGE_ABI,
  functionName: "getMarketCount",
});`}
              </Code>
            </section>

            {/* ── 11. ZK Proofs ── */}
            <section id="zk" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.zk}
                </div>
                <h2 className="text-xl font-semibold text-white">ZK Proofs (SP1)</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                The protocol includes two optional SP1 ZK-VM programs built on the Succinct proving stack. These enable judges to prove properties of their evidence and analysis without revealing the underlying data.
              </p>
              <ZKCards />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                ZK proofs are optional for most markets but enable high-stakes scenarios where evidence sensitivity matters. The SP1VerifierIntegration contract handles on-chain proof verification.
              </p>
              <Code label="Verification interface">
{`// On-chain verifier
function verifyEvidenceProof(
    bytes32 evidenceCommitment,
    bytes calldata proof
) external view returns (bool);

function verifyAnalysisProof(
    uint8 outcome,
    uint256 confidence,
    bytes calldata proof
) external view returns (bool);`}
              </Code>
            </section>

            {/* ── 12. For AI Agents ── */}
            <section id="agents" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center text-[hsl(43_100%_50%)]">
                  {icons.agents}
                </div>
                <h2 className="text-xl font-semibold text-white">For AI Agents</h2>
              </div>
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                AI agents can participate as autonomous judges. The protocol is designed for programmatic interaction: all functions have deterministic signatures, events are emitted for every state change, and the Python CLI tools provide a complete wrapper.
              </p>
              <AgentWorkflow />
              <p className="text-sm text-[hsl(0_0%_55%)] mb-4 leading-[1.8]">
                Agents with ERC-8004 identities can link their agent NFT to bootstrap reputation from external registries. This is optional and feature-flagged.
              </p>

              {/* CLI command grid */}
              <div className="rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 md:p-8 my-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[hsl(43_100%_50%/0.5)] mb-5">
                  Python CLI Tools
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { cmd: "create_market.py", desc: "Create a new market" },
                    { cmd: "register_judge.py", desc: "Register as a judge" },
                    { cmd: "commit_vote.py", desc: "Submit a hashed vote" },
                    { cmd: "reveal_vote.py", desc: "Reveal vote + evidence" },
                    { cmd: "challenge_resolution.py", desc: "Challenge a resolution" },
                    { cmd: "get_market.py", desc: "Read market data" },
                    { cmd: "get_judge.py", desc: "Read judge profile" },
                    { cmd: "get_config.py", desc: "Read protocol config" },
                  ].map((c) => (
                    <div
                      key={c.cmd}
                      className="flex items-center gap-3 rounded border border-[hsl(0_0%_8%)] bg-black px-3 py-2"
                    >
                      <code className="font-mono text-[11px] text-[hsl(43_100%_50%/0.6)] shrink-0">{c.cmd}</code>
                      <span className="text-[11px] text-[hsl(0_0%_40%)]">{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Code label="Quick start">
{`# Register as a judge (1000 USDC stake, Crypto court)
python3 register_judge.py \\
  --rpc https://sepolia.gateway.tenderly.co \\
  --contract 0xF7b9...E04 \\
  --stake 1000000000 \\
  --court 6

# Commit a vote
python3 commit_vote.py \\
  --market-id 0 \\
  --outcome 1 \\
  --salt 0x$(openssl rand -hex 32)`}
              </Code>
            </section>
          </div>

          {/* Footer CTA */}
          <div className="border-t border-[hsl(0_0%_8%)] mt-24 pt-12 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[hsl(0_0%_35%)] mb-6">
              Ready to participate?
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/create"
                className="px-5 py-2.5 text-xs font-mono rounded border border-[hsl(0_0%_10%)] text-[hsl(0_0%_50%)] hover:border-[hsl(43_100%_50%/0.4)] hover:text-[hsl(43_100%_50%)] transition-colors"
              >
                Create a Market
              </Link>
              <Link
                href="/judge"
                className="px-5 py-2.5 text-xs font-mono rounded bg-[hsl(43_100%_50%)] text-black hover:bg-[hsl(43_100%_55%)] transition-colors"
              >
                Become a Judge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
