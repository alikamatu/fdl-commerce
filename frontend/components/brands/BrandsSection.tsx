"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";

const SCROLL_DURATION = 35; // slower = smoother

export const BrandsSection: React.FC = () => {
  const { brands, loading, error } = useBrands();

  if (loading || error || brands.length === 0) return null;

  // Duplicate brands for infinite scroll illusion
  const marqueeBrands = [...brands, ...brands];

  return (
    <section className="w-full py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Title */}
        <div className="mb-4 md:mb-6 text-center">
          <h2 className="text-base md:text-xl font-medium text-foreground">
            Shop by Brand
          </h2>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative overflow-hidden">
          {/* Edge fade (premium touch) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Scrolling Row */}
          <motion.div
            className="flex w-max gap-4 md:gap-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: SCROLL_DURATION,
            }}
            whileHover={{ animationPlayState: "paused" }}
          >
            {marqueeBrands.map((brand, index) => (
              <Link
                key={`${brand._id}-${index}`}
                href={`/brands/${brand.slug}`}
                className="flex flex-col items-center justify-center gap-1 shrink-0"
              >
                {/* Logo */}
                <div className="flex items-center justify-center rounded-full bg-muted/40 
                                w-24 h-24 md:w-28 md:h-28 transition-transform">
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="w-full h-full object-contain p-2"
                      loading="lazy"
                    />
                  ) : (
                    <Building2 className="w-4 h-4 md:w-6 md:h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Name (tiny, clean) */}
                <span className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">
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