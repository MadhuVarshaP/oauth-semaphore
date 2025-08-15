import { Identity } from '@semaphore-protocol/identity';
import { generateSecureSeed } from '../security/crypto.js';

/**
 * Create a secure Semaphore identity
 * @param {string} userEmail - User's email for additional entropy
 * @returns {Identity} - Semaphore identity with secure seed
 */
export function createIdentity(userEmail) {
  try {
    if (!userEmail || typeof userEmail !== 'string') {
      throw new Error('User email must be a valid string');
    }
    
    // Generate cryptographically secure seed instead of using email directly
    const secureSeed = generateSecureSeed(userEmail);
    
    if (!secureSeed || typeof secureSeed !== 'string') {
      throw new Error('Failed to generate secure seed');
    }
    
    console.log('Creating Semaphore identity with secure seed');
    const identity = new Identity(secureSeed);
    
    if (!identity || !identity.trapdoor || !identity.nullifier || !identity.commitment) {
      throw new Error('Failed to create valid Semaphore identity');
    }
    
    console.log('Semaphore identity created successfully');
    return identity;
  } catch (error) {
    console.error('Error creating Semaphore identity:', error);
    throw new Error(`Failed to create Semaphore identity: ${error.message}`);
  }
}

/**
 * Create identity from existing secure seed (for proof generation)
 * @param {string} secureSeed - Previously generated secure seed
 * @returns {Identity} - Semaphore identity
 */
export function createIdentityFromSeed(secureSeed) {
  return new Identity(secureSeed);
} 