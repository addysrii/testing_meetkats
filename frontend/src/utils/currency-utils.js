  // currency-utils.js
// Utility functions for handling currency conversion and formatting

/**
 * Format price in Indian Rupees (INR)
 * @param {number} price - The price to format
 * @returns {string} - Formatted price string with ₹ symbol
 */
export const formatRupees = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Format price display for forms and inputs (without currency symbol)
 * @param {number} price - The price
 * @returns {string} - Price as string with two decimal places
 */
export const formatPriceForInput = (price) => {
  return Number(price).toFixed(2);
};

/**
 * Parse price input string to number
 * @param {string} priceString - The price string from input
 * @returns {number} - Price as number
 */
export const parsePriceInput = (priceString) => {
  return parseFloat(priceString) || 0;
};

/**
 * Constants for pricing
 */
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee'
};
