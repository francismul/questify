# Testing Guide for Questify Frontend

A comprehensive guide to understanding and writing tests for the Next.js 15 frontend.

## Table of Contents
- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Testing Concepts](#testing-concepts)
- [Writing Unit Tests](#writing-unit-tests)
- [Writing Component Tests](#writing-component-tests)
- [Writing E2E Tests](#writing-e2e-tests)
- [Mocking](#mocking)
- [Best Practices](#best-practices)
- [Debugging Tests](#debugging-tests)
- [Common Patterns](#common-patterns)

## Overview

This project uses a **three-layer testing approach**:

1. **Unit Tests (Jest)** - Test individual functions and server actions in isolation
2. **Component Tests (React Testing Library)** - Test React components with user interactions
3. **End-to-End Tests (Playwright)** - Test complete user journeys across the application

Each layer serves a different purpose and provides different guarantees about your code quality.

## Testing Stack

### Jest (Unit & Component Tests)
- **What**: JavaScript testing framework
- **Why**: Fast, parallel test execution with great mocking capabilities
- **When**: Testing functions, server actions, and React components
- **Version**: 30.0.2

### React Testing Library (Component Tests)
- **What**: Library for testing React components from a user's perspective
- **Why**: Encourages accessible, user-centric testing practices
- **When**: Testing component rendering, user interactions, and state changes
- **Version**: 16.3.0

### Playwright (E2E Tests)
- **What**: End-to-end testing framework for web applications
- **Why**: Tests real browser behavior across Chrome, Firefox, and Safari
- **When**: Testing complete user workflows and cross-browser compatibility
- **Version**: 1.56.0

### MSW (Mock Service Worker)
- **What**: API mocking library that intercepts requests at the network level
- **Why**: Realistic API mocking without changing application code
- **When**: Testing components that make API calls
- **Version**: 2.11.3

## Project Structure

```
frontend/
├── e2e/                          # Playwright end-to-end tests
│   └── auth.spec.ts              # Authentication flow tests
├── src/
│   ├── lib/
│   │   ├── __tests__/            # Unit tests for utilities
│   │   │   └── auth-actions.test.ts
│   │   └── auth-actions.ts       # Server actions being tested
│   ├── components/
│   │   └── auth/
│   │       ├── __tests__/        # Component tests
│   │       │   └── AuthForm.test.tsx
│   │       └── AuthForm.tsx      # Component being tested
├── jest.config.ts                # Jest configuration
├── jest.setup.ts                 # Global test setup
└── playwright.config.ts          # Playwright configuration
```

**Convention**: Place test files in a `__tests__` directory next to the code they test.

## Running Tests

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

### Commands Explained

| Command | Description | When to Use |
|---------|-------------|-------------|
| `pnpm test` | Run all Jest tests once | CI/CD, before commits |
| `pnpm test:watch` | Run tests in watch mode | During development |
| `pnpm test:coverage` | Generate coverage report | Check test coverage |
| `pnpm test:e2e` | Run Playwright tests headless | CI/CD, automated testing |
| `pnpm test:e2e:ui` | Run Playwright with UI | Debugging E2E tests |
| `pnpm test:e2e:headed` | Run Playwright with browser visible | See tests execute live |

### Running Specific Tests

```bash
# Run tests matching a pattern
pnpm test auth

# Run a specific test file
pnpm test src/lib/__tests__/auth-actions.test.ts

# Run tests in a specific describe block
pnpm test -t "loginAction"

# Run E2E tests for a specific spec
pnpm test:e2e auth.spec.ts
```

## Testing Concepts

### The Testing Pyramid

```
       /\
      /E2E\          Few, slow, expensive
     /------\        Test complete workflows
    /Component\      More, medium speed
   /----------\      Test user interactions
  /   Unit     \     Many, fast, cheap
 /--------------\    Test logic in isolation
```

**Guideline**: Write more unit tests, fewer component tests, and even fewer E2E tests.

### Test Environments

#### `testEnvironment: 'node'` (Server Actions)
- Used for testing Next.js server actions
- No DOM available
- Mock `next/headers` and `next/navigation`
- Example: `auth-actions.test.ts`

#### `testEnvironment: 'jsdom'` (Components)
- Simulates browser environment
- DOM manipulation available
- Used with React Testing Library
- Example: `AuthForm.test.tsx`

### AAA Pattern (Arrange, Act, Assert)

Every test follows this structure:

```typescript
test('should do something', async () => {
  // ARRANGE: Set up test data and mocks
  const mockData = { email: 'test@example.com' };
  
  // ACT: Execute the code being tested
  const result = await loginAction(mockData);
  
  // ASSERT: Verify the outcome
  expect(result.success).toBe(true);
});
```

## Writing Unit Tests

### Example: Testing Server Actions

```typescript
// src/lib/__tests__/auth-actions.test.ts
import { loginAction } from '../auth-actions';

// Mock Next.js modules
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('loginAction', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('should successfully login with valid credentials', async () => {
    // ARRANGE: Mock successful API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
        user: { id: 1, email: 'test@example.com' }
      }),
    });

    // ACT: Call the server action
    const result = await loginAction({
      email: 'test@example.com',
      password: 'password123',
    });

    // ASSERT: Check the result
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/auth/login/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    );
  });

  test('should return error for invalid credentials', async () => {
    // ARRANGE: Mock failed API response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Invalid credentials' }),
    });

    // ACT
    const result = await loginAction({
      email: 'wrong@example.com',
      password: 'wrongpass',
    });

    // ASSERT
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid credentials');
  });
});
```

### Key Concepts for Unit Tests

1. **Isolation**: Each test should be independent
2. **Mocking**: Replace external dependencies (fetch, cookies, navigation)
3. **Coverage**: Test success cases, error cases, and edge cases
4. **Clarity**: Test names should describe what they test

## Writing Component Tests

### Example: Testing React Components

```typescript
// src/components/auth/__tests__/AuthForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../AuthForm';

// Mock server actions
jest.mock('@/lib/auth-actions', () => ({
  loginAction: jest.fn(),
  registerAction: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('AuthForm', () => {
  test('should render login form', () => {
    // ARRANGE & ACT: Render the component
    render(<AuthForm mode="login" />);
    
    // ASSERT: Check elements are present
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('should handle successful login', async () => {
    // ARRANGE
    const user = userEvent.setup();
    const mockLogin = require('@/lib/auth-actions').loginAction;
    mockLogin.mockResolvedValueOnce({ success: true });

    render(<AuthForm mode="login" />);

    // ACT: Fill and submit form
    await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    await user.type(screen.getByPlaceholderText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // ASSERT: Check action was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    // Initially hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click eye icon
    const toggleButton = screen.getAllByRole('button')[1]; // Eye icon button
    await user.click(toggleButton);

    // Now visible
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
```

### React Testing Library Queries (in priority order)

1. **getByRole** - Preferred, most accessible
   ```typescript
   screen.getByRole('button', { name: /sign in/i })
   ```

2. **getByLabelText** - For form elements
   ```typescript
   screen.getByLabelText(/email address/i)
   ```

3. **getByPlaceholderText** - When no label exists
   ```typescript
   screen.getByPlaceholderText(/enter email/i)
   ```

4. **getByText** - For non-interactive elements
   ```typescript
   screen.getByText(/welcome back/i)
   ```

5. **getByTestId** - Last resort
   ```typescript
   screen.getByTestId('login-form')
   ```

### User Interactions

```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Type text
await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');

// Click element
await user.click(screen.getByRole('button', { name: /submit/i }));

// Select option
await user.selectOptions(screen.getByRole('combobox'), 'student');

// Upload file
await user.upload(screen.getByLabelText(/upload/i), file);
```

## Writing E2E Tests

### Example: End-to-End Authentication Flow

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies before each test
    await page.context().clearCookies();
  });

  test('should complete full login flow', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');

    // Fill login form
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify redirect
    await expect(page).toHaveURL(/\/dashboard/);

    // Check cookies are set
    const cookies = await page.context().cookies();
    const accessToken = cookies.find(c => c.name === 'questify_access_token');
    expect(accessToken).toBeDefined();
    expect(accessToken?.httpOnly).toBe(true);
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForURL(/\/dashboard/);

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });
});
```

### Playwright Best Practices

1. **Use Auto-waiting**: Playwright automatically waits for elements
   ```typescript
   // ❌ Don't do this
   await page.waitForSelector('button');
   await page.click('button');
   
   // ✅ Do this
   await page.getByRole('button').click();
   ```

2. **Locator Strategy**: Prefer user-facing attributes
   ```typescript
   // ✅ Best: Accessible locators
   page.getByRole('button', { name: /submit/i })
   page.getByLabel(/email/i)
   page.getByPlaceholder(/search/i)
   
   // ⚠️ Okay: Text content
   page.getByText(/welcome/i)
   
   // ❌ Avoid: Implementation details
   page.locator('.btn-submit')
   page.locator('#email-input')
   ```

3. **Network Handling**: Wait for network idle
   ```typescript
   await page.goto('/auth/login');
   await page.waitForLoadState('networkidle');
   ```

4. **Assertions**: Use web-first assertions
   ```typescript
   // ✅ Web-first (auto-retrying)
   await expect(page.getByText(/success/i)).toBeVisible();
   
   // ❌ Generic (no retry)
   expect(await page.getByText(/success/i).isVisible()).toBe(true);
   ```

## Mocking

### Why Mock?

Mocking replaces real implementations with controlled versions for testing:
- **Isolation**: Test one thing at a time
- **Speed**: Avoid slow network requests
- **Reliability**: Control external dependencies
- **Edge Cases**: Simulate errors and unusual scenarios

### Mocking Next.js APIs

```typescript
// jest.setup.ts
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));
```

### Mocking Fetch API

```typescript
// In test file
beforeEach(() => {
  global.fetch = jest.fn();
});

test('should fetch data', async () => {
  // Mock successful response
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' }),
  });

  // Mock error response
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: async () => ({ error: 'Server error' }),
  });

  // Mock network error
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error('Network error')
  );
});
```

### Mocking External Libraries

```typescript
// Mock framer-motion (causes issues in tests)
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock icons
jest.mock('lucide-react', () => ({
  Eye: () => <span>Eye Icon</span>,
  EyeOff: () => <span>EyeOff Icon</span>,
  Mail: () => <span>Mail Icon</span>,
}));
```

## Best Practices

### 1. Write Descriptive Test Names

```typescript
// ❌ Bad
test('login test', () => {});

