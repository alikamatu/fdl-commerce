"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";

export const CategoryScroll: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const [isMobile, setIsMobile] = useState(false);

  // -------------------- Detect mobile --------------------
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // -------------------- Embla setup --------------------
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: "start",
      containScroll: "trimSnaps",
    },
    [
      Autoplay({
        delay: 1500, // delay between scrolls in milliseconds
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ]
  );

  // -------------------- Arrow visibility --------------------
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateArrows = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateArrows();
    emblaApi.on("select", updateArrows);
    emblaApi.on("reInit", updateArrows);
  }, [emblaApi, updateArrows]);

  if (loading || error || categories.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-background w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-6 md:mb-8"
        >
          <h2 className="text-2xl lg:text-3xl font-light text-foreground mb-2">
            Shop by Category
          </h2>
          <p className="text-sm md:text-base text-foreground/60">
            Browse our curated collections
          </p>
        </motion.div>

        <div className="relative">
          {/* Left Arrow */}
          {canScrollPrev && !isMobile && (
            <button
              onClick={() => emblaApi?.scrollPrev()}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur border border-foreground/10 rounded-full shadow hover:scale-110 transition"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollNext && !isMobile && (
            <button
              onClick={() => emblaApi?.scrollNext()}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/90 backdrop-blur border border-foreground/10 rounded-full shadow hover:scale-110 transition"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Embla viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-4 md:gap-6 lg:gap-8 py-4">
              {categories.map((category) => (
                <a
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="group flex-shrink-0 w-20 sm:w-24 md:w-32 lg:w-40 flex flex-col items-center text-center scroll-snap-align-start"
                >
                  <div className="relative mb-3">
                    <div className="absolute inset-0 rounded-full bg-foreground/5 scale-0 group-hover:scale-110 transition-transform" />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-full border border-foreground/10 overflow-hidden bg-foreground/5">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform p-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon
                            size={isMobile ? 18 : 24}
                            className="text-foreground/30"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-xs md:text-sm font-medium text-foreground/80 group-hover:text-foreground transition">
                    {category.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
