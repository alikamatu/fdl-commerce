'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    image: '/images/wall.jpg',
    title: 'Build an Elite Collection',
    description: 'Choose your next adventure from thousands of finds',
    ctaText: 'Shop Now',
    ctaLink: '/products',
  },
  {
    id: '2',
    image: '/api/placeholder/1200/600',
    title: 'New Arrivals Every Day',
    description: 'Discover the latest additions to our curated collection',
    ctaText: 'Explore New',
    ctaLink: '/products?sort=newest',
  },
  {
    id: '3',
    image: '/api/placeholder/1200/600',
    title: 'Limited Time Offers',
    description: 'Save big on premium items with exclusive discounts',
    ctaText: 'View Deals',
    ctaLink: '/products?discount=true',
  },
  {
    id: '4',
    image: '/api/placeholder/1200/600',
    title: 'Premium Quality Guaranteed',
    description: 'Shop with confidence with our authenticity promise',
    ctaText: 'Learn More',
    ctaLink: '/about',
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  slides = defaultSlides,
  autoPlayInterval = 5000,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, isPaused]);

  const toggleAutoPlay = () => {
    setIsPaused(!isPaused);
  };

  return (
    <div className="relative w-full h-[600px] overflow-hidden group">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${slides[currentSlide].image})`,
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="max-w-2xl text-white"
                >
                  <h1 className="text-5xl md:text-6xl font-light mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90 font-light">
                    {slides[currentSlide].description}
                  </p>
                  <motion.a
                    href={slides[currentSlide].ctaLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-8 py-4 bg-white text-black text-lg font-medium rounded-lg hover:bg-gray-100 transition-colors duration-300"
                  >
                    {slides[currentSlide].ctaText}
                  </motion.a>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Auto-play Toggle */}
      <button
        onClick={toggleAutoPlay}
        className="absolute bottom-6 right-6 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-300"
      >
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
      </button>

      {/* Progress Bar */}
      {!isPaused && (
        <motion.div
          key={currentSlide}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: autoPlayInterval / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 h-1 bg-white/80"
        />
      )}
    </div>
  );
};