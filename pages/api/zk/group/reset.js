import { resetGroupData } from '../../../../lib/semaphore/group.js';
import { withSecurityConfig } from '../../../../lib/security/middleware.js';

async function handler(req, res) {
  try {
    // Session already validated by security middleware
    const userEmail = req.session.user.email;
    
    console.log('Group reset requested by:', userEmail);
    console.log('Resetting encrypted group data...');
    
    // Reset group data (clears encrypted storage)
    await resetGroupData();
    
    console.log('Group data reset successfully');
    
    res.status(200).json({ 
      success: true,
      message: 'Group data reset successfully',
      resetBy: userEmail,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error resetting group data:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error resetting group data', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Apply security middleware with group reset configuration (requires auth)
export default withSecurityConfig('groupReset')(handler);