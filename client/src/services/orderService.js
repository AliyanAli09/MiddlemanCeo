import apiClient from './api';

/**
 * Order Service
 * Handles all API calls related to orders
 */

// Create order
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders', orderData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get order by order ID
export const getOrderByOrderId = async (orderId) => {
  try {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  createOrder,
  getOrderByOrderId,
};