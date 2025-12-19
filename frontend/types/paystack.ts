export interface PaystackPaymentResponse {
  reference: string;
  trans: string;
  transaction: string;
  status: string;
  message: string;
  trxref: string;
  amount: number;
  currency: string;
}

export interface PaystackConfig {
  key: string;
  publicKey?: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  reference: string;
  metadata?: Record<string, any>;
  callback?: (response: any) => void;
  onSuccess?: (response: any) => void;
  onClose?: () => void;
  channels?: string[];
}