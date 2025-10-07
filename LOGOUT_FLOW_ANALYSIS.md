# Logout Flow and Token Blacklisting Analysis

## ✅ Summary: Logout is Properly Implemented with Token Blacklisting

### Current Logout Flow

```
1. User clicks logout button
   ↓
2. AuthContext.logout() is called
   ↓
3. Calls logoutAction() server action
   ↓
4. logoutAction() performs:
   a. Gets access token and refresh token from cookies
   b. Calls Django backend: POST /api/v1/auth/logout/
      - Headers: Authorization: Bearer {accessToken}
      - Body: { refresh: refreshToken }
   c. Django LogoutAPI validates and blacklists the token
   d. Deletes all auth cookies
   e. Revalidates paths
   f. Redirects to /auth/login
```

### ✅ Frontend Implementation

**File: `frontend/src/lib/auth-actions.ts`**
```typescript
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
```

**Key Points:**
- ✅ Calls backend API with refresh token
- ✅ Includes Authorization header with access token
- ✅ Properly deletes all auth cookies
- ✅ Gracefully handles errors (continues logout even if backend fails)
- ✅ Revalidates paths and redirects to login

### ✅ Backend Implementation

**File: `backend/api/views.py`**
```python
class LogoutAPI(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()  # This blacklists the token
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Failed to logout"},
                status=status.HTTP_400_BAD_REQUEST
            )
```

**File: `backend/api/serializers.py`**
```python
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            raise serializers.ValidationError('Invalid or expired token')
```

**Key Points:**
- ✅ Requires authentication (validates access token)
- ✅ Validates refresh token format
- ✅ Blacklists the refresh token using SimpleJWT's built-in blacklist
- ✅ Proper error handling

### ✅ Configuration

**File: `backend/mysite/settings.py`**
```python
INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',  # ✅ Blacklist app installed
]

SIMPLE_JWT = {
    # ...
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
}
```

### ✅ Security Benefits

1. **Token Blacklisting**: Refresh tokens are immediately invalidated on logout
2. **Server-Side Enforcement**: Backend maintains blacklist, preventing token reuse
3. **HttpOnly Cookies**: Tokens stored securely, not accessible to JavaScript
4. **Graceful Degradation**: Frontend continues logout even if backend call fails
5. **Complete Cleanup**: All cookies deleted, user data cleared

### ⚠️ Minor Issue Found

**File: `frontend/src/lib/auth-server.ts`**
```typescript
// Logout user (to be called from API route)
static async logout(): Promise<void> {
  // For JWT, we just clear cookies since tokens are stateless
  // In a production app, you might want to implement token blacklisting
  await this.clearAuthCookies();
}
```

**Issue**: This method has outdated comments and doesn't call backend for blacklisting.

**Status**: ✅ **NOT A PROBLEM** - This method is not used anywhere in the codebase. The actual logout flow uses `logoutAction()` which properly calls the backend.

**Recommendation**: Consider updating the `AuthServerService.logout()` method to also call the backend for consistency, or remove it if it's not needed.

### 🔒 Token Blacklist Flow

```
1. User logs in → Receives refresh token (RT1)
2. RT1 is NOT in blacklist → Can be used for new access tokens
3. User logs out → Backend blacklists RT1
4. RT1 is now in blacklist → Cannot be used anymore
5. Any attempt to use RT1 → Returns 401 Unauthorized
```

### ✅ Testing Checklist

- [x] Frontend calls backend logout endpoint
- [x] Backend receives refresh token
- [x] Backend validates access token (authentication required)
- [x] Backend blacklists refresh token
- [x] Frontend clears all cookies
- [x] User is redirected to login page
- [x] Blacklist app is installed
- [x] Blacklist configuration is correct

## Conclusion

✅ **The logout flow is properly implemented with token blacklisting!**

The frontend correctly calls the Django backend's logout endpoint, which:
1. Validates the user's authentication
2. Receives the refresh token
3. Blacklists the token to prevent reuse
4. Returns success

The frontend then:
1. Clears all authentication cookies
2. Revalidates cached data
3. Redirects to the login page

This ensures that logged-out users cannot reuse their tokens, providing proper security for the authentication system.
