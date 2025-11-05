import React from 'react';
import { cn } from '@/utils/cn';

/**
 * Logo Component
 * Displays the MiddlemanCEO logo
 */
const Logo = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={cn('font-bold text-blue-600', sizes[size], className)}>
      <span className="inline-flex items-center gap-2">
        <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold">M</span>
        <span>MiddlemanCEO</span>
      </span>
    </div>
  );
};

export default Logo;