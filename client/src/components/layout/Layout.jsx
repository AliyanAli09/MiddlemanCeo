import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout Component
 * Main layout wrapper with header and footer
 */
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;