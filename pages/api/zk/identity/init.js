import { createIdentity } from '../../../../lib/semaphore/identity.js';
import { withSecurityConfig } from '../../../../lib/security/middleware.js';
import { encryptSensitiveFields } from '../../../../lib/security/encryption.js';

async function handler(req, res) {
  try {
    // Session is already validated by security middleware
    const userEmail = req.session.user.email;
    
    // Create secure identity (no longer using email directly as seed)
    const identity = createIdentity(userEmail);
    
    // Prepare identity data with sensitive fields
    const identityData = {
      trapdoor: identity.trapdoor.toString(),
      nullifier: identity.nullifier.toString(),
      commitment: identity.commitment.toString(),
      userEmail: userEmail,
      createdAt: new Date().toISOString()
    };
    
    // Encrypt sensitive fields for storage/transmission
    const sensitiveFields = ['trapdoor', 'nullifier'];
    const encryptedIdentityData = encryptSensitiveFields(identityData, sensitiveFields);
    
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
    res.status(500).json({ 
      success: false,
      message: 'Error generating identity', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}

// Apply security middleware with identity-specific configuration
export default withSecurityConfig('identity')(handler); 