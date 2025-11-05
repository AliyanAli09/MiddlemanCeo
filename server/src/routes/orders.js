import express from 'express';
import {
  validateOrder,
  createOrder,
  getOrderByOrderId,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

/**
 * Order Routes
 * @route /api/orders
 */

// POST /api/orders - Create a new order
router.post('/', validateOrder, createOrder);

// GET /api/orders/:orderId - Get order by order ID
router.get('/:orderId', getOrderByOrderId);

// GET /api/orders - Get all orders (Admin)
router.get('/', getAllOrders);

// PATCH /api/orders/:orderId - Update order status
router.patch('/:orderId', updateOrderStatus);

export default router;