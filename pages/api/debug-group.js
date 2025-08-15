import { getGroupData } from '../../lib/semaphore/group.js';
import { createIdentity } from '../../lib/semaphore/identity.js';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Debug group endpoint called');
    
    const dataDir = path.join(process.cwd(), 'data');
    const groupFile = path.join(dataDir, 'group.encrypted');
    const jsonFile = path.join(dataDir, 'group.json');
    
    // Check file status
    const fileStatus = {
      dataDir: {
        exists: fs.existsSync(dataDir),
        path: dataDir
      },
      encryptedFile: {
        exists: fs.existsSync(groupFile),
        path: groupFile,
        size: fs.existsSync(groupFile) ? fs.statSync(groupFile).size : 0
      },
      jsonFile: {
        exists: fs.existsSync(jsonFile),
        path: jsonFile,
        size: fs.existsSync(jsonFile) ? fs.statSync(jsonFile).size : 0
      }
    };
    
    // Get current group data
    let groupData = null;
    try {
      groupData = await getGroupData();
    } catch (error) {
      console.error('Error getting group data:', error);
    }
    
    // Test identity creation
    let testIdentity = null;
    try {
      testIdentity = createIdentity('test@example.com');
    } catch (error) {
      console.error('Error creating test identity:', error);
    }
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      fileStatus,
      groupData: groupData ? {
        id: groupData.id,
        treeDepth: groupData.treeDepth,
        memberCount: groupData.members?.length || 0,
        hasRoot: !!groupData.root,
        root: groupData.root
      } : null,
      testIdentity: testIdentity ? {
        commitment: testIdentity.commitment.toString(),
        trapdoor: testIdentity.trapdoor.toString(),
        nullifier: testIdentity.nullifier.toString()
      } : null,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd()
      }
    };

    res.status(200).json({
      success: true,
      message: 'Group debug information',
      debugInfo
    });

  } catch (error) {
    console.error('Debug group error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
