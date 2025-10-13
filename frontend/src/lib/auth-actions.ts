"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/**
 * Server Actions for Authentication (Next.js 14+ App Router)
 *
 * This file contains server actions for handling authentication:
 * - loginAction: Authenticate user and set auth cookies
 * - registerAction: Register new user and set auth cookies
 * - logoutAction: Clear auth cookies and redirect to login
 *
 * These actions can be called directly from forms and client components
 * without needing API routes.
 */

// Types
interface AuthResponse {
  access: string;
  refresh: string;
  user: {
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
  };
}

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Helper function to set auth cookies
async function setAuthCookies(authData: AuthResponse) {
  const cookieStore = await cookies();

  cookieStore.set("questify_access_token", authData.access, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60, // 1 hour
  });

  cookieStore.set("questify_refresh_token", authData.refresh, {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set("questify_user_data", JSON.stringify(authData.user), {
    ...COOKIE_CONFIG,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Helper function to clear auth cookies
async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete("questify_access_token");
  cookieStore.delete("questify_refresh_token");
  cookieStore.delete("questify_user_data");
}

// Server actions for authentication
export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Login failed",
      };
    }

    // Set cookies using helper function
    await setAuthCookies(data);

    // Revalidate any cached auth data
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function registerAction(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "student" | "teacher" = "student"
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        role,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Registration failed",
      };
    }

    // Set cookies using helper function
    await setAuthCookies(data);

    // Revalidate any cached auth data
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Registration action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();

  try {
    const accessToken = cookieStore.get("questify_access_token")?.value;
    const refreshToken = cookieStore.get("questify_refresh_token")?.value;

    // Call Django backend logout if we have tokens
    if (refreshToken && accessToken) {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } catch (error) {
    console.error("Logout action error:", error);
    // Continue with logout even if API call fails
  } finally {
    // Always clear cookies using helper function
    await clearAuthCookies();
  }

  // Revalidate and redirect
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// Course Management Actions

export interface CourseData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  color?: string;
  thumbnail?: string;
  tags?: string[];
}

export interface CourseResponse {
  id: string;
  title: string;
  description: string;
  teacher: string;
  teacher_id: string;
  teacher_name: string;
  thumbnail?: string;
  color: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  enrolled_students: string[];
  enrollment_count: number;
  rating?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function getTeacherCourses(): Promise<CourseResponse[]> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching teacher courses:", error);
    throw error;
  }
}

export async function createCourse(
  courseData: CourseData
): Promise<CourseResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    // Check if we have a file upload
    const hasFile = courseData.thumbnail ? (courseData.thumbnail as any) instanceof File : false;

    let response: Response;
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('difficulty', courseData.difficulty);
      formData.append('estimated_hours', courseData.estimated_hours.toString());
      if (courseData.color) formData.append('color', courseData.color);
      if (hasFile && courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      if (courseData.tags) formData.append('tags', JSON.stringify(courseData.tags));

      response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
    } else {
      // Use JSON for non-file data
      const requestData = {
        title: courseData.title,
        description: courseData.description,
        difficulty: courseData.difficulty,
        estimated_hours: courseData.estimated_hours,
        color: courseData.color,
        thumbnail: courseData.thumbnail,
        tags: courseData.tags,
      };

      response = await fetch(`${API_BASE_URL}/api/v1/courses/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to create course: ${response.status}`
      );
    }

    const data = await response.json();
    revalidatePath("/teacher/dashboard", "page");
    return data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function updateCourse(
  courseId: string,
  courseData: Partial<CourseData>
): Promise<CourseResponse> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/courses/${courseId}/`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to update course: ${response.status}`
      );
    }

    const data = await response.json();
    revalidatePath("/teacher/dashboard", "page");
    return data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}

export async function deleteCourse(courseId: string): Promise<void> {
  try {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("questify_access_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/courses/${courseId}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `Failed to delete course: ${response.status}`
      );
    }

    revalidatePath("/teacher/dashboard", "page");
  } catch (error) {
    console.error("Error deleting course:", error);
    throw error;
  }
}