// ✅ Good
test('should redirect to dashboard after successful login', () => {});
test('should display error message when credentials are invalid', () => {});
```

### 2. One Assertion Per Concept

```typescript
// ❌ Bad: Testing multiple unrelated things
test('login', async () => {
  const result = await loginAction(data);
  expect(result.success).toBe(true);
  expect(cookies.set).toHaveBeenCalled();
  expect(redirect).toHaveBeenCalled();
  expect(fetch).toHaveBeenCalled();
});

// ✅ Good: Separate tests
test('should return success for valid credentials', async () => {
  const result = await loginAction(data);
  expect(result.success).toBe(true);
});

test('should set cookies after successful login', async () => {
  await loginAction(data);
  expect(cookies.set).toHaveBeenCalledWith('access_token', expect.any(String));
});
```

### 3. Clean Up After Tests

```typescript
describe('Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up if needed
    cleanup();
  });
});
```

### 4. Test User Perspective, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
test('should call setState with new value', () => {
  const { result } = renderHook(() => useState(0));
  // Testing internal state management
});

// ✅ Good: Testing user-visible behavior
test('should display error message for invalid email', async () => {
  render(<LoginForm />);
  await user.type(screen.getByPlaceholderText(/email/i), 'invalid');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});
```

### 5. Use Test Data Builders

