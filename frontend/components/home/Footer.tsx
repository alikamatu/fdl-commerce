"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-b from-background to-background/60 backdrop-blur-lg py-10 text-sm text-muted-foreground">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        {/* === Social Handles Top === */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center items-center gap-6"
        >
          {/* Instagram */}
          <Link
            href="https://instagram.com/anointingforbes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors group"
          >
            <Instagram size={18} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="font-medium hover:text-blue-700">@anointingforbes</span>
          </Link>

          {/* Snapchat (custom SVG icon) */}
          <Link
            href="https://www.snapchat.com/add/anointingforbes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="18"
              height="18"
              fill="currentColor"
              className="group-hover:scale-110 transition-transform duration-200"
            >
              <path d="M256 32c-52.3 0-96 43.7-96 96v16c0 17.7-14.3 32-32 32-17.7 0-32 14.3-32 32v40c0 17.7 14.3 32 32 32h5.4c2.3 16.6 8.1 32.3 17 45.7-10.1 3.9-22.5 8.3-34.5 11.2-19.8 4.7-32.9 16.6-33.9 30.7-.8 11.4 7 21.3 17.2 23.6 15.2 3.5 30.5 6.2 45.7 8.2 1.1 17.7 15.7 32 33.7 32h192c18 0 32.6-14.3 33.7-32 15.2-2 30.5-4.7 45.7-8.2 10.2-2.3 18-12.2 17.2-23.6-1-14.1-14.1-26-33.9-30.7-12-2.9-24.4-7.3-34.5-11.2 8.9-13.4 14.7-29.1 17-45.7H400c17.7 0 32-14.3 32-32v-40c0-17.7-14.3-32-32-32-17.7 0-32-14.3-32-32v-16c0-52.3-43.7-96-96-96z" />
            </svg>
            <span className="font-medium hover:text-blue-700">@anointingforbes</span>
          </Link>
        </motion.div>

        {/* === Divider === */}
        <div className="w-24 h-px bg-foreground/10" />

        {/* === Legal & Info Section === */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 md:gap-6 w-full max-w-5xl text-foreground/70"
        >
          <p className="text-sm">
            In-store pricing may vary. Prices and offers are subject to change.
          </p>

          <p className="text-sm">
            © 2020 - {year}{" "}
            <span className="font-semibold text-foreground">Forbes Digitals Lifeline</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-blue-700 transition-colors">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-blue-700 transition-colors">
              Conditions of Use
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
