"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Truck, MapPin } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { AuthModal } from '@/components/auth/AuthModal';

type CheckoutStep = 'method' | 'form' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('method');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [orderData, setOrderData] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  // Check authentication and cart on mount
  useEffect(() => {
    if (!authLoading) {
      setIsChecking(false);
      
      // Show auth modal if user is not logged in
      if (!user) {
        setShowAuthModal(true);
      }
    }
  }, [authLoading, user, cart.items.length, router]);

  const handleOrderComplete = (order: any) => {
    setOrderData(order);
    setStep('confirmation');
  };

  // Show loading while checking authentication
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not logged in
  if (!user) {
    return (
      <>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            router.push('/checkout');
          }}
          defaultTab="login"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {step === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-2xl mx-auto">
                <motion.h1 
                  className="text-3xl font-light text-gray-900 mb-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Choose Delivery Method
                </motion.h1>
                <motion.p 
                  className="text-gray-600 text-center mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  How would you like to receive your order?
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.button
                    onClick={() => {
                      setDeliveryMethod('delivery');
                      setStep('form');
                    }}
                    className="relative p-8 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300 bg-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Truck size={40} className="mx-auto mb-4 text-gray-700" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Delivery
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Get your order delivered to your doorstep
                    </p>
                    <div className="mt-4 text-green-600 font-medium text-sm">
                      FREE Delivery
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      setDeliveryMethod('pickup');
                      setStep('form');
                    }}
                    className="relative p-8 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300 bg-white"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MapPin size={40} className="mx-auto mb-4 text-gray-700" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Pickup
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Pick up your order at UPSA - Madina Campus
                    </p>
                    <div className="mt-4 text-blue-600 font-medium text-sm">
                      Available 24/7
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CheckoutForm
                deliveryMethod={deliveryMethod}
                onOrderComplete={handleOrderComplete}
              />
            </motion.div>
          )}

          {step === 'confirmation' && orderData && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <OrderConfirmation order={orderData} deliveryMethod={deliveryMethod} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}