```typescript
// Create reusable test data
const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'student',
  ...overrides,
});

test('should display user name', () => {
  const user = createMockUser({ firstName: 'John', lastName: 'Doe' });
  render(<UserProfile user={user} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

## Debugging Tests

### Debug Jest Tests

```typescript
// Use console.log
test('debug test', () => {
  console.log('Value:', result);
});

// Use screen.debug() to see rendered HTML
test('debug component', () => {
  render(<Component />);
  screen.debug(); // Prints entire DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});

// Run single test in debug mode
// Add .only to focus on one test
test.only('this test will run', () => {});
```

### Debug Playwright Tests

```bash
# Run with UI mode (best for debugging)
pnpm test:e2e:ui

# Run headed to see browser
pnpm test:e2e:headed

# Debug mode with step-by-step execution
pnpm playwright test --debug
```

### Common Issues & Solutions

#### Issue: "Cannot find module '@/lib/auth-actions'"
**Solution**: Check `jest.config.ts` has correct module name mapper:
```typescript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### Issue: "useRouter is not defined"
**Solution**: Ensure `jest.setup.ts` mocks Next.js navigation:
```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));
```

#### Issue: "Animation/Transition errors in tests"
**Solution**: Mock framer-motion in `jest.setup.ts`:
```typescript
jest.mock('framer-motion', () => ({
  motion: { div: 'div', button: 'button' },
}));
```

## Common Patterns

### Testing Forms

```typescript
test('should submit form with valid data', async () => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();
  
  render(<Form onSubmit={mockSubmit} />);
  
  await user.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
  });
});
```

### Testing Async Operations

```typescript
test('should handle loading state', async () => {
  render(<AsyncComponent />);
  
  // Check loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText(/data loaded/i)).toBeInTheDocument();
  });
  
  // Loading indicator should be gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
```

### Testing Error Boundaries

```typescript
test('should display error message on failure', async () => {
  // Mock console.error to avoid noise
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
  
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  
  consoleSpy.mockRestore();
});
```

### Testing Redirects

```typescript
import { redirect } from 'next/navigation';

test('should redirect after successful action', async () => {
  const mockRedirect = redirect as jest.Mock;
  
  await serverAction();
  
  expect(mockRedirect).toHaveBeenCalledWith('/dashboard');
});
```

## Coverage Reports

### Generate Coverage

```bash
pnpm test:coverage
```

### Understanding Coverage

```
------------|---------|----------|---------|---------|
File        | % Stmts | % Branch | % Funcs | % Lines |
------------|---------|----------|---------|---------|
auth-actions|   95.23 |    88.88 |     100 |   94.73 |
------------|---------|----------|---------|---------|
```

- **Statements**: Percentage of code statements executed
- **Branch**: Percentage of if/else branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

**Target**: Aim for 80%+ coverage, but quality > quantity.

## Next Steps

1. **Start with Unit Tests**: Test individual functions and utilities
2. **Add Component Tests**: Test user interactions and component behavior
3. **Finish with E2E Tests**: Test critical user journeys
4. **Integrate with CI/CD**: Run tests automatically on every commit
5. **Monitor Coverage**: Track coverage trends over time

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)

---

**Remember**: Good tests give you confidence to refactor and add features. Write tests that would help you understand the code if you came back to it in 6 months! 🚀
