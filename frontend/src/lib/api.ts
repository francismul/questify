// This file provides client-side utilities for making requests to your own Next.js API routes
// It should NOT be used to directly contact the Django backend
// All Django communication should go through server components or server actions

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base URL for your Next.js API routes
const API_BASE = "/api";

// Client-side API utilities for communicating with Next.js API routes
export class ClientApiService {
  // Generic method for making requests to Next.js API routes
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: "Network error or unexpected error occurred",
      };
    }
  }

  // Auth-related API calls to Next.js routes
  static async login(email: string, password: string): Promise<ApiResponse> {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "student" | "teacher"
  ): Promise<ApiResponse> {
    return this.makeRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
  }

  static async logout(): Promise<ApiResponse> {
    return this.makeRequest("/auth/logout", {
      method: "POST",
    });
  }

  static async getCurrentUser(): Promise<ApiResponse> {
    return this.makeRequest("/auth/user");
  }

  static async refreshUserData(): Promise<ApiResponse> {
    return this.makeRequest("/auth/user", {
      method: "PUT",
    });
  }

  // Example: Client-side API call for updating user preferences
  // (This would call a Next.js API route, which then calls Django)
  static async updateUserPreferences(preferences: any): Promise<ApiResponse> {
    return this.makeRequest("/user/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    });
  }
}

// Legacy export for backward compatibility (if needed)
export default ClientApiService;

// Note: For server-side data fetching, use AuthServerService instead
// Examples:
//
// In a server component:
// import { AuthServerService } from '@/lib/auth-server';
// const courses = await AuthServerService.makeAuthenticatedRequest('/courses/');
//
// In a client component that needs to call a server action:
// import { somServerAction } from '@/lib/server-actions';
// const result = await someServerAction(data);
//
// In a client component that needs to call your Next.js API:
// import { ClientApiService } from '@/lib/api';
// const result = await ClientApiService.someMethod(data);
