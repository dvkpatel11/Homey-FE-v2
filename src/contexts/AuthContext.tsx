// /**
//  * AuthContext - Authentication state management
//  * Handles user authentication, profile, and session management
//  */

// import { authApi } from "@/lib/api";
// import { isApiError, isApiSuccess, UpdateProfileRequest, UserProfile } from "@/types";
// import { createClient, Session, SupabaseClient, User } from "@supabase/supabase-js";
// import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
// import toast from "react-hot-toast";

// // Supabase client
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// interface AuthState {
//   user: User | null;
//   profile: UserProfile | null;
//   session: Session | null;
//   loading: boolean;
//   initialized: boolean;
// }

// type AuthAction =
//   | { type: "AUTH_LOADING" }
//   | { type: "AUTH_SUCCESS"; user: User; session: Session; profile?: UserProfile }
//   | { type: "AUTH_ERROR" }
//   | { type: "PROFILE_UPDATED"; profile: UserProfile }
//   | { type: "AUTH_LOGOUT" }
//   | { type: "AUTH_INITIALIZED" };

// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//   switch (action.type) {
//     case "AUTH_LOADING":
//       return { ...state, loading: true };

//     case "AUTH_SUCCESS":
//       return {
//         ...state,
//         user: action.user,
//         session: action.session,
//         profile: action.profile || state.profile,
//         loading: false,
//         initialized: true,
//       };

//     case "AUTH_ERROR":
//       return {
//         ...state,
//         user: null,
//         session: null,
//         profile: null,
//         loading: false,
//         initialized: true,
//       };

//     case "PROFILE_UPDATED":
//       return {
//         ...state,
//         profile: action.profile,
//       };

//     case "AUTH_LOGOUT":
//       return {
//         ...state,
//         user: null,
//         session: null,
//         profile: null,
//         loading: false,
//       };

//     case "AUTH_INITIALIZED":
//       return {
//         ...state,
//         initialized: true,
//         loading: false,
//       };

//     default:
//       return state;
//   }
// };

// interface AuthContextType extends AuthState {
//   signIn: (email: string, password: string) => Promise<boolean>;
//   signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
//   signOut: () => Promise<void>;
//   updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
//   refreshProfile: () => Promise<void>;
//   resetPassword: (email: string) => Promise<boolean>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [state, dispatch] = useReducer(authReducer, {
//     user: null,
//     profile: null,
//     session: null,
//     loading: true,
//     initialized: false,
//   });

//   // Initialize auth state
//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         // FIXED: Add timeout to prevent hanging
//         const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 10000));

//         const authPromise = supabase.auth.getSession();

//         const {
//           data: { session },
//         } = (await Promise.race([authPromise, timeoutPromise])) as any;

//         if (session?.user) {
//           await handleAuthSuccess(session.user, session);
//         } else {
//           dispatch({ type: "AUTH_INITIALIZED" });
//         }
//       } catch (error) {
//         console.error("Auth initialization error:", error);
//         dispatch({ type: "AUTH_ERROR" });

//         // ENHANCED: Show user-friendly error for timeout
//         if (error instanceof Error && error.message === "Auth timeout") {
//           toast.error("Authentication is taking longer than expected. Please refresh the page.");
//         }
//       }
//     };

