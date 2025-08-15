import { withRateLimit } from './rateLimit.js';
import { requireSession } from './session.js';
import { validateRequestBody, validateMethod, schemas } from './validation.js';

/**
 * Security middleware composer
 */

/**
 * Apply security headers to response
 * @param {object} res - Response object
 */
function setSecurityHeaders(res) {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // CORS headers (more restrictive than current implementation)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://semaphore-check.vercel.app',
    process.env.AUTH0_BASE_URL
  ].filter(Boolean);
  
  res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
}

/**
 * Handle CORS preflight requests
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @returns {boolean} - Whether request was handled
 */
function handleCORS(req, res) {
  if (req.method === 'OPTIONS') {
    setSecurityHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Validate HTTP method
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {array} allowedMethods - Allowed HTTP methods
 * @returns {boolean} - Whether method is valid
 */
function validateHTTPMethod(req, res, allowedMethods) {
  if (!validateMethod(req.method, allowedMethods)) {
    res.status(405).json({
      error: 'Method Not Allowed',
      message: `Method ${req.method} is not allowed for this endpoint`,
      allowedMethods
    });
    return false;
  }
  return true;
}

/**
 * Comprehensive security middleware
 * @param {object} options - Security options
 * @returns {function} - Security middleware function
 */
export function withSecurity(options = {}) {
  const {
    rateLimit: rateLimitType = 'default',
    requireAuth = true,
    allowedMethods = ['POST'],
    validationSchema = null,
    skipCORS = false
  } = options;
  
  return function securityMiddleware(handler) {
    return async function securedHandler(req, res) {
      try {
        // Set security headers
        setSecurityHeaders(res);
        
        // Handle CORS preflight
        if (!skipCORS && handleCORS(req, res)) {
          return;
        }
        
        // Validate HTTP method
        if (!validateHTTPMethod(req, res, allowedMethods)) {
          return;
        }
        
        // Apply rate limiting
        const rateLimitMiddleware = withRateLimit(async (req, res) => {
          // Session validation
          if (requireAuth) {
            const sessionMiddleware = requireSession(async (req, res) => {
              // Request body validation
              if (validationSchema && req.method !== 'GET') {
                const validation = validateRequestBody(req.body, validationSchema);
                
                if (!validation.isValid) {
                  return res.status(400).json({
                    error: 'Validation Error',
                    message: 'Request validation failed',
                    details: validation.errors
                  });
                }
                
                // Replace request body with sanitized version
                req.body = validation.sanitized;
              }
              
              // Call the actual handler
              return handler(req, res);
            });
            
            return sessionMiddleware(req, res);
          } else {
            // Request body validation without session requirement
            if (validationSchema && req.method !== 'GET') {
              const validation = validateRequestBody(req.body, validationSchema);
              
              if (!validation.isValid) {
                return res.status(400).json({
                  error: 'Validation Error',
                  message: 'Request validation failed',
                  details: validation.errors
                });
              }
              
              req.body = validation.sanitized;
            }
            
            return handler(req, res);
          }
        }, rateLimitType);
        
        return rateLimitMiddleware(req, res);
        
      } catch (error) {
        console.error('Security middleware error:', error);
        
        // Don't expose internal errors in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        return res.status(500).json({
          error: 'Internal Server Error',
          message: isDevelopment ? error.message : 'An unexpected error occurred',
          ...(isDevelopment && { stack: error.stack })
        });
      }
    };
  };
}

/**
 * Predefined security configurations for different endpoint types
 */
export const securityConfigs = {
  // Identity creation endpoint
  identity: {
    rateLimit: 'identity',
    requireAuth: true,
    allowedMethods: ['POST'],
    validationSchema: schemas.identity
  },
  
  // Group member addition
  groupMember: {
    rateLimit: 'default',
    requireAuth: true,
    allowedMethods: ['POST'],
    validationSchema: schemas.groupMember
  },
  
  // Group data retrieval
  groupData: {
    rateLimit: 'default',
    requireAuth: true,
    allowedMethods: ['GET'],
    validationSchema: null
  },
  
  // ZK proof verification
  zkProof: {
    rateLimit: 'zkProof',
    requireAuth: false, // Proof verification can be public
    allowedMethods: ['POST'],
    validationSchema: schemas.zkProof
  },
  
  // Group reset (admin operation)
  groupReset: {
    rateLimit: 'auth',
    requireAuth: true,
    allowedMethods: ['POST'],
    validationSchema: null
  }
};

/**
 * Quick security wrapper with predefined config
 * @param {string} configName - Configuration name
 * @returns {function} - Security middleware
 */
export function withSecurityConfig(configName) {
  const config = securityConfigs[configName];
  if (!config) {
    throw new Error(`Unknown security configuration: ${configName}`);
  }
  return withSecurity(config);
}