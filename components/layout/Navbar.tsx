"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WalletButton } from "@/components/layout/WalletButton";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Scanner" },
  { href: "/alerts", label: "Alerts" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:rgba(10,10,15,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-mono text-lg font-semibold tracking-[0.2em] text-white">
            SCOUT
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  pathname === link.href
                    ? "bg-[var(--bg-card)] text-white"
                    : "text-[var(--text-secondary)] hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
}
