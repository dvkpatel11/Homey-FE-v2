/**
 * useRealtime - Real-time subscription management
 * Handles Supabase real-time subscriptions with connection management
 */

import { supabase, useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMobile } from "./useMobile";

export interface RealtimeSubscription {
  channel: string;
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: (payload: RealtimePostgresChangesPayload<any>) => void;
}

export interface RealtimeStatus {
  connected: boolean;
  reconnecting: boolean;
  error: string | null;
  subscriptions: string[];
  lastHeartbeat: number | null;
}

export interface RealtimeActions {
  subscribe: (config: RealtimeSubscription) => () => void;
  unsubscribe: (channelName: string) => void;
  unsubscribeAll: () => void;
  reconnect: () => Promise<void>;
  getConnectionStatus: () => "CONNECTING" | "OPEN" | "CLOSED";
}

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 2000; // 2 seconds
const MAX_RECONNECT_ATTEMPTS = 5;

export const useRealtime = () => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const { isOnline } = useMobile();

  const [status, setStatus] = useState<RealtimeStatus>({
    connected: false,
    reconnecting: false,
    error: null,
    subscriptions: [],
    lastHeartbeat: null,
  });

  const channels = useRef<Map<string, RealtimeChannel>>(new Map());
  const heartbeatTimer = useRef<NodeJS.Timeout>();
  const reconnectTimer = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);

  // Monitor connection status
  useEffect(() => {
    const updateStatus = () => {
      const connectionStatus = getConnectionStatus();
      setStatus((prev) => ({
        ...prev,
        connected: connectionStatus === "OPEN",
        error: connectionStatus === "CLOSED" ? "Connection lost" : null,
      }));
    };

    // Check status periodically
    const statusInterval = setInterval(updateStatus, 5000);
    updateStatus();

    return () => clearInterval(statusInterval);
  }, []);

  // Handle online/offline events
  useEffect(() => {
    if (!isOnline && status.connected) {
      setStatus((prev) => ({ ...prev, connected: false, error: "Device offline" }));
    } else if (isOnline && !status.connected) {
      reconnect();
    }
  }, [isOnline, status.connected]);

  // Start heartbeat when connected
  useEffect(() => {
    if (status.connected && !heartbeatTimer.current) {
      startHeartbeat();
    } else if (!status.connected && heartbeatTimer.current) {
      stopHeartbeat();
    }
  }, [status.connected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
      stopHeartbeat();
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  const subscribe = useCallback((config: RealtimeSubscription): (() => void) => {
    const { channel: channelName, table, event, filter, callback } = config;

    // Remove existing channel if it exists
    if (channels.current.has(channelName)) {
      unsubscribe(channelName);
    }

    try {
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event,
            schema: "public",
            table,
            filter,
          },
          callback
        )
        .on("system", {}, (payload) => {
          if (payload.event === "error") {
            console.error(`Realtime error on channel ${channelName}:`, payload);
            setStatus((prev) => ({
              ...prev,
              error: `Channel error: ${payload.message}`,
            }));
          }
        })
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            setStatus((prev) => ({
              ...prev,
              subscriptions: [...prev.subscriptions, channelName],
              error: null,
            }));
          } else if (status === "CHANNEL_ERROR") {
            console.error(`Channel ${channelName} error:`, err);
            setStatus((prev) => ({
              ...prev,
              error: `Subscription error: ${err?.message}`,
            }));
          } else if (status === "TIMED_OUT") {
            console.warn(`Channel ${channelName} timed out`);
            // Attempt to reconnect
            scheduleReconnect();
          } else if (status === "CLOSED") {
            setStatus((prev) => ({
              ...prev,
              subscriptions: prev.subscriptions.filter((s) => s !== channelName),
            }));
          }
        });

      channels.current.set(channelName, channel);

      // Return unsubscribe function
      return () => unsubscribe(channelName);
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channelName}:`, error);
      setStatus((prev) => ({
        ...prev,
        error: `Failed to subscribe: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
      return () => {};
    }
  }, []);

  const unsubscribe = useCallback((channelName: string) => {
    const channel = channels.current.get(channelName);
    if (channel) {
      try {
        supabase.removeChannel(channel);
        channels.current.delete(channelName);

        setStatus((prev) => ({
          ...prev,
          subscriptions: prev.subscriptions.filter((s) => s !== channelName),
        }));
      } catch (error) {
        console.error(`Failed to unsubscribe from channel ${channelName}:`, error);
      }
    }
  }, []);

  const unsubscribeAll = useCallback(() => {
    channels.current.forEach((_, channelName) => {
      unsubscribe(channelName);
    });
    channels.current.clear();

    setStatus((prev) => ({ ...prev, subscriptions: [] }));
  }, [unsubscribe]);

  const reconnect = useCallback(async () => {
    if (status.reconnecting || reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    setStatus((prev) => ({ ...prev, reconnecting: true, error: null }));
    reconnectAttempts.current += 1;

    try {
      // Get current subscriptions to re-establish
      const currentChannels = Array.from(channels.current.keys());

      // Unsubscribe all
      unsubscribeAll();

      // Wait before reconnecting
      await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));

      // Check if we're still online
      if (!isOnline) {
        throw new Error("Device is offline");
      }

      // Reset connection
      await supabase.realtime.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus((prev) => ({
        ...prev,
        reconnecting: false,
        connected: true,
        error: null,
      }));

      // Reset reconnect attempts on successful connection
      reconnectAttempts.current = 0;
    } catch (error) {
      console.error("Reconnection failed:", error);
      setStatus((prev) => ({
        ...prev,
        reconnecting: false,
        error: `Reconnection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));

      // Schedule another reconnect attempt
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        scheduleReconnect();
      }
    }
  }, [status.reconnecting, isOnline, unsubscribeAll]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current); // Exponential backoff
    reconnectTimer.current = setTimeout(() => {
      reconnect();
    }, delay);
  }, [reconnect]);

  const getConnectionStatus = useCallback((): "CONNECTING" | "OPEN" | "CLOSED" => {
    try {
      return supabase.realtime.connection?.readyState === WebSocket.OPEN
        ? "OPEN"
        : supabase.realtime.connection?.readyState === WebSocket.CONNECTING
          ? "CONNECTING"
          : "CLOSED";
    } catch {
      return "CLOSED";
    }
  }, []);

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
      heartbeatTimer.current = undefined;
    }
  }, []);

  const actions: RealtimeActions = {
    subscribe,
    unsubscribe,
    unsubscribeAll,
    reconnect,
    getConnectionStatus,
  };

  return {
    ...status,
    ...actions,
    isOnline,
    reconnectAttempts: reconnectAttempts.current,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    canReconnect: reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS,
  };
};

// Specialized hooks for common subscriptions
export const useHouseholdRealtime = () => {
  const { currentHousehold } = useHousehold();
  const { subscribe } = useRealtime();

  const subscribeToHouseholdChanges = useCallback(
    (callback: (payload: RealtimePostgresChangesPayload<any>) => void) => {
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
    (callback: (payload: RealtimePostgresChangesPayload<any>) => void) => {
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

  return {
    subscribeToHouseholdChanges,
    subscribeToMemberChanges,
  };
};

export const useUserRealtime = () => {
  const { user } = useAuth();
  const { subscribe } = useRealtime();

  const subscribeToUserNotifications = useCallback(
    (callback: (payload: RealtimePostgresChangesPayload<any>) => void) => {
      if (!user) return () => {};

      return subscribe({
        channel: `user-notifications:${user.id}`,
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

export default useRealtime;
