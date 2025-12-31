"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const SPEED = 25; // pixels per second

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const hasCategories = categories && categories.length > 0;
  const marqueeCategories = hasCategories ? [...categories, ...categories] : [];

  // -------------------- Auto-scroll loop --------------------
  useAnimationFrame((_, delta) => {
    if (
      isPaused ||
      dragging ||
      shouldReduceMotion ||
      !hasCategories ||
      !containerRef.current
    )
      return;

    const moveBy = (SPEED * delta) / 1000;
    const currentX = x.get();
    const width = containerRef.current.scrollWidth / 2;

    if (Math.abs(currentX) >= width) {
      x.set(0);
    } else {
      x.set(currentX - moveBy);
    }
  });

  // -------------------- Mobile Detection --------------------
  useEffect(() => {
    const detectMobile = () => setIsMobile(window.innerWidth < 768);
    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, []);

  if (loading || error || !hasCategories) return null;

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
              onClick={() => {
                if (containerRef.current) {
                  x.set(x.get() + containerRef.current.clientWidth * 0.6);
                }
              }}
              className="hidden left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow hover:shadow-md transition-shadow"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={() => {
                if (containerRef.current) {
                  x.set(x.get() - containerRef.current.clientWidth * 0.6);
                }
              }}
              className="hidden right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background rounded-full shadow hover:shadow-md transition-shadow"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            className="overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />

            {/* Scrolling marquee */}
            <motion.div
              ref={containerRef}
              className="flex gap-4 md:gap-6 py-4 cursor-grab active:cursor-grabbing w-max"
              style={{ x }}
              drag="x"
              dragConstraints={{ left: -Infinity, right: 0 }}
              dragElastic={0.15}
              onDragStart={() => setDragging(true)}
              onDragEnd={() => setDragging(false)}
              whileTap={{ cursor: "grabbing" }}
            >
              {marqueeCategories.map((category, index) => (
                <motion.a
                  key={`${category._id}-${index}`}
                  href={`/products?category=${category._id}`}
                  className="flex-shrink-0 w-24 md:w-32 lg:w-40 flex flex-col items-center select-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  draggable={false}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden bg-foreground/5 mb-2">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        draggable={false}
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};