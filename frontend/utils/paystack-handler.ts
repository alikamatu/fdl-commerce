export interface PaystackResponse {
  status: 'success' | 'failed';
  reference: string;
  transaction: string;
  message: string;
  trxref: string;
  amount: number;
  currency: string;
}

export const initializePaystack = ({
  publicKey,
  email,
  amount,
  currency = 'GHS',
  reference,
  metadata = {},
  onSuccess,
  onClose,
  onError,
}: {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference: string;
  metadata?: Record<string, any>;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
  onError: (error: string) => void;
}) => {
  if (typeof window === 'undefined' || !window.PaystackPop) {
    throw new Error('Paystack is not available');
  }

  const config = {
    key: publicKey,
    email,
    amount,
    currency,
    ref: reference,
    metadata,
    callback: function(response: PaystackResponse) {
      console.log('Paystack callback:', response);
      if (response.status === 'success') {
        onSuccess(response);
      } else {
        onError(response.message || 'Payment failed');
      }
    },
    onClose: function() {
      onClose();
    },
  };

  const handler = window.PaystackPop.setup(config);
  handler.openIframe();
};

export const generateReference = (): string => {
  return `PSK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const convertToPesewas = (amountInCedis: number): number => {
  return Math.round(amountInCedis * 100);
};