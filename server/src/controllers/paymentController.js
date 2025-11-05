import Order from '../models/Order.js';
import Lead from '../models/Lead.js';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  createOrRetrieveCustomer,
  verifyWebhookSignature,
} from '../services/stripeService.js';
import {
  sendCustomerConfirmation,
  sendAdminNotification,
} from '../services/emailService.js';
import { body, validationResult } from 'express-validator';

/**
 * Payment Controller
 * Handles Stripe payment processing
 */

// Validation rules for payment intent
export const validatePaymentIntent = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').notEmpty().withMessage('Amount is required').isNumeric(),
];

// Create Payment Intent
export const createPaymentIntentHandler = async (req, res) => {
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

    const { orderId, amount, currency = 'usd' } = req.body;

    // Get order details
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Get customer details
    const lead = await Lead.findById(order.customerId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Create or retrieve Stripe customer
    const customer = await createOrRetrieveCustomer(
      lead.email,
      lead.name,
      lead.phone
    );

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, currency, {
      orderId: order.orderId,
      customerName: lead.name,
      customerEmail: lead.email,
      program: order.program,
    });

    // Update order with Stripe details
    order.stripePaymentIntentId = paymentIntent.id;
    order.stripeCustomerId = customer.id;
    await order.save();

    console.log(`✅ Payment intent created for order ${orderId}`);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
    });
  }
};

// Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID is required',
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status,
      });
    }

    // Find order
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status
    order.paymentStatus = 'paid';
    if (order.paymentPlan === 'one-time') {
      order.fulfillmentStatus = 'in-progress';
    } else if (order.paymentPlan === 'split') {
      order.firstPaymentStatus = 'paid';
      order.firstPaymentDate = new Date();
      order.secondPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
    await order.save();

    // Mark lead as converted
    await Lead.findByIdAndUpdate(order.customerId, {
      convertedToCustomer: true,
    });

    // Get lead data for emails
    const lead = await Lead.findById(order.customerId);

    // Send emails
    try {
      await sendCustomerConfirmation(
        {
          orderId: order.orderId,
          programName: order.programName,
          amount: order.amount,
          paymentPlan: order.paymentPlan,
        },
        {
          name: lead.name,
          email: lead.email,
        }
      );

      await sendAdminNotification(
        {
          orderId: order.orderId,
          programName: order.programName,
          amount: order.amount,
          industry: order.industry,
          city: order.city,
        },
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        }
      );
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the request if emails fail
    }

    console.log(`✅ Payment confirmed for order ${order.orderId}`);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      order,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message,
    });
  }
};

// Stripe Webhook Handler
export const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    // Verify webhook signature
    const event = verifyWebhookSignature(req.body, signature);

    console.log(`📨 Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
      error: error.message,
    });
  }
};

// Handle Payment Intent Succeeded
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      if (order.paymentPlan === 'split') {
        order.firstPaymentStatus = 'paid';
        order.firstPaymentDate = new Date();
      }
      await order.save();

      // Mark lead as converted
      await Lead.findByIdAndUpdate(order.customerId, {
        convertedToCustomer: true,
      });

      console.log(`✅ Order ${order.orderId} marked as paid via webhook`);
    }
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
};

// Handle Payment Intent Failed
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order) {
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`❌ Order ${order.orderId} payment failed via webhook`);
    }
  } catch (error) {
    console.error('Error handling payment_intent.payment_failed:', error);
  }
};

// Handle Charge Refunded
const handleChargeRefunded = async (charge) => {
  try {
    const order = await Order.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (order) {
      order.paymentStatus = 'refunded';
      await order.save();

      console.log(`💰 Order ${order.orderId} refunded via webhook`);
    }
  } catch (error) {
    console.error('Error handling charge.refunded:', error);
  }
};

export default {
  validatePaymentIntent,
  createPaymentIntentHandler,
  confirmPayment,
  handleWebhook,
};