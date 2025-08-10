import { Group } from '@semaphore-protocol/group';

// In-memory storage for serverless compatibility
let groupData = { id: 1, treeDepth: 20, members: [], root: null };

// Initialize with default values
function initializeGroup() {
  if (groupData.members.length === 0) {
    const group = new Group(groupData.id, groupData.treeDepth, []);
    groupData.root = group.root.toString();
  }
  return groupData;
}

export async function getGroupData() {
  console.log('getGroupData called');
  initializeGroup();
  console.log('Returning group data:', groupData);
  return groupData;
}

export async function saveGroupData(data) {
  console.log('saveGroupData called with:', data);
  groupData = { ...data };
  console.log('Group data updated in memory');
}

export async function addMember(commitment) {
  console.log('addMember called with commitment:', commitment);
  
  const currentGroupData = await getGroupData();
  console.log('Current group data:', currentGroupData);
  
  if (currentGroupData.members.includes(commitment)) {
    console.log('Member already exists, skipping');
    return false;
  }
  
  // Add the new member
  currentGroupData.members.push(commitment);
  console.log('Added member, new members array:', currentGroupData.members);
  
  // Create a new Group instance with updated members
  const group = new Group(currentGroupData.id, currentGroupData.treeDepth, currentGroupData.members.map(BigInt));
  
  // Update the root
  currentGroupData.root = group.root.toString();
  console.log('Updated root:', currentGroupData.root);
  
  // Save the updated data
  await saveGroupData(currentGroupData);
  console.log('Group data saved successfully');
  
  return true;
}

export async function resetGroupData() {
  console.log('resetGroupData called');
  groupData = { id: 1, treeDepth: 20, members: [], root: null };
  const group = new Group(groupData.id, groupData.treeDepth, []);
  groupData.root = group.root.toString();
  console.log('Group reset to default state');
}

export async function getMerkleRoot() {
  const currentGroupData = await getGroupData();
  const group = new Group(currentGroupData.id, currentGroupData.treeDepth, currentGroupData.members.map(BigInt));
  return group.root.toString();
} 