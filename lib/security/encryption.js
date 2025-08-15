import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Data encryption utilities for sensitive data at rest
 */

// Get encryption key from environment or generate one
function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY;
  if (envKey) {
    return envKey;
  }
  
  // For development, generate a key and warn
  console.warn('WARNING: No ENCRYPTION_KEY found in environment. Using generated key for development.');
  console.warn('In production, set ENCRYPTION_KEY environment variable.');
  
  return crypto.randomBytes(32).toString('hex');
}

const ENCRYPTION_KEY = getEncryptionKey();
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt data
 * @param {string} text - Text to encrypt
 * @returns {object} - Encrypted data with metadata
 */
export function encrypt(text) {
  if (!text) {
    throw new Error('Text to encrypt cannot be empty');
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    algorithm: ALGORITHM
  };
}

/**
 * Decrypt data
 * @param {object} encryptedData - Encrypted data object
 * @returns {string} - Decrypted text
 */
export function decrypt(encryptedData) {
  if (!encryptedData || !encryptedData.encrypted) {
    throw new Error('Invalid encrypted data');
  }
  
  const { encrypted, iv, authTag, algorithm = ALGORITHM } = encryptedData;
  
  const decipher = crypto.createDecipher(algorithm, ENCRYPTION_KEY);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt and save data to file
 * @param {string} filePath - Path to save encrypted file
 * @param {object} data - Data to encrypt and save
 */
export function encryptToFile(filePath, data) {
  const jsonString = JSON.stringify(data);
  const encryptedData = encrypt(jsonString);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(encryptedData, null, 2));
}

/**
 * Decrypt and load data from file
 * @param {string} filePath - Path to encrypted file
 * @returns {object} - Decrypted data
 */
export function decryptFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Encrypted file not found: ${filePath}`);
  }
  
  const encryptedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const decryptedString = decrypt(encryptedData);
  
  return JSON.parse(decryptedString);
}

/**
 * Hash sensitive data for comparison
 * @param {string} data - Data to hash
 * @param {string} salt - Optional salt (will generate if not provided)
 * @returns {object} - Hash and salt
 */
export function hashData(data, salt = null) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512');
  
  return {
    hash: hash.toString('hex'),
    salt: actualSalt
  };
}

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @param {string} salt - Salt used for hashing
 * @returns {boolean} - Verification result
 */
export function verifyHash(data, hash, salt) {
  const newHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
  return hash === newHash.toString('hex');
}

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} - Secure random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Encrypt sensitive fields in an object
 * @param {object} obj - Object with sensitive fields
 * @param {array} sensitiveFields - Array of field names to encrypt
 * @returns {object} - Object with encrypted sensitive fields
 */
export function encryptSensitiveFields(obj, sensitiveFields) {
  const result = { ...obj };
  
  for (const field of sensitiveFields) {
    if (result[field]) {
      result[field] = encrypt(result[field].toString());
    }
  }
  
  return result;
}

/**
 * Decrypt sensitive fields in an object
 * @param {object} obj - Object with encrypted sensitive fields
 * @param {array} sensitiveFields - Array of field names to decrypt
 * @returns {object} - Object with decrypted sensitive fields
 */
export function decryptSensitiveFields(obj, sensitiveFields) {
  const result = { ...obj };
  
  for (const field of sensitiveFields) {
    if (result[field] && typeof result[field] === 'object' && result[field].encrypted) {
      result[field] = decrypt(result[field]);
    }
  }
  
  return result;
}