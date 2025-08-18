// import { supabase } from "@/contexts/AuthContext";
// import { REALTIME_CHANNELS } from "@/types/endpoints";
// import React, { createContext, ReactNode, useContext, useEffect, useRef } from "react";
// import { useAuth } from "./AuthContext";
// import { useHousehold } from "./HouseholdContext";

// type SubscriptionCallback = (payload: any) => void;

// interface RealtimeContextType {
//   // Core subscription management
//   subscribe: (channel: string, table: string, callback: SubscriptionCallback) => () => void;
//   subscribeToHousehold: (event: string, table: string, callback: SubscriptionCallback) => () => void;
//   subscribeToUser: (event: string, table: string, callback: SubscriptionCallback) => () => void;

//   // Connection status
//   isConnected: boolean;
//   connectionRetries: number;
// }

// const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

// interface RealtimeProviderProps {
//   children: ReactNode;
// }

// export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
//   const { user } = useAuth();
//   const { currentHousehold } = useHousehold();
//   const subscriptionsRef = useRef<Map<string, any>>(new Map());
//   const [isConnected, setIsConnected] = React.useState(false);
//   const [connectionRetries, setConnectionRetries] = React.useState(0);

//   // Monitor connection status
//   useEffect(() => {
//     const handleConnectionChange = (status: string) => {
//       setIsConnected(status === "SUBSCRIBED");
//       if (status === "CLOSED" && connectionRetries < 3) {
//         // Retry connection
//         setTimeout(
//           () => {
//             setConnectionRetries((prev) => prev + 1);
//           },
//           1000 * Math.pow(2, connectionRetries)
//         );
//       }
//     };

//     // This would be implemented with actual Supabase realtime status
//     // For now, assume connected when user is authenticated
//     setIsConnected(!!user);
//   }, [user, connectionRetries]);

//   const subscribe = (channel: string, table: string, callback: SubscriptionCallback): (() => void) => {
//     if (!user) return () => {};

//     const channelKey = `${channel}:${table}`;

//     // Clean up existing subscription
//     if (subscriptionsRef.current.has(channelKey)) {
//       const existingChannel = subscriptionsRef.current.get(channelKey);
//       supabase.removeChannel(existingChannel);
//     }

//     // Create new subscription
//     const realtimeChannel = supabase
//       .channel(channel)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table,
//         },
//         callback
//       )
//       .subscribe();

//     subscriptionsRef.current.set(channelKey, realtimeChannel);

//     // Return cleanup function
//     return () => {
//       supabase.removeChannel(realtimeChannel);
//       subscriptionsRef.current.delete(channelKey);
//     };
//   };

//   const subscribeToHousehold = (event: string, table: string, callback: SubscriptionCallback): (() => void) => {
//     if (!currentHousehold) return () => {};

//     const channel = REALTIME_CHANNELS.CHAT(currentHousehold.id);
//     return subscribe(channel, table, callback);
//   };

//   const subscribeToUser = (event: string, table: string, callback: SubscriptionCallback): (() => void) => {
//     if (!user) return () => {};

//     const channel = REALTIME_CHANNELS.NOTIFICATIONS(user.id);
//     return subscribe(channel, table, callback);
//   };

//   // Cleanup all subscriptions on unmount
//   useEffect(() => {
//     return () => {
//       subscriptionsRef.current.forEach((channel) => {
//         supabase.removeChannel(channel);
//       });
//       subscriptionsRef.current.clear();
//     };
//   }, []);

//   const value: RealtimeContextType = {
//     subscribe,
//     subscribeToHousehold,
//     subscribeToUser,
//     isConnected,
//     connectionRetries,
//   };

//   return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
// };

// export const useRealtime = (): RealtimeContextType => {
//   const context = useContext(RealtimeContext);
//   if (context === undefined) {
//     throw new Error("useRealtime must be used within a RealtimeProvider");
//   }
//   return context;
// };

import { Household } from "@/types";
import { REALTIME_CHANNELS } from "@/types/endpoints";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

type SubscriptionCallback = (payload: any) => void;

interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  old?: any;
  new?: any;
  table: string;
}

interface RealtimeSubscription {
  channel: string;
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: SubscriptionCallback;
}

interface RealtimeStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  subscriptions: string[];
  lastHeartbeat: number | null;
}

