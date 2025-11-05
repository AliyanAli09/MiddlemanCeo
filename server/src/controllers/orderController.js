import Order from '../models/Order.js';
import Lead from '../models/Lead.js';
import { body, validationResult } from 'express-validator';

/**
 * Order Controller
 * Handles order creation and management
 */

// Generate unique order ID
const generateOrderId = () => {
  const prefix = 'ORD';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

// Validation rules
export const validateOrder = [
  body('leadId').notEmpty().withMessage('Lead ID is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('program')
    .notEmpty().withMessage('Program is required')
    .isIn(['basic', 'pro', 'elite']).withMessage('Invalid program'),
  body('programName').notEmpty().withMessage('Program name is required'),
  body('paymentPlan')
    .notEmpty().withMessage('Payment plan is required')
    .isIn(['one-time', 'split']).withMessage('Invalid payment plan'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isNumeric().withMessage('Amount must be a number'),
];

// Create Order
export const createOrder = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const {
      leadId,
      industry,
      city,
      program,
      programName,
      paymentPlan,
      amount,
      totalAmount,
    } = req.body;

    // Verify lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      customerId: leadId,
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      industry,
      city,
      program,
      programName,
      paymentPlan,
      amount,
      totalAmount: totalAmount || amount,
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      // Split payment details
      ...(paymentPlan === 'split' && {
        firstPaymentAmount: amount,
        firstPaymentStatus: 'pending',
        secondPaymentAmount: amount,
        secondPaymentStatus: 'pending',
      }),
    });

    console.log(`✅ Order created: ${orderId}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: order.orderId,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Get Order by Order ID
export const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('customerId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, program } = req.query;

    const query = {};
    if (status) query.paymentStatus = status;
    if (program) query.program = program;

    const orders = await Order.find(query)
      .populate('customerId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus, fulfillmentStatus } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;

    await order.save();

    console.log(`✅ Order ${orderId} status updated`);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message,
    });
  }
};

export default {
  validateOrder,
  createOrder,
  getOrderByOrderId,
  getAllOrders,
  updateOrderStatus,
};