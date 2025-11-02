"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Lock, ShoppingBag, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface CheckoutFormProps {
  deliveryMethod: 'delivery' | 'pickup';
  onOrderComplete: (orderData: any) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  deliveryMethod,
  onOrderComplete,
}) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'GH',
    email: '',
    phone: '',
  });

  // Pre-fill user information
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || [];
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Calculate totals
  const subtotalCents = cart.total;
  const shippingCents = deliveryMethod === 'delivery' ? 0 : 0;
  const totalCents = subtotalCents;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createOrder = async () => {
    const orderData = {
      email: formData.email,
      items: cart.items.map(item => ({
        productId: item.productId,
        title: item.title,
        priceCents: item.priceCents,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku,
        brand: item.brand,
      })),
      shippingAddress: deliveryMethod === 'delivery' ? {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      } : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: 'UPSA - Madina Campus, Accra, Ghana',
        city: 'Accra',
        state: 'Greater Accra',
        zipCode: '',
        country: 'GH',
        phone: formData.phone,
        email: formData.email,
        pickupLocation: 'UPSA - Madina'
      },
      deliveryMethod: deliveryMethod, 
      paymentMethod: 'cash_or_momo',
      subtotalCents,
      shippingCents,
      totalCents,
    };

    console.log('Creating order with deliveryMethod:', deliveryMethod);

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('token');

    // Add authentication token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Order creation failed');
    }

    return await response.json();
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const order = await createOrder();
      clearCart();
      onOrderComplete(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order creation failed');
      console.error('Order creation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    if (deliveryMethod === 'delivery') {
      requiredFields.push('address', 'city', 'state');
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill in all required fields`);
        return false;
      }
    }
    return true;
  };

  const steps = [
    { number: 1, title: deliveryMethod === 'delivery' ? 'Delivery' : 'PickUp', icon: deliveryMethod === 'delivery' ? Truck : MapPin },
    { number: 2, title: 'Review', icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <motion.div 
        className="flex justify-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <motion.div 
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step >= stepItem.number
                    ? 'bg-black text-white border-black shadow-lg'
                    : 'border-gray-300 text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <stepItem.icon size={20} />
              </motion.div>
              <span className={`ml-3 text-sm font-medium transition-all duration-300 ${
                step >= stepItem.number ? 'text-black' : 'text-gray-400'
              }`}>
                {stepItem.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                  step > stepItem.number ? 'bg-black' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Step 1: Delivery/Pickup Information */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h3 
              className="text-2xl font-light text-gray-900 mb-8 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {deliveryMethod === 'delivery' ? <Truck size={24} /> : <MapPin size={24} />}
              {deliveryMethod === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
            </motion.h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 bg-gray-50"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="024 XXX XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                />
              </motion.div>
            </div>

            {deliveryMethod === 'delivery' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                />
              </motion.div>
            )}

            {deliveryMethod === 'delivery' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Greater Accra"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300"
                  />
                </motion.div>
              </div>
            )}

            {deliveryMethod === 'pickup' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-black text-white rounded-xl p-6"
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin size={20} />
                  Pickup Location
                </h4>
                <p className="text-white/80 text-sm">
                  <strong>UPSA - Madina Campus</strong><br />
                  University of Professional Studies, Accra<br />
                  Madina Campus, Accra, Ghana<br />
                </p>
              </motion.div>
            )}

            <motion.div 
              className="flex justify-end pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.button
                type="button"
                onClick={() => {
                  if (validateForm()) {
                    setStep(2);
                    setError('');
                  }
                }}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue to Review
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Step 2: Review & Place Order */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <motion.h3 
              className="text-2xl font-light text-gray-900 mb-8 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Lock size={24} />
              Review Your Order
            </motion.h3>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            >
              <h4 className="font-semibold text-gray-900 mb-4">Order Summary</h4>
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <motion.div 
                    key={item.id} 
                    className="flex justify-between text-sm"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span className="text-gray-700">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-gray-900 font-medium">
                      GH₵{((item.priceCents * item.quantity) / 100).toFixed(2)}
                    </span>
                  </motion.div>
                ))}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>GH₵{(subtotalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pickup / Delivery</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>GH₵{(totalCents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery/Pickup Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm"
            >
              <h4 className="font-semibold text-gray-900 mb-4">
                {deliveryMethod === 'delivery' ? 'Delivery Address' : 'Pickup Information'}
              </h4>
              <p className="text-gray-700 text-sm">
                {formData.firstName} {formData.lastName}<br />
                {formData.email}<br />
                {formData.phone}<br />
                {deliveryMethod === 'delivery' ? (
                  <>
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}
                  </>
                ) : (
                  <>
                    UPSA - Madina Campus<br />
                    University of Professional Studies, Accra<br />
                    Madina Campus, Accra, Ghana
                  </>
                )}
              </p>
            </motion.div>

            {/* Payment Method Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border border-gray-200 rounded-xl p-6 bg-black text-white shadow-sm"
            >
              <h4 className="font-semibold mb-2">Payment Method</h4>
              <p className="text-white/80 text-sm">
                {deliveryMethod === 'delivery' 
                  ? 'Cash on Delivery - Pay when your order arrives'
                  : 'Pay at Pickup - You can either pay as Cash or MoMo'
                }
              </p>
            </motion.div>

            <motion.div 
              className="flex justify-between items-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={16} />
                Back to {deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
              </motion.button>
              <motion.button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Place Order
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};