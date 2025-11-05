import React from "react";
import Layout from "@/components/layout/Layout";

const TermsPage = () => {
  return (
    <Layout>
      <div className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 mb-4">
              By accessing and using MiddlemanCEO.com, you accept and agree to
              be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on MiddlemanCEO.com for
              personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              3. Payment Terms
            </h2>
            <p className="text-gray-700 mb-4">
              All payments are processed securely through Stripe. By making a
              purchase, you agree to provide current, complete, and accurate
              purchase and account information.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              4. Refund Policy
            </h2>
            <p className="text-gray-700 mb-4">
              Due to the digital nature of our products, all sales are final.
              Please contact support if you have any issues.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              5. Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at{" "}
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

export default TermsPage;
