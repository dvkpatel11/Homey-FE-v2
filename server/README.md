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
