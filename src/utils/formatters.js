// src/utils/formatters.js

/**
 * Format currency with appropriate symbol and thousands separators
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  const num = Number(amount);
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  }

  // Default to INR format (Lakhs/Crores friendly)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null) return '0%';
  return `${value}%`;
};

/**
 * Format ISO date string or timestamp
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
};

/**
 * Get color style for policy status
 */
export const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'verified':
    case 'covered':
    case 'completed':
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: status,
      };
    case 'pending':
    case 'pending analysis':
    case 'processing':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: status,
      };
    case 'excluded':
    case 'not covered':
    case 'expired':
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: status,
      };
    case 'partial':
    case 'sub-limit':
    case 'conditional':
      return {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-600',
        label: status,
      };
    default:
      return {
        bg: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
        dot: 'bg-charcoal-400',
        label: status || 'Unknown',
      };
  }
};
