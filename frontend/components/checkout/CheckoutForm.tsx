"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Lock, ShoppingBag, MapPin, ChevronRight, 
  ChevronLeft, CreditCard, Wallet, Smartphone 
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ApiHelper } from '@/lib/api-helper';

interface CheckoutFormProps {
  deliveryMethod: 'delivery' | 'pickup';
  onOrderComplete: (orderData: any) => void;
}

type PaymentMethod = 'paystack' | 'cash_or_momo' | 'cash_or_momo';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata?: Record<string, any>;
        callback?: (response: any) => void;
        onClose?: () => void;
        channels?: string[];
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  deliveryMethod,
  onOrderComplete,
}) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    deliveryMethod === 'delivery' ? 'cash_or_momo' : 'cash_or_momo'
  );

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

  useEffect(() => {
  // Check if Paystack is loaded
  const checkPaystack = () => {
    if (typeof window !== 'undefined' && window.PaystackPop) {
      setPaystackLoaded(true);
    } else {
      // Retry after 500ms if not loaded
      setTimeout(checkPaystack, 500);
    }
  };

  checkPaystack();
}, []);

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
  const shippingCents = 0;
  const totalCents = subtotalCents;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const createOrder = async (selectedPaymentMethod: PaymentMethod) => {
    const orderData = {
      email: formData.email,
      items: cart.items.map(item => ({
        productId: item.productId,
        title: item.title,
        priceCents: item.priceCents,
        quantity: item.quantity,
        image: item.image,
        sku: item.sku || 'N/A',
        brand: item.brand || 'N/A',
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
      paymentMethod: selectedPaymentMethod,
      subtotalCents,
      shippingCents,
      totalCents,
    };

    console.log('Sending order data to backend:', JSON.stringify(orderData, null, 2));

    try {
      const response = await ApiHelper.fetch('/orders', {
        method: 'POST',
        requireAuth: true,
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Order creation failed');
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error && err.message === 'SESSION_EXPIRED') {
        throw new Error('Your session expired. Please login again.');
      }
      throw err;
    }
  };

const initializePaystackPayment = (order: any) => {
  if (!window.PaystackPop) {
    throw new Error('Paystack is not loaded');
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error('Paystack public key not configured');
  }

  // Create a plain JavaScript object for config (no React state references)
  const config = {
    key: publicKey,
    email: formData.email,
    amount: totalCents, // Amount in pesewas
    currency: 'GHS',
    ref: `${order._id}_${Date.now()}`,
    metadata: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      userId: user?.id,
      deliveryMethod: deliveryMethod,
    },
    // Use a plain function, not an arrow function with React state
    callback: function(response: any) {
      console.log('Paystack callback received:', response);
      
      // Create a separate async function to handle the response
      const handlePaymentResponse = async () => {
        try {
          // Verify payment on backend
          const verifyResponse = await ApiHelper.fetch('/orders/paystack/verify', {
            method: 'POST',
            requireAuth: true,
            body: JSON.stringify({ reference: response.reference }),
          });

          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            clearCart();
            onOrderComplete(verifyData.data);
          } else {
            throw new Error(verifyData.message || 'Payment verification failed');
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          // Handle session expired
          const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
          const displayMessage = errorMessage === 'SESSION_EXPIRED' 
            ? 'Your session expired. Please login again.' 
            : errorMessage;
          
          // Use setTimeout to avoid React state updates during render
          setTimeout(() => {
            setError(displayMessage);
          }, 0);
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 0);
        }
      };
      
      // Execute the async handler
      handlePaymentResponse();
    },
    onClose: function() {
      // Use setTimeout to avoid React state updates during render
      setTimeout(() => {
        setLoading(false);
        setError('Payment was cancelled');
      }, 0);
    },
  };

  console.log('Initializing Paystack with config:', {
    ...config,
    key: '***masked***'
  });

  const handler = window.PaystackPop.setup(config);
  handler.openIframe();
};

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      // Create the order first
      const order = await createOrder(paymentMethod);

      // If payment method is Paystack, initialize payment
      if (paymentMethod === 'paystack') {
        if (!paystackLoaded) {
          throw new Error('Payment system is loading. Please wait...');
        }
        initializePaystackPayment(order);
        return; // Don't clear cart yet - wait for payment completion
      }

      // For cash payments, complete immediately
      clearCart();
      onOrderComplete(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order creation failed');
      console.error('Order creation failed:', err);
    } finally {
      if (paymentMethod !== 'paystack') {
        setLoading(false);
      }
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
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: Lock },
  ];

  return (
    <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }}>
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
              className="space-y-6"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-8">
                {deliveryMethod === 'delivery' ? 'Delivery Information' : 'Pickup Information'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              {deliveryMethod === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Region *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-6">
                <motion.button
                  type="button"
                  onClick={() => {
                    if (validateForm()) {
                      setStep(2);
                      setError('');
                    }
                  }}
                  className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue to Payment
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-8">
                Choose Payment Method
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Paystack Payment */}
                <motion.div
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  paymentMethod === 'paystack' 
                    ? 'border-black bg-black/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('paystack')}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'paystack' ? 'border-black' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'paystack' && (
                    <div className="w-3 h-3 bg-black rounded-full" />
                    )}
                  </div>
                  <Smartphone size={24} />
                  <div>
                    <h4 className="font-semibold">Pay with Paystack</h4>
                    <p className="text-sm text-gray-600">Card, Mobile Money, Bank</p>
                  </div>
                  </div>
                  <p className="text-sm text-gray-700 ml-10">
                  Secure online payment - instant confirmation
                  </p>
                </motion.div>

                {/* Cash Payment */}
                <motion.div
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod !== 'paystack'
                      ? 'border-black bg-black/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(
                    deliveryMethod === 'delivery' ? 'cash_or_momo' : 'cash_or_momo'
                  )}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod !== 'paystack' ? 'border-black' : 'border-gray-300'
                    }`}>
                      {paymentMethod !== 'paystack' && (
                        <div className="w-3 h-3 bg-black rounded-full" />
                      )}
                    </div>
                    <Wallet size={24} />
                    <div>
                      <h4 className="font-semibold">
                        {deliveryMethod === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}
                      </h4>
                      <p className="text-sm text-gray-600">Pay later with Cash/MoMo</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 ml-10">
                    Pay when you receive your order
                  </p>
                </motion.div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  Review Order
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-light text-gray-900 mb-8">
                Review Your Order
              </h3>

              {/* Order Summary */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Order Items</h4>
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-16 h-16 object-contain rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        GH₵ {((item.priceCents * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-6 pt-6">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>GH₵ {(subtotalCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>{deliveryMethod === 'delivery' ? 'Delivery Fee' : 'Pickup Fee'}</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-4 border-t">
                    <span>Total</span>
                    <span>GH₵ {(totalCents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold mb-4">
                  {deliveryMethod === 'delivery' ? 'Delivery Address' : 'Pickup Location'}
                </h4>
                <p className="text-gray-700">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.email}<br />
                  {formData.phone}<br />
                  {deliveryMethod === 'delivery' ? (
                    <>
                      {formData.address}<br />
                      {formData.city}, {formData.state} {formData.zipCode}
                    </>
                  ) : (
                    'UPSA - Madina Campus, Accra, Ghana'
                  )}
                </p>
              </div>

              {/* Payment Method */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold mb-4">Payment Method</h4>
                <div className="flex items-center gap-3">
                  {paymentMethod === 'paystack' ? (
                    <>
                      <Smartphone size={24} />
                      <span>Pay with Paystack</span>
                    </>
                  ) : (
                    <>
                      <Wallet size={24} />
                      <span>
                        {deliveryMethod === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      {paymentMethod === 'paystack' ? 'Pay Now' : 'Place Order'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};