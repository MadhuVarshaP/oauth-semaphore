import { createIdentity } from '../../../../lib/semaphore/identity.js';
import { withSecurityConfig } from '../../../../lib/security/middleware.js';
import { encryptSensitiveFields } from '../../../../lib/security/encryption.js';

async function handler(req, res) {
  try {
    // Debug logging
    console.log('Identity init handler started');
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    console.log('Session available:', !!req.session);
    
    // Session is already validated by security middleware
    if (!req.session || !req.session.user) {
      console.error('No valid session found');
      return res.status(401).json({
        success: false,
        message: 'No valid session found',
        error: 'SESSION_MISSING'
      });
    }
    
    const userEmail = req.session.user.email;
    console.log('User email from session:', userEmail);
    
    if (!userEmail) {
      console.error('No user email in session');
      return res.status(400).json({
        success: false,
        message: 'No user email found in session',
        error: 'EMAIL_MISSING'
      });
    }
    
    // Create secure identity (no longer using email directly as seed)
    console.log('Creating identity for user:', userEmail);
    const identity = createIdentity(userEmail);
    console.log('Identity created successfully');
    
    // Prepare identity data with sensitive fields
    const identityData = {
      trapdoor: identity.trapdoor.toString(),
      nullifier: identity.nullifier.toString(),
      commitment: identity.commitment.toString(),
      userEmail: userEmail,
      createdAt: new Date().toISOString()
    };
    
    console.log('Identity data prepared, encrypting sensitive fields');
    
    // Encrypt sensitive fields for storage/transmission
    const sensitiveFields = ['trapdoor', 'nullifier'];
    const encryptedIdentityData = encryptSensitiveFields(identityData, sensitiveFields);
    
    console.log('Sensitive fields encrypted successfully');
    
    // Log identity creation (without sensitive data)
    console.log('Secure identity created for user:', {
      email: userEmail,
      commitment: identity.commitment.toString(),
      timestamp: identityData.createdAt
    });
    
    // Return response with encrypted sensitive data
    res.status(200).json({ 
      success: true,
      identityCommitment: identity.commitment.toString(),
      identityData: encryptedIdentityData,
      message: 'Identity created with cryptographically secure seed'
    });
    
  } catch (error) {
    console.error('Error generating secure identity:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    // Check for specific error types
    let errorMessage = 'Error generating identity';
    let errorCode = 'GENERAL_ERROR';
    
    if (error.message.includes('ENCRYPTION_KEY')) {
      errorMessage = 'Encryption configuration error';
      errorCode = 'ENCRYPTION_CONFIG_ERROR';
    } else if (error.message.includes('session')) {
      errorMessage = 'Session validation error';
      errorCode = 'SESSION_ERROR';
    } else if (error.message.includes('semaphore')) {
      errorMessage = 'Semaphore protocol error';
      errorCode = 'SEMAPHORE_ERROR';
    }
    
    res.status(500).json({ 
      success: false,
      message: errorMessage, 
      error: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Apply security middleware with identity-specific configuration
export default withSecurityConfig('identity')(handler); 