interface RealtimeContextType extends RealtimeStatus {
  // Core subscription management
  subscribe: (config: RealtimeSubscription) => () => void;
  subscribeToHousehold: (
    householdId: string,
    table: string,
    event?: string,
    callback?: SubscriptionCallback
  ) => () => void;
  subscribeToUser: (table: string, event?: string, callback?: SubscriptionCallback) => () => void;

  // Advanced subscription management
  unsubscribe: (channelName: string) => void;
  unsubscribeAll: () => void;
  reconnect: () => Promise<void>;
  getConnectionStatus: () => "CONNECTING" | "OPEN" | "CLOSED";

  // Connection status
  isOnline: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  canReconnect: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

// Hook to detect online/offline status
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const isOnline = useOnlineStatus();

  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [status, setStatus] = React.useState<RealtimeStatus>({
    connected: false,
    reconnecting: false,
    error: null,
    subscriptions: [],
    lastHeartbeat: null,
  });

  const isDevelopment = process.env.NODE_ENV === "development";

  // Monitor connection status and handle online/offline
  useEffect(() => {
    if (isDevelopment) {
      // For mock server, simulate connection based on auth and online status
      const connected = !!user && isOnline;
      setStatus((prev) => ({
        ...prev,
        connected,
        error: !isOnline ? "Device offline" : null,
      }));
    } else {
      // Production: implement WebSocket connection monitoring
      setStatus((prev) => ({
        ...prev,
        connected: !!user && isOnline,
      }));
    }
  }, [user, isOnline, isDevelopment]);

  // Handle online/offline events
  useEffect(() => {
    if (!isOnline && status.connected) {
      setStatus((prev) => ({ ...prev, connected: false, error: "Device offline" }));
    } else if (isOnline && !status.connected && user) {
      reconnect();
    }
  }, [isOnline, status.connected, user]);

  // Start heartbeat when connected
  useEffect(() => {
    if (status.connected && !heartbeatTimer.current) {
      startHeartbeat();
    } else if (!status.connected && heartbeatTimer.current) {
      stopHeartbeat();
    }
  }, [status.connected]);

