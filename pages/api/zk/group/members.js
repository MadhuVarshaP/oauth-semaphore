import { getSession } from '@auth0/nextjs-auth0';
import { addMember } from '../../../../lib/semaphore/group';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const session = await getSession(req, res);
      if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
      }

      const { commitment } = req.body;
      if (!commitment) {
        return res.status(400).json({ message: 'Commitment is required' });
      }

      console.log('Adding member with commitment:', commitment);
      
      // Fix: await the addMember function
      const result = await addMember(commitment);
      
      if (result) {
        console.log('Member added successfully');
        res.status(200).json({ 
          success: true,
          message: 'Member added to group successfully',
          commitment: commitment
        });
      } else {
        console.log('Member already exists in group');
        res.status(200).json({ 
          success: true,
          message: 'Member already exists in group',
          commitment: commitment
        });
      }
    } catch (error) {
      console.error('Error adding member:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error adding member', 
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}