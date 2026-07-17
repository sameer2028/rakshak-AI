import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx.
 * Handles conditional classes and deduplication.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas (Indian numbering).
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('en-IN');
}

/**
 * Format currency in INR.
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Get color class for risk score.
 */
export function getRiskColor(score) {
  if (score >= 80) return 'text-red-500';
  if (score >= 60) return 'text-orange-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-emerald-500';
}

/**
 * Get background color class for risk level.
 */
export function getRiskBgColor(level) {
  const colors = {
    critical: 'bg-red-500/15 text-red-400 border-red-500/30',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };
  return colors[level] || colors.low;
}

/**
 * Get verdict badge classes.
 */
export function getVerdictClasses(verdict) {
  const classes = {
    SCAM: 'badge-scam',
    SAFE: 'badge-safe',
    SUSPICIOUS: 'badge-suspicious',
    GENUINE: 'badge-safe',
    COUNTERFEIT: 'badge-scam',
  };
  return classes[verdict] || 'badge-suspicious';
}

/**
 * Truncate text to a max length.
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
