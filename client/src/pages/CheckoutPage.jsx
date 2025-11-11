import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Layout from "@/components/layout/Layout";
import StripePaymentForm from "@/components/forms/StripePaymentForm";
import Spinner from "@/components/common/Spinner";
import { useNavigate } from "react-router-dom";
import { INDUSTRIES, CITIES, PROGRAMS } from "@/constants";
import toast from "react-hot-toast";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Checkout Page (Page 3)
 * Payment processing page with order summary
 * Fixed: Only creates order and payment intent when user actually pays
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [leadData, setLeadData] = useState(null);
  const [leadId, setLeadId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load data from sessionStorage (but don't create order yet)
  useEffect(() => {
    try {
      const storedOrderData = sessionStorage.getItem("orderData");
      const storedLeadData = sessionStorage.getItem("leadData");
      const storedLeadId = sessionStorage.getItem("leadId");

      if (!storedOrderData || !storedLeadData || !storedLeadId) {
        toast.error("Missing order information");
        navigate("/");
        return;
      }

      const parsedOrderData = JSON.parse(storedOrderData);
      const parsedLeadData = JSON.parse(storedLeadData);

      setOrderData(parsedOrderData);
      setLeadData(parsedLeadData);
      setLeadId(storedLeadId);
      setIsLoading(false);
    } catch (error) {
      console.error("Checkout initialization error:", error);
      toast.error("Failed to initialize checkout");
      navigate("/");
    }
  }, [navigate]);

  if (isLoading || !orderData || !leadData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Get full details
  const industryLabel =
    INDUSTRIES.find((i) => i.value === orderData.industry)?.label || "";
  // const cityLabel = CITIES.find((c) => c.value === orderData.city)?.label || "";
  const getCityLabel = () => {
    if (orderData.city === "Other") {
      return "Other";
    }
    return CITIES.find((c) => c.value === orderData.city)?.label || orderData.city;
  };
  const cityLabel = getCityLabel();
  const programData = PROGRAMS.find((p) => p.id === orderData.program);

  const appearance = {
    theme: "stripe",
  };

  return (
    <Layout>
      <div className="py-8 md:py-12 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600">
              You're one step away from launching your business!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Order Summary - Left Side */}
            <div className="md:col-span-2">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">
                      {leadData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900">
                      {leadData.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900">
                      {leadData.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Business Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Industry:</span>
                    <span className="font-semibold text-gray-900">
                      {industryLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-semibold text-gray-900">
                      {cityLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Split Payment Authorization Notice */}
              {orderData.paymentOption === "split" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start">
                    <svg
                      className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">
                        📅 Auto-Payment Scheduled
                      </h4>
                      <p className="text-sm text-blue-800 mb-2">
                        By completing this purchase, you authorize us to:
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1 ml-5 list-disc">
                        <li>
                          Charge{" "}
                          <strong>${orderData.paymentOptionData.amount}</strong>{" "}
                          today
                        </li>
                        <li>Save your payment method securely with Stripe</li>
                        <li>
                          Automatically charge{" "}
                          <strong>${orderData.paymentOptionData.amount}</strong>{" "}
                          in 30 days
                        </li>
                      </ul>
                      <p className="text-xs text-blue-700 mt-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Your payment information is securely encrypted and
                        stored by Stripe
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Form - Updated Component */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Payment Information
                </h2>

                {/* Pass all necessary data to payment form */}
                <Elements stripe={stripePromise} options={{ appearance }}>
                  <StripePaymentForm
                    orderData={{
                      ...orderData,
                      leadId: leadId,
                    }}
                    leadData={leadData}
                    amount={orderData.paymentOptionData.amount}
                  />
                </Elements>
              </div>
            </div>

            {/* Order Summary - Right Side */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {programData.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {programData.description}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Payment Type:</span>
                      <span className="text-gray-900 font-medium">
                        {orderData.paymentOptionData.label}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="text-gray-900 font-medium">
                        {orderData.paymentOptionData.display}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        Total Due Today:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${orderData.paymentOptionData.amount}
                      </span>
                    </div>
                    {orderData.paymentOption === "split" && (
                      <p className="text-xs text-gray-500 mt-2">
                        Second payment of ${orderData.paymentOptionData.amount}{" "}
                        due in 30 days
                      </p>
                    )}
                  </div>
                </div>

                {/* Features Included */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    What's Included:
                  </h4>
                  <ul className="space-y-2">
                    {programData.features.map((feature, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-700 flex items-start"
                      >
                        <svg
                          className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
