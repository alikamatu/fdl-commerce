"use client";

import { motion } from 'framer-motion';
import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Authenticity Guaranteed',
    description: 'Every item is verified by our expert team',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50 with secure packaging',
  },
  {
    icon: RotateCcw,
    title: 'Hassle-Free Returns',
    description: '30-day return policy for your peace of mind',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service team',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 border-t border-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-light text-foreground mb-4">
            Shopping Made Easy
          </h2>
          <p className="text-lg text-foreground/60">
            Enjoy reliability, secure deliveries and hassle-free returns
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-foreground/5 rounded-full">
                  <feature.icon size={32} className="text-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-foreground/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};