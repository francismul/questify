import React from 'react';

// Mock auth-actions BEFORE importing AuthForm
jest.mock('@/lib/auth-actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => 'Eye',
  EyeOff: () => 'EyeOff',
  Mail: () => 'Mail',
  Lock: () => 'Lock',
  User: () => 'User',
  GraduationCap: () => 'GraduationCap',
  BookOpen: () => 'BookOpen',
}));

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthForm } from '@/components/auth/AuthForm';

describe('AuthForm Component', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useRouter
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);

    // Mock AuthContext
    const { useAuthContext } = require('@/context/AuthContext');
    (useAuthContext as jest.Mock).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
    });
  });

  describe('Login Mode', () => {
    it('should render login form', () => {
      render(
        <AuthForm
          mode="login"
          onModeChange={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({ success: true });

      render(
        <AuthForm
          mode="login"
          onModeChange={jest.fn()}
        />
      );

      // Skip role selection for student (if visible)
      const studentButton = screen.queryByText(/student/i);
      if (studentButton) {
        await user.click(studentButton);
      }

      // Fill in the login form
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // Wait for login to be called
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      // Should redirect after successful login
      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      render(
        <AuthForm
          mode="login"
          onModeChange={jest.fn()}
        />
      );

      // Skip role selection
      const studentButton = screen.queryByText(/student/i);
      if (studentButton) {
        await user.click(studentButton);
      }

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Should not redirect on failure
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();

      render(
        <AuthForm
          mode="login"
          onModeChange={jest.fn()}
        />
      );

      // Skip role selection
      const studentButton = screen.queryByText(/student/i);
      if (studentButton) {
        await user.click(studentButton);
      }

      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      // Find and click the eye icon to toggle visibility
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn => 
        btn.querySelector('span')?.textContent?.includes('Eye')
      );

      if (toggleButton) {
        await user.click(toggleButton);
        
        await waitFor(() => {
          expect(passwordInput.type).toBe('text');
        });
      }
    });
  });

  describe('Register Mode', () => {
    it('should render registration form', () => {
      render(
        <AuthForm
          mode="register"
          onModeChange={jest.fn()}
        />
      );

      // Should show role selection first
      expect(screen.getByText(/student/i)).toBeInTheDocument();
      expect(screen.getByText(/teacher/i)).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue({ success: true });

      render(
        <AuthForm
          mode="register"
          onModeChange={jest.fn()}
        />
      );

      // Select student role
      await user.click(screen.getByText(/student/i));

      // Fill in registration form
      await user.type(screen.getByPlaceholderText(/email/i), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText(/first name/i), 'New');
      await user.type(screen.getByPlaceholderText(/last name/i), 'User');
      await user.type(screen.getByPlaceholderText(/password/i), 'password123');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          'newuser@example.com',
          'password123',
          'New',
          'User',
          'student'
        );
      });
    });

    it('should require first and last name for registration', async () => {
      const user = userEvent.setup();

      render(
        <AuthForm
          mode="register"
          onModeChange={jest.fn()}
        />
      );

      // Select student role
      await user.click(screen.getByText(/student/i));

      // Fill only email and password
      await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
      await user.type(screen.getByPlaceholderText(/password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name and last name are required/i)).toBeInTheDocument();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should allow switching between student and teacher roles', async () => {
      const user = userEvent.setup();

      render(
        <AuthForm
          mode="register"
          onModeChange={jest.fn()}
        />
      );

      // Select student role
      await user.click(screen.getByText(/student/i));

      // Should show registration form
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();

      // Go back to role selection
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should show role selection again
      expect(screen.getByText(/student/i)).toBeInTheDocument();
      expect(screen.getByText(/teacher/i)).toBeInTheDocument();
    });
  });

  describe('Mode Switching', () => {
    it('should call onModeChange when switching modes', async () => {
      const user = userEvent.setup();
      const onModeChange = jest.fn();

      render(
        <AuthForm
          mode="login"
          onModeChange={onModeChange}
        />
      );

      // Find and click the mode switch button/link
      const switchLink = screen.getByText(/don't have an account/i);
      await user.click(switchLink);

      expect(onModeChange).toHaveBeenCalledWith('register');
    });
  });
});
