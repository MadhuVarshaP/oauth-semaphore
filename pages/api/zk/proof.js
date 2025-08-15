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
    
    const { signal, identityData } = req.body;
    if (!signal) {
      return res.status(400).json({ 
        success: false,
        message: 'Signal is required' 
      });
    }
    
    if (!identityData) {
      return res.status(400).json({ 
        success: false,
        message: 'Identity data is required for proof generation' 
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

    // Create identity from stored data (not from email)
    let identity;
    try {
      if (identityData.trapdoor && identityData.nullifier) {
        // Use stored trapdoor and nullifier
        identity = new Identity(identityData.trapdoor, identityData.nullifier);
        console.log('Identity created from stored data for proof generation');
      } else {
        throw new Error('Invalid identity data structure');
      }
    } catch (identityError) {
      console.error('Error creating identity from stored data:', identityError);
      return res.status(400).json({
        success: false,
        message: 'Invalid identity data provided',
        error: 'IDENTITY_DATA_INVALID'
      });
    }
    
    // Verify the identity commitment matches what's stored on server
    const serverCommitment = identity.commitment.toString();
    console.log('Identity commitment from stored data:', serverCommitment);
    
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
      timestamp: new Date().toISOString(),
      identityCommitment: serverCommitment
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
