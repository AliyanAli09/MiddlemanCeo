import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Button from "@/components/common/Button";
import { PROGRAMS } from "@/constants";

/**
 * Congratulations Page (Page 4)
 * Order confirmation and next steps
 */
const CongratulationsPage = () => {
  const [orderId, setOrderId] = useState("");
  const [leadData, setLeadData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Load data from sessionStorage
    const storedOrderId = sessionStorage.getItem("orderId");
    const storedLeadData = sessionStorage.getItem("leadData");
    const storedOrderData = sessionStorage.getItem("orderData");

    if (storedOrderId) setOrderId(storedOrderId);
    if (storedLeadData) setLeadData(JSON.parse(storedLeadData));
    if (storedOrderData) setOrderData(JSON.parse(storedOrderData));

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const programData = orderData
    ? PROGRAMS.find((p) => p.id === orderData.program)
    : null;

  const handleGoToTutorial = () => {
    window.location.href = "/tutorial"; // replace with actual URL
  };

  return (
    <Layout>
      <div className="py-4 md:py-12 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen relative overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: [
                      "#3B82F6",
                      "#10B981",
                      "#F59E0B",
                      "#EF4444",
                      "#8B5CF6",
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Success Icon and Headings */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
              <svg
                className="w-12 h-12 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              🎉 Congratulations!
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-600 mb-6">
              You're Officially a Middleman
            </h2>
          </div>

          {/* Order Confirmation Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 mb-8">
            {/* Order Details */}
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Confirmation
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    #{orderId}
                  </span>
                </div>
                {programData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Program:</span>
                      <span className="font-semibold text-gray-900">
                        {programData.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-green-600">
                        ${orderData?.paymentOptionData?.amount}
                      </span>
                    </div>
                    {orderData?.paymentOptionData?.type === "split" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Payment:</span>
                        <span className="font-semibold text-gray-900">
                          ${orderData.paymentOptionData.amount} (Due in 30 days)
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Next Steps */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What Happens Next?
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: `✓ Confirmation email sent to ${leadData?.email}`,
                    desc: "Check your inbox for your order details and receipt",
                    icon: (
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    ),
                  },
                  {
                    title: "✓ Access to 2-hour tutorial video",
                    desc: "Learn the complete Middleman business model step by step",
                  },
                  {
                    title: "✓ Download your Middleman Blueprint guide",
                    desc: "Complete workbook with templates and resources",
                  },
                  {
                    title: "✓ Invitation to Skool Community (arriving soon)",
                    desc: "Connect with other Middleman entrepreneurs",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        {step.icon || (
                          <path
                            fillRule="evenodd"
                            d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 9h4v2H8V9z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {step.title}
                      </h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-4">
                Watch the tutorial to learn how to launch your business
              </p>
              <Button variant="primary" size="lg" onClick={handleGoToTutorial}>
                GO TO TUTORIAL
              </Button>
            </div>
          </div>

          {/* Support Section */}
          {/* Support Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to assist you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="mailto:support@middlemanceo.com"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                support@middlemanceo.com
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="/faq"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Visit FAQ
              </a>
            </div>
          </div>
          {/* Social Proof */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Join 1,000+ entrepreneurs building successful Middleman businesses
            </p>
          </div>
        </div>
      </div>

      {/* Confetti animation styles */}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </Layout>
  );
};

export default CongratulationsPage;
