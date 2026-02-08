"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";

const navLinks = [
  { href: "/markets", label: "Markets" },
  { href: "/create", label: "Create" },
  { href: "/judge", label: "Judge" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const sizeClass = size === "small" ? "w-5 h-5" : "w-7 h-7";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(45 85% 55%)"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={sizeClass}
    >
      {/* vertical pole */}
      <line x1="12" y1="3" x2="12" y2="21" />
      {/* base */}
      <line x1="8" y1="21" x2="16" y2="21" />
      {/* horizontal beam */}
      <line x1="4" y1="7" x2="20" y2="7" />
      {/* left chain */}
      <line x1="4" y1="7" x2="4" y2="13" />
      {/* right chain */}
      <line x1="20" y1="7" x2="20" y2="13" />
      {/* left pan (triangle) */}
      <polygon points="1,13 4,13 7,13 4,17" fill="hsl(45 85% 55%)" stroke="hsl(45 85% 55%)" />
      {/* right pan (triangle) */}
      <polygon points="17,13 20,13 23,13 20,17" fill="hsl(45 85% 55%)" stroke="hsl(45 85% 55%)" />
    </svg>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-[hsl(0_0%_8%)] bg-[hsl(0_0%_0%/0.92)] backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        {/* Left: Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span
            className="font-semibold text-white transition-all duration-300"
            style={transparent ? { textShadow: "0 1px 8px rgba(0,0,0,0.5)" } : undefined}
          >
            <span className="hidden sm:inline">Dept. of Predictions</span>
            <span className="sm:hidden">DoP</span>
          </span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs transition-colors ${
                transparent
                  ? "text-white/80 hover:text-white"
                  : "text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Wallet + Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <ConnectKitButton />

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(0 0% 60%)"
              strokeWidth={2}
              strokeLinecap="round"
              className="w-5 h-5"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[hsl(0_0%_10%)] bg-black px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm text-[hsl(0_0%_45%)] hover:text-[hsl(0_0%_93%)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
