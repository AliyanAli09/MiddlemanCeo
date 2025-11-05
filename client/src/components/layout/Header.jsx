import React from 'react';
import Logo from '../common/Logo';

/**
 * Header Component
 * Main navigation header with logo
 */
const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Logo size="md" />
          
          {/* Add navigation links here if needed in the future */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Navigation items can go here */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;