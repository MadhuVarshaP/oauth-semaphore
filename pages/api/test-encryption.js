import { encryptSensitiveFields } from '../../lib/security/encryption.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Test encryption started');
    
    // Test data
    const testData = {
      trapdoor: '123456789',
      nullifier: '987654321',
      commitment: '555666777',
      userEmail: 'test@example.com',
      createdAt: new Date().toISOString()
    };
    
    console.log('Test data prepared, encrypting sensitive fields');
    
    const sensitiveFields = ['trapdoor', 'nullifier'];
    const encryptedData = encryptSensitiveFields(testData, sensitiveFields);
    
    console.log('Encryption completed successfully');
    
    res.status(200).json({
      success: true,
      message: 'Test encryption completed successfully',
      originalData: testData,
      encryptedData: encryptedData
    });
    
  } catch (error) {
    console.error('Test encryption failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
