import { Group } from '@semaphore-protocol/group';
import { encryptToFile, decryptFromFile } from '../security/encryption.js';
import path from 'path';
import fs from 'fs';

// File paths for encrypted storage
const DATA_DIR = path.join(process.cwd(), 'data');
const GROUP_FILE = path.join(DATA_DIR, 'group.encrypted');
const BACKUP_FILE = path.join(DATA_DIR, 'group.backup.encrypted');

// In-memory cache for performance
let groupDataCache = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default group structure
const DEFAULT_GROUP = { id: 1, treeDepth: 20, members: [], root: null };

/**
 * Initialize group with default values
 */
function initializeGroup(data = DEFAULT_GROUP) {
  if (!data.root || data.members.length === 0) {
    const group = new Group(data.id, data.treeDepth, []);
    data.root = group.root.toString();
  }
  return data;
}

/**
 * Load group data from encrypted file or create default
 */
function loadGroupFromFile() {
  try {
    if (fs.existsSync(GROUP_FILE)) {
      const data = decryptFromFile(GROUP_FILE);
      return initializeGroup(data);
    }
  } catch (error) {
    console.error('Error loading encrypted group data:', error);
    
    // Try backup file
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        console.log('Attempting to restore from backup...');
        const data = decryptFromFile(BACKUP_FILE);
        return initializeGroup(data);
      }
    } catch (backupError) {
      console.error('Error loading backup group data:', backupError);
    }
  }
  
  // Return default if no file exists or loading failed
  return initializeGroup();
}

/**
 * Save group data to encrypted file with backup
 */
function saveGroupToFile(data) {
  try {
    if (!data) {
      throw new Error('Group data is required for file saving');
    }
    
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('Creating data directory:', DATA_DIR);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    // Create backup of existing file
    if (fs.existsSync(GROUP_FILE)) {
      console.log('Creating backup of existing group file');
      fs.copyFileSync(GROUP_FILE, BACKUP_FILE);
    }
    
    // Save encrypted data
    console.log('Saving encrypted group data to:', GROUP_FILE);
    encryptToFile(GROUP_FILE, data);
    console.log('Group data saved to encrypted file successfully');
  } catch (error) {
    console.error('Error saving group data to file:', error);
    throw new Error(`Failed to save group data to file: ${error.message}`);
  }
}

/**
 * Get group data with caching
 */
export async function getGroupData() {
  console.log('getGroupData called');
  
  const now = Date.now();
  
  // Check cache validity
  if (groupDataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_TTL) {
    console.log('Returning cached group data');
    return groupDataCache;
  }
  
  // Load from file
  const data = loadGroupFromFile();
  
  // Update cache
  groupDataCache = data;
  cacheTimestamp = now;
  
  console.log('Returning group data:', {
    id: data.id,
    treeDepth: data.treeDepth,
    memberCount: data.members.length,
    hasRoot: !!data.root
  });
  
  return data;
}

/**
 * Save group data with encryption and caching
 */
export async function saveGroupData(data) {
  try {
    console.log('saveGroupData called with member count:', data.members?.length || 0);
    
    if (!data) {
      throw new Error('Group data is required');
    }
    
    // Validate data structure
    if (!data.id || !data.treeDepth || !Array.isArray(data.members)) {
      throw new Error('Invalid group data structure');
    }
    
    // Save to encrypted file
    saveGroupToFile(data);
    
    // Update cache
    groupDataCache = { ...data };
    cacheTimestamp = Date.now();
    
    console.log('Group data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving group data:', error);
    throw new Error(`Failed to save group data: ${error.message}`);
  }
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
  try {
    console.log('resetGroupData called');
    
    // Check if data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      console.log('Data directory does not exist, creating it');
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    const defaultData = initializeGroup();
    console.log('Default group data prepared:', defaultData);
    
    await saveGroupData(defaultData);
    console.log('Group reset to default state successfully');
    
    return true;
  } catch (error) {
    console.error('Error in resetGroupData:', error);
    throw new Error(`Failed to reset group data: ${error.message}`);
  }
}

export async function getMerkleRoot() {
  const currentGroupData = await getGroupData();
  const group = new Group(currentGroupData.id, currentGroupData.treeDepth, currentGroupData.members.map(BigInt));
  return group.root.toString();
} 