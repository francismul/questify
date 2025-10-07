/**
 * @jest-environment node
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginAction, registerAction, logoutAction } from '@/lib/auth-actions';

// Mock the modules
jest.mock('next/headers');
jest.mock('next/navigation');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Auth Actions', () => {
  let mockCookieStore: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup cookie store mock
    mockCookieStore = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  describe('loginAction', () => {
    it('should successfully login and set cookies', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: '123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            name: 'Test User',
            role: 'student',
          },
          access: 'access-token-123',
          refresh: 'refresh-token-123',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await loginAction('test@example.com', 'password123');

      // Verify fetch was called correctly
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      // Verify cookies were set
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'questify_access_token',
        'access-token-123',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'questify_refresh_token',
        'refresh-token-123',
        expect.any(Object)
      );

      expect(result).toEqual({ success: true });
    });

    it('should handle login failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Invalid credentials' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await loginAction('test@example.com', 'wrongpassword');

      expect(result).toEqual({
        success: false,
        error: 'Invalid credentials',
      });

      // Cookies should not be set on failure
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await loginAction('test@example.com', 'password123');

      expect(result).toEqual({
        success: false,
        error: 'An unexpected error occurred during login',
      });
    });
  });

  describe('registerAction', () => {
    it('should successfully register and set cookies', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          user: {
            id: '456',
            email: 'newuser@example.com',
            first_name: 'New',
            last_name: 'User',
            name: 'New User',
            role: 'student',
          },
          access: 'new-access-token',
          refresh: 'new-refresh-token',
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await registerAction(
        'newuser@example.com',
        'password123',
        'New',
        'User',
        'student'
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/register/'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'newuser@example.com',
            password: 'password123',
            first_name: 'New',
            last_name: 'User',
            role: 'student',
          }),
        })
      );

      expect(result).toEqual({ success: true });
      expect(mockCookieStore.set).toHaveBeenCalledTimes(3); // access, refresh, user_data
    });

    it('should handle registration failure', async () => {
      const mockResponse = {
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await registerAction(
        'existing@example.com',
        'password123',
        'Test',
        'User',
        'student'
      );

      expect(result).toEqual({
        success: false,
        error: 'Email already exists',
      });
    });
  });

  describe('logoutAction', () => {
    it('should call backend logout and clear cookies', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'questify_access_token') return { value: 'access-token' };
        if (name === 'questify_refresh_token') return { value: 'refresh-token' };
        return undefined;
      });

      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Logged out' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      try {
        await logoutAction();
      } catch (error) {
        // redirect throws an error in tests, this is expected
      }

      // Verify backend was called
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/logout/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer access-token',
          }),
          body: JSON.stringify({ refresh: 'refresh-token' }),
        })
      );

      // Verify cookies were deleted
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_refresh_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_user_data');

      // Verify redirect was called
      expect(redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should still clear cookies even if backend call fails', async () => {
      mockCookieStore.get.mockImplementation((name: string) => {
        if (name === 'questify_refresh_token') return { value: 'refresh-token' };
        return undefined;
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await logoutAction();
      } catch (error) {
        // redirect throws an error in tests
      }

      // Cookies should still be deleted
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_access_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_refresh_token');
      expect(mockCookieStore.delete).toHaveBeenCalledWith('questify_user_data');
    });
  });
});
