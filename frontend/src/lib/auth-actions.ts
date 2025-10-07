"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Server actions for authentication
export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Call Django backend directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/auth/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Login failed",
      };
    }

    // Set cookies from the server action
    const cookieStore = await cookies();
    
    cookieStore.set('questify_access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    cookieStore.set('questify_refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('questify_user_data', JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

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
    // Call Django backend directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/auth/register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, role }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Registration failed",
      };
    }

    // Set cookies from the server action
    const cookieStore = await cookies();
    
    cookieStore.set('questify_access_token', data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    cookieStore.set('questify_refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    cookieStore.set('questify_user_data', JSON.stringify(data.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

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
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("questify_access_token")?.value;
    const refreshToken = cookieStore.get("questify_refresh_token")?.value;

    // Call Django backend logout if we have tokens
    if (refreshToken) {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/auth/logout/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );
    }

    // Clear cookies
    cookieStore.delete("questify_access_token");
    cookieStore.delete("questify_refresh_token");
    cookieStore.delete("questify_user_data");
  } catch (error) {
    console.error("Logout action error:", error);
    // Continue with logout even if API call fails
  }

  // Revalidate and redirect
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
