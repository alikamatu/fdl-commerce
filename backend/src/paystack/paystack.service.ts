import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface PaystackTransaction {
  reference: string;
  amount: number; // in kobo (for NGN) or pesewas (for GHS)
  email: string;
  currency: 'NGN' | 'GHS' | 'USD';
  metadata?: {
    orderId?: string;
    userId?: string;
    cartItems?: any[];
    deliveryMethod?: string;
  };
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    metadata: any;
  };
}

@Injectable()
export class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  async initializeTransaction(transaction: PaystackTransaction): Promise<PaystackResponse> {
    try {
      const amountInSmallestUnit = transaction.amount; // Already in kobo/pesewas
      
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: transaction.email,
          amount: amountInSmallestUnit,
          reference: transaction.reference,
          currency: transaction.currency,
          metadata: transaction.metadata,
          callback_url: `${process.env.FRONTEND_URL}/checkout/verify?reference=${transaction.reference}`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async verifyTransaction(reference: string): Promise<PaystackVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  generateReference(): string {
    return `paystack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  convertToSmallestUnit(amount: number, currency: string): number {
    // Paystack expects amount in smallest unit
    // For GHS: 1 GHS = 100 pesewas
    // For NGN: 1 NGN = 100 kobo
    // For USD: 1 USD = 100 cents
    return Math.round(amount * 100);
  }
}