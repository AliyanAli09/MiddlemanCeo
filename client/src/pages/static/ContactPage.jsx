import React from "react";
import Layout from "@/components/layout/Layout";

const ContactPage = () => {
  return (
    <Layout>
      <div className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 mb-12 text-center">
            Have questions? We'd love to hear from you!
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Email Support
                </h3>
              </div>
              <p className="text-gray-700 mb-2">
                For general inquiries and support:
              </p>
              <a
                href="mailto:support@middlemanceo.com"
                className="text-blue-600 hover:underline font-medium"
              >
                support@middlemanceo.com
              </a>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg
                  className="w-6 h-6 text-green-600 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Community
                </h3>
              </div>
              <p className="text-gray-700 mb-2">Join our Skool community:</p>
              <a
                href={
                  import.meta.env.VITE_SKOOL_COMMUNITY_URL ||
                  "https://www.skool.com"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline font-medium"
              >
                Join Community →
              </a>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Business Hours
            </h2>
            <p className="text-gray-700 mb-2">
              Monday - Friday: 9:00 AM - 6:00 PM EST
            </p>
            <p className="text-gray-700 mb-4">Saturday - Sunday: Closed</p>
            <p className="text-sm text-gray-600">
              We typically respond to all inquiries within 24-48 hours during
              business days.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
