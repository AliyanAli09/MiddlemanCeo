import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Input Component
 * Reusable input field with error handling
 */
const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  helpText,
  required = false,
  disabled = false,
  fullWidth = true,
  className,
  ...props
}, ref) => {
  return (
    <div className={cn('mb-4', fullWidth && 'w-full')}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-400',
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
          disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
          className
        )}
        {...props}
      />
      
      {helpText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
      
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;