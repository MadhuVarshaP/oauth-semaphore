import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth({
  baseURL: process.env.NGROK_BASE_URL || process.env.AUTH0_BASE_URL,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  
  // Enhanced session configuration
  session: {
    rollingDuration: 30 * 60, // 30 minutes
    absoluteDuration: 24 * 60 * 60, // 24 hours
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
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
    let clientIP = 'unknown';
    if (req && req.headers) {
      clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    }
    console.error('Auth error from IP:', clientIP);
    
    // Redirect to home with error
    res.writeHead(302, {
      Location: `/?error=${encodeURIComponent(err.message)}`
    });
    res.end();
  },
  
  onLogin: (req, res, session) => {
    let clientIP = 'unknown';
    let userAgent = 'unknown';
    
    if (req && req.headers) {
      clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      userAgent = req.headers['user-agent']?.substring(0, 100) || 'unknown';
    }
    
    console.log('Secure login successful:', {
      email: session?.user?.email,
      timestamp: new Date().toISOString(),
      clientIP: clientIP,
      userAgent: userAgent
    });
    
    return {
      ...session,
      loginTimestamp: new Date().toISOString(),
      clientIP: clientIP
    };
  },
  
  onCallback: (req, res, session) => {
    let clientIP = 'unknown';
    
    if (req && req.headers) {
      clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    }
    
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
  
  authorizationParams: {
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE
  }
});
