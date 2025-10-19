/**
 * Payment Service
 * Handles all payment-related operations with Paystack integration
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface PaymentInitRequest {
  email: string;
  plan: string;
  user_id?: string;
}

export interface PaymentInitResponse {
  success: boolean;
  authorization_url: string;
  access_code: string;
  reference: string;
  message: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  message: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}

class PaymentService {
  /**
   * Initialize a payment transaction with Paystack
   */
  async initializePayment(data: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      const response = await axios.post<PaymentInitResponse>(
        `${API_BASE_URL}/api/payments/init`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Failed to initialize payment. Please try again.'
      );
    }
  }

  /**
   * Verify a payment transaction
   */
  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await axios.get<PaymentVerifyResponse>(
        `${API_BASE_URL}/api/payments/verify/${reference}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Payment verification error:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Failed to verify payment. Please contact support.'
      );
    }
  }

  /**
   * Get payment status by reference (lightweight polling)
   */
  async getPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    try {
      const response = await axios.get<PaymentStatusResponse>(
        `${API_BASE_URL}/api/payments/status/${reference}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Payment status error:', error);
      throw new Error(
        error.response?.data?.detail || 
        'Failed to fetch payment status.'
      );
    }
  }

  /**
   * Redirect user to Paystack checkout page
   */
  redirectToPaystack(authorizationUrl: string): void {
    window.location.href = authorizationUrl;
  }

  /**
   * Extract payment reference from URL query params (callback)
   */
  getPaymentReferenceFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('reference') || urlParams.get('trxref');
  }

  /**
   * Calculate amount in kobo (Naira * 100)
   */
  calculateAmountInKobo(amountInNaira: number): number {
    return Math.round(amountInNaira * 100);
  }

  /**
   * Format amount from kobo to Naira
   */
  formatAmountFromKobo(amountInKobo: number): string {
    const naira = amountInKobo / 100;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(naira);
  }
}

export const paymentService = new PaymentService();
export default paymentService;
