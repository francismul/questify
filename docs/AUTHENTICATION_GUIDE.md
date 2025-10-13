# Authentication Guide - Next.js 14+ App Router

## Overview

This project uses **Server Actions** for authentication, which is the modern Next.js 14+ App Router approach. All authentication logic has been consolidated to eliminate duplicates.

## File Structure

### Primary Authentication Files

- **`src/lib/auth-actions.ts`** - Server actions for login, register, logout
- **`src/lib/auth-server.ts`** - Server-side utilities for reading auth state and making authenticated requests

### Removed Files (Duplicates Eliminated)

- ❌ `src/app/api/auth/login/route.ts` - Removed (duplicate)
- ❌ `src/app/api/auth/register/route.ts` - Removed (duplicate) 
- ❌ `src/app/api/auth/logout/route.ts` - Removed (duplicate)
- ❌ `src/app/api/auth/user/route.ts` - Removed (duplicate)

## Usage Examples

### 1. Using Server Actions in Forms

```tsx
// In a client component form
"use client";

import { loginAction } from "@/lib/auth-actions";

export function LoginForm() {
  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const result = await loginAction(email, password);
    
    if (result.success) {
      // User will be automatically redirected via revalidatePath
      console.log("Login successful");
    } else {
      console.error("Login failed:", result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 2. Using Server Actions Directly

```tsx
// In any client component
import { registerAction, logoutAction } from "@/lib/auth-actions";

export function AuthComponent() {
  const handleRegister = async () => {
    const result = await registerAction(
      "user@example.com",
      "password123",
      "John",
      "Doe",
      "student"
    );
    
    if (result.success) {
      // User registered and logged in automatically
    } else {
      console.error(result.error);
    }
  };

  const handleLogout = async () => {
    await logoutAction(); // Automatically redirects to login
  };

  return (
    <div>
      <button onClick={handleRegister}>Register</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### 3. Server-Side Authentication Checks

```tsx
// In a server component or layout
import { AuthServerService } from "@/lib/auth-server";

export default async function DashboardPage() {
  // Require authentication - redirects to login if not authenticated
  const user = await AuthServerService.requireAuth();
  
  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

```tsx
// Optional authentication check
export default async function HomePage() {
  const user = await AuthServerService.getCurrentUser();
  
  return (
    <div>
      {user ? (
        <p>Welcome back, {user.first_name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### 4. Making Authenticated API Requests

```tsx
// In a server component
import { AuthServerService } from "@/lib/auth-server";

export default async function UserProfile() {
  try {
    const profile = await AuthServerService.makeAuthenticatedRequest('/user/profile/');
    
    return (
      <div>
        <h1>Profile</h1>
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      </div>
    );
  } catch (error) {
    // User will be automatically redirected if token is invalid
    return <div>Error loading profile</div>;
  }
}
```

## Benefits of This Approach

1. **No API Route Duplicates** - Single source of truth for auth logic
2. **Better Performance** - Direct server actions, no extra API hops
3. **Automatic Redirects** - Built-in redirect handling for auth failures
4. **Type Safety** - Full TypeScript support with server actions
5. **Modern Next.js** - Follows Next.js 14+ App Router best practices
6. **Automatic Token Refresh** - Built-in token refresh logic
7. **Cookie Management** - Secure, httpOnly cookie handling

## Migration Notes

If you have existing components using the old API routes (`/api/auth/*`), update them to use server actions:

- Replace `fetch('/api/auth/login')` with `loginAction(email, password)`
- Replace `fetch('/api/auth/register')` with `registerAction(...)`  
- Replace `fetch('/api/auth/logout')` with `logoutAction()`
- Use `AuthServerService.getCurrentUser()` instead of `fetch('/api/auth/user')`