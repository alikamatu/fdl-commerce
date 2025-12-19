export interface PaystackPaymentResponse {
  status: 'success' | 'failed';
  reference: string;
  trans: string;
  transaction: string;
  message: string;
  trxref: string;
  amount: number;
  currency: string;
}

export interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
  };
  callback: (response: PaystackPaymentResponse) => void;
  onClose: () => void;
  channels?: string[];
}