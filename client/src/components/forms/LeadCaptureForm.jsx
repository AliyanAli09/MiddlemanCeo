import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../common/Input';
import Button from '../common/Button';
import { submitLead } from '@/services/leadService'; // Real API
// import { mockSubmitLead } from '@/services/mockApi'; // Mock API (removed)
import { formatPhone } from '@/utils/validation';

// Validation schema using Zod
const leadSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .regex(/^[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10, 'Phone number must be 10 digits'),
});

/**
 * LeadCaptureForm Component
 * Captures user information before granting access to Blueprint
 */
const LeadCaptureForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Format phone number for display
      const formattedData = {
        ...data,
        phone: formatPhone(data.phone),
      };

      // Submit lead to API (using real API now)
      const response = await submitLead(formattedData);

      // Store lead ID in sessionStorage for later use
      if (response.leadId) {
        sessionStorage.setItem('leadId', response.leadId);
        sessionStorage.setItem('leadData', JSON.stringify(formattedData));
      }

      // Show success message
      toast.success('Great! Let\'s get you started.');

      // Navigate to Blueprint page
      setTimeout(() => {
        navigate('/blueprint');
      }, 500);
    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error(
        error.response?.data?.message || 
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        placeholder="John Doe"
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        required
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Phone Number"
        type="tel"
        placeholder="(555) 123-4567"
        required
        error={errors.phone?.message}
        {...register('phone')}
        helpText="We'll use this to send you important updates"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        GET THE FREE BLUEPRINT
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By submitting, you agree to our{' '}
        <a href="/terms" className="text-blue-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-blue-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
};

export default LeadCaptureForm;