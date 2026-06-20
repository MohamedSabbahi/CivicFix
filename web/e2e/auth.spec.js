import { test, expect } from '@playwright/test';

const API_BASE = '**/api';

test.describe('Login page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error on bad credentials', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async route => {
      await route.fulfill({
        status: 400,
        json: { message: 'Invalid email or password' },
      });
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@test.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async route => {
      await route.fulfill({
        status: 200,
        json: {
          token: 'fake-token',
          user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'CITIZEN' },
        },
      });
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({
        status: 200,
        json: { id: 1, name: 'Test User', email: 'test@test.com', role: 'CITIZEN' },
      });
    });

    await page.route(`${API_BASE}/reports**`, async route => {
      await route.fulfill({ status: 200, json: { data: [], results: 0 } });
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@test.com');
    await page.fill('input[name="password"]', 'Password1');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });

  test('redirects admin user to /admin on successful login', async ({ page }) => {
    await page.route(`${API_BASE}/auth/login`, async route => {
      await route.fulfill({
        status: 200,
        json: {
          token: 'fake-admin-token',
          user: { id: 2, name: 'Admin User', email: 'admin@civicfix.com', role: 'ADMIN' },
        },
      });
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({
        status: 200,
        json: { id: 2, name: 'Admin User', email: 'admin@civicfix.com', role: 'ADMIN' },
      });
    });

    await page.route(`${API_BASE}/admin/**`, async route => {
      await route.fulfill({ status: 200, json: { data: [] } });
    });

    await page.route(`${API_BASE}/reports**`, async route => {
      await route.fulfill({ status: 200, json: { data: [], results: 0 } });
    });

    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@civicfix.com');
    await page.fill('input[name="password"]', 'AdminPass1');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin');
  });
});

test.describe('Register page', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[id="email"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.locator('input[id="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'new@test.com');
    await page.fill('input[id="password"]', 'Password1');
    await page.fill('input[id="confirmPassword"]', 'DifferentPass1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('shows error for existing email', async ({ page }) => {
    await page.route(`${API_BASE}/auth/register`, async route => {
      await route.fulfill({
        status: 400,
        json: { message: 'Email already in use' },
      });
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 401, json: { message: 'Unauthorized' } });
    });

    await page.goto('/register');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[id="email"]', 'existing@test.com');
    await page.fill('input[id="password"]', 'Password1');
    await page.fill('input[id="confirmPassword"]', 'Password1');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email already in use')).toBeVisible();
  });

  test('successful registration navigates away', async ({ page }) => {
    await page.route(`${API_BASE}/auth/register`, async route => {
      await route.fulfill({
        status: 201,
        json: {
          token: 'fake-token',
          user: { id: 3, name: 'New User', email: 'new@test.com', role: 'CITIZEN' },
        },
      });
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({
        status: 200,
        json: { id: 3, name: 'New User', email: 'new@test.com', role: 'CITIZEN' },
      });
    });

    await page.route(`${API_BASE}/reports**`, async route => {
      await route.fulfill({ status: 200, json: { data: [], results: 0 } });
    });

    await page.goto('/register');
    await page.fill('input[id="name"]', 'New User');
    await page.fill('input[id="email"]', 'new@test.com');
    await page.fill('input[id="password"]', 'Password1');
    await page.fill('input[id="confirmPassword"]', 'Password1');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });
});

test.describe('Forgot password page', () => {
  test('shows email input form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('text=Forgot Password?')).toBeVisible();
  });

  test('shows error for unknown email', async ({ page }) => {
    await page.route(`${API_BASE}/auth/forgotPassword`, async route => {
      await route.fulfill({
        status: 404,
        json: { message: 'Email not found' },
      });
    });

    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'unknown@test.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email not found')).toBeVisible();
  });

  test('shows success state after sending reset code', async ({ page }) => {
    await page.route(`${API_BASE}/auth/forgotPassword`, async route => {
      await route.fulfill({
        status: 200,
        json: { message: 'Reset code sent to your email!' },
      });
    });

    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Reset code sent to your email!')).toBeVisible();
  });
});
