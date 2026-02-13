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
  sendSecondPaymentConfirmation,
  sendSecondPaymentFailed,
} from '../services/emailService.js';
import { body, validationResult } from 'express-validator';

/**
 * Payment Controller
 * Handles Stripe payment processing with auto-charge for split payments
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

    // Determine if we should save payment method for future use (split payments)
    const setupFutureUsage = order.paymentPlan === 'split' ? 'off_session' : null;

    // Create payment intent with metadata
    const paymentIntent = await createPaymentIntent(amount, currency, {
      orderId: order.orderId,
      customerName: lead.name,
      customerEmail: lead.email,
      program: order.program,
      paymentNumber: '1', // First payment
      customerId: customer.id,
      setupFutureUsage: setupFutureUsage,
    });

    // Update order with Stripe details
    order.stripePaymentIntentId = paymentIntent.id;
    order.stripeCustomerId = customer.id;
    await order.save();

    console.log(`✅ Payment intent created for order ${orderId}`);
    if (setupFutureUsage) {
      console.log(`💳 Payment method will be saved for future charges (split payment)`);
    }

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

    // Update order status based on payment plan
    if (order.paymentPlan === 'one-time') {
      order.paymentStatus = 'paid';
      order.fulfillmentStatus = 'in-progress';
    } else if (order.paymentPlan === 'split') {
      order.paymentStatus = 'partially_paid';
      order.firstPaymentStatus = 'paid';
      order.firstPaymentDate = new Date();
      order.firstPaymentAmount = order.amount;
      order.secondPaymentAmount = order.amount;
      
      // Set second payment due date (30 days from now)
      const secondPaymentDate = new Date();
      secondPaymentDate.setDate(secondPaymentDate.getDate() + 30);
      order.secondPaymentDueDate = secondPaymentDate;
      order.secondPaymentStatus = 'pending';
      
      // Save payment method for auto-charge
      if (paymentIntent.payment_method) {
        order.savedPaymentMethodId = paymentIntent.payment_method;
        order.secondPaymentScheduled = true;
        order.secondPaymentScheduledDate = new Date();
        console.log(`💳 Payment method saved for second charge: ${paymentIntent.payment_method}`);
        console.log(`📅 Second payment scheduled for: ${secondPaymentDate.toLocaleDateString()}`);
      }
    }
    
    await order.save();

    // Mark lead as converted
    await Lead.findByIdAndUpdate(order.customerId, {
      convertedToCustomer: true,
    });

    // Get lead data for emails
    const lead = await Lead.findById(order.customerId);

    // Send emails (only if not already sent)
    if (!order.emailsSent) {
      try {
        await sendCustomerConfirmation(
          {
            orderId: order.orderId,
            programName: order.programName,
            amount: order.amount,
            paymentPlan: order.paymentPlan,
            secondPaymentDueDate: order.secondPaymentDueDate,
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
            paymentPlan: order.paymentPlan,
          },
          {
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
          }
        );

        order.emailsSent = true;
        await order.save();
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the request if emails fail
      }
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
      // Stripe Payment Links events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      // Installment payment events
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      // Legacy Payment Intent events (for backwards compatibility)
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

// Handle Checkout Session Completed (Stripe Payment Links)
const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log(`✅ Checkout session completed: ${session.id}`);

    // Extract customer details from session
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = session.customer_details?.name;

    // Find lead by email
    const lead = await Lead.findOne({ email: customerEmail });
    if (!lead) {
      console.error(`❌ Lead not found for email: ${customerEmail}`);
      return;
    }

    // Extract metadata from session (if available)
    const metadata = session.metadata || {};

    // Determine payment plan type
    const isInstallment = session.payment_intent === null && session.subscription !== null;
    const paymentPlan = isInstallment ? 'split' : 'one-time';

    // Calculate amount (Stripe uses cents)
    const amountPaid = session.amount_total / 100;

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order record
    const order = await Order.create({
      orderId: orderId,
      customerId: lead._id,
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      industry: metadata.industry || lead.industry || 'Not specified',
      city: metadata.city || lead.city || 'Not specified',
      program: metadata.program || 'pro',
      programName: metadata.programName || 'PRO — DIY',
      paymentPlan: paymentPlan,
      amount: amountPaid,
      currency: session.currency || 'usd',
      stripePaymentIntentId: session.payment_intent || session.id,
      stripeCustomerId: session.customer,
      paymentStatus: paymentPlan === 'one-time' ? 'paid' : 'partially_paid',
      fulfillmentStatus: paymentPlan === 'one-time' ? 'in-progress' : 'pending',
      firstPaymentStatus: 'paid',
      firstPaymentDate: new Date(),
      firstPaymentAmount: amountPaid,
      secondPaymentAmount: paymentPlan === 'split' ? amountPaid : null,
      secondPaymentStatus: paymentPlan === 'split' ? 'pending' : null,
      tutorialAccessGranted: true,
    });

    // If installment plan, store subscription ID for tracking second payment
    if (isInstallment && session.subscription) {
      order.stripeSubscriptionId = session.subscription;

      // Calculate second payment due date (30 days)
      const secondPaymentDate = new Date();
      secondPaymentDate.setDate(secondPaymentDate.getDate() + 30);
      order.secondPaymentDueDate = secondPaymentDate;
      order.secondPaymentScheduled = true;
      order.secondPaymentScheduledDate = new Date();

      await order.save();
      console.log(`📅 Second payment scheduled for: ${secondPaymentDate.toLocaleDateString()}`);
    }

    // Mark lead as converted
    await Lead.findByIdAndUpdate(lead._id, {
      convertedToCustomer: true,
    });

    // Send confirmation emails
    try {
      await sendCustomerConfirmation(
        {
          orderId: order.orderId,
          programName: order.programName,
          amount: order.amount,
          paymentPlan: order.paymentPlan,
          secondPaymentDueDate: order.secondPaymentDueDate,
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
          paymentPlan: order.paymentPlan,
        },
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
        }
      );

      order.emailsSent = true;
      await order.save();
    } catch (emailError) {
      console.error('❌ Error sending confirmation emails:', emailError);
    }

    console.log(`✅ Order created successfully: ${orderId}`);
  } catch (error) {
    console.error('❌ Error handling checkout.session.completed:', error);
  }
};

// Handle Invoice Paid (Installment Payments)
const handleInvoicePaid = async (invoice) => {
  try {
    console.log(`💰 Invoice paid: ${invoice.id}`);

    // Find order by subscription ID
    const order = await Order.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (!order) {
      console.log(`Order not found for subscription: ${invoice.subscription}`);
      return;
    }

    // Check if this is the second payment (first invoice is initial payment)
    if (order.secondPaymentStatus === 'pending' && order.firstPaymentStatus === 'paid') {
      order.paymentStatus = 'paid';
      order.secondPaymentStatus = 'paid';
      order.secondPaymentDate = new Date();
      order.fulfillmentStatus = 'in-progress';
      await order.save();

      console.log(`✅ Second payment received for order ${order.orderId}`);

      // Send second payment confirmation
      const lead = await Lead.findById(order.customerId);
      if (lead) {
        try {
          await sendSecondPaymentConfirmation(
            {
              orderId: order.orderId,
              programName: order.programName,
              amount: order.secondPaymentAmount,
            },
            {
              name: lead.name,
              email: lead.email,
            }
          );
        } catch (emailError) {
          console.error('❌ Error sending second payment confirmation:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling invoice.paid:', error);
  }
};

// Handle Invoice Payment Failed (Installment Payment Failed)
const handleInvoicePaymentFailed = async (invoice) => {
  try {
    console.log(`❌ Invoice payment failed: ${invoice.id}`);

    // Find order by subscription ID
    const order = await Order.findOne({
      stripeSubscriptionId: invoice.subscription,
    });

    if (!order) {
      console.log(`Order not found for subscription: ${invoice.subscription}`);
      return;
    }

    // Update second payment status
    if (order.secondPaymentStatus === 'pending') {
      order.secondPaymentStatus = 'failed';
      order.secondPaymentError = invoice.last_payment_error?.message || 'Payment failed';
      order.secondPaymentRetryCount += 1;
      await order.save();

      console.log(`❌ Second payment failed for order ${order.orderId}`);

      // Send failure notification
      const lead = await Lead.findById(order.customerId);
      if (lead) {
        try {
          await sendSecondPaymentFailed(
            {
              orderId: order.orderId,
              programName: order.programName,
              amount: order.secondPaymentAmount,
              errorMessage: order.secondPaymentError,
            },
            {
              name: lead.name,
              email: lead.email,
            }
          );
        } catch (emailError) {
          console.error('❌ Error sending failure notification:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error handling invoice.payment_failed:', error);
  }
};

// Handle Payment Intent Succeeded
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    // Check if this is a first payment
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order && order.paymentStatus !== 'paid') {
      // This is the first payment
      if (order.paymentPlan === 'split') {
        order.paymentStatus = 'partially_paid';
        order.firstPaymentStatus = 'paid';
        order.firstPaymentDate = new Date();
        order.firstPaymentAmount = order.amount;
        order.secondPaymentAmount = order.amount;
        
        // Set second payment due date
        const secondPaymentDate = new Date();
        secondPaymentDate.setDate(secondPaymentDate.getDate() + 30);
        order.secondPaymentDueDate = secondPaymentDate;
        
        // Save payment method for auto-charge
        if (paymentIntent.payment_method) {
          order.savedPaymentMethodId = paymentIntent.payment_method;
          order.secondPaymentScheduled = true;
          order.secondPaymentScheduledDate = new Date();
          console.log(`💳 Payment method saved: ${paymentIntent.payment_method}`);
        }
        
        console.log(`✅ First payment received for order ${order.orderId}`);
        console.log(`📅 Second payment scheduled for: ${secondPaymentDate.toLocaleDateString()}`);
      } else {
        // One-time payment
        order.paymentStatus = 'paid';
        order.fulfillmentStatus = 'in-progress';
      }
      
      await order.save();

      // Mark lead as converted
      await Lead.findByIdAndUpdate(order.customerId, {
        convertedToCustomer: true,
      });

      // Send emails if not already sent
      if (!order.emailsSent) {
        const lead = await Lead.findById(order.customerId);
        if (lead) {
          try {
            await sendCustomerConfirmation(
              {
                orderId: order.orderId,
                programName: order.programName,
                amount: order.amount,
                paymentPlan: order.paymentPlan,
                secondPaymentDueDate: order.secondPaymentDueDate,
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
                paymentPlan: order.paymentPlan,
              },
              {
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
              }
            );

            order.emailsSent = true;
            await order.save();
          } catch (emailError) {
            console.error('Error sending confirmation emails:', emailError);
          }
        }
      }
    }

    // Check if this is a second payment
    const secondPaymentOrder = await Order.findOne({
      secondPaymentIntentId: paymentIntent.id,
    });

    if (secondPaymentOrder) {
      secondPaymentOrder.paymentStatus = 'paid';
      secondPaymentOrder.secondPaymentStatus = 'paid';
      secondPaymentOrder.secondPaymentDate = new Date();
      secondPaymentOrder.fulfillmentStatus = 'in-progress';
      await secondPaymentOrder.save();

      console.log(`✅ Second payment received for order ${secondPaymentOrder.orderId}`);

      // Send second payment confirmation
      const lead = await Lead.findById(secondPaymentOrder.customerId);
      if (lead) {
        try {
          await sendSecondPaymentConfirmation(
            {
              orderId: secondPaymentOrder.orderId,
              programName: secondPaymentOrder.programName,
              amount: secondPaymentOrder.secondPaymentAmount,
            },
            {
              name: lead.name,
              email: lead.email,
            }
          );
        } catch (emailError) {
          console.error('Error sending second payment confirmation:', emailError);
        }
      }
    }
  } catch (error) {
    console.error('Error handling payment_intent.succeeded:', error);
  }
};

// Handle Payment Intent Failed
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    // Check for first payment failure
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (order) {
      order.paymentStatus = 'failed';
      order.firstPaymentStatus = 'failed';
      await order.save();

      console.log(`❌ Order ${order.orderId} payment failed via webhook`);
    }

    // Check for second payment failure
    const secondPaymentOrder = await Order.findOne({
      secondPaymentIntentId: paymentIntent.id,
    });

    if (secondPaymentOrder) {
      secondPaymentOrder.secondPaymentStatus = 'failed';
      secondPaymentOrder.secondPaymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
      secondPaymentOrder.secondPaymentRetryCount += 1;
      await secondPaymentOrder.save();

      console.log(`❌ Second payment failed for order ${secondPaymentOrder.orderId}`);

      // Send failure notification
      const lead = await Lead.findById(secondPaymentOrder.customerId);
      if (lead) {
        try {
          await sendSecondPaymentFailed(
            {
              orderId: secondPaymentOrder.orderId,
              programName: secondPaymentOrder.programName,
              amount: secondPaymentOrder.secondPaymentAmount,
              errorMessage: secondPaymentOrder.secondPaymentError,
            },
            {
              name: lead.name,
              email: lead.email,
            }
          );
        } catch (emailError) {
          console.error('Error sending failure notification:', emailError);
        }
      }
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