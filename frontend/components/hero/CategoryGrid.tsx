"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  link: string;
  items?: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Trading Cards',
    description: 'Rare collectibles and trading cards',
    image: '/api/placeholder/400/300',
    link: '/products?category=trading-cards',
    items: '10K+ items',
  },
  {
    id: '2',
    name: 'Toys',
    description: 'Vintage and modern toys',
    image: '/api/placeholder/400/300',
    link: '/products?category=toys',
    items: '5K+ items',
  },
  {
    id: '3',
    name: 'Sports Cards',
    description: 'Authentic sports memorabilia',
    image: '/api/placeholder/400/300',
    link: '/products?category=sports-cards',
    items: '8K+ items',
  },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-16 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4">
            Start Your Journey
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Explore our carefully curated categories and discover your next treasure
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <a href={category.link} className="block">
                <div className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="aspect-[4/3] overflow-hidden">
                    <motion.img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                        {category.name}
                      </h3>
                      <ArrowRight 
                        size={20} 
                        className="text-foreground/40 group-hover:text-foreground/60 transform group-hover:translate-x-1 transition-all duration-300" 
                      />
                    </div>
                    
                    <p className="text-foreground/60 mb-3">
                      {category.description}
                    </p>
                    
                    {category.items && (
                      <p className="text-sm text-foreground/40">
                        {category.items}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};