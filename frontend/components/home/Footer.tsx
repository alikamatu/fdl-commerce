"use client";

import Link from "next/link";
import { Instagram, MessageCircle } from "lucide-react"; // for icons (Snapchat uses MessageCircle)

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 py-6 text-center text-sm text-foreground/60">
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center max-w-5xl mx-auto px-4 gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span>In-store pricing may vary. Prices and offers are subject to change.</span>
          <span>© 2020 - {year} Forbes Digital Lifeline. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="https://instagram.com/anointingforbes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Instagram size={16} />
            <span>@anointingforbes</span>
          </Link>

          <Link
            href="https://www.snapchat.com/add/anointingforbes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <MessageCircle size={16} />
            <span>@anointingforbes</span>
          </Link>

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
