import crypto from 'crypto';

/**
 * Generate cryptographically secure random bytes
 * @param {number} length - Number of bytes to generate
 * @returns {Buffer} - Secure random bytes
 */
export function generateSecureRandom(length = 32) {
  return crypto.randomBytes(length);
}

/**
 * Generate a secure seed for identity creation
 * @param {string} userEmail - User's email for additional entropy
 * @returns {string} - Secure seed string
 */
export function generateSecureSeed(userEmail) {
  // Combine secure random bytes with user email for additional entropy
  const randomBytes = generateSecureRandom(32);
  const timestamp = Date.now().toString();
  const combined = `${randomBytes.toString('hex')}-${userEmail}-${timestamp}`;
  
  // Hash the combined string for consistent length
  return crypto.createHash('sha256').update(combined).digest('hex');
}

/**
 * Encrypt sensitive data at rest
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {object} - Encrypted data with IV
 */
export function encryptData(data, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt sensitive data
 * @param {object} encryptedData - Encrypted data object
 * @param {string} key - Decryption key
 * @returns {string} - Decrypted data
 */
export function decryptData(encryptedData, key) {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipher(algorithm, key);
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash sensitive data for storage
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} - Hashed data
 */
export function hashData(data, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512');
  return `${actualSalt}:${hash.toString('hex')}`;
}

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hashedData - Hashed data to verify against
 * @returns {boolean} - Verification result
 */
export function verifyHash(data, hashedData) {
  const [salt, hash] = hashedData.split(':');
  const newHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512');
  return hash === newHash.toString('hex');
}