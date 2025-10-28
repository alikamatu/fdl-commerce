"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Ghost, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center"
      >
        <div className="p-6 bg-foreground/5 rounded-full mb-6">
          <Ghost size={64} className="text-foreground/60" />
        </div>

        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <p className="text-foreground/60 mb-8 text-lg max-w-md">
          Oops! The page you are looking for does not exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ delay: 0.6, duration: 1.2 }}
        className="absolute text-[20rem] font-extrabold text-foreground/5 select-none pointer-events-none"
      >
        404
      </motion.div>
    </main>
  );
}
