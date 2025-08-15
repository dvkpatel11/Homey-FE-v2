/**
 * Mock Server Utilities
 * Helper functions for mock data manipulation
 */

import { v4 as uuidv4 } from 'uuid';

// Simulate API delay for realistic experience
export const delay = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generate pagination metadata
export const paginate = (items, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const paginatedItems = items.slice(offset, offset + limit);
  
  return {
    data: paginatedItems,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: items.length,
      has_more: offset + limit < items.length,
    },
  };
};

// Filter items based on query parameters
export const filterItems = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      
      // Handle different filter types
      if (key.endsWith('_after') || key.endsWith('_before')) {
        const dateKey = key.replace('_after', '').replace('_before', '');
        const itemDate = new Date(item[dateKey]);
        const filterDate = new Date(value);
        
        if (key.endsWith('_after')) {
          return itemDate >= filterDate;
        } else {
          return itemDate <= filterDate;
        }
      }
      
      if (key.endsWith('_min') || key.endsWith('_max')) {
        const numberKey = key.replace('_min', '').replace('_max', '');
        const itemValue = parseFloat(item[numberKey]);
        const filterValue = parseFloat(value);
        
        if (key.endsWith('_min')) {
          return itemValue >= filterValue;
        } else {
          return itemValue <= filterValue;
        }
      }
      
      // String matching
      if (typeof item[key] === 'string') {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      
      // Exact matching
      return item[key] === value;
    });
  });
};

// Simulate file upload
export const simulateFileUpload = (file) => {
  const fileId = uuidv4();
  const extension = file.originalname?.split('.').pop() || 'jpg';
  const filename = `${fileId}.${extension}`;
  
  return {
    file_id: fileId,
    url: `https://mock-cdn.homey.app/uploads/${filename}`,
    filename: file.originalname || filename,
    size: file.size || Math.floor(Math.random() * 1000000),
    content_type: file.mimetype || 'image/jpeg',
  };
};

// Generate realistic fake data
export const generateFakeUser = (overrides = {}) => {
  const names = ['Alex', 'Sam', 'Casey', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Avery'];
  const surnames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  const firstName = names[Math.floor(Math.random() * names.length)];
  const lastName = surnames[Math.floor(Math.random() * surnames.length)];
  
  return {
    id: uuidv4(),
    email: `${firstName.toLowerCase()}@example.com`,
    full_name: `${firstName} ${lastName}`,
    avatar_url: `https://i.pravatar.cc/150?u=${firstName.toLowerCase()}`,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

export const generateFakeTask = (householdId, overrides = {}) => {
  const titles = [
    'Take out trash', 'Clean kitchen', 'Vacuum living room', 'Do laundry',
    'Grocery shopping', 'Clean bathroom', 'Mow lawn', 'Water plants',
    'Organize closet', 'Wash dishes', 'Change bed sheets', 'Clean windows'
  ];
  
  const categories = ['cleaning', 'kitchen', 'shopping', 'maintenance', 'other'];
  const statuses = ['pending', 'completed', 'overdue'];
  
  return {
    id: uuidv4(),
    household_id: householdId,
    title: titles[Math.floor(Math.random() * titles.length)],
    description: Math.random() > 0.5 ? 'Auto-generated task description' : null,
    due_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_recurring: Math.random() > 0.7,
    recurrence_pattern: Math.random() > 0.7 ? 'weekly' : null,
    recurrence_interval: Math.random() > 0.7 ? 1 : null,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_by: uuidv4(),
    assignments: [],
    swap_requests: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

export const generateFakeBill = (householdId, overrides = {}) => {
  const titles = [
    'Electric Bill', 'Gas Bill', 'Water Bill', 'Internet Bill', 'Rent',
    'Grocery Receipt', 'Restaurant Bill', 'Phone Bill', 'Insurance'
  ];
  
  const categories = ['utilities', 'rent', 'groceries', 'entertainment', 'other'];
  
  return {
    id: uuidv4(),
    household_id: householdId,
    title: titles[Math.floor(Math.random() * titles.length)],
    description: Math.random() > 0.5 ? 'Auto-generated bill' : null,
    total_amount: (Math.random() * 200 + 10).toFixed(2),
    currency: 'USD',
    due_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paid_date: null,
    is_recurring: Math.random() > 0.6,
    recurrence_pattern: Math.random() > 0.6 ? 'monthly' : null,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: 'pending',
    paid_by: uuidv4(),
    paid_by_name: 'Mock User',
    created_by: uuidv4(),
    splits: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
};

// Validate request data
export const validateRequired = (data, requiredFields) => {
  const missing = requiredFields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Sort items by field
export const sortItems = (items, sortBy = 'created_at', sortOrder = 'desc') => {
  return [...items].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle date sorting
    if (sortBy.includes('date') || sortBy.includes('at')) {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    // Handle numeric sorting
    if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    } else {
      return aVal > bVal ? 1 : -1;
    }
  });
};
