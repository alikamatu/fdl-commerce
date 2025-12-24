"use client";

import {
  motion,
  useMotionValue,
  useAnimationFrame,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { useRef, useState } from "react";
import { useBrands } from "@/hooks/useBrands";

const SPEED = 35; // pixels per second

export const BrandsSection: React.FC = () => {
  const { brands, loading, error } = useBrands();
  const shouldReduceMotion = useReducedMotion();

  // -------------------- Hooks (always called) --------------------
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const hasBrands = brands && brands.length > 0;
  const marqueeBrands = hasBrands ? [...brands, ...brands] : [];

  // -------------------- Auto-scroll loop --------------------
  useAnimationFrame((_, delta) => {
    if (isPaused || dragging || shouldReduceMotion || !hasBrands || !containerRef.current) return;

    const moveBy = (SPEED * delta) / 1000;
    const currentX = x.get();
    const width = containerRef.current.scrollWidth / 2;

    if (Math.abs(currentX) >= width) {
      x.set(0);
    } else {
      x.set(currentX - moveBy);
    }
  });

  if (loading || error || !hasBrands) return null;

  return (
    <section className="w-full py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="mb-4 md:mb-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-medium text-foreground">
            Shop by Brand
          </h2>
        </div>

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Swipeable marquee */}
          <motion.div
            ref={containerRef}
            className="flex w-max gap-4 md:gap-6 cursor-grab active:cursor-grabbing"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: -Infinity, right: 0 }}
            dragElastic={0.15} // smooth resistance
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
            whileTap={{ cursor: "grabbing" }}
          >
            {marqueeBrands.map((brand, index) => (
              <Link
                key={`${brand._id}-${index}`}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center gap-1 shrink-0 select-none"
              >
                <div className="flex items-center justify-center rounded-full bg-muted/40 w-24 h-24 md:w-28 md:h-28 transition-transform hover:scale-105">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="w-full h-full object-contain p-3"
                      loading="lazy"
                      draggable={false}
                    />
                  ) : (
                    <Building2 className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                  )}
                </div>

                <span className="hidden text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
                  {brand.name}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};