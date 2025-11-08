"use client";

import { motion } from 'framer-motion';
import { Eye, Clock } from 'lucide-react';

// Mock data - replace with actual recently viewed items from your API
const recentlyViewed = [
  {
    id: '1',
    name: 'Vintage Baseball Card Collection',
    price: 249.99,
    image: '/api/placeholder/200/200',
    viewedAt: '2 hours ago',
  },
  {
    id: '2',
    name: 'Limited Edition Action Figure',
    price: 89.99,
    image: '/api/placeholder/200/200',
    viewedAt: '1 day ago',
  },
  {
    id: '3',
    name: 'Rare Pokémon Card Pack',
    price: 199.99,
    image: '/api/placeholder/200/200',
    viewedAt: '3 days ago',
  },
  {
    id: '4',
    name: 'Collector\'s Comic Book',
    price: 149.99,
    image: '/api/placeholder/200/200',
    viewedAt: '1 week ago',
  },
];

export const RecentlyViewed: React.FC = () => {
  return (
    <section className="hidden py-16 bg-foreground/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-3xl font-light text-foreground mb-2">
              Your Recently Viewed Items
            </h2>
            <p className="text-foreground/60">
              Pick up where you left off
            </p>
          </div>
          <button className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
            <Eye size={20} />
            <span>View All</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentlyViewed.map((item, index) => (
            <motion.a
              key={item.id}
              href={`/products/${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="block bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                  {item.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-foreground">
                    ${item.price}
                  </span>
                  <div className="flex items-center gap-1 text-foreground/40 text-sm">
                    <Clock size={14} />
                    <span>{item.viewedAt}</span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};