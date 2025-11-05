import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config(); // make sure .env is loaded before using process.env

/**
 * Stripe Configuration
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default stripe;
