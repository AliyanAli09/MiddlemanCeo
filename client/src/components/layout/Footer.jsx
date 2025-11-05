import React from "react";

/**
 * Footer Component
 * Site footer with copyright and links
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            &copy; {currentYear} MiddlemanCEO. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="mailto:support@middlemanceo.com"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
