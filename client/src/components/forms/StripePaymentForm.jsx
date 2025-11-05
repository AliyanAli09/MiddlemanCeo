import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { createOrder } from '@/services/orderService';
import { createPaymentIntent, confirmPayment } from '@/services/paymentService';
import toast from 'react-hot-toast';

/**
 * Stripe Payment Form Component
 * Handles credit card input using Stripe Elements
 * Now creates order and payment intent only when user submits
 */
const StripePaymentForm = ({ orderData, leadData, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        '::placeholder': {
          color: '#9CA3AF',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: '24px',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: false,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Step 1: Create order in database
      toast.loading('Creating order...', { id: 'payment-process' });
      
      const orderResponse = await createOrder({
        leadId: orderData.leadId,
        industry: orderData.industry,
        city: orderData.city,
        program: orderData.program,
        programName: orderData.programName,
        paymentPlan: orderData.paymentOption,
        amount: orderData.paymentOptionData.amount,
        totalAmount: orderData.paymentOptionData.totalAmount || orderData.paymentOptionData.amount,
      });

      const createdOrderId = orderResponse.orderId;

      // Step 2: Create payment intent
      toast.loading('Processing payment...', { id: 'payment-process' });
      
      const paymentResponse = await createPaymentIntent(
        createdOrderId,
        orderData.paymentOptionData.amount
      );

      // Step 3: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
            },
          },
        }
      );

      if (error) {
        console.error('Payment error:', error);
        toast.error(error.message || 'Payment failed', { id: 'payment-process' });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 4: Confirm payment on backend (sends emails)
        toast.loading('Confirming payment...', { id: 'payment-process' });
        
        await confirmPayment(paymentIntent.id);

        // Store order ID for congratulations page
        sessionStorage.setItem('orderId', createdOrderId);

        toast.success('Payment successful!', { id: 'payment-process' });

        // Navigate to congratulations page
        setTimeout(() => {
          navigate('/congratulations');
        }, 1000);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(
        error.response?.data?.message || 'An error occurred while processing your payment',
        { id: 'payment-process' }
      );
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Test card: 4242 4242 4242 4242 | Any future date | Any 3 digits
        </p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">Secure Checkout - SSL Encrypted</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={!stripe || isProcessing}
        loading={isProcessing}
      >
        {isProcessing ? 'Processing...' : `PAY $${amount}`}
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by <span className="font-semibold">Stripe</span>
        </p>
      </div>
    </form>
  );
};

export default StripePaymentForm;