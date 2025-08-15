/**
 * Reset Mock Data Utility
 * Resets all mock data to initial state
 */

import { 
  users, 
  households, 
  householdMembers, 
  tasks, 
  bills, 
  messages, 
  notifications 
} from '../data/mockData.js';

console.log('🔄 Resetting mock data to initial state...');

// Clear all arrays
users.length = 0;
households.length = 0;
householdMembers.length = 0;
tasks.length = 0;
bills.length = 0;
messages.length = 0;
notifications.length = 0;

console.log('✅ Mock data reset complete!');
console.log('🔄 Restart the server to reload initial data.');
