/**
 * Utility functions for local order tracking and referencing.
 * Generates unique order reference IDs without database persistence.
 */

/**
 * Generates a human-friendly unique order reference code.
 * Example format: #IND-8492
 */
export function generateOrderReference(): string {
  const timestampSuffix = Date.now().toString().slice(-2);
  const randomSuffix = Math.floor(10 + Math.random() * 90).toString();
  return `#IND-${timestampSuffix}${randomSuffix}`;
}
