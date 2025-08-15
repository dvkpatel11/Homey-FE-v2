#!/bin/bash

# Homey App - Generate Mock Server
# Creates an in-memory mock server for rapid development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 Generating Mock Server for Development...${NC}"

# Configuration
PROJECT_ROOT="."
MOCK_DIR="server"
MOCK_SRC="$MOCK_DIR/src"

# Create directories
mkdir -p "$MOCK_SRC/data"
mkdir -p "$MOCK_SRC/routes"
mkdir -p "$MOCK_SRC/middleware"
mkdir -p "$MOCK_SRC/utils"

# ============================================================================
# PACKAGE.JSON FOR MOCK SERVER
# ============================================================================

echo -e "${PURPLE}📦 Creating mock server package.json...${NC}"

cat > "$MOCK_DIR/package.json" << 'EOF'
{
  "name": "homey-mock-server",
  "version": "1.0.0",
  "description": "Mock server for Homey app development",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "reset": "node src/utils/resetData.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0",
    "uuid": "^9.0.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# ============================================================================
# MOCK DATA GENERATOR
# ============================================================================

echo -e "${PURPLE}🗄️  Generating mock data...${NC}"

cat > "$MOCK_SRC/data/mockData.js" << 'EOF'
/**
 * Mock Data Generator
 * Realistic data for Homey app development
 */

import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, addHours, format } from 'date-fns';

