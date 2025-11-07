import stripe from '../config/stripe.js';
import Order from '../models/Order.js';
import Lead from '../models/Lead.js';
import { sendSecondPaymentConfirmation, sendSecondPaymentFailed } from './emailService.js';

/**
 * Schedule Automatic Second Payment
 * This schedules the second payment to be charged automatically after 30 days
 */
export const scheduleAutomaticSecondPayment = async (order, lead) => {
  try {
    console.log(`📅 Scheduling automatic second payment for order ${order.orderId}`);

    if (!order.stripeCustomerId) {
      throw new Error('No Stripe customer ID found');
    }

    if (!order.splitPayment.savedPaymentMethodId) {
      throw new Error('No payment method saved for future charge');
    }

    // In a real production app, you would:
    // 1. Store this in a job queue (Bull, Agenda, etc.)
    // 2. Use a cron job to check daily for payments due
    // 3. Process payments that are due

    // For now, we'll mark it as scheduled
    order.splitPayment.secondPaymentScheduled = true;
    order.splitPayment.secondPaymentScheduledDate = new Date();
    await order.save();

    console.log(`✅ Second payment scheduled for ${order.splitPayment.secondPaymentDueDate}`);
    console.log(`💳 Will charge payment method: ${order.splitPayment.savedPaymentMethodId}`);

    return { success: true };
  } catch (error) {
    console.error('❌ Error scheduling automatic payment:', error);
    throw error;
  }
};

/**
 * Process Scheduled Payments
 * Run this function daily via cron job
 */
export const processScheduledPayments = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find orders with second payment due today
    const dueOrders = await Order.find({
      paymentPlan: 'split',
      'splitPayment.firstPaymentStatus': 'paid',
      'splitPayment.secondPaymentStatus': 'pending',
      'splitPayment.secondPaymentDueDate': {
        $lte: today,
      },
    });

    console.log(`📊 Found ${dueOrders.length} orders with payment due`);

    for (const order of dueOrders) {
      try {
        await chargeSecondPayment(order);
      } catch (error) {
        console.error(`❌ Failed to charge order ${order.orderId}:`, error.message);
        // Continue with next order
      }
    }

    return { success: true, processed: dueOrders.length };
  } catch (error) {
    console.error('❌ Error processing scheduled payments:', error);
    throw error;
  }
};

/**
 * Charge Second Payment
 */
export const chargeSecondPayment = async (order) => {
  try {
    console.log(`💳 Charging second payment for order ${order.orderId}`);

    if (!order.stripeCustomerId) {
      throw new Error('No customer ID');
    }

    if (!order.splitPayment.savedPaymentMethodId) {
      throw new Error('No payment method saved');
    }

    // Create payment intent for second payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.splitPayment.secondPaymentAmount * 100),
      currency: 'usd',
      customer: order.stripeCustomerId,
      payment_method: order.splitPayment.savedPaymentMethodId,
      off_session: true, // Charge without customer present
      confirm: true, // Confirm immediately
      metadata: {
        orderId: order.orderId,
        paymentNumber: '2',
      },
      description: `${order.programName} - Second Payment`,
    });

    console.log(`✅ Second payment charged: ${paymentIntent.id}`);

    // Update order
    order.splitPayment.secondPaymentIntentId = paymentIntent.id;
    order.splitPayment.secondPaymentStatus = 'paid';
    order.splitPayment.secondPaymentDate = new Date();
    order.paymentStatus = 'paid';
    await order.save();

    // Get lead info
    const lead = await Lead.findById(order.leadId);

    // Send confirmation email
    if (lead) {
      await sendSecondPaymentConfirmation({
        orderId: order.orderId,
        programName: order.programName,
        amount: order.splitPayment.secondPaymentAmount,
      }, {
        name: lead.name,
        email: lead.email,
      });
    }

    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error) {
    console.error(`❌ Error charging second payment:`, error);

    // Update order with failure
    order.splitPayment.secondPaymentStatus = 'failed';
    order.splitPayment.secondPaymentError = error.message;
    await order.save();

    // Get lead info and send failure notification
    const lead = await Lead.findById(order.leadId);
    if (lead) {
      await sendSecondPaymentFailed({
        orderId: order.orderId,
        programName: order.programName,
        amount: order.splitPayment.secondPaymentAmount,
        errorMessage: error.message,
      }, {
        name: lead.name,
        email: lead.email,
      });
    }

    throw error;
  }
};

/**
 * Retry Failed Payment
 */
export const retrySecondPayment = async (orderId) => {
  try {
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.splitPayment.secondPaymentStatus === 'paid') {
      throw new Error('Second payment already completed');
    }

    return await chargeSecondPayment(order);
  } catch (error) {
    console.error('❌ Error retrying payment:', error);
    throw error;
  }
};

export default {
  scheduleAutomaticSecondPayment,
  processScheduledPayments,
  chargeSecondPayment,
  retrySecondPayment,
};