import React from 'react';
import Layout from '@/components/layout/Layout';
import LeadCaptureForm from '@/components/forms/LeadCaptureForm';

/**
 * Landing Page (Page 1)
 * Lead capture page - collects name, email, and phone before showing Blueprint
 * Updated with blue background to match design
 */
const LandingPage = () => {
  return (
    <Layout>
      <div className="py-8 md:py-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 min-h-[calc(100vh-160px)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Get the Free{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-green-300">
                  Middleman Blueprint
                </span>
              </h1>
              
              <p className="text-base md:text-lg text-blue-50 mb-6 max-w-xl mx-auto leading-relaxed">
                Learn how to start your own automated business. 
                Just enter your info to instantly watch the Blueprint video.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">No credit card</span>
                </div>
                
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Instant access</span>
                </div>
                
                <div className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Join 1,000+</span>
                </div>
              </div>
            </div>

            {/* Form Card with Rounded Corners */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
              <LeadCaptureForm />
            </div>

            {/* Social Proof */}
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-100">
                Trusted by entrepreneurs in 50+ cities across America
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;