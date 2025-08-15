# Homey API Types

This directory contains all TypeScript type definitions for the Homey household management app API.

## Files

- **`api.ts`** - Complete type definitions matching FastAPI Pydantic models
- **`endpoints.ts`** - Centralized API endpoint definitions
- **`validation.ts`** - Runtime validation helpers and type guards
- **`index.ts`** - Main export file for clean imports

## Usage

### Basic Import

```typescript
import { UserProfile, Task, Bill, API_ENDPOINTS } from "@/types";
```

### API Response Handling

```typescript
import { ApiResponse, isApiSuccess, isApiError } from "@/types";

const response = await fetch("/api/households");
const data = await response.json();

if (isApiSuccess<Household[]>(data)) {
  // TypeScript knows data.data is Household[]
  console.log(data.data);
} else if (isApiError(data)) {
  // TypeScript knows data.error exists
  console.error(data.error.message);
}
```

### Endpoint Usage

```typescript
import { API_ENDPOINTS } from "@/types";

// Type-safe endpoint building
const url = API_ENDPOINTS.HOUSEHOLDS.GET(householdId);
const tasksUrl = API_ENDPOINTS.HOUSEHOLDS.TASKS(householdId);
```

### Validation

```typescript
import { validateCreateTask, validateEmail } from "@/types";

const taskData = { title: "", description: "Test task" };
const validation = validateCreateTask(taskData);

if (!validation.isValid) {
  console.log(validation.errors); // { title: 'Task title is required' }
}
```

## Type Safety Guidelines

1. **Always use type guards** for API responses
2. **Validate user input** before sending to API
3. **Use enums** instead of string literals
4. **Handle decimal precision** with string types for money

## Real-time Subscriptions

```typescript
import { REALTIME_CHANNELS, RealtimePayload, Message } from "@/types";

const channel = supabase.channel(REALTIME_CHANNELS.CHAT(householdId));
channel.on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "messages",
    filter: `household_id=eq.${householdId}`,
  },
  (payload: RealtimePayload<Message>) => {
    // Handle real-time message updates
  }
);
```

## Regeneration

To regenerate these types, run:

```bash
./scripts/generate-types.sh
```

This will backup existing types and generate fresh ones based on the latest Pydantic models.
