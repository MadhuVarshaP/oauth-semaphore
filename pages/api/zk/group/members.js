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

      const result = addMember(commitment);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error adding member', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}