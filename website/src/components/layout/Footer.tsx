import Link from "next/link";
import { AIJUDGE_ADDRESS } from "@/lib/contracts";
import { Logo } from "./Header";

export function Footer() {
  const hasContract =
    AIJUDGE_ADDRESS !== "0x0000000000000000000000000000000000000000";

  return (
    <footer className="border-t border-[hsl(0_0%_8%)]">
      <div className="container mx-auto px-4 py-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left: Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="small" />
              <span className="font-semibold text-[hsl(0_0%_93%)]">
                Dept. of Predictions
              </span>
            </Link>
            <p className="text-sm text-[hsl(0_0%_45%)] leading-relaxed">
              Decentralized AI oracle for prediction market settlement. Powered
              by AIJudge.
            </p>
          </div>

          {/* Right columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:justify-items-end">
            {/* Platform links */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(0_0%_60%)]">
                Platform
              </h4>
              <div className="flex flex-col gap-2">
                <Link
                  href="/markets"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)] transition-colors"
                >
                  Markets
                </Link>
                <Link
                  href="/create"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)] transition-colors"
                >
                  Create
                </Link>
                <Link
                  href="/judge"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)] transition-colors"
                >
                  Judge
                </Link>
                <Link
                  href="/about"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)] transition-colors"
                >
                  About
                </Link>
              </div>
            </div>

            {/* External links */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wider text-[hsl(0_0%_60%)]">
                Links
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://departmentofpredictions.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(43_100%_50%)] transition-colors"
                >
                  departmentofpredictions.com
                </a>
                <a
                  href="https://github.com/ungaro/aijudge-ecosystem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(43_100%_50%)] transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://moltbook.com/m/usdc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(43_100%_50%)] transition-colors"
                >
                  Moltbook
                </a>
                {hasContract && (
                  <a
                    href={`https://sepolia.basescan.org/address/${AIJUDGE_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(43_100%_50%)] transition-colors"
                  >
                    BaseScan
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[hsl(0_0%_10%)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[hsl(0_0%_45%)]">
            USDC Agentic Hackathon 2026
          </p>
          <p className="text-xs text-[hsl(0_0%_45%)]">
            Built by{" "}
            <span className="text-[hsl(0_0%_60%)]">Simon The Sorcerer</span>
            {" "}&{" "}
            <a
              href="https://twitter.com/alpguneysel"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(0_0%_60%)] hover:text-[hsl(43_100%_50%)] transition-colors"
            >
              Alp Guneysel
            </a>
            <span className="mx-1.5 text-[hsl(0_0%_20%)]">|</span>
            Brooklyn, NY
          </p>
        </div>
      </div>
    </footer>
  );
}
