import { notificationApi } from "@/lib/api";
import { DevicePlatform, DeviceToken, type Notification, NotificationListResponse, UUID, isApiSuccess } from "@/types";
import React, { ReactNode, createContext, useCallback, useContext, useEffect, useReducer } from "react";
import toast from "react-hot-toast";
import { supabase, useAuth } from "./AuthContext";
import { useHousehold } from "./HouseholdContext";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  pushEnabled: boolean;
  deviceTokenRegistered: boolean;
}

type NotificationAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_NOTIFICATIONS"; notifications: Notification[]; unreadCount: number }
  | { type: "ADD_NOTIFICATION"; notification: Notification }
  | { type: "MARK_READ"; notificationId: UUID }
  | { type: "MARK_ALL_READ" }
  | { type: "REMOVE_NOTIFICATION"; notificationId: UUID }
  | { type: "SET_PUSH_ENABLED"; enabled: boolean }
  | { type: "SET_DEVICE_TOKEN_REGISTERED"; registered: boolean }
  | { type: "CLEAR_NOTIFICATIONS" };

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };

    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.notifications,
        unreadCount: action.unreadCount,
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications],
        unreadCount: action.notification.read_at ? state.unreadCount : state.unreadCount + 1,
      };

    case "MARK_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notificationId ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      };

    case "REMOVE_NOTIFICATION":
      const wasUnread = !state.notifications.find((n) => n.id === action.notificationId)?.read_at;
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };

    case "SET_PUSH_ENABLED":
      return { ...state, pushEnabled: action.enabled };

    case "SET_DEVICE_TOKEN_REGISTERED":
      return { ...state, deviceTokenRegistered: action.registered };

    case "CLEAR_NOTIFICATIONS":
      return {
        ...state,
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
};

interface NotificationContextType extends NotificationState {
  // Notification management
  loadNotifications: () => Promise<void>;
  markAsRead: (notificationId: UUID) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: UUID) => Promise<void>;

  // Push notification management
  requestPermission: () => Promise<boolean>;
  registerDevice: () => Promise<boolean>;
  unregisterDevice: () => Promise<void>;

  // Real-time subscription
  subscribeToNotifications: () => () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentHousehold } = useHousehold(); // NOW PROPERLY USING HOUSEHOLD
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: false,
    pushEnabled: false,
    deviceTokenRegistered: false,
  });

  useEffect(() => {
    if (user) {
      loadNotifications();
      checkPushPermission();
    } else {
      dispatch({ type: "CLEAR_NOTIFICATIONS" });
    }
  }, [user, currentHousehold?.id]);

  const checkPushPermission = async () => {
    if ("Notification" in window) {
      const permission = Notification.permission;
      dispatch({ type: "SET_PUSH_ENABLED", enabled: permission === "granted" });
    }
  };

  const loadNotifications = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_LOADING", loading: true });

      const response = await notificationApi.getNotifications({
        limit: 50,
        read: undefined, // Get both read and unread
      });

      if (isApiSuccess<NotificationListResponse>(response)) {
        const { data, meta } = response.data;
        dispatch({
          type: "SET_NOTIFICATIONS",
          notifications: data,
          unreadCount: meta.unread_count || 0,
        });
      }
    } catch (error) {
      console.error("Load notifications error:", error);
      toast.error("Failed to load notifications");
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const markAsRead = async (notificationId: UUID): Promise<void> => {
    try {
      const response = await notificationApi.markAsRead(notificationId);

      if (isApiSuccess(response)) {
        dispatch({ type: "MARK_READ", notificationId });
      }
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    try {
      const response = await notificationApi.markAllAsRead();

      if (isApiSuccess(response)) {
        dispatch({ type: "MARK_ALL_READ" });
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Failed to mark notifications as read");
    }
  };

  const deleteNotification = async (notificationId: UUID): Promise<void> => {
    try {
      const response = await notificationApi.deleteNotification(notificationId);

      if (isApiSuccess(response)) {
        dispatch({ type: "REMOVE_NOTIFICATION", notificationId });
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete notification");
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";

      dispatch({ type: "SET_PUSH_ENABLED", enabled: granted });

      if (granted) {
        toast.success("Notifications enabled");
        await registerDevice();
      } else {
        toast.error("Notification permission denied");
      }

      return granted;
    } catch (error) {
      console.error("Request permission error:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  };

  const registerDevice = async (): Promise<boolean> => {
    if (!user || !state.pushEnabled) return false;

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Determine platform
      const platform = getPlatform();

      // Register device token
      const deviceToken: DeviceToken = {
        user_id: user.id,
        token: JSON.stringify(subscription),
        platform,
        active: true,
      };

      const response = await notificationApi.registerDevice(deviceToken);

      if (isApiSuccess(response)) {
        dispatch({ type: "SET_DEVICE_TOKEN_REGISTERED", registered: true });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Register device error:", error);
      toast.error("Failed to register for push notifications");
      return false;
    }
  };

  const unregisterDevice = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Unregister from backend
        const token = JSON.stringify(subscription);
        await notificationApi.unregisterDevice(token);
      }

      dispatch({ type: "SET_DEVICE_TOKEN_REGISTERED", registered: false });
      dispatch({ type: "SET_PUSH_ENABLED", enabled: false });

      toast.success("Push notifications disabled");
    } catch (error) {
      console.error("Unregister device error:", error);
      toast.error("Failed to disable push notifications");
    }
  };

  const subscribeToNotifications = useCallback((): (() => void) => {
    if (!user) return () => {};

    const channels: any[] = [];

    // Subscribe to user notifications
    const userChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;

          // FIXED: Only show notifications for current household or global ones
          if (
            !currentHousehold ||
            notification.household_id === currentHousehold.id ||
            notification.household_id === "system"
          ) {
            dispatch({ type: "ADD_NOTIFICATION", notification });
            showToastNotification(notification);
            showBrowserNotification(notification);
          }
        }
      )
      .subscribe();

    channels.push(userChannel);

    // FIXED: Subscribe to household notifications if in a household
    if (currentHousehold) {
      const householdChannel = supabase
        .channel(`household:${currentHousehold.id}:notifications`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `household_id=eq.${currentHousehold.id}`,
          },
          (payload) => {
            const notification = payload.new as Notification;
            if (notification.user_id === user.id) {
              dispatch({ type: "ADD_NOTIFICATION", notification });
              showToastNotification(notification);
              showBrowserNotification(notification);
            }
          }
        )
        .subscribe();

      channels.push(householdChannel);
    }

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [user, currentHousehold?.id]);
  
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToNotifications();
      return unsubscribe;
    }
  }, [user, currentHousehold?.id, subscribeToNotifications]);

  const showToastNotification = (notification: Notification) => {
    toast(notification.message, {
      duration: 4000,
      icon: getNotificationIcon(notification.type),
    });
  };

  const showBrowserNotification = (notification: Notification) => {
    if (state.pushEnabled && "Notification" in window) {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge.png",
        tag: notification.id,
      });
    }
  };

  const getPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("android")) {
      return DevicePlatform.ANDROID;
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      return DevicePlatform.IOS;
    } else {
      return DevicePlatform.WEB;
    }
  };

  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case "task_assigned":
      case "task_completed":
        return "✅";
      case "bill_due":
      case "payment_received":
        return "💰";
      case "swap_request":
        return "🔄";
      default:
        return "🏠";
    }
  };

  const value: NotificationContextType = {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
    registerDevice,
    unregisterDevice,
    subscribeToNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
