import { supabase } from "@/contexts/AuthContext";
import { REALTIME_CHANNELS } from "@/types/endpoints";
import React, { createContext, ReactNode, useContext, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useHousehold } from "./HouseholdContext";

type SubscriptionCallback = (payload: any) => void;

interface RealtimeContextType {
  // Core subscription management
  subscribe: (channel: string, table: string, callback: SubscriptionCallback) => () => void;
  subscribeToHousehold: (event: string, table: string, callback: SubscriptionCallback) => () => void;
  subscribeToUser: (event: string, table: string, callback: SubscriptionCallback) => () => void;

  // Connection status
  isConnected: boolean;
  connectionRetries: number;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold();
  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionRetries, setConnectionRetries] = React.useState(0);

  // Monitor connection status
  useEffect(() => {
    const handleConnectionChange = (status: string) => {
      setIsConnected(status === "SUBSCRIBED");
      if (status === "CLOSED" && connectionRetries < 3) {
        // Retry connection
        setTimeout(
          () => {
            setConnectionRetries((prev) => prev + 1);
          },
          1000 * Math.pow(2, connectionRetries)
        );
      }
    };

    // This would be implemented with actual Supabase realtime status
    // For now, assume connected when user is authenticated
    setIsConnected(!!user);
  }, [user, connectionRetries]);

  const subscribe = (channel: string, table: string, callback: SubscriptionCallback): (() => void) => {
    if (!user) return () => {};

    const channelKey = `${channel}:${table}`;

    // Clean up existing subscription
    if (subscriptionsRef.current.has(channelKey)) {
      const existingChannel = subscriptionsRef.current.get(channelKey);
      supabase.removeChannel(existingChannel);
    }

    // Create new subscription
    const realtimeChannel = supabase
      .channel(channel)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        callback
      )
      .subscribe();

    subscriptionsRef.current.set(channelKey, realtimeChannel);

    // Return cleanup function
    return () => {
      supabase.removeChannel(realtimeChannel);
      subscriptionsRef.current.delete(channelKey);
    };
  };

  const subscribeToHousehold = (event: string, table: string, callback: SubscriptionCallback): (() => void) => {
    if (!currentHousehold) return () => {};

    const channel = REALTIME_CHANNELS.CHAT(currentHousehold.id);
    return subscribe(channel, table, callback);
  };

  const subscribeToUser = (event: string, table: string, callback: SubscriptionCallback): (() => void) => {
    if (!user) return () => {};

    const channel = REALTIME_CHANNELS.NOTIFICATIONS(user.id);
    return subscribe(channel, table, callback);
  };

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  const value: RealtimeContextType = {
    subscribe,
    subscribeToHousehold,
    subscribeToUser,
    isConnected,
    connectionRetries,
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
