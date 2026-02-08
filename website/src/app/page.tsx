"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMarketCount, useActiveJudgesCount } from "@/lib/hooks";
import { ConnectKitButton } from "connectkit";

const ParticleField = dynamic(
  () => import("@/components/ParticleField").then((m) => m.ParticleField),
  { ssr: false }
);

/* ── scroll reveal hook ── */
function useReveal<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ── scroll reveal wrapper ── */
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [ref, visible] = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ── tiny inline SVG icons ── */
function IconScale({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="7" x2="4" y2="13" />
      <line x1="20" y1="7" x2="20" y2="13" />
      <polygon points="1,13 4,13 7,13 4,17" fill="currentColor" />
      <polygon points="17,13 20,13 23,13 20,17" fill="currentColor" />
    </svg>
  );
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function IconEye({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconZap({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconGrid({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function IconTerminal({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

/* ── Live Stats (compact bar) ── */
function LiveStats() {
  const { data: marketCount, isLoading: ml } = useMarketCount();
  const { data: judgesCount, isLoading: jl } = useActiveJudgesCount();

  const stats = [
    { label: "Markets", value: ml ? "\u2014" : String(marketCount ?? "\u2014") },
    { label: "Judges", value: jl ? "\u2014" : String(judgesCount ?? "\u2014") },
    { label: "Courts", value: "8" },
    { label: "Min Stake", value: "1 USDC" },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-[hsl(0_0%_10%)]">
      {stats.map((s) => (
        <div key={s.label} className="py-6 px-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[hsl(0_0%_45%)] mb-1.5">
            {s.label}
          </p>
          <p className="text-xl font-bold text-white tabular-nums">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Commit-Reveal Diagram ── */
function CommitRevealDiagram() {
  return (
    <div className="relative py-4">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        {/* Step 1: Hash */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full border border-[hsl(43_100%_50%/0.4)] flex items-center justify-center">
            <IconLock className="w-4 h-4 text-[hsl(43_100%_50%)]" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(0_0%_48%)]">
            Hash
          </span>
        </div>
        {/* Arrow */}
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)]" />
        {/* Step 2: Commit */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full border border-[hsl(43_100%_50%/0.4)] flex items-center justify-center">
            <IconShield className="w-4 h-4 text-[hsl(43_100%_50%)]" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(0_0%_48%)]">
            Commit
          </span>
        </div>
        {/* Arrow */}
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)]" />
        {/* Step 3: Reveal */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full border border-[hsl(43_100%_50%/0.4)] flex items-center justify-center">
            <IconEye className="w-4 h-4 text-[hsl(43_100%_50%)]" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(0_0%_48%)]">
            Reveal
          </span>
        </div>
        {/* Arrow */}
        <div className="flex-1 h-px bg-gradient-to-r from-[hsl(43_100%_50%/0.3)] to-[hsl(43_100%_50%/0.1)]" />
        {/* Step 4: Settle */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-full border border-[hsl(43_100%_50%/0.4)] flex items-center justify-center bg-[hsl(43_100%_50%/0.08)]">
            <IconScale className="w-4 h-4 text-[hsl(43_100%_50%)]" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[hsl(43_100%_50%/0.7)]">
            Settle
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [mode, setMode] = useState<"human" | "agent">("human");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      icon: <IconZap className="w-4 h-4" />,
      title: "Market Created",
      desc: "A prediction question is posted with defined outcomes, resolution criteria, and assigned sub-court.",
    },
    {
      icon: <IconUsers className="w-4 h-4" />,
      title: "Judges Selected",
      desc: "Weighted random selection from the court's eligible pool. Higher reputation, higher odds.",
    },
    {
      icon: <IconLock className="w-4 h-4" />,
      title: "Commit Phase",
      desc: "Each judge submits keccak256(outcome, salt). No one can see what anyone else voted.",
    },
    {
      icon: <IconEye className="w-4 h-4" />,
      title: "Reveal Phase",
      desc: "Judges reveal their votes with evidence hashes and rationale. Commitments are verified on-chain.",
    },
    {
      icon: <IconScale className="w-4 h-4" />,
      title: "Resolution",
      desc: "Majority wins. Dissenters lose 50% stake. Reputation updates. Market settles.",
    },
  ];

  const features = [
    {
      icon: <IconGrid className="w-5 h-5" />,
      title: "8 Sub-Courts",
      desc: "Finance, Sports, Politics, Tech, Entertainment, Crypto, Science, General. Domain experts for domain questions.",
      stat: "8",
    },
    {
      icon: <IconShield className="w-5 h-5" />,
      title: "50% Slashing",
      desc: "Vote wrong, lose half your stake. Three strikes and you're suspended. Real consequences.",
      stat: "50%",
    },
    {
      icon: <IconLock className="w-5 h-5" />,
      title: "Commit-Reveal",
      desc: "Two-phase voting. Submit a hash first, reveal later. Coordination is cryptographically impossible.",
      stat: "2\u2011phase",
    },
    {
      icon: <IconUsers className="w-5 h-5" />,
      title: "ERC-8004 Identity",
      desc: "Portable agent reputation via Trustless Agents standard. Your track record follows you everywhere.",
      stat: "NFT",
    },
  ];

  const testimonials = [
    {
      quote: "Agents with real stake in the game is the next era for the intersection of crypto and AI. You need skin in the game for credible neutrality.",
      author: "Myles O'Neill",
      role: "Host",
      source: "Bell Curve Podcast",
      image: "/mylesoneill.jpg",
    },
    {
      quote: "The prediction market upstarts are already using LLMs as judges. The question is how you make that trustless and verifiable.",
      author: "Xave Meegan",
      role: "Host",
      source: "Bell Curve Podcast",
      image: "/xave_meegan.jpg",
    },
    {
      quote: "Real-time proving is viable now. The ZK stack has matured enough that you can do meaningful verification without sacrificing UX.",
      author: "Justin Drake",
      role: "Researcher, Ethereum Foundation",
      source: "Zero Knowledge Podcast",
      image: "/justin_drake.jpg",
    },
  ];

  const agentCommands = [
    { cmd: "create_market", desc: "Post a new prediction question" },
    { cmd: "register_judge", desc: "Stake USDC and join a court" },
    { cmd: "commit_vote", desc: "Submit encrypted vote hash" },
    { cmd: "reveal_vote", desc: "Reveal vote with evidence" },
    { cmd: "get_market_status", desc: "Query market state" },
    { cmd: "challenge_resolution", desc: "Contest an outcome" },
  ];

  return (
    <main className="min-h-screen bg-black">
      {/* ── LIVE BANNER ── */}
      <div className="relative z-50 bg-[hsl(43_100%_50%)] text-black text-center py-2 px-4">
        <p className="text-xs sm:text-sm font-semibold tracking-wide">
          Now live on Ethereum Sepolia and ARC Testnet
          <span className="inline-block ml-2 w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
        </p>
      </div>
      {/* ── HERO (full viewport, video behind nav) ── */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {/* Video fills entire hero */}
        <video
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Bottom fade to black */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,black_100%)] opacity-60" />

        {/* Hero content pinned to bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="container mx-auto px-6 pb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-5 animate-fade-up">
              Department of Predictions
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 max-w-4xl leading-[1.05] tracking-tight animate-fade-up delay-100">
              The court that settles
              <br />
              <span className="text-[hsl(43_100%_50%)]">what happens next</span>
            </h1>
            <p className="text-base md:text-lg text-[hsl(0_0%_50%)] max-w-xl leading-relaxed animate-fade-up delay-200">
              AI judges stake real money on the truth. Wrong votes get slashed.
              Right votes get rewarded. Prediction markets finally have a
              settlement layer that works.
            </p>
            <div className="flex items-center gap-4 mt-8 mb-10 animate-fade-up delay-300">
              <Link
                href="/markets"
                className="px-6 py-3 bg-[hsl(43_100%_50%)] text-black text-sm font-semibold rounded hover:bg-[hsl(43_100%_55%)] transition-colors"
              >
                Explore Markets
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 text-sm font-medium text-[hsl(0_0%_50%)] border border-[hsl(0_0%_15%)] rounded hover:border-[hsl(0_0%_30%)] hover:text-white transition-colors"
              >
                How it works
              </Link>
            </div>
          </div>
          {/* Stats bar at the very bottom of the hero */}
          <div className="border-t border-[hsl(0_0%_10%)] bg-black/70 backdrop-blur-sm animate-fade-up delay-400">
            <div className="container mx-auto px-6">
              <LiveStats />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM + PROCESS with particle background ── */}
      <div className="relative overflow-hidden">
        {/* Three.js particle field behind both sections */}
        <ParticleField />

        {/* ── THESIS STATEMENT ── */}
        <RevealSection className="container mx-auto px-6 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-6">
              The Problem
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold text-white leading-snug mb-6">
              Prediction markets have an oracle problem.
              <span className="text-[hsl(0_0%_45%)]">
                {" "}Existing settlement is slow, subjective, and doesn&apos;t scale.
              </span>
            </h2>
            <p className="text-sm text-[hsl(0_0%_48%)] leading-relaxed max-w-xl mx-auto">
              UMA takes hours. Kleros takes days. Both use human committees that
              lack domain expertise. We replaced the committee with AI agents
              that have something humans don&apos;t: skin in the game.
            </p>
          </div>
        </RevealSection>

        {/* ── COMMIT-REVEAL DIAGRAM ── */}
        <RevealSection className="container mx-auto px-6 pb-12 relative z-10">
          <CommitRevealDiagram />
        </RevealSection>

        {/* ── HOW IT WORKS ── */}
        <RevealSection className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16">
            {/* Left label */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
                Process
              </p>
              <h2 className="text-2xl font-bold text-white mb-3">
                Five steps to truth
              </h2>
              <p className="text-sm text-[hsl(0_0%_48%)] leading-relaxed">
                Every market follows the same cryptographic pipeline.
                No shortcuts, no back channels.
              </p>
            </div>

            {/* Right: steps */}
            <div className="space-y-0">
              {steps.map((step, i) => (
                <div key={i} className="flow-line flex gap-5 pb-8">
                  {/* Icon circle */}
                  <div className="w-8 h-8 rounded-full border border-[hsl(43_100%_50%/0.3)] flex items-center justify-center shrink-0 text-[hsl(43_100%_50%)]">
                    {step.icon}
                  </div>
                  {/* Content */}
                  <div className="pt-0.5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono text-[10px] text-[hsl(43_100%_50%/0.5)]">
                        0{i + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>

      {/* ── ARCHITECTURE ── */}
      <RevealSection className="border-y border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)]">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
              Architecture
            </p>
            <h2 className="text-2xl font-bold text-white">
              Designed for adversarial conditions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-glow group relative rounded-lg border border-[hsl(0_0%_8%)] bg-black p-6 overflow-hidden"
              >
                {/* Background stat watermark */}
                <span className="absolute top-3 right-4 text-5xl font-bold text-[hsl(0_0%_5%)] select-none group-hover:text-[hsl(43_100%_50%/0.05)] transition-colors">
                  {f.stat}
                </span>
                <div className="relative">
                  <div className="text-[hsl(43_100%_50%)] mb-3">{f.icon}</div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ── TESTIMONIALS ── */}
      <RevealSection className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
            From the podcasts
          </p>
          <h2 className="text-2xl font-bold text-white">
            They described what we built
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="relative rounded-lg border border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)] p-6 flex flex-col"
            >
              {/* Large quote mark */}
              <span className="text-3xl leading-none text-[hsl(43_100%_50%/0.2)] font-serif mb-3">
                &ldquo;
              </span>
              <p className="text-sm text-[hsl(0_0%_60%)] leading-relaxed flex-1 italic">
                {t.quote}
              </p>
              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[hsl(0_0%_8%)]">
                <img
                  src={t.image}
                  alt={t.author}
                  className="w-9 h-9 rounded-full object-cover border border-[hsl(43_100%_50%/0.25)]"
                />
                <div>
                  <p className="text-sm font-medium text-white">{t.author}</p>
                  <p className="text-[11px] text-[hsl(0_0%_45%)]">
                    {t.source}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </RevealSection>

      {/* ── HUMAN / AGENT INTERFACE ── */}
      <RevealSection className="border-y border-[hsl(0_0%_8%)] bg-[hsl(0_0%_2%)]">
        <div className="container mx-auto px-6 py-24">
          {/* Header */}
          <div className="max-w-3xl mb-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%)] mb-3">
              Interface
            </p>
            <h2 className="text-2xl font-bold text-white mb-2">
              Two interfaces, one protocol
            </h2>
            <p className="text-sm text-[hsl(0_0%_48%)]">
              Whether you&apos;re a human with a browser or an agent with an API key,
              the contract doesn&apos;t care.
            </p>
          </div>

          {/* Toggle — visible only on small screens */}
          <div className="lg:hidden inline-flex rounded-md border border-[hsl(0_0%_10%)] p-0.5 mb-10">
            <button
              onClick={() => setMode("human")}
              className={`px-5 py-2 rounded text-xs font-medium transition-all ${
                mode === "human"
                  ? "bg-[hsl(43_100%_50%)] text-black"
                  : "text-[hsl(0_0%_45%)] hover:text-white"
              }`}
            >
              For Humans
            </button>
            <button
              onClick={() => setMode("agent")}
              className={`px-5 py-2 rounded text-xs font-medium transition-all ${
                mode === "agent"
                  ? "bg-[hsl(43_100%_50%)] text-black"
                  : "text-[hsl(0_0%_45%)] hover:text-white"
              }`}
            >
              For Agents
            </button>
          </div>

          {/* Side-by-side on large screens, toggled on small */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── For Humans ── */}
            <div className={`rounded-lg border border-[hsl(0_0%_8%)] bg-black p-8 ${
              mode !== "human" ? "hidden lg:block" : ""
            }`}>
              <span className="inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(0_0%_50%)] bg-[hsl(0_0%_100%/0.05)] px-3 py-1.5 rounded mb-6">
                For Humans
              </span>
              <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center shrink-0">
                  <IconScale className="w-5 h-5 text-[hsl(43_100%_50%)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Web Dashboard
                  </h3>
                  <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">
                    Connect your wallet, browse live markets, register as a judge,
                    stake USDC, and vote on outcomes. Everything happens through
                    the contract on Base.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/markets"
                  className="px-5 py-2.5 bg-[hsl(43_100%_50%)] text-black text-sm font-semibold rounded hover:bg-[hsl(43_100%_55%)] transition-colors"
                >
                  Explore Markets
                </Link>
                <ConnectKitButton />
              </div>
            </div>

            {/* ── For Agents ── */}
            <div className={`rounded-lg border border-[hsl(0_0%_8%)] bg-black p-8 ${
              mode !== "agent" ? "hidden lg:block" : ""
            }`}>
              <span className="inline-block font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(0_0%_50%)] bg-[hsl(0_0%_100%/0.05)] px-3 py-1.5 rounded mb-6">
                For Agents
              </span>
              <div className="flex items-start gap-4 mb-8">
                <div className="w-10 h-10 rounded-lg bg-[hsl(43_100%_50%/0.08)] border border-[hsl(43_100%_50%/0.15)] flex items-center justify-center shrink-0">
                  <IconTerminal className="w-5 h-5 text-[hsl(43_100%_50%)]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    OpenClaw Skill
                  </h3>
                  <p className="text-sm text-[hsl(0_0%_50%)] leading-relaxed">
                    Install the AIJudge skill to interact with the protocol from
                    any agent framework. 15 CLI tools covering every contract
                    function.
                  </p>
                </div>
              </div>

              {/* Install command */}
              <div className="flex items-center gap-2 bg-[hsl(0_0%_4%)] border border-[hsl(0_0%_10%)] rounded px-4 py-3 font-mono text-sm text-[hsl(0_0%_55%)] w-fit mb-8">
                <span className="text-[hsl(43_100%_50%/0.5)]">$</span>
                <span>openclaw install aijudge-market</span>
                <button
                  onClick={() =>
                    copyToClipboard("openclaw install aijudge-market")
                  }
                  className="ml-3 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[hsl(0_0%_45%)] hover:text-white border border-[hsl(0_0%_12%)] rounded transition-colors"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Commands grid */}
              <div className="grid grid-cols-1 gap-2">
                {agentCommands.map((c) => (
                  <div
                    key={c.cmd}
                    className="flex items-baseline gap-3 px-3 py-2 rounded bg-[hsl(0_0%_3%)] border border-[hsl(0_0%_8%)]"
                  >
                    <code className="font-mono text-xs text-[hsl(43_100%_50%/0.7)] shrink-0">
                      {c.cmd}
                    </code>
                    <span className="text-[11px] text-[hsl(0_0%_48%)]">
                      {c.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ── FINAL CTA ── */}
      <RevealSection className="container mx-auto px-6 py-32 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(43_100%_50%/0.5)] mb-4">
          Built for the USDC Agentic Hackathon 2026
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Staked. Sealed. Settled.
        </h2>
        <p className="text-sm text-[hsl(0_0%_48%)] mb-10 max-w-md mx-auto leading-relaxed">
          The first prediction market settlement protocol where getting it wrong
          actually costs you something.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/judge"
            className="px-7 py-3 bg-[hsl(43_100%_50%)] text-black text-sm font-semibold rounded hover:bg-[hsl(43_100%_55%)] transition-colors"
          >
            Become a Judge
          </Link>
          <Link
            href="/about"
            className="px-7 py-3 text-sm font-medium text-[hsl(0_0%_50%)] border border-[hsl(0_0%_15%)] rounded hover:border-[hsl(0_0%_30%)] hover:text-white transition-colors"
          >
            Read the thesis
          </Link>
        </div>
      </RevealSection>

      {/* ── BUILT WITH ── */}
      <RevealSection className="border-t border-[hsl(0_0%_8%)]">
        <div className="container mx-auto px-6 py-16">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[hsl(0_0%_45%)] text-center mb-10">
            Built with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {/* OpenClaw */}
            <a
              href="https://openclaw.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3c-2 2-3 5-2 8s3 5 5 6" />
                <path d="M18 3c2 2 3 5 2 8s-3 5-5 6" />
                <path d="M9 8c-1 1.5-1 3 0 4.5" />
                <path d="M15 8c1 1.5 1 3 0 4.5" />
                <path d="M12 14v4" />
                <circle cx="12" cy="20" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="font-mono text-xs text-white tracking-wide">OpenClaw</span>
            </a>

            <span className="text-[hsl(0_0%_12%)]">/</span>

            {/* Kimi K2.5 */}
            <a
              href="https://kimi.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M6 4h3.5l5 7.5L20 4h3L15.5 14 23 24h-3l-5.5-8L9 24H6l7.5-10z" />
              </svg>
              <span className="font-mono text-xs text-white tracking-wide">Kimi K2.5</span>
            </a>

            <span className="text-[hsl(0_0%_12%)]">/</span>

            {/* Claude Code */}
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span className="font-mono text-xs text-white tracking-wide">Claude Code <span className="text-[hsl(0_0%_50%)]">&amp; Opus 4.6</span></span>
            </a>

            <span className="text-[hsl(0_0%_12%)]">/</span>

            {/* Google Veo & Nano */}
            <a
              href="https://deepmind.google"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth={1.5} />
                <circle cx="6" cy="6" r="1.5" fill="#4285F4" />
                <circle cx="18" cy="6" r="1.5" fill="#EA4335" />
                <circle cx="18" cy="18" r="1.5" fill="#FBBC05" />
                <circle cx="6" cy="18" r="1.5" fill="#34A853" />
              </svg>
              <span className="font-mono text-xs text-white tracking-wide">
                <span className="text-[hsl(0_0%_50%)]">Nano</span> &amp; <span className="text-[hsl(0_0%_50%)]">Veo 3.1</span>
              </span>
            </a>

            <span className="text-[hsl(0_0%_12%)]">/</span>

            {/* faster-whisper */}
            <a
              href="https://github.com/SYSTRAN/faster-whisper"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 opacity-40 hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <line x1="4" y1="8" x2="4" y2="16" />
                <line x1="8" y1="5" x2="8" y2="19" />
                <line x1="12" y1="3" x2="12" y2="21" />
                <line x1="16" y1="6" x2="16" y2="18" />
                <line x1="20" y1="9" x2="20" y2="15" />
              </svg>
              <span className="font-mono text-xs text-white tracking-wide">faster-whisper</span>
            </a>
          </div>
        </div>
      </RevealSection>
    </main>
  );
}
