import apiClient from './api';

/**
 * Payment Service
 * Handles all API calls related to payments
 */

// Create payment intent
export const createPaymentIntent = async (orderId, amount, currency = 'usd') => {
  try {
    const response = await apiClient.post('/payments/create-intent', {
      orderId,
      amount,
      currency,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Confirm payment
export const confirmPayment = async (paymentIntentId) => {
  try {
    const response = await apiClient.post('/payments/confirm', {
      paymentIntentId,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
};