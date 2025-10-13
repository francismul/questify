import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function PATCH(request: NextRequest) {
  try {
    // Get the access token from HTTP-only cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('questify_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the request body as FormData to handle file uploads
    const formData = await request.formData();

    // Forward the request to Django backend
    const backendResponse = await fetch(`${API_BASE_URL}/auth/user/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to update profile' },
        { status: backendResponse.status }
      );
    }

    const userData = await backendResponse.json();

    // Update user data in cookies so server components get fresh data
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the access token from HTTP-only cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('questify_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Forward the request to Django backend
    const backendResponse = await fetch(`${API_BASE_URL}/auth/user/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch user profile' },
        { status: backendResponse.status }
      );
    }

    const userData = await backendResponse.json();

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}