import { generateProof } from '@semaphore-protocol/proof';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import { getGroupData } from '../../../lib/semaphore/group.js';
import { withSecurityConfig } from '../../../lib/security/middleware.js';

async function handler(req, res) {
  try {
    console.log('ZK Proof generation request received');
    
    // Session already validated by security middleware
    const userEmail = req.session.user.email;
    console.log('Proof requested by:', userEmail);
    
    const { signal } = req.body;
    if (!signal) {
      return res.status(400).json({ 
        success: false,
        message: 'Signal is required' 
      });
    }
    
    console.log('Generating proof for signal:', signal);

    // Get group data
    const groupData = await getGroupData();
    if (!groupData || !groupData.members || groupData.members.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No group members found' 
      });
    }

    // Create identity from user email
    const identity = new Identity(userEmail);
    console.log('Identity created for proof generation');
    
    // Create group
    const group = new Group(groupData.id, groupData.treeDepth || 20, groupData.members.map(BigInt));
    console.log('Group created with member count:', groupData.members.length);
    
    // Generate proof
    const externalNullifier = BigInt(Math.floor(Math.random() * 1000000));
    console.log('Generating proof with external nullifier:', externalNullifier.toString());
    
    const fullProof = await generateProof(identity, group, BigInt(signal), externalNullifier);
    console.log('Proof generated successfully');

    res.status(200).json({ 
      success: true,
      fullProof,
      externalNullifier: externalNullifier.toString(),
      message: 'ZK proof generated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating ZK proof:', error);
    
    res.status(500).json({ 
      success: false,
      message: 'Error generating proof', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
}

// Apply security middleware with ZK proof configuration
export default withSecurityConfig('zkProof')(handler);
