import express from 'express';
import {
  validatePaymentIntent,
  createPaymentIntentHandler,
  confirmPayment,
  handleWebhook,
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * Payment Routes
 * @route /api/payments
 */

// POST /api/payments/create-intent - Create payment intent
router.post('/create-intent', validatePaymentIntent, createPaymentIntentHandler);

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', confirmPayment);

// POST /api/payments/webhook - Stripe webhook handler
// Note: This route needs raw body, handled in server.js
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

export default router;