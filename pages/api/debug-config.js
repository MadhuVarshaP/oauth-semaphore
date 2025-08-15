export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const config = {
      nodeEnv: process.env.NODE_ENV,
      auth0: {
        secret: process.env.AUTH0_SECRET ? 'SET' : 'MISSING',
        baseUrl: process.env.AUTH0_BASE_URL || 'MISSING',
        issuer: process.env.AUTH0_ISSUER_BASE_URL || 'MISSING',
        clientId: process.env.AUTH0_CLIENT_ID ? 'SET' : 'MISSING',
        clientSecret: process.env.AUTH0_CLIENT_SECRET ? 'SET' : 'MISSING'
      },
      encryption: {
        key: process.env.ENCRYPTION_KEY ? 'SET' : 'MISSING',
        keyLength: process.env.ENCRYPTION_KEY ? process.env.ENCRYPTION_KEY.length : 0
      },
      runtime: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    res.status(200).json({
      success: true,
      message: 'Configuration debug info',
      config,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug config error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
