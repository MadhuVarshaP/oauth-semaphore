import { Identity } from '@semaphore-protocol/identity';
import crypto from 'crypto';

/**
 * Create a deterministic Semaphore identity for the same email
 * @param {string} userEmail - User's email for consistent identity generation
 * @returns {Identity} - Semaphore identity with deterministic seed
 */
export function createIdentity(userEmail) {
  try {
    if (!userEmail || typeof userEmail !== 'string') {
      throw new Error('User email must be a valid string');
    }
    
    // Generate deterministic seed from email (same email = same identity)
    const deterministicSeed = generateDeterministicSeed(userEmail);
    
    if (!deterministicSeed || typeof deterministicSeed !== 'string') {
      throw new Error('Failed to generate deterministic seed');
    }
    
    console.log('Creating Semaphore identity with deterministic seed for:', userEmail);
    const identity = new Identity(deterministicSeed);
    
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
 * Generate deterministic seed from email (same email = same seed)
 * @param {string} userEmail - User's email
 * @returns {string} - Deterministic seed string
 */
function generateDeterministicSeed(userEmail) {
  // Use PBKDF2 to create a deterministic seed from email
  const salt = 'semaphore-identity-salt-v1'; // Fixed salt for consistency
  const iterations = 10000;
  const keyLength = 32;
  
  const seed = crypto.pbkdf2Sync(userEmail, salt, iterations, keyLength, 'sha256');
  return seed.toString('hex');
}

/**
 * Create identity from existing secure seed (for proof generation)
 * @param {string} secureSeed - Previously generated secure seed
 * @returns {Identity} - Semaphore identity
 */
export function createIdentityFromSeed(secureSeed) {
  return new Identity(secureSeed);
} 