  const subscribe = useCallback(
    (config: RealtimeSubscription): (() => void) => {
      const { channel: channelName, table, event, filter, callback } = config;

      if (!user) return () => {};

      const channelKey = `${channelName}:${table}`;

      // Clean up existing subscription
      if (subscriptionsRef.current.has(channelKey)) {
        const existingCleanup = subscriptionsRef.current.get(channelKey);
        if (typeof existingCleanup === "function") {
          existingCleanup();
        }
      }

      try {
        if (isDevelopment) {
          // Mock implementation: Use polling for development
          const pollInterval = setInterval(() => {
            if (status.connected) {
              callback({
                eventType: "UPDATE",
                table,
                new: { updated_at: new Date().toISOString() },
              } as RealtimePayload);
            }
          }, 5000); // Poll every 5 seconds

          pollIntervalsRef.current.set(channelKey, pollInterval);

          const cleanup = () => {
            const interval = pollIntervalsRef.current.get(channelKey);
            if (interval) {
              clearInterval(interval);
              pollIntervalsRef.current.delete(channelKey);
            }
            setStatus((prev) => ({
              ...prev,
              subscriptions: prev.subscriptions.filter((s) => s !== channelName),
            }));
          };

          subscriptionsRef.current.set(channelKey, cleanup);
          setStatus((prev) => ({
            ...prev,
            subscriptions: [...prev.subscriptions, channelName],
            error: null,
          }));

          return cleanup;
        } else {
          // Production implementation
          const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/${channelName}`);

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              if (payload.table === table && (!filter || payload.filter === filter)) {
                callback(payload);
              }
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          ws.onopen = () => {
            setStatus((prev) => ({
              ...prev,
              connected: true,
              subscriptions: [...prev.subscriptions, channelName],
              error: null,
            }));
            reconnectAttemptsRef.current = 0;
          };

          ws.onclose = () => {
            setStatus((prev) => ({
              ...prev,
              subscriptions: prev.subscriptions.filter((s) => s !== channelName),
            }));

            if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              scheduleReconnect();
            }
          };

          ws.onerror = (error) => {
            console.error(`WebSocket error on channel ${channelName}:`, error);
            setStatus((prev) => ({
              ...prev,
              error: `Channel error: ${channelName}`,
            }));
          };

          const cleanup = () => {
            ws.close();
            setStatus((prev) => ({
              ...prev,
              subscriptions: prev.subscriptions.filter((s) => s !== channelName),
            }));
          };

          subscriptionsRef.current.set(channelKey, cleanup);
          return cleanup;
        }
      } catch (error) {
        console.error(`Failed to subscribe to channel ${channelName}:`, error);
        setStatus((prev) => ({
          ...prev,
          error: `Failed to subscribe: ${error instanceof Error ? error.message : "Unknown error"}`,
        }));
        return () => {};
      }
    },
    [user, isDevelopment, status.connected]
  );

  const subscribeToHousehold = useCallback(
    (householdId: string, table: string, event: string = "*", callback: SubscriptionCallback) => {
      // Choose channel based on table type
      let channel: string;
      switch (table) {
        case "messages":
          channel = REALTIME_CHANNELS.CHAT(householdId);
          break;
        case "tasks":
          channel = REALTIME_CHANNELS.TASKS(householdId);
          break;
        case "bills":
          channel = REALTIME_CHANNELS.BILLS(householdId);
          break;
        default:
          channel = `household:${householdId}:${table}`;
      }

      return subscribe({
        channel,
        table,
        event: event as any,
        filter: `household_id=eq.${householdId}`,
        callback,
      });
    },
    [subscribe]
  );

  const subscribeToUser = useCallback(
    (table: string, event: string = "*", callback?: SubscriptionCallback): (() => void) => {
      if (!user || !callback) return () => {};

      const channel = REALTIME_CHANNELS.NOTIFICATIONS(user.id);
      return subscribe({
        channel,
        table,
        event: event as any,
        filter: `user_id=eq.${user.id}`,
        callback,
      });
    },
    [user, subscribe]
  );

  const unsubscribe = useCallback((channelName: string) => {
    subscriptionsRef.current.forEach((cleanup, key) => {
      if (key.startsWith(channelName)) {
        if (typeof cleanup === "function") {
          cleanup();
        }
        subscriptionsRef.current.delete(key);
      }
    });
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((cleanup) => {
      if (typeof cleanup === "function") {
        cleanup();
      }
    });
    subscriptionsRef.current.clear();

    pollIntervalsRef.current.forEach((interval) => {
      clearInterval(interval);
    });
    pollIntervalsRef.current.clear();

    setStatus((prev) => ({ ...prev, subscriptions: [] }));
  }, []);

  const reconnect = useCallback(async (): Promise<void> => {
    if (status.reconnecting || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    setStatus((prev) => ({ ...prev, reconnecting: true, error: null }));
    reconnectAttemptsRef.current += 1;

    try {
      // Unsubscribe all current connections
      unsubscribeAll();

      // Wait before reconnecting
      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));

      // Check if we're still online
      if (!isOnline) {
        throw new Error("Device is offline");
      }

      setStatus((prev) => ({
        ...prev,
        reconnecting: false,
        connected: true,
        error: null,
      }));

      // Reset reconnect attempts on successful connection
      reconnectAttemptsRef.current = 0;
    } catch (error) {
      console.error("Reconnection failed:", error);
      setStatus((prev) => ({
        ...prev,
        reconnecting: false,
        error: `Reconnection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));

      // Schedule another reconnect attempt
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect();
      }
    }
  }, [status.reconnecting, isOnline, unsubscribeAll]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current); // Exponential backoff
    reconnectTimer.current = setTimeout(() => {
      reconnect();
    }, delay);
  }, [reconnect]);

  const getConnectionStatus = useCallback((): "CONNECTING" | "OPEN" | "CLOSED" => {
    if (isDevelopment) {
      return status.connected ? "OPEN" : "CLOSED";
    }
    // In production, check actual WebSocket status
    return status.connected ? "OPEN" : "CLOSED";
  }, [isDevelopment, status.connected]);

  const startHeartbeat = useCallback(() => {
    heartbeatTimer.current = setInterval(() => {
      setStatus((prev) => ({ ...prev, lastHeartbeat: Date.now() }));

      // Check if connection is still alive
      const connectionStatus = getConnectionStatus();
      if (connectionStatus === "CLOSED") {
        setStatus((prev) => ({ ...prev, connected: false }));
        scheduleReconnect();
      }
    }, HEARTBEAT_INTERVAL);
  }, [getConnectionStatus, scheduleReconnect]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  }, []);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((cleanup) => {
        if (typeof cleanup === "function") {
          cleanup();
        }
      });
      subscriptionsRef.current.clear();

      pollIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      pollIntervalsRef.current.clear();
    };
  }, []);

  const value: RealtimeContextType = {
    ...status,
    subscribe,
    subscribeToHousehold,
    subscribeToUser,
    unsubscribe,
    unsubscribeAll,
    reconnect,
    getConnectionStatus,
    isOnline,
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    canReconnect: reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = (): RealtimeContextType => {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};

// Custom hook for subscribing to specific data changes
export const useRealtimeSubscription = (
  householdId: string,
  table: string,
  callback: SubscriptionCallback,
  scope: "household" | "user" = "household",
  event: string = "*"
) => {
  const { subscribeToHousehold, subscribeToUser } = useRealtime();

  useEffect(() => {
    const unsubscribe =
      scope === "household"
        ? subscribeToHousehold(householdId, table, event, callback)
        : subscribeToUser(table, event, callback);

    return unsubscribe;
  }, [table, callback, scope, event, subscribeToHousehold, subscribeToUser]);
};

// Specialized hooks for common subscriptions
export const useHouseholdRealtime = (currentHousehold: Household | null) => {
  const { subscribe } = useRealtime();

  const subscribeToHouseholdChanges = useCallback(
    (callback: SubscriptionCallback) => {
      if (!currentHousehold) return () => {};

      return subscribe({
        channel: `household:${currentHousehold.id}`,
        table: "households",
        event: "UPDATE",
        filter: `id=eq.${currentHousehold.id}`,
        callback,
      });
    },
    [currentHousehold, subscribe]
  );

  const subscribeToMemberChanges = useCallback(
    (callback: SubscriptionCallback) => {
      if (!currentHousehold) return () => {};

      return subscribe({
        channel: `household-members:${currentHousehold.id}`,
        table: "household_members",
        event: "*",
        filter: `household_id=eq.${currentHousehold.id}`,
        callback,
      });
    },
    [currentHousehold, subscribe]
  );

  const subscribeToTaskChanges = useCallback(
    (callback: SubscriptionCallback) => {
      if (!currentHousehold) return () => {};

      return subscribe({
        channel: `household-tasks:${currentHousehold.id}`,
        table: "tasks",
        event: "*",
        filter: `household_id=eq.${currentHousehold.id}`,
        callback,
      });
    },
    [currentHousehold, subscribe]
  );

  const subscribeToBillChanges = useCallback(
    (callback: SubscriptionCallback) => {
      if (!currentHousehold) return () => {};

      return subscribe({
        channel: `household-bills:${currentHousehold.id}`,
        table: "bills",
        event: "*",
        filter: `household_id=eq.${currentHousehold.id}`,
        callback,
      });
    },
    [currentHousehold, subscribe]
  );

  const subscribeToMessageChanges = useCallback(
    (callback: SubscriptionCallback) => {
      if (!currentHousehold) return () => {};

      return subscribe({
        channel: REALTIME_CHANNELS.CHAT(currentHousehold.id),
        table: "messages",
        event: "*",
        filter: `household_id=eq.${currentHousehold.id}`,
        callback,
      });
    },
    [currentHousehold, subscribe]
  );

  return {
    subscribeToHouseholdChanges,
    subscribeToMemberChanges,
    subscribeToTaskChanges,
    subscribeToBillChanges,
    subscribeToMessageChanges,
  };
};

export const useUserRealtime = () => {
  const { user } = useAuth();
  const { subscribe } = useRealtime();

  const subscribeToUserNotifications = useCallback(
    (callback: SubscriptionCallback) => {
      if (!user) return () => {};

      return subscribe({
        channel: REALTIME_CHANNELS.NOTIFICATIONS(user.id),
        table: "notifications",
        event: "INSERT",
        filter: `user_id=eq.${user.id}`,
        callback,
      });
    },
    [user, subscribe]
  );

  return {
    subscribeToUserNotifications,
  };
};
