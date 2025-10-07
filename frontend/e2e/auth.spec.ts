import { test, expect } from '@playwright/test';

// Test fixtures with authentication state
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpass123',
  firstName: 'Test',
  lastName: 'User',
};

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Navigate to login page
      await page.goto('/auth/login');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Select student role if role selection is shown
      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      // Fill in login form
      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);

      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should redirect to home page or dashboard
      await expect(page).toHaveURL(/\/(?:$|profile|dashboard)/);

      // Check that cookies are set
      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      const refreshTokenCookie = cookies.find(c => c.name === 'questify_refresh_token');
      
      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(accessTokenCookie?.httpOnly).toBe(true);
      expect(refreshTokenCookie?.httpOnly).toBe(true);
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');

      // Select student role if needed
      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      // Fill in wrong credentials
      await page.getByPlaceholder(/email/i).fill('wrong@example.com');
      await page.getByPlaceholder(/password/i).fill('wrongpassword');

      // Submit form
      await page.getByRole('button', { name: /sign in/i }).click();

      // Should show error message
      await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible();

      // Should stay on login page
      await expect(page).toHaveURL(/\/auth\/login/);

      // No cookies should be set
      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      expect(accessTokenCookie).toBeUndefined();
    });

    test('should toggle password visibility', async ({ page }) => {
      await page.goto('/auth/login');

      // Select student role if needed
      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      const passwordInput = page.getByPlaceholder(/password/i);
      
      // Password should be hidden initially
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click eye icon to show password
      await page.locator('button').filter({ has: page.locator('svg') }).last().click();

      // Password should be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should redirect to home if already authenticated', async ({ page }) => {
      // First, login
      await page.goto('/auth/login');
      
      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL(/\/(?:$|profile|dashboard)/);

      // Try to visit login page again
      await page.goto('/auth/login');

      // Should redirect away from login
      await expect(page).not.toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Registration', () => {
    test('should successfully register a new student', async ({ page }) => {
      await page.goto('/auth/register');

      // Select student role
      await page.getByText('Student').first().click();

      // Fill in registration form
      const timestamp = Date.now();
      await page.getByPlaceholder(/email/i).fill(`student${timestamp}@example.com`);
      await page.getByPlaceholder(/first name/i).fill('New');
      await page.getByPlaceholder(/last name/i).fill('Student');
      await page.getByPlaceholder(/password/i).fill('password123');

      // Submit form
      await page.getByRole('button', { name: /create account/i }).click();

      // Should redirect after successful registration
      await expect(page).toHaveURL(/\/(?:$|profile|dashboard)/);

      // Cookies should be set
      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      expect(accessTokenCookie).toBeDefined();
    });

    test('should successfully register a new teacher', async ({ page }) => {
      await page.goto('/auth/register');

      // Select teacher role
      await page.getByText('Teacher').first().click();

      // Fill in registration form
      const timestamp = Date.now();
      await page.getByPlaceholder(/email/i).fill(`teacher${timestamp}@example.com`);
      await page.getByPlaceholder(/first name/i).fill('New');
      await page.getByPlaceholder(/last name/i).fill('Teacher');
      await page.getByPlaceholder(/password/i).fill('password123');

      // Submit form
      await page.getByRole('button', { name: /create account/i }).click();

      // Should redirect after successful registration
      await expect(page).toHaveURL(/\/(?:$|profile|dashboard)/);
    });

    test('should allow going back to role selection', async ({ page }) => {
      await page.goto('/auth/register');

      // Select student role
      await page.getByText('Student').first().click();

      // Should show registration form
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();

      // Click back button
      await page.getByRole('button', { name: /back/i }).click();

      // Should show role selection again
      await expect(page.getByText('Student')).toBeVisible();
      await expect(page.getByText('Teacher')).toBeVisible();
    });

    test('should require all fields for registration', async ({ page }) => {
      await page.goto('/auth/register');

      // Select student role
      await page.getByText('Student').first().click();

      // Try to submit without filling fields
      await page.getByRole('button', { name: /create account/i }).click();

      // Should show error
      await expect(page.getByText(/required/i)).toBeVisible();
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page }) => {
      // First login
      await page.goto('/auth/login');

      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL(/\/(?:$|profile|dashboard)/);

      // Find and click logout button
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
      await logoutButton.click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/login/);

      // Cookies should be cleared
      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      expect(accessTokenCookie).toBeUndefined();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without login
      await page.goto('/profile');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // First login
      await page.goto('/auth/login');

      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      // Now try to access protected route
      await page.goto('/profile');

      // Should be able to access it
      await expect(page).toHaveURL(/\/profile/);
      
      // Should see user information
      await expect(page.getByText(TEST_USER.firstName)).toBeVisible();
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Login
      await page.goto('/auth/login');

      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL(/\/(?:$|profile|dashboard)/);

      // Reload the page
      await page.reload();

      // Should still be authenticated
      await expect(page).not.toHaveURL(/\/auth\/login/);

      // Cookies should still be present
      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      expect(accessTokenCookie).toBeDefined();
    });
  });

  test.describe('Cookie Security', () => {
    test('should set HttpOnly and Secure flags on cookies', async ({ page }) => {
      await page.goto('/auth/login');

      const studentButton = page.getByText('Student').first();
      if (await studentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await studentButton.click();
      }

      await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
      await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
      await page.getByRole('button', { name: /sign in/i }).click();

      await page.waitForURL(/\/(?:$|profile|dashboard)/);

      const cookies = await page.context().cookies();
      const accessTokenCookie = cookies.find(c => c.name === 'questify_access_token');
      const refreshTokenCookie = cookies.find(c => c.name === 'questify_refresh_token');

      // Check HttpOnly flag
      expect(accessTokenCookie?.httpOnly).toBe(true);
      expect(refreshTokenCookie?.httpOnly).toBe(true);

      // Check SameSite attribute
      expect(accessTokenCookie?.sameSite).toBe('Lax');
      expect(refreshTokenCookie?.sameSite).toBe('Lax');

      // Note: Secure flag is only set in production
      if (process.env.NODE_ENV === 'production') {
        expect(accessTokenCookie?.secure).toBe(true);
        expect(refreshTokenCookie?.secure).toBe(true);
      }
    });
  });
});