//     initializeAuth();

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
//       if (event === "SIGNED_IN" && session?.user) {
//         await handleAuthSuccess(session.user, session);
//       } else if (event === "SIGNED_OUT") {
//         dispatch({ type: "AUTH_LOGOUT" });
//       } else if (event === "TOKEN_REFRESHED" && session?.user) {
//         await handleAuthSuccess(session.user, session);
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const handleAuthSuccess = async (user: User, session: Session) => {
//     try {
//       // Fetch user profile
//       const profileResponse = await authApi.getProfile();

//       if (isApiSuccess<UserProfile>(profileResponse)) {
//         dispatch({
//           type: "AUTH_SUCCESS",
//           user,
//           session,
//           profile: profileResponse.data,
//         });
//       } else {
//         dispatch({ type: "AUTH_SUCCESS", user, session });
//       }
//     } catch (error) {
//       console.error("Profile fetch error:", error);
//       dispatch({ type: "AUTH_SUCCESS", user, session });
//     }
//   };

//   const signIn = async (email: string, password: string): Promise<boolean> => {
//     try {
//       dispatch({ type: "AUTH_LOADING" });

//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         toast.error(error.message);
//         dispatch({ type: "AUTH_ERROR" });
//         return false;
//       }

//       if (data.user && data.session) {
//         await handleAuthSuccess(data.user, data.session);
//         toast.success("Welcome back!");
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error("Sign in error:", error);
//       toast.error("Failed to sign in");
//       dispatch({ type: "AUTH_ERROR" });
//       return false;
//     }
//   };

//   const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
//     try {
//       dispatch({ type: "AUTH_LOADING" });

//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             full_name: fullName,
//           },
//         },
//       });

//       if (error) {
//         toast.error(error.message);
//         dispatch({ type: "AUTH_ERROR" });
//         return false;
//       }

//       if (data.user) {
//         toast.success("Account created! Please check your email to verify.");
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error("Sign up error:", error);
//       toast.error("Failed to create account");
//       dispatch({ type: "AUTH_ERROR" });
//       return false;
//     }
//   };

//   const signOut = async (): Promise<void> => {
//     try {
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         toast.error("Failed to sign out");
//         return;
//       }

//       dispatch({ type: "AUTH_LOGOUT" });
//       toast.success("Signed out successfully");
//     } catch (error) {
//       console.error("Sign out error:", error);
//       toast.error("Failed to sign out");
//     }
//   };

//   const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
//     try {
//       const response = await authApi.updateProfile(data);

//       if (isApiSuccess<UserProfile>(response)) {
//         dispatch({ type: "PROFILE_UPDATED", profile: response.data });
//         toast.success("Profile updated successfully");
//         return true;
//       } else if (isApiError(response)) {
//         toast.error(response.error.message);
//       }

//       return false;
//     } catch (error) {
//       console.error("Profile update error:", error);
//       toast.error("Failed to update profile");
//       return false;
//     }
//   };

//   const refreshProfile = async (): Promise<void> => {
//     try {
//       const response = await authApi.getProfile();

//       if (isApiSuccess<UserProfile>(response)) {
//         dispatch({ type: "PROFILE_UPDATED", profile: response.data });
//       }
//     } catch (error) {
//       console.error("Profile refresh error:", error);
//     }
//   };

//   const resetPassword = async (email: string): Promise<boolean> => {
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: `${window.location.origin}/reset-password`,
//       });

//       if (error) {
//         toast.error(error.message);
//         return false;
//       }

//       toast.success("Password reset email sent");
//       return true;
//     } catch (error) {
//       console.error("Password reset error:", error);
//       toast.error("Failed to send reset email");
//       return false;
//     }
//   };

//   const value: AuthContextType = {
//     ...state,
//     signIn,
//     signUp,
//     signOut,
//     updateProfile,
//     refreshProfile,
//     resetPassword,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

/**
 * AuthContext - Authentication state management
 * Handles user authentication, profile, and session management
 * Works with both mock server (development) and production API
 */

import { STORAGE_KEYS } from "@/lib/hooks/useLocalStorage";
import { AuthRequest, AuthResponse, isApiError, isApiSuccess, UpdateProfileRequest, UserProfile } from "@/types/api";
import { API_ENDPOINTS } from "@/types/endpoints";
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from "react";
import toast from "react-hot-toast";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  initialized: boolean;
}

type AuthAction =
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; user: UserProfile; token: string; refreshToken: string }
  | { type: "AUTH_ERROR" }
  | { type: "PROFILE_UPDATED"; profile: UserProfile }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_INITIALIZED" }
  | { type: "TOKEN_REFRESHED"; token: string; refreshToken: string };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_LOADING":
      return { ...state, loading: true };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.user,
        token: action.token,
        refreshToken: action.refreshToken,
        loading: false,
        initialized: true,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        initialized: true,
      };

    case "PROFILE_UPDATED":
      return {
        ...state,
        user: action.profile,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
      };

    case "AUTH_INITIALIZED":
      return {
        ...state,
        initialized: true,
        loading: false,
      };

    case "TOKEN_REFRESHED":
      return {
        ...state,
        token: action.token,
        refreshToken: action.refreshToken,
      };

    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API client for auth operations
class AuthApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NODE_ENV === "development"
        ? "http://localhost:8000" // Your mock server
        : process.env.REACT_APP_API_URL || "";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: { message: "Network error", code: "NETWORK_ERROR" },
      }));
      throw new Error(errorData.error?.message || "Request failed");
    }

    return response.json();
  }

  async login(email: string, password: string) {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password } as AuthRequest),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async logout(token: string) {
    return this.request(API_ENDPOINTS.AUTH.LOGOUT, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getProfile(token: string) {
    return this.request<{ data: UserProfile }>(API_ENDPOINTS.PROFILE.GET, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async updateProfile(token: string, data: UpdateProfileRequest) {
    return this.request<{ data: UserProfile }>(API_ENDPOINTS.PROFILE.UPDATE, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
  }
}

const authApi = new AuthApiClient();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    refreshToken: null,
    loading: true,
    initialized: false,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("homey_access_token");
        const storedRefreshToken = localStorage.getItem("homey_refresh_token");
        const storedUser = localStorage.getItem("homey_user");

        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser) as UserProfile;

          // Verify token is still valid by fetching profile
          try {
            const profileResponse = await authApi.getProfile(storedToken);
            if (profileResponse.data) {
              dispatch({
                type: "AUTH_SUCCESS",
                user: profileResponse.data,
                token: storedToken,
                refreshToken: storedRefreshToken || "",
              });
              return;
            }
          } catch (error) {
            // Token might be expired, try to refresh
            if (storedRefreshToken) {
              const success = await refreshAccessToken(storedRefreshToken);
              if (success) return;
            }

            // Clear invalid tokens
            clearStoredAuth();
          }
        }

        dispatch({ type: "AUTH_INITIALIZED" });
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearStoredAuth();
        dispatch({ type: "AUTH_ERROR" });
      }
    };

    initializeAuth();
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  };

  const storeAuth = (user: UserProfile, token: string, refreshToken: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const refreshAccessToken = async (refreshToken?: string): Promise<boolean> => {
    try {
      const tokenToUse = refreshToken || state.refreshToken;
      if (!tokenToUse) return false;

      const response = await authApi.refreshToken(tokenToUse);

      if (isApiSuccess<AuthResponse>(response)) {
        const { access_token, refresh_token, user } = response.data;

        dispatch({
          type: "TOKEN_REFRESHED",
          token: access_token,
          refreshToken: refresh_token,
        });

        storeAuth(user, access_token, refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      const response = await authApi.login(email, password);

      if (isApiSuccess<AuthResponse>(response)) {
        const { access_token, refresh_token, user } = response.data;

        storeAuth(user, access_token, refresh_token);

        dispatch({
          type: "AUTH_SUCCESS",
          user,
          token: access_token,
          refreshToken: refresh_token,
        });

        toast.success("Welcome back!");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
        dispatch({ type: "AUTH_ERROR" });
        return false;
      }

      return false;
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in");
      dispatch({ type: "AUTH_ERROR" });
      return false;
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
    try {
      dispatch({ type: "AUTH_LOADING" });

      // For mock server, signup might auto-login or require email verification
      const response = await authApi.login(email, password); // Mock: treat as login

      if (isApiSuccess<AuthResponse>(response)) {
        const { access_token, refresh_token, user } = response.data;

        storeAuth(user, access_token, refresh_token);

        dispatch({
          type: "AUTH_SUCCESS",
          user,
          token: access_token,
          refreshToken: refresh_token,
        });

        toast.success("Account created successfully!");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account");
      dispatch({ type: "AUTH_ERROR" });
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      if (state.token) {
        await authApi.logout(state.token);
      }

      clearStoredAuth();
      dispatch({ type: "AUTH_LOGOUT" });
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still clear local state even if API call fails
      clearStoredAuth();
      dispatch({ type: "AUTH_LOGOUT" });
      toast.success("Signed out successfully");
    }
  };

  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    try {
      if (!state.token) return false;

      const response = await authApi.updateProfile(state.token, data);

      if (isApiSuccess<UserProfile>(response)) {
        const updatedUser = response.data;
        storeAuth(updatedUser, state.token, state.refreshToken || "");

        dispatch({ type: "PROFILE_UPDATED", profile: updatedUser });
        toast.success("Profile updated successfully");
        return true;
      } else if (isApiError(response)) {
        toast.error(response.error.message);
      }

      return false;
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
      return false;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      if (!state.token) return;

      const response = await authApi.getProfile(state.token);

      if (isApiSuccess<UserProfile>(response)) {
        dispatch({ type: "PROFILE_UPDATED", profile: response.data });
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // Mock implementation - in production this would hit your API
      toast.success("Password reset email sent (mock)");
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email");
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    resetPassword,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Utility hook for making authenticated API requests
export const useAuthenticatedRequest = () => {
  const { token, refreshAccessToken } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error("No authentication token");

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        return authenticatedFetch(url, options);
      }
      throw new Error("Authentication expired");
    }

    return response;
  };

  return { authenticatedFetch };
};
