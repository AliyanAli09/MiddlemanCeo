import apiClient from './api';

/**
 * Lead Service
 * Handles all API calls related to lead capture
 */

// Submit lead information
export const submitLead = async (leadData) => {
  try {
    const response = await apiClient.post('/leads', leadData);
    return response;
  } catch (error) {
    throw error;
  }
};

export default {
  submitLead,
};