import fs from 'fs/promises';
import path from 'path';
import { Group } from '@semaphore-protocol/group';

const GROUP_FILE = path.join(process.cwd(), 'data', 'group.json');
const DEFAULT_GROUP = { id: 1, treeDepth: 20, members: [], root: null };

async function ensureGroupFile() {
  try {
    await fs.access(GROUP_FILE);
  } catch {
    await saveGroupData(DEFAULT_GROUP);
  }
}

export async function getGroupData() {
  console.log('getGroupData called');
  await ensureGroupFile();
  
  try {
    const raw = await fs.readFile(GROUP_FILE, 'utf8');
    console.log('Raw group file content:', raw);
    
    const data = JSON.parse(raw);
    console.log('Parsed group data:', data);
    
    if (!data.id || !data.treeDepth || !Array.isArray(data.members)) {
      console.log('Group data validation failed, using default');
      throw new Error('Corrupt group data');
    }
    
    console.log('Returning valid group data:', data);
    return data;
  } catch (err) {
    console.log('Error reading group data, using default:', err.message);
    await saveGroupData(DEFAULT_GROUP);
    return { ...DEFAULT_GROUP };
  }
}

export async function saveGroupData(data) {
  await fs.mkdir(path.dirname(GROUP_FILE), { recursive: true });
  await fs.writeFile(GROUP_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function addMember(commitment) {
  console.log('addMember called with commitment:', commitment);
  
  const groupData = await getGroupData();
  console.log('Current group data:', groupData);
  
  if (groupData.members.includes(commitment)) {
    console.log('Member already exists, skipping');
    return false;
  }
  
  // Add the new member
  groupData.members.push(commitment);
  console.log('Added member, new members array:', groupData.members);
  
  // Create a new Group instance with updated members
  const group = new Group(groupData.id, groupData.treeDepth, groupData.members.map(BigInt));
  
  // Update the root
  groupData.root = group.root.toString();
  console.log('Updated root:', groupData.root);
  
  // Save the updated data
  await saveGroupData(groupData);
  console.log('Group data saved successfully');
  
  return true;
}

export async function resetGroupData() {
  await saveGroupData({ ...DEFAULT_GROUP });
}

export async function getMerkleRoot() {
  const groupData = await getGroupData();
  const group = new Group(groupData.id, groupData.treeDepth, groupData.members.map(BigInt));
  return group.root.toString();
} 