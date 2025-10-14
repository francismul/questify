import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthServerService, ApiError } from '@/lib/auth-server';

export async function PATCH(request: NextRequest) {
  try {
    // Get the request body as FormData to handle file uploads
    const formData = await request.formData();

    // Use AuthServerService to make authenticated request with automatic token refresh
    const userData = await AuthServerService.makeAuthenticatedRequest(
      '/auth/user/',
      {
        method: 'PATCH',
        body: formData,
      }
    );

    // Update user data in cookies so server components get fresh data
    const cookieStore = await cookies();
    cookieStore.set('questify_user_data', JSON.stringify(userData), {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Use AuthServerService to make authenticated request with automatic token refresh
    const userData = await AuthServerService.makeAuthenticatedRequest('/auth/user/');

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}