import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth({
  // Explicit configuration to resolve 400 errors
  baseURL: process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  
  // Enhanced session configuration
  session: {
    // Session timeout (30 minutes)
    rollingDuration: 30 * 60, // 30 minutes in seconds
    absoluteDuration: 24 * 60 * 60, // 24 hours maximum session duration
    // Secure cookie settings
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined
    }
  },
  
  onError: (err, req, res) => {
    console.error('Auth0 Error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString()
    });
    
    // Enhanced error handling with security logging
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    console.error('Auth error from IP:', clientIP);
    
    // Redirect to home with error
    res.writeHead(302, {
      Location: `/?error=${encodeURIComponent(err.message)}`
    });
    res.end();
  },
  
  // Login handling with security logging
  onLogin: (req, res, session) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    console.log('Secure login successful:', {
      email: session?.user?.email,
      timestamp: new Date().toISOString(),
      clientIP: clientIP,
      userAgent: req.headers['user-agent']?.substring(0, 100) || 'unknown'
    });
    
    // Add security metadata to session
    return {
      ...session,
      loginTimestamp: new Date().toISOString(),
      clientIP: clientIP
    };
  },
  
  // Callback handling with security validation
  onCallback: (req, res, session) => {
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    console.log('Secure callback successful:', {
      email: session?.user?.email,
      timestamp: new Date().toISOString(),
      clientIP: clientIP
    });
    
    // Validate session data
    if (!session?.user?.email) {
      throw new Error('Invalid session: missing user email');
    }
    
    return session;
  },
  
  // Authorization parameters with enhanced security
  authorizationParams: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
    // Add security parameters
    prompt: 'consent', // Always ask for consent
    max_age: 0 // Force fresh authentication
  }
});