// Helper to generate realistic dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Mock user data
export const users = [
  {
    id: 'user-1',
    email: 'alex@example.com',
    full_name: 'Alex Johnson',
    avatar_url: 'https://i.pravatar.cc/150?u=alex',
    phone: '+1234567890',
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-2', 
    email: 'sam@example.com',
    full_name: 'Sam Rodriguez',
    avatar_url: 'https://i.pravatar.cc/150?u=sam',
    phone: '+1234567891',
    created_at: subDays(new Date(), 25).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'casey@example.com', 
    full_name: 'Casey Chen',
    avatar_url: 'https://i.pravatar.cc/150?u=casey',
    phone: '+1234567892',
    created_at: subDays(new Date(), 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-4',
    email: 'jordan@example.com',
    full_name: 'Jordan Smith',
    avatar_url: 'https://i.pravatar.cc/150?u=jordan',
    phone: '+1234567893', 
    created_at: subDays(new Date(), 15).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Current user (bypassing auth)
export const currentUser = users[0];

// Mock household data
export const households = [
  {
    id: 'household-1',
    name: 'Downtown Loft',
    max_members: 4,
    address: '123 Main St, Apartment 4B',
    lease_start_date: subDays(new Date(), 90).toISOString().split('T')[0],
    lease_end_date: addDays(new Date(), 275).toISOString().split('T')[0],
    admin_id: 'user-1',
    invite_code: 'DT-LOFT-2024',
    member_count: 4,
    data_retention_days: 365,
    role: 'admin',
    joined_at: subDays(new Date(), 90).toISOString(),
    created_at: subDays(new Date(), 90).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'household-2', 
    name: 'Suburban House',
    max_members: 6,
    address: '456 Oak Avenue',
    lease_start_date: subDays(new Date(), 180).toISOString().split('T')[0],
    lease_end_date: addDays(new Date(), 185).toISOString().split('T')[0],
    admin_id: 'user-2',
    invite_code: 'SUB-HOUSE-24',
    member_count: 3,
    data_retention_days: 365,
    role: 'member',
    joined_at: subDays(new Date(), 60).toISOString(),
    created_at: subDays(new Date(), 180).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const currentHousehold = households[0];

// Mock household members
export const householdMembers = [
  {
    id: 'member-1',
    user_id: 'user-1',
    full_name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=alex',
    role: 'admin',
    joined_at: subDays(new Date(), 90).toISOString(),
  },
  {
    id: 'member-2',
    user_id: 'user-2', 
    full_name: 'Sam Rodriguez',
    email: 'sam@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=sam',
    role: 'member',
    joined_at: subDays(new Date(), 60).toISOString(),
  },
  {
    id: 'member-3',
    user_id: 'user-3',
    full_name: 'Casey Chen',
    email: 'casey@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=casey',
    role: 'member',
    joined_at: subDays(new Date(), 45).toISOString(),
  },
  {
    id: 'member-4',
    user_id: 'user-4',
    full_name: 'Jordan Smith',
    email: 'jordan@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=jordan',
    role: 'member',
    joined_at: subDays(new Date(), 30).toISOString(),
  }
];

// Mock tasks
export const tasks = [
  {
    id: 'task-1',
    household_id: 'household-1',
    title: 'Take out trash',
    description: 'Weekly trash and recycling pickup',
    due_date: addDays(new Date(), 2).toISOString(),
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    category: 'cleaning',
    status: 'pending',
    created_by: 'user-1',
    created_at: subDays(new Date(), 7).toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [
      {
        id: 'assignment-1',
        assigned_to: 'user-2',
        assigned_to_name: 'Sam Rodriguez',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=sam',
        assigned_at: subDays(new Date(), 7).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-2',
    household_id: 'household-1', 
    title: 'Clean kitchen',
    description: 'Deep clean kitchen including appliances',
    due_date: addDays(new Date(), 1).toISOString(),
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: null,
    category: 'kitchen',
    status: 'completed',
    created_by: 'user-1',
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
    assignments: [
      {
        id: 'assignment-2',
        assigned_to: 'user-3',
        assigned_to_name: 'Casey Chen',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=casey',
        assigned_at: subDays(new Date(), 3).toISOString(),
        completed_at: subDays(new Date(), 1).toISOString(),
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-3',
    household_id: 'household-1',
    title: 'Grocery shopping',
    description: 'Weekly grocery run - check shared list',
    due_date: addDays(new Date(), 3).toISOString(),
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    category: 'shopping',
    status: 'pending',
    created_by: 'user-2',
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [
      {
        id: 'assignment-3',
        assigned_to: 'user-4',
        assigned_to_name: 'Jordan Smith',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=jordan',
        assigned_at: subDays(new Date(), 5).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: [
      {
        id: 'swap-1',
        task_id: 'task-3',
        from_user_id: 'user-4',
        to_user_id: 'user-1',
        status: 'pending',
        notes: 'Can you take this? I have a work meeting',
        requested_at: subDays(new Date(), 1).toISOString(),
        responded_at: null,
      }
    ]
  },
  {
    id: 'task-4',
    household_id: 'household-1',
    title: 'Vacuum living room',
    description: null,
    due_date: addDays(new Date(), 5).toISOString(),
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: null,
    category: 'cleaning',
    status: 'overdue',
    created_by: 'user-3',
    created_at: subDays(new Date(), 10).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
    assignments: [
      {
        id: 'assignment-4',
        assigned_to: 'user-1',
        assigned_to_name: 'Alex Johnson',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=alex',
        assigned_at: subDays(new Date(), 10).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: []
  }
];

// Mock bills
export const bills = [
  {
    id: 'bill-1',
    household_id: 'household-1',
    title: 'Electric Bill - March',
    description: 'Monthly electricity bill',
    total_amount: '125.50',
    currency: 'USD',
    due_date: addDays(new Date(), 10).toISOString().split('T')[0],
    paid_date: null,
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'pending',
    paid_by: 'user-1',
    paid_by_name: 'Alex Johnson',
    created_by: 'user-1',
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-1',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '31.38',
        paid_date: subDays(new Date(), 3).toISOString(),
      },
      {
        id: 'split-2',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez', 
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-3',
        user_id: 'user-3',
        user_name: 'Casey Chen',
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '31.38',
        paid_date: subDays(new Date(), 1).toISOString(),
      },
      {
        id: 'split-4',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '31.36',
        percentage: null,
        paid_amount: '0.00', 
        paid_date: null,
      }
    ]
  },
  {
    id: 'bill-2',
    household_id: 'household-1',
    title: 'Internet Bill',
    description: 'Monthly fiber internet service',
    total_amount: '89.99',
    currency: 'USD',
    due_date: addDays(new Date(), 15).toISOString().split('T')[0],
    paid_date: null,
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'pending',
    paid_by: 'user-2',
    paid_by_name: 'Sam Rodriguez',
    created_by: 'user-2',
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-5',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-6',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez',
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '22.50',
        paid_date: subDays(new Date(), 2).toISOString(),
      },
      {
        id: 'split-7',
        user_id: 'user-3',
        user_name: 'Casey Chen', 
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-8',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '22.49',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      }
    ]
  },
  {
    id: 'bill-3',
    household_id: 'household-1',
    title: 'Grocery Receipt - Walmart',
    description: 'Weekly groceries and household items',
    total_amount: '156.78',
    currency: 'USD',
    due_date: new Date().toISOString().split('T')[0],
    paid_date: null,
    is_recurring: false,
    recurrence_pattern: null,
    category: 'groceries',
    status: 'pending',
    paid_by: 'user-4',
    paid_by_name: 'Jordan Smith',
    created_by: 'user-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-9',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-10',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-11',
        user_id: 'user-3',
        user_name: 'Casey Chen',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-12',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '39.18',
        percentage: null,
        paid_amount: '156.78',
        paid_date: new Date().toISOString(),
      }
    ]
  }
];

// Mock messages
export const messages = [
  {
    id: 'message-1',
    household_id: 'household-1',
    user_id: 'user-2',
    user_name: 'Sam Rodriguez',
    user_avatar: 'https://i.pravatar.cc/150?u=sam',
    content: 'Hey everyone! Just paid the internet bill 💸',
    message_type: 'text',
    replied_to: null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'message-2',
    household_id: 'household-1',
    user_id: 'user-3',
    user_name: 'Casey Chen',
    user_avatar: 'https://i.pravatar.cc/150?u=casey',
    content: 'Thanks Sam! I\'ll send you my portion tomorrow',
    message_type: 'text',
    replied_to: 'message-1',
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 2, { hours: 1 }).toISOString(),
    updated_at: subDays(new Date(), 2, { hours: 1 }).toISOString(),
  },
  {
    id: 'message-3',
    household_id: 'household-1',
    user_id: 'user-1',
    user_name: 'Alex Johnson',
    user_avatar: 'https://i.pravatar.cc/150?u=alex',
    content: 'What should we have for dinner this week?',
    message_type: 'poll',
    replied_to: null,
    poll: {
      id: 'poll-1',
      question: 'What should we have for dinner this week?',
      options: ['Pizza night', 'Taco Tuesday', 'Homemade pasta', 'Order takeout'],
      multiple_choice: true,
      expires_at: addDays(new Date(), 3).toISOString(),
      votes: [
        {
          user_id: 'user-1',
          user_name: 'Alex Johnson',
          user_avatar: 'https://i.pravatar.cc/150?u=alex',
          selected_options: [0, 2],
          voted_at: subDays(new Date(), 1).toISOString(),
        },
        {
          user_id: 'user-3',
          user_name: 'Casey Chen',
          user_avatar: 'https://i.pravatar.cc/150?u=casey',
          selected_options: [1, 3],
          voted_at: subDays(new Date(), 1, { hours: 2 }).toISOString(),
        }
      ],
      vote_counts: [1, 1, 1, 1],
      total_votes: 2,
    },
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'message-4',
    household_id: 'household-1',
    user_id: 'user-4',
    user_name: 'Jordan Smith',
    user_avatar: 'https://i.pravatar.cc/150?u=jordan',
    content: 'Can someone swap grocery duty with me this week? Work is crazy 😅',
    message_type: 'text',
    replied_to: null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 0, { hours: 3 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 3 }).toISOString(),
  },
  {
    id: 'message-5',
    household_id: 'household-1',
    user_id: 'user-1',
    user_name: 'Alex Johnson',
    user_avatar: 'https://i.pravatar.cc/150?u=alex',
    content: 'I can take it! No problem 👍',
    message_type: 'text',
    replied_to: 'message-4',
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
  }
];

// Mock notifications
export const notifications = [
  {
    id: 'notification-1',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'New Task Assignment',
    message: 'You have been assigned to "Vacuum living room"',
    type: 'task_assigned',
    related_id: 'task-4',
    related_table: 'tasks',
    read_at: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'notification-2',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'Bill Reminder',
    message: 'Electric Bill - March is due in 3 days',
    type: 'bill_due',
    related_id: 'bill-1',
    related_table: 'bills',
    read_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
    created_at: subDays(new Date(), 0, { hours: 6 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
  },
  {
    id: 'notification-3',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'Task Swap Request',
    message: 'Jordan Smith wants to swap "Grocery shopping" with you',
    type: 'swap_request',
    related_id: 'swap-1',
    related_table: 'task_swaps',
    read_at: null,
    created_at: subDays(new Date(), 0, { hours: 1 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 1 }).toISOString(),
  }
];

// Mock household settings
export const householdSettings = {
  default_currency: 'USD',
  task_reminder_days: 1,
  bill_reminder_days: 3,
  auto_assign_tasks: false,
  require_task_photos: false,
};

// Generate dashboard data
export const generateDashboardData = () => {
  const outstandingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;
  const totalBalanceOwed = bills.reduce((sum, bill) => {
    const userSplit = bill.splits.find(s => s.user_id === currentUser.id);
    if (userSplit) {
      const owed = parseFloat(userSplit.amount_owed) - parseFloat(userSplit.paid_amount);
      return sum + (owed > 0 ? owed : 0);
    }
    return sum;
  }, 0);

  const upcomingDeadlines = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    const weekFromNow = addDays(new Date(), 7);
    return dueDate <= weekFromNow && t.status === 'pending';
  }).length;

  return {
    kpis: {
      outstanding_tasks: outstandingTasks,
      total_balance_owed: totalBalanceOwed.toFixed(2),
      upcoming_deadlines: upcomingDeadlines,
      recent_activity_count: messages.length,
    },
    calendar_events: [
      ...tasks.filter(t => t.due_date).map(task => ({
        id: task.id,
        title: task.title,
        date: task.due_date.split('T')[0],
        type: 'task',
        amount: null,
        assigned_to: task.assignments[0]?.assigned_to_name || null,
      })),
      ...bills.filter(b => b.due_date).map(bill => ({
        id: bill.id,
        title: bill.title,
        date: bill.due_date,
        type: 'bill',
        amount: bill.total_amount,
        assigned_to: null,
      }))
    ],
    recent_activity: messages.slice(0, 5).map(msg => ({
      id: msg.id,
      type: msg.message_type,
      message: `${msg.user_name}: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
      timestamp: msg.created_at,
      user: {
        name: msg.user_name,
        avatar_url: msg.user_avatar,
      },
    })),
  };
};

// Calculate household balances
export const generateBalances = () => {
  const memberBalances = householdMembers.map(member => {
    const totalOwed = bills.reduce((sum, bill) => {
      const split = bill.splits.find(s => s.user_id === member.user_id);
      return split ? sum + parseFloat(split.amount_owed) : sum;
    }, 0);

    const totalPaid = bills.reduce((sum, bill) => {
      const split = bill.splits.find(s => s.user_id === member.user_id);
      return split ? sum + parseFloat(split.paid_amount) : sum;
    }, 0);

    return {
      user_id: member.user_id,
      user_name: member.full_name,
      avatar_url: member.avatar_url,
      total_owed: totalOwed.toFixed(2),
      total_paid: totalPaid.toFixed(2),
      net_balance: (totalPaid - totalOwed).toFixed(2),
    };
  });

  const summary = memberBalances.reduce((acc, balance) => {
    const netBalance = parseFloat(balance.net_balance);
    if (netBalance > 0) {
      acc.total_owed_to_household += netBalance;
    } else {
      acc.total_owed_by_household += Math.abs(netBalance);
    }
    return acc;
  }, {
    total_owed_to_household: 0,
    total_owed_by_household: 0,
  });

  summary.net_balance = summary.total_owed_to_household - summary.total_owed_by_household;

  return {
    summary: {
      total_owed_to_household: summary.total_owed_to_household.toFixed(2),
      total_owed_by_household: summary.total_owed_by_household.toFixed(2), 
      net_balance: summary.net_balance.toFixed(2),
    },
    member_balances: memberBalances,
    recent_transactions: bills.flatMap(bill => 
      bill.splits
        .filter(split => split.paid_date)
        .map(split => ({
          id: uuidv4(),
          bill_title: bill.title,
          user_name: split.user_name,
          amount: split.paid_amount,
          paid_date: split.paid_date,
        }))
    ).sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date)).slice(0, 10),
  };
};
EOF

# ============================================================================
# MOCK SERVER MAIN FILE
# ============================================================================

echo -e "${PURPLE}🚀 Creating main server file...${NC}"

cat > "$MOCK_SRC/server.js" << 'EOF'
/**
 * Homey Mock Server
 * In-memory development server with realistic data
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import householdRoutes from './routes/households.js';
import taskRoutes from './routes/tasks.js';
import billRoutes from './routes/bills.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';

// Import middleware
import { mockAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { responseFormatter } from './middleware/responseFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MOCK_PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock auth middleware (bypasses real auth)
app.use(mockAuth);

// Response formatter
app.use(responseFormatter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'mock',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', authRoutes); // Profile routes are in auth
app.use('/api/invite', authRoutes); // Invite routes are in auth
app.use('/api/households', householdRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/households/:householdId/messages', chatRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/polls', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      details: {
        method: req.method,
        path: req.path,
        available_routes: [
          '/health',
          '/api/auth/*',
          '/api/households/*',
          '/api/tasks/*',
          '/api/bills/*',
          '/api/messages/*',
          '/api/notifications/*',
        ],
      },
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🎭 Homey Mock Server Running!

📍 Server: http://localhost:${PORT}
🔧 Health: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api

🚀 Features:
   ✅ Bypassed authentication (always authenticated as Alex)
   ✅ Full CRUD operations for all resources
   ✅ Realistic mock data with relationships
   ✅ Real-time simulation (polling-based)
   ✅ File upload simulation
   ✅ Error scenarios and validation

🏠 Mock Data:
   👥 4 Users in "Downtown Loft" household
   ✅ 4 Tasks (1 completed, 1 overdue)
   💰 3 Bills with payment tracking
   💬 5 Chat messages with polls
   🔔 3 Notifications

💡 Tips:
   - All API endpoints match your production schema
   - Use any email/password for login (bypassed)
   - Data resets on server restart
   - Check console for request logs
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
EOF

# ============================================================================
# MIDDLEWARE
# ============================================================================

echo -e "${PURPLE}🔧 Creating middleware...${NC}"

# Auth middleware (bypasses real auth)
cat > "$MOCK_SRC/middleware/auth.js" << 'EOF'
/**
 * Mock Auth Middleware
 * Bypasses authentication and sets current user
 */

import { currentUser } from '../data/mockData.js';

export const mockAuth = (req, res, next) => {
  // Always set the current user (bypassing auth)
  req.user = currentUser;
  req.authenticated = true;
  
  // Add mock authorization header if not present
  if (!req.headers.authorization) {
    req.headers.authorization = 'Bearer mock-token-123';
  }
  
  next();
};

export const requireAdmin = (req, res, next) => {
  // In mock mode, always allow admin actions
  req.isAdmin = true;
  next();
};
EOF

# Error handler middleware
cat > "$MOCK_SRC/middleware/errorHandler.js" << 'EOF'
/**
 * Error Handler Middleware
 * Handles and formats errors consistently
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error response
  let status = 500;
  let errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      details: {},
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.message = err.message;
  } else if (err.name === 'NotFoundError') {
    status = 404;
    errorResponse.error.code = 'NOT_FOUND';
    errorResponse.error.message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    errorResponse.error.code = 'UNAUTHORIZED';
    errorResponse.error.message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    errorResponse.error.code = 'FORBIDDEN';
    errorResponse.error.message = 'Access denied';
  }

  // Add request ID for debugging
  if (req.headers['x-request-id']) {
    errorResponse.error.request_id = req.headers['x-request-id'];
  }

  res.status(status).json(errorResponse);
};

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
EOF

# Response formatter middleware
cat > "$MOCK_SRC/middleware/responseFormatter.js" << 'EOF'
/**
 * Response Formatter Middleware
 * Ensures consistent API response format
 */

export const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to format responses
  res.json = function(data) {
    // If data is already in API format, return as-is
    if (data && (data.data !== undefined || data.error !== undefined)) {
      return originalJson.call(this, data);
    }

    // Format successful responses
    const formattedResponse = {
      data,
      message: res.locals.message || null,
      meta: res.locals.meta || null,
    };

    return originalJson.call(this, formattedResponse);
  };

  // Helper methods for responses
  res.success = function(data, message = null, meta = null) {
    return this.json({
      data,
      message,
      meta,
    });
  };

  res.error = function(code, message, details = null, status = 400) {
    this.status(status);
    return this.json({
      error: {
        code,
        message,
        details,
      },
    });
  };

  next();
};
EOF

# ============================================================================
# UTILITIES
# ============================================================================

echo -e "${PURPLE}🛠️  Creating utilities...${NC}"

cat > "$MOCK_SRC/utils/helpers.js" << 'EOF'
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
EOF

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

echo -e "${PURPLE}🔐 Creating authentication routes...${NC}"

cat > "$MOCK_SRC/routes/auth.js" << 'EOF'
/**
 * Authentication Routes
 * Handles auth, profile, and invitation endpoints
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  currentUser, 
  users, 
  households, 
  householdMembers 
} from '../data/mockData.js';
import { delay, generateFakeUser } from '../utils/helpers.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Auth endpoints (bypassed but maintained for compatibility)
router.post('/login', async (req, res) => {
  await delay(500); // Simulate auth delay
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.error('VALIDATION_ERROR', 'Email and password are required', null, 400);
  }

  // Always succeed in mock mode
  res.success({
    access_token: 'mock-access-token-' + Date.now(),
    refresh_token: 'mock-refresh-token-' + Date.now(),
    user: currentUser,
    expires_in: 3600,
  }, 'Login successful');
});

router.post('/refresh', async (req, res) => {
  await delay(200);
  
  res.success({
    access_token: 'mock-access-token-' + Date.now(),
    refresh_token: 'mock-refresh-token-' + Date.now(),
    user: currentUser,
    expires_in: 3600,
  });
});

router.post('/logout', async (req, res) => {
  await delay(100);
  res.success({ success: true }, 'Logged out successfully');
});

// Profile endpoints
router.get('/', async (req, res) => {
  await delay(100);
  res.success(currentUser);
});

router.put('/', async (req, res) => {
  await delay(300);
  
  const { full_name, phone, avatar_url } = req.body;
  
  // Update current user data
  if (full_name) currentUser.full_name = full_name;
  if (phone) currentUser.phone = phone;
  if (avatar_url) currentUser.avatar_url = avatar_url;
  
  currentUser.updated_at = new Date().toISOString();
  
  res.success(currentUser, 'Profile updated successfully');
});

router.post('/avatar', async (req, res) => {
  await delay(1000); // Simulate file upload
  
  // Simulate avatar upload
  const avatarUrl = `https://mock-cdn.homey.app/avatars/${uuidv4()}.jpg`;
  currentUser.avatar_url = avatarUrl;
  currentUser.updated_at = new Date().toISOString();
  
  res.success({ avatar_url: avatarUrl }, 'Avatar uploaded successfully');
});

// Invitation endpoints
router.post('/validate', async (req, res) => {
  await delay(200);
  
  const { invite_code } = req.body;
  
  if (!invite_code) {
    return res.error('VALIDATION_ERROR', 'Invite code is required', null, 400);
  }
  
  // Find household by invite code
  const household = households.find(h => h.invite_code === invite_code);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Invalid invite code', null, 404);
  }
  
  res.success({
    household: {
      id: household.id,
      name: household.name,
      member_count: household.member_count,
      max_members: household.max_members,
    },
    valid: true,
  });
});

router.post('/join', async (req, res) => {
  await delay(500);
  
  const { invite_code } = req.body;
  
  if (!invite_code) {
    return res.error('VALIDATION_ERROR', 'Invite code is required', null, 400);
  }
  
  const household = households.find(h => h.invite_code === invite_code);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Invalid invite code', null, 404);
  }
  
  // Check if user is already a member
  const existingMember = householdMembers.find(
    m => m.user_id === currentUser.id && m.household_id === household.id
  );
  
  if (existingMember) {
    return res.error('CONFLICT', 'You are already a member of this household', null, 409);
  }
  
  // Add user to household
  const newMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: 'member',
    joined_at: new Date().toISOString(),
  };
  
  householdMembers.push(newMember);
  household.member_count++;
  
  res.success({
    household_id: household.id,
    role: 'member',
    joined_at: newMember.joined_at,
  }, 'Successfully joined household');
});

// Password reset (mock endpoints)
router.post('/reset-password', async (req, res) => {
  await delay(1000);
  const { email } = req.body;
  
  if (!email) {
    return res.error('VALIDATION_ERROR', 'Email is required', null, 400);
  }
  
  res.success({ success: true }, 'Password reset email sent');
});

router.post('/reset-password/confirm', async (req, res) => {
  await delay(500);
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.error('VALIDATION_ERROR', 'Token and password are required', null, 400);
  }
  
  res.success({ success: true }, 'Password reset successfully');
});

// Account management
router.delete('/account', async (req, res) => {
  await delay(1000);
  res.success({ success: true }, 'Account deleted successfully');
});

router.post('/change-password', async (req, res) => {
  await delay(500);
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return res.error('VALIDATION_ERROR', 'Current and new passwords are required', null, 400);
  }
  
  res.success({ success: true }, 'Password changed successfully');
});

router.get('/verify', async (req, res) => {
  await delay(100);
  res.success({ 
    valid: true, 
    user: currentUser 
  });
});

export default router;
EOF

# ============================================================================
# HOUSEHOLD ROUTES
# ============================================================================

echo -e "${PURPLE}🏠 Creating household routes...${NC}"

cat > "$MOCK_SRC/routes/households.js" << 'EOF'
/**
 * Household Routes
 * Handles household management, members, and settings
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  households, 
  householdMembers, 
  householdSettings,
  currentUser,
  generateDashboardData,
  generateBalances
} from '../data/mockData.js';
import { delay, validateRequired, generateFakeUser } from '../utils/helpers.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all households for current user
router.get('/', async (req, res) => {
  await delay(200);
  
  // Filter households where user is a member
  const userHouseholds = households.filter(household => 
    householdMembers.some(member => 
      member.user_id === currentUser.id && member.household_id === household.id
    )
  );
  
  res.success(userHouseholds);
});

// Create new household
router.post('/', async (req, res) => {
  await delay(500);
  
  const { name, max_members = 5, address, lease_start_date, lease_end_date, data_retention_days = 365 } = req.body;
  
  try {
    validateRequired(req.body, ['name']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (max_members < 2 || max_members > 20) {
    return res.error('VALIDATION_ERROR', 'Max members must be between 2 and 20', null, 400);
  }
  
  const newHousehold = {
    id: uuidv4(),
    name,
    max_members,
    address: address || null,
    lease_start_date: lease_start_date || null,
    lease_end_date: lease_end_date || null,
    admin_id: currentUser.id,
    invite_code: generateInviteCode(),
    member_count: 1,
    data_retention_days,
    role: 'admin',
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Add admin as first member
  const adminMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: 'admin',
    joined_at: new Date().toISOString(),
  };
  
  households.push(newHousehold);
  householdMembers.push(adminMember);
  
  res.success(newHousehold, 'Household created successfully');
});

// Get specific household
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  res.success(household);
});

// Update household
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      household[key] = req.body[key];
    }
  });
  
  household.updated_at = new Date().toISOString();
  
  res.success(household, 'Household updated successfully');
});

// Delete household
router.delete('/:id', async (req, res) => {
  await delay(500);
  
  const householdIndex = households.findIndex(h => h.id === req.params.id);
  
  if (householdIndex === -1) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  // Remove household and its members
  households.splice(householdIndex, 1);
  const memberIndicesToRemove = [];
  householdMembers.forEach((member, index) => {
    if (member.household_id === req.params.id) {
      memberIndicesToRemove.push(index);
    }
  });
  
  // Remove members in reverse order to maintain indices
  memberIndicesToRemove.reverse().forEach(index => {
    householdMembers.splice(index, 1);
  });
  
  res.success({ success: true }, 'Household deleted successfully');
});

// Get household members
router.get('/:id/members', async (req, res) => {
  await delay(150);
  
  const members = householdMembers.filter(m => m.household_id === req.params.id);
  res.success(members);
});

// Generate invite code
router.post('/:id/invite', async (req, res) => {
  await delay(200);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  const newInviteCode = generateInviteCode();
  household.invite_code = newInviteCode;
  household.updated_at = new Date().toISOString();
  
  res.success({
    invite_code: newInviteCode,
    invite_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${newInviteCode}`,
expires_at: null, // Mock: codes don't expire
  }, 'Invite code generated successfully');
});

// Remove member
router.delete('/:id/members/:userId', async (req, res) => {
  await delay(300);
  
  const memberIndex = householdMembers.findIndex(
    m => m.household_id === req.params.id && m.user_id === req.params.userId
  );
  
  if (memberIndex === -1) {
    return res.error('NOT_FOUND', 'Member not found', null, 404);
  }
  
  householdMembers.splice(memberIndex, 1);
  
  // Update member count
  const household = households.find(h => h.id === req.params.id);
  if (household) {
    household.member_count--;
  }
  
  res.success({ success: true }, 'Member removed successfully');
});

// Leave household
router.post('/:id/leave', async (req, res) => {
  await delay(400);
  
  const { transfer_admin_to } = req.body;
  
  const memberIndex = householdMembers.findIndex(
    m => m.household_id === req.params.id && m.user_id === currentUser.id
  );
  
  if (memberIndex === -1) {
    return res.error('NOT_FOUND', 'You are not a member of this household', null, 404);
  }
  
  const household = households.find(h => h.id === req.params.id);
  
  // If user is admin and there are other members, transfer admin role
  if (household && household.admin_id === currentUser.id && transfer_admin_to) {
    household.admin_id = transfer_admin_to;
    const newAdmin = householdMembers.find(
      m => m.household_id === req.params.id && m.user_id === transfer_admin_to
    );
    if (newAdmin) {
      newAdmin.role = 'admin';
    }
  }
  
  householdMembers.splice(memberIndex, 1);
  
  if (household) {
    household.member_count--;
  }
  
  res.success({ success: true }, 'Left household successfully');
});

// Get household settings
router.get('/:id/settings', async (req, res) => {
  await delay(100);
  res.success(householdSettings);
});

// Update household settings
router.put('/:id/settings', async (req, res) => {
  await delay(200);
  
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      householdSettings[key] = req.body[key];
    }
  });
  
  res.success(householdSettings, 'Settings updated successfully');
});

// Get dashboard data
router.get('/:id/dashboard', async (req, res) => {
  await delay(300);
  
  const dashboardData = generateDashboardData();
  res.success(dashboardData);
});

// Get household balances
router.get('/:id/balances', async (req, res) => {
  await delay(250);
  
  const balances = generateBalances();
  res.success(balances);
});

// Get specific user balance
router.get('/:id/balances/:userId', async (req, res) => {
  await delay(150);
  
  const balances = generateBalances();
  const userBalance = balances.member_balances.find(b => b.user_id === req.params.userId);
  
  if (!userBalance) {
    return res.error('NOT_FOUND', 'User balance not found', null, 404);
  }
  
  res.success({
    total_owed: userBalance.total_owed,
    total_paid: userBalance.total_paid,
    net_balance: userBalance.net_balance,
  });
});

// Settle balance between users
router.post('/:id/balances/settle', async (req, res) => {
  await delay(500);
  
  const { from_user_id, to_user_id, amount } = req.body;
  
  try {
    validateRequired(req.body, ['from_user_id', 'to_user_id', 'amount']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // In a real app, this would update the actual balances
  // For mock, we just simulate success
  res.success({ success: true }, `Settlement of ${amount} processed successfully`);
});

// Helper function to generate invite codes
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default router;
EOF

# ============================================================================
# TASK ROUTES
# ============================================================================

echo -e "${PURPLE}✅ Creating task routes...${NC}"

cat > "$MOCK_SRC/routes/tasks.js" << 'EOF'
/**
 * Task Routes
 * Handles task management, assignments, and swaps
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  tasks, 
  householdMembers, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get tasks for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    assigned_to, 
    category, 
    due_after, 
    due_before,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter tasks by household
  let householdTasks = tasks.filter(t => t.household_id === householdId);
  
  // Apply filters
  const filters = { status, assigned_to, category, due_after, due_before };
  householdTasks = filterItems(householdTasks, filters);
  
  // Handle assigned_to filter specially
  if (assigned_to) {
    householdTasks = householdTasks.filter(task => 
      task.assignments.some(assignment => assignment.assigned_to === assigned_to)
    );
  }
  
  // Sort tasks
  householdTasks = sortItems(householdTasks, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdTasks, page, limit);
  
  res.success(paginatedResult);
});

// Create new task
router.post('/', async (req, res) => {
  await delay(400);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    due_date, 
    is_recurring = false, 
    recurrence_pattern, 
    recurrence_interval,
    category,
    assigned_to = []
  } = req.body;
  
  try {
    validateRequired(req.body, ['title']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (is_recurring && !recurrence_pattern) {
    return res.error('VALIDATION_ERROR', 'Recurrence pattern required for recurring tasks', null, 400);
  }
  
  const newTask = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    due_date: due_date || null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    recurrence_interval: recurrence_interval || null,
    category: category || null,
    status: 'pending',
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [],
    swap_requests: [],
  };
  
  // Create assignments
  if (assigned_to.length > 0) {
    newTask.assignments = assigned_to.map(userId => {
      const member = householdMembers.find(m => m.user_id === userId);
      return {
        id: uuidv4(),
        assigned_to: userId,
        assigned_to_name: member?.full_name || 'Unknown User',
        assigned_to_avatar: member?.avatar_url || null,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      };
    });
  }
  
  tasks.push(newTask);
  
  res.success(newTask, 'Task created successfully');
});

// Get specific task
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  res.success(task);
});

// Update task
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const task = tasks[taskIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      task[key] = req.body[key];
    }
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success(task, 'Task updated successfully');
});

// Delete task
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  tasks.splice(taskIndex, 1);
  
  res.success({ success: true }, 'Task deleted successfully');
});

// Assign task to users
router.post('/:id/assign', async (req, res) => {
  await delay(250);
  
  const { user_ids } = req.body;
  
  if (!user_ids || !Array.isArray(user_ids)) {
    return res.error('VALIDATION_ERROR', 'user_ids array is required', null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Clear existing assignments and create new ones
  task.assignments = user_ids.map(userId => {
    const member = householdMembers.find(m => m.user_id === userId);
    return {
      id: uuidv4(),
      assigned_to: userId,
      assigned_to_name: member?.full_name || 'Unknown User',
      assigned_to_avatar: member?.avatar_url || null,
      assigned_at: new Date().toISOString(),
      completed_at: null,
    };
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Task assigned successfully');
});

// Mark task as complete
router.put('/:id/complete', async (req, res) => {
  await delay(200);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'completed';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as completed
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
  }, 'Task completed successfully');
});

// Mark task as incomplete
router.put('/:id/uncomplete', async (req, res) => {
  await delay(150);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'pending';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as incomplete
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = null;
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: null,
    completed_by: currentUser.id,
  }, 'Task marked as incomplete');
});

// Complete task with photo
router.post('/:id/complete/with-photo', async (req, res) => {
  await delay(1000); // Simulate photo upload
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'task-completion.jpg',
    size: 1024000,
    mimetype: 'image/jpeg'
  });
  
  task.status = 'completed';
  task.completion_photo = uploadResult.url;
  task.updated_at = new Date().toISOString();
  
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
    photo_url: uploadResult.url,
  }, 'Task completed with photo');
});

// Request task swap
router.post('/:id/swap/request', async (req, res) => {
  await delay(300);
  
  const { to_user_id, notes } = req.body;
  
  try {
    validateRequired(req.body, ['to_user_id']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const swapRequest = {
    id: uuidv4(),
    task_id: req.params.id,
    from_user_id: currentUser.id,
    to_user_id,
    status: 'pending',
    notes: notes || null,
    requested_at: new Date().toISOString(),
    responded_at: null,
  };
  
  task.swap_requests.push(swapRequest);
  task.updated_at = new Date().toISOString();
  
  res.success(swapRequest, 'Swap request created successfully');
});

// Accept swap request
router.put('/swaps/:swapId/accept', async (req, res) => {
  await delay(250);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'accepted';
  foundSwap.responded_at = new Date().toISOString();
  
  // Update task assignment
  const fromAssignment = foundTask.assignments.find(a => a.assigned_to === foundSwap.from_user_id);
  const toMember = householdMembers.find(m => m.user_id === foundSwap.to_user_id);
  
  if (fromAssignment && toMember) {
    fromAssignment.assigned_to = foundSwap.to_user_id;
    fromAssignment.assigned_to_name = toMember.full_name;
    fromAssignment.assigned_to_avatar = toMember.avatar_url;
    fromAssignment.assigned_at = new Date().toISOString();
  }
  
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request accepted');
});

// Decline swap request
router.put('/swaps/:swapId/decline', async (req, res) => {
  await delay(200);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'declined';
  foundSwap.responded_at = new Date().toISOString();
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request declined');
});

// Get task swaps for household
router.get('/swaps', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const swaps = [];
  tasks.filter(t => t.household_id === householdId).forEach(task => {
    task.swap_requests.forEach(swap => {
      const fromMember = householdMembers.find(m => m.user_id === swap.from_user_id);
      const toMember = householdMembers.find(m => m.user_id === swap.to_user_id);
      
      swaps.push({
        id: swap.id,
        task: {
          id: task.id,
          title: task.title,
          due_date: task.due_date,
        },
        from_user: {
          id: swap.from_user_id,
          name: fromMember?.full_name || 'Unknown',
          avatar_url: fromMember?.avatar_url || null,
        },
        to_user: {
          id: swap.to_user_id,
          name: toMember?.full_name || 'Unknown',
          avatar_url: toMember?.avatar_url || null,
        },
        status: swap.status,
        notes: swap.notes,
        requested_at: swap.requested_at,
      });
    });
  });
  
  res.success(swaps);
});

// Bulk operations
router.post('/bulk-complete', async (req, res) => {
  await delay(500);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let completed_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.updated_at = new Date().toISOString();
      completed_count++;
    }
  });
  
  res.success({ 
    success: true, 
    completed_count 
  }, `${completed_count} tasks completed`);
});

router.post('/bulk-assign', async (req, res) => {
  await delay(400);
  
  const { task_ids, user_id } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids) || !user_id) {
    return res.error('VALIDATION_ERROR', 'task_ids array and user_id are required', null, 400);
  }
  
  const member = householdMembers.find(m => m.user_id === user_id);
  let assigned_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task && member) {
      task.assignments = [{
        id: uuidv4(),
        assigned_to: user_id,
        assigned_to_name: member.full_name,
        assigned_to_avatar: member.avatar_url,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      }];
      task.updated_at = new Date().toISOString();
      assigned_count++;
    }
  });
  
  res.success({ 
    success: true, 
    assigned_count 
  }, `${assigned_count} tasks assigned`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove tasks in reverse order to maintain indices
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (task_ids.includes(tasks[i].id)) {
      tasks.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} tasks deleted`);
});

export default router;
EOF

# Continue with Bills routes...
echo -e "${PURPLE}💰 Creating bill routes...${NC}"

cat > "$MOCK_SRC/routes/bills.js" << 'EOF'
/**
 * Bill Routes  
 * Handles bill management, payments, and balance tracking
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  bills, 
  householdMembers, 
  currentUser,
  generateBalances
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get bills for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    paid_by, 
    category, 
    amount_min, 
    amount_max,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter bills by household
  let householdBills = bills.filter(b => b.household_id === householdId);
  
  // Apply filters
  const filters = { status, paid_by, category, amount_min, amount_max };
  householdBills = filterItems(householdBills, filters);
  
  // Sort bills
  householdBills = sortItems(householdBills, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdBills, page, limit);
  
  res.success(paginatedResult);
});

// Create new bill
router.post('/', async (req, res) => {
  await delay(500);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    total_amount, 
    currency = 'USD', 
    due_date, 
    is_recurring = false, 
    recurrence_pattern,
    category,
    splits
  } = req.body;
  
  try {
    validateRequired(req.body, ['title', 'total_amount', 'due_date', 'splits']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(splits) || splits.length === 0) {
    return res.error('VALIDATION_ERROR', 'At least one bill split is required', null, 400);
  }
  
  // Validate splits
  const hasPercentages = splits.some(s => s.percentage !== undefined);
  const hasAmounts = splits.some(s => s.amount_owed !== undefined);
  
  if (hasPercentages && hasAmounts) {
    return res.error('VALIDATION_ERROR', 'Cannot mix percentage and amount-based splits', null, 400);
  }
  
  const newBill = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    total_amount: parseFloat(total_amount).toFixed(2),
    currency,
    due_date,
    paid_date: null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    category: category || null,
    status: 'pending',
    paid_by: currentUser.id,
    paid_by_name: currentUser.full_name,
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    splits: [],
  };
  
  // Create splits
  newBill.splits = splits.map(split => {
    const member = householdMembers.find(m => m.user_id === split.user_id);
    return {
      id: uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || '0.00',
      percentage: split.percentage || null,
      paid_amount: '0.00',
      paid_date: null,
    };
  });
  
  bills.push(newBill);
  
  res.success(newBill, 'Bill created successfully');
});

// Get specific bill
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill);
});

// Update bill
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const bill = bills[billIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      bill[key] = req.body[key];
    }
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill, 'Bill updated successfully');
});

// Delete bill
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  bills.splice(billIndex, 1);
  
  res.success({ success: true }, 'Bill deleted successfully');
});

// Get bill splits
router.get('/:id/splits', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill.splits);
});

// Update bill splits
router.put('/:id/split', async (req, res) => {
  await delay(300);
  
  const { splits } = req.body;
  
  if (!Array.isArray(splits)) {
    return res.error('VALIDATION_ERROR', 'splits array is required', null, 400);
  }
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Update splits
  bill.splits = splits.map(split => {
    const existingSplit = bill.splits.find(s => s.user_id === split.user_id);
    const member = householdMembers.find(m => m.user_id === split.user_id);
    
    return {
      id: existingSplit?.id || uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || existingSplit?.amount_owed || '0.00',
      percentage: split.percentage || existingSplit?.percentage || null,
      paid_amount: existingSplit?.paid_amount || '0.00',
      paid_date: existingSplit?.paid_date || null,
    };
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill.splits, 'Bill splits updated successfully');
});

// Record payment for bill split
router.post('/splits/:splitId/payment', async (req, res) => {
  await delay(400);
  
  const { amount, paid_date } = req.body;
  
  try {
    validateRequired(req.body, ['amount']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Find the split across all bills
  let foundSplit = null;
  let foundBill = null;
  
  for (const bill of bills) {
    const split = bill.splits.find(s => s.id === req.params.splitId);
    if (split) {
      foundSplit = split;
      foundBill = bill;
      break;
    }
  }
  
  if (!foundSplit) {
    return res.error('NOT_FOUND', 'Bill split not found', null, 404);
  }
  
  const paymentAmount = parseFloat(amount);
  const currentPaid = parseFloat(foundSplit.paid_amount);
  const newPaidAmount = currentPaid + paymentAmount;
  const amountOwed = parseFloat(foundSplit.amount_owed);
  
  foundSplit.paid_amount = newPaidAmount.toFixed(2);
  foundSplit.paid_date = paid_date || new Date().toISOString();
  
  // Update bill status if fully paid
  const allSplitsPaid = foundBill.splits.every(split => 
    parseFloat(split.paid_amount) >= parseFloat(split.amount_owed)
  );
  
  if (allSplitsPaid) {
    foundBill.status = 'paid';
    foundBill.paid_date = new Date().toISOString().split('T')[0];
  }
  
  foundBill.updated_at = new Date().toISOString();
  
  res.success({
    split_id: foundSplit.id,
    amount_paid: paymentAmount.toFixed(2),
    paid_date: foundSplit.paid_date,
    remaining_balance: Math.max(0, amountOwed - newPaidAmount).toFixed(2),
  }, 'Payment recorded successfully');
});

// Upload receipt for bill
router.post('/:id/receipt', async (req, res) => {
  await delay(1000); // Simulate file upload
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'receipt.pdf',
    size: 512000,
    mimetype: 'application/pdf'
  });
  
  bill.receipt_url = uploadResult.url;
  bill.updated_at = new Date().toISOString();
  
  res.success({ 
    receipt_url: uploadResult.url 
  }, 'Receipt uploaded successfully');
});

// Get payment history for bill
router.get('/:id/payments', async (req, res) => {
  await delay(150);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const payments = bill.splits
    .filter(split => split.paid_date)
    .map(split => ({
      id: uuidv4(),
      user_name: split.user_name,
      amount: split.paid_amount,
      paid_date: split.paid_date,
      payment_method: 'Mock Payment',
    }))
    .sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
  
  res.success(payments);
});

// Bulk operations
router.post('/bulk-mark-paid', async (req, res) => {
  await delay(500);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let marked_count = 0;
  
  bill_ids.forEach(billId => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      bill.status = 'paid';
      bill.paid_date = new Date().toISOString().split('T')[0];
      bill.updated_at = new Date().toISOString();
      
      // Mark all splits as paid
      bill.splits.forEach(split => {
        split.paid_amount = split.amount_owed;
        split.paid_date = new Date().toISOString();
      });
      
      marked_count++;
    }
  });
  
  res.success({ 
    success: true, 
    marked_count 
  }, `${marked_count} bills marked as paid`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove bills in reverse order to maintain indices
  for (let i = bills.length - 1; i >= 0; i--) {
    if (bill_ids.includes(bills[i].id)) {
      bills.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} bills deleted`);
});

// Bill statistics
router.get('/statistics', async (req, res) => {
  await delay(250);
  
  const { householdId } = req.params;
  const { period = 'month' } = req.query;
  
  const householdBills = bills.filter(b => b.household_id === householdId);
  
  const totalAmount = householdBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  const paidAmount = householdBills
    .filter(b => b.status === 'paid')
    .reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  
  const categoryBreakdown = householdBills.reduce((acc, bill) => {
    const category = bill.category || 'other';
    acc[category] = (parseFloat(acc[category]) || 0) + parseFloat(bill.total_amount);
    return acc;
  }, {});
  
  // Convert to strings for consistency
  Object.keys(categoryBreakdown).forEach(key => {
    categoryBreakdown[key] = categoryBreakdown[key].toFixed(2);
  });
  
  res.success({
    total_bills: householdBills.length,
    total_amount: totalAmount.toFixed(2),
    paid_amount: paidAmount.toFixed(2),
    outstanding_amount: (totalAmount - paidAmount).toFixed(2),
    average_bill_amount: householdBills.length > 0 ? (totalAmount / householdBills.length).toFixed(2) : '0.00',
    category_breakdown: categoryBreakdown,
    payment_trends: [
      { month: 'January', amount: '450.00' },
      { month: 'February', amount: '523.50' },
      { month: 'March', amount: '489.75' },
    ],
  });
});

export default router;
EOF

# ============================================================================
# CHAT ROUTES
# ============================================================================

echo -e "${PURPLE}💬 Creating chat routes...${NC}"

cat > "$MOCK_SRC/routes/chat.js" << 'EOF'
/**
 * Chat Routes
 * Handles messaging, polls, and chat functionality
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  messages, 
  currentUser,
  householdMembers
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router({ mergeParams: true });

// Get messages for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    before, 
    after, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter messages by household
  let householdMessages = messages.filter(m => m.household_id === householdId);
  
  // Apply filters
  const filters = { type, before, after };
  householdMessages = filterItems(householdMessages, filters);
  
  // Sort messages
  householdMessages = sortItems(householdMessages, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdMessages, page, limit);
  
  res.success(paginatedResult);
});

// Send message
router.post('/', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { content, message_type = 'text', replied_to, poll } = req.body;
  
  try {
    validateRequired(req.body, ['content']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (message_type === 'poll' && !poll) {
    return res.error('VALIDATION_ERROR', 'Poll data required for poll message type', null, 400);
  }
  
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content,
    message_type,
    replied_to: replied_to || null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Create poll if message type is poll
  if (message_type === 'poll' && poll) {
    newMessage.poll = {
      id: uuidv4(),
      question: poll.question,
      options: poll.options,
      multiple_choice: poll.multiple_choice || false,
      expires_at: poll.expires_at || null,
      votes: [],
      vote_counts: new Array(poll.options.length).fill(0),
      total_votes: 0,
    };
  }
  
  messages.unshift(newMessage); // Add to beginning for latest-first order
  
  res.success(newMessage, 'Message sent successfully');
});

// Get specific message
router.get('/:messageId', async (req, res) => {
  await delay(100);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  res.success(message);
});

// Edit message
router.put('/:messageId', async (req, res) => {
  await delay(200);
  
  const { content } = req.body;
  
  if (!content) {
    return res.error('VALIDATION_ERROR', 'Content is required', null, 400);
  }
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only edit your own messages', null, 403);
  }
  
  message.content = content;
  message.edited_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success(message, 'Message updated successfully');
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  await delay(150);
  
  const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
  
  if (messageIndex === -1) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  const message = messages[messageIndex];
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only delete your own messages', null, 403);
  }
  
  // Soft delete - mark as deleted
  message.deleted_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message deleted successfully');
});

// Upload file/image
router.post('/upload', async (req, res) => {
  await delay(1500); // Simulate file upload
  
  const { householdId } = req.params;
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-file.jpg',
    size: 2048000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with file
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || 'Shared a file',
    message_type: 'text',
    replied_to: null,
    poll: null,
    file_url: uploadResult.url,
    file_name: uploadResult.filename,
    file_size: uploadResult.size,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'File uploaded and shared successfully');
});

router.post('/upload-image', async (req, res) => {
  await delay(1200); // Simulate image upload
  
  const { householdId } = req.params;
  
  // Simulate image upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-image.jpg',
    size: 1536000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with image
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || '📷 Shared an image',
    message_type: 'text',
    replied_to: null,
    poll: null,
    image_url: uploadResult.url,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'Image uploaded and shared successfully');
});

// Vote on poll
router.post('/:pollId/vote', async (req, res) => {
  await delay(250);
  
  const { selected_options } = req.body;
  
  try {
    validateRequired(req.body, ['selected_options']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(selected_options)) {
    return res.error('VALIDATION_ERROR', 'selected_options must be an array', null, 400);
  }
  
  // Find poll in messages
  let foundPoll = null;
  let foundMessage = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      foundMessage = message;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  // Check if poll has expired
  if (foundPoll.expires_at && new Date(foundPoll.expires_at) < new Date()) {
    return res.error('BAD_REQUEST', 'Poll has expired', null, 400);
  }
  
  // Remove existing vote from this user
  foundPoll.votes = foundPoll.votes.filter(vote => vote.user_id !== currentUser.id);
  
  // Add new vote
  const newVote = {
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    selected_options,
    voted_at: new Date().toISOString(),
  };
  
  foundPoll.votes.push(newVote);
  
  // Update vote counts
  foundPoll.vote_counts = new Array(foundPoll.options.length).fill(0);
  foundPoll.votes.forEach(vote => {
    vote.selected_options.forEach(optionIndex => {
      if (optionIndex >= 0 && optionIndex < foundPoll.vote_counts.length) {
        foundPoll.vote_counts[optionIndex]++;
      }
    });
  });
  
  foundPoll.total_votes = foundPoll.votes.length;
  foundMessage.updated_at = new Date().toISOString();
  
  res.success({
    poll_id: foundPoll.id,
    user_id: currentUser.id,
    selected_options,
    voted_at: newVote.voted_at,
    updated_vote_counts: foundPoll.vote_counts,
  }, 'Vote recorded successfully');
});

// Get poll results
router.get('/:pollId/results', async (req, res) => {
  await delay(100);
  
  // Find poll in messages
  let foundPoll = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  res.success(foundPoll);
});

// Search messages
router.get('/search', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { 
    q: query, 
    type, 
    user_id, 
    before, 
    after, 
    limit = 20 
  } = req.query;
  
  if (!query) {
    return res.error('VALIDATION_ERROR', 'Search query (q) is required', null, 400);
  }
  
  let results = messages.filter(m => 
    m.household_id === householdId && 
    m.content.toLowerCase().includes(query.toLowerCase()) &&
    !m.deleted_at
  );
  
  // Apply additional filters
  if (type) {
    results = results.filter(m => m.message_type === type);
  }
  
  if (user_id) {
    results = results.filter(m => m.user_id === user_id);
  }
  
  if (before) {
    results = results.filter(m => new Date(m.created_at) < new Date(before));
  }
  
  if (after) {
    results = results.filter(m => new Date(m.created_at) > new Date(after));
  }
  
  // Sort by relevance (simple: most recent first)
  results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Limit results
  results = results.slice(0, parseInt(limit));
  
  res.success({
    data: results,
    meta: {
      query,
      total_results: results.length,
      limit: parseInt(limit),
    },
  });
});

// Typing indicator (mock endpoint)
router.post('/typing', async (req, res) => {
  // This would typically be handled via WebSocket
  // For mock, just acknowledge
  res.success({ success: true });
});

// Pin/unpin message
router.post('/:messageId/pin', async (req, res) => {
  await delay(200);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = true;
  message.pinned_at = new Date().toISOString();
  message.pinned_by = currentUser.id;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message pinned successfully');
});

router.delete('/:messageId/pin', async (req, res) => {
  await delay(150);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = false;
  message.pinned_at = null;
  message.pinned_by = null;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message unpinned successfully');
});

// Get pinned messages
router.get('/pinned', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const pinnedMessages = messages.filter(m => 
    m.household_id === householdId && m.pinned && !m.deleted_at
  );
  
  res.success(pinnedMessages);
});

// Chat statistics
router.get('/statistics', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { period = 'week' } = req.query;
  
  const householdMessages = messages.filter(m => m.household_id === householdId && !m.deleted_at);
  
  const messagesByUser = householdMessages.reduce((acc, msg) => {
    acc[msg.user_id] = (acc[msg.user_id] || 0) + 1;
    return acc;
  }, {});
  
  const activeUsers = Object.keys(messagesByUser).length;
  
  // Mock daily message counts
  const messagesByDay = [
    { date: '2024-01-15', count: 12 },
    { date: '2024-01-16', count: 8 },
    { date: '2024-01-17', count: 15 },
    { date: '2024-01-18', count: 6 },
    { date: '2024-01-19', count: 11 },
  ];
  
  res.success({
    total_messages: householdMessages.length,
    active_users: activeUsers,
    messages_by_user: messagesByUser,
    messages_by_day: messagesByDay,
    popular_reactions: [
      { emoji: '👍', count: 23 },
      { emoji: '😂', count: 18 },
      { emoji: '❤️', count: 15 },
    ],
  });
});

export default router;
EOF

# ============================================================================
# NOTIFICATION ROUTES
# ============================================================================

echo -e "${PURPLE}🔔 Creating notification routes...${NC}"

cat > "$MOCK_SRC/routes/notifications.js" << 'EOF'
/**
 * Notification Routes
 * Handles notifications and device registration
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  notifications, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired 
} from '../utils/helpers.js';

const router = express.Router();

// Mock device tokens storage
let deviceTokens = [];

// Get notifications for current user
router.get('/', async (req, res) => {
  await delay(200);
  
  const { 
    page = 1, 
    limit = 50, 
    read, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter notifications for current user
  let userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  
  // Apply filters
  const filters = { type };
  if (read !== undefined) {
    if (read === 'true') {
      userNotifications = userNotifications.filter(n => n.read_at !== null);
    } else if (read === 'false') {
      userNotifications = userNotifications.filter(n => n.read_at === null);
    }
  }
  
  userNotifications = filterItems(userNotifications, filters);
  
  // Sort notifications
  userNotifications = sortItems(userNotifications, sort_by, sort_order);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => n.user_id === currentUser.id && n.read_at === null).length;
  
  // Paginate
  const paginatedResult = paginate(userNotifications, page, limit);
  
  // Add unread count to meta
  paginatedResult.meta.unread_count = unreadCount;
  
  res.success(paginatedResult);
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  await delay(150);
  
  const notification = notifications.find(n => n.id === req.params.id && n.user_id === currentUser.id);
  
  if (!notification) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notification.read_at = new Date().toISOString();
  notification.updated_at = new Date().toISOString();
  
  res.success({
    id: notification.id,
    read_at: notification.read_at,
  }, 'Notification marked as read');
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  await delay(300);
  
  let marked_count = 0;
  
  notifications.forEach(notification => {
    if (notification.user_id === currentUser.id && !notification.read_at) {
      notification.read_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();
      marked_count++;
    }
  });
  
  res.success({
    marked_read_count: marked_count,
  }, `${marked_count} notifications marked as read`);
});

// Delete notification
router.delete('/:id', async (req, res) => {
  await delay(150);
  
  const notificationIndex = notifications.findIndex(n => 
    n.id === req.params.id && n.user_id === currentUser.id
  );
  
  if (notificationIndex === -1) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notifications.splice(notificationIndex, 1);
  
  res.success({ success: true }, 'Notification deleted successfully');
});

// Delete all read notifications
router.delete('/read', async (req, res) => {
  await delay(400);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    const notification = notifications[i];
    if (notification.user_id === currentUser.id && notification.read_at) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} read notifications deleted`);
});

// Delete all notifications
router.delete('/', async (req, res) => {
  await delay(500);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    if (notifications[i].user_id === currentUser.id) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} notifications deleted`);
});

// Register device for push notifications
router.post('/device', async (req, res) => {
  await delay(300);
  
  const { token, platform, active = true } = req.body;
  
  try {
    validateRequired(req.body, ['token', 'platform']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Check if device already exists
  const existingDevice = deviceTokens.find(d => d.token === token);
  
  if (existingDevice) {
    existingDevice.active = active;
    existingDevice.last_used = new Date().toISOString();
  } else {
    const newDevice = {
      id: uuidv4(),
      user_id: currentUser.id,
      token,
      platform,
      active,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    };
    deviceTokens.push(newDevice);
  }
  
  res.success({ success: true }, 'Device registered for push notifications');
});

// Unregister device
router.delete('/device/:token', async (req, res) => {
  await delay(200);
  
  const tokenIndex = deviceTokens.findIndex(d => 
    d.token === req.params.token && d.user_id === currentUser.id
  );
  
  if (tokenIndex === -1) {
    return res.error('NOT_FOUND', 'Device token not found', null, 404);
  }
  
  deviceTokens.splice(tokenIndex, 1);
  
  res.success({ success: true }, 'Device unregistered successfully');
});

// Get registered devices
router.get('/devices', async (req, res) => {
  await delay(150);
  
 const userDevices = deviceTokens
    .filter(d => d.user_id === currentUser.id)
    .map(device => ({
      id: device.id,
      platform: device.platform,
      created_at: device.created_at,
      last_used: device.last_used,
      active: device.active,
    }));
  
  res.success(userDevices);
});

// Update device status
router.patch('/devices/:deviceId', async (req, res) => {
  await delay(200);
  
  const { active } = req.body;
  
  const device = deviceTokens.find(d => 
    d.id === req.params.deviceId && d.user_id === currentUser.id
  );
  
  if (!device) {
    return res.error('NOT_FOUND', 'Device not found', null, 404);
  }
  
  if (active !== undefined) {
    device.active = active;
    device.last_used = new Date().toISOString();
  }
  
  res.success({ success: true }, 'Device updated successfully');
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  await delay(100);
  
  // Mock preferences
  const preferences = {
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    bill_reminders: true,
    chat_messages: true,
    household_updates: true,
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '07:00',
    },
  };
  
  res.success(preferences);
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  await delay(250);
  
  // In a real app, preferences would be stored in database
  // For mock, just acknowledge the update
  res.success({ success: true }, 'Notification preferences updated successfully');
});

// Send notification (admin/system use)
router.post('/send', async (req, res) => {
  await delay(400);
  
  const { user_ids, title, message, type, related_id, related_table } = req.body;
  
  try {
    validateRequired(req.body, ['user_ids', 'title', 'message', 'type']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(user_ids)) {
    return res.error('VALIDATION_ERROR', 'user_ids must be an array', null, 400);
  }
  
  let sent_count = 0;
  
  user_ids.forEach(userId => {
    const newNotification = {
      id: uuidv4(),
      user_id: userId,
      household_id: 'system', // System notification
      title,
      message,
      type,
      related_id: related_id || null,
      related_table: related_table || null,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    notifications.unshift(newNotification);
    sent_count++;
  });
  
  res.success({
    success: true,
    sent_count,
  }, `Notification sent to ${sent_count} users`);
});

// Send household notification
router.post('/:householdId/notifications/send', async (req, res) => {
  await delay(500);
  
  const { householdId } = req.params;
  const { title, message, type, related_id, related_table } = req.body;
  
  try {
    validateRequired(req.body, ['title', 'message', 'type']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // In a real app, would get all household members
  // For mock, just send to current user
  const newNotification = {
    id: uuidv4(),
    user_id: currentUser.id,
    household_id: householdId,
    title,
    message,
    type,
    related_id: related_id || null,
    related_table: related_table || null,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  notifications.unshift(newNotification);
  
  res.success({
    success: true,
    sent_count: 1,
  }, 'Household notification sent');
});

// Bulk mark as read
router.post('/bulk-read', async (req, res) => {
  await delay(300);
  
  const { notification_ids } = req.body;
  
  if (!notification_ids || !Array.isArray(notification_ids)) {
    return res.error('VALIDATION_ERROR', 'notification_ids array is required', null, 400);
  }
  
  let marked_count = 0;
  
  notifications.forEach(notification => {
    if (
      notification_ids.includes(notification.id) && 
      notification.user_id === currentUser.id &&
      !notification.read_at
    ) {
      notification.read_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();
      marked_count++;
    }
  });
  
  res.success({
    success: true,
    marked_count,
  }, `${marked_count} notifications marked as read`);
});

// Bulk delete
router.post('/bulk-delete', async (req, res) => {
  await delay(400);
  
  const { notification_ids } = req.body;
  
  if (!notification_ids || !Array.isArray(notification_ids)) {
    return res.error('VALIDATION_ERROR', 'notification_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    const notification = notifications[i];
    if (
      notification_ids.includes(notification.id) && 
      notification.user_id === currentUser.id
    ) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    success: true,
    deleted_count,
  }, `${deleted_count} notifications deleted`);
});

// Get notification statistics
router.get('/statistics', async (req, res) => {
  await delay(200);
  
  const userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read_at).length;
  
  const notificationsByType = userNotifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {});
  
  // Mock daily notification counts
  const notificationsByDay = [
    { date: '2024-01-15', count: 3 },
    { date: '2024-01-16', count: 1 },
    { date: '2024-01-17', count: 2 },
    { date: '2024-01-18', count: 0 },
    { date: '2024-01-19', count: 1 },
  ];
  
  res.success({
    total_notifications: userNotifications.length,
    unread_count: unreadCount,
    notifications_by_type: notificationsByType,
    notifications_by_day: notificationsByDay,
    average_response_time: 320, // Mock: 320 seconds
  });
});

// Test notification
router.post('/test', async (req, res) => {
  await delay(1000);
  
  const { platform } = req.body;
  
  if (!platform) {
    return res.error('VALIDATION_ERROR', 'Platform is required', null, 400);
  }
  
  // Create test notification
  const testNotification = {
    id: uuidv4(),
    user_id: currentUser.id,
    household_id: 'test',
    title: '🧪 Test Notification',
    message: `This is a test ${platform} notification from Homey!`,
    type: 'test',
    related_id: null,
    related_table: null,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  notifications.unshift(testNotification);
  
  res.success({ success: true }, `Test ${platform} notification sent`);
});

// Get delivery status (mock)
router.get('/:id/delivery-status', async (req, res) => {
  await delay(150);
  
  const notification = notifications.find(n => 
    n.id === req.params.id && n.user_id === currentUser.id
  );
  
  if (!notification) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  // Mock delivery status
  res.success({
    sent_at: notification.created_at,
    delivered_at: notification.created_at, // Mock: delivered immediately
    read_at: notification.read_at,
    failed_at: null,
    error_message: null,
  });
});

export default router;
EOF

# ============================================================================
# RESET DATA UTILITY
# ============================================================================

echo -e "${PURPLE}🔄 Creating reset data utility...${NC}"

cat > "$MOCK_SRC/utils/resetData.js" << 'EOF'
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
EOF

# ============================================================================
# README FOR MOCK SERVER
# ============================================================================

echo -e "${PURPLE}📚 Creating mock server documentation...${NC}"

cat > "$MOCK_DIR/README.md" << 'EOF'
# Homey Mock Server

A comprehensive mock server for Homey app development with realistic data and full API compatibility.

## Features

- 🔐 **Bypassed Authentication** - Always authenticated as Alex Johnson
- 🏠 **Complete Household Management** - CRUD operations for households, members, settings
- ✅ **Task Management** - Tasks, assignments, swaps, completion tracking
- 💰 **Bill & Expense Tracking** - Bills, splits, payments, balance calculations
- 💬 **Real-time Chat** - Messages, polls, file uploads, search
- 🔔 **Notifications** - Push notifications, device registration, preferences
- 📊 **Dashboard Data** - KPIs, calendar events, activity feeds
- 📱 **Mobile-Optimized** - File uploads, realistic delays, error scenarios

## Quick Start

1. **Install dependencies:**
   ```bash
   cd mock-server
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Update your frontend:**
   ```typescript
   // In your .env.local or vite config
   VITE_API_BASE_URL=http://localhost:8000
   ```

## Mock Data

The server includes realistic mock data:

- **4 Users** in "Downtown Loft" household
- **4 Tasks** (1 completed, 1 overdue, 1 with swap request)
- **3 Bills** with payment tracking and splits
- **5 Chat Messages** including polls and replies
- **3 Notifications** (1 unread task assignment, 1 bill reminder, 1 swap request)

## API Endpoints

All endpoints match your production schema:

### Authentication (Bypassed)
- `POST /api/auth/login` - Always succeeds
- `POST /api/auth/refresh` - Always succeeds
- `GET /api/profile` - Returns Alex Johnson profile
- `PUT /api/profile` - Updates profile data

### Households
- `GET /api/households` - List user households
- `POST /api/households` - Create household
- `GET /api/households/:id` - Get household details
- `GET /api/households/:id/members` - List members
- `GET /api/households/:id/dashboard` - Dashboard data
- `GET /api/households/:id/balances` - Financial balances

### Tasks
- `GET /api/households/:id/tasks` - List tasks (with filters)
- `POST /api/households/:id/tasks` - Create task
- `PUT /api/tasks/:id/complete` - Mark complete
- `POST /api/tasks/:id/swap/request` - Request swap
- `PUT /api/task-swaps/:id/accept` - Accept swap

### Bills
- `GET /api/households/:id/bills` - List bills (with filters)
- `POST /api/households/:id/bills` - Create bill
- `POST /api/bill-splits/:id/payment` - Record payment
- `GET /api/households/:id/balances` - Get balances

### Chat
- `GET /api/households/:id/messages` - Get messages
- `POST /api/households/:id/messages` - Send message
- `POST /api/polls/:id/vote` - Vote on poll
- `POST /api/households/:id/messages/upload` - Upload file

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/device` - Register device

## Features

### Realistic Delays
- Authentication: 500ms
- Data fetching: 100-300ms
- File uploads: 1000-1500ms
- Complex operations: 400-500ms

### Error Scenarios
The server handles validation errors, not found errors, and other edge cases realistically.

### File Upload Simulation
File uploads return realistic URLs and metadata without actually storing files.

### Real-time Simulation
While not using WebSockets, the server maintains state across requests to simulate real-time updates.

## Development Tips

1. **Data Persistence**: Data persists during server runtime but resets on restart
2. **Always Authenticated**: No need to handle auth errors - you're always logged in as Alex
3. **Realistic Responses**: All responses match your TypeScript interfaces exactly
4. **Error Testing**: Trigger validation errors by sending invalid data
5. **Performance Testing**: The server includes realistic delays for mobile testing

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start with auto-reload
- `npm run reset` - Reset all data to initial state

## Environment Variables

- `MOCK_PORT` - Server port (default: 8000)
- `FRONTEND_URL` - Frontend URL for invite links (default: http://localhost:3000)

## API Client Integration

Your existing API client will work seamlessly:

```typescript
// No changes needed to your API client
import { api } from '@/lib/api';

// All endpoints work as expected
const households = await api.households.getHouseholds();
const tasks = await api.tasks.getTasks(householdId);
```

## Health Check

Visit `http://localhost:8000/health` to verify the server is running.

---

🎭 **Happy Development!** Your mock server provides a complete backend experience for rapid frontend development.
EOF

# ============================================================================
# NPM INSTALL SCRIPT
# ============================================================================

echo -e "${PURPLE}📦 Creating setup script...${NC}"

cat > "$MOCK_DIR/setup.sh" << 'EOF'
#!/bin/bash

# Homey Mock Server Setup
echo "🎭 Setting up Homey Mock Server..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Mock server setup complete!"
echo ""
echo "🚀 Start the server with:"
echo "   npm start      (production)"
echo "   npm run dev    (development with auto-reload)"
echo ""
echo "📍 Server will run at: http://localhost:8000"
echo "🔧 Health check: http://localhost:8000/health"
echo ""
echo "💡 Update your frontend env:"
echo "   VITE_API_BASE_URL=http://localhost:8000"
EOF

chmod +x "$MOCK_DIR/setup.sh"

# ============================================================================
# UPDATE MAIN PROJECT
# ============================================================================

echo -e "${PURPLE}🔧 Updating main project...${NC}"

# Add mock server script to main package.json
if [ -f "package.json" ]; then
    # Check if mock script already exists
    if ! grep -q '"mock"' package.json; then
        # Add mock script (simple approach - in production you might want to use jq)
        sed -i 's/"scripts": {/"scripts": {\n    "mock": "cd mock-server \&\& npm run dev",/' package.json
        echo -e "${GREEN}✅ Added 'mock' script to main package.json${NC}"
    else
        echo -e "${YELLOW}⚠️  'mock' script already exists in package.json${NC}"
    fi
fi

# Create .env.example update
cat >> ".env.example" << 'EOF'

# Mock Server (Development)
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_SERVER=true
EOF

# ============================================================================
# COMPLETION MESSAGE
# ============================================================================

echo ""
echo -e "${GREEN}🎉 Mock Server Generation Complete!${NC}"
echo ""
echo -e "${BLUE}📁 Generated Structure:${NC}"
echo -e "   📦 mock-server/"
echo -e "   ├── 📄 package.json - Dependencies and scripts"
echo -e "   ├── 📄 README.md - Complete documentation"
echo -e "   ├── 🔧 setup.sh - Setup script"
echo -e "   └── 📁 src/"
echo -e "       ├── 📄 server.js - Main server file"
echo -e "       ├── 📁 data/mockData.js - Realistic mock data"
echo -e "       ├── 📁 routes/ - API route handlers"
echo -e "       │   ├── 📄 auth.js - Authentication (bypassed)"
echo -e "       │   ├── 📄 households.js - Household management"
echo -e "       │   ├── 📄 tasks.js - Task operations"
echo -e "       │   ├── 📄 bills.js - Bill & expense management"
echo -e "       │   ├── 📄 chat.js - Messaging & polls"
echo -e "       │   └── 📄 notifications.js - Notifications"
echo -e "       ├── 📁 middleware/ - Auth, errors, formatting"
echo -e "       └── 📁 utils/ - Helpers and utilities"
echo ""
echo -e "${BLUE}🎭 Mock Server Features:${NC}"
echo -e "   ✅ Bypassed authentication (always logged in as Alex)"
echo -e "   ✅ Complete API compatibility with your production schema"
echo -e "   ✅ Realistic mock data with relationships"
echo -e "   ✅ File upload simulation"
echo -e "   ✅ Error scenarios and validation"
echo -e "   ✅ Realistic response delays"
echo -e "   ✅ Full CRUD operations for all resources"
echo -e "   ✅ Dashboard data generation"
echo -e "   ✅ Balance calculations"
echo -e "   ✅ Search and filtering"
echo -e "   ✅ Bulk operations"
echo ""
echo -e "${BLUE}🚀 Quick Start:${NC}"
echo -e "${GREEN}   1. Set up mock server:${NC}"
echo -e "      cd mock-server && npm install"
echo -e ""
echo -e "${GREEN}   2. Start mock server:${NC}"
echo -e "      npm start           # Production mode"
echo -e "      npm run dev         # Development mode"
echo -e ""
echo -e "${GREEN}   3. Update your frontend:${NC}"
echo -e "      # Add to .env.local"
echo -e "      VITE_API_BASE_URL=http://localhost:8000"
echo -e ""
echo -e "${GREEN}   4. Use from main project:${NC}"
echo -e "      npm run mock        # Starts mock server"
echo -e ""
echo -e "${BLUE}📊 Mock Data Includes:${NC}"
echo -e "   👥 4 Users in \"Downtown Loft\" household"
echo -e "   🏠 2 Households with member management"
echo -e "   ✅ 4 Tasks (1 completed, 1 overdue, 1 swap request)"
echo -e "   💰 3 Bills with splits and payment tracking"
echo -e "   💬 5 Chat messages with polls and replies"
echo -e "   🔔 3 Notifications (unread assignments, reminders)"
echo -e "   ⚙️  Complete household settings"
echo -e "   📈 Dashboard KPIs and calendar events"
echo ""
echo -e "${BLUE}🔧 Perfect For:${NC}"
echo -e "   🎨 UI/UX development without backend dependencies"
echo -e "   📱 Mobile testing with realistic data"
echo -e "   🚀 Rapid prototyping and feature development"
echo -e "   🧪 Frontend testing and validation"
echo -e "   👥 Demo and stakeholder presentations"
echo ""
echo -e "${GREEN}✨ Your mock server is ready for immediate use!${NC}"
echo -e "${BLUE}🔗 Server will run at: http://localhost:8000${NC}"
echo -e "${BLUE}🔧 Health check: http://localhost:8000/health${NC}"router.post('/splits/:splitId/payment', async (req, res) => {
  await delay(400);
  
  const { amount, paid_date } = req.body;
  
  try {
    validateRequired(req.body, ['amount']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Find the split across all bills
  let foundSplit = null;
  let foundBill = null;
  
  for (const bill of bills) {
    const split = bill.splits.find(s => s.id === req.params.splitId);
    if (split) {
      foundSplit = split;
      foundBill = bill;
      break;
    }
  }
  
  if (!foundSplit) {
    return res.error('NOT_FOUND', 'Bill split not found', null, 404);
  }
  
  const paymentAmount = parseFloat(amount);
  const currentPaid = parseFloat(foundSplit.paid_amount);
  const newPaidAmount = currentPaid + paymentAmount;
  const amountOwed = parseFloat(foundSplit.amount_owed);
  
  foundSplit.paid_amount = newPaidAmount.toFixed(2);
  foundSplit.paid_date = paid_date || new Date().toISOString();
  
  // Update bill status if fully paid
  const allSplitsPaid = foundBill.splits.every(split => 
    parseFloat(split.paid_amount) >= parseFloat(split.amount_owed)
  );
  
  if (allSplitsPaid) {
    foundBill.status = 'paid';
    foundBill.paid_date = new Date().toISOString().split('T')[0];
  }
  
  foundBill.updated_at = new Date().toISOString();
  
  res.success({
    split_id: foundSplit.id,
    amount_paid: paymentAmount.toFixed(2),
    paid_date: foundSplit.paid_date,
    remaining_balance: Math.max(0, amountOwed - newPaidAmount).toFixed(2),
  }, 'Payment recorded successfully');
});

// Upload receipt for bill
router.post('/:id/receipt', async (req, res) => {
  await delay(1000); // Simulate file upload
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'receipt.pdf',
    size: 512000,
    mimetype: 'application/pdf'
  });
  
  bill.receipt_url = uploadResult.url;
  bill.updated_at = new Date().toISOString();
  
  res.success({ 
    receipt_url: uploadResult.url 
  }, 'Receipt uploaded successfully');
});

// Get payment history for bill
router.get('/:id/payments', async (req, res) => {
  await delay(150);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const payments = bill.splits
    .filter(split => split.paid_date)
    .map(split => ({
      id: uuidv4(),
      user_name: split.user_name,
      amount: split.paid_amount,
      paid_date: split.paid_date,
      payment_method: 'Mock Payment',
    }))
    .sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date));
  
  res.success(payments);
});

// Bulk operations
router.post('/bulk-mark-paid', async (req, res) => {
  await delay(500);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let marked_count = 0;
  
  bill_ids.forEach(billId => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      bill.status = 'paid';
      bill.paid_date = new Date().toISOString().split('T')[0];
      bill.updated_at = new Date().toISOString();
      
      // Mark all splits as paid
      bill.splits.forEach(split => {
        split.paid_amount = split.amount_owed;
        split.paid_date = new Date().toISOString();
      });
      
      marked_count++;
    }
  });
  
  res.success({ 
    success: true, 
    marked_count 
  }, `${marked_count} bills marked as paid`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { bill_ids } = req.body;
  
  if (!bill_ids || !Array.isArray(bill_ids)) {
    return res.error('VALIDATION_ERROR', 'bill_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove bills in reverse order to maintain indices
  for (let i = bills.length - 1; i >= 0; i--) {
    if (bill_ids.includes(bills[i].id)) {
      bills.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} bills deleted`);
});

// Bill statistics
router.get('/statistics', async (req, res) => {
  await delay(250);
  
  const { householdId } = req.params;
  const { period = 'month' } = req.query;
  
  const householdBills = bills.filter(b => b.household_id === householdId);
  
  const totalAmount = householdBills.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  const paidAmount = householdBills
    .filter(b => b.status === 'paid')
    .reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
  
  const categoryBreakdown = householdBills.reduce((acc, bill) => {
    const category = bill.category || 'other';
    acc[category] = (parseFloat(acc[category]) || 0) + parseFloat(bill.total_amount);
    return acc;
  }, {});
  
  // Convert to strings for consistency
  Object.keys(categoryBreakdown).forEach(key => {
    categoryBreakdown[key] = categoryBreakdown[key].toFixed(2);
  });
  
  res.success({
    total_bills: householdBills.length,
    total_amount: totalAmount.toFixed(2),
    paid_amount: paidAmount.toFixed(2),
    outstanding_amount: (totalAmount - paidAmount).toFixed(2),
    average_bill_amount: householdBills.length > 0 ? (totalAmount / householdBills.length).toFixed(2) : '0.00',
    category_breakdown: categoryBreakdown,
    payment_trends: [
      { month: 'January', amount: '450.00' },
      { month: 'February', amount: '523.50' },
      { month: 'March', amount: '489.75' },
    ],
  });
});

export default router;
EOF

# ============================================================================
# CHAT ROUTES
# ============================================================================

echo -e "${PURPLE}💬 Creating chat routes...${NC}"

cat > "$MOCK_SRC/routes/chat.js" << 'EOF'
/**
 * Chat Routes
 * Handles messaging, polls, and chat functionality
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  messages, 
  currentUser,
  householdMembers
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router({ mergeParams: true });

// Get messages for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    before, 
    after, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter messages by household
  let householdMessages = messages.filter(m => m.household_id === householdId);
  
  // Apply filters
  const filters = { type, before, after };
  householdMessages = filterItems(householdMessages, filters);
  
  // Sort messages
  householdMessages = sortItems(householdMessages, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdMessages, page, limit);
  
  res.success(paginatedResult);
});

// Send message
router.post('/', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { content, message_type = 'text', replied_to, poll } = req.body;
  
  try {
    validateRequired(req.body, ['content']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (message_type === 'poll' && !poll) {
    return res.error('VALIDATION_ERROR', 'Poll data required for poll message type', null, 400);
  }
  
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content,
    message_type,
    replied_to: replied_to || null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Create poll if message type is poll
  if (message_type === 'poll' && poll) {
    newMessage.poll = {
      id: uuidv4(),
      question: poll.question,
      options: poll.options,
      multiple_choice: poll.multiple_choice || false,
      expires_at: poll.expires_at || null,
      votes: [],
      vote_counts: new Array(poll.options.length).fill(0),
      total_votes: 0,
    };
  }
  
  messages.unshift(newMessage); // Add to beginning for latest-first order
  
  res.success(newMessage, 'Message sent successfully');
});

// Get specific message
router.get('/:messageId', async (req, res) => {
  await delay(100);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  res.success(message);
});

// Edit message
router.put('/:messageId', async (req, res) => {
  await delay(200);
  
  const { content } = req.body;
  
  if (!content) {
    return res.error('VALIDATION_ERROR', 'Content is required', null, 400);
  }
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only edit your own messages', null, 403);
  }
  
  message.content = content;
  message.edited_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success(message, 'Message updated successfully');
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  await delay(150);
  
  const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
  
  if (messageIndex === -1) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  const message = messages[messageIndex];
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only delete your own messages', null, 403);
  }
  
  // Soft delete - mark as deleted
  message.deleted_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message deleted successfully');
});

// Upload file/image
router.post('/upload', async (req, res) => {
  await delay(1500); // Simulate file upload
  
  const { householdId } = req.params;
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-file.jpg',
    size: 2048000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with file
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || 'Shared a file',
    message_type: 'text',
    replied_to: null,
    poll: null,
    file_url: uploadResult.url,
    file_name: uploadResult.filename,
    file_size: uploadResult.size,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'File uploaded and shared successfully');
});

router.post('/upload-image', async (req, res) => {
  await delay(1200); // Simulate image upload
  
  const { householdId } = req.params;
  
  // Simulate image upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-image.jpg',
    size: 1536000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with image
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || '📷 Shared an image',
    message_type: 'text',
    replied_to: null,
    poll: null,
    image_url: uploadResult.url,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'Image uploaded and shared successfully');
});

// Vote on poll
router.post('/:pollId/vote', async (req, res) => {
  await delay(250);
  
  const { selected_options } = req.body;
  
  try {
    validateRequired(req.body, ['selected_options']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(selected_options)) {
    return res.error('VALIDATION_ERROR', 'selected_options must be an array', null, 400);
  }
  
  // Find poll in messages
  let foundPoll = null;
  let foundMessage = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      foundMessage = message;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  // Check if poll has expired
  if (foundPoll.expires_at && new Date(foundPoll.expires_at) < new Date()) {
    return res.error('BAD_REQUEST', 'Poll has expired', null, 400);
  }
  
  // Remove existing vote from this user
  foundPoll.votes = foundPoll.votes.filter(vote => vote.user_id !== currentUser.id);
  
  // Add new vote
  const newVote = {
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    selected_options,
    voted_at: new Date().toISOString(),
  };
  
  foundPoll.votes.push(newVote);
  
  // Update vote counts
  foundPoll.vote_counts = new Array(foundPoll.options.length).fill(0);
  foundPoll.votes.forEach(vote => {
    vote.selected_options.forEach(optionIndex => {
      if (optionIndex >= 0 && optionIndex < foundPoll.vote_counts.length) {
        foundPoll.vote_counts[optionIndex]++;
      }
    });
  });
  
  foundPoll.total_votes = foundPoll.votes.length;
  foundMessage.updated_at = new Date().toISOString();
  
  res.success({
    poll_id: foundPoll.id,
    user_id: currentUser.id,
    selected_options,
    voted_at: newVote.voted_at,
    updated_vote_counts: foundPoll.vote_counts,
  }, 'Vote recorded successfully');
});

// Get poll results
router.get('/:pollId/results', async (req, res) => {
  await delay(100);
  
  // Find poll in messages
  let foundPoll = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  res.success(foundPoll);
});

// Search messages
router.get('/search', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { 
    q: query, 
    type, 
    user_id, 
    before, 
    after, 
    limit = 20 
  } = req.query;
  
  if (!query) {
    return res.error('VALIDATION_ERROR', 'Search query (q) is required', null, 400);
  }
  
  let results = messages.filter(m => 
    m.household_id === householdId && 
    m.content.toLowerCase().includes(query.toLowerCase()) &&
    !m.deleted_at
  );
  
  // Apply additional filters
  if (type) {
    results = results.filter(m => m.message_type === type);
  }
  
  if (user_id) {
    results = results.filter(m => m.user_id === user_id);
  }
  
  if (before) {
    results = results.filter(m => new Date(m.created_at) < new Date(before));
  }
  
  if (after) {
    results = results.filter(m => new Date(m.created_at) > new Date(after));
  }
  
  // Sort by relevance (simple: most recent first)
  results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Limit results
  results = results.slice(0, parseInt(limit));
  
  res.success({
    data: results,
    meta: {
      query,
      total_results: results.length,
      limit: parseInt(limit),
    },
  });
});

// Typing indicator (mock endpoint)
router.post('/typing', async (req, res) => {
  // This would typically be handled via WebSocket
  // For mock, just acknowledge
  res.success({ success: true });
});

// Pin/unpin message
router.post('/:messageId/pin', async (req, res) => {
  await delay(200);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = true;
  message.pinned_at = new Date().toISOString();
  message.pinned_by = currentUser.id;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message pinned successfully');
});

router.delete('/:messageId/pin', async (req, res) => {
  await delay(150);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = false;
  message.pinned_at = null;
  message.pinned_by = null;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message unpinned successfully');
});

// Get pinned messages
router.get('/pinned', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const pinnedMessages = messages.filter(m => 
    m.household_id === householdId && m.pinned && !m.deleted_at
  );
  
  res.success(pinnedMessages);
});

// Chat statistics
router.get('/statistics', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { period = 'week' } = req.query;
  
  const householdMessages = messages.filter(m => m.household_id === householdId && !m.deleted_at);
  
  const messagesByUser = householdMessages.reduce((acc, msg) => {
    acc[msg.user_id] = (acc[msg.user_id] || 0) + 1;
    return acc;
  }, {});
  
  const activeUsers = Object.keys(messagesByUser).length;
  
  // Mock daily message counts
  const messagesByDay = [
    { date: '2024-01-15', count: 12 },
    { date: '2024-01-16', count: 8 },
    { date: '2024-01-17', count: 15 },
    { date: '2024-01-18', count: 6 },
    { date: '2024-01-19', count: 11 },
  ];
  
  res.success({
    total_messages: householdMessages.length,
    active_users: activeUsers,
    messages_by_user: messagesByUser,
    messages_by_day: messagesByDay,
    popular_reactions: [
      { emoji: '👍', count: 23 },
      { emoji: '😂', count: 18 },
      { emoji: '❤️', count: 15 },
    ],
  });
});

export default router;
EOF

# ============================================================================
# NOTIFICATION ROUTES
# ============================================================================

echo -e "${PURPLE}🔔 Creating notification routes...${NC}"

cat > "$MOCK_SRC/routes/notifications.js" << 'EOF'
/**
 * Notification Routes
 * Handles notifications and device registration
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  notifications, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired 
} from '../utils/helpers.js';

const router = express.Router();

// Mock device tokens storage
let deviceTokens = [];

// Get notifications for current user
router.get('/', async (req, res) => {
  await delay(200);
  
  const { 
    page = 1, 
    limit = 50, 
    read, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter notifications for current user
  let userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  
  // Apply filters
  const filters = { type };
  if (read !== undefined) {
    if (read === 'true') {
      userNotifications = userNotifications.filter(n => n.read_at !== null);
    } else if (read === 'false') {
      userNotifications = userNotifications.filter(n => n.read_at === null);
    }
  }
  
  userNotifications = filterItems(userNotifications, filters);
  
  // Sort notifications
  userNotifications = sortItems(userNotifications, sort_by, sort_order);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => n.user_id === currentUser.id && n.read_at === null).length;
  
  // Paginate
  const paginatedResult = paginate(userNotifications, page, limit);
  
  // Add unread count to meta
  paginatedResult.meta.unread_count = unreadCount;
  
  res.success(paginatedResult);
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  await delay(150);
  
  const notification = notifications.find(n => n.id === req.params.id && n.user_id === currentUser.id);
  
  if (!notification) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notification.read_at = new Date().toISOString();
  notification.updated_at = new Date().toISOString();
  
  res.success({
    id: notification.id,
    read_at: notification.read_at,
  }, 'Notification marked as read');
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  await delay(300);
  
  let marked_count = 0;
  
  notifications.forEach(notification => {
    if (notification.user_id === currentUser.id && !notification.read_at) {
      notification.read_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();
      marked_count++;
    }
  });
  
  res.success({
    marked_read_count: marked_count,
  }, `${marked_count} notifications marked as read`);
});

// Delete notification
router.delete('/:id', async (req, res) => {
  await delay(150);
  
  const notificationIndex = notifications.findIndex(n => 
    n.id === req.params.id && n.user_id === currentUser.id
  );
  
  if (notificationIndex === -1) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notifications.splice(notificationIndex, 1);
  
  res.success({ success: true }, 'Notification deleted successfully');
});

// Delete all read notifications
router.delete('/read', async (req, res) => {
  await delay(400);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    const notification = notifications[i];
    if (notification.user_id === currentUser.id && notification.read_at) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} read notifications deleted`);
});

// Delete all notifications
router.delete('/', async (req, res) => {
  await delay(500);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    if (notifications[i].user_id === currentUser.id) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} notifications deleted`);
});

// Register device for push notifications
router.post('/device', async (req, res) => {
  await delay(300);
  
  const { token, platform, active = true } = req.body;
  
  try {
    validateRequired(req.body, ['token', 'platform']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Check if device already exists
  const existingDevice = deviceTokens.find(d => d.token === token);
  
  if (existingDevice) {
    existingDevice.active = active;
    existingDevice.last_used = new Date().toISOString();
  } else {
    const newDevice = {
      id: uuidv4(),
      user_id: currentUser.id,
      token,
      platform,
      active,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    };
    deviceTokens.push(newDevice);
  }
  
  res.success({ success: true }, 'Device registered for push notifications');
});

// Unregister device
router.delete('/device/:token', async (req, res) => {
  await delay(200);
  
  const tokenIndex = deviceTokens.findIndex(d => 
    d.token === req.params.token && d.user_id === currentUser.id
  );
  
  if (tokenIndex === -1) {
    return res.error('NOT_FOUND', 'Device token not found', null, 404);
  }
  
  deviceTokens.splice(tokenIndex, 1);
  
  res.success({ success: true }, 'Device unregistered successfully');
});

// Get registered devices
router.get('/devices', async (req, res) => {
  await delay(150);
  
  const userDevices = deviceTokens
    .filter(    expires_at: null, // Mock: codes don't expire
  }, 'Invite code generated successfully');
});

// Remove member
router.delete('/:id/members/:userId', async (req, res) => {
  await delay(300);
  
  const memberIndex = householdMembers.findIndex(
    m => m.household_id === req.params.id && m.user_id === req.params.userId
  );
  
  if (memberIndex === -1) {
    return res.error('NOT_FOUND', 'Member not found', null, 404);
  }
  
  householdMembers.splice(memberIndex, 1);
  
  // Update member count
  const household = households.find(h => h.id === req.params.id);
  if (household) {
    household.member_count--;
  }
  
  res.success({ success: true }, 'Member removed successfully');
});

// Leave household
router.post('/:id/leave', async (req, res) => {
  await delay(400);
  
  const { transfer_admin_to } = req.body;
  
  const memberIndex = householdMembers.findIndex(
    m => m.household_id === req.params.id && m.user_id === currentUser.id
  );
  
  if (memberIndex === -1) {
    return res.error('NOT_FOUND', 'You are not a member of this household', null, 404);
  }
  
  const household = households.find(h => h.id === req.params.id);
  
  // If user is admin and there are other members, transfer admin role
  if (household && household.admin_id === currentUser.id && transfer_admin_to) {
    household.admin_id = transfer_admin_to;
    const newAdmin = householdMembers.find(
      m => m.household_id === req.params.id && m.user_id === transfer_admin_to
    );
    if (newAdmin) {
      newAdmin.role = 'admin';
    }
  }
  
  householdMembers.splice(memberIndex, 1);
  
  if (household) {
    household.member_count--;
  }
  
  res.success({ success: true }, 'Left household successfully');
});

// Get household settings
router.get('/:id/settings', async (req, res) => {
  await delay(100);
  res.success(householdSettings);
});

// Update household settings
router.put('/:id/settings', async (req, res) => {
  await delay(200);
  
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined) {
      householdSettings[key] = req.body[key];
    }
  });
  
  res.success(householdSettings, 'Settings updated successfully');
});

// Get dashboard data
router.get('/:id/dashboard', async (req, res) => {
  await delay(300);
  
  const dashboardData = generateDashboardData();
  res.success(dashboardData);
});

// Get household balances
router.get('/:id/balances', async (req, res) => {
  await delay(250);
  
  const balances = generateBalances();
  res.success(balances);
});

// Get specific user balance
router.get('/:id/balances/:userId', async (req, res) => {
  await delay(150);
  
  const balances = generateBalances();
  const userBalance = balances.member_balances.find(b => b.user_id === req.params.userId);
  
  if (!userBalance) {
    return res.error('NOT_FOUND', 'User balance not found', null, 404);
  }
  
  res.success({
    total_owed: userBalance.total_owed,
    total_paid: userBalance.total_paid,
    net_balance: userBalance.net_balance,
  });
});

// Settle balance between users
router.post('/:id/balances/settle', async (req, res) => {
  await delay(500);
  
  const { from_user_id, to_user_id, amount } = req.body;
  
  try {
    validateRequired(req.body, ['from_user_id', 'to_user_id', 'amount']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // In a real app, this would update the actual balances
  // For mock, we just simulate success
  res.success({ success: true }, `Settlement of ${amount} processed successfully`);
});

// Helper function to generate invite codes
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default router;
EOF

# ============================================================================
# TASK ROUTES
# ============================================================================

echo -e "${PURPLE}✅ Creating task routes...${NC}"

cat > "$MOCK_SRC/routes/tasks.js" << 'EOF'
/**
 * Task Routes
 * Handles task management, assignments, and swaps
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  tasks, 
  householdMembers, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get tasks for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    assigned_to, 
    category, 
    due_after, 
    due_before,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter tasks by household
  let householdTasks = tasks.filter(t => t.household_id === householdId);
  
  // Apply filters
  const filters = { status, assigned_to, category, due_after, due_before };
  householdTasks = filterItems(householdTasks, filters);
  
  // Handle assigned_to filter specially
  if (assigned_to) {
    householdTasks = householdTasks.filter(task => 
      task.assignments.some(assignment => assignment.assigned_to === assigned_to)
    );
  }
  
  // Sort tasks
  householdTasks = sortItems(householdTasks, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdTasks, page, limit);
  
  res.success(paginatedResult);
});

// Create new task
router.post('/', async (req, res) => {
  await delay(400);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    due_date, 
    is_recurring = false, 
    recurrence_pattern, 
    recurrence_interval,
    category,
    assigned_to = []
  } = req.body;
  
  try {
    validateRequired(req.body, ['title']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (is_recurring && !recurrence_pattern) {
    return res.error('VALIDATION_ERROR', 'Recurrence pattern required for recurring tasks', null, 400);
  }
  
  const newTask = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    due_date: due_date || null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    recurrence_interval: recurrence_interval || null,
    category: category || null,
    status: 'pending',
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [],
    swap_requests: [],
  };
  
  // Create assignments
  if (assigned_to.length > 0) {
    newTask.assignments = assigned_to.map(userId => {
      const member = householdMembers.find(m => m.user_id === userId);
      return {
        id: uuidv4(),
        assigned_to: userId,
        assigned_to_name: member?.full_name || 'Unknown User',
        assigned_to_avatar: member?.avatar_url || null,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      };
    });
  }
  
  tasks.push(newTask);
  
  res.success(newTask, 'Task created successfully');
});

// Get specific task
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  res.success(task);
});

// Update task
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const task = tasks[taskIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      task[key] = req.body[key];
    }
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success(task, 'Task updated successfully');
});

// Delete task
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  tasks.splice(taskIndex, 1);
  
  res.success({ success: true }, 'Task deleted successfully');
});

// Assign task to users
router.post('/:id/assign', async (req, res) => {
  await delay(250);
  
  const { user_ids } = req.body;
  
  if (!user_ids || !Array.isArray(user_ids)) {
    return res.error('VALIDATION_ERROR', 'user_ids array is required', null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Clear existing assignments and create new ones
  task.assignments = user_ids.map(userId => {
    const member = householdMembers.find(m => m.user_id === userId);
    return {
      id: uuidv4(),
      assigned_to: userId,
      assigned_to_name: member?.full_name || 'Unknown User',
      assigned_to_avatar: member?.avatar_url || null,
      assigned_at: new Date().toISOString(),
      completed_at: null,
    };
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Task assigned successfully');
});

// Mark task as complete
router.put('/:id/complete', async (req, res) => {
  await delay(200);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'completed';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as completed
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
  }, 'Task completed successfully');
});

// Mark task as incomplete
router.put('/:id/uncomplete', async (req, res) => {
  await delay(150);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'pending';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as incomplete
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = null;
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: null,
    completed_by: currentUser.id,
  }, 'Task marked as incomplete');
});

// Complete task with photo
router.post('/:id/complete/with-photo', async (req, res) => {
  await delay(1000); // Simulate photo upload
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'task-completion.jpg',
    size: 1024000,
    mimetype: 'image/jpeg'
  });
  
  task.status = 'completed';
  task.completion_photo = uploadResult.url;
  task.updated_at = new Date().toISOString();
  
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
    photo_url: uploadResult.url,
  }, 'Task completed with photo');
});

// Request task swap
router.post('/:id/swap/request', async (req, res) => {
  await delay(300);
  
  const { to_user_id, notes } = req.body;
  
  try {
    validateRequired(req.body, ['to_user_id']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const swapRequest = {
    id: uuidv4(),
    task_id: req.params.id,
    from_user_id: currentUser.id,
    to_user_id,
    status: 'pending',
    notes: notes || null,
    requested_at: new Date().toISOString(),
    responded_at: null,
  };
  
  task.swap_requests.push(swapRequest);
  task.updated_at = new Date().toISOString();
  
  res.success(swapRequest, 'Swap request created successfully');
});

// Accept swap request
router.put('/swaps/:swapId/accept', async (req, res) => {
  await delay(250);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'accepted';
  foundSwap.responded_at = new Date().toISOString();
  
  // Update task assignment
  const fromAssignment = foundTask.assignments.find(a => a.assigned_to === foundSwap.from_user_id);
  const toMember = householdMembers.find(m => m.user_id === foundSwap.to_user_id);
  
  if (fromAssignment && toMember) {
    fromAssignment.assigned_to = foundSwap.to_user_id;
    fromAssignment.assigned_to_name = toMember.full_name;
    fromAssignment.assigned_to_avatar = toMember.avatar_url;
    fromAssignment.assigned_at = new Date().toISOString();
  }
  
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request accepted');
});

// Decline swap request
router.put('/swaps/:swapId/decline', async (req, res) => {
  await delay(200);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'declined';
  foundSwap.responded_at = new Date().toISOString();
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request declined');
});

// Get task swaps for household
router.get('/swaps', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const swaps = [];
  tasks.filter(t => t.household_id === householdId).forEach(task => {
    task.swap_requests.forEach(swap => {
      const fromMember = householdMembers.find(m => m.user_id === swap.from_user_id);
      const toMember = householdMembers.find(m => m.user_id === swap.to_user_id);
      
      swaps.push({
        id: swap.id,
        task: {
          id: task.id,
          title: task.title,
          due_date: task.due_date,
        },
        from_user: {
          id: swap.from_user_id,
          name: fromMember?.full_name || 'Unknown',
          avatar_url: fromMember?.avatar_url || null,
        },
        to_user: {
          id: swap.to_user_id,
          name: toMember?.full_name || 'Unknown',
          avatar_url: toMember?.avatar_url || null,
        },
        status: swap.status,
        notes: swap.notes,
        requested_at: swap.requested_at,
      });
    });
  });
  
  res.success(swaps);
});

// Bulk operations
router.post('/bulk-complete', async (req, res) => {
  await delay(500);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let completed_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.updated_at = new Date().toISOString();
      completed_count++;
    }
  });
  
  res.success({ 
    success: true, 
    completed_count 
  }, `${completed_count} tasks completed`);
});

router.post('/bulk-assign', async (req, res) => {
  await delay(400);
  
  const { task_ids, user_id } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids) || !user_id) {
    return res.error('VALIDATION_ERROR', 'task_ids array and user_id are required', null, 400);
  }
  
  const member = householdMembers.find(m => m.user_id === user_id);
  let assigned_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task && member) {
      task.assignments = [{
        id: uuidv4(),
        assigned_to: user_id,
        assigned_to_name: member.full_name,
        assigned_to_avatar: member.avatar_url,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      }];
      task.updated_at = new Date().toISOString();
      assigned_count++;
    }
  });
  
  res.success({ 
    success: true, 
    assigned_count 
  }, `${assigned_count} tasks assigned`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove tasks in reverse order to maintain indices
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (task_ids.includes(tasks[i].id)) {
      tasks.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} tasks deleted`);
});

export default router;
EOF

# Continue with Bills routes...
echo -e "${PURPLE}💰 Creating bill routes...${NC}"

cat > "$MOCK_SRC/routes/bills.js" << 'EOF'
/**
 * Bill Routes  
 * Handles bill management, payments, and balance tracking
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  bills, 
  householdMembers, 
  currentUser,
  generateBalances
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get bills for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    paid_by, 
    category, 
    amount_min, 
    amount_max,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter bills by household
  let householdBills = bills.filter(b => b.household_id === householdId);
  
  // Apply filters
  const filters = { status, paid_by, category, amount_min, amount_max };
  householdBills = filterItems(householdBills, filters);
  
  // Sort bills
  householdBills = sortItems(householdBills, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdBills, page, limit);
  
  res.success(paginatedResult);
});

// Create new bill
router.post('/', async (req, res) => {
  await delay(500);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    total_amount, 
    currency = 'USD', 
    due_date, 
    is_recurring = false, 
    recurrence_pattern,
    category,
    splits
  } = req.body;
  
  try {
    validateRequired(req.body, ['title', 'total_amount', 'due_date', 'splits']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(splits) || splits.length === 0) {
    return res.error('VALIDATION_ERROR', 'At least one bill split is required', null, 400);
  }
  
  // Validate splits
  const hasPercentages = splits.some(s => s.percentage !== undefined);
  const hasAmounts = splits.some(s => s.amount_owed !== undefined);
  
  if (hasPercentages && hasAmounts) {
    return res.error('VALIDATION_ERROR', 'Cannot mix percentage and amount-based splits', null, 400);
  }
  
  const newBill = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    total_amount: parseFloat(total_amount).toFixed(2),
    currency,
    due_date,
    paid_date: null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    category: category || null,
    status: 'pending',
    paid_by: currentUser.id,
    paid_by_name: currentUser.full_name,
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    splits: [],
  };
  
  // Create splits
  newBill.splits = splits.map(split => {
    const member = householdMembers.find(m => m.user_id === split.user_id);
    return {
      id: uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || '0.00',
      percentage: split.percentage || null,
      paid_amount: '0.00',
      paid_date: null,
    };
  });
  
  bills.push(newBill);
  
  res.success(newBill, 'Bill created successfully');
});

// Get specific bill
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill);
});

// Update bill
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  const bill = bills[billIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      bill[key] = req.body[key];
    }
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill, 'Bill updated successfully');
});

// Delete bill
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const billIndex = bills.findIndex(b => b.id === req.params.id);
  
  if (billIndex === -1) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  bills.splice(billIndex, 1);
  
  res.success({ success: true }, 'Bill deleted successfully');
});

// Get bill splits
router.get('/:id/splits', async (req, res) => {
  await delay(100);
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  res.success(bill.splits);
});

// Update bill splits
router.put('/:id/split', async (req, res) => {
  await delay(300);
  
  const { splits } = req.body;
  
  if (!Array.isArray(splits)) {
    return res.error('VALIDATION_ERROR', 'splits array is required', null, 400);
  }
  
  const bill = bills.find(b => b.id === req.params.id);
  
  if (!bill) {
    return res.error('NOT_FOUND', 'Bill not found', null, 404);
  }
  
  // Update splits
  bill.splits = splits.map(split => {
    const existingSplit = bill.splits.find(s => s.user_id === split.user_id);
    const member = householdMembers.find(m => m.user_id === split.user_id);
    
    return {
      id: existingSplit?.id || uuidv4(),
      user_id: split.user_id,
      user_name: member?.full_name || 'Unknown User',
      amount_owed: split.amount_owed || existingSplit?.amount_owed || '0.00',
      percentage: split.percentage || existingSplit?.percentage || null,
      paid_amount: existingSplit?.paid_amount || '0.00',
      paid_date: existingSplit?.paid_date || null,
    };
  });
  
  bill.updated_at = new Date().toISOString();
  
  res.success(bill.splits, 'Bill splits updated successfully');
});

// Record payment for bill split
router.post('/splits/:splitId/payment', async (req, res)# ============================================================================
# MOCK SERVER MAIN FILE
# ============================================================================

echo -e "${PURPLE}🚀 Creating main server file...${NC}"

cat > "$MOCK_SRC/server.js" << 'EOF'
/**
 * Homey Mock Server
 * In-memory development server with realistic data
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import householdRoutes from './routes/households.js';
import taskRoutes from './routes/tasks.js';
import billRoutes from './routes/bills.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';

// Import middleware
import { mockAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { responseFormatter } from './middleware/responseFormatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.MOCK_PORT || 8000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS - Allow all origins for development
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock auth middleware (bypasses real auth)
app.use(mockAuth);

// Response formatter
app.use(responseFormatter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: 'mock',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', authRoutes); // Profile routes are in auth
app.use('/api/invite', authRoutes); // Invite routes are in auth
app.use('/api/households', householdRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/households/:householdId/messages', chatRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/polls', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      details: {
        method: req.method,
        path: req.path,
        available_routes: [
          '/health',
          '/api/auth/*',
          '/api/households/*',
          '/api/tasks/*',
          '/api/bills/*',
          '/api/messages/*',
          '/api/notifications/*',
        ],
      },
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
🎭 Homey Mock Server Running!

📍 Server: http://localhost:${PORT}
🔧 Health: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api

🚀 Features:
   ✅ Bypassed authentication (always authenticated as Alex)
   ✅ Full CRUD operations for all resources
   ✅ Realistic mock data with relationships
   ✅ Real-time simulation (polling-based)
   ✅ File upload simulation
   ✅ Error scenarios and validation

🏠 Mock Data:
   👥 4 Users in "Downtown Loft" household
   ✅ 4 Tasks (1 completed, 1 overdue)
   💰 3 Bills with payment tracking
   💬 5 Chat messages with polls
   🔔 3 Notifications

💡 Tips:
   - All API endpoints match your production schema
   - Use any email/password for login (bypassed)
   - Data resets on server restart
   - Check console for request logs
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
EOF

# ============================================================================
# MIDDLEWARE
# ============================================================================

echo -e "${PURPLE}🔧 Creating middleware...${NC}"

# Auth middleware (bypasses real auth)
cat > "$MOCK_SRC/middleware/auth.js" << 'EOF'
/**
 * Mock Auth Middleware
 * Bypasses authentication and sets current user
 */

import { currentUser } from '../data/mockData.js';

export const mockAuth = (req, res, next) => {
  // Always set the current user (bypassing auth)
  req.user = currentUser;
  req.authenticated = true;
  
  // Add mock authorization header if not present
  if (!req.headers.authorization) {
    req.headers.authorization = 'Bearer mock-token-123';
  }
  
  next();
};

export const requireAdmin = (req, res, next) => {
  // In mock mode, always allow admin actions
  req.isAdmin = true;
  next();
};
EOF

# Error handler middleware
cat > "$MOCK_SRC/middleware/errorHandler.js" << 'EOF'
/**
 * Error Handler Middleware
 * Handles and formats errors consistently
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error response
  let status = 500;
  let errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      details: {},
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.message = err.message;
  } else if (err.name === 'NotFoundError') {
    status = 404;
    errorResponse.error.code = 'NOT_FOUND';
    errorResponse.error.message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    errorResponse.error.code = 'UNAUTHORIZED';
    errorResponse.error.message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    errorResponse.error.code = 'FORBIDDEN';
    errorResponse.error.message = 'Access denied';
  }

  // Add request ID for debugging
  if (req.headers['x-request-id']) {
    errorResponse.error.request_id = req.headers['x-request-id'];
  }

  res.status(status).json(errorResponse);
};

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
EOF

# Response formatter middleware
cat > "$MOCK_SRC/middleware/responseFormatter.js" << 'EOF'
/**
 * Response Formatter Middleware
 * Ensures consistent API response format
 */

export const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to format responses
  res.json = function(data) {
    // If data is already in API format, return as-is
    if (data && (data.data !== undefined || data.error !== undefined)) {
      return originalJson.call(this, data);
    }

    // Format successful responses
    const formattedResponse = {
      data,
      message: res.locals.message || null,
      meta: res.locals.meta || null,
    };

    return originalJson.call(this, formattedResponse);
  };

  // Helper methods for responses
  res.success = function(data, message = null, meta = null) {
    return this.json({
      data,
      message,
      meta,
    });
  };

  res.error = function(code, message, details = null, status = 400) {
    this.status(status);
    return this.json({
      error: {
        code,
        message,
        details,
      },
    });
  };

  next();
};
EOF

# ============================================================================
# UTILITIES
# ============================================================================

echo -e "${PURPLE}🛠️  Creating utilities...${NC}"

cat > "$MOCK_SRC/utils/helpers.js" << 'EOF'
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
EOF

# ============================================================================
# AUTHENTICATION ROUTES
# ============================================================================

echo -e "${PURPLE}🔐 Creating authentication routes...${NC}"

cat > "$MOCK_SRC/routes/auth.js" << 'EOF'
/**
 * Authentication Routes
 * Handles auth, profile, and invitation endpoints
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  currentUser, 
  users, 
  households, 
  householdMembers 
} from '../data/mockData.js';
import { delay, generateFakeUser } from '../utils/helpers.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

// Auth endpoints (bypassed but maintained for compatibility)
router.post('/login', async (req, res) => {
  await delay(500); // Simulate auth delay
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.error('VALIDATION_ERROR', 'Email and password are required', null, 400);
  }

  // Always succeed in mock mode
  res.success({
    access_token: 'mock-access-token-' + Date.now(),
    refresh_token: 'mock-refresh-token-' + Date.now(),
    user: currentUser,
    expires_in: 3600,
  }, 'Login successful');
});

router.post('/refresh', async (req, res) => {
  await delay(200);
  
  res.success({
    access_token: 'mock-access-token-' + Date.now(),
    refresh_token: 'mock-refresh-token-' + Date.now(),
    user: currentUser,
    expires_in: 3600,
  });
});

router.post('/logout', async (req, res) => {
  await delay(100);
  res.success({ success: true }, 'Logged out successfully');
});

// Profile endpoints
router.get('/', async (req, res) => {
  await delay(100);
  res.success(currentUser);
});

router.put('/', async (req, res) => {
  await delay(300);
  
  const { full_name, phone, avatar_url } = req.body;
  
  // Update current user data
  if (full_name) currentUser.full_name = full_name;
  if (phone) currentUser.phone = phone;
  if (avatar_url) currentUser.avatar_url = avatar_url;
  
  currentUser.updated_at = new Date().toISOString();
  
  res.success(currentUser, 'Profile updated successfully');
});

router.post('/avatar', async (req, res) => {
  await delay(1000); // Simulate file upload
  
  // Simulate avatar upload
  const avatarUrl = `https://mock-cdn.homey.app/avatars/${uuidv4()}.jpg`;
  currentUser.avatar_url = avatarUrl;
  currentUser.updated_at = new Date().toISOString();
  
  res.success({ avatar_url: avatarUrl }, 'Avatar uploaded successfully');
});

// Invitation endpoints
router.post('/validate', async (req, res) => {
  await delay(200);
  
  const { invite_code } = req.body;
  
  if (!invite_code) {
    return res.error('VALIDATION_ERROR', 'Invite code is required', null, 400);
  }
  
  // Find household by invite code
  const household = households.find(h => h.invite_code === invite_code);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Invalid invite code', null, 404);
  }
  
  res.success({
    household: {
      id: household.id,
      name: household.name,
      member_count: household.member_count,
      max_members: household.max_members,
    },
    valid: true,
  });
});

router.post('/join', async (req, res) => {
  await delay(500);
  
  const { invite_code } = req.body;
  
  if (!invite_code) {
    return res.error('VALIDATION_ERROR', 'Invite code is required', null, 400);
  }
  
  const household = households.find(h => h.invite_code === invite_code);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Invalid invite code', null, 404);
  }
  
  // Check if user is already a member
  const existingMember = householdMembers.find(
    m => m.user_id === currentUser.id && m.household_id === household.id
  );
  
  if (existingMember) {
    return res.error('CONFLICT', 'You are already a member of this household', null, 409);
  }
  
  // Add user to household
  const newMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: 'member',
    joined_at: new Date().toISOString(),
  };
  
  householdMembers.push(newMember);
  household.member_count++;
  
  res.success({
    household_id: household.id,
    role: 'member',
    joined_at: newMember.joined_at,
  }, 'Successfully joined household');
});

// Password reset (mock endpoints)
router.post('/reset-password', async (req, res) => {
  await delay(1000);
  const { email } = req.body;
  
  if (!email) {
    return res.error('VALIDATION_ERROR', 'Email is required', null, 400);
  }
  
  res.success({ success: true }, 'Password reset email sent');
});

router.post('/reset-password/confirm', async (req, res) => {
  await delay(500);
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.error('VALIDATION_ERROR', 'Token and password are required', null, 400);
  }
  
  res.success({ success: true }, 'Password reset successfully');
});

// Account management
router.delete('/account', async (req, res) => {
  await delay(1000);
  res.success({ success: true }, 'Account deleted successfully');
});

router.post('/change-password', async (req, res) => {
  await delay(500);
  const { current_password, new_password } = req.body;
  
  if (!current_password || !new_password) {
    return res.error('VALIDATION_ERROR', 'Current and new passwords are required', null, 400);
  }
  
  res.success({ success: true }, 'Password changed successfully');
});

router.get('/verify', async (req, res) => {
  await delay(100);
  res.success({ 
    valid: true, 
    user: currentUser 
  });
});

export default router;
EOF

# ============================================================================
# HOUSEHOLD ROUTES
# ============================================================================

echo -e "${PURPLE}🏠 Creating household routes...${NC}"

cat > "$MOCK_SRC/routes/households.js" << 'EOF'
/**
 * Household Routes
 * Handles household management, members, and settings
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  households, 
  householdMembers, 
  householdSettings,
  currentUser,
  generateDashboardData,
  generateBalances
} from '../data/mockData.js';
import { delay, validateRequired, generateFakeUser } from '../utils/helpers.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get all households for current user
router.get('/', async (req, res) => {
  await delay(200);
  
  // Filter households where user is a member
  const userHouseholds = households.filter(household => 
    householdMembers.some(member => 
      member.user_id === currentUser.id && member.household_id === household.id
    )
  );
  
  res.success(userHouseholds);
});

// Create new household
router.post('/', async (req, res) => {
  await delay(500);
  
  const { name, max_members = 5, address, lease_start_date, lease_end_date, data_retention_days = 365 } = req.body;
  
  try {
    validateRequired(req.body, ['name']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (max_members < 2 || max_members > 20) {
    return res.error('VALIDATION_ERROR', 'Max members must be between 2 and 20', null, 400);
  }
  
  const newHousehold = {
    id: uuidv4(),
    name,
    max_members,
    address: address || null,
    lease_start_date: lease_start_date || null,
    lease_end_date: lease_end_date || null,
    admin_id: currentUser.id,
    invite_code: generateInviteCode(),
    member_count: 1,
    data_retention_days,
    role: 'admin',
    joined_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Add admin as first member
  const adminMember = {
    id: uuidv4(),
    user_id: currentUser.id,
    full_name: currentUser.full_name,
    email: currentUser.email,
    avatar_url: currentUser.avatar_url,
    role: 'admin',
    joined_at: new Date().toISOString(),
  };
  
  households.push(newHousehold);
  householdMembers.push(adminMember);
  
  res.success(newHousehold, 'Household created successfully');
});

// Get specific household
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  res.success(household);
});

// Update household
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      household[key] = req.body[key];
    }
  });
  
  household.updated_at = new Date().toISOString();
  
  res.success(household, 'Household updated successfully');
});

// Delete household
router.delete('/:id', async (req, res) => {
  await delay(500);
  
  const householdIndex = households.findIndex(h => h.id === req.params.id);
  
  if (householdIndex === -1) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  // Remove household and its members
  households.splice(householdIndex, 1);
  const memberIndicesToRemove = [];
  householdMembers.forEach((member, index) => {
    if (member.household_id === req.params.id) {
      memberIndicesToRemove.push(index);
    }
  });
  
  // Remove members in reverse order to maintain indices
  memberIndicesToRemove.reverse().forEach(index => {
    householdMembers.splice(index, 1);
  });
  
  res.success({ success: true }, 'Household deleted successfully');
});

// Get household members
router.get('/:id/members', async (req, res) => {
  await delay(150);
  
  const members = householdMembers.filter(m => m.household_id === req.params.id);
  res.success(members);
});

// Generate invite code
router.post('/:id/invite', async (req, res) => {
  await delay(200);
  
  const household = households.find(h => h.id === req.params.id);
  
  if (!household) {
    return res.error('NOT_FOUND', 'Household not found', null, 404);
  }
  
  const newInviteCode = generateInviteCode();
  household.invite_code = newInviteCode;
  household.updated_at = new Date().toISOString();
  
  res.success({
    invite_code: newInviteCode,
    invite_link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${newInviteCode}`,
    expires_at: null, // Mock: codes don#!/bin/bash

# Homey App - Generate Mock Server
# Creates an in-memory mock server for rapid development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎭 Generating Mock Server for Development...${NC}"

# Configuration
PROJECT_ROOT="."
MOCK_DIR="mock-server"
MOCK_SRC="$MOCK_DIR/src"

# Create directories
mkdir -p "$MOCK_SRC/data"
mkdir -p "$MOCK_SRC/routes"
mkdir -p "$MOCK_SRC/middleware"
mkdir -p "$MOCK_SRC/utils"

# ============================================================================
# PACKAGE.JSON FOR MOCK SERVER
# ============================================================================

echo -e "${PURPLE}📦 Creating mock server package.json...${NC}"

cat > "$MOCK_DIR/package.json" << 'EOF'
{
  "name": "homey-mock-server",
  "version": "1.0.0",
  "description": "Mock server for Homey app development",
  "main": "src/server.js",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "reset": "node src/utils/resetData.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0",
    "uuid": "^9.0.1",
    "date-fns": "^3.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF

# ============================================================================
# MOCK DATA GENERATOR
# ============================================================================

echo -e "${PURPLE}🗄️  Generating mock data...${NC}"

cat > "$MOCK_SRC/data/mockData.js" << 'EOF'
/**
 * Mock Data Generator
 * Realistic data for Homey app development
 */

import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays, addHours, format } from 'date-fns';

// Helper to generate realistic dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Mock user data
export const users = [
  {
    id: 'user-1',
    email: 'alex@example.com',
    full_name: 'Alex Johnson',
    avatar_url: 'https://i.pravatar.cc/150?u=alex',
    phone: '+1234567890',
    created_at: subDays(new Date(), 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-2', 
    email: 'sam@example.com',
    full_name: 'Sam Rodriguez',
    avatar_url: 'https://i.pravatar.cc/150?u=sam',
    phone: '+1234567891',
    created_at: subDays(new Date(), 25).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-3',
    email: 'casey@example.com', 
    full_name: 'Casey Chen',
    avatar_url: 'https://i.pravatar.cc/150?u=casey',
    phone: '+1234567892',
    created_at: subDays(new Date(), 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-4',
    email: 'jordan@example.com',
    full_name: 'Jordan Smith',
    avatar_url: 'https://i.pravatar.cc/150?u=jordan',
    phone: '+1234567893', 
    created_at: subDays(new Date(), 15).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Current user (bypassing auth)
export const currentUser = users[0];

// Mock household data
export const households = [
  {
    id: 'household-1',
    name: 'Downtown Loft',
    max_members: 4,
    address: '123 Main St, Apartment 4B',
    lease_start_date: subDays(new Date(), 90).toISOString().split('T')[0],
    lease_end_date: addDays(new Date(), 275).toISOString().split('T')[0],
    admin_id: 'user-1',
    invite_code: 'DT-LOFT-2024',
    member_count: 4,
    data_retention_days: 365,
    role: 'admin',
    joined_at: subDays(new Date(), 90).toISOString(),
    created_at: subDays(new Date(), 90).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'household-2', 
    name: 'Suburban House',
    max_members: 6,
    address: '456 Oak Avenue',
    lease_start_date: subDays(new Date(), 180).toISOString().split('T')[0],
    lease_end_date: addDays(new Date(), 185).toISOString().split('T')[0],
    admin_id: 'user-2',
    invite_code: 'SUB-HOUSE-24',
    member_count: 3,
    data_retention_days: 365,
    role: 'member',
    joined_at: subDays(new Date(), 60).toISOString(),
    created_at: subDays(new Date(), 180).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const currentHousehold = households[0];

// Mock household members
export const householdMembers = [
  {
    id: 'member-1',
    user_id: 'user-1',
    full_name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=alex',
    role: 'admin',
    joined_at: subDays(new Date(), 90).toISOString(),
  },
  {
    id: 'member-2',
    user_id: 'user-2', 
    full_name: 'Sam Rodriguez',
    email: 'sam@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=sam',
    role: 'member',
    joined_at: subDays(new Date(), 60).toISOString(),
  },
  {
    id: 'member-3',
    user_id: 'user-3',
    full_name: 'Casey Chen',
    email: 'casey@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=casey',
    role: 'member',
    joined_at: subDays(new Date(), 45).toISOString(),
  },
  {
    id: 'member-4',
    user_id: 'user-4',
    full_name: 'Jordan Smith',
    email: 'jordan@example.com',
    avatar_url: 'https://i.pravatar.cc/150?u=jordan',
    role: 'member',
    joined_at: subDays(new Date(), 30).toISOString(),
  }
];

// Mock tasks
export const tasks = [
  {
    id: 'task-1',
    household_id: 'household-1',
    title: 'Take out trash',
    description: 'Weekly trash and recycling pickup',
    due_date: addDays(new Date(), 2).toISOString(),
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    category: 'cleaning',
    status: 'pending',
    created_by: 'user-1',
    created_at: subDays(new Date(), 7).toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [
      {
        id: 'assignment-1',
        assigned_to: 'user-2',
        assigned_to_name: 'Sam Rodriguez',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=sam',
        assigned_at: subDays(new Date(), 7).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-2',
    household_id: 'household-1', 
    title: 'Clean kitchen',
    description: 'Deep clean kitchen including appliances',
    due_date: addDays(new Date(), 1).toISOString(),
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: null,
    category: 'kitchen',
    status: 'completed',
    created_by: 'user-1',
    created_at: subDays(new Date(), 3).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
    assignments: [
      {
        id: 'assignment-2',
        assigned_to: 'user-3',
        assigned_to_name: 'Casey Chen',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=casey',
        assigned_at: subDays(new Date(), 3).toISOString(),
        completed_at: subDays(new Date(), 1).toISOString(),
      }
    ],
    swap_requests: []
  },
  {
    id: 'task-3',
    household_id: 'household-1',
    title: 'Grocery shopping',
    description: 'Weekly grocery run - check shared list',
    due_date: addDays(new Date(), 3).toISOString(),
    is_recurring: true,
    recurrence_pattern: 'weekly',
    recurrence_interval: 1,
    category: 'shopping',
    status: 'pending',
    created_by: 'user-2',
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [
      {
        id: 'assignment-3',
        assigned_to: 'user-4',
        assigned_to_name: 'Jordan Smith',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=jordan',
        assigned_at: subDays(new Date(), 5).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: [
      {
        id: 'swap-1',
        task_id: 'task-3',
        from_user_id: 'user-4',
        to_user_id: 'user-1',
        status: 'pending',
        notes: 'Can you take this? I have a work meeting',
        requested_at: subDays(new Date(), 1).toISOString(),
        responded_at: null,
      }
    ]
  },
  {
    id: 'task-4',
    household_id: 'household-1',
    title: 'Vacuum living room',
    description: null,
    due_date: addDays(new Date(), 5).toISOString(),
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: null,
    category: 'cleaning',
    status: 'overdue',
    created_by: 'user-3',
    created_at: subDays(new Date(), 10).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
    assignments: [
      {
        id: 'assignment-4',
        assigned_to: 'user-1',
        assigned_to_name: 'Alex Johnson',
        assigned_to_avatar: 'https://i.pravatar.cc/150?u=alex',
        assigned_at: subDays(new Date(), 10).toISOString(),
        completed_at: null,
      }
    ],
    swap_requests: []
  }
];

// Mock bills
export const bills = [
  {
    id: 'bill-1',
    household_id: 'household-1',
    title: 'Electric Bill - March',
    description: 'Monthly electricity bill',
    total_amount: '125.50',
    currency: 'USD',
    due_date: addDays(new Date(), 10).toISOString().split('T')[0],
    paid_date: null,
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'pending',
    paid_by: 'user-1',
    paid_by_name: 'Alex Johnson',
    created_by: 'user-1',
    created_at: subDays(new Date(), 5).toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-1',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '31.38',
        paid_date: subDays(new Date(), 3).toISOString(),
      },
      {
        id: 'split-2',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez', 
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-3',
        user_id: 'user-3',
        user_name: 'Casey Chen',
        amount_owed: '31.38',
        percentage: null,
        paid_amount: '31.38',
        paid_date: subDays(new Date(), 1).toISOString(),
      },
      {
        id: 'split-4',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '31.36',
        percentage: null,
        paid_amount: '0.00', 
        paid_date: null,
      }
    ]
  },
  {
    id: 'bill-2',
    household_id: 'household-1',
    title: 'Internet Bill',
    description: 'Monthly fiber internet service',
    total_amount: '89.99',
    currency: 'USD',
    due_date: addDays(new Date(), 15).toISOString().split('T')[0],
    paid_date: null,
    is_recurring: true,
    recurrence_pattern: 'monthly',
    category: 'utilities',
    status: 'pending',
    paid_by: 'user-2',
    paid_by_name: 'Sam Rodriguez',
    created_by: 'user-2',
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-5',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-6',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez',
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '22.50',
        paid_date: subDays(new Date(), 2).toISOString(),
      },
      {
        id: 'split-7',
        user_id: 'user-3',
        user_name: 'Casey Chen', 
        amount_owed: '22.50',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-8',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '22.49',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      }
    ]
  },
  {
    id: 'bill-3',
    household_id: 'household-1',
    title: 'Grocery Receipt - Walmart',
    description: 'Weekly groceries and household items',
    total_amount: '156.78',
    currency: 'USD',
    due_date: new Date().toISOString().split('T')[0],
    paid_date: null,
    is_recurring: false,
    recurrence_pattern: null,
    category: 'groceries',
    status: 'pending',
    paid_by: 'user-4',
    paid_by_name: 'Jordan Smith',
    created_by: 'user-4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    splits: [
      {
        id: 'split-9',
        user_id: 'user-1',
        user_name: 'Alex Johnson',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-10',
        user_id: 'user-2',
        user_name: 'Sam Rodriguez',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-11',
        user_id: 'user-3',
        user_name: 'Casey Chen',
        amount_owed: '39.20',
        percentage: null,
        paid_amount: '0.00',
        paid_date: null,
      },
      {
        id: 'split-12',
        user_id: 'user-4',
        user_name: 'Jordan Smith',
        amount_owed: '39.18',
        percentage: null,
        paid_amount: '156.78',
        paid_date: new Date().toISOString(),
      }
    ]
  }
];

// Mock messages
export const messages = [
  {
    id: 'message-1',
    household_id: 'household-1',
    user_id: 'user-2',
    user_name: 'Sam Rodriguez',
    user_avatar: 'https://i.pravatar.cc/150?u=sam',
    content: 'Hey everyone! Just paid the internet bill 💸',
    message_type: 'text',
    replied_to: null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 2).toISOString(),
    updated_at: subDays(new Date(), 2).toISOString(),
  },
  {
    id: 'message-2',
    household_id: 'household-1',
    user_id: 'user-3',
    user_name: 'Casey Chen',
    user_avatar: 'https://i.pravatar.cc/150?u=casey',
    content: 'Thanks Sam! I\'ll send you my portion tomorrow',
    message_type: 'text',
    replied_to: 'message-1',
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 2, { hours: 1 }).toISOString(),
    updated_at: subDays(new Date(), 2, { hours: 1 }).toISOString(),
  },
  {
    id: 'message-3',
    household_id: 'household-1',
    user_id: 'user-1',
    user_name: 'Alex Johnson',
    user_avatar: 'https://i.pravatar.cc/150?u=alex',
    content: 'What should we have for dinner this week?',
    message_type: 'poll',
    replied_to: null,
    poll: {
      id: 'poll-1',
      question: 'What should we have for dinner this week?',
      options: ['Pizza night', 'Taco Tuesday', 'Homemade pasta', 'Order takeout'],
      multiple_choice: true,
      expires_at: addDays(new Date(), 3).toISOString(),
      votes: [
        {
          user_id: 'user-1',
          user_name: 'Alex Johnson',
          user_avatar: 'https://i.pravatar.cc/150?u=alex',
          selected_options: [0, 2],
          voted_at: subDays(new Date(), 1).toISOString(),
        },
        {
          user_id: 'user-3',
          user_name: 'Casey Chen',
          user_avatar: 'https://i.pravatar.cc/150?u=casey',
          selected_options: [1, 3],
          voted_at: subDays(new Date(), 1, { hours: 2 }).toISOString(),
        }
      ],
      vote_counts: [1, 1, 1, 1],
      total_votes: 2,
    },
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'message-4',
    household_id: 'household-1',
    user_id: 'user-4',
    user_name: 'Jordan Smith',
    user_avatar: 'https://i.pravatar.cc/150?u=jordan',
    content: 'Can someone swap grocery duty with me this week? Work is crazy 😅',
    message_type: 'text',
    replied_to: null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 0, { hours: 3 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 3 }).toISOString(),
  },
  {
    id: 'message-5',
    household_id: 'household-1',
    user_id: 'user-1',
    user_name: 'Alex Johnson',
    user_avatar: 'https://i.pravatar.cc/150?u=alex',
    content: 'I can take it! No problem 👍',
    message_type: 'text',
    replied_to: 'message-4',
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
  }
];

// Mock notifications
export const notifications = [
  {
    id: 'notification-1',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'New Task Assignment',
    message: 'You have been assigned to "Vacuum living room"',
    type: 'task_assigned',
    related_id: 'task-4',
    related_table: 'tasks',
    read_at: null,
    created_at: subDays(new Date(), 1).toISOString(),
    updated_at: subDays(new Date(), 1).toISOString(),
  },
  {
    id: 'notification-2',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'Bill Reminder',
    message: 'Electric Bill - March is due in 3 days',
    type: 'bill_due',
    related_id: 'bill-1',
    related_table: 'bills',
    read_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
    created_at: subDays(new Date(), 0, { hours: 6 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 2 }).toISOString(),
  },
  {
    id: 'notification-3',
    user_id: 'user-1',
    household_id: 'household-1',
    title: 'Task Swap Request',
    message: 'Jordan Smith wants to swap "Grocery shopping" with you',
    type: 'swap_request',
    related_id: 'swap-1',
    related_table: 'task_swaps',
    read_at: null,
    created_at: subDays(new Date(), 0, { hours: 1 }).toISOString(),
    updated_at: subDays(new Date(), 0, { hours: 1 }).toISOString(),
  }
];

// Mock household settings
export const householdSettings = {
  default_currency: 'USD',
  task_reminder_days: 1,
  bill_reminder_days: 3,
  auto_assign_tasks: false,
  require_task_photos: false,
};

// Generate dashboard data
export const generateDashboardData = () => {
  const outstandingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'overdue').length;
  const totalBalanceOwed = bills.reduce((sum, bill) => {
    const userSplit = bill.splits.find(s => s.user_id === currentUser.id);
    if (userSplit) {
      const owed = parseFloat(userSplit.amount_owed) - parseFloat(userSplit.paid_amount);
      return sum + (owed > 0 ? owed : 0);
    }
    return sum;
  }, 0);

  const upcomingDeadlines = tasks.filter(t => {
    const dueDate = new Date(t.due_date);
    const weekFromNow = addDays(new Date(), 7);
    return dueDate <= weekFromNow && t.status === 'pending';
  }).length;

  return {
    kpis: {
      outstanding_tasks: outstandingTasks,
      total_balance_owed: totalBalanceOwed.toFixed(2),
      upcoming_deadlines: upcomingDeadlines,
      recent_activity_count: messages.length,
    },
    calendar_events: [
      ...tasks.filter(t => t.due_date).map(task => ({
        id: task.id,
        title: task.title,
        date: task.due_date.split('T')[0],
        type: 'task',
        amount: null,
        assigned_to: task.assignments[0]?.assigned_to_name || null,
      })),
      ...bills.filter(b => b.due_date).map(bill => ({
        id: bill.id,
        title: bill.title,
        date: bill.due_date,
        type: 'bill',
        amount: bill.total_amount,
        assigned_to: null,
      }))
    ],
    recent_activity: messages.slice(0, 5).map(msg => ({
      id: msg.id,
      type: msg.message_type,
      message: `${msg.user_name}: ${msg.content.slice(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
      timestamp: msg.created_at,
      user: {
        name: msg.user_name,
        avatar_url: msg.user_avatar,
      },
    })),
  };
};

// Calculate household balances
export const generateBalances = () => {
  const memberBalances = householdMembers.map(member => {
    const totalOwed = bills.reduce((sum, bill) => {
      const split = bill.splits.find(s => s.user_id === member.user_id);
      return split ? sum + parseFloat(split.amount_owed) : sum;
    }, 0);

    const totalPaid = bills.reduce((sum, bill) => {
      const split = bill.splits.find(s => s.user_id === member.user_id);
      return split ? sum + parseFloat(split.paid_amount) : sum;
    }, 0);

    return {
      user_id: member.user_id,
      user_name: member.full_name,
      avatar_url: member.avatar_url,
      total_owed: totalOwed.toFixed(2),
      total_paid: totalPaid.toFixed(2),
      net_balance: (totalPaid - totalOwed).toFixed(2),
    };
  });

  const summary = memberBalances.reduce((acc, balance) => {
    const netBalance = parseFloat(balance.net_balance);
    if (netBalance > 0) {
      acc.total_owed_to_household += netBalance;
    } else {
      acc.total_owed_by_household += Math.abs(netBalance);
    }
    return acc;
  }, {
    total_owed_to_household: 0,
    total_owed_by_household: 0,
  });

  summary.net_balance = summary.total_owed_to_household - summary.total_owed_by_household;

  return {
    summary: {
      total_owed_to_household: summary.total_owed_to_household.toFixed(2),
      total_owed_by_household: summary.total_owed_by_household.toFixed(2), 
      net_balance: summary.net_balance.toFixed(2),
    },
    member_balances: memberBalances,
    recent_transactions: bills.flatMap(bill => 
      bill.splits
        .filter(split => split.paid_date)
        .map(split => ({
          id: uuidv4(),
          bill_title: bill.title,
          user_name: split.user_name,
          amount: split.paid_amount,
          paid_date: split.paid_date,
        }))
    ).sort((a, b) => new Date(b.paid_date) - new Date(a.paid_date)).slice(0, 10),
  };
};
EOF

# ============================================================================