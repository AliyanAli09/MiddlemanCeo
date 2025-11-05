/**
 * Mock API Service
 * Simulates API calls for testing without backend
 */

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock lead submission
export const mockSubmitLead = async (leadData) => {
  await delay(1000); // Simulate network delay
  
  // Simulate successful response
  return {
    success: true,
    leadId: 'LEAD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    message: 'Lead captured successfully',
  };
};

export default {
  mockSubmitLead,
};