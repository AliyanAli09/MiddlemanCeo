import React, { useState } from "react";
import Layout from "@/components/layout/Layout";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is the Middleman business model?",
      answer:
        "The Middleman model involves connecting service providers with customers. You act as the intermediary, managing bookings and communications while service providers do the actual work.",
    },
    {
      question: "How quickly can I start making money?",
      answer:
        "With the right setup and marketing, you can start getting your first customers within 2-4 weeks. Results vary based on your effort and local market conditions.",
    },
    {
      question: "Do I need any special skills or experience?",
      answer:
        "No special skills required! Our program teaches you everything you need to know, from setting up your business to finding customers and managing operations.",
    },
    {
      question: "What's included in each plan?",
      answer:
        "The Basic plan includes training materials and workbooks. The Pro plan adds website setup and automation. The Elite plan includes everything plus mentorship and licensing rights.",
    },
    {
      question: "Is there a refund policy?",
      answer:
        "Due to the digital nature of our products and immediate access to materials, all sales are final. However, we're committed to your success and provide ongoing support.",
    },
    {
      question: "How does the split payment option work?",
      answer:
        "For Pro and Elite plans, you can split your payment into 2 monthly installments. The first payment is due at checkout, and the second payment is automatically charged 30 days later.",
    },
    {
      question: "Will I get access to the Skool community?",
      answer:
        "Yes! All purchasers receive an invitation to our exclusive Skool community where you can network with other Middleman entrepreneurs and get ongoing support.",
    },
    {
      question: "How long do I have access to the materials?",
      answer:
        "You have lifetime access to all training materials, videos, and resources included in your plan.",
    },
  ];

  return (
    <Layout>
      <div className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Got questions? We've got answers!
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-4">
              We're here to help! Reach out to our support team.
            </p>
            <a
              href="mailto:support@middlemanceo.com"
              className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
