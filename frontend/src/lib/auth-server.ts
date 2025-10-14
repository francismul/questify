import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * AuthServerService - Server-side authentication utilities
 * 
 * This service provides utilities for:
 * - Reading authentication state from cookies
 * - Making authenticated API requests with automatic token refresh
 * - Protecting server components and pages
 * 
 * For authentication actions (login, register, logout), use server actions
 * from auth-actions.ts instead of this service.
 */

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  role: "student" | "teacher";
  avatar?: string;
  total_xp: number;
  level: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ACCESS_TOKEN_COOKIE = "questify_access_token";
const REFRESH_TOKEN_COOKIE = "questify_refresh_token";
const USER_DATA_COOKIE = "questify_user_data";

// Cookie configuration
const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Server-side authentication utilities
export class AuthServerService {
  // Get access token from cookies
  static async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
  }

  // Get refresh token from cookies
  static async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null;
  }

  // Get user data from cookies
  static async getUserData(): Promise<User | null> {
    const cookieStore = await cookies();
    const userData = cookieStore.get(USER_DATA_COOKIE)?.value;

    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data from cookies:", error);
      return null;
    }
  }

  // Set authentication cookies (legacy - consider using server actions instead)
  static async setAuthCookies(authResponse: AuthResponse) {
    const cookieStore = await cookies();

    cookieStore.set(ACCESS_TOKEN_COOKIE, authResponse.access, {
      ...cookieConfig,
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set(REFRESH_TOKEN_COOKIE, authResponse.refresh, {
      ...cookieConfig,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set(USER_DATA_COOKIE, JSON.stringify(authResponse.user), {
      ...cookieConfig,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  // Clear authentication cookies (legacy - consider using server actions instead)
  static async clearAuthCookies() {
    const cookieStore = await cookies();

    cookieStore.delete(ACCESS_TOKEN_COOKIE);
    cookieStore.delete(REFRESH_TOKEN_COOKIE);
    cookieStore.delete(USER_DATA_COOKIE);
  }

  // Make authenticated API request with automatic token refresh
  static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = await this.getAccessToken();

    if (!token) {
      throw new Error("No access token available");
    }

    // First attempt with current token
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        // Don't set Content-Type for FormData - let the browser set it automatically
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // If token is expired, try to refresh
    if (response.status === 401) {
      const refreshToken = await this.getRefreshToken();
      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const refreshResponse = await fetch(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refresh: refreshToken }),
            }
          );

          if (refreshResponse.ok) {
            const { access } = await refreshResponse.json();

            // Update the access token in cookies
            const cookieStore = await cookies();
            cookieStore.set(ACCESS_TOKEN_COOKIE, access, {
              ...cookieConfig,
              maxAge: 60 * 60, // 1 hour
            });

            // Retry the original request with new token
            response = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers: {
                // Don't set Content-Type for FormData - let the browser set it automatically
                ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                Authorization: `Bearer ${access}`,
                ...options.headers,
              },
            });
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // If still unauthorized after refresh attempt, clear cookies and redirect
      if (response.status === 401) {
        await this.clearAuthCookies();
        redirect("/auth/login");
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  }



  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    const user = await this.getUserData();
    const refreshToken = await this.getRefreshToken();
    return !!token && !!user && !!refreshToken;
  }

  // Get current user or redirect to login
  static async requireAuth(): Promise<User> {
    const user = await this.getUserData();
    const token = await this.getAccessToken();

    if (!user || !token) {
      redirect("/auth/login");
    }

    return user;
  }

  // Get current user or return null
  static async getCurrentUser(): Promise<User | null> {
    return this.getUserData();
  }

  // Refresh user data from API
  static async refreshUserData(): Promise<User> {
    const userData = await this.makeAuthenticatedRequest<User>("/auth/user/");

    // Update user data in cookies
    const cookieStore = await cookies();
    cookieStore.set(USER_DATA_COOKIE, JSON.stringify(userData), {
      ...cookieConfig,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return userData;
  }
}

// Utility class for API errors
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}
