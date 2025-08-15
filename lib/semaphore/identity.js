import { Identity } from '@semaphore-protocol/identity';
import { generateSecureSeed } from '../security/crypto.js';

/**
 * Create a secure Semaphore identity
 * @param {string} userEmail - User's email for additional entropy
 * @returns {Identity} - Semaphore identity with secure seed
 */
export function createIdentity(userEmail) {
  // Generate cryptographically secure seed instead of using email directly
  const secureSeed = generateSecureSeed(userEmail);
  return new Identity(secureSeed);
}

/**
 * Create identity from existing secure seed (for proof generation)
 * @param {string} secureSeed - Previously generated secure seed
 * @returns {Identity} - Semaphore identity
 */
export function createIdentityFromSeed(secureSeed) {
  return new Identity(secureSeed);
} 