import { NextRequest, NextResponse } from 'next/server';
import { AuthServerService, ApiError } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from the request
    const accessToken = request.cookies.get('questify_access_token')?.value;
    const userDataCookie = request.cookies.get('questify_user_data')?.value;
    
    if (!accessToken || !userDataCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse user data
    let user;
    try {
      user = JSON.parse(userDataCookie);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user data' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const isAuthenticated = await AuthServerService.isAuthenticated();
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Refresh user data from backend
    const user = await AuthServerService.refreshUserData();

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Refresh user error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}