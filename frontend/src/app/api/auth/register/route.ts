import { NextRequest, NextResponse } from "next/server";
import { AuthServerService, ApiError } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Email, password, first name, and last name are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (role && !["student", "teacher"].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "student" or "teacher"' },
        { status: 400 }
      );
    }

    // Attempt registration
    const authResponse = await AuthServerService.register(
      email,
      password,
      firstName,
      lastName,
      role || "student"
    );

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      user: authResponse.user,
    });

    // Set cookies directly on the response
    response.cookies.set("questify_access_token", authResponse.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("questify_refresh_token", authResponse.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    response.cookies.set(
      "questify_user_data",
      JSON.stringify(authResponse.user),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      }
    );

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
