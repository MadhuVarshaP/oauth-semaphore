export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing Semaphore library import...');
    
    // Test basic import
    const { Identity } = await import('@semaphore-protocol/identity');
    console.log('Semaphore Identity imported successfully');
    
    // Test basic functionality
    const testSeed = 'test-seed-123';
    console.log('Creating test identity with seed:', testSeed);
    
    const identity = new Identity(testSeed);
    console.log('Test identity created successfully');
    
    const result = {
      trapdoor: identity.trapdoor.toString(),
      nullifier: identity.nullifier.toString(),
      commitment: identity.commitment.toString()
    };
    
    console.log('Identity properties:', result);
    
    res.status(200).json({
      success: true,
      message: 'Semaphore library test passed',
      identity: result
    });
    
  } catch (error) {
    console.error('Semaphore library test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}
