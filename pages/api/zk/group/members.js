import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { addMember, getGroupData } from '../../../../lib/semaphore/group';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, {
        providers: [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: { params: { prompt: 'select_account' } },
          }),
        ],
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
      }
      const { commitment } = req.body;
      if (!commitment) {
        return res.status(400).json({ message: 'Commitment is required' });
      }
      try {
        BigInt(commitment);
      } catch {
        return res.status(400).json({ message: 'Invalid commitment format' });
      }
      const added = await addMember(commitment);
      if (!added) {
        return res.status(200).json({ message: 'Member already exists' });
      }
      res.status(200).json({ message: 'Member added' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding member', error: error.message });
    }
  } else if (req.method === 'GET') {
    try {
      const groupData = await getGroupData();
      res.status(200).json({ members: groupData.members });
    } catch (error) {
      res.status(500).json({ message: 'Error loading group members', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}