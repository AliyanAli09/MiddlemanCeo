import stripe from '../config/stripe.js';

/**
 * Stripe Service
 * Handles all Stripe payment operations
 * Updated to support auto-charge for split payments
 */

// Create Payment Intent
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntentData = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    };

    // Add customer if provided
    if (metadata.customerId) {
      paymentIntentData.customer = metadata.customerId;
      delete metadata.customerId; // Remove from metadata after using
    }

    // Add setup_future_usage if specified (for saving payment method)
    if (metadata.setupFutureUsage) {
      paymentIntentData.setup_future_usage = metadata.setupFutureUsage;
      delete metadata.setupFutureUsage; // Remove from metadata after using
    }

    // Add description if provided
    if (metadata.description) {
      paymentIntentData.description = metadata.description;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Retrieve Payment Intent
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
};

// Create or Retrieve Customer
export const createOrRetrieveCustomer = async (email, name, phone) => {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      console.log(`✅ Found existing Stripe customer: ${existingCustomers.data[0].id}`);
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        source: 'middlemanceo',
      },
    });

    console.log(`✅ Created new Stripe customer: ${customer.id}`);
    return customer;
  } catch (error) {
    console.error('Error creating/retrieving customer:', error);
    throw error;
  }
};

// Create Subscription for Split Payments
export const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Charge Saved Payment Method (for second payment)
export const chargePaymentMethod = async (customerId, paymentMethodId, amount, currency, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true, // Customer is not present
      confirm: true, // Confirm immediately
      metadata,
    });

    console.log(`✅ Payment method charged successfully: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    console.error('Error charging payment method:', error);
    throw error;
  }
};

// Refund Payment
export const refundPayment = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);
    console.log(`✅ Refund processed: ${refund.id}`);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

// Verify Webhook Signature
export const verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
};

// Get Payment Method Details
export const getPaymentMethod = async (paymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    return paymentMethod;
  } catch (error) {
    console.error('Error retrieving payment method:', error);
    throw error;
  }
};

export default {
  createPaymentIntent,
  retrievePaymentIntent,
  createOrRetrieveCustomer,
  createSubscription,
  chargePaymentMethod,
  refundPayment,
  verifyWebhookSignature,
  getPaymentMethod,
};