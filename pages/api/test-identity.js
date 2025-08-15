import { createIdentity } from '../../lib/semaphore/identity.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test identity creation started');
    
    // Test with a dummy email
    const testEmail = 'test@example.com';
    console.log('Creating test identity for:', testEmail);
    
    const identity = createIdentity(testEmail);
    console.log('Test identity created successfully');
    
    res.status(200).json({
      success: true,
      message: 'Test identity created successfully',
      commitment: identity.commitment.toString(),
      trapdoor: identity.trapdoor.toString(),
      nullifier: identity.nullifier.toString()
    });
    
  } catch (error) {
    console.error('Test identity creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
