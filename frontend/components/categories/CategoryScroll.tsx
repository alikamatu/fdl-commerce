"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_SPEED = 0.4; // px/frame
const MOBILE_SPEED = 0.25;

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimer = useRef<NodeJS.Timeout | null>(null);

  const isPausedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Repeat categories for seamless infinite scroll
  const items = [...categories, ...categories, ...categories];

  /* -------------------- Utils -------------------- */

  const handleInfiniteBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const setWidth = el.scrollWidth / 3;

    if (el.scrollLeft < setWidth * 0.5) {
      el.scrollLeft += setWidth;
    } else if (el.scrollLeft > setWidth * 1.5) {
      el.scrollLeft -= setWidth;
    }
  }, []);

  /* ---------------- Auto Scroll ------------------ */

  const startAutoScroll = useCallback(() => {
    if (rafRef.current) return;

    const speed = isMobile ? MOBILE_SPEED : DESKTOP_SPEED;

    const step = () => {
      const el = containerRef.current;
      if (!el || isPausedRef.current) {
        rafRef.current = null;
        return;
      }

      el.scrollLeft += speed;
      handleInfiniteBounds();

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [handleInfiniteBounds, isMobile]);

  const stopAutoScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  /* ------------- User Interaction ---------------- */

  const handleUserScroll = () => {
    isPausedRef.current = true;
    stopAutoScroll();

    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }

    // Restart only after momentum stops (mobile-safe)
    scrollEndTimer.current = setTimeout(() => {
      isPausedRef.current = false;
      startAutoScroll();
    }, 120);
  };

  const manualScroll = (dir: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    stopAutoScroll();

    el.scrollBy({
      left: dir === "left" ? -el.clientWidth * 0.6 : el.clientWidth * 0.6,
      behavior: "smooth",
    });

    setTimeout(startAutoScroll, 400);
  };

  /* ----------------- Effects --------------------- */

  useEffect(() => {
    const detectMobile = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || categories.length === 0) return;

    // Start from middle set
    const setWidth = el.scrollWidth / 3;
    el.scrollLeft = setWidth;

    startAutoScroll();

    return () => stopAutoScroll();
  }, [categories.length, startAutoScroll, stopAutoScroll]);

  /* ----------------- Guards ---------------------- */

  if (loading || error || categories.length === 0) return null;

  /* ------------------ JSX ------------------------ */

  return (
    <section className="py-10 bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-light">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-foreground/60">
            Browse our curated collections
          </p>
        </motion.div>

        <div className="relative">
          {!isMobile && (
            <button
              onClick={() => manualScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => manualScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            ref={containerRef}
            className="flex gap-4 md:gap-6 overflow-x-scroll scrollbar-hide py-4"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
            }}
            onScroll={handleUserScroll}
            onMouseEnter={() => (isPausedRef.current = true)}
            onMouseLeave={() => {
              isPausedRef.current = false;
              startAutoScroll();
            }}
          >
            {items.map((category, index) => (
              <motion.a
                key={`${category._id}-${index}`}
                href={`/products?category=${category._id}`}
                className="flex-shrink-0 w-24 md:w-32 lg:w-40 flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-foreground/5 mb-2">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-foreground/30" />
                    </div>
                  )}
                </div>

                <span className="text-xs md:text-sm text-center text-foreground/80">
                  {category.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
