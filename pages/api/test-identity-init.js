import { createIdentity } from '../../lib/semaphore/identity.js';
import { encryptSensitiveFields } from '../../lib/security/encryption.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test identity init started');
    
    // Mock session data (simulating what the security middleware would provide)
    const mockSession = {
      user: {
        email: 'test@example.com'
      }
    };
    
    const userEmail = mockSession.user.email;
    console.log('User email from mock session:', userEmail);
    
    // Create secure identity
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
    
    // Return response with encrypted sensitive data
    res.status(200).json({ 
      success: true,
      identityCommitment: identity.commitment.toString(),
      identityData: encryptedIdentityData,
      message: 'Identity created with cryptographically secure seed'
    });
    
  } catch (error) {
    console.error('Error in test identity init:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Error in test identity init', 
      error: error.message,
      stack: error.stack
    });
  }
}
