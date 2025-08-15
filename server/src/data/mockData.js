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
