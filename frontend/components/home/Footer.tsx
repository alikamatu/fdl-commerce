"use client";

import Link from "next/link";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 py-6 text-center text-sm text-foreground/60">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center max-w-5xl mx-auto px-4 gap-3">
        <span>© {year} Forbes Digital Lifeline</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
