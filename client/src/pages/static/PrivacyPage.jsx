import React from "react";
import Layout from "@/components/layout/Layout";

const PrivacyPage = () => {
  return (
    <Layout>
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, including your
              name, email address, phone number, and payment information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Process your orders and payments</li>
              <li>Send you important updates about your purchase</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Information Sharing
            </h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information with service providers who
              assist us in operating our website and conducting our business.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate security measures to protect your
              personal information. Payment information is processed securely
              through Stripe.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Contact Us
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:support@middlemanceo.com"
                className="text-blue-600 hover:underline"
              >
                support@middlemanceo.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;
