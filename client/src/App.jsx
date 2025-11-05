import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import BlueprintPage from './pages/BlueprintPage';
import CheckoutPage from './pages/CheckoutPage';
import CongratulationsPage from './pages/CongratulationsPage';
import TermsPage from './pages/static/TermsPage';
import PrivacyPage from './pages/static/PrivacyPage';
import FAQPage from './pages/static/FAQPage';
import ContactPage from './pages/static/ContactPage';
import TutorialPage from './pages/TutorialPage';

function App() {
  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blueprint" element={<BlueprintPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/congratulations" element={<CongratulationsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/tutorial" element={<TutorialPage />} />
      </Routes>
    </Router>
  );
}

export default App;