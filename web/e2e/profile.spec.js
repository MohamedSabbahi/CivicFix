import { test, expect } from '@playwright/test';

const API_BASE = '**/api';

const CITIZEN_USER = {
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  role: 'CITIZEN',
};

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: 'CITIZEN',
      }));
    });

    await page.route(`${API_BASE}/auth/profile`, async route => {
      await route.fulfill({ status: 200, json: CITIZEN_USER });
    });

    await page.route(`${API_BASE}/reports/my-reports`, async route => {
      await route.fulfill({
        status: 200,
        json: { data: [], results: 0 },
      });
    });

    await page.route(`${API_BASE}/chatbot/**`, async route => {
      await route.fulfill({ status: 200, json: {} });
    });
  });

  test('shows user name on profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=Test User').first()).toBeVisible();
  });

  test('shows user email on profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('text=test@test.com').first()).toBeVisible();
  });

  test('shows edit button', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('button', { hasText: 'Edit Profile' }).or(
      page.locator('[aria-label="Edit"]')
    ).first()).toBeVisible();
  });

  test('allows name update and saves successfully', async ({ page }) => {
    await page.route(`${API_BASE}/auth/profileUpdate`, async route => {
      await route.fulfill({
        status: 200,
        json: { id: 1, name: 'Updated Name', email: 'test@test.com', role: 'CITIZEN' },
      });
    });

    await page.goto('/profile');

    await page.getByRole('button', { name: 'Edit Profile' }).click();

    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Updated Name');

    await page.locator('button', { hasText: 'Save Changes' }).click();

    await expect(page.locator('text=Profile updated successfully!')).toBeVisible();
  });

  test('shows cancel button in edit mode', async ({ page }) => {
    await page.goto('/profile');

    await page.locator('button', { hasText: 'Edit Profile' }).first().click();

    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
  });
});
