import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge
 * Prevents style conflicts and enables conditional classes
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}