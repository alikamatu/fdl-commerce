"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface CheckoutFormProps {
  user?: any;
  onOrderComplete: (orderData: any) => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  user,
  onOrderComplete,
}) => {
  const { cart, clearCart } = useCart();
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
    email: user?.email || '',
    phone: '',
  });

  // Calculate totals
  const subtotalCents = cart.total;
  const shippingCents = 0; // Free shipping
  const totalCents = subtotalCents;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createOrder = async () => {
    const orderData = {
      email: formData.email || user?.email,
      items: cart.items.map(item => ({
        productId: item.productId,
        title: item.title,
        priceCents: item.priceCents,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku,
        brand: item.brand,
      })),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
      },
      paymentMethod: 'cash_on_delivery',
      subtotalCents,
      shippingCents,
      totalCents,
    };

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (user?.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
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

  const validateShippingForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.address || 
        !formData.city || !formData.state || 
        !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const steps = [
    { number: 1, title: 'Delivery', icon: Truck },
    { number: 2, title: 'Review', icon: Lock },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-8">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepItem.number
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-foreground/20 text-foreground/40'
              }`}>
                <stepItem.icon size={16} />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step >= stepItem.number ? 'text-foreground' : 'text-foreground/40'
              }`}>
                {stepItem.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  step > stepItem.number ? 'bg-foreground' : 'bg-foreground/20'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Shipping */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Truck size={20} />
            Delivery Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Calling Number *
              </label>
              <input
                type="tel"
                name="phone"
                max={10}
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+233 XX XXX XXXX"
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/80 mb-2">
                Region *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                placeholder="e.g., Greater Accra"
                className="w-full px-4 py-3 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (validateShippingForm()) {
                  setStep(2);
                  setError('');
                }
              }}
              className="px-8 py-3 bg-foreground text-background rounded-lg font-semibold hover:bg-foreground/90 transition-colors"
            >
              Continue to Review
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Review & Place Order */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Lock size={20} />
            Review Your Order
          </h3>

          {/* Order Summary */}
          <div className="border border-foreground/10 rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-4">Order Summary</h4>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-foreground/80">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-foreground">
                    GH₵{((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-foreground/10 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Subtotal</span>
                  <span>GH₵{(subtotalCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/60">Delivery</span>
                  <span>GH₵{(shippingCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-foreground/10">
                  <span>Total</span>
                  <span>GH₵{(totalCents / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="border border-foreground/10 rounded-lg p-6">
            <h4 className="font-semibold text-foreground mb-4">Delivery Address</h4>
            <p className="text-foreground/80 text-sm">
              {formData.firstName} {formData.lastName}<br />
              {formData.email}<br />
              {formData.phone}<br />
              {formData.address}<br />
              {formData.city}, {formData.state} {formData.zipCode}
            </p>
          </div>

          {/* Payment Method Notice */}
          <div className="border border-foreground/10 rounded-lg p-6 bg-foreground/5">
            <h4 className="font-semibold text-foreground mb-2">Payment Method</h4>
            <p className="text-foreground/80 text-sm">
              Cash on Delivery - Pay when your order arrives
            </p>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-foreground/20 rounded-lg font-medium hover:bg-foreground/5 transition-colors"
            >
              Back to Delivery
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Place Order